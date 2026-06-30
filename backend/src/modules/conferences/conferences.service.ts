import crypto from 'crypto';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  CreateConferenceInput,
  UpdateConferenceInput,
  ListConferencesQuery,
  RegisterConferenceInput,
  UpdateRegistrationInput,
  ListRegistrationsQuery,
} from './conferences.types';
import {
  sendConferenceRegistrationEmail,
  sendRegistrationApprovalEmail,
} from '../../config/mailer';
import { env } from '../../config/env';

const CACHE_TTL    = 10 * 60;   // 10 دقائق للمؤتمرات
const CACHE_ALL    = 'conferences:list';
const cacheOne     = (slug: string) => `conferences:${slug}`;

// الحقول المُرجَعة للعموم
const CONF_SELECT = {
  id: true,
  slug: true,
  number: true,
  titleAr: true,
  titleEn: true,
  themeAr: true,
  themeEn: true,
  startDate: true,
  endDate: true,
  bannerArUrl: true,
  bannerEnUrl: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { registrations: true } },
} as const;

export class ConferencesService {

  // ─── GET /api/conferences ─────────────────────────────────────────────────
  async listConferences(query: ListConferencesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    // Cache فقط لو بدون فلتر status
    if (!query.status) {
      const cached = await redis.get(CACHE_ALL).catch(() => null);
      if (cached) return JSON.parse(cached);
    }

    const where = query.status ? { status: query.status } : {};

    const [items, total] = await prisma.$transaction([
      prisma.conference.findMany({
        where,
        select: CONF_SELECT,
        skip,
        take,
        orderBy: { number: 'desc' },
      }),
      prisma.conference.count({ where }),
    ]);

    const result = buildPaginatedResponse(items, total, page, limit);

    if (!query.status) {
      await redis.setex(CACHE_ALL, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    }

    return result;
  }

  // ─── GET /api/conferences/:slug ───────────────────────────────────────────
  async getConferenceBySlug(slug: string) {
    const cached = await redis.get(cacheOne(slug)).catch(() => null);
    if (cached) return JSON.parse(cached);

    const conf = await prisma.conference.findUnique({
      where: { slug },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!conf) throw new NotFoundError('Conference');

    await redis.setex(cacheOne(slug), CACHE_TTL, JSON.stringify(conf)).catch(() => null);
    return conf;
  }

  // ─── POST /api/conferences (Admin) ────────────────────────────────────────
  // ينشئ المؤتمر + الصفحات الثابتة تلقائياً (من FRD M6.2)
  async createConference(input: CreateConferenceInput) {
    // توليد slug من العنوان العربي + الرقم
    const slug = this.generateSlug(input.titleAr, input.number);

    // التأكد من عدم التكرار
    const existing = await prisma.conference.findUnique({ where: { slug } });
    if (existing) throw new ValidationError(`Conference slug "${slug}" already exists`);

    const conf = await prisma.conference.create({
      data: {
        slug,
        number: input.number,
        titleAr: input.titleAr,
        titleEn: input.titleEn ?? null,
        themeAr: input.themeAr ?? null,
        themeEn: input.themeEn ?? null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        bannerArUrl: input.bannerArUrl ?? null,
        bannerEnUrl: input.bannerEnUrl ?? null,
        status: input.status,
      },
    });

    // توليد الصفحات الثابتة تلقائياً (من FRD M6.2 — 9 صفحات)
    await this.generateConferencePages(conf.id, slug, input.titleAr, input.titleEn ?? null);

    await this.invalidateListCache();
    return conf;
  }

  // ─── PUT /api/conferences/:id (Admin) ─────────────────────────────────────
  async updateConference(id: string, input: UpdateConferenceInput) {
    const existing = await prisma.conference.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Conference');

    const updated = await prisma.conference.update({
      where: { id },
      data: {
        ...(input.titleAr !== undefined && { titleAr: input.titleAr }),
        ...(input.titleEn !== undefined && { titleEn: input.titleEn }),
        ...(input.themeAr !== undefined && { themeAr: input.themeAr }),
        ...(input.themeEn !== undefined && { themeEn: input.themeEn }),
        ...(input.startDate !== undefined && { startDate: input.startDate ? new Date(input.startDate) : null }),
        ...(input.endDate !== undefined && { endDate: input.endDate ? new Date(input.endDate) : null }),
        ...(input.bannerArUrl !== undefined && { bannerArUrl: input.bannerArUrl }),
        ...(input.bannerEnUrl !== undefined && { bannerEnUrl: input.bannerEnUrl }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });

    await this.invalidateCache(existing.slug);
    return updated;
  }

  // ─── POST /api/conferences/:id/register (Public + CAPTCHA) ───────────────
  async registerForConference(
    conferenceId: string,
    input: RegisterConferenceInput,
  ) {
    // التحقق من وجود المؤتمر وأنه upcoming أو ongoing
    const conf = await prisma.conference.findUnique({ where: { id: conferenceId } });
    if (!conf) throw new NotFoundError('Conference');
    if (conf.status === 'completed' || conf.status === 'cancelled') {
      throw new ValidationError('Conference registration is closed');
    }

    // CAPTCHA verification (إن وُجد الـ secret key)
    if (env.RECAPTCHA_SECRET_KEY && input.captchaToken) {
      await this.verifyCaptcha(input.captchaToken);
    }

    // توليد registration code فريد
    const registrationCode = this.generateRegistrationCode();

    const registration = await prisma.conferenceRegistration.create({
      data: {
        conferenceId,
        fullName: input.fullName,
        institution: input.institution ?? null,
        email: input.email,
        phone: input.phone ?? null,
        participationType: input.participationType,
        paperTitle: input.paperTitle ?? null,
        abstract: input.abstract ?? null,
        registrationCode,
        status: 'pending',
      },
    });

    // إرسال بريد التأكيد بشكل async — لا يعطّل الـ response
    setImmediate(() => {
      sendConferenceRegistrationEmail({
        to: input.email,
        fullName: input.fullName,
        registrationCode,
        conferenceTitleAr: conf.titleAr,
        conferenceTitleEn: conf.titleEn,
      });
    });

    return {
      registrationCode,
      status: registration.status,
      message: 'تم استلام طلب التسجيل بنجاح. ستصلك رسالة تأكيد على بريدك الإلكتروني.',
    };
  }

  // ─── GET /api/conferences/:id/registrations (Admin) ──────────────────────
  async getConferenceRegistrations(conferenceId: string, query: ListRegistrationsQuery) {
    const conf = await prisma.conference.findUnique({ where: { id: conferenceId } });
    if (!conf) throw new NotFoundError('Conference');

    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      conferenceId,
      ...(query.status && { status: query.status }),
      ...(query.participationType && { participationType: query.participationType }),
      ...(query.search && {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
          { institution: { contains: query.search, mode: 'insensitive' as const } },
          { registrationCode: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.conferenceRegistration.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.conferenceRegistration.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  // ─── PUT /api/conferences/:id/registrations/:regId (Admin) ───────────────
  async updateRegistrationStatus(
    conferenceId: string,
    regId: string,
    input: UpdateRegistrationInput,
  ) {
    const reg = await prisma.conferenceRegistration.findFirst({
      where: { id: regId, conferenceId },
      include: { conference: true },
    });
    if (!reg) throw new NotFoundError('Registration');

    const updated = await prisma.conferenceRegistration.update({
      where: { id: regId },
      data: { status: input.status },
    });

    // إرسال بريد القبول عند تغيير الحالة إلى "confirmed"
    if (input.status === 'confirmed' && reg.status !== 'confirmed') {
      setImmediate(() => {
        sendRegistrationApprovalEmail({
          to: reg.email,
          fullName: reg.fullName,
          registrationCode: reg.registrationCode ?? '',
          conferenceTitleAr: reg.conference.titleAr,
          conferenceTitleEn: reg.conference.titleEn,
        });
      });
    }

    return updated;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * توليد slug من العنوان العربي والرقم
   * مثال: "المؤتمر الخامس الدولي" + 5 → "conference-5-al-mwtmr-alkhmys"
   * نستخدم رقم المؤتمر + timestamp لضمان الفرادة
   */
  private generateSlug(titleAr: string, number: number): string {
    // نأخذ أول 3 كلمات بالحروف اللاتينية + الرقم
    const normalized = titleAr
      .replace(/[\u0600-\u06FF]/g, (c) => {
        const map: Record<string, string> = {
          'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
          'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
          'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
          'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
          'ة': 'a', 'ى': 'a', 'ئ': 'y', 'إ': 'i', 'أ': 'a', 'آ': 'aa', 'ء': '',
        };
        return map[c] ?? '';
      })
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .slice(0, 40);

    return `conference-${number}-${normalized}`.toLowerCase();
  }

  /** توليد registration code (e.g. "CONF-20241234") */
  private generateRegistrationCode(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CONF-${year}${random}`;
  }

  /** CAPTCHA verification via Google reCAPTCHA v2 */
  private async verifyCaptcha(token: string): Promise<void> {
    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      });
      const data = await response.json() as { success: boolean };
      if (!data.success) {
        throw new ValidationError('CAPTCHA verification failed. Please try again.');
      }
    } catch (err) {
      if (err instanceof ValidationError) throw err;
      // إذا فشل الاتصال بـ Google، نسمح بالمرور (fail open للـ dev)
      console.error('CAPTCHA verification error:', err);
    }
  }

  /** توليد صفحات المؤتمر الثابتة تلقائياً (M6.2 — 9 صفحات) */
  private async generateConferencePages(
    _confId: string,
    slug: string,
    titleAr: string,
    titleEn: string | null,
  ): Promise<void> {
    const pages = [
      { suffix: 'home',         labelAr: `الرئيسية`,          labelEn: 'Home' },
      { suffix: 'registration', labelAr: `التسجيل`,           labelEn: 'Registration' },
      { suffix: 'abstracts',    labelAr: `الملخصات`,          labelEn: 'Abstracts' },
      { suffix: 'topics',       labelAr: `المحاور العلمية`,   labelEn: 'Scientific Topics' },
      { suffix: 'requirements', labelAr: `متطلبات الأبحاث`,  labelEn: 'Research Requirements' },
      { suffix: 'dates',        labelAr: `المواعيد`,          labelEn: 'Important Dates' },
      { suffix: 'fees',         labelAr: `رسوم الاشتراك`,    labelEn: 'Registration Fees' },
      { suffix: 'program',      labelAr: `البرنامج`,          labelEn: 'Program' },
      { suffix: 'papers',       labelAr: `الأبحاث المقدمة`,  labelEn: 'Submitted Papers' },
    ];

    const pageData = pages.map((p) => ({
      slug: `${slug}/${p.suffix}`,
      titleAr: `${titleAr} — ${p.labelAr}`,
      titleEn: titleEn ? `${titleEn} — ${p.labelEn}` : null,
      contentAr: null,
      contentEn: null,
    }));

    // upsert — لا يُكرر إن وُجدت مسبقاً
    for (const page of pageData) {
      await prisma.page.upsert({
        where: { slug: page.slug },
        update: {},
        create: page,
      });
    }
  }

  private async invalidateCache(slug: string) {
    await Promise.all([
      redis.del(cacheOne(slug)).catch(() => null),
      this.invalidateListCache(),
    ]);
  }

  private async invalidateListCache() {
    await redis.del(CACHE_ALL).catch(() => null);
  }
}

export const conferencesService = new ConferencesService();
