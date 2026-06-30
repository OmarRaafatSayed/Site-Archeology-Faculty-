import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { UpdatePageInput } from './pages.types';

const CACHE_TTL = 24 * 60 * 60;          // 24 ساعة — من SRS 6.2 (صفحات ثابتة)
const cacheKey = (slug: string) => `page:${slug}`;

export class PagesService {

  // ─── GET /api/pages/:slug ─────────────────────────────────────────────────
  async getPage(slug: string) {
    const cached = await redis.get(cacheKey(slug)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const page = await prisma.page.findUnique({
      where: { slug },
      include: { updatedByUser: { select: { id: true, email: true } } },
    });

    if (!page) throw new NotFoundError('Page');

    await redis.setex(cacheKey(slug), CACHE_TTL, JSON.stringify(page)).catch(() => null);
    return page;
  }

  // ─── PUT /api/pages/:slug (Admin) ─────────────────────────────────────────
  async updatePage(slug: string, input: UpdatePageInput, updatedById: string) {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (!existing) throw new NotFoundError('Page');

    const updated = await prisma.page.update({
      where: { slug },
      data: {
        ...(input.titleAr !== undefined && { titleAr: input.titleAr }),
        ...(input.titleEn !== undefined && { titleEn: input.titleEn }),
        ...(input.contentAr !== undefined && { contentAr: input.contentAr }),
        ...(input.contentEn !== undefined && { contentEn: input.contentEn }),
        ...(input.metaDescriptionAr !== undefined && { metaDescriptionAr: input.metaDescriptionAr }),
        ...(input.metaDescriptionEn !== undefined && { metaDescriptionEn: input.metaDescriptionEn }),
        updatedBy: updatedById,
      },
      include: { updatedByUser: { select: { id: true, email: true } } },
    });

    // Invalidate cache — الصفحة الثابتة محدثة
    await redis.del(cacheKey(slug)).catch(() => null);
    return updated;
  }

  // ─── GET /api/pages — قائمة الصفحات الثابتة (Admin) ─────────────────────
  async listPages() {
    return prisma.page.findMany({
      select: {
        slug: true,
        titleAr: true,
        titleEn: true,
        updatedAt: true,
        updatedByUser: { select: { email: true } },
      },
      orderBy: { slug: 'asc' },
    });
  }
}

export const pagesService = new PagesService();
