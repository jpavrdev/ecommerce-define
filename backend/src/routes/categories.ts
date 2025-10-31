import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { createCategory, deleteCategory, getCategory, listCategories, updateCategory, childrenWithCount } from '../controllers/CategoryController.js';

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.get('/:id/children-with-count', childrenWithCount);
router.post('/', authMiddleware, requireAdmin, createCategory);
router.put('/:id', authMiddleware, requireAdmin, updateCategory);
router.delete('/:id', authMiddleware, requireAdmin, deleteCategory);

export default router;
