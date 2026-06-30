import { Router } from 'express';
import { agreementsController } from './agreements.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

/** GET /api/agreements */
router.get('/', agreementsController.listAgreements);

/** GET /api/agreements/:id */
router.get('/:id', agreementsController.getAgreement);

/** POST /api/agreements */
router.post('/', auth, authorize(CMS_ROLES), auditLog('international_agreements'), agreementsController.createAgreement);

/** PUT /api/agreements/:id */
router.put('/:id', auth, authorize(CMS_ROLES), auditLog('international_agreements'), agreementsController.updateAgreement);

/** DELETE /api/agreements/:id */
router.delete('/:id', auth, authorize(CMS_ROLES), auditLog('international_agreements'), agreementsController.deleteAgreement);

export default router;
