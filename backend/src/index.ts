import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { appConfig } from './config/database.js';
import routes from './routes/index.js';
import { connectDB, sequelize } from './models/index.js';

dotenv.config();

async function bootstrap() {
  const app = express();
  app.use(cors({ origin: '*', credentials: false }));
  app.use(express.json());

  app.use('/api', routes);

  try {
    await connectDB();
    const alter = process.env.DB_SYNC_ALTER === 'true' || appConfig.nodeEnv !== 'production';
    await sequelize.sync({ alter });
    if (alter) {
      console.log('Sequelize sync with alter=true (dev): schema atualizado.');
    }
    app.listen(appConfig.port, () => {
      console.log(`API rodando em http://localhost:${appConfig.port}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

bootstrap();
