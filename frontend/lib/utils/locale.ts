/** Helper utilities for locale-aware content */

/** Pick Arabic or English value based on locale */
export function localize(ar: string | null | undefined, en: string | null | undefined, locale: string): string {
  if (locale === 'en' && en) return en;
  return ar ?? en ?? '';
}

/** Format a date string for the given locale */
export function formatDate(dateStr: string | null | undefined, locale: string): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/** Map faculty degree enum to display label */
export function degreeLabel(degree: string, locale: string): string {
  const map: Record<string, { ar: string; en: string }> = {
    demonstrator:        { ar: 'معيد',          en: 'Demonstrator' },
    assistant_lecturer:  { ar: 'مدرس مساعد',    en: 'Assistant Lecturer' },
    lecturer:            { ar: 'مدرس',           en: 'Lecturer' },
    assistant_professor: { ar: 'أستاذ مساعد',   en: 'Assistant Professor' },
    professor:           { ar: 'أستاذ',          en: 'Professor' },
  };
  const entry = map[degree];
  if (!entry) return degree;
  return locale === 'en' ? entry.en : entry.ar;
}

/** Map program level to display label */
export function programLevelLabel(level: string, locale: string): string {
  const map: Record<string, { ar: string; en: string }> = {
    undergraduate: { ar: 'بكالوريوس', en: 'Undergraduate' },
    masters: { ar: 'ماجستير', en: 'Master\'s' },
    doctorate: { ar: 'دكتوراه', en: 'Doctorate' },
  };
  const entry = map[level];
  if (!entry) return level;
  return locale === 'en' ? entry.en : entry.ar;
}

/** Map news category to display label */
export function categoryLabel(category: string, locale: string): string {
  const map: Record<string, { ar: string; en: string }> = {
    general: { ar: 'عام', en: 'General' },
    academic: { ar: 'أكاديمي', en: 'Academic' },
    student: { ar: 'طلابي', en: 'Student' },
    conference: { ar: 'مؤتمرات', en: 'Conferences' },
    research: { ar: 'بحوث', en: 'Research' },
  };
  const entry = map[category];
  if (!entry) return category;
  return locale === 'en' ? entry.en : entry.ar;
}

/** Map conference status to display label */
export function conferenceStatusLabel(status: string, locale: string): string {
  const map: Record<string, { ar: string; en: string }> = {
    upcoming: { ar: 'قادم', en: 'Upcoming' },
    ongoing: { ar: 'جارٍ', en: 'Ongoing' },
    completed: { ar: 'منتهٍ', en: 'Completed' },
    cancelled: { ar: 'ملغى', en: 'Cancelled' },
  };
  const entry = map[status];
  if (!entry) return status;
  return locale === 'en' ? entry.en : entry.ar;
}
