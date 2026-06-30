import { Router } from 'express';
import { authController } from './auth.controller';
import { authLimiter } from '../../middleware/rateLimiter';
import { auth } from '../../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * تسجيل الدخول (مع rate limiting)
 */
router.post('/login', authLimiter, authController.login);

/**
 * POST /api/auth/logout
 * تسجيل الخروج
 */
router.post('/logout', authController.logout);

/**
 * POST /api/auth/refresh
 * تجديد Access Token
 */
router.post('/refresh', authController.refresh);

/**
 * POST /api/auth/forgot-password
 * طلب إعادة تعيين كلمة المرور (مع rate limiting)
 */
router.post('/forgot-password', authLimiter, authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * إعادة تعيين كلمة المرور (مع rate limiting)
 */
router.post('/reset-password', authLimiter, authController.resetPassword);

/**
 * GET /api/auth/me
 * الحصول على بيانات المستخدم الحالي (Protected)
 */
router.get('/me', auth, authController.getMe);

export default router;
