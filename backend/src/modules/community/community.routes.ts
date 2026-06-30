import { Router } from 'express';
import { communityController } from './community.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

/** GET /api/community */
router.get('/', communityController.listProjects);

/** GET /api/community/:id */
router.get('/:id', communityController.getProject);

/** POST /api/community */
router.post('/', auth, authorize(CMS_ROLES), auditLog('community_projects'), communityController.createProject);

/** PUT /api/community/:id */
router.put('/:id', auth, authorize(CMS_ROLES), auditLog('community_projects'), communityController.updateProject);

/** DELETE /api/community/:id */
router.delete('/:id', auth, authorize(CMS_ROLES), auditLog('community_projects'), communityController.deleteProject);

/** PUT /api/community/:id/publish */
router.put('/:id/publish', auth, authorize(CMS_ROLES), auditLog('community_projects'), communityController.publishProject);

/** PUT /api/community/:id/unpublish */
router.put('/:id/unpublish', auth, authorize(CMS_ROLES), auditLog('community_projects'), communityController.unpublishProject);

export default router;
