import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  CreateProgramInput,
  UpdateProgramInput,
  ListProgramsQuery,
} from './programs.types';

const PROGRAM_SELECT = {
  id: true,
  nameAr: true,
  nameEn: true,
  level: true,
  descriptionAr: true,
  descriptionEn: true,
  creditHours: true,
  durationYears: true,
  isActive: true,
  createdAt: true,
  department: {
    select: { id: true, slug: true, nameAr: true, nameEn: true, accentColor: true },
  },
  _count: { select: { courses: { where: { isActive: true } } } },
} as const;

export class ProgramsService {
  // ─── GET /api/programs ─────────────────────────────────────────────────────
  async listPrograms(query: ListProgramsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isActive: query.isActive !== undefined ? query.isActive : true,
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.level && { level: query.level }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.program.findMany({ where, select: PROGRAM_SELECT, skip, take, orderBy: { level: 'asc' } }),
      prisma.program.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  // ─── GET /api/programs/:id ─────────────────────────────────────────────────
  async getProgramById(id: string) {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
        courses: {
          where: { isActive: true },
          select: {
            id: true, code: true, nameAr: true, nameEn: true,
            creditHours: true, semester: true, academicYear: true,
            faculty: { select: { id: true, nameAr: true, nameEn: true, degree: true } },
          },
          orderBy: [{ academicYear: 'asc' }, { semester: 'asc' }],
        },
      },
    });

    if (!program) throw new NotFoundError('Program');
    return program;
  }

  // ─── POST /api/programs ────────────────────────────────────────────────────
  async createProgram(input: CreateProgramInput) {
    const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!dept) throw new NotFoundError('Department');

    return prisma.program.create({
      data: {
        departmentId: input.departmentId,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        level: input.level,
        descriptionAr: input.descriptionAr ?? null,
        descriptionEn: input.descriptionEn ?? null,
        creditHours: input.creditHours ?? null,
        durationYears: input.durationYears ?? null,
      },
      select: PROGRAM_SELECT,
    });
  }

  // ─── PUT /api/programs/:id ─────────────────────────────────────────────────
  async updateProgram(id: string, input: UpdateProgramInput) {
    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Program');

    if (input.departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
      if (!dept) throw new NotFoundError('Department');
    }

    return prisma.program.update({
      where: { id },
      data: {
        ...(input.departmentId !== undefined && { departmentId: input.departmentId }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.level !== undefined && { level: input.level }),
        ...(input.descriptionAr !== undefined && { descriptionAr: input.descriptionAr }),
        ...(input.descriptionEn !== undefined && { descriptionEn: input.descriptionEn }),
        ...(input.creditHours !== undefined && { creditHours: input.creditHours }),
        ...(input.durationYears !== undefined && { durationYears: input.durationYears }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      select: PROGRAM_SELECT,
    });
  }

  // ─── DELETE /api/programs/:id ──────────────────────────────────────────────
  async deleteProgram(id: string): Promise<void> {
    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Program');

    // Soft delete
    await prisma.program.update({ where: { id }, data: { isActive: false } });
  }
}

export const programsService = new ProgramsService();
