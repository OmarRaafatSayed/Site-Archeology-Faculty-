/**
 * Student Schedule — الجدول الدراسي الأسبوعي
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getStudentSchedule, type ScheduleEntry } from '@/lib/api/dashboard';
import { localize } from '@/lib/utils/locale';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export default function StudentSchedulePage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentSchedule()
      .then(setSchedule)
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, []);

  const todayIdx = new Date().getDay();
  const grouped = [0, 1, 2, 3, 4].map((day) => ({
    day,
    entries: schedule.filter((s) => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{isAr ? 'الجدول الدراسي' : 'Weekly Schedule'}</h2>
        <p className="text-sm text-gray-500 mt-1">{isAr ? 'جدولك الأسبوعي الكامل' : 'Your full weekly timetable'}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ day, entries }) => (
            <div key={day} className={`bg-white rounded-xl border shadow-sm overflow-hidden
              ${day === todayIdx ? 'border-primary-300 ring-1 ring-primary-200' : 'border-gray-100'}`}>
              <div className={`px-5 py-3 flex items-center justify-between
                ${day === todayIdx ? 'bg-primary-50' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold text-sm ${day === todayIdx ? 'text-primary-700' : 'text-gray-700'}`}>
                  {isAr ? DAYS_AR[day] : DAYS_EN[day]}
                </h3>
                {day === todayIdx && (
                  <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                    {isAr ? 'اليوم' : 'Today'}
                  </span>
                )}
                <span className="text-xs text-gray-400">{entries.length} {isAr ? 'حصص' : 'classes'}</span>
              </div>

              {entries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-5">{isAr ? 'لا توجد حصص' : 'No classes'}</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {entries.map((entry) => (
                    <div key={entry.id} className="px-5 py-3 flex items-center gap-4">
                      <div className="text-xs text-gray-400 font-mono shrink-0 w-28 text-center bg-gray-50 rounded-md py-1">
                        {entry.startTime} – {entry.endTime}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {localize(entry.course.nameAr, entry.course.nameEn, locale)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {entry.course.code}
                          {entry.facultyMember
                            ? ` • ${localize(entry.facultyMember.nameAr, entry.facultyMember.nameEn, locale)}`
                            : ''}
                        </p>
                      </div>
                      {entry.roomNumber && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md shrink-0">
                          {isAr ? 'قاعة' : 'Room'} {entry.roomNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
