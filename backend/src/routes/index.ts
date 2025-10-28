import { Router } from 'express';
import auth from './auth.js';
import products from './products.js';

const router = Router();

router.use('/auth', auth);
router.use('/products', products);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;
