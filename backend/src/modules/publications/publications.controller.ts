import { Request, Response } from 'express';
import { publicationsService } from './publications.service';
import {
  createPublicationSchema,
  updatePublicationSchema,
  listPublicationsQuerySchema,
} from './publications.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError, UnauthorizedError } from '../../shared/errors/AppError';

export class PublicationsController {
  listPublications = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listPublicationsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await publicationsService.listPublications(parsed.data));
  });

  getPublication = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await publicationsService.getPublicationById(req.params.id));
  });

  createPublication = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const parsed = createPublicationSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);

    // Admin يمكنه تحديد facultyId في الـ body
    const targetFacultyId = req.body.facultyId as string | undefined;

    sendCreated(
      res,
      await publicationsService.createPublication(parsed.data, req.user.userId, req.user.role, targetFacultyId),
      'Publication created',
    );
  });

  updatePublication = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const parsed = updatePublicationSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(
      res,
      await publicationsService.updatePublication(req.params.id, parsed.data, req.user.userId, req.user.role),
      'Publication updated',
    );
  });

  deletePublication = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await publicationsService.deletePublication(req.params.id, req.user.userId, req.user.role);
    sendSuccess(res, null, 'Publication deleted');
  });
}

export const publicationsController = new PublicationsController();
