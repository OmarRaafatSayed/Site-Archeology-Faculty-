import { z } from 'zod';
import { LibraryType } from '@prisma/client';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createBookSchema = z.object({
  libraryType: z.nativeEnum(LibraryType),
  titleAr: z.string().min(3).max(1000),
  titleEn: z.string().max(1000).optional(),
  authorAr: z.string().max(500).optional(),
  authorEn: z.string().max(500).optional(),
  publisher: z.string().max(500).optional(),
  publishYear: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
  isbn: z.string().max(20).optional().nullable(),
  copiesCount: z.coerce.number().int().min(1).default(1),
  departmentId: z.string().uuid().optional().nullable(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateBookSchema = createBookSchema.partial();
export type UpdateBookInput = z.infer<typeof updateBookSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listBooksQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.nativeEnum(LibraryType).optional(),    // نوع المكتبة
  departmentId: z.string().uuid().optional(),
  q: z.string().optional(),                       // بحث في العنوان / المؤلف
  publishYear: z.coerce.number().int().optional(),
});

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>;

// ─── Excel Import Row ─────────────────────────────────────────────────────────

export const excelBookRowSchema = z.object({
  title_ar: z.string().min(3).max(1000),
  title_en: z.string().max(1000).optional(),
  author_ar: z.string().max(500).optional(),
  author_en: z.string().max(500).optional(),
  publisher: z.string().max(500).optional(),
  publish_year: z.coerce.number().int().min(1000).optional(),
  isbn: z.string().max(20).optional(),
  copies_count: z.coerce.number().int().min(1).default(1),
  library_type: z.nativeEnum(LibraryType),
  department_slug: z.string().optional(),
});

export type ExcelBookRow = z.infer<typeof excelBookRowSchema>;
