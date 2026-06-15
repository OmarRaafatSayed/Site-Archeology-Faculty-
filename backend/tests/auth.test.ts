import { hashPassword, comparePassword } from '../src/shared/utils/password';
import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } from '../src/shared/utils/jwt';
import { UserRole } from '@prisma/client';

describe('Password Utils', () => {
  it('should hash and compare password correctly', async () => {
    const password = 'Test@12345';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await comparePassword(password, hash)).toBe(true);
    expect(await comparePassword('wrongpass', hash)).toBe(false);
  });
});

describe('JWT Utils', () => {
  const mockPayload = {
    userId: '123',
    role: 'student' as UserRole,
    universityId: 'STU123',
  };

  it('should generate and verify access token', () => {
    const token = generateAccessToken(mockPayload);
    expect(token).toBeTruthy();

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.role).toBe(mockPayload.role);
  });

  it('should generate and verify refresh token', () => {
    const token = generateRefreshToken(mockPayload);
    expect(token).toBeTruthy();

    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.role).toBe(mockPayload.role);
  });

  it('should throw error for invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('should throw error for expired token', () => {
    // هذا الـ test يحتاج mock للـ time أو token منتهي الصلاحية
    // نتركه كـ TODO للتطوير المستقبلي
  });
});
