/**
 * Admin Dashboard Overview — 9 إحصائيات + آخر أخبار + Audit Log مختصر
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { getDashboardStats, type DashboardStats } from '@/lib/api/dashboard';
import { localize, formatDate } from '@/lib/utils/locale';
import StatCard from '@/components/dashboard/StatCard';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-gray-100 text-gray-600',
  LOGOUT: 'bg-gray-100 text-gray-600',
};

export default function AdminOverviewPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const base = `/${locale}/admin/dashboard`;

  if (loading) return (
    <div className="flex justify-center py-12">
      <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  const statItems = stats ? [
    { label: isAr ? 'الطلاب' : 'Students', value: stats.totalStudents, color: 'bg-blue-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /></svg>, href: `${base}/students` },
    { label: isAr ? 'هيئة التدريس' : 'Faculty', value: stats.totalFaculty, color: 'bg-indigo-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, href: `${base}/faculty` },
    { label: isAr ? 'المقررات' : 'Courses', value: stats.totalCourses, color: 'bg-emerald-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, href: `${base}/courses` },
    { label: isAr ? 'الأخبار' : 'News', value: stats.totalNews, color: 'bg-amber-500', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>, href: `${base}/news` },
    { label: isAr ? 'الأبحاث' : 'Publications', value: stats.totalPublications, color: 'bg-blue-700', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, href: `${base}/faculty` },
    { label: isAr ? 'المكتبة' : 'Library', value: stats.totalLibraryBooks, color: 'bg-rose-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>, href: `${base}/library` },
    { label: isAr ? 'المؤتمرات' : 'Conferences', value: stats.totalConferences, color: 'bg-cyan-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, href: `${base}/conferences` },
    { label: isAr ? 'التسجيلات' : 'Registrations', value: stats.totalRegistrations, color: 'bg-violet-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, href: `${base}/conferences` },
    { label: isAr ? 'المستخدمون' : 'Users', value: stats.totalUsers, color: 'bg-slate-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, href: `${base}/users` },
  ] : [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{isAr ? 'لوحة التحكم' : 'Dashboard'}</h2>
        <p className="text-sm text-gray-500 mt-1">{isAr ? 'نظرة عامة على كلية الآثار' : 'Overview of the Faculty of Archaeology'}</p>
      </div>

      {/* Stats grid — 3 columns on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statItems.map(({ label, value, color, icon, href }) => (
          <Link key={label} href={href} className="block hover:scale-[1.01] transition-transform">
            <StatCard label={label} value={value} accentColor={color} icon={icon} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest news */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{isAr ? 'آخر الأخبار' : 'Latest News'}</h3>
            <Link href={`${base}/news`} className="text-xs text-primary-600 hover:underline">
              {isAr ? 'إدارة الأخبار' : 'Manage news'}
            </Link>
          </div>
          {!stats?.latestNews?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">{isAr ? 'لا توجد أخبار' : 'No news'}</p>
          ) : (
            <div className="space-y-2">
              {stats.latestNews.map((n) => (
                <div key={n.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${n.isPublished ? 'bg-green-500' : 'bg-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.titleAr}</p>
                    <p className="text-xs text-gray-400">{formatDate(n.publishedAt, locale)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0
                    ${n.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {n.isPublished ? (isAr ? 'منشور' : 'Live') : (isAr ? 'مسودة' : 'Draft')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{isAr ? 'آخر الأنشطة' : 'Recent Activity'}</h3>
            <Link href={`${base}/audit-logs`} className="text-xs text-primary-600 hover:underline">
              {isAr ? 'السجل الكامل' : 'Full log'}
            </Link>
          </div>
          {!stats?.recentAuditLogs?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">{isAr ? 'لا توجد أنشطة' : 'No activity'}</p>
          ) : (
            <div className="space-y-2">
              {stats.recentAuditLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                    ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                    {log.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">
                      {log.entityType}
                      {log.user ? ` • ${log.user.nameAr}` : ''}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(log.createdAt, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
