import { Router } from 'express';
import { statsController } from './stats.controller';
import { auth } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(auth, authorize([UserRole.admin]));

/** GET /api/admin/dashboard-stats */
router.get('/dashboard-stats', statsController.getDashboardStats);

/** GET /api/admin/audit-logs */
router.get('/audit-logs', statsController.getAuditLogs);

export default router;
