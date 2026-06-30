import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { SearchQuery, SearchResult, SearchResponse, SearchType } from './search.types';

const CACHE_TTL = 10 * 60; // 10 minutes
const cacheKey  = (q: string, type: string, page: number) =>
  `search:${type}:${page}:${encodeURIComponent(q)}`;

export class SearchService {
  /**
   * GET /api/search
   * Unified search using ILIKE — works with Arabic & English without
   * requiring PostgreSQL full-text dictionaries (arabic config not installed by default).
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const { q, type, page, limit } = query;
    const offset = (page - 1) * limit;

    // Cache check
    const key = cacheKey(q, type, page);
    const cached = await redis.get(key).catch(() => null);
    if (cached) return JSON.parse(cached);

    const pattern = `%${q}%`;
    const results: SearchResult[] = [];

    const searches: Array<Promise<SearchResult[]>> = [];

    if (type === 'all' || type === 'news')        searches.push(this.searchNews(pattern, limit));
    if (type === 'all' || type === 'faculty')     searches.push(this.searchFaculty(pattern, limit));
    if (type === 'all' || type === 'publication') searches.push(this.searchPublications(pattern, limit));
    if (type === 'all' || type === 'course')      searches.push(this.searchCourses(pattern, limit));
    if (type === 'all' || type === 'library')     searches.push(this.searchLibrary(pattern, limit));
    if (type === 'all' || type === 'conference')  searches.push(this.searchConferences(pattern, limit));

    const allResults = (await Promise.all(searches)).flat();

    // Sort by rank desc
    allResults.sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));

    // Pagination
    const paginated = allResults.slice(offset, offset + limit);
    const total = allResults.length;

    // Count by type
    const byType: Partial<Record<SearchType, number>> = {};
    for (const r of allResults) {
      byType[r.type] = (byType[r.type] ?? 0) + 1;
    }

    const response: SearchResponse = { query: q, total, results: paginated, byType };

    await redis.setex(key, CACHE_TTL, JSON.stringify(response)).catch(() => null);

    return response;
  }

  // ─── News ────────────────────────────────────────────────────────────────
  private async searchNews(pattern: string, limit: number): Promise<SearchResult[]> {
    const rows = await prisma.news.findMany({
      where: {
        isPublished: true,
        OR: [
          { titleAr: { contains: pattern.slice(1, -1), mode: 'insensitive' } },
          { titleEn: { contains: pattern.slice(1, -1), mode: 'insensitive' } },
          { bodyAr:  { contains: pattern.slice(1, -1), mode: 'insensitive' } },
        ],
      },
      select: { id: true, titleAr: true, titleEn: true, bodyAr: true },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      type: 'news' as SearchType,
      titleAr: r.titleAr,
      titleEn: r.titleEn,
      excerpt: r.bodyAr ? r.bodyAr.slice(0, 200) : null,
      url: `/news/${r.id}`,
      rank: 1,
    }));
  }

  // ─── Faculty ─────────────────────────────────────────────────────────────
  private async searchFaculty(pattern: string, limit: number): Promise<SearchResult[]> {
    const q = pattern.slice(1, -1);
    const rows = await prisma.facultyMember.findMany({
      where: {
        isActive: true,
        OR: [
          { nameAr: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { bioAr:  { contains: q, mode: 'insensitive' } },
          { specializationAr: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, nameAr: true, nameEn: true, specializationAr: true },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      type: 'faculty' as SearchType,
      titleAr: r.nameAr,
      titleEn: r.nameEn,
      excerpt: r.specializationAr,
      url: `/faculty/${r.id}`,
      rank: 1,
    }));
  }

  // ─── Publications ─────────────────────────────────────────────────────────
  private async searchPublications(pattern: string, limit: number): Promise<SearchResult[]> {
    const q = pattern.slice(1, -1);
    const rows = await prisma.publication.findMany({
      where: {
        isPublished: true,
        OR: [
          { titleAr:    { contains: q, mode: 'insensitive' } },
          { titleEn:    { contains: q, mode: 'insensitive' } },
          { abstractAr: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, titleAr: true, titleEn: true, abstractAr: true },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      type: 'publication' as SearchType,
      titleAr: r.titleAr,
      titleEn: r.titleEn,
      excerpt: r.abstractAr ? r.abstractAr.slice(0, 200) : null,
      url: `/publications/${r.id}`,
      rank: 1,
    }));
  }

  // ─── Courses ──────────────────────────────────────────────────────────────
  private async searchCourses(pattern: string, limit: number): Promise<SearchResult[]> {
    const q = pattern.slice(1, -1);
    const rows = await prisma.course.findMany({
      where: {
        isActive: true,
        OR: [
          { nameAr: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { descriptionAr: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, nameAr: true, nameEn: true, descriptionAr: true },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      type: 'course' as SearchType,
      titleAr: r.nameAr,
      titleEn: r.nameEn,
      excerpt: r.descriptionAr ? r.descriptionAr.slice(0, 200) : null,
      url: `/courses/${r.id}`,
      rank: 0.9,
    }));
  }

  // ─── Library ──────────────────────────────────────────────────────────────
  private async searchLibrary(pattern: string, limit: number): Promise<SearchResult[]> {
    const q = pattern.slice(1, -1);
    const rows = await prisma.libraryBook.findMany({
      where: {
        OR: [
          { titleAr:  { contains: q, mode: 'insensitive' } },
          { titleEn:  { contains: q, mode: 'insensitive' } },
          { authorAr: { contains: q, mode: 'insensitive' } },
          { authorEn: { contains: q, mode: 'insensitive' } },
          { isbn:     { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, titleAr: true, titleEn: true, authorAr: true },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      type: 'library' as SearchType,
      titleAr: r.titleAr,
      titleEn: r.titleEn,
      excerpt: r.authorAr ? `المؤلف: ${r.authorAr}` : null,
      url: `/library/${r.id}`,
      rank: 0.8,
    }));
  }

  // ─── Conferences ──────────────────────────────────────────────────────────
  private async searchConferences(pattern: string, limit: number): Promise<SearchResult[]> {
    const q = pattern.slice(1, -1);
    const rows = await prisma.conference.findMany({
      where: {
        OR: [
          { titleAr: { contains: q, mode: 'insensitive' } },
          { titleEn: { contains: q, mode: 'insensitive' } },
          { themeAr: { contains: q, mode: 'insensitive' } },
          { themeEn: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, titleAr: true, titleEn: true, themeAr: true },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      type: 'conference' as SearchType,
      titleAr: r.titleAr,
      titleEn: r.titleEn,
      excerpt: r.themeAr,
      url: `/conferences/${r.slug}`,
      rank: 0.9,
    }));
  }
}

export const searchService = new SearchService();
