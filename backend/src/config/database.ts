import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'ecommerce',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'changeme',
};

export { appConfig } from './appConfig.js';

