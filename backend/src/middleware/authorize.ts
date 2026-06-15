import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../shared/errors/AppError';

/**
 * Middleware: Role-Based Access Control (RBAC)
 * يتحقق من أن المستخدم لديه أحد الأدوار المسموح بها
 * 
 * @param allowedRoles - الأدوار المسموح لها بالوصول
 * 
 * @example
 * router.get('/admin/users', auth, authorize(['admin']), getUsers);
 * router.put('/faculty/me', auth, authorize(['faculty', 'admin']), updateProfile);
 */
export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // التأكد من أن المستخدم مسجل دخول (auth middleware تم تنفيذه)
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // التحقق من الدور
      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
