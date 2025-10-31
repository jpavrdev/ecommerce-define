import 'dotenv/config';
import type { SignOptions } from 'jsonwebtoken';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} ausente`);
  return v;
}

type ExpiresIn = SignOptions['expiresIn'];

function parseExpires(): ExpiresIn {
  const raw = process.env.JWT_EXPIRES_IN;
  if (!raw || raw.trim() === '') return '1h' as ExpiresIn;
  const n = Number(raw);
  return Number.isFinite(n) ? (n as ExpiresIn) : (raw as ExpiresIn);
}

export const appConfig = {
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: parseExpires(),
} satisfies { jwtSecret: string; jwtExpiresIn: ExpiresIn };
