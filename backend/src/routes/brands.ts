import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { createBrand, deleteBrand, getBrand, listBrands, updateBrand } from '../controllers/BrandController.js';

const router = Router();

router.get('/', listBrands);
router.get('/:id', getBrand);
router.post('/', authMiddleware, requireAdmin, createBrand);
router.put('/:id', authMiddleware, requireAdmin, updateBrand);
router.delete('/:id', authMiddleware, requireAdmin, deleteBrand);

export default router;

