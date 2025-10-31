import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'ecommerce',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Peedriinho259!',
};

export { appConfig } from './appConfig.js';

