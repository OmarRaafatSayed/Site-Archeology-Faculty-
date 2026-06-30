/**
 * Auth API — Client-side calls (Axios)
 * تسجيل الدخول / الخروج / تجديد الـ Token
 */
import { apiClient } from './client';
import type { AuthUser } from '@/store/auth';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

/** تسجيل الدخول */
export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ success: boolean; data: LoginResponse }>(
    '/auth/login',
    payload
  );
  return data.data;
}

/** تسجيل الخروج */
export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/** تجديد الـ Access Token من الـ Refresh Token (HttpOnly Cookie) */
export async function refreshTokenApi(): Promise<{ accessToken: string; user: AuthUser }> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: { accessToken: string; user: AuthUser };
  }>('/auth/refresh');
  return data.data;
}

/** طلب إعادة تعيين كلمة المرور */
export async function forgotPasswordApi(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

/** إعادة تعيين كلمة المرور بعد التحقق */
export async function resetPasswordApi(token: string, password: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, password });
}
