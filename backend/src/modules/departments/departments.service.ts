import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { UpdateDepartmentInput, DepartmentPublic } from './departments.types';

const CACHE_TTL = 60 * 60; // 1 ساعة — من SRS القسم 6.2
const CACHE_KEY_ALL = 'departments:all';
const cacheKey = (slug: string) => `departments:${slug}`;

export class DepartmentsService {
  /**
   * GET /api/departments
   * قائمة الأقسام الأربعة مرتبة بالـ order_index
   * مع عدد أعضاء التدريس النشطين في كل قسم
   */
  async listDepartments(): Promise<DepartmentPublic[]> {
    // فحص الـ Cache أولاً
    const cached = await redis.get(CACHE_KEY_ALL).catch(() => null);
    if (cached) return JSON.parse(cached);

    const departments = await prisma.department.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { facultyMembers: { where: { isActive: true } } },
        },
      },
    });

    const result: DepartmentPublic[] = departments.map((d) => ({
      id: d.id,
      slug: d.slug,
      nameAr: d.nameAr,
      nameEn: d.nameEn,
      descriptionAr: d.descriptionAr,
      descriptionEn: d.descriptionEn,
      accentColor: d.accentColor,
      coverImageUrl: d.coverImageUrl,
      orderIndex: d.orderIndex,
      facultyCount: d._count.facultyMembers,
    }));

    await redis.setex(CACHE_KEY_ALL, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  /**
   * GET /api/departments/:slug
   * تفاصيل قسم واحد
   */
  async getDepartmentBySlug(slug: string): Promise<DepartmentPublic> {
    const cached = await redis.get(cacheKey(slug)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const dept = await prisma.department.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { facultyMembers: { where: { isActive: true } } },
        },
      },
    });

    if (!dept) throw new NotFoundError('Department');

    const result: DepartmentPublic = {
      id: dept.id,
      slug: dept.slug,
      nameAr: dept.nameAr,
      nameEn: dept.nameEn,
      descriptionAr: dept.descriptionAr,
      descriptionEn: dept.descriptionEn,
      accentColor: dept.accentColor,
      coverImageUrl: dept.coverImageUrl,
      orderIndex: dept.orderIndex,
      facultyCount: dept._count.facultyMembers,
    };

    await redis.setex(cacheKey(slug), CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  /**
   * GET /api/departments/:slug/faculty
   * أعضاء التدريس النشطين في القسم مرتبين بالـ degree ثم order_index
   */
  async getDepartmentFaculty(slug: string) {
    const dept = await prisma.department.findUnique({ where: { slug } });
    if (!dept) throw new NotFoundError('Department');

    return prisma.facultyMember.findMany({
      where: { departmentId: dept.id, isActive: true },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        degree: true,
        specializationAr: true,
        specializationEn: true,
        email: true,
        photoUrl: true,
        adminRole: true,
        orderIndex: true,
      },
      orderBy: [{ degree: 'desc' }, { orderIndex: 'asc' }],
    });
  }

  /**
   * GET /api/departments/:slug/programs
   * البرامج الدراسية النشطة في القسم
   */
  async getDepartmentPrograms(slug: string) {
    const dept = await prisma.department.findUnique({ where: { slug } });
    if (!dept) throw new NotFoundError('Department');

    return prisma.program.findMany({
      where: { departmentId: dept.id, isActive: true },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        level: true,
        descriptionAr: true,
        descriptionEn: true,
        creditHours: true,
        durationYears: true,
      },
      orderBy: { level: 'asc' },
    });
  }

  /**
   * PUT /api/departments/:id (Admin)
   * تعديل بيانات قسم وإلغاء الـ Cache
   */
  async updateDepartment(id: string, input: UpdateDepartmentInput): Promise<DepartmentPublic> {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundError('Department');

    const updated = await prisma.department.update({
      where: { id },
      data: {
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.descriptionAr !== undefined && { descriptionAr: input.descriptionAr }),
        ...(input.descriptionEn !== undefined && { descriptionEn: input.descriptionEn }),
        ...(input.accentColor !== undefined && { accentColor: input.accentColor }),
        ...(input.coverImageUrl !== undefined && { coverImageUrl: input.coverImageUrl }),
        ...(input.orderIndex !== undefined && { orderIndex: input.orderIndex }),
      },
    });

    // Invalidate cache
    await Promise.all([
      redis.del(CACHE_KEY_ALL).catch(() => null),
      redis.del(cacheKey(updated.slug)).catch(() => null),
    ]);

    return {
      id: updated.id,
      slug: updated.slug,
      nameAr: updated.nameAr,
      nameEn: updated.nameEn,
      descriptionAr: updated.descriptionAr,
      descriptionEn: updated.descriptionEn,
      accentColor: updated.accentColor,
      coverImageUrl: updated.coverImageUrl,
      orderIndex: updated.orderIndex,
    };
  }
}

export const departmentsService = new DepartmentsService();
