import { Request, Response } from 'express';
import { programsService } from './programs.service';
import { createProgramSchema, updateProgramSchema, listProgramsQuerySchema } from './programs.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class ProgramsController {
  listPrograms = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listProgramsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await programsService.listPrograms(parsed.data));
  });

  getProgram = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await programsService.getProgramById(req.params.id));
  });

  createProgram = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createProgramSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await programsService.createProgram(parsed.data), 'Program created successfully');
  });

  updateProgram = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateProgramSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await programsService.updateProgram(req.params.id, parsed.data), 'Program updated');
  });

  deleteProgram = asyncHandler(async (req: Request, res: Response) => {
    await programsService.deleteProgram(req.params.id);
    sendSuccess(res, null, 'Program deactivated successfully');
  });
}

export const programsController = new ProgramsController();
