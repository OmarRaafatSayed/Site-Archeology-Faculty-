import { Request, Response } from 'express';
import { usersService } from './users.service';
import { createUserSchema, updateUserSchema, listUsersQuerySchema } from './users.types';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../../shared/utils/response';
import { ValidationError } from '../../../shared/errors/AppError';

export class UsersController {
  /**
   * GET /api/admin/users
   * قائمة المستخدمين مع pagination + فلترة
   */
  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const result = await usersService.listUsers(parsed.data);
    sendPaginated(res, result);
  });

  /**
   * GET /api/admin/users/:id
   * بيانات مستخدم واحد
   */
  getUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await usersService.getUserById(id);
    sendSuccess(res, user);
  });

  /**
   * POST /api/admin/users
   * إنشاء مستخدم جديد
   */
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const user = await usersService.createUser(parsed.data);
    sendCreated(res, user, 'User created successfully');
  });

  /**
   * PUT /api/admin/users/:id
   * تحديث بيانات مستخدم
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const user = await usersService.updateUser(id, parsed.data);
    sendSuccess(res, user, 'User updated successfully');
  });

  /**
   * DELETE /api/admin/users/:id
   * تعطيل مستخدم (soft delete)
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await usersService.deleteUser(id);
    sendSuccess(res, null, 'User deactivated successfully');
  });
}

export const usersController = new UsersController();
