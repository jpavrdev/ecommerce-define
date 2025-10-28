import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../models/User.js';
import { appConfig } from '../config/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { UniqueConstraintError } from 'sequelize';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!name || !email || !password) return res.status(400).json({ message: 'Dados incompletos' });
    if (password.length < 8) return res.status(400).json({ message: 'Senha deve ter no mínimo 8 caracteres' });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ message: 'Email já cadastrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }
    return res.status(500).json({ message: 'Erro ao registrar', error: (err as Error).message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: 'Dados incompletos' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      appConfig.jwtSecret as Secret,
      { expiresIn: appConfig.jwtExpiresIn as SignOptions['expiresIn'] }
    );
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao autenticar', error: (err as Error).message });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(req.user!.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  return res.json({ id: user.id, name: user.name, email: user.email });
});

export default router;

