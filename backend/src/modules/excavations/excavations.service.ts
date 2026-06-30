import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  CreateSiteInput,
  UpdateSiteInput,
  CreateSeasonInput,
  UpdateSeasonInput,
  CreateFindingInput,
  UpdateFindingInput,
  CreateGalleryImageInput,
  UpdateGalleryImageInput,
  ListSitesQuery,
  ListSeasonsQuery,
  ListFindingsQuery,
  ListGalleryQuery,
} from './excavations.types';

const CACHE_TTL = 5 * 60;
const CACHE_KEY_SITES_LIST = (page = 1) => `excavation-sites:${page}`;
const CACHE_KEY_SITE = (slug: string) => `excavation-site:${slug}`;

export class ExcavationsService {
  // ─── SITES ────────────────────────────────────────────────────────────────

  async listSites(query: ListSitesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isActive: query.isActive,
      ...(query.status && { status: query.status }),
      ...(query.departmentId && { departmentId: query.departmentId }),
    };

    const cacheKey = CACHE_KEY_SITES_LIST(page);
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const [items, total] = await prisma.$transaction([
      prisma.excavationSite.findMany({
        where,
        include: { department: { select: { id: true, nameAr: true, nameEn: true } } },
        skip,
        take,
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.excavationSite.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getSiteBySlug(slug: string) {
    const cached = await redis.get(CACHE_KEY_SITE(slug)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const site = await prisma.excavationSite.findUnique({
      where: { slug },
      include: {
        department: true,
        seasons: { orderBy: { seasonYear: 'desc' } },
        findings: { orderBy: { discoveryYear: 'desc' } },
        gallery: { orderBy: { orderIndex: 'asc' }, take: 20 },
      },
    });

    if (!site) throw new NotFoundError('Excavation site');

    await redis.setex(CACHE_KEY_SITE(slug), CACHE_TTL, JSON.stringify(site)).catch(() => null);
    return site;
  }

  async getSiteById(id: string) {
    const site = await prisma.excavationSite.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!site) throw new NotFoundError('Excavation site');
    return site;
  }

  async createSite(input: CreateSiteInput) {
    const site = await prisma.excavationSite.create({
      data: input,
      include: { department: true },
    });

    await this.invalidateSitesCache();
    return site;
  }

  async updateSite(id: string, input: UpdateSiteInput) {
    const existing = await prisma.excavationSite.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Excavation site');

    const updated = await prisma.excavationSite.update({
      where: { id },
      data: input,
      include: { department: true },
    });

    await this.invalidateSiteCache(existing.slug);
    return updated;
  }

  async deleteSite(id: string): Promise<void> {
    const existing = await prisma.excavationSite.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Excavation site');

    await prisma.excavationSite.delete({ where: { id } });
    await this.invalidateSiteCache(existing.slug);
  }

  // ─── SEASONS ──────────────────────────────────────────────────────────────

  async listSeasons(query: ListSeasonsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await prisma.$transaction([
      prisma.excavationSeason.findMany({
        where: { siteId: query.siteId },
        include: { site: { select: { id: true, nameAr: true, nameEn: true, slug: true } } },
        skip,
        take,
        orderBy: { seasonYear: 'desc' },
      }),
      prisma.excavationSeason.count({ where: { siteId: query.siteId } }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async getSeasonById(id: string) {
    const season = await prisma.excavationSeason.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!season) throw new NotFoundError('Excavation season');
    return season;
  }

  async createSeason(input: CreateSeasonInput) {
    const site = await prisma.excavationSite.findUnique({ where: { id: input.siteId } });
    if (!site) throw new NotFoundError('Excavation site');

    const season = await prisma.excavationSeason.create({
      data: input,
      include: { site: true },
    });

    await this.invalidateSiteCache(site.slug);
    return season;
  }

  async updateSeason(id: string, input: UpdateSeasonInput) {
    const existing = await prisma.excavationSeason.findUnique({
      where: { id },
      include: { site: true },
    });
    if (!existing) throw new NotFoundError('Excavation season');

    const updated = await prisma.excavationSeason.update({
      where: { id },
      data: input,
      include: { site: true },
    });

    await this.invalidateSiteCache(existing.site.slug);
    return updated;
  }

  async deleteSeason(id: string): Promise<void> {
    const existing = await prisma.excavationSeason.findUnique({
      where: { id },
      include: { site: true },
    });
    if (!existing) throw new NotFoundError('Excavation season');

    await prisma.excavationSeason.delete({ where: { id } });
    await this.invalidateSiteCache(existing.site.slug);
  }

  // ─── FINDINGS ─────────────────────────────────────────────────────────────

  async listFindings(query: ListFindingsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await prisma.$transaction([
      prisma.excavationFinding.findMany({
        where: { siteId: query.siteId },
        include: { site: { select: { id: true, nameAr: true, nameEn: true, slug: true } } },
        skip,
        take,
        orderBy: { discoveryYear: 'desc' },
      }),
      prisma.excavationFinding.count({ where: { siteId: query.siteId } }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async getFindingById(id: string) {
    const finding = await prisma.excavationFinding.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!finding) throw new NotFoundError('Excavation finding');
    return finding;
  }

  async createFinding(input: CreateFindingInput) {
    const site = await prisma.excavationSite.findUnique({ where: { id: input.siteId } });
    if (!site) throw new NotFoundError('Excavation site');

    const finding = await prisma.excavationFinding.create({
      data: input,
      include: { site: true },
    });

    await this.invalidateSiteCache(site.slug);
    return finding;
  }

  async updateFinding(id: string, input: UpdateFindingInput) {
    const existing = await prisma.excavationFinding.findUnique({
      where: { id },
      include: { site: true },
    });
    if (!existing) throw new NotFoundError('Excavation finding');

    const updated = await prisma.excavationFinding.update({
      where: { id },
      data: input,
      include: { site: true },
    });

    await this.invalidateSiteCache(existing.site.slug);
    return updated;
  }

  async deleteFinding(id: string): Promise<void> {
    const existing = await prisma.excavationFinding.findUnique({
      where: { id },
      include: { site: true },
    });
    if (!existing) throw new NotFoundError('Excavation finding');

    await prisma.excavationFinding.delete({ where: { id } });
    await this.invalidateSiteCache(existing.site.slug);
  }

  // ─── GALLERY ──────────────────────────────────────────────────────────────

  async listGalleryImages(query: ListGalleryQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await prisma.$transaction([
      prisma.excavationGallery.findMany({
        where: { siteId: query.siteId },
        include: { site: { select: { id: true, nameAr: true, nameEn: true, slug: true } } },
        skip,
        take,
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.excavationGallery.count({ where: { siteId: query.siteId } }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async getGalleryImageById(id: string) {
    const image = await prisma.excavationGallery.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!image) throw new NotFoundError('Gallery image');
    return image;
  }

  async createGalleryImage(input: CreateGalleryImageInput) {
    const site = await prisma.excavationSite.findUnique({ where: { id: input.siteId } });
    if (!site) throw new NotFoundError('Excavation site');

    const image = await prisma.excavationGallery.create({
      data: input,
      include: { site: true },
    });

    await this.invalidateSiteCache(site.slug);
    return image;
  }

  async updateGalleryImage(id: string, input: UpdateGalleryImageInput) {
    const existing = await prisma.excavationGallery.findUnique({
      where: { id },
      include: { site: true },
    });
    if (!existing) throw new NotFoundError('Gallery image');

    const updated = await prisma.excavationGallery.update({
      where: { id },
      data: input,
      include: { site: true },
    });

    await this.invalidateSiteCache(existing.site.slug);
    return updated;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    const existing = await prisma.excavationGallery.findUnique({
      where: { id },
      include: { site: true },
    });
    if (!existing) throw new NotFoundError('Gallery image');

    await prisma.excavationGallery.delete({ where: { id } });
    await this.invalidateSiteCache(existing.site.slug);
  }

  // ─── Cache Invalidation ───────────────────────────────────────────────────

  private async invalidateSiteCache(slug: string) {
    await Promise.all([
      redis.del(CACHE_KEY_SITE(slug)).catch(() => null),
      this.invalidateSitesCache(),
    ]);
  }

  private async invalidateSitesCache() {
    const keys = await redis.keys('excavation-sites:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const excavationsService = new ExcavationsService();
