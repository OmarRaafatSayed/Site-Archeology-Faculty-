import * as XLSX from 'xlsx';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  CreateBookInput,
  UpdateBookInput,
  ListBooksQuery,
  ExcelBookRow,
  excelBookRowSchema,
} from './library.types';
import { ExcelImportReport } from '../students/students.types';

const BOOK_SELECT = {
  id: true,
  libraryType: true,
  titleAr: true,
  titleEn: true,
  authorAr: true,
  authorEn: true,
  publisher: true,
  publishYear: true,
  isbn: true,
  copiesCount: true,
  createdAt: true,
  department: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
} as const;

export class LibraryService {

  // ─── GET /api/library ─────────────────────────────────────────────────────
  async listBooks(query: ListBooksQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      ...(query.type && { libraryType: query.type }),
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.publishYear && { publishYear: query.publishYear }),
      ...(query.q && {
        OR: [
          { titleAr: { contains: query.q, mode: 'insensitive' as const } },
          { titleEn: { contains: query.q, mode: 'insensitive' as const } },
          { authorAr: { contains: query.q, mode: 'insensitive' as const } },
          { authorEn: { contains: query.q, mode: 'insensitive' as const } },
          { isbn: { contains: query.q, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.libraryBook.findMany({
        where,
        select: BOOK_SELECT,
        skip,
        take,
        orderBy: { titleAr: 'asc' },
      }),
      prisma.libraryBook.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  // ─── GET /api/library/:id ─────────────────────────────────────────────────
  async getBookById(id: string) {
    const book = await prisma.libraryBook.findUnique({
      where: { id },
      include: { department: { select: { id: true, slug: true, nameAr: true, nameEn: true } } },
    });
    if (!book) throw new NotFoundError('Book');
    return book;
  }

  // ─── POST /api/library ────────────────────────────────────────────────────
  async createBook(input: CreateBookInput) {
    if (input.departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
      if (!dept) throw new NotFoundError('Department');
    }

    return prisma.libraryBook.create({
      data: {
        libraryType: input.libraryType,
        titleAr: input.titleAr,
        titleEn: input.titleEn ?? null,
        authorAr: input.authorAr ?? null,
        authorEn: input.authorEn ?? null,
        publisher: input.publisher ?? null,
        publishYear: input.publishYear ?? null,
        isbn: input.isbn ?? null,
        copiesCount: input.copiesCount,
        departmentId: input.departmentId ?? null,
      },
      select: BOOK_SELECT,
    });
  }

  // ─── PUT /api/library/:id ─────────────────────────────────────────────────
  async updateBook(id: string, input: UpdateBookInput) {
    const existing = await prisma.libraryBook.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Book');

    return prisma.libraryBook.update({
      where: { id },
      data: {
        ...(input.libraryType !== undefined && { libraryType: input.libraryType }),
        ...(input.titleAr !== undefined && { titleAr: input.titleAr }),
        ...(input.titleEn !== undefined && { titleEn: input.titleEn }),
        ...(input.authorAr !== undefined && { authorAr: input.authorAr }),
        ...(input.authorEn !== undefined && { authorEn: input.authorEn }),
        ...(input.publisher !== undefined && { publisher: input.publisher }),
        ...(input.publishYear !== undefined && { publishYear: input.publishYear }),
        ...(input.isbn !== undefined && { isbn: input.isbn }),
        ...(input.copiesCount !== undefined && { copiesCount: input.copiesCount }),
        ...(input.departmentId !== undefined && { departmentId: input.departmentId }),
      },
      select: BOOK_SELECT,
    });
  }

  // ─── DELETE /api/library/:id ──────────────────────────────────────────────
  async deleteBook(id: string): Promise<void> {
    const existing = await prisma.libraryBook.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Book');
    await prisma.libraryBook.delete({ where: { id } });
  }

  // ─── POST /api/library/import — Phase 1: Validate ─────────────────────────
  async validateBooksExcel(buffer: Buffer): Promise<ExcelImportReport<ExcelBookRow>> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, unknown>[];

    const errors: Array<{ row: number; message: string }> = [];
    const validRows: ExcelBookRow[] = [];

    const departments = await prisma.department.findMany({ select: { id: true, slug: true } });
    const deptMap = new Map(departments.map((d) => [d.slug, d.id]));

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const parsed = excelBookRowSchema.safeParse(rows[i]);

      if (!parsed.success) {
        errors.push({ row: rowNum, message: parsed.error.errors[0].message });
        continue;
      }

      const row = parsed.data;
      if (row.department_slug && !deptMap.has(row.department_slug)) {
        errors.push({ row: rowNum, message: `القسم "${row.department_slug}" غير موجود` });
        continue;
      }

      validRows.push(row);
    }

    return {
      totalRows: rows.length,
      validRows: validRows.length,
      errorCount: errors.length,
      errors,
      preview: validRows.slice(0, 5),
      readyToImport: errors.length === 0,
    };
  }

  // ─── POST /api/library/import/confirm — Phase 2: Execute ──────────────────
  async importBooksFromExcel(buffer: Buffer): Promise<{ imported: number; failed: number }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, unknown>[];

    const departments = await prisma.department.findMany({ select: { id: true, slug: true } });
    const deptMap = new Map(departments.map((d) => [d.slug, d.id]));

    let imported = 0;
    let failed = 0;

    for (const rawRow of rows) {
      try {
        const parsed = excelBookRowSchema.safeParse(rawRow);
        if (!parsed.success) { failed++; continue; }

        const row = parsed.data;
        const departmentId = row.department_slug ? (deptMap.get(row.department_slug) ?? null) : null;

        await prisma.libraryBook.create({
          data: {
            libraryType: row.library_type,
            titleAr: row.title_ar,
            titleEn: row.title_en ?? null,
            authorAr: row.author_ar ?? null,
            authorEn: row.author_en ?? null,
            publisher: row.publisher ?? null,
            publishYear: row.publish_year ?? null,
            isbn: row.isbn ?? null,
            copiesCount: row.copies_count,
            departmentId,
          },
        });
        imported++;
      } catch {
        failed++;
      }
    }

    return { imported, failed };
  }
}

export const libraryService = new LibraryService();
