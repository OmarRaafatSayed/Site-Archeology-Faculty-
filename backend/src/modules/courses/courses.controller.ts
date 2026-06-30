import { Request, Response } from 'express';
import { coursesService } from './courses.service';
import { createCourseSchema, updateCourseSchema, listCoursesQuerySchema } from './courses.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class CoursesController {
  listCourses = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listCoursesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await coursesService.listCourses(parsed.data));
  });

  getCourse = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await coursesService.getCourseById(req.params.id));
  });

  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await coursesService.createCourse(parsed.data), 'Course created successfully');
  });

  updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateCourseSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await coursesService.updateCourse(req.params.id, parsed.data), 'Course updated');
  });

  deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    await coursesService.deleteCourse(req.params.id);
    sendSuccess(res, null, 'Course deactivated successfully');
  });
}

export const coursesController = new CoursesController();
