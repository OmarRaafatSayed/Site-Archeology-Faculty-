import { Request, Response } from 'express';
import fs from 'fs';
import { resultsService } from './results.service';
import { listResultsQuerySchema, publishBatchSchema } from './results.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class ResultsController {
  /**
   * GET /api/results (Admin)
   * قائمة النتائج مع pagination + فلترة
   */
  listResults = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listResultsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await resultsService.listResults(parsed.data));
  });

  /**
   * POST /api/results/import (Admin)
   * Phase 1 — رفع Excel وإرجاع Validation Report كامل
   * يُرجع: إحصائيات + أخطاء + preview + toCreate + toUpdate
   */
  validateImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');
    const buffer = fs.readFileSync(req.file.path);
    const report = await resultsService.validateResultsExcel(buffer);
    fs.unlinkSync(req.file.path);
    sendSuccess(res, report, 'Validation completed');
  });

  /**
   * POST /api/results/import/confirm (Admin)
   * Phase 2 — تنفيذ الاستيراد بعد مراجعة التقرير
   * النتائج تبقى is_published=false حتى يُنشر يدوياً
   */
  confirmImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');
    const buffer = fs.readFileSync(req.file.path);
    const result = await resultsService.importResultsFromExcel(buffer);
    fs.unlinkSync(req.file.path);
    sendSuccess(res, result, `Import complete: ${result.imported} created, ${result.updated} updated`);
  });

  /**
   * PUT /api/results/:id/publish (Admin)
   * نشر نتيجة واحدة
   */
  publishResult = asyncHandler(async (req: Request, res: Response) => {
    await resultsService.publishResult(req.params.id);
    sendSuccess(res, null, 'Result published successfully');
  });

  /**
   * PUT /api/results/publish-batch (Admin)
   * نشر نتائج فصل دراسي كامل (أو قسم / مجموعة مقررات)
   */
  publishBatch = asyncHandler(async (req: Request, res: Response) => {
    const parsed = publishBatchSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    const result = await resultsService.publishBatch(parsed.data);
    sendSuccess(res, result, `Published ${result.published} results`);
  });

  /**
   * PUT /api/results/unpublish-batch (Admin)
   * سحب نشر نتائج (للتعديل قبل إعادة النشر)
   */
  unpublishBatch = asyncHandler(async (req: Request, res: Response) => {
    const parsed = publishBatchSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    const result = await resultsService.unpublishBatch(parsed.data);
    sendSuccess(res, result, `Unpublished ${result.unpublished} results`);
  });
}

export const resultsController = new ResultsController();
