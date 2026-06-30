/**
 * Student Results — النتائج المنشورة
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getStudentResults, type StudentResult } from '@/lib/api/dashboard';
import { localize } from '@/lib/utils/locale';

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-green-100 text-green-800', A: 'bg-green-100 text-green-800',
  'A-': 'bg-green-100 text-green-700', 'B+': 'bg-blue-100 text-blue-800',
  B: 'bg-blue-100 text-blue-700', 'B-': 'bg-blue-100 text-blue-600',
  'C+': 'bg-yellow-100 text-yellow-800', C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700', F: 'bg-red-100 text-red-700',
};

export default function StudentResultsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    getStudentResults()
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter((r) => {
    if (filter === 'passed') return r.isPassed === true;
    if (filter === 'failed') return r.isPassed === false;
    return true;
  });

  const gpa = results.length
    ? (results.reduce((sum, r) => sum + (r.totalScore ?? 0), 0) / results.length).toFixed(1)
    : '—';

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'النتائج الأكاديمية' : 'Academic Results'}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAr ? `${results.length} نتيجة منشورة` : `${results.length} published results`}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
          <p className="text-2xl font-bold text-primary-600">{gpa}</p>
          <p className="text-xs text-gray-500">{isAr ? 'متوسط الدرجات' : 'Grade Average'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'passed', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${filter === f
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
          >
            {f === 'all'
              ? (isAr ? 'الكل' : 'All')
              : f === 'passed'
              ? (isAr ? 'ناجح' : 'Passed')
              : (isAr ? 'راسب' : 'Failed')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400">{isAr ? 'لا توجد نتائج' : 'No results found'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>
                  {isAr ? 'المقرر' : 'Course'}
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'نصفي' : 'Mid'}</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'نهائي' : 'Final'}</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'المجموع' : 'Total'}</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'التقدير' : 'Grade'}</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">
                      {localize(result.course.nameAr, result.course.nameEn, locale)}
                    </p>
                    <p className="text-xs text-gray-400">{result.course.code} • {result.academicYear}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{result.midtermScore ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{result.finalScore ?? '—'}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{result.totalScore ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {result.gradeLetter ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold
                        ${GRADE_COLORS[result.gradeLetter] ?? 'bg-gray-100 text-gray-700'}`}>
                        {result.gradeLetter}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                      ${result.isPassed === true
                        ? 'bg-green-100 text-green-700'
                        : result.isPassed === false
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'}`}>
                      {result.isPassed === true
                        ? (isAr ? 'ناجح' : 'Pass')
                        : result.isPassed === false
                        ? (isAr ? 'راسب' : 'Fail')
                        : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
