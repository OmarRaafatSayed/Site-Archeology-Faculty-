import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';
import { env } from '../../config/env';

export class AuthController {
  /**
   * POST /api/auth/login
   * تسجيل الدخول
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    // Validation
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    // Login
    const result = await authService.login(parsed.data);

    // حفظ الـ refresh token في HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    });

    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  /**
   * POST /api/auth/logout
   * تسجيل الخروج
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    // استخراج الـ access token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    if (token) {
      await authService.logout(token);
    }

    // مسح الـ refresh token cookie
    res.clearCookie('refreshToken');

    sendSuccess(res, null, 'Logged out successfully');
  });

  /**
   * POST /api/auth/refresh
   * تجديد Access Token
   */
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return sendError(res, 'Refresh token not provided', 401);
    }

    const result = await authService.refreshToken(refreshToken);

    sendSuccess(res, result);
  });

  /**
   * POST /api/auth/forgot-password
   * طلب إعادة تعيين كلمة المرور
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const result = await authService.forgotPassword(parsed.data);

    sendSuccess(res, null, result.message);
  });

  /**
   * POST /api/auth/reset-password
   * إعادة تعيين كلمة المرور
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const result = await authService.resetPassword(parsed.data);

    sendSuccess(res, null, result.message);
  });

  /**
   * GET /api/auth/me
   * الحصول على بيانات المستخدم الحالي (Protected)
   */
  getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    sendSuccess(res, req.user);
  });
}

export const authController = new AuthController();
