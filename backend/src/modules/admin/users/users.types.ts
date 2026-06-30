import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { strongPasswordSchema } from '../../auth/auth.types';

/**
 * Schema لإنشاء مستخدم جديد من الـ Admin
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: strongPasswordSchema,
  role: z.nativeEnum(UserRole),
  universityId: z.string().max(20).optional(),
  username: z.string().min(3).max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Schema لتحديث مستخدم
 */
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  universityId: z.string().max(20).optional(),
  username: z.string().min(3).max(100).optional(),
  // تغيير كلمة المرور اختياري
  newPassword: strongPasswordSchema.optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Schema لـ query params في GET /admin/users
 */
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  search: z.string().optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

/**
 * بيانات المستخدم التي تُرجع في الـ API (بدون passwordHash)
 */
export interface UserPublic {
  id: string;
  email: string;
  role: UserRole;
  universityId: string | null;
  username: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}
