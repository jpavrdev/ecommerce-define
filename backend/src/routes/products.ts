import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../controllers/ProductController.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', authMiddleware, requireAdmin, createProduct);
router.put('/:id', authMiddleware, requireAdmin, updateProduct);
router.delete('/:id', authMiddleware, requireAdmin, deleteProduct);

export default router;
