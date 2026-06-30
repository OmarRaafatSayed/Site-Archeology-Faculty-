import { Request, Response } from 'express';
import { studentsService } from './students.service';
import {
  updateMyProfileSchema,
  listStudentsQuerySchema,
} from './students.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { ValidationError, UnauthorizedError } from '../../shared/errors/AppError';
import fs from 'fs';

export class StudentsController {
  /**
   * GET /api/students/me
   * بيانات الطالب الحالي
   */
  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const student = await studentsService.getMyProfile(req.user.userId);
    sendSuccess(res, student);
  });

  /**
   * PUT /api/students/me
   * الطالب يعدل بياناته المسموح بها
   */
  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();

    const parsed = updateMyProfileSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);

    const student = await studentsService.updateMyProfile(req.user.userId, parsed.data);
    sendSuccess(res, student, 'Profile updated successfully');
  });

  /**
   * GET /api/students/me/results
   * نتائج الطالب المنشورة
   */
  getMyResults = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await studentsService.getMyResults(req.user.userId, page, limit);
    sendPaginated(res, result);
  });

  /**
   * GET /api/students/me/schedule
   * جدول الطالب الأسبوعي
   */
  getMySchedule = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const schedule = await studentsService.getMySchedule(req.user.userId);
    sendSuccess(res, schedule);
  });

  /**
   * GET /api/students/me/exams
   * جدول الامتحانات القادمة للطالب
   */
  getMyExams = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const exams = await studentsService.getMyExams(req.user.userId);
    sendSuccess(res, exams);
  });

  /**
   * GET /api/students (Admin)
   * قائمة الطلاب مع pagination + فلترة
   */
  listStudents = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listStudentsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);

    const result = await studentsService.listStudents(parsed.data);
    sendPaginated(res, result);
  });

  /**
   * POST /api/students/import (Admin)
   * المرحلة 1 — رفع Excel والحصول على Validation Report
   */
  validateImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');

    const buffer = fs.readFileSync(req.file.path);
    const report = await studentsService.validateStudentsExcel(buffer);

    // حذف الملف المؤقت
    fs.unlinkSync(req.file.path);

    sendSuccess(res, report, 'Validation completed');
  });

  /**
   * POST /api/students/import/confirm (Admin)
   * المرحلة 2 — تنفيذ الاستيراد بعد الموافقة
   */
  confirmImport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ValidationError('Excel file is required');

    const buffer = fs.readFileSync(req.file.path);
    const result = await studentsService.importStudentsFromExcel(buffer);

    // حذف الملف المؤقت
    fs.unlinkSync(req.file.path);

    sendSuccess(res, result, `Imported ${result.imported} students successfully`);
  });
}

export const studentsController = new StudentsController();
