/**
 * Student Exams — جدول الامتحانات القادمة
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getStudentExams, type ExamEntry } from '@/lib/api/dashboard';
import { localize, formatDate } from '@/lib/utils/locale';

export default function StudentExamsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentExams()
      .then(setExams)
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  const midterms = exams.filter((e) => e.examType === 'midterm');
  const finals = exams.filter((e) => e.examType === 'final');

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{isAr ? 'جدول الامتحانات' : 'Exam Schedule'}</h2>
        <p className="text-sm text-gray-500 mt-1">{isAr ? 'امتحاناتك القادمة' : 'Your upcoming exams'}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-gray-400">{isAr ? 'لا توجد امتحانات قادمة حالياً' : 'No upcoming exams at the moment'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { type: 'final', label: isAr ? 'الامتحانات النهائية' : 'Final Exams', items: finals, color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700' },
            { type: 'midterm', label: isAr ? 'امتحانات منتصف الفصل' : 'Midterm Exams', items: midterms, color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
          ].map(({ type, label, items, color, badge }) =>
            items.length > 0 ? (
              <div key={type}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
                <div className="space-y-3">
                  {items.map((exam) => {
                    const daysLeft = Math.ceil(
                      (new Date(exam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={exam.id}
                        className={`bg-white rounded-xl border shadow-sm p-5 flex items-center gap-4`}>
                        {/* Date badge */}
                        <div className={`rounded-xl p-3 text-center shrink-0 border ${color}`}>
                          <p className="text-xl font-bold leading-none text-gray-900">
                            {new Date(exam.examDate).getDate()}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5" suppressHydrationWarning>
                            {new Date(exam.examDate).toLocaleString(isAr ? 'ar-EG' : 'en-US', { month: 'short' })}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm">
                              {localize(exam.course.nameAr, exam.course.nameEn, locale)}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>
                              {type === 'final' ? (isAr ? 'نهائي' : 'Final') : (isAr ? 'منتصف' : 'Midterm')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {exam.course.code} • {exam.startTime} – {exam.endTime}
                            {exam.hallNumber ? ` • ${isAr ? 'قاعة' : 'Hall'} ${exam.hallNumber}` : ''}
                          </p>
                        </div>

                        <div className="text-center shrink-0">
                          <p className={`text-lg font-bold ${daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-500' : 'text-gray-400'}`}>
                            {daysLeft}
                          </p>
                          <p className="text-xs text-gray-400">{isAr ? 'يوم' : 'days'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
