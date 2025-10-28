import { Router } from 'express';
import auth from './auth.js';

const router = Router();

router.use('/auth', auth);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;

