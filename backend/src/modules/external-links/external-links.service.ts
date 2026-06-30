import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import { CreateLinkInput, UpdateLinkInput, ListLinksQuery } from './external-links.types';

const CACHE_TTL = 5 * 60;
const CACHE_KEY_LIST = (cat?: string, page = 1) => `external-links:${cat ?? 'all'}:${page}`;
const CACHE_KEY_ONE = (id: string) => `external-link:${id}`;

export class ExternalLinksService {
  async listLinks(query: ListLinksQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isActive: query.isActive,
      ...(query.category && { category: query.category }),
    };

    const cacheKey = CACHE_KEY_LIST(query.category, page);
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const [items, total] = await prisma.$transaction([
      prisma.externalLink.findMany({
        where,
        skip,
        take,
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.externalLink.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getLinkById(id: string) {
    const cached = await redis.get(CACHE_KEY_ONE(id)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const link = await prisma.externalLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundError('External link');

    await redis.setex(CACHE_KEY_ONE(id), CACHE_TTL, JSON.stringify(link)).catch(() => null);
    return link;
  }

  async createLink(input: CreateLinkInput) {
    const link = await prisma.externalLink.create({ data: input });
    await this.invalidateListCache();
    return link;
  }

  async updateLink(id: string, input: UpdateLinkInput) {
    const existing = await prisma.externalLink.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('External link');

    const updated = await prisma.externalLink.update({
      where: { id },
      data: input,
    });

    await this.invalidateCache(id);
    return updated;
  }

  async deleteLink(id: string): Promise<void> {
    const existing = await prisma.externalLink.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('External link');

    await prisma.externalLink.delete({ where: { id } });
    await this.invalidateCache(id);
  }

  private async invalidateCache(id: string) {
    await Promise.all([
      redis.del(CACHE_KEY_ONE(id)).catch(() => null),
      this.invalidateListCache(),
    ]);
  }

  private async invalidateListCache() {
    const keys = await redis.keys('external-links:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const externalLinksService = new ExternalLinksService();
