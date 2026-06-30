import { User } from '@prisma/client';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { comparePassword, hashPassword } from '../../shared/utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt';
import { UnauthorizedError, NotFoundError } from '../../shared/errors/AppError';
import { AuthResponse, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.types';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class AuthService {
  /**
   * تسجيل الدخول
   * يقبل: email أو university_id أو username
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { identifier, password } = input;

    // البحث عن المستخدم
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { universityId: identifier },
          { username: identifier },
        ],
        isActive: true,
      },
      include: {
        facultyMember: { select: { nameAr: true, nameEn: true } },
        student:       { select: { nameAr: true, nameEn: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // التحقق من كلمة المرور
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // تحديث last_login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // توليد tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        universityId: user.universityId || undefined,
        username: user.username || undefined,
        nameAr: (user as any).facultyMember?.nameAr ?? (user as any).student?.nameAr ?? user.username ?? user.email.split('@')[0],
        nameEn: (user as any).facultyMember?.nameEn ?? (user as any).student?.nameEn ?? null,
      },
      ...tokens,
    };
  }

  /**
   * تسجيل الخروج
   * يضيف الـ access token والـ refresh token للـ blacklist في Redis
   */
  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    // حساب الـ TTL من الـ token نفسه لضمان التطابق مع expiry
    const decoded = jwt.decode(accessToken) as { exp?: number } | null;
    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded?.exp ? Math.max(decoded.exp - now, 60) : 365 * 24 * 60 * 60;
    
    // إضافة الـ access token للـ blacklist
    await redis.setex(`blacklist:${accessToken}`, ttl, '1');
    
    // إضافة الـ refresh token للـ blacklist أيضاً (security fix)
    if (refreshToken) {
      const refreshDecoded = jwt.decode(refreshToken) as { exp?: number } | null;
      const refreshTtl = refreshDecoded?.exp ? Math.max(refreshDecoded.exp - now, 60) : 365 * 24 * 60 * 60;
      await redis.setex(`blacklist:${refreshToken}`, refreshTtl, '1');
    }
  }

  /**
   * تجديد Access Token باستخدام Refresh Token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // التحقق من أن الـ refresh token ليس في الـ blacklist
    const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    // التحقق من الـ refresh token
    const payload = verifyRefreshToken(refreshToken);

    // التأكد من أن المستخدم لا يزال نشطاً
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // توليد access token جديد
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      universityId: user.universityId || undefined,
    });

    return { accessToken };
  }

  /**
   * طلب إعادة تعيين كلمة المرور
   * يرسل بريد إلكتروني مع رابط إعادة التعيين
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const { email } = input;

    const user = await prisma.user.findUnique({ where: { email } });

    // لأسباب أمنية: نرجع نفس الرسالة سواء وُجد المستخدم أم لا
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // توليد reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // حفظ الـ token في Redis (صلاحية ساعة واحدة)
    const ttl = 60 * 60; // ساعة
    await redis.setex(`reset:${hashedToken}`, ttl, user.id);

    // TODO: Phase 4+ — إرسال بريد إلكتروني (Nodemailer)
    // await sendResetPasswordEmail(user.email, resetToken);

    console.log(`[DEV] Reset token for ${user.email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * إعادة تعيين كلمة المرور
   */
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const { token, newPassword } = input;

    // hash الـ token للبحث في Redis
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await redis.get(`reset:${hashedToken}`);

    if (!userId) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // تشفير كلمة المرور الجديدة
    const passwordHash = await hashPassword(newPassword);

    // تحديث كلمة المرور
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // حذف الـ reset token
    await redis.del(`reset:${hashedToken}`);

    return { message: 'Password reset successfully' };
  }

  /**
   * التحقق من أن الـ token ليس في الـ blacklist
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await redis.get(`blacklist:${token}`);
    return result !== null;
  }

  /**
   * Helper: توليد access + refresh tokens
   */
  private generateTokens(user: User) {
    const payload = {
      userId: user.id,
      role: user.role,
      universityId: user.universityId || undefined,
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();
