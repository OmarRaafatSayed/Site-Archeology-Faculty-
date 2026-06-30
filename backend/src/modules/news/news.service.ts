import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import { CreateNewsInput, UpdateNewsInput, ListNewsQuery } from './news.types';
import { UserRole } from '@prisma/client';

const CACHE_TTL_LIST = 5 * 60;   // 5 دقائق — من SRS 6.2
const CACHE_KEY_LIST  = (cat?: string, page = 1) => `news:list:${cat ?? 'all'}:${page}`;
const CACHE_KEY_ONE   = (id: string) => `news:${id}`;

const NEWS_SELECT_PUBLIC = {
  id: true,
  titleAr: true,
  titleEn: true,
  bodyAr: true,
  bodyEn: true,
  coverImage: true,
  category: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  author: { select: { id: true, email: true } },
} as const;

export class NewsService {

  // ─── GET /api/news ────────────────────────────────────────────────────────
  async listNews(query: ListNewsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    // Admins/CMs يمكنهم رؤية المسودات (published=false)
    const where = {
      isPublished: query.published,
      ...(query.category && { category: query.category }),
      ...(query.search && {
        OR: [
          { titleAr: { contains: query.search, mode: 'insensitive' as const } },
          { titleEn: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const cacheKey = CACHE_KEY_LIST(query.category, page);
    if (query.published) { // cache فقط للمنشور
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return JSON.parse(cached);
    }

    const [items, total] = await prisma.$transaction([
      prisma.news.findMany({
        where,
        select: NEWS_SELECT_PUBLIC,
        skip,
        take,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.news.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);

    if (query.published) {
      await redis.setex(cacheKey, CACHE_TTL_LIST, JSON.stringify(result)).catch(() => null);
    }

    return result;
  }

  // ─── GET /api/news/:id ────────────────────────────────────────────────────
  async getNewsById(id: string, isPublicView = true) {
    const cached = await redis.get(CACHE_KEY_ONE(id)).catch(() => null);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (isPublicView && !parsed.isPublished) throw new NotFoundError('News article');
      return parsed;
    }

    const news = await prisma.news.findUnique({
      where: { id },
      include: { author: { select: { id: true, email: true } } },
    });

    if (!news) throw new NotFoundError('News article');
    if (isPublicView && !news.isPublished) throw new NotFoundError('News article');

    await redis.setex(CACHE_KEY_ONE(id), CACHE_TTL_LIST, JSON.stringify(news)).catch(() => null);
    return news;
  }

  // ─── POST /api/news ───────────────────────────────────────────────────────
  async createNews(input: CreateNewsInput, authorId: string) {
    const news = await prisma.news.create({
      data: {
        titleAr: input.titleAr,
        titleEn: input.titleEn ?? null,
        bodyAr: input.bodyAr,
        bodyEn: input.bodyEn ?? null,
        category: input.category,
        coverImage: input.coverImage ?? null,
        authorId,
        isPublished: false,
      },
      include: { author: { select: { id: true, email: true } } },
    });

    await this.invalidateListCache();
    return news;
  }

  // ─── PUT /api/news/:id ────────────────────────────────────────────────────
  async updateNews(id: string, input: UpdateNewsInput, requesterId: string, requesterRole: UserRole) {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('News article');

    // صاحب الخبر أو Admin/CM فقط
    if (
      existing.authorId !== requesterId &&
      requesterRole !== UserRole.admin &&
      requesterRole !== UserRole.content_manager
    ) {
      throw new ForbiddenError('You can only edit your own news articles');
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        ...(input.titleAr !== undefined && { titleAr: input.titleAr }),
        ...(input.titleEn !== undefined && { titleEn: input.titleEn }),
        ...(input.bodyAr !== undefined && { bodyAr: input.bodyAr }),
        ...(input.bodyEn !== undefined && { bodyEn: input.bodyEn }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
      },
      include: { author: { select: { id: true, email: true } } },
    });

    await this.invalidateCache(id);
    return updated;
  }

  // ─── DELETE /api/news/:id ─────────────────────────────────────────────────
  async deleteNews(id: string, requesterId: string, requesterRole: UserRole): Promise<void> {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('News article');

    if (
      existing.authorId !== requesterId &&
      requesterRole !== UserRole.admin &&
      requesterRole !== UserRole.content_manager
    ) {
      throw new ForbiddenError('You can only delete your own news articles');
    }

    await prisma.news.delete({ where: { id } });
    await this.invalidateCache(id);
  }

  // ─── PUT /api/news/:id/publish ────────────────────────────────────────────
  async togglePublish(id: string, publish: boolean): Promise<void> {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('News article');

    await prisma.news.update({
      where: { id },
      data: {
        isPublished: publish,
        publishedAt: publish ? (existing.publishedAt ?? new Date()) : null,
      },
    });

    await this.invalidateCache(id);
  }

  private async invalidateCache(id: string) {
    await Promise.all([
      redis.del(CACHE_KEY_ONE(id)).catch(() => null),
      this.invalidateListCache(),
    ]);
  }

  private async invalidateListCache() {
    // نحذف كل الـ cached lists بـ pattern scan
    const keys = await redis.keys('news:list:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const newsService = new NewsService();
