import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  CreatePublicationInput,
  UpdatePublicationInput,
  ListPublicationsQuery,
} from './publications.types';
import { UserRole } from '@prisma/client';

const PUB_SELECT = {
  id: true,
  titleAr: true,
  titleEn: true,
  abstractAr: true,
  abstractEn: true,
  journalName: true,
  publishYear: true,
  doi: true,
  fileUrl: true,
  isPublished: true,
  createdAt: true,
  faculty: {
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      degree: true,
      photoUrl: true,
      department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
    },
  },
} as const;

export class PublicationsService {

  // ─── GET /api/publications ────────────────────────────────────────────────
  async listPublications(query: ListPublicationsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isPublished: query.isPublished,
      ...(query.facultyId && { facultyId: query.facultyId }),
      ...(query.year && { publishYear: query.year }),
      ...(query.departmentId && {
        faculty: { departmentId: query.departmentId },
      }),
      ...(query.search && {
        OR: [
          { titleAr: { contains: query.search, mode: 'insensitive' as const } },
          { titleEn: { contains: query.search, mode: 'insensitive' as const } },
          { journalName: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.publication.findMany({
        where,
        select: PUB_SELECT,
        skip,
        take,
        orderBy: { publishYear: 'desc' },
      }),
      prisma.publication.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  // ─── GET /api/publications/:id ────────────────────────────────────────────
  async getPublicationById(id: string) {
    const pub = await prisma.publication.findUnique({
      where: { id },
      include: {
        faculty: {
          include: {
            department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
          },
        },
      },
    });

    if (!pub) throw new NotFoundError('Publication');
    return pub;
  }

  // ─── POST /api/publications ───────────────────────────────────────────────
  // المحاضر يُضيف بحثه، الـ Admin يُضيف لأي عضو
  async createPublication(
    input: CreatePublicationInput,
    requesterId: string,
    requesterRole: UserRole,
    targetFacultyId?: string,
  ) {
    let facultyId: string;

    if (requesterRole === UserRole.admin && targetFacultyId) {
      // Admin يحدد الـ facultyId يدوياً
      const fm = await prisma.facultyMember.findUnique({ where: { id: targetFacultyId } });
      if (!fm) throw new NotFoundError('Faculty member');
      facultyId = targetFacultyId;
    } else {
      // المحاضر — نجيب الـ facultyMember من الـ userId
      const fm = await prisma.facultyMember.findFirst({ where: { userId: requesterId } });
      if (!fm) throw new NotFoundError('Faculty profile — not linked to a faculty member');
      facultyId = fm.id;
    }

    return prisma.publication.create({
      data: {
        facultyId,
        titleAr: input.titleAr,
        titleEn: input.titleEn ?? null,
        abstractAr: input.abstractAr ?? null,
        abstractEn: input.abstractEn ?? null,
        journalName: input.journalName ?? null,
        publishYear: input.publishYear ?? null,
        doi: input.doi ?? null,
        fileUrl: input.fileUrl ?? null,
        isPublished: input.isPublished,
      },
      select: PUB_SELECT,
    });
  }

  // ─── PUT /api/publications/:id ────────────────────────────────────────────
  async updatePublication(
    id: string,
    input: UpdatePublicationInput,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    const pub = await prisma.publication.findUnique({
      where: { id },
      include: { faculty: true },
    });
    if (!pub) throw new NotFoundError('Publication');

    // Admin أو صاحب البحث فقط
    if (
      requesterRole !== UserRole.admin &&
      pub.faculty.userId !== requesterId
    ) {
      throw new ForbiddenError('You can only edit your own publications');
    }

    return prisma.publication.update({
      where: { id },
      data: {
        ...(input.titleAr !== undefined && { titleAr: input.titleAr }),
        ...(input.titleEn !== undefined && { titleEn: input.titleEn }),
        ...(input.abstractAr !== undefined && { abstractAr: input.abstractAr }),
        ...(input.abstractEn !== undefined && { abstractEn: input.abstractEn }),
        ...(input.journalName !== undefined && { journalName: input.journalName }),
        ...(input.publishYear !== undefined && { publishYear: input.publishYear }),
        ...(input.doi !== undefined && { doi: input.doi }),
        ...(input.fileUrl !== undefined && { fileUrl: input.fileUrl }),
        ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
      },
      select: PUB_SELECT,
    });
  }

  // ─── DELETE /api/publications/:id ─────────────────────────────────────────
  async deletePublication(id: string, requesterId: string, requesterRole: UserRole): Promise<void> {
    const pub = await prisma.publication.findUnique({
      where: { id },
      include: { faculty: true },
    });
    if (!pub) throw new NotFoundError('Publication');

    if (
      requesterRole !== UserRole.admin &&
      pub.faculty.userId !== requesterId
    ) {
      throw new ForbiddenError('You can only delete your own publications');
    }

    await prisma.publication.delete({ where: { id } });
  }
}

export const publicationsService = new PublicationsService();
