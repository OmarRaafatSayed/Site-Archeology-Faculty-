import { Request, Response } from 'express';
import { newsService } from './news.service';
import { createNewsSchema, updateNewsSchema, listNewsQuerySchema } from './news.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError, UnauthorizedError } from '../../shared/errors/AppError';

export class NewsController {
  listNews = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listNewsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await newsService.listNews(parsed.data));
  });

  getNews = asyncHandler(async (req: Request, res: Response) => {
    // Admin/CM يرى المسودات، الزوار يرون المنشور فقط
    const isPublicView = !req.user;
    sendSuccess(res, await newsService.getNewsById(req.params.id, isPublicView));
  });

  createNews = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const parsed = createNewsSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await newsService.createNews(parsed.data, req.user.userId), 'News article created');
  });

  updateNews = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const parsed = updateNewsSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await newsService.updateNews(req.params.id, parsed.data, req.user.userId, req.user.role), 'Updated successfully');
  });

  deleteNews = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await newsService.deleteNews(req.params.id, req.user.userId, req.user.role);
    sendSuccess(res, null, 'News article deleted');
  });

  publishNews = asyncHandler(async (req: Request, res: Response) => {
    await newsService.togglePublish(req.params.id, true);
    sendSuccess(res, null, 'News article published');
  });

  unpublishNews = asyncHandler(async (req: Request, res: Response) => {
    await newsService.togglePublish(req.params.id, false);
    sendSuccess(res, null, 'News article unpublished');
  });
}

export const newsController = new NewsController();
