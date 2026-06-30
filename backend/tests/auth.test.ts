import { hashPassword, comparePassword } from '../src/shared/utils/password';
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../src/shared/utils/jwt';
import { parsePagination, buildPaginatedResponse } from '../src/shared/utils/pagination';
import { UnauthorizedError, NotFoundError, ValidationError, ForbiddenError } from '../src/shared/errors/AppError';
import { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';

// ─── Password Utils ───────────────────────────────────────────────────────────

describe('Password Utils', () => {
  it('should hash password and not store plain text', async () => {
    const password = 'Test@12345';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2b$')).toBe(true); // bcrypt format
  });

  it('should verify correct password', async () => {
    const password = 'MySecret@99';
    const hash = await hashPassword(password);
    expect(await comparePassword(password, hash)).toBe(true);
  });

  it('should reject wrong password', async () => {
    const hash = await hashPassword('Correct@1');
    expect(await comparePassword('Wrong@1', hash)).toBe(false);
  });

  it('should produce different hashes for same password (bcrypt salt)', async () => {
    const password = 'Same@Password1';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });
});

// ─── JWT Utils ────────────────────────────────────────────────────────────────

describe('JWT Utils', () => {
  const mockPayload = {
    userId: 'test-user-uuid-123',
    role: 'student' as UserRole,
    universityId: 'STU2024001',
  };

  describe('Access Token', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      expect(token).toBeTruthy();
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should verify and decode access token correctly', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.universityId).toBe(mockPayload.universityId);
    });

    it('should throw UnauthorizedError for invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for tampered token', () => {
      const token = generateAccessToken(mockPayload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyAccessToken(tampered)).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for expired token', () => {
      // نولد token منتهي الصلاحية باستخدام jwt مباشرة
      const expiredToken = jwt.sign(
        mockPayload,
        process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-32-chars-minimum!!',
        { expiresIn: -1 }, // منتهي فوراً
      );
      expect(() => verifyAccessToken(expiredToken)).toThrow(UnauthorizedError);
    });
  });

  describe('Refresh Token', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      expect(token).toBeTruthy();
      expect(token.split('.').length).toBe(3);
    });

    it('should verify and decode refresh token correctly', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw UnauthorizedError for invalid refresh token', () => {
      expect(() => verifyRefreshToken('bad.refresh.token')).toThrow(UnauthorizedError);
    });

    it('should not accept access token as refresh token (different secret)', () => {
      const accessToken = generateAccessToken(mockPayload);
      // الـ access token موقّع بـ secret مختلف عن الـ refresh secret
      // لو الـ secrets مختلفة، المفروض يفشل
      // (في الـ test environment بنتحقق من الـ behavior)
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('Token Payload Integrity', () => {
    it('should include iat and exp in decoded token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should work for admin role', () => {
      const adminPayload = { userId: 'admin-uuid', role: 'admin' as UserRole };
      const token = generateAccessToken(adminPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.role).toBe('admin');
    });

    it('should work for faculty role', () => {
      const facultyPayload = { userId: 'faculty-uuid', role: 'faculty' as UserRole };
      const token = generateAccessToken(facultyPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.role).toBe('faculty');
    });
  });
});

// ─── Pagination Utils ─────────────────────────────────────────────────────────

describe('Pagination Utils', () => {
  describe('parsePagination', () => {
    it('should return defaults when no query provided', () => {
      const result = parsePagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
    });

    it('should parse page and limit correctly', () => {
      const result = parsePagination({ page: 3, limit: 10 });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(20); // (3-1) * 10
      expect(result.take).toBe(10);
    });

    it('should cap limit at 100', () => {
      const result = parsePagination({ page: 1, limit: 999 });
      expect(result.limit).toBe(100);
    });

    it('should set minimum page to 1', () => {
      const result = parsePagination({ page: -5, limit: 10 });
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should handle page 1 correctly (skip = 0)', () => {
      const result = parsePagination({ page: 1, limit: 50 });
      expect(result.skip).toBe(0);
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should build correct paginated response', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const result = buildPaginatedResponse(items, 45, 2, 20);

      expect(result.items).toEqual(items);
      expect(result.total).toBe(45);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(3); // ceil(45/20) = 3
    });

    it('should calculate totalPages correctly', () => {
      const result = buildPaginatedResponse([], 100, 1, 20);
      expect(result.totalPages).toBe(5);
    });

    it('should handle exact division for totalPages', () => {
      const result = buildPaginatedResponse([], 40, 1, 20);
      expect(result.totalPages).toBe(2);
    });

    it('should handle empty results', () => {
      const result = buildPaginatedResponse([], 0, 1, 20);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });
});

// ─── AppError Classes ─────────────────────────────────────────────────────────

describe('AppError Classes', () => {
  it('UnauthorizedError should have status 401', () => {
    const err = new UnauthorizedError('Not allowed');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Not allowed');
    expect(err.isOperational).toBe(true);
  });

  it('ForbiddenError should have status 403', () => {
    const err = new ForbiddenError('Forbidden');
    expect(err.statusCode).toBe(403);
  });

  it('NotFoundError should have status 404', () => {
    const err = new NotFoundError('User');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
  });

  it('ValidationError should have status 422', () => {
    const err = new ValidationError('Invalid input');
    expect(err.statusCode).toBe(422);
  });

  it('errors should be instances of Error', () => {
    const err = new UnauthorizedError();
    expect(err).toBeInstanceOf(Error);
  });

  it('should use default messages', () => {
    expect(new UnauthorizedError().message).toBe('Unauthorized');
    expect(new ForbiddenError().message).toBe('Forbidden');
    expect(new NotFoundError().message).toBe('Resource not found');
    expect(new ValidationError().message).toBe('Validation failed');
  });
});
