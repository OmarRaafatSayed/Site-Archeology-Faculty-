import { Request, Response } from 'express';
import { specialProgramsService } from './special-programs.service';
import { createProgramSchema, updateProgramSchema, listProgramsQuerySchema } from './special-programs.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class SpecialProgramsController {
  listPrograms = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listProgramsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await specialProgramsService.listPrograms(parsed.data));
  });

  getProgram = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await specialProgramsService.getProgramBySlug(req.params.slug));
  });

  getProgramById = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await specialProgramsService.getProgramById(req.params.id));
  });

  createProgram = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createProgramSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await specialProgramsService.createProgram(parsed.data), 'Program created');
  });

  updateProgram = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateProgramSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await specialProgramsService.updateProgram(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteProgram = asyncHandler(async (req: Request, res: Response) => {
    await specialProgramsService.deleteProgram(req.params.id);
    sendSuccess(res, null, 'Program deleted');
  });
}

export const specialProgramsController = new SpecialProgramsController();
