import { Request, Response } from 'express';
import { centersService } from './centers.service';
import { createCenterSchema, updateCenterSchema, listCentersQuerySchema } from './centers.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class CentersController {
  listCenters = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listCentersQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await centersService.listCenters(parsed.data));
  });

  getCenter = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await centersService.getCenterBySlug(req.params.slug));
  });

  getCenterById = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await centersService.getCenterById(req.params.id));
  });

  createCenter = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createCenterSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await centersService.createCenter(parsed.data), 'Center created');
  });

  updateCenter = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateCenterSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await centersService.updateCenter(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteCenter = asyncHandler(async (req: Request, res: Response) => {
    await centersService.deleteCenter(req.params.id);
    sendSuccess(res, null, 'Center deleted');
  });
}

export const centersController = new CentersController();
