/**
 * DashboardShell — الهيكل المشترك لكل الـ Dashboards
 * Sidebar + Header + Content area
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { localize } from '@/lib/utils/locale';

export interface NavItem {
  href: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
  badge?: number;
}

type Props = {
  children: React.ReactNode;
  navItems: NavItem[];
  titleAr: string;
  titleEn: string;
};

export default function DashboardShell({ children, navItems, titleAr, titleEn }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAr = locale === 'ar';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className={`min-h-screen bg-gray-50 flex ${isAr ? 'flex-row-reverse' : 'flex-row'}`} dir={isAr ? 'rtl' : 'ltr'}>

      {/* ─── Sidebar ────────────────────────────────────────────────────── */}
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 z-40 w-64 bg-gray-900 flex flex-col transition-transform duration-300
          ${isAr ? 'right-0' : 'left-0'}
          ${sidebarOpen ? 'translate-x-0' : (isAr ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
        `}
        aria-label={isAr ? 'القائمة الجانبية' : 'Sidebar navigation'}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700/50">
          <div className="w-9 h-9 rounded-full bg-gold-600 flex items-center justify-center text-yellow-950 font-bold text-base shrink-0">
            آ
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {isAr ? titleAr : titleEn}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {user ? localize(user.nameAr, user.nameEn, locale) : ''}
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? 'bg-gold-600 text-yellow-950'
                  : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1">{isAr ? item.labelAr : item.labelEn}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[1.25rem] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-gray-700/50 space-y-1">
          <div className="px-3 py-2 text-xs text-gray-500">
            {user?.email}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isAr ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* ─── Main content ────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-h-screen ${isAr ? 'lg:mr-64' : 'lg:ml-64'}`}>

        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label={isAr ? 'فتح القائمة' : 'Open menu'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 lg:ps-2">
              <h1 className="text-base font-semibold text-gray-900">
                {isAr ? titleAr : titleEn}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Back to site */}
              <a
                href={`/${locale}`}
                className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {isAr ? 'الموقع الرئيسي' : 'Main Site'}
              </a>
              {/* User avatar */}
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                {user?.nameAr?.charAt(0) ?? '?'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
