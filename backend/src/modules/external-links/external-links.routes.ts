import { Router } from 'express';
import { externalLinksController } from './external-links.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

/** GET /api/external-links */
router.get('/', externalLinksController.listLinks);

/** GET /api/external-links/:id */
router.get('/:id', externalLinksController.getLink);

/** POST /api/external-links */
router.post('/', auth, authorize(CMS_ROLES), auditLog('external_links'), externalLinksController.createLink);

/** PUT /api/external-links/:id */
router.put('/:id', auth, authorize(CMS_ROLES), auditLog('external_links'), externalLinksController.updateLink);

/** DELETE /api/external-links/:id */
router.delete('/:id', auth, authorize(CMS_ROLES), auditLog('external_links'), externalLinksController.deleteLink);

export default router;
