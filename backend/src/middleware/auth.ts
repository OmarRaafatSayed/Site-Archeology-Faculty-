import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../shared/utils/jwt';
import { UnauthorizedError } from '../shared/errors/AppError';
import { authService } from '../modules/auth/auth.service';
import { JWTPayload } from '../shared/types';

// توسيع Express Request لإضافة user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware: التحقق من JWT Access Token
 * يستخرج الـ token من Authorization header أو cookies
 * ويتحقق من أنه ليس في الـ blacklist
 */
export function auth(req: Request, _res: Response, next: NextFunction): void {
  (async () => {
    try {
      // استخراج الـ token من Authorization header
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // البحث في الـ cookies (fallback)
        token = req.cookies?.accessToken;
      }

      if (!token) {
        throw new UnauthorizedError('No token provided');
      }

      // التحقق من الـ token structurally
      const payload = verifyAccessToken(token);

      // التحقق من الـ blacklist في Redis
      const isBlacklisted = await authService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedError('Token has been revoked');
      }

      // حفظ بيانات المستخدم في الـ request
      req.user = payload;

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        next(error);
      } else {
        next(new UnauthorizedError('Authentication failed'));
      }
    }
  })();
}
