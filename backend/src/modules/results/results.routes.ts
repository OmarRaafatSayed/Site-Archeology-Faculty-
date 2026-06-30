import { Router } from 'express';
import { resultsController } from './results.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { uploadExcel } from '../../middleware/upload';
import { UserRole } from '@prisma/client';

const router = Router();

// ─── Admin-only — كل النتائج محمية ───────────────────────────────────────────
router.use(auth, authorize([UserRole.admin]));

/**
 * GET /api/results
 * قائمة النتائج مع pagination + فلترة
 * Query: studentId | courseId | academicYear | semester | isPublished | departmentId
 */
router.get('/', resultsController.listResults);

/**
 * POST /api/results/import
 * Phase 1 — رفع Excel وإرجاع Validation Report
 * ⚠️ هذا Route قبل /:id عشان ما يتعارضش
 */
router.post('/import', uploadExcel.single('file'), resultsController.validateImport);

/**
 * POST /api/results/import/confirm
 * Phase 2 — تنفيذ الاستيراد بعد الموافقة
 * النتائج تُنشأ بـ is_published=false
 */
router.post(
  '/import/confirm',
  auditLog('result'),
  uploadExcel.single('file'),
  resultsController.confirmImport,
);

/**
 * PUT /api/results/publish-batch
 * نشر نتائج فصل دراسي كامل / قسم / مجموعة مقررات
 * Body: { academicYear, semester, courseIds?, departmentId? }
 */
router.put('/publish-batch', auditLog('result'), resultsController.publishBatch);

/**
 * PUT /api/results/unpublish-batch
 * سحب نشر نتائج (للمراجعة والتعديل)
 */
router.put('/unpublish-batch', auditLog('result'), resultsController.unpublishBatch);

/**
 * PUT /api/results/:id/publish
 * نشر نتيجة واحدة بالـ ID
 */
router.put('/:id/publish', auditLog('result'), resultsController.publishResult);

export default router;
