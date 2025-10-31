import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { UniqueConstraintError } from 'sequelize';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { appConfig } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { EmailVerificationToken } from '../models/EmailVerificationToken.js';

export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password, confirmPassword, dateOfBirth } = req.body as {
      firstName?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string; dateOfBirth?: string | null;
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
      emailVerifiedAt: null,
    });
    // create verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await EmailVerificationToken.create({ userId: user.id, tokenHash, expiresAt });

    // TODO: enviar email real em produção (SMTP)
    if (appConfig.nodeEnv !== 'production') {
      console.log(`Verificação de e-mail (dev): token=${rawToken}`);
    }

    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const payload: any = { id: user.id, firstName: user.firstName, lastName: user.lastName, fullName, email: user.email, dateOfBirth: user.dateOfBirth, name: fullName };
    if (appConfig.nodeEnv !== 'production') payload.devVerifyToken = rawToken;
    return res.status(201).json(payload);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }
    return res.status(500).json({ message: 'Erro ao registrar', error: (err as Error).message });
  }
}

export async function login(req: Request, res: Response) {
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

    if (!user.emailVerifiedAt) {
      return res.status(403).json({ message: 'Confirme seu e-mail para acessar.' });
    }

    const jwtSecret: Secret = appConfig.jwtSecret as Secret;
    const signOptions: SignOptions = { expiresIn: appConfig.jwtExpiresIn } as SignOptions;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      signOptions
    );
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return res.json({ token, user: { id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, fullName, email: user.email, dateOfBirth: user.dateOfBirth, name: fullName } });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao autenticar', error: (err as Error).message });
  }
}

export async function me(req: AuthRequest, res: Response) {
  const user = await User.findByPk(req.user!.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return res.json({ id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, fullName, email: user.email, dateOfBirth: user.dateOfBirth, name: fullName });
}

const RESET_TOKEN_TTL_MINUTES = 30;

export async function forgotPassword(req: Request, res: Response) {
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
      if (appConfig.nodeEnv !== 'production') {
        return res.status(200).json({ message: 'Se existir, enviaremos instruções para o e-mail', devToken: rawToken });
      }
    }
    return res.status(200).json({ message: 'Se existir, enviaremos instruções para o e-mail' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao iniciar reset de senha', error: (err as Error).message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };
  if (!token || !newPassword) return res.status(400).json({ message: 'Dados incompletos' });
  if (newPassword.length < 8) return res.status(400).json({ message: 'Senha deve ter no mínimo 8 caracteres' });
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();
    const record = await PasswordResetToken.findOne({ where: { tokenHash } });
    if (!record || (record as any).usedAt || record.expiresAt < now) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }
    const user = await User.findByPk(record.userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();
    (record as any).usedAt = now;
    await record.save();
    return res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao redefinir senha', error: (err as Error).message });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ message: 'Token é obrigatório' });
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const rec = await EmailVerificationToken.findOne({ where: { tokenHash } });
  if (!rec || (rec as any).usedAt || rec.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Token inválido ou expirado' });
  }
  const user = await User.findByPk(rec.userId);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  (rec as any).usedAt = new Date();
  await rec.save();
  (user as any).emailVerifiedAt = new Date();
  await user.save();
  return res.json({ message: 'E-mail verificado com sucesso' });
}

export async function resendVerification(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ message: 'Email é obrigatório' });
  const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!user) return res.status(200).json({ message: 'Se existir, enviaremos um novo link' });
  if (user.emailVerifiedAt) return res.status(200).json({ message: 'E-mail já verificado' });
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await EmailVerificationToken.create({ userId: user.id, tokenHash, expiresAt });
  if (appConfig.nodeEnv !== 'production') {
    console.log(`Verificação de e-mail (dev - resend): token=${rawToken}`);
    return res.json({ message: 'Link reenviado (dev)', devToken: rawToken });
  }
  return res.json({ message: 'Link de verificação reenviado' });
}
