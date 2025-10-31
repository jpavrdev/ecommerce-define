import { Router } from 'express';
import auth from './auth.js';
import products from './products.js';
import brands from './brands.js';

const router = Router();

router.use('/auth', auth);
router.use('/products', products);
router.use('/brands', brands);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;
