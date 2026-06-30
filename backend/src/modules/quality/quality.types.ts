import { z } from 'zod';
import { QADocumentType } from '@prisma/client';

// ─── Quality Board Member ─────────────────────────────────────────────────────

export const createBoardMemberSchema = z.object({
  facultyId: z.string().uuid().optional().nullable(),
  nameAr: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255).optional(),
  positionAr: z.string().min(3).max(255),
  positionEn: z.string().min(3).max(255).optional(),
  email: z.string().email().max(255).optional().nullable(),
  photoUrl: z.string().url().max(500).optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateBoardMemberInput = z.infer<typeof createBoardMemberSchema>;

export const updateBoardMemberSchema = createBoardMemberSchema.partial();
export type UpdateBoardMemberInput = z.infer<typeof updateBoardMemberSchema>;

// ─── Quality Document ─────────────────────────────────────────────────────────

export const createDocumentSchema = z.object({
  titleAr: z.string().min(5).max(500),
  titleEn: z.string().min(5).max(500).optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  documentType: z.nativeEnum(QADocumentType),
  fileUrl: z.string().url().max(500),
  publishYear: z.number().int().min(2000).max(2100).optional().nullable(),
  isPublished: z.boolean().default(false),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = createDocumentSchema.partial();
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listBoardMembersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  isActive: z.string().optional().transform((v) => v === 'false' ? false : true),
});

export type ListBoardMembersQuery = z.infer<typeof listBoardMembersQuerySchema>;

export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  type: z.nativeEnum(QADocumentType).optional(),
  published: z.string().optional().transform((v) => v === 'false' ? false : true),
  year: z.coerce.number().int().optional(),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
