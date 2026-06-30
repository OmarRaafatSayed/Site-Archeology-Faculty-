/** Shared frontend types matching the backend API responses */

export interface Department {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  accentColor: string | null;
  coverImageUrl: string | null;
  orderIndex: number;
  facultyCount?: number;
}

export interface FacultyMember {
  id: string;
  nameAr: string;
  nameEn: string;
  degree: 'assistant_lecturer' | 'lecturer' | 'assistant_professor' | 'professor';
  specializationAr: string | null;
  specializationEn: string | null;
  bioAr: string | null;
  bioEn: string | null;
  email: string | null;
  photoUrl: string | null;
  adminRole: string | null;
  isActive: boolean;
  orderIndex: number;
  department?: Pick<Department, 'id' | 'slug' | 'nameAr' | 'nameEn' | 'accentColor'>;
}

export interface NewsArticle {
  id: string;
  titleAr: string;
  titleEn: string | null;
  bodyAr: string;
  bodyEn: string | null;
  coverImage: string | null;
  category: 'general' | 'academic' | 'student' | 'conference' | 'research';
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  createdAt: string;
}

export interface Conference {
  id: string;
  slug: string;
  number: number;
  titleAr: string;
  titleEn: string | null;
  themeAr: string | null;
  themeEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  bannerArUrl: string | null;
  bannerEnUrl: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  _count?: { registrations: number };
}

export interface Program {
  id: string;
  nameAr: string;
  nameEn: string;
  level: 'undergraduate' | 'masters' | 'doctorate';
  descriptionAr: string | null;
  descriptionEn: string | null;
  creditHours: number | null;
  durationYears: number | null;
}

export interface LibraryBook {
  id: string;
  libraryType: 'egyptology' | 'islamic' | 'conservation' | 'postgraduate';
  titleAr: string;
  titleEn: string | null;
  authorAr: string | null;
  authorEn: string | null;
  publisher: string | null;
  publishYear: number | null;
  isbn: string | null;
  copiesCount: number;
}

export interface Publication {
  id: string;
  titleAr: string;
  titleEn: string | null;
  abstractAr: string | null;
  abstractEn: string | null;
  journalName: string | null;
  publishYear: number | null;
  doi: string | null;
  fileUrl: string | null;
  faculty?: Pick<FacultyMember, 'id' | 'nameAr' | 'nameEn' | 'degree'>;
}

export interface Page {
  slug: string;
  titleAr: string;
  titleEn: string | null;
  contentAr: string | null;
  contentEn: string | null;
  metaDescriptionAr: string | null;
  metaDescriptionEn: string | null;
}

export interface SearchResult {
  id: string;
  type: 'news' | 'faculty' | 'publication' | 'course' | 'library' | 'conference';
  titleAr: string;
  titleEn: string | null;
  excerpt: string | null;
  url: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
  byType: Partial<Record<SearchResult['type'], number>>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
