import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { UniqueConstraintError } from 'sequelize';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { appConfig } from '../config/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, dateOfBirth } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      dateOfBirth?: string | null;
    };

    const errors: Record<string, string> = {};
    if (!firstName || !firstName.trim()) errors.firstName = 'Primeiro nome é obrigatório';
    if (!lastName || !lastName.trim()) errors.lastName = 'Sobrenome é obrigatório';
    if (!email || !email.trim()) errors.email = 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && email.trim() && !emailRegex.test(email.trim().toLowerCase())) errors.email = 'Email inválido';
    if (!password) errors.password = 'Senha é obrigatória';
    if (password && password.length < 8) errors.password = 'Senha deve ter no mínimo 8 caracteres';
    if (!confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória';
    if (password && confirmPassword && confirmPassword !== password) errors.confirmPassword = 'As senhas não conferem';
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Campos obrigatórios', errors });

    const normalizedEmail = email!.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ message: 'Email já cadastrado' });

    const passwordHash = await bcrypt.hash(password!, 10);
    let role: 'user' | 'admin' = 'user';
    const userCount = await User.count();
    if (userCount === 0) role = 'admin';
    if (appConfig.adminEmails.includes(normalizedEmail)) role = 'admin';

    const user = await User.create({
      firstName: firstName!.trim(),
      lastName: lastName!.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      dateOfBirth: dateOfBirth ?? null,
    });
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return res.status(201).json({ id: user.id, firstName: user.firstName, lastName: user.lastName, fullName, email: user.email, dateOfBirth: user.dateOfBirth, name: fullName });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }
    return res.status(500).json({ message: 'Erro ao registrar', error: (err as Error).message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const errors: Record<string, string> = {};
    if (!email || !email.trim()) errors.email = 'Email é obrigatório';
    if (!password) errors.password = 'Senha é obrigatória';
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Campos obrigatórios', errors });

    const normalizedEmail = email!.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(password!, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      appConfig.jwtSecret as Secret,
      { expiresIn: appConfig.jwtExpiresIn as SignOptions['expiresIn'] }
    );
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return res.json({ token, user: { id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, fullName, email: user.email, dateOfBirth: user.dateOfBirth, name: fullName } });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao autenticar', error: (err as Error).message });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(req.user!.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return res.json({ id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, fullName, email: user.email, dateOfBirth: user.dateOfBirth, name: fullName });
});

// Password reset
const RESET_TOKEN_TTL_MINUTES = 30;

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return res.status(200).json({ message: 'Se existir, enviaremos instruções para o e-mail' });

  try {
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

      await PasswordResetToken.create({ userId: user.id, tokenHash, expiresAt });

      // Em produção, envie o rawToken por e-mail. Em dev, retornamos para facilitar testes.
      if (appConfig.nodeEnv !== 'production') {
        return res.status(200).json({ message: 'Se existir, enviaremos instruções para o e-mail', devToken: rawToken });
      }
    }
    return res.status(200).json({ message: 'Se existir, enviaremos instruções para o e-mail' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao iniciar reset de senha', error: (err as Error).message });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };
  if (!token || !newPassword) return res.status(400).json({ message: 'Dados incompletos' });
  if (newPassword.length < 8) return res.status(400).json({ message: 'Senha deve ter no mínimo 8 caracteres' });

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();
    const record = await PasswordResetToken.findOne({ where: { tokenHash } });
    if (!record || (record.usedAt as any) || record.expiresAt < now) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    const user = await User.findByPk(record.userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    record.usedAt = now;
    await record.save();

    return res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao redefinir senha', error: (err as Error).message });
  }
});

export default router;
