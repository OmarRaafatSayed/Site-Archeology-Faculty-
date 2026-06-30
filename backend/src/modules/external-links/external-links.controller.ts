import { Request, Response } from 'express';
import { externalLinksService } from './external-links.service';
import { createLinkSchema, updateLinkSchema, listLinksQuerySchema } from './external-links.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class ExternalLinksController {
  listLinks = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listLinksQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await externalLinksService.listLinks(parsed.data));
  });

  getLink = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await externalLinksService.getLinkById(req.params.id));
  });

  createLink = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createLinkSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await externalLinksService.createLink(parsed.data), 'Link created');
  });

  updateLink = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateLinkSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await externalLinksService.updateLink(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteLink = asyncHandler(async (req: Request, res: Response) => {
    await externalLinksService.deleteLink(req.params.id);
    sendSuccess(res, null, 'Link deleted');
  });
}

export const externalLinksController = new ExternalLinksController();
