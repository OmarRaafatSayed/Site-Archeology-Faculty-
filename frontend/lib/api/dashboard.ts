/**
 * Dashboard API — Client + Server side calls
 * Student / Faculty / Admin endpoints
 */
import { apiClient } from './client';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ─── Authenticated server-side fetch ──────────────────────────────────────────
export async function authServerFetch<T>(
  path: string,
  token: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${API}/api${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Auth fetch ${path} failed: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  studentId: string;
  nameAr: string;
  nameEn: string | null;
  email: string | null;
  phone: string | null;
  level: number;
  semester: 'first' | 'second';
  academicYear: string;
  department?: { id: string; nameAr: string; nameEn: string | null; slug: string };
}

export interface ScheduleEntry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomNumber: string | null;
  course: { id: string; nameAr: string; nameEn: string | null; code: string };
  facultyMember: { id: string; nameAr: string; nameEn: string | null } | null;
}

export interface ExamEntry {
  id: string;
  examDate: string;
  startTime: string;
  endTime: string;
  hallNumber: string | null;
  examType: 'midterm' | 'final';
  course: { id: string; nameAr: string; nameEn: string | null; code: string };
}

export interface StudentResult {
  id: string;
  midtermScore: number | null;
  finalScore: number | null;
  totalScore: number | null;
  gradeLetter: string | null;
  isPassed: boolean | null;
  isPublished: boolean;
  academicYear: string;
  semester: string;
  course: { id: string; nameAr: string; nameEn: string | null; code: string; creditHours: number | null };
}

export async function getStudentProfile(): Promise<StudentProfile> {
  const { data } = await apiClient.get<{ success: boolean; data: StudentProfile }>('/students/me');
  return data.data;
}

export async function getStudentSchedule(): Promise<ScheduleEntry[]> {
  const { data } = await apiClient.get<{ success: boolean; data: ScheduleEntry[] }>('/students/me/schedule');
  return data.data;
}

export async function getStudentExams(): Promise<ExamEntry[]> {
  const { data } = await apiClient.get<{ success: boolean; data: ExamEntry[] }>('/students/me/exams');
  return data.data;
}

export async function getStudentResults(): Promise<StudentResult[]> {
  const { data } = await apiClient.get<{ success: boolean; data: StudentResult[] }>('/students/me/results');
  return data.data;
}

export async function updateStudentProfile(payload: Partial<Pick<StudentProfile, 'phone'>>): Promise<StudentProfile> {
  const { data } = await apiClient.put<{ success: boolean; data: StudentProfile }>('/students/me', payload);
  return data.data;
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export interface FacultyProfile {
  id: string;
  nameAr: string;
  nameEn: string | null;
  degree: string;
  specializationAr: string | null;
  specializationEn: string | null;
  email: string | null;
  phone: string | null;
  officeNumber: string | null;
  bio: string | null;
  photoUrl: string | null;
  department?: { id: string; nameAr: string; nameEn: string | null; slug: string };
}

export interface FacultyCourse {
  id: string;
  nameAr: string;
  nameEn: string | null;
  code: string;
  creditHours: number | null;
  level: number | null;
  semester: string | null;
}

export interface FacultyPublication {
  id: string;
  titleAr: string;
  titleEn: string | null;
  abstractAr: string | null;
  journalName: string | null;
  publishYear: number | null;
  doi: string | null;
  fileUrl: string | null;
  isPublished: boolean;
}

export async function getFacultyProfile(): Promise<FacultyProfile> {
  const { data } = await apiClient.get<{ success: boolean; data: FacultyProfile }>('/faculty/me');
  return data.data;
}

export async function updateFacultyProfile(payload: Partial<FacultyProfile>): Promise<FacultyProfile> {
  const { data } = await apiClient.put<{ success: boolean; data: FacultyProfile }>('/faculty/me', payload);
  return data.data;
}

export async function createPublication(payload: Partial<FacultyPublication>): Promise<FacultyPublication> {
  const { data } = await apiClient.post<{ success: boolean; data: FacultyPublication }>('/publications', payload);
  return data.data;
}

export async function updatePublication(id: string, payload: Partial<FacultyPublication>): Promise<FacultyPublication> {
  const { data } = await apiClient.put<{ success: boolean; data: FacultyPublication }>(`/publications/${id}`, payload);
  return data.data;
}

export async function deletePublication(id: string): Promise<void> {
  await apiClient.delete(`/publications/${id}`);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalNews: number;
  totalPublications: number;
  totalLibraryBooks: number;
  totalConferences: number;
  totalRegistrations: number;
  totalUsers: number;
  latestNews: Array<{ id: string; titleAr: string; publishedAt: string | null; isPublished: boolean }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: string;
    user?: { nameAr: string; email: string };
  }>;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: unknown;
  newData: unknown;
  ipAddress: string | null;
  createdAt: string;
  user?: { id: string; nameAr: string; email: string; role: string };
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  faculty?: { id: string; nameAr: string };
  student?: { id: string; nameAr: string };
}

export interface ImportReport {
  toCreate: unknown[];
  toUpdate: unknown[];
  errors: Array<{ row: number; field: string; message: string }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard-stats');
  return data.data;
}

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
}): Promise<{ items: AuditLog[]; total: number; page: number; totalPages: number }> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: { items: AuditLog[]; total: number; page: number; totalPages: number };
  }>('/admin/audit-logs', { params });
  return data.data;
}

export async function getAdminUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}): Promise<{ items: AdminUser[]; total: number; page: number; totalPages: number }> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: { items: AdminUser[]; total: number; page: number; totalPages: number };
  }>('/admin/users', { params });
  return data.data;
}

export async function createAdminUser(payload: {
  email: string;
  password: string;
  role: string;
  nameAr: string;
  nameEn?: string;
}): Promise<AdminUser> {
  const { data } = await apiClient.post<{ success: boolean; data: AdminUser }>('/admin/users', payload);
  return data.data;
}

export async function updateAdminUser(id: string, payload: Partial<AdminUser & { password?: string }>): Promise<AdminUser> {
  const { data } = await apiClient.put<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`, payload);
  return data.data;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}
