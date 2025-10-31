import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { appConfig } from '../config/appConfig.js';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role?: 'user' | 'admin' };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

  const [, token] = authHeader.split(' ');
  if (!token) return res.status(401).json({ message: 'Token inválido' });

  try {
    const payload = jwt.verify(token, appConfig.jwtSecret as Secret) as { id: number; email: string; role?: 'user' | 'admin' };
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso restrito a administradores' });
  return next();
}
