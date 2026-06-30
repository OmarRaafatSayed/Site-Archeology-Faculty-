import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  CreateBoardMemberInput,
  UpdateBoardMemberInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  ListBoardMembersQuery,
  ListDocumentsQuery,
} from './quality.types';

const CACHE_TTL = 5 * 60;
const CACHE_KEY_MEMBERS_LIST = (page = 1) => `quality:members:${page}`;
const CACHE_KEY_MEMBER = (id: string) => `quality:member:${id}`;
const CACHE_KEY_DOCS_LIST = (type?: string, page = 1) => `quality:docs:${type ?? 'all'}:${page}`;
const CACHE_KEY_DOC = (id: string) => `quality:doc:${id}`;

export class QualityService {
  // ─── BOARD MEMBERS ────────────────────────────────────────────────────────

  async listBoardMembers(query: ListBoardMembersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isActive: query.isActive,
    };

    const cacheKey = CACHE_KEY_MEMBERS_LIST(page);
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const [items, total] = await prisma.$transaction([
      prisma.qualityBoardMember.findMany({
        where,
        include: { faculty: { select: { id: true, nameAr: true, nameEn: true } } },
        skip,
        take,
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.qualityBoardMember.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getBoardMemberById(id: string) {
    const cached = await redis.get(CACHE_KEY_MEMBER(id)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const member = await prisma.qualityBoardMember.findUnique({
      where: { id },
      include: { faculty: true },
    });

    if (!member) throw new NotFoundError('Quality board member');

    await redis.setex(CACHE_KEY_MEMBER(id), CACHE_TTL, JSON.stringify(member)).catch(() => null);
    return member;
  }

  async createBoardMember(input: CreateBoardMemberInput) {
    const member = await prisma.qualityBoardMember.create({
      data: input,
      include: { faculty: true },
    });

    await this.invalidateMembersCache();
    return member;
  }

  async updateBoardMember(id: string, input: UpdateBoardMemberInput) {
    const existing = await prisma.qualityBoardMember.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Quality board member');

    const updated = await prisma.qualityBoardMember.update({
      where: { id },
      data: input,
      include: { faculty: true },
    });

    await this.invalidateMemberCache(id);
    return updated;
  }

  async deleteBoardMember(id: string): Promise<void> {
    const existing = await prisma.qualityBoardMember.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Quality board member');

    await prisma.qualityBoardMember.delete({ where: { id } });
    await this.invalidateMemberCache(id);
  }

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────

  async listDocuments(query: ListDocumentsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isPublished: query.published,
      ...(query.type && { documentType: query.type }),
      ...(query.year && { publishYear: query.year }),
    };

    const cacheKey = CACHE_KEY_DOCS_LIST(query.type, page);
    if (query.published) {
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return JSON.parse(cached);
    }

    const [items, total] = await prisma.$transaction([
      prisma.qualityDocument.findMany({
        where,
        skip,
        take,
        orderBy: [{ publishYear: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.qualityDocument.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);

    if (query.published) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    }

    return result;
  }

  async getDocumentById(id: string, isPublicView = true) {
    const cached = await redis.get(CACHE_KEY_DOC(id)).catch(() => null);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (isPublicView && !parsed.isPublished) throw new NotFoundError('Quality document');
      return parsed;
    }

    const doc = await prisma.qualityDocument.findUnique({ where: { id } });

    if (!doc) throw new NotFoundError('Quality document');
    if (isPublicView && !doc.isPublished) throw new NotFoundError('Quality document');

    await redis.setex(CACHE_KEY_DOC(id), CACHE_TTL, JSON.stringify(doc)).catch(() => null);
    return doc;
  }

  async createDocument(input: CreateDocumentInput) {
    const doc = await prisma.qualityDocument.create({ data: input });
    await this.invalidateDocsCache();
    return doc;
  }

  async updateDocument(id: string, input: UpdateDocumentInput) {
    const existing = await prisma.qualityDocument.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Quality document');

    const updated = await prisma.qualityDocument.update({
      where: { id },
      data: input,
    });

    await this.invalidateDocCache(id);
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    const existing = await prisma.qualityDocument.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Quality document');

    await prisma.qualityDocument.delete({ where: { id } });
    await this.invalidateDocCache(id);
  }

  async toggleDocumentPublish(id: string, publish: boolean): Promise<void> {
    const existing = await prisma.qualityDocument.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Quality document');

    await prisma.qualityDocument.update({
      where: { id },
      data: { isPublished: publish },
    });

    await this.invalidateDocCache(id);
  }

  // ─── Cache Invalidation ───────────────────────────────────────────────────

  private async invalidateMemberCache(id: string) {
    await Promise.all([
      redis.del(CACHE_KEY_MEMBER(id)).catch(() => null),
      this.invalidateMembersCache(),
    ]);
  }

  private async invalidateMembersCache() {
    const keys = await redis.keys('quality:members:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }

  private async invalidateDocCache(id: string) {
    await Promise.all([
      redis.del(CACHE_KEY_DOC(id)).catch(() => null),
      this.invalidateDocsCache(),
    ]);
  }

  private async invalidateDocsCache() {
    const keys = await redis.keys('quality:docs:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const qualityService = new QualityService();
