/**
 * Faculty Dashboard Overview
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { getFacultyProfile, type FacultyProfile, type FacultyPublication } from '@/lib/api/dashboard';
import { apiFetch } from '@/lib/api/client';
import { localize, degreeLabel } from '@/lib/utils/locale';
import StatCard from '@/components/dashboard/StatCard';
import type { PaginatedResponse } from '@/lib/api/types';

export default function FacultyOverviewPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [pubsCount, setPubsCount] = useState(0);
  const [recentPubs, setRecentPubs] = useState<FacultyPublication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFacultyProfile().catch(() => null),
    ]).then(([p]) => {
      setProfile(p);
      if (p) {
        apiFetch<PaginatedResponse<FacultyPublication>>(`/faculty/${p.id}/publications`, { limit: 5 })
          .then((res) => { setPubsCount(res.total); setRecentPubs(res.items); })
          .catch(() => null);
      }
      setLoading(false);
    });
  }, []);

  const base = `/${locale}/faculty/dashboard`;

  if (loading) return (
    <div className="flex justify-center py-12">
      <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        {profile?.photoUrl ? (
          <img src={profile.photoUrl} alt={profile.nameAr} className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-primary-100" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl shrink-0">
            {profile?.nameAr?.charAt(0) ?? '?'}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isAr ? `مرحباً، ${profile?.nameAr ?? ''}` : `Welcome, ${profile?.nameEn ?? profile?.nameAr ?? ''}`}
          </h2>
          <p className="text-sm text-primary-600 font-medium">
            {profile ? degreeLabel(profile.degree, locale) : ''}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {profile?.department ? localize(profile.department.nameAr, profile.department.nameEn, locale) : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label={isAr ? 'إجمالي أبحاثي' : 'Total Publications'}
          value={pubsCount}
          accentColor="bg-primary-600"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          label={isAr ? 'بريدي الإلكتروني' : 'My Email'}
          value={profile?.email ?? '—'}
          accentColor="bg-blue-600"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
      </div>

      {/* Recent Publications */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{isAr ? 'آخر أبحاثي' : 'Recent Publications'}</h3>
          <Link href={`${base}/publications`} className="text-xs text-primary-600 hover:underline">
            {isAr ? 'إدارة الأبحاث' : 'Manage publications'}
          </Link>
        </div>
        {recentPubs.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-3">{isAr ? 'لم تضف أي أبحاث بعد' : 'No publications added yet'}</p>
            <Link href={`${base}/publications`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {isAr ? 'إضافة بحث' : 'Add Publication'}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPubs.map((pub) => (
              <div key={pub.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {localize(pub.titleAr, pub.titleEn, locale)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pub.journalName ?? '—'} {pub.publishYear ? `• ${pub.publishYear}` : ''}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0
                  ${pub.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {pub.isPublished ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
