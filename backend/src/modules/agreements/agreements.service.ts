import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import { CreateAgreementInput, UpdateAgreementInput, ListAgreementsQuery } from './agreements.types';

const CACHE_TTL = 5 * 60;
const CACHE_KEY_LIST = (page = 1) => `agreements:${page}`;
const CACHE_KEY_ONE = (id: string) => `agreement:${id}`;

export class AgreementsService {
  async listAgreements(query: ListAgreementsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isActive: query.isActive,
      ...(query.type && { agreementType: query.type }),
      ...(query.country && { country: query.country }),
    };

    const cacheKey = CACHE_KEY_LIST(page);
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const [items, total] = await prisma.$transaction([
      prisma.internationalAgreement.findMany({
        where,
        skip,
        take,
        orderBy: { signDate: 'desc' },
      }),
      prisma.internationalAgreement.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getAgreementById(id: string) {
    const cached = await redis.get(CACHE_KEY_ONE(id)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const agreement = await prisma.internationalAgreement.findUnique({ where: { id } });
    if (!agreement) throw new NotFoundError('Agreement');

    await redis.setex(CACHE_KEY_ONE(id), CACHE_TTL, JSON.stringify(agreement)).catch(() => null);
    return agreement;
  }

  async createAgreement(input: CreateAgreementInput) {
    const agreement = await prisma.internationalAgreement.create({ data: input });
    await this.invalidateListCache();
    return agreement;
  }

  async updateAgreement(id: string, input: UpdateAgreementInput) {
    const existing = await prisma.internationalAgreement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Agreement');

    const updated = await prisma.internationalAgreement.update({
      where: { id },
      data: input,
    });

    await this.invalidateCache(id);
    return updated;
  }

  async deleteAgreement(id: string): Promise<void> {
    const existing = await prisma.internationalAgreement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Agreement');

    await prisma.internationalAgreement.delete({ where: { id } });
    await this.invalidateCache(id);
  }

  private async invalidateCache(id: string) {
    await Promise.all([
      redis.del(CACHE_KEY_ONE(id)).catch(() => null),
      this.invalidateListCache(),
    ]);
  }

  private async invalidateListCache() {
    const keys = await redis.keys('agreements:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const agreementsService = new AgreementsService();
