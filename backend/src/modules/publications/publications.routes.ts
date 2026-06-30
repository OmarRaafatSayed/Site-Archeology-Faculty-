import { Router } from 'express';
import { publicationsController } from './publications.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { uploadPublication } from '../../middleware/upload';
import { UserRole } from '@prisma/client';

const router = Router();

const WRITE_ROLES = [UserRole.admin, UserRole.faculty];

/** GET /api/publications — عام */
router.get('/', publicationsController.listPublications);

/** GET /api/publications/:id — عام */
router.get('/:id', publicationsController.getPublication);

/** POST /api/publications — Faculty / Admin */
router.post('/', auth, authorize(WRITE_ROLES), auditLog('publication'), publicationsController.createPublication);

/** PUT /api/publications/:id — Faculty (صاحبه) / Admin */
router.put('/:id', auth, authorize(WRITE_ROLES), auditLog('publication'), publicationsController.updatePublication);

/** DELETE /api/publications/:id — Faculty (صاحبه) / Admin */
router.delete('/:id', auth, authorize(WRITE_ROLES), auditLog('publication'), publicationsController.deletePublication);

export default router;
