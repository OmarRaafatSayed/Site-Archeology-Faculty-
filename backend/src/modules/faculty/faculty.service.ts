import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  CreateFacultyInput,
  UpdateFacultyInput,
  UpdateMyProfileInput,
  ListFacultyQuery,
} from './faculty.types';

const CACHE_TTL = 30 * 60; // 30 دقيقة — من SRS القسم 6.2
const cacheKeyList = (dept?: string) => `faculty:list:${dept ?? 'all'}`;
const cacheKeyOne = (id: string) => `faculty:${id}`;

/** الحقول الأساسية المُرجعة للعموم */
const FACULTY_SELECT_PUBLIC = {
  id: true,
  nameAr: true,
  nameEn: true,
  degree: true,
  specializationAr: true,
  specializationEn: true,
  email: true,
  photoUrl: true,
  adminRole: true,
  isActive: true,
  orderIndex: true,
  department: {
    select: { id: true, slug: true, nameAr: true, nameEn: true, accentColor: true },
  },
} as const;

export class FacultyService {
  /**
   * GET /api/faculty
   * قائمة أعضاء التدريس مع pagination + فلترة
   */
  async listFaculty(query: ListFacultyQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isActive: query.isActive !== undefined ? query.isActive : true,
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.degree && { degree: query.degree }),
      ...(query.search && {
        OR: [
          { nameAr: { contains: query.search, mode: 'insensitive' as const } },
          { nameEn: { contains: query.search, mode: 'insensitive' as const } },
          { specializationAr: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.facultyMember.findMany({
        where,
        select: FACULTY_SELECT_PUBLIC,
        skip,
        take,
        orderBy: [{ degree: 'desc' }, { orderIndex: 'asc' }],
      }),
      prisma.facultyMember.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  /**
   * GET /api/faculty/:id
   * تفاصيل عضو تدريس واحد
   */
  async getFacultyById(id: string) {
    const cached = await redis.get(cacheKeyOne(id)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const member = await prisma.facultyMember.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, slug: true, nameAr: true, nameEn: true, accentColor: true },
        },
        courses: {
          where: { isActive: true },
          select: { id: true, code: true, nameAr: true, nameEn: true, creditHours: true },
        },
        _count: { select: { publications: { where: { isPublished: true } } } },
      },
    });

    if (!member) throw new NotFoundError('Faculty member');

    await redis.setex(cacheKeyOne(id), CACHE_TTL, JSON.stringify(member)).catch(() => null);
    return member;
  }

