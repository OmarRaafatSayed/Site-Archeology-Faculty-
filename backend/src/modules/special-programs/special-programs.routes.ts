import { Router } from 'express';
import { specialProgramsController } from './special-programs.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

/** GET /api/special-programs */
router.get('/', specialProgramsController.listPrograms);

/** GET /api/special-programs/slug/:slug */
router.get('/slug/:slug', specialProgramsController.getProgram);

/** GET /api/special-programs/:id */
router.get('/:id', specialProgramsController.getProgramById);

/** POST /api/special-programs */
router.post('/', auth, authorize(CMS_ROLES), auditLog('special_programs'), specialProgramsController.createProgram);

/** PUT /api/special-programs/:id */
router.put('/:id', auth, authorize(CMS_ROLES), auditLog('special_programs'), specialProgramsController.updateProgram);

/** DELETE /api/special-programs/:id */
router.delete('/:id', auth, authorize(CMS_ROLES), auditLog('special_programs'), specialProgramsController.deleteProgram);

export default router;
