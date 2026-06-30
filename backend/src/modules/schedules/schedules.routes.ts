import { Router } from 'express';
import { schedulesController } from './schedules.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { uploadExcel } from '../../middleware/upload';
import { UserRole } from '@prisma/client';

// ─── Class Schedules Router ────────────────────────────────────────────────────
export const schedulesRouter = Router();

/**
 * GET /api/schedules
 * جدول دراسي مصفى — عام
 * Query: departmentId | departmentSlug | academicYear (1-4) | semester | year ("2024-2025") | facultyId
 */
schedulesRouter.get('/', schedulesController.listSchedules);

/**
 * POST /api/schedules/import
 * Phase 1 — validate Excel الجدول وإرجاع تقرير
 */
schedulesRouter.post(
  '/import',
  auth,
  authorize([UserRole.admin, UserRole.content_manager]),
  uploadExcel.single('file'),
  schedulesController.validateScheduleImport,
);

/**
 * POST /api/schedules/import/confirm
 * Phase 2 — تنفيذ استيراد الجدول بعد الموافقة
 */
schedulesRouter.post(
  '/import/confirm',
  auth,
  authorize([UserRole.admin, UserRole.content_manager]),
  auditLog('schedule'),
  uploadExcel.single('file'),
  schedulesController.confirmScheduleImport,
);

/** POST /api/schedules — Admin */
schedulesRouter.post(
  '/',
  auth,
  authorize([UserRole.admin, UserRole.content_manager]),
  auditLog('schedule'),
  schedulesController.createSchedule,
);

/** PUT /api/schedules/:id — Admin */
schedulesRouter.put(
  '/:id',
  auth,
  authorize([UserRole.admin, UserRole.content_manager]),
  auditLog('schedule'),
  schedulesController.updateSchedule,
);

/** DELETE /api/schedules/:id — Admin */
schedulesRouter.delete(
  '/:id',
  auth,
  authorize([UserRole.admin]),
  auditLog('schedule'),
  schedulesController.deleteSchedule,
);

// ─── Exam Schedules Router ─────────────────────────────────────────────────────
export const examSchedulesRouter = Router();

/**
 * GET /api/exam-schedules
 * جدول امتحانات مصفى — عام
 * Query: departmentId | departmentSlug | academicYear | semester | year | upcoming | fromDate
 */
examSchedulesRouter.get('/', schedulesController.listExamSchedules);

/**
 * POST /api/exam-schedules/import
 * Phase 1 — validate Excel جدول الامتحانات
 */
examSchedulesRouter.post(
  '/import',
  auth,
  authorize([UserRole.admin, UserRole.content_manager]),
  uploadExcel.single('file'),
  schedulesController.validateExamImport,
);

/**
 * POST /api/exam-schedules/import/confirm
 * Phase 2 — تنفيذ استيراد جدول الامتحانات
 */
examSchedulesRouter.post(
  '/import/confirm',
  auth,
  authorize([UserRole.admin, UserRole.content_manager]),
  auditLog('exam_schedule'),
  uploadExcel.single('file'),
  schedulesController.confirmExamImport,
);

/** POST /api/exam-schedules — Admin */
examSchedulesRouter.post(
  '/',
  auth,
  authorize([UserRole.admin, UserRole.content_manager]),
  auditLog('exam_schedule'),
  schedulesController.createExamSchedule,
);

/** PUT /api/exam-schedules/:id — Admin */
examSchedulesRouter.put(
  '/:id',
  auth,
  authorize([UserRole.admin, UserRole.content_manager]),
  auditLog('exam_schedule'),
  schedulesController.updateExamSchedule,
);

/** DELETE /api/exam-schedules/:id — Admin */
examSchedulesRouter.delete(
  '/:id',
  auth,
  authorize([UserRole.admin]),
  auditLog('exam_schedule'),
  schedulesController.deleteExamSchedule,
);
