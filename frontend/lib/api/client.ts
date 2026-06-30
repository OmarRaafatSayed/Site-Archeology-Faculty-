/**
 * Axios API client
 * Base URL يأتي من NEXT_PUBLIC_API_URL
 */
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10_000,
});

// Null-check guard: strip the Authorization header if the token is missing
// or invalid, preventing the "startsWith of undefined" runtime crash.
apiClient.interceptors.request.use((config) => {
  const auth = config.headers?.['Authorization'] as string | undefined;
  if (!auth || !auth.startsWith('Bearer ') || auth === 'Bearer undefined' || auth === 'Bearer null') {
    delete config.headers['Authorization'];
  }
  return config;
});

/** GET helper — returns data or throws */
export async function apiFetch<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<{ success: boolean; data: T }>(url, { params });
  return data.data as T;
}
