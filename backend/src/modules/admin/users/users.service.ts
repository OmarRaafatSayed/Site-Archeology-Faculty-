import { prisma } from '../../../config/database';
import { hashPassword } from '../../../shared/utils/password';
import { parsePagination, buildPaginatedResponse } from '../../../shared/utils/pagination';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import {
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
  UserPublic,
} from './users.types';
import { PaginatedResponse } from '../../../shared/types';

/**
 * الحقول التي تُرجع للـ Admin (بدون passwordHash)
 */
const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  universityId: true,
  username: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
} as const;

export class UsersService {
  /**
   * GET /api/admin/users
   * قائمة المستخدمين مع pagination + فلترة
   */
  async listUsers(query: ListUsersQuery): Promise<PaginatedResponse<UserPublic>> {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      ...(query.role !== undefined && { role: query.role }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { email: { contains: query.search, mode: 'insensitive' as const } },
          { username: { contains: query.search, mode: 'insensitive' as const } },
          { universityId: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({ where, select: USER_SELECT, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(items as UserPublic[], total, page, limit);
  }

  /**
   * GET /api/admin/users/:id
   * بيانات مستخدم واحد
   */
  async getUserById(id: string): Promise<UserPublic> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user as UserPublic;
  }

  /**
   * POST /api/admin/users
   * إنشاء مستخدم جديد من الـ Admin
   */
  async createUser(input: CreateUserInput): Promise<UserPublic> {
    // التحقق من عدم تكرار الـ email
    const existingByEmail = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingByEmail) {
      throw new ValidationError('Email already exists');
    }

    // التحقق من عدم تكرار الـ universityId
    if (input.universityId) {
      const existingById = await prisma.user.findUnique({
        where: { universityId: input.universityId },
      });
      if (existingById) {
        throw new ValidationError('University ID already exists');
      }
    }

    // التحقق من عدم تكرار الـ username
    if (input.username) {
      const existingByUsername = await prisma.user.findUnique({
        where: { username: input.username },
      });
      if (existingByUsername) {
        throw new ValidationError('Username already exists');
      }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role,
        universityId: input.universityId ?? null,
        username: input.username ?? null,
      },
      select: USER_SELECT,
    });

    return user as UserPublic;
  }

  /**
   * PUT /api/admin/users/:id
   * تحديث بيانات مستخدم
   */
  async updateUser(id: string, input: UpdateUserInput): Promise<UserPublic> {
    // التأكد من وجود المستخدم
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('User');
    }

    // التحقق من عدم تكرار الـ email عند تغييره
    if (input.email && input.email !== existing.email) {
      const conflict = await prisma.user.findUnique({ where: { email: input.email } });
      if (conflict) {
        throw new ValidationError('Email already in use');
      }
    }

    // التحقق من عدم تكرار الـ universityId
    if (input.universityId && input.universityId !== existing.universityId) {
      const conflict = await prisma.user.findUnique({ where: { universityId: input.universityId } });
      if (conflict) {
        throw new ValidationError('University ID already in use');
      }
    }

    // التحقق من عدم تكرار الـ username
    if (input.username && input.username !== existing.username) {
      const conflict = await prisma.user.findUnique({ where: { username: input.username } });
      if (conflict) {
        throw new ValidationError('Username already in use');
      }
    }

    // تجهيز بيانات التحديث
    const updateData: Record<string, unknown> = {};
    if (input.email !== undefined) updateData.email = input.email;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.universityId !== undefined) updateData.universityId = input.universityId;
    if (input.username !== undefined) updateData.username = input.username;
    if (input.newPassword) {
      updateData.passwordHash = await hashPassword(input.newPassword);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });

    return user as UserPublic;
  }

  /**
   * DELETE /api/admin/users/:id
   * حذف مستخدم (Soft delete — تعطيل فقط)
   * لا نحذف فعلياً للحفاظ على الـ Audit Logs والعلاقات
   */
  async deleteUser(id: string): Promise<void> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('User');
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const usersService = new UsersService();
