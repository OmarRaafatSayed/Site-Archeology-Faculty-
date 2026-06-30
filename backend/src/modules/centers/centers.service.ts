import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import { CreateCenterInput, UpdateCenterInput, ListCentersQuery } from './centers.types';

const CACHE_TTL = 5 * 60;
const CACHE_KEY_LIST = (page = 1) => `centers:${page}`;
const CACHE_KEY_ONE = (slug: string) => `center:${slug}`;

export class CentersService {
  async listCenters(query: ListCentersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = { isActive: query.isActive };

    const cacheKey = CACHE_KEY_LIST(page);
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const [items, total] = await prisma.$transaction([
      prisma.researchCenter.findMany({
        where,
        skip,
        take,
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.researchCenter.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getCenterBySlug(slug: string) {
    const cached = await redis.get(CACHE_KEY_ONE(slug)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const center = await prisma.researchCenter.findUnique({ where: { slug } });
    if (!center) throw new NotFoundError('Research center');

    await redis.setex(CACHE_KEY_ONE(slug), CACHE_TTL, JSON.stringify(center)).catch(() => null);
    return center;
  }

  async getCenterById(id: string) {
    const center = await prisma.researchCenter.findUnique({ where: { id } });
    if (!center) throw new NotFoundError('Research center');
    return center;
  }

  async createCenter(input: CreateCenterInput) {
    const center = await prisma.researchCenter.create({ data: input });
    await this.invalidateListCache();
    return center;
  }

  async updateCenter(id: string, input: UpdateCenterInput) {
    const existing = await prisma.researchCenter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Research center');

    const updated = await prisma.researchCenter.update({
      where: { id },
      data: input,
    });

    await this.invalidateCache(existing.slug);
    return updated;
  }

  async deleteCenter(id: string): Promise<void> {
    const existing = await prisma.researchCenter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Research center');

    await prisma.researchCenter.delete({ where: { id } });
    await this.invalidateCache(existing.slug);
  }

  private async invalidateCache(slug: string) {
    await Promise.all([
      redis.del(CACHE_KEY_ONE(slug)).catch(() => null),
      this.invalidateListCache(),
    ]);
  }

  private async invalidateListCache() {
    const keys = await redis.keys('centers:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const centersService = new CentersService();
