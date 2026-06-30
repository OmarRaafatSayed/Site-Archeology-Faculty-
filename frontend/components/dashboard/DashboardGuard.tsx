/**
 * DashboardGuard — يحمي صفحات الـ Dashboard من الوصول غير المصرح
 * يتحقق من الـ Auth Store ويعيد التوجيه للـ Login إذا لم يكن المستخدم مسجلاً
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore, type UserRole } from '@/store/auth';
import { apiClient } from '@/lib/api/client';

type Props = {
  children: React.ReactNode;
  allowedRoles: UserRole[];
};

export default function DashboardGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user, accessToken } = useAuthStore();

  /**
   * Hydration guard — Zustand يقرأ sessionStorage على الـ client فقط.
   * لازم نستنى mount قبل ما نحكم على الـ auth state، عشان نتجنب
   * flash of unauthenticated content أو redirect خاطئ على SSR.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  /**
   * حقن الـ Authorization header بشكل صحيح داخل useEffect
   * (مش أثناء الـ render — ده side-effect غير مسموح أثناء render)
   */
  useEffect(() => {
    if (accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Auth redirect — بعد mount فقط
  useEffect(() => {
    if (!mounted) return;

    if (!user || !accessToken) {
      router.replace(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      const base = `/${locale}`;
      if (user.role === 'student') router.replace(`${base}/student/dashboard`);
      else if (user.role === 'faculty') router.replace(`${base}/faculty/dashboard`);
      else router.replace(`${base}/admin/dashboard`);
    }
  }, [mounted, user, accessToken, allowedRoles, router, locale, pathname]);

  // Loading spinner حتى ينتهي hydration أو يتحقق الـ auth
  if (!mounted || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="w-8 h-8 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return <>{children}</>;
}
