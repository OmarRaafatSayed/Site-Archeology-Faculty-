import { Request, Response } from 'express';
import fs from 'fs';
import { libraryService } from './library.service';
import { createBookSchema, updateBookSchema, listBooksQuerySchema } from './library.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class LibraryController {
  listBooks = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listBooksQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await libraryService.listBooks(parsed.data));
  });

  getBook = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await libraryService.getBookById(req.params.id));
  });

  createBook = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createBookSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await libraryService.createBook(parsed.data), 'Book created');
  });

  updateBook = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateBookSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await libraryService.updateBook(req.params.id, parsed.data), 'Book updated');
  });

  deleteBook = asyncHandler(async (req: Request, res: Response) => {
    await libraryService.deleteBook(req.params.id);
    sendSuccess(res, null, 'Book deleted');
  });

  /** POST /api/library/import — Phase 1: Validate */
  validateImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');
    const buffer = fs.readFileSync(req.file.path);
    const report = await libraryService.validateBooksExcel(buffer);
    fs.unlinkSync(req.file.path);
    sendSuccess(res, report, 'Validation completed');
  });

  /** POST /api/library/import/confirm — Phase 2: Execute */
  confirmImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');
    const buffer = fs.readFileSync(req.file.path);
    const result = await libraryService.importBooksFromExcel(buffer);
    fs.unlinkSync(req.file.path);
    sendSuccess(res, result, `Imported ${result.imported} books`);
  });
}

export const libraryController = new LibraryController();
