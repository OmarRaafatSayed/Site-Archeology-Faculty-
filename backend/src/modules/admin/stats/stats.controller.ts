import { Request, Response } from 'express';
import { statsService, auditLogsQuerySchema } from './stats.service';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../../shared/utils/response';
import { ValidationError } from '../../../shared/errors/AppError';

export class StatsController {
  /** GET /api/admin/dashboard-stats */
  getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await statsService.getDashboardStats());
  });

  /** GET /api/admin/audit-logs */
  getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const parsed = auditLogsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await statsService.getAuditLogs(parsed.data));
  });
}

export const statsController = new StatsController();
