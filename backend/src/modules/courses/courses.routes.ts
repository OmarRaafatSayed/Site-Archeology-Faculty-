import { Router } from 'express';
import { coursesController } from './courses.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();

/** GET /api/courses — عام، فلترة بالقسم / البرنامج / الفصل / السنة / البحث */
router.get('/', coursesController.listCourses);

/** GET /api/courses/:id — تفاصيل مقرر مع المواد والمتطلب السابق */
router.get('/:id', coursesController.getCourse);

/** POST /api/courses — Admin */
router.post('/', auth, authorize([UserRole.admin]), auditLog('course'), coursesController.createCourse);

/** PUT /api/courses/:id — Admin */
router.put('/:id', auth, authorize([UserRole.admin]), auditLog('course'), coursesController.updateCourse);

/** DELETE /api/courses/:id — Admin (soft) */
router.delete('/:id', auth, authorize([UserRole.admin]), auditLog('course'), coursesController.deleteCourse);

export default router;
