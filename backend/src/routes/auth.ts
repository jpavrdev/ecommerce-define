import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { forgotPassword, login, me, register, resetPassword, verifyEmail, resendVerification } from '../controllers/UserController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;
