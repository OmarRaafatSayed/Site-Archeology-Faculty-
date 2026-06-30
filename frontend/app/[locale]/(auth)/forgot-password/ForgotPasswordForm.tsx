'use client';

import { useState } from 'react';
import { forgotPasswordApi } from '@/lib/api/auth';

type Props = { locale: string };

export default function ForgotPasswordForm({ locale }: Props) {
  const isAr = locale === 'ar';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setSent(true);
    } catch {
      setError(isAr ? 'حدث خطأ. تأكد من البريد الإلكتروني وحاول مجدداً.' : 'An error occurred. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isAr ? 'تم الإرسال!' : 'Email Sent!'}
        </h3>
        <p className="text-sm text-gray-600">
          {isAr
            ? `تم إرسال رابط إعادة التعيين إلى ${email}. تحقق من بريدك الإلكتروني.`
            : `A reset link was sent to ${email}. Check your inbox.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} dir={isAr ? 'rtl' : 'ltr'} noValidate>
      <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
        {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        {isAr
          ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
          : 'Enter your email and we\'ll send you a reset link'}
      </p>

      {error && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          {isAr ? 'البريد الإلكتروني' : 'Email'}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition text-sm"
          placeholder="example@cu.edu.eg"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{isAr ? 'جارٍ الإرسال...' : 'Sending...'}</>
        ) : (
          isAr ? 'إرسال رابط الاستعادة' : 'Send Reset Link'
        )}
      </button>
    </form>
  );
}
