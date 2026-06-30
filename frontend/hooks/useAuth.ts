'use client';

/**
 * useAuth Hook
 * يوفر دوال تسجيل الدخول والخروج مع تحديث الـ Store
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/auth';
import { loginApi, logoutApi, type LoginPayload } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

export function useAuth() {
  const router = useRouter();
  const locale = useLocale();
  const { user, accessToken, isLoading, setUser, clearUser, setLoading } = useAuthStore();

  // Inject token on every render — safe because apiClient is a module singleton.
  // The null-check in the API client interceptor guards against undefined tokens.
  if (accessToken) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        // Clear stale state before the new request
        clearUser();
        delete apiClient.defaults.headers.common['Authorization'];

        const { user: u, accessToken: token } = await loginApi(payload);

        setUser(u, token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Redirect based on role
        const base = `/${locale}`;
        if (u.role === 'student') {
          router.push(`${base}/student/dashboard`);
        } else if (u.role === 'faculty') {
          router.push(`${base}/faculty/dashboard`);
        } else {
          router.push(`${base}/admin/dashboard`);
        }
        
        // Keep loading state true during navigation to prevent UI flicker
        // setLoading(false) will happen after the component unmounts
      } catch (error) {
        // Only clear loading on error
        setLoading(false);
        throw error;
      }
    },
    [clearUser, locale, router, setLoading, setUser]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // fail-safe
    } finally {
      clearUser();
      delete apiClient.defaults.headers.common['Authorization'];
      router.push(`/${locale}/login`);
    }
  }, [clearUser, locale, router]);

  return { user, accessToken, isLoading, login, logout };
}
