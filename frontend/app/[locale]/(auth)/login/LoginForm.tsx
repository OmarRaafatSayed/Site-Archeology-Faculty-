'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type Props = { locale: string };

export default function LoginForm({ locale }: Props) {
  const isAr = locale === 'ar';
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPw,    setShowPw]       = useState(false);
  const [error,     setError]        = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ identifier, password });
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.message ??
        (err as any)?.response?.data?.error;
      setError(
        msg ??
          (isAr
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : 'Invalid email or password')
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} dir={isAr ? 'rtl' : 'ltr'} noValidate>
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
        {isAr ? 'تسجيل الدخول' : 'Sign In'}
      </h2>

      {error && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      {/* Identifier */}
      <div className="mb-4">
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1.5">
          {isAr ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}
        </label>
        <input
          id="identifier"
          type="text"
          autoComplete="username"
          required
          dir="ltr"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition text-sm"
          placeholder="example@fa-arch.cu.edu.eg"
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {isAr ? 'كلمة المرور' : 'Password'}
          </label>
          <Link
            href={`/${locale}/forgot-password`}
            className="text-xs text-gold-700 hover:text-gold-600 transition-colors"
          >
            {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition text-sm pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label={showPw
              ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password')
              : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
          >
            {showPw ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-gold-600 hover:bg-gold-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-sm"
      >
        {isLoading
          ? (isAr ? 'جارٍ تسجيل الدخول...' : 'Signing in...')
          : (isAr ? 'تسجيل الدخول' : 'Sign In')}
      </button>
    </form>
  );
}
