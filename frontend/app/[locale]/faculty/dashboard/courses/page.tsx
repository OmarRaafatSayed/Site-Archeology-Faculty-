/**
 * Faculty Courses — مقررات عضو التدريس
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getFacultyProfile } from '@/lib/api/dashboard';
import { apiFetch } from '@/lib/api/client';
import { localize } from '@/lib/utils/locale';
import type { PaginatedResponse } from '@/lib/api/types';

interface Course {
  id: string;
  nameAr: string;
  nameEn: string | null;
  code: string;
  creditHours: number | null;
  level: number | null;
  semester: string | null;
  department?: { nameAr: string; nameEn: string | null };
}

export default function FacultyCoursesPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacultyProfile()
      .then((profile) =>
        apiFetch<PaginatedResponse<Course>>('/courses', {
          facultyId: profile.id,
          limit: 100,
        })
      )
      .then((res) => setCourses(res.items))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const semesterLabel = (s: string | null) => {
    if (!s) return '—';
    const map: Record<string, { ar: string; en: string }> = {
      first: { ar: 'الأول', en: 'First' },
      second: { ar: 'الثاني', en: 'Second' },
    };
    return map[s] ? (isAr ? map[s].ar : map[s].en) : s;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{isAr ? 'مقرراتي' : 'My Courses'}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isAr ? `${courses.length} مقرر` : `${courses.length} courses`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400">{isAr ? 'لا توجد مقررات مسندة إليك حالياً' : 'No courses assigned to you yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-primary-200 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {localize(course.nameAr, course.nameEn, locale)}
                  </p>
                  <p className="text-xs text-primary-600 font-mono mt-0.5">{course.code}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md shrink-0">
                  {course.creditHours ?? '—'} {isAr ? 'ساعة' : 'hrs'}
                </span>
              </div>
              <div className="mt-3 flex gap-3 text-xs text-gray-500">
                {course.level && (
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {isAr ? `الفرقة ${course.level}` : `Year ${course.level}`}
                  </span>
                )}
                {course.semester && (
                  <span className="bg-gray-50 px-2 py-0.5 rounded-full">
                    {isAr ? 'الفصل' : 'Sem.'} {semesterLabel(course.semester)}
                  </span>
                )}
                {course.department && (
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full truncate">
                    {localize(course.department.nameAr, course.department.nameEn, locale)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
