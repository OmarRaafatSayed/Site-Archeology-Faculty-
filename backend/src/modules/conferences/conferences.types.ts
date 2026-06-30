import { z } from 'zod';
import { ConferenceStatus, RegStatus } from '@prisma/client';

// ─── Create Conference ────────────────────────────────────────────────────────

export const createConferenceSchema = z.object({
  number: z.coerce.number().int().min(1),
  titleAr: z.string().min(5).max(500),
  titleEn: z.string().min(5).max(500).optional(),
  themeAr: z.string().max(500).optional(),
  themeEn: z.string().max(500).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD').optional(),
  bannerArUrl: z.string().url().max(500).optional().nullable(),
  bannerEnUrl: z.string().url().max(500).optional().nullable(),
  status: z.nativeEnum(ConferenceStatus).default(ConferenceStatus.upcoming),
});

export type CreateConferenceInput = z.infer<typeof createConferenceSchema>;

// ─── Update Conference ────────────────────────────────────────────────────────

export const updateConferenceSchema = createConferenceSchema.partial();
export type UpdateConferenceInput = z.infer<typeof updateConferenceSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listConferencesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.nativeEnum(ConferenceStatus).optional(),
});

export type ListConferencesQuery = z.infer<typeof listConferencesQuerySchema>;

// ─── Conference Registration ──────────────────────────────────────────────────

export const registerConferenceSchema = z.object({
  fullName: z.string().min(3).max(255),
  institution: z.string().max(500).optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50).optional(),
  participationType: z.enum(['presenter', 'attendee']).default('attendee'),
  paperTitle: z.string().max(1000).optional(),
  abstract: z.string().max(5000).optional(),
  // reCAPTCHA token (validated server-side when RECAPTCHA_SECRET_KEY is set)
  captchaToken: z.string().optional(),
});

export type RegisterConferenceInput = z.infer<typeof registerConferenceSchema>;

// ─── Update Registration Status ───────────────────────────────────────────────

export const updateRegistrationSchema = z.object({
  status: z.nativeEnum(RegStatus),
});

export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;

// ─── List Registrations (Admin) ───────────────────────────────────────────────

export const listRegistrationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(RegStatus).optional(),
  participationType: z.enum(['presenter', 'attendee']).optional(),
  search: z.string().optional(),
});

export type ListRegistrationsQuery = z.infer<typeof listRegistrationsQuerySchema>;
