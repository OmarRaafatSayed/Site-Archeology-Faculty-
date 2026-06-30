import { prisma } from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import { CreateCourseInput, UpdateCourseInput, ListCoursesQuery } from './courses.types';

const COURSE_SELECT = {
  id: true,
  code: true,
  nameAr: true,
  nameEn: true,
  descriptionAr: true,
  descriptionEn: true,
  creditHours: true,
  semester: true,
  academicYear: true,
  isActive: true,
  createdAt: true,
  department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
  program: { select: { id: true, nameAr: true, nameEn: true, level: true } },
  faculty: { select: { id: true, nameAr: true, nameEn: true, degree: true } },
  prerequisite: { select: { id: true, code: true, nameAr: true, nameEn: true } },
} as const;

export class CoursesService {
  // ─── GET /api/courses ──────────────────────────────────────────────────────
  async listCourses(query: ListCoursesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isActive: query.isActive !== undefined ? query.isActive : true,
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.programId && { programId: query.programId }),
      ...(query.facultyId && { facultyId: query.facultyId }),
      ...(query.semester && { semester: query.semester }),
      ...(query.academicYear && { academicYear: query.academicYear }),
      ...(query.search && {
        OR: [
          { nameAr: { contains: query.search, mode: 'insensitive' as const } },
          { nameEn: { contains: query.search, mode: 'insensitive' as const } },
          { code: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        select: COURSE_SELECT,
        skip,
        take,
        orderBy: [{ academicYear: 'asc' }, { semester: 'asc' }, { code: 'asc' }],
      }),
      prisma.course.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  // ─── GET /api/courses/:id ──────────────────────────────────────────────────
  async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
        program: { select: { id: true, nameAr: true, nameEn: true, level: true } },
        faculty: { select: { id: true, nameAr: true, nameEn: true, degree: true, photoUrl: true } },
        prerequisite: { select: { id: true, code: true, nameAr: true, nameEn: true } },
        dependentCourses: {
          where: { isActive: true },
          select: { id: true, code: true, nameAr: true, nameEn: true },
        },
        courseMaterials: {
          where: { isActive: true },
          select: { id: true, titleAr: true, titleEn: true, fileType: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!course) throw new NotFoundError('Course');
    return course;
  }

  // ─── POST /api/courses ─────────────────────────────────────────────────────
  async createCourse(input: CreateCourseInput) {
    // تأكد من وجود القسم
    const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!dept) throw new NotFoundError('Department');

    // تأكد من عدم تكرار الكود
    const existing = await prisma.course.findUnique({ where: { code: input.code } });
    if (existing) throw new ValidationError(`Course code "${input.code}" already exists`);

    // تأكد من وجود المتطلب السابق إن وُجد
    if (input.prerequisiteId) {
      const prereq = await prisma.course.findUnique({ where: { id: input.prerequisiteId } });
      if (!prereq) throw new NotFoundError('Prerequisite course');
    }

    return prisma.course.create({
      data: {
        departmentId: input.departmentId,
        programId: input.programId ?? null,
        facultyId: input.facultyId ?? null,
        code: input.code,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        descriptionAr: input.descriptionAr ?? null,
        descriptionEn: input.descriptionEn ?? null,
        creditHours: input.creditHours,
        semester: input.semester,
        academicYear: input.academicYear,
        prerequisiteId: input.prerequisiteId ?? null,
      },
      select: COURSE_SELECT,
    });
  }

  // ─── PUT /api/courses/:id ──────────────────────────────────────────────────
  async updateCourse(id: string, input: UpdateCourseInput) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Course');

    // لو بيغير الكود — تأكد من عدم التكرار
    if (input.code && input.code !== existing.code) {
      const conflict = await prisma.course.findUnique({ where: { code: input.code } });
      if (conflict) throw new ValidationError(`Course code "${input.code}" already in use`);
    }

    return prisma.course.update({
      where: { id },
      data: {
        ...(input.departmentId !== undefined && { departmentId: input.departmentId }),
        ...(input.programId !== undefined && { programId: input.programId }),
        ...(input.facultyId !== undefined && { facultyId: input.facultyId }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.descriptionAr !== undefined && { descriptionAr: input.descriptionAr }),
        ...(input.descriptionEn !== undefined && { descriptionEn: input.descriptionEn }),
        ...(input.creditHours !== undefined && { creditHours: input.creditHours }),
        ...(input.semester !== undefined && { semester: input.semester }),
        ...(input.academicYear !== undefined && { academicYear: input.academicYear }),
        ...(input.prerequisiteId !== undefined && { prerequisiteId: input.prerequisiteId }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      select: COURSE_SELECT,
    });
  }

  // ─── DELETE /api/courses/:id ───────────────────────────────────────────────
  async deleteCourse(id: string): Promise<void> {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Course');
    await prisma.course.update({ where: { id }, data: { isActive: false } });
  }
}

export const coursesService = new CoursesService();
