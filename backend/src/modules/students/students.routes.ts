import { Router } from 'express';
import { studentsController } from './students.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { uploadExcel } from '../../middleware/upload';
import { UserRole } from '@prisma/client';

const router = Router();

// ─── Student Protected Routes ─────────────────────────────────────────────────

/**
 * GET /api/students/me
 * بيانات الطالب الحالي
 */
router.get(
  '/me',
  auth,
  authorize([UserRole.student]),
  studentsController.getMyProfile,
);

/**
 * PUT /api/students/me
 * الطالب يعدل بياناته المسموح بها فقط
 */
router.put(
  '/me',
  auth,
  authorize([UserRole.student]),
  auditLog('student'),
  studentsController.updateMyProfile,
);

/**
 * GET /api/students/me/results
 * نتائج الطالب الحالي (المنشورة فقط)
 */
router.get(
  '/me/results',
  auth,
  authorize([UserRole.student]),
  studentsController.getMyResults,
);

/**
 * GET /api/students/me/schedule
 * جدول الطالب الدراسي الأسبوعي
 */
router.get(
  '/me/schedule',
  auth,
  authorize([UserRole.student]),
  studentsController.getMySchedule,
);

/**
 * GET /api/students/me/exams
 * جدول الامتحانات القادمة للطالب
 */
router.get(
  '/me/exams',
  auth,
  authorize([UserRole.student]),
  studentsController.getMyExams,
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

/**
 * GET /api/students
 * قائمة الطلاب — Admin فقط
 * Query: page, limit, departmentId, academicYear, status, search
 */
router.get(
  '/',
  auth,
  authorize([UserRole.admin]),
  studentsController.listStudents,
);

/**
 * POST /api/students/import
 * المرحلة 1 — رفع Excel والحصول على Validation Report
 * يُرجع تقرير الأخطاء بدون حفظ
 */
router.post(
  '/import',
  auth,
  authorize([UserRole.admin]),
  uploadExcel.single('file'),
  studentsController.validateImport,
);

/**
 * POST /api/students/import/confirm
 * المرحلة 2 — تنفيذ الاستيراد بعد مراجعة التقرير
 */
router.post(
  '/import/confirm',
  auth,
  authorize([UserRole.admin]),
  auditLog('student'),
  uploadExcel.single('file'),
  studentsController.confirmImport,
);

export default router;
