import { z } from 'zod';

/** أنواع النتائج المدعومة */
export const SEARCH_TYPES = ['all', 'news', 'faculty', 'publication', 'course', 'library', 'conference'] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export const searchQuerySchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters').max(200).trim(),
  type: z.enum(SEARCH_TYPES).default('all'),
  lang: z.enum(['ar', 'en']).default('ar'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/** نتيجة بحث واحدة */
export interface SearchResult {
  id: string;
  type: SearchType;
  titleAr: string;
  titleEn?: string | null;
  excerpt?: string | null;
  url: string;
  /** ranking score من PostgreSQL */
  rank?: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
  byType: Partial<Record<SearchType, number>>;
}
