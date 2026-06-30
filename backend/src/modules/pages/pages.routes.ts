import { Router } from 'express';
import { pagesController } from './pages.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();

/** GET /api/pages — قائمة الصفحات (Admin فقط) */
router.get('/', auth, authorize([UserRole.admin]), pagesController.listPages);

/** GET /api/pages/:slug — عام */
router.get('/:slug', pagesController.getPage);

/** PUT /api/pages/:slug — Admin */
router.put(
  '/:slug',
  auth,
  authorize([UserRole.admin]),
  auditLog('page'),
  pagesController.updatePage,
);

export default router;