  /**
   * GET /api/faculty/:id/publications
   * أبحاث عضو تدريس مع pagination
   */
  async getFacultyPublications(id: string, page = 1, limit = 10) {
    const member = await prisma.facultyMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundError('Faculty member');

    const { skip, take } = parsePagination({ page, limit });
    const [items, total] = await prisma.$transaction([
      prisma.publication.findMany({
        where: { facultyId: id, isPublished: true },
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          abstractAr: true,
          abstractEn: true,
          journalName: true,
          publishYear: true,
          doi: true,
          fileUrl: true,
        },
        skip,
        take,
        orderBy: { publishYear: 'desc' },
      }),
      prisma.publication.count({ where: { facultyId: id, isPublished: true } }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  /**
   * POST /api/faculty (Admin)
   * إضافة عضو تدريس جديد
   */
  async createFaculty(input: CreateFacultyInput) {
    // التأكد من وجود القسم
    const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!dept) throw new NotFoundError('Department');

    const member = await prisma.facultyMember.create({
      data: {
        departmentId: input.departmentId,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        degree: input.degree,
        specializationAr: input.specializationAr ?? null,
        specializationEn: input.specializationEn ?? null,
        email: input.email ?? null,
        bioAr: input.bioAr ?? null,
        bioEn: input.bioEn ?? null,
        adminRole: input.adminRole ?? null,
        orderIndex: input.orderIndex,
        userId: input.userId ?? null,
      },
      include: {
        department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
      },
    });

    await this.invalidateCache(dept.slug, member.id);
    return member;
  }

  /**
   * PUT /api/faculty/:id (Admin)
   * تعديل بيانات عضو
   */
  async updateFaculty(id: string, input: UpdateFacultyInput) {
    const existing = await prisma.facultyMember.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!existing) throw new NotFoundError('Faculty member');

    // لو بيغير القسم — نتأكد من القسم الجديد
    if (input.departmentId) {
      const newDept = await prisma.department.findUnique({ where: { id: input.departmentId } });
      if (!newDept) throw new NotFoundError('Department');
    }

    const updated = await prisma.facultyMember.update({
      where: { id },
      data: {
        ...(input.departmentId !== undefined && { departmentId: input.departmentId }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.degree !== undefined && { degree: input.degree }),
        ...(input.specializationAr !== undefined && { specializationAr: input.specializationAr }),
        ...(input.specializationEn !== undefined && { specializationEn: input.specializationEn }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.bioAr !== undefined && { bioAr: input.bioAr }),
        ...(input.bioEn !== undefined && { bioEn: input.bioEn }),
        ...(input.adminRole !== undefined && { adminRole: input.adminRole }),
        ...(input.orderIndex !== undefined && { orderIndex: input.orderIndex }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
      },
    });

    await this.invalidateCache(existing.department.slug, id);
    return updated;
  }

  /**
   * DELETE /api/faculty/:id (Admin)
   * Soft delete — تعطيل العضو
   */
  async deleteFaculty(id: string): Promise<void> {
    const existing = await prisma.facultyMember.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!existing) throw new NotFoundError('Faculty member');

    await prisma.facultyMember.update({
      where: { id },
      data: { isActive: false },
    });

    await this.invalidateCache(existing.department.slug, id);
  }

  /**
   * PUT /api/faculty/me (Faculty)
   * المحاضر يعدل بياناته الشخصية فقط
   */
  async updateMyProfile(userId: string, input: UpdateMyProfileInput) {
    // نجيب الـ facultyMember المرتبط بالـ userId
    const member = await prisma.facultyMember.findFirst({
      where: { userId },
    });
    if (!member) throw new NotFoundError('Faculty profile');

    const updated = await prisma.facultyMember.update({
      where: { id: member.id },
      data: {
        ...(input.bioAr !== undefined && { bioAr: input.bioAr }),
        ...(input.bioEn !== undefined && { bioEn: input.bioEn }),
        ...(input.specializationAr !== undefined && { specializationAr: input.specializationAr }),
        ...(input.specializationEn !== undefined && { specializationEn: input.specializationEn }),
        ...(input.email !== undefined && { email: input.email }),
      },
      include: {
        department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
      },
    });

    await this.invalidateCache(updated.department.slug, member.id);
    return updated;
  }

  /**
   * Helper: رفع صورة عضو التدريس
   */
  async updatePhoto(id: string, photoUrl: string, requestingUserId: string, isAdmin: boolean) {
    const member = await prisma.facultyMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundError('Faculty member');

    // المحاضر يعدل صورته فقط، الأدمن يعدل أي صورة
    if (!isAdmin && member.userId !== requestingUserId) {
      throw new ForbiddenError('Cannot update another member\'s photo');
    }

    const updated = await prisma.facultyMember.update({
      where: { id },
      data: { photoUrl },
    });

    await redis.del(cacheKeyOne(id)).catch(() => null);
    return updated;
  }

  /** Invalidate كل الـ cache المتعلق بعضو أو قسم */
  private async invalidateCache(deptSlug: string, memberId: string) {
    await Promise.all([
      redis.del(cacheKeyOne(memberId)).catch(() => null),
      redis.del(cacheKeyList()).catch(() => null),
      redis.del(cacheKeyList(deptSlug)).catch(() => null),
      redis.del('departments:all').catch(() => null),
      redis.del(`departments:${deptSlug}`).catch(() => null),
    ]);
  }
}

export const facultyService = new FacultyService();
