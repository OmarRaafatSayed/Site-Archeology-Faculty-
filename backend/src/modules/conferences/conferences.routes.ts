import { Router } from 'express';
import { conferencesController } from './conferences.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { conferenceLimiter } from '../../middleware/rateLimiter';
import { UserRole } from '@prisma/client';

const router = Router();

const ADMIN_CM = [UserRole.admin, UserRole.content_manager];

// ─── Public ───────────────────────────────────────────────────────────────────

/** GET /api/conferences — قائمة المؤتمرات مع filter status */
router.get('/', conferencesController.listConferences);

/** GET /api/conferences/:slug — تفاصيل مؤتمر */
router.get('/:slug', conferencesController.getConference);

/**
 * POST /api/conferences/:id/register — تسجيل عام
 * محمي بـ rate limiter (5 req / ساعة من نفس الـ IP)
 */
router.post(
  '/:id/register',
  conferenceLimiter,
  auditLog('conference_registration'),
  conferencesController.register,
);

// ─── Admin / Content Manager ──────────────────────────────────────────────────

/** POST /api/conferences — إنشاء مؤتمر + توليد الصفحات تلقائياً */
router.post(
  '/',
  auth,
  authorize([UserRole.admin]),
  auditLog('conference'),
  conferencesController.createConference,
);

/** PUT /api/conferences/:id — تعديل مؤتمر */
router.put(
  '/:id',
  auth,
  authorize(ADMIN_CM),
  auditLog('conference'),
  conferencesController.updateConference,
);

/**
 * GET /api/conferences/:id/registrations — قائمة المسجلين
 * ⚠️ يجب أن يكون قبل /:slug إن استخدمنا نفس الـ router
 */
router.get(
  '/:id/registrations',
  auth,
  authorize(ADMIN_CM),
  conferencesController.listRegistrations,
);

/**
 * PUT /api/conferences/:id/registrations/:regId — تحديث حالة تسجيل
 * عند الـ confirm → يُرسَل بريد القبول تلقائياً
 */
router.put(
  '/:id/registrations/:regId',
  auth,
  authorize(ADMIN_CM),
  auditLog('conference_registration'),
  conferencesController.updateRegistration,
);

export default router;
