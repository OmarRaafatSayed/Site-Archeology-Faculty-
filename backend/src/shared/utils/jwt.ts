import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { UnauthorizedError } from '../errors/AppError';

// قراءة الـ secrets مباشرة من process.env — يضمن عمل الـ tests بدون تحميل env singleton
function getAccessSecret(): string {
  return process.env.JWT_ACCESS_SECRET ?? '';
}
function getRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET ?? '';
}
function getAccessExpiry(): string {
  return process.env.JWT_ACCESS_EXPIRY ?? '15m';
}
function getRefreshExpiry(): string {
  return process.env.JWT_REFRESH_EXPIRY ?? '7d';
}

/**
 * توليد Access Token
 * صلاحية: 15 دقيقة (أو حسب الـ env)
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: getAccessExpiry() as jwt.SignOptions['expiresIn'],
  });
}

/**
 * توليد Refresh Token
 * صلاحية: 7 أيام (أو حسب الـ env)
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: getRefreshExpiry() as jwt.SignOptions['expiresIn'],
  });
}

/**
 * التحقق من Access Token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, getAccessSecret()) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid access token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
}

/**
 * التحقق من Refresh Token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, getRefreshSecret()) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
}

/**
 * فك تشفير Token بدون التحقق (للقراءة فقط)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
