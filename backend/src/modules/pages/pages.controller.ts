import { Request, Response } from 'express';
import { pagesService } from './pages.service';
import { updatePageSchema } from './pages.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { ValidationError, UnauthorizedError } from '../../shared/errors/AppError';

export class PagesController {
  /** GET /api/pages — قائمة الصفحات للـ Admin */
  listPages = asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await pagesService.listPages());
  });

  /** GET /api/pages/:slug — عام */
  getPage = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await pagesService.getPage(req.params.slug));
  });

  /** PUT /api/pages/:slug — Admin */
  updatePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const parsed = updatePageSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await pagesService.updatePage(req.params.slug, parsed.data, req.user.userId), 'Page updated');
  });
}

export const pagesController = new PagesController();
