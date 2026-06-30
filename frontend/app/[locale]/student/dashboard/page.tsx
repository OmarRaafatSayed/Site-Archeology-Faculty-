/**
 * Student Dashboard Overview
 * جدول اليوم + أقرب امتحان + آخر نتيجة
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  getStudentProfile, getStudentSchedule, getStudentExams, getStudentResults,
  type StudentProfile, type ScheduleEntry, type ExamEntry, type StudentResult,
} from '@/lib/api/dashboard';
import { localize, formatDate } from '@/lib/utils/locale';
import StatCard from '@/components/dashboard/StatCard';

const DAY_NAMES_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentOverviewPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStudentProfile().catch(() => null),
      getStudentSchedule().catch(() => []),
      getStudentExams().catch(() => []),
      getStudentResults().catch(() => []),
    ]).then(([p, s, e, r]) => {
      setProfile(p);
      setSchedule(s);
      setExams(e);
      setResults(r);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="w-8 h-8 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const todayIdx = new Date().getDay(); // 0=Sun
  const todaySchedule = schedule.filter((s) => s.dayOfWeek === todayIdx);
  const nextExam = exams[0] ?? null;
  const lastResult = results[0] ?? null;
  const passedCount = results.filter((r) => r.isPassed === true).length;

  const base = `/${locale}/student/dashboard`;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isAr ? `أهلاً، ${profile?.nameAr ?? ''}` : `Welcome, ${profile?.nameEn ?? profile?.nameAr ?? ''}`}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {isAr
            ? `${profile?.academicYear ?? ''} — الفرقة ${profile?.level ?? ''}`
            : `${profile?.academicYear ?? ''} — Year ${profile?.level ?? ''}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={isAr ? 'حصص اليوم' : "Today's Classes"}
          value={todaySchedule.length}
          accentColor="bg-blue-600"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label={isAr ? 'الامتحانات القادمة' : 'Upcoming Exams'}
          value={exams.length}
          accentColor="bg-orange-600"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label={isAr ? 'نتائج منشورة' : 'Published Results'}
          value={results.length}
          accentColor="bg-blue-700"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <StatCard
          label={isAr ? 'مقررات ناجح' : 'Passed Courses'}
          value={passedCount}
          accentColor="bg-green-600"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {isAr ? `جدول ${DAY_NAMES_AR[todayIdx]}` : `${DAY_NAMES_EN[todayIdx]}'s Schedule`}
            </h3>
            <Link href={`${base}/schedule`} className="text-xs text-primary-600 hover:underline">
              {isAr ? 'الجدول الكامل' : 'Full schedule'}
            </Link>
          </div>
          {todaySchedule.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {isAr ? 'لا توجد حصص اليوم' : 'No classes today'}
            </p>
          ) : (
            <div className="space-y-2">
              {todaySchedule.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="text-xs text-gray-500 shrink-0 w-24 text-center font-mono">
                    {entry.startTime} – {entry.endTime}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {localize(entry.course.nameAr, entry.course.nameEn, locale)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {entry.course.code}
                      {entry.roomNumber ? ` • ${isAr ? 'قاعة' : 'Room'} ${entry.roomNumber}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Exam + Last Result */}
        <div className="space-y-4">
          {/* Next exam */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{isAr ? 'أقرب امتحان' : 'Next Exam'}</h3>
              <Link href={`${base}/exams`} className="text-xs text-primary-600 hover:underline">
                {isAr ? 'كل الامتحانات' : 'All exams'}
              </Link>
            </div>
            {!nextExam ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {isAr ? 'لا توجد امتحانات قادمة' : 'No upcoming exams'}
              </p>
            ) : (
              <div className="flex items-start gap-4">
                <div className="bg-orange-50 rounded-lg p-3 text-center min-w-[56px]">
                  <p className="text-lg font-bold text-orange-600 leading-none">
                    {new Date(nextExam.examDate).getDate()}
                  </p>
                  <p className="text-xs text-orange-500 mt-0.5" suppressHydrationWarning>
                    {new Date(nextExam.examDate).toLocaleString(isAr ? 'ar-EG' : 'en-US', { month: 'short' })}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {localize(nextExam.course.nameAr, nextExam.course.nameEn, locale)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {nextExam.startTime} – {nextExam.endTime}
                    {nextExam.hallNumber ? ` • ${isAr ? 'قاعة' : 'Hall'} ${nextExam.hallNumber}` : ''}
                  </p>
                  <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium
                    ${nextExam.examType === 'final' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {nextExam.examType === 'final' ? (isAr ? 'نهائي' : 'Final') : (isAr ? 'منتصف الفصل' : 'Midterm')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Last result */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{isAr ? 'آخر نتيجة' : 'Latest Result'}</h3>
              <Link href={`${base}/results`} className="text-xs text-primary-600 hover:underline">
                {isAr ? 'كل النتائج' : 'All results'}
              </Link>
            </div>
            {!lastResult ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {isAr ? 'لا توجد نتائج منشورة بعد' : 'No results published yet'}
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shrink-0
                  ${lastResult.isPassed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {lastResult.gradeLetter ?? (lastResult.totalScore ?? '—')}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {localize(lastResult.course.nameAr, lastResult.course.nameEn, locale)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isAr ? 'المجموع:' : 'Total:'} {lastResult.totalScore ?? '—'} / 100
                  </p>
                  <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium
                    ${lastResult.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {lastResult.isPassed ? (isAr ? 'ناجح' : 'Passed') : (isAr ? 'راسب' : 'Failed')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
