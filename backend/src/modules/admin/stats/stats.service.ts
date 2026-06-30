import { prisma } from '../../../config/database';
import { parsePagination, buildPaginatedResponse } from '../../../shared/utils/pagination';
import { z } from 'zod';

export const auditLogsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type AuditLogsQuery = z.infer<typeof auditLogsQuerySchema>;

export class StatsService {

  /**
   * GET /api/admin/dashboard-stats
   * إحصائيات عامة للـ Dashboard
   */
  async getDashboardStats() {
    const [
      totalStudents,
      activeStudents,
      totalFaculty,
      activeFaculty,
      totalCourses,
      publishedNews,
      pendingRegistrations,
      upcomingConferences,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'active' } }),
      prisma.facultyMember.count(),
      prisma.facultyMember.count({ where: { isActive: true } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.news.count({ where: { isPublished: true } }),
      prisma.conferenceRegistration.count({ where: { status: 'pending' } }),
      prisma.conference.count({ where: { status: 'upcoming' } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, role: true } } },
      }),
    ]);

    // آخر 5 أخبار منشورة
    const latestNews = await prisma.news.findMany({
      where: { isPublished: true },
      select: { id: true, titleAr: true, titleEn: true, publishedAt: true, category: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    // إحصائيات النتائج غير المنشورة
    const unpublishedResults = await prisma.examResult.count({ where: { isPublished: false } });

    // إحصائيات المكتبة
    const totalBooks = await prisma.libraryBook.count();

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
      },
      faculty: {
        total: totalFaculty,
        active: activeFaculty,
        inactive: totalFaculty - activeFaculty,
      },
      academic: {
        activeCourses: totalCourses,
        unpublishedResults,
      },
      content: {
        publishedNews,
        totalLibraryBooks: totalBooks,
      },
      conferences: {
        upcoming: upcomingConferences,
        pendingRegistrations,
      },
      recentActivity: recentAuditLogs,
      latestNews,
    };
  }

  /**
   * GET /api/admin/audit-logs
   * سجل العمليات مع pagination + فلترة
   */
  async getAuditLogs(query: AuditLogsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      ...(query.userId && { userId: query.userId }),
      ...(query.entityType && { entityType: query.entityType }),
      ...(query.action && { action: query.action }),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(`${query.to}T23:59:59`) }),
            },
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, email: true, role: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }
}

export const statsService = new StatsService();
