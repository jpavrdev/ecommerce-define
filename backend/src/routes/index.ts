import { Router } from 'express';
import auth from './auth.js';
import products from './products.js';
import brands from './brands.js';
import categories from './categories.js';
import { sequelize } from '../models/index.js';

const router = Router();

router.use('/auth', auth);
router.use('/products', products);
router.use('/brands', brands);
router.use('/categories', categories);

router.get('/health', async (_req, res) => {
  const startedAt = Date.now();
  try {
    await sequelize.authenticate();
    const elapsedMs = Date.now() - startedAt;
    res.json({ status: 'ok', db: 'up', elapsedMs });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'down', error: (err as Error).message });
  }
});

export default router;
