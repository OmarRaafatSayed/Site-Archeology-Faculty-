import { Router } from 'express';
import { facultyController } from './faculty.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { uploadPhoto } from '../../middleware/upload';
import { UserRole } from '@prisma/client';

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * GET /api/faculty
 * قائمة أعضاء التدريس — عامة
 * Query: page, limit, departmentId, degree, search
 */
router.get('/', facultyController.listFaculty);

/**
 * GET /api/faculty/:id
 * تفاصيل عضو — عامة
 */
router.get('/:id', facultyController.getFaculty);

/**
 * GET /api/faculty/:id/publications
 * أبحاث عضو — عامة
 */
router.get('/:id/publications', facultyController.getFacultyPublications);

// ─── Faculty-only routes ──────────────────────────────────────────────────────

/**
 * PUT /api/faculty/me
 * المحاضر يعدل بياناته الشخصية (bio + specialization + email)
 * ⚠️ هذا الـ route قبل /:id عشان ما يُفسَّرش كـ ID
 */
router.put(
  '/me',
  auth,
  authorize([UserRole.faculty, UserRole.admin]),
  auditLog('faculty'),
  facultyController.updateMyProfile,
);

// ─── Admin-only routes ────────────────────────────────────────────────────────

/**
 * POST /api/faculty
 * إضافة عضو تدريس جديد
 */
router.post(
  '/',
  auth,
  authorize([UserRole.admin]),
  auditLog('faculty'),
  facultyController.createFaculty,
);

/**
 * PUT /api/faculty/:id
 * تعديل بيانات عضو — Admin
 */
router.put(
  '/:id',
  auth,
  authorize([UserRole.admin]),
  auditLog('faculty'),
  facultyController.updateFaculty,
);

/**
 * DELETE /api/faculty/:id
 * تعطيل عضو (soft delete) — Admin
 */
router.delete(
  '/:id',
  auth,
  authorize([UserRole.admin]),
  auditLog('faculty'),
  facultyController.deleteFaculty,
);

/**
 * PUT /api/faculty/:id/photo
 * رفع/تغيير صورة عضو — Admin أو صاحب الصورة
 */
router.put(
  '/:id/photo',
  auth,
  authorize([UserRole.faculty, UserRole.admin]),
  uploadPhoto.single('photo'),
  facultyController.updatePhoto,
);

export default router;
