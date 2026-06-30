/**
 * All API endpoint functions — used in Server Components (SSG/ISR/SSR)
 * These functions run on the server and fetch directly from the backend
 */
import { apiFetch } from './client';
import {
  Department,
  FacultyMember,
  NewsArticle,
  Conference,
  Program,
  LibraryBook,
  Publication,
  Page,
  SearchResponse,
  PaginatedResponse,
} from './types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** Server-side fetch helper — bypasses Axios for RSC */
async function serverFetch<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const url = new URL(`${API}/api${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 }, // ISR default — overridden per call
  });

  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

// ─── Departments ──────────────────────────────────────────────────────────────

export async function getDepartments(): Promise<Department[]> {
  return serverFetch<Department[]>('/departments', {});
}

export async function getDepartment(slug: string): Promise<Department> {
  return serverFetch<Department>(`/departments/${slug}`);
}

export async function getDepartmentFaculty(slug: string): Promise<FacultyMember[]> {
  return serverFetch<FacultyMember[]>(`/departments/${slug}/faculty`);
}

export async function getDepartmentPrograms(slug: string): Promise<Program[]> {
  return serverFetch<Program[]>(`/departments/${slug}/programs`);
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export async function getFaculty(params?: { page?: number; limit?: number; departmentId?: string }): Promise<PaginatedResponse<FacultyMember>> {
  return serverFetch<PaginatedResponse<FacultyMember>>('/faculty', params);
}

export async function getFacultyMember(id: string): Promise<FacultyMember> {
  return serverFetch<FacultyMember>(`/faculty/${id}`);
}

export async function getFacultyPublications(id: string): Promise<PaginatedResponse<Publication>> {
  return serverFetch<PaginatedResponse<Publication>>(`/faculty/${id}/publications`);
}

// ─── News ─────────────────────────────────────────────────────────────────────

export async function getNews(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<PaginatedResponse<NewsArticle>> {
  return serverFetch<PaginatedResponse<NewsArticle>>('/news', params);
}

export async function getNewsArticle(id: string): Promise<NewsArticle> {
  return serverFetch<NewsArticle>(`/news/${id}`);
}

// ─── Conferences ──────────────────────────────────────────────────────────────

export async function getConferences(status?: string): Promise<PaginatedResponse<Conference>> {
  return serverFetch<PaginatedResponse<Conference>>('/conferences', status ? { status } : {});
}

export async function getConference(slug: string): Promise<Conference> {
  return serverFetch<Conference>(`/conferences/${slug}`);
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export async function getPrograms(level?: string): Promise<PaginatedResponse<Program>> {
  return serverFetch<PaginatedResponse<Program>>('/programs', level ? { level, limit: 100 } : { limit: 100 });
}

// ─── Library ──────────────────────────────────────────────────────────────────

export async function getLibraryBooks(params?: {
  type?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<LibraryBook>> {
  return serverFetch<PaginatedResponse<LibraryBook>>('/library', params);
}

// ─── Pages (static content) ───────────────────────────────────────────────────

export async function getPage(slug: string): Promise<Page> {
  return serverFetch<Page>(`/pages/${slug}`);
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchAll(q: string, type?: string, lang?: string): Promise<SearchResponse> {
  return serverFetch<SearchResponse>('/search', {
    q,
    ...(type && { type }),
    ...(lang && { lang }),
  });
}

// ─── Quality Assurance ────────────────────────────────────────────────────────

export async function getQualityBoardMembers(): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/quality/members', { limit: 100 });
}

export async function getQualityDocuments(params?: {
  type?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/quality/documents', params);
}

// ─── Student Services ─────────────────────────────────────────────────────────

export async function getStudentServices(params?: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/student-services', params);
}

export async function getStudentEvents(params?: {
  upcoming?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/student-services/events', params);
}

// ─── Excavations ──────────────────────────────────────────────────────────────

export async function getExcavationSites(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/excavations/sites', params);
}

export async function getExcavationSite(slug: string): Promise<any> {
  return serverFetch<any>(`/excavations/sites/slug/${slug}`);
}

// ─── Community Projects ───────────────────────────────────────────────────────

export async function getCommunityProjects(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/community', params);
}

// ─── Special Programs ─────────────────────────────────────────────────────────

export async function getSpecialPrograms(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/special-programs', params);
}

// ─── Agreements ───────────────────────────────────────────────────────────────

export async function getAgreements(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/agreements', params);
}

// ─── Research Centers ─────────────────────────────────────────────────────────

export async function getResearchCenters(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/centers', params);
}

// ─── External Links ───────────────────────────────────────────────────────────

export async function getExternalLinks(params?: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> {
  return serverFetch<PaginatedResponse<any>>('/external-links', params);
}
