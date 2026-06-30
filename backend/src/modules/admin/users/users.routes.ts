import { Router } from 'express';
import { usersController } from './users.controller';
import { auth } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

// كل routes هنا محمية بـ auth + admin only
router.use(auth, authorize([UserRole.admin]));

/**
 * GET /api/admin/users
 * قائمة المستخدمين (pagination + فلترة بالـ role / isActive / search)
 *
 * Query params:
 *   page     - رقم الصفحة (default: 1)
 *   limit    - عدد النتائج (default: 20, max: 100)
 *   role     - فلترة بالـ role (student / faculty / content_manager / admin)
 *   isActive - فلترة (true / false)
 *   search   - بحث في email / username / universityId
 */
router.get('/', usersController.listUsers);

/**
 * GET /api/admin/users/:id
 * بيانات مستخدم واحد
 */
router.get('/:id', usersController.getUser);

/**
 * POST /api/admin/users
 * إنشاء مستخدم جديد
 *
 * Body: { email, password, role, universityId?, username? }
 */
router.post('/', usersController.createUser);

/**
 * PUT /api/admin/users/:id
 * تحديث بيانات مستخدم
 *
 * Body: { email?, role?, isActive?, universityId?, username?, newPassword? }
 */
router.put('/:id', usersController.updateUser);

/**
 * DELETE /api/admin/users/:id
 * تعطيل مستخدم (soft delete — isActive = false)
 */
router.delete('/:id', usersController.deleteUser);

export default router;
