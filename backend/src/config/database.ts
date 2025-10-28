import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'ecommerce',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'changeme',
};

interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string | number;
  nodeEnv: string;
}

const parsedExpires: string | number = (() => {
  const raw = process.env.JWT_EXPIRES_IN;
  if (!raw || raw.trim() === '') return '1h';
  const num = Number(raw);
  return Number.isFinite(num) ? num : raw; // aceita número (segundos) ou string ex.: '1h'
})();

export const appConfig: AppConfig = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  jwtExpiresIn: parsedExpires,
  nodeEnv: process.env.NODE_ENV || 'development',
};
