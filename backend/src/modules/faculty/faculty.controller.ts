import { Request, Response } from 'express';
import { facultyService } from './faculty.service';
import {
  createFacultySchema,
  updateFacultySchema,
  updateMyProfileSchema,
  listFacultyQuerySchema,
} from './faculty.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError, UnauthorizedError } from '../../shared/errors/AppError';
import { UserRole } from '@prisma/client';

export class FacultyController {
  /**
   * GET /api/faculty
   * قائمة أعضاء التدريس مع pagination
   */
  listFaculty = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listFacultyQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);

    const result = await facultyService.listFaculty(parsed.data);
    sendPaginated(res, result);
  });

  /**
   * GET /api/faculty/:id
   * تفاصيل عضو تدريس
   */
  getFaculty = asyncHandler(async (req: Request, res: Response) => {
    const member = await facultyService.getFacultyById(req.params.id);
    sendSuccess(res, member);
  });

  /**
   * GET /api/faculty/:id/publications
   * أبحاث عضو تدريس
   */
  getFacultyPublications = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    
    // Validate limit to prevent large requests
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;
    
    const result = await facultyService.getFacultyPublications(req.params.id, page, limit);
    sendPaginated(res, result);
  });

  /**
   * POST /api/faculty (Admin)
   * إضافة عضو جديد
   */
  createFaculty = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createFacultySchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);

    const member = await facultyService.createFaculty(parsed.data);
    sendCreated(res, member, 'Faculty member created successfully');
  });

  /**
   * PUT /api/faculty/:id (Admin)
   * تعديل بيانات عضو
   */
  updateFaculty = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateFacultySchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);

    const member = await facultyService.updateFaculty(req.params.id, parsed.data);
    sendSuccess(res, member, 'Faculty member updated successfully');
  });

  /**
   * DELETE /api/faculty/:id (Admin)
   * تعطيل عضو
   */
  deleteFaculty = asyncHandler(async (req: Request, res: Response) => {
    await facultyService.deleteFaculty(req.params.id);
    sendSuccess(res, null, 'Faculty member deactivated successfully');
  });

  /**
   * PUT /api/faculty/me (Faculty)
   * المحاضر يعدل بياناته الشخصية
   */
  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();

    const parsed = updateMyProfileSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);

    const member = await facultyService.updateMyProfile(req.user.userId, parsed.data);
    sendSuccess(res, member, 'Profile updated successfully');
  });

  /**
   * PUT /api/faculty/:id/photo (Admin أو صاحب الصورة)
   * رفع/تغيير صورة عضو التدريس
   */
  updatePhoto = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    if (!req.file) throw new ValidationError('Photo file is required');

    const photoUrl = `/uploads/photos/${req.file.filename}`;
    const isAdmin = req.user.role === UserRole.admin;

    const member = await facultyService.updatePhoto(
      req.params.id,
      photoUrl,
      req.user.userId,
      isAdmin,
    );
    sendSuccess(res, { photoUrl: member.photoUrl }, 'Photo updated successfully');
  });
}

export const facultyController = new FacultyController();
