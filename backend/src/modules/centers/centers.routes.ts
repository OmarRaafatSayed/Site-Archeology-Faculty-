import { Router } from 'express';
import { centersController } from './centers.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

/** GET /api/centers */
router.get('/', centersController.listCenters);

/** GET /api/centers/slug/:slug */
router.get('/slug/:slug', centersController.getCenter);

/** GET /api/centers/:id */
router.get('/:id', centersController.getCenterById);

/** POST /api/centers */
router.post('/', auth, authorize(CMS_ROLES), auditLog('research_centers'), centersController.createCenter);

/** PUT /api/centers/:id */
router.put('/:id', auth, authorize(CMS_ROLES), auditLog('research_centers'), centersController.updateCenter);

/** DELETE /api/centers/:id */
router.delete('/:id', auth, authorize(CMS_ROLES), auditLog('research_centers'), centersController.deleteCenter);

export default router;
