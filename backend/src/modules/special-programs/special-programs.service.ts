import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import { CreateProgramInput, UpdateProgramInput, ListProgramsQuery } from './special-programs.types';

const CACHE_TTL = 5 * 60;
const CACHE_KEY_LIST = (page = 1) => `special-programs:${page}`;
const CACHE_KEY_ONE = (slug: string) => `special-program:${slug}`;

export class SpecialProgramsService {
  async listPrograms(query: ListProgramsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = { isActive: query.isActive };

    const cacheKey = CACHE_KEY_LIST(page);
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const [items, total] = await prisma.$transaction([
      prisma.specialProgram.findMany({
        where,
        skip,
        take,
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.specialProgram.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getProgramBySlug(slug: string) {
    const cached = await redis.get(CACHE_KEY_ONE(slug)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const program = await prisma.specialProgram.findUnique({ where: { slug } });
    if (!program) throw new NotFoundError('Special program');

    await redis.setex(CACHE_KEY_ONE(slug), CACHE_TTL, JSON.stringify(program)).catch(() => null);
    return program;
  }

  async getProgramById(id: string) {
    const program = await prisma.specialProgram.findUnique({ where: { id } });
    if (!program) throw new NotFoundError('Special program');
    return program;
  }

  async createProgram(input: CreateProgramInput) {
    const program = await prisma.specialProgram.create({ data: input });
    await this.invalidateListCache();
    return program;
  }

  async updateProgram(id: string, input: UpdateProgramInput) {
    const existing = await prisma.specialProgram.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Special program');

    const updated = await prisma.specialProgram.update({
      where: { id },
      data: input,
    });

    await this.invalidateCache(existing.slug);
    return updated;
  }

  async deleteProgram(id: string): Promise<void> {
    const existing = await prisma.specialProgram.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Special program');

    await prisma.specialProgram.delete({ where: { id } });
    await this.invalidateCache(existing.slug);
  }

  private async invalidateCache(slug: string) {
    await Promise.all([
      redis.del(CACHE_KEY_ONE(slug)).catch(() => null),
      this.invalidateListCache(),
    ]);
  }

  private async invalidateListCache() {
    const keys = await redis.keys('special-programs:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const specialProgramsService = new SpecialProgramsService();
