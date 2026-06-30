import { z } from 'zod';

/**
 * Strong password validation schema
 * يُستخدم عند إنشاء passwords جديدة (registration, reset, admin create)
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Validation Schema لتسجيل الدخول
 * Note: لا نحتاج strong validation هنا لأننا نقبل passwords موجودة
 */
export const loginSchema = z.object({
  // يقبل: email أو university_id أو username
  identifier: z.string().min(3, 'Identifier must be at least 3 characters'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validation Schema لطلب إعادة تعيين كلمة المرور
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Validation Schema لإعادة تعيين كلمة المرور
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: strongPasswordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Response بعد تسجيل الدخول بنجاح
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    universityId?: string;
    username?: string;
    nameAr: string;
    nameEn: string | null;
  };
  accessToken: string;
  refreshToken: string;
}
