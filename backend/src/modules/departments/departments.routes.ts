import { Router } from 'express';
import { departmentsController } from './departments.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * GET /api/departments
 * قائمة الأقسام مع faculty_count — عامة بدون مصادقة
 */
router.get('/', departmentsController.listDepartments);

/**
 * GET /api/departments/:slug
 * تفاصيل قسم
 */
router.get('/:slug', departmentsController.getDepartment);

/**
 * GET /api/departments/:slug/faculty
 * أعضاء التدريس في القسم
 */
router.get('/:slug/faculty', departmentsController.getDepartmentFaculty);

/**
 * GET /api/departments/:slug/programs
 * البرامج الدراسية في القسم
 */
router.get('/:slug/programs', departmentsController.getDepartmentPrograms);

/**
 * PUT /api/departments/:id
 * تعديل بيانات قسم — Admin فقط
 */
router.put(
  '/:id',
  auth,
  authorize([UserRole.admin]),
  auditLog('department'),
  departmentsController.updateDepartment,
);

export default router;
