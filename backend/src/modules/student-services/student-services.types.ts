import { z } from 'zod';
import { ServiceCategory } from '@prisma/client';

// ─── Student Service ──────────────────────────────────────────────────────────

export const createServiceSchema = z.object({
  category: z.nativeEnum(ServiceCategory),
  titleAr: z.string().min(3).max(500),
  titleEn: z.string().min(3).max(500).optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  iconName: z.string().max(100).optional().nullable(),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  externalUrl: z.string().url().max(500).optional().nullable(),
  contactEmail: z.string().email().max(255).optional().nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().min(0).default(0),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial();
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

// ─── Student Event ────────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  serviceId: z.string().uuid().optional().nullable(),
  titleAr: z.string().min(5).max(500),
  titleEn: z.string().min(5).max(500).optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  eventDate: z.string().datetime(),
  location: z.string().max(255).optional().nullable(),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  isPublished: z.boolean().default(false),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listServicesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  category: z.nativeEnum(ServiceCategory).optional(),
  isActive: z.string().optional().transform((v) => v === 'false' ? false : true),
});

export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  published: z.string().optional().transform((v) => v === 'false' ? false : true),
  upcoming: z.string().optional().transform((v) => v === 'true'),
});

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
