import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct, getProductImage, featuredProducts } from '../controllers/ProductController.js';
import { listRatings, upsertRating } from '../controllers/RatingController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', listProducts);
router.get('/featured/list', featuredProducts);
router.get('/:id/image', getProductImage);
router.get('/:id', getProduct);
router.get('/:id/ratings', listRatings);
router.post('/:id/ratings', authMiddleware, upsertRating);
router.post('/', authMiddleware, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', authMiddleware, requireAdmin, updateProduct);
router.delete('/:id', authMiddleware, requireAdmin, deleteProduct);

export default router;
