import { Request, Response } from 'express';
import fs from 'fs';
import { schedulesService } from './schedules.service';
import {
  createScheduleSchema,
  updateScheduleSchema,
  listSchedulesQuerySchema,
  createExamScheduleSchema,
  updateExamScheduleSchema,
  listExamSchedulesQuerySchema,
} from './schedules.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class SchedulesController {
  // ─── Class Schedules ─────────────────────────────────────────────────────

  listSchedules = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listSchedulesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await schedulesService.listSchedules(parsed.data));
  });

  createSchedule = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createScheduleSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await schedulesService.createSchedule(parsed.data), 'Schedule created');
  });

  updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateScheduleSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await schedulesService.updateSchedule(req.params.id, parsed.data), 'Schedule updated');
  });

  deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
    await schedulesService.deleteSchedule(req.params.id);
    sendSuccess(res, null, 'Schedule deleted');
  });

  /** POST /api/schedules/import — Validate Excel (Phase 1) */
  validateScheduleImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');
    const buffer = fs.readFileSync(req.file.path);
    const report = await schedulesService.validateScheduleExcel(buffer);
    fs.unlinkSync(req.file.path);
    sendSuccess(res, report, 'Validation completed');
  });

  /** POST /api/schedules/import/confirm — Confirm Import (Phase 2) */
  confirmScheduleImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');
    const buffer = fs.readFileSync(req.file.path);
    const result = await schedulesService.importScheduleFromExcel(buffer);
    fs.unlinkSync(req.file.path);
    sendSuccess(res, result, `Imported ${result.imported} schedule entries`);
  });

  // ─── Exam Schedules ───────────────────────────────────────────────────────

  listExamSchedules = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listExamSchedulesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await schedulesService.listExamSchedules(parsed.data));
  });

  createExamSchedule = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createExamScheduleSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await schedulesService.createExamSchedule(parsed.data), 'Exam schedule created');
  });

  updateExamSchedule = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateExamScheduleSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await schedulesService.updateExamSchedule(req.params.id, parsed.data), 'Exam schedule updated');
  });

  deleteExamSchedule = asyncHandler(async (req: Request, res: Response) => {
    await schedulesService.deleteExamSchedule(req.params.id);
    sendSuccess(res, null, 'Exam schedule deleted');
  });

  /** POST /api/exam-schedules/import — Validate (Phase 1) */
  validateExamImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');
    const buffer = fs.readFileSync(req.file.path);
    const report = await schedulesService.validateExamExcel(buffer);
    fs.unlinkSync(req.file.path);
    sendSuccess(res, report, 'Validation completed');
  });

  /** POST /api/exam-schedules/import/confirm — Confirm (Phase 2) */
  confirmExamImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');
    const buffer = fs.readFileSync(req.file.path);
    const result = await schedulesService.importExamFromExcel(buffer);
    fs.unlinkSync(req.file.path);
    sendSuccess(res, result, `Imported ${result.imported} exam entries`);
  });
}

export const schedulesController = new SchedulesController();
