import { Request, Response } from 'express';
import { departmentsService } from './departments.service';
import { updateDepartmentSchema } from './departments.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class DepartmentsController {
  /**
   * GET /api/departments
   * قائمة الأقسام الأربعة مع عدد أعضاء التدريس
   */
  listDepartments = asyncHandler(async (_req: Request, res: Response) => {
    const departments = await departmentsService.listDepartments();
    sendSuccess(res, departments);
  });

  /**
   * GET /api/departments/:slug
   * تفاصيل قسم
   */
  getDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const dept = await departmentsService.getDepartmentBySlug(slug);
    sendSuccess(res, dept);
  });

  /**
   * GET /api/departments/:slug/faculty
   * أعضاء التدريس في القسم
   */
  getDepartmentFaculty = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const faculty = await departmentsService.getDepartmentFaculty(slug);
    sendSuccess(res, faculty);
  });

  /**
   * GET /api/departments/:slug/programs
   * البرامج الدراسية في القسم
   */
  getDepartmentPrograms = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const programs = await departmentsService.getDepartmentPrograms(slug);
    sendSuccess(res, programs);
  });

  /**
   * PUT /api/departments/:id (Admin)
   * تعديل بيانات قسم
   */
  updateDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updateDepartmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const dept = await departmentsService.updateDepartment(id, parsed.data);
    sendSuccess(res, dept, 'Department updated successfully');
  });
}

export const departmentsController = new DepartmentsController();
