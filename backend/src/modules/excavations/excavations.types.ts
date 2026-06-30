import { z } from 'zod';
import { ExcavationStatus } from '@prisma/client';

// ─── Excavation Site ──────────────────────────────────────────────────────────

export const createSiteSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  nameAr: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255).optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  startYear: z.number().int().min(1900).max(2100).optional().nullable(),
  status: z.nativeEnum(ExcavationStatus).default(ExcavationStatus.active),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  externalUrl: z.string().url().max(500).optional().nullable(),
  teamLeaderAr: z.string().max(255).optional().nullable(),
  teamLeaderEn: z.string().max(255).optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;

export const updateSiteSchema = createSiteSchema.partial().omit({ slug: true });
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;

// ─── Excavation Season ────────────────────────────────────────────────────────

export const createSeasonSchema = z.object({
  siteId: z.string().uuid(),
  seasonYear: z.number().int().min(1900).max(2100),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  reportUrl: z.string().url().max(500).optional().nullable(),
});

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;

export const updateSeasonSchema = createSeasonSchema.partial().omit({ siteId: true });
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;

// ─── Excavation Finding ───────────────────────────────────────────────────────

export const createFindingSchema = z.object({
  siteId: z.string().uuid(),
  titleAr: z.string().min(3).max(500),
  titleEn: z.string().min(3).max(500).optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  discoveryYear: z.number().int().min(1900).max(2100).optional().nullable(),
  imageUrl: z.string().url().max(500).optional().nullable(),
});

export type CreateFindingInput = z.infer<typeof createFindingSchema>;

export const updateFindingSchema = createFindingSchema.partial().omit({ siteId: true });
export type UpdateFindingInput = z.infer<typeof updateFindingSchema>;

// ─── Excavation Gallery ───────────────────────────────────────────────────────

export const createGalleryImageSchema = z.object({
  siteId: z.string().uuid(),
  imageUrl: z.string().url().max(500),
  captionAr: z.string().max(500).optional().nullable(),
  captionEn: z.string().max(500).optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
});

export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;

export const updateGalleryImageSchema = createGalleryImageSchema.partial().omit({ siteId: true });
export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listSitesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ExcavationStatus).optional(),
  departmentId: z.string().uuid().optional(),
  isActive: z.string().optional().transform((v) => v === 'false' ? false : true),
});

export type ListSitesQuery = z.infer<typeof listSitesQuerySchema>;

export const listSeasonsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  siteId: z.string().uuid(),
});

export type ListSeasonsQuery = z.infer<typeof listSeasonsQuerySchema>;

export const listFindingsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  siteId: z.string().uuid(),
});

export type ListFindingsQuery = z.infer<typeof listFindingsQuerySchema>;

export const listGalleryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  siteId: z.string().uuid(),
});

export type ListGalleryQuery = z.infer<typeof listGalleryQuerySchema>;
