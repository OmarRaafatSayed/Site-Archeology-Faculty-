import { Router } from 'express';
import { programsController } from './programs.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();

/** GET /api/programs — عام (مع فلترة بالقسم / المستوى) */
router.get('/', programsController.listPrograms);

/** GET /api/programs/:id — تفاصيل برنامج مع مقرراته */
router.get('/:id', programsController.getProgram);

/** POST /api/programs — Admin */
router.post('/', auth, authorize([UserRole.admin]), auditLog('program'), programsController.createProgram);

/** PUT /api/programs/:id — Admin */
router.put('/:id', auth, authorize([UserRole.admin]), auditLog('program'), programsController.updateProgram);

/** DELETE /api/programs/:id — Admin (soft) */
router.delete('/:id', auth, authorize([UserRole.admin]), auditLog('program'), programsController.deleteProgram);

export default router;
