/**
 * Auth Store — Zustand
 * يحتفظ ببيانات المستخدم الحالي وحالة المصادقة
 * يستخدم في كل الـ Dashboards
 */
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'student' | 'faculty' | 'content_manager' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  nameAr: string | null;
  nameEn: string | null;
  username?: string;
  universityId?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;

  setUser: (user: AuthUser, token: string) => void;
  clearUser: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setUser: (user, accessToken) => set({ user, accessToken }),
      clearUser: () => set({ user: null, accessToken: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'fa-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    }
  )
);
