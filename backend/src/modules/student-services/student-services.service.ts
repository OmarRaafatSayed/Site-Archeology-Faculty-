import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  CreateServiceInput,
  UpdateServiceInput,
  CreateEventInput,
  UpdateEventInput,
  ListServicesQuery,
  ListEventsQuery,
} from './student-services.types';

const CACHE_TTL = 5 * 60;
const CACHE_KEY_SERVICES_LIST = (cat?: string, page = 1) => `student-services:${cat ?? 'all'}:${page}`;
const CACHE_KEY_SERVICE = (id: string) => `student-service:${id}`;
const CACHE_KEY_EVENTS_LIST = (page = 1) => `student-events:${page}`;
const CACHE_KEY_EVENT = (id: string) => `student-event:${id}`;

export class StudentServicesService {
  // ─── SERVICES ─────────────────────────────────────────────────────────────

  async listServices(query: ListServicesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isActive: query.isActive,
      ...(query.category && { category: query.category }),
    };

    const cacheKey = CACHE_KEY_SERVICES_LIST(query.category, page);
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const [items, total] = await prisma.$transaction([
      prisma.studentService.findMany({
        where,
        skip,
        take,
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.studentService.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getServiceById(id: string) {
    const cached = await redis.get(CACHE_KEY_SERVICE(id)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const service = await prisma.studentService.findUnique({ where: { id } });
    if (!service) throw new NotFoundError('Student service');

    await redis.setex(CACHE_KEY_SERVICE(id), CACHE_TTL, JSON.stringify(service)).catch(() => null);
    return service;
  }

  async createService(input: CreateServiceInput) {
    const service = await prisma.studentService.create({ data: input });
    await this.invalidateServicesCache();
    return service;
  }

  async updateService(id: string, input: UpdateServiceInput) {
    const existing = await prisma.studentService.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Student service');

    const updated = await prisma.studentService.update({
      where: { id },
      data: input,
    });

    await this.invalidateServiceCache(id);
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    const existing = await prisma.studentService.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Student service');

    await prisma.studentService.delete({ where: { id } });
    await this.invalidateServiceCache(id);
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  async listEvents(query: ListEventsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      isPublished: query.published,
      ...(query.upcoming && { eventDate: { gte: new Date() } }),
    };

    const cacheKey = CACHE_KEY_EVENTS_LIST(page);
    if (query.published) {
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return JSON.parse(cached);
    }

    const [items, total] = await prisma.$transaction([
      prisma.studentEvent.findMany({
        where,
        skip,
        take,
        orderBy: { eventDate: 'desc' },
      }),
      prisma.studentEvent.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);

    if (query.published) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    }

    return result;
  }

  async getEventById(id: string, isPublicView = true) {
    const cached = await redis.get(CACHE_KEY_EVENT(id)).catch(() => null);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (isPublicView && !parsed.isPublished) throw new NotFoundError('Student event');
      return parsed;
    }

    const event = await prisma.studentEvent.findUnique({ where: { id } });

    if (!event) throw new NotFoundError('Student event');
    if (isPublicView && !event.isPublished) throw new NotFoundError('Student event');

    await redis.setex(CACHE_KEY_EVENT(id), CACHE_TTL, JSON.stringify(event)).catch(() => null);
    return event;
  }

  async createEvent(input: CreateEventInput) {
    const event = await prisma.studentEvent.create({ data: input });
    await this.invalidateEventsCache();
    return event;
  }

  async updateEvent(id: string, input: UpdateEventInput) {
    const existing = await prisma.studentEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Student event');

    const updated = await prisma.studentEvent.update({
      where: { id },
      data: input,
    });

    await this.invalidateEventCache(id);
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    const existing = await prisma.studentEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Student event');

    await prisma.studentEvent.delete({ where: { id } });
    await this.invalidateEventCache(id);
  }

  async toggleEventPublish(id: string, publish: boolean): Promise<void> {
    const existing = await prisma.studentEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Student event');

    await prisma.studentEvent.update({
      where: { id },
      data: { isPublished: publish },
    });

    await this.invalidateEventCache(id);
  }

  // ─── Cache Invalidation ───────────────────────────────────────────────────

  private async invalidateServiceCache(id: string) {
    await Promise.all([
      redis.del(CACHE_KEY_SERVICE(id)).catch(() => null),
      this.invalidateServicesCache(),
    ]);
  }

  private async invalidateServicesCache() {
    const keys = await redis.keys('student-services:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }

  private async invalidateEventCache(id: string) {
    await Promise.all([
      redis.del(CACHE_KEY_EVENT(id)).catch(() => null),
      this.invalidateEventsCache(),
    ]);
  }

  private async invalidateEventsCache() {
    const keys = await redis.keys('student-events:*').catch(() => [] as string[]);
    if (keys.length > 0) await redis.del(...keys).catch(() => null);
  }
}

export const studentServicesService = new StudentServicesService();
