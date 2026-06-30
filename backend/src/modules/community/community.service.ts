import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import { CreateProjectInput, UpdateProjectInput, ListProjectsQuery } from './community.types';

const CACHE_TTL = 5 * 60;
const CACHE_KEY_LIST = (page = 1) => `community-projects:${page}`;
const CACHE_KEY_ONE = (id: string) => `community-project:${id}`;

export class CommunityService {
  async listProjects(query: ListProjectsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isPublished: query.published,
      ...(query.status && { status: query.status }),
    };

    const cacheKey = CACHE_KEY_LIST(page);
    if (query.published) {
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return JSON.parse(cached);
    }

    const [items, total] = await prisma.$transaction([
      prisma.communityProject.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'desc' },
      }),
      prisma.communityProject.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);

    if (query.published) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    }

    return result;
  }

  async getProjectById(id: string, isPublicView = true) {
    const cached = await redis.get(CACHE_KEY_ONE(id)).catch(() => null);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (isPublicView && !parsed.isPublished) throw new NotFoundError('Community project');
      return parsed;
    }

    const project = await prisma.communityProject.findUnique({ where: { id } });

    if (!project) throw new NotFoundError('Community project');
    if (isPublicView && !project.isPublished) throw new NotFoundError('Community project');

    await redis.setex(CACHE_KEY_ONE(id), CACHE_TTL, JSON.stringify(project)).catch(() => null);
    return project;
  }

  async createProject(input: CreateProjectInput) {
    const project = await prisma.communityProject.create({ data: input });
    await this.invalidateListCache();
    return project;
  }

  async updateProject(id: string, input: UpdateProjectInput) {
    const existing = await prisma.communityProject.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Community project');

    const updated = await prisma.communityProject.update({
      where: { id },
      data: input,
    });

    await this.invalidateCache(id);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    const existing = await prisma.communityProject.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Community project');

    await prisma.communityProject.delete({ where: { id } });
    await this.invalidateCache(id);
  }

  async togglePublish(id: string, publish: boolean): Promise<void> {
    const existing = await prisma.communityProject.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Community project');

    await prisma.communityProject.update({
      where: { id },
      data: { isPublished: publish },
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
    const keys = await redis.keys('community-projects:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const communityService = new CommunityService();
