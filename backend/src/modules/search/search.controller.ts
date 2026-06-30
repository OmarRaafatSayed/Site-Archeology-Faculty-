import { Request, Response } from 'express';
import { searchService } from './search.service';
import { searchQuerySchema } from './search.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class SearchController {
  /**
   * GET /api/search
   * محرك البحث المركزي — يبحث في كل المحتوى
   * Query: q (required) | type | lang | page | limit
   */
  search = asyncHandler(async (req: Request, res: Response) => {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await searchService.search(parsed.data));
  });
}

export const searchController = new SearchController();
