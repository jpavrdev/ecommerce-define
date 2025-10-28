import { Sequelize } from 'sequelize';
import { dbConfig } from '../config/database.js';

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: false,
  }
);

export async function connectDB() {
  await sequelize.authenticate();
}

