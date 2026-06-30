/**
 * صفحة نسيت كلمة المرور
 */
import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'نسيت كلمة المرور' : 'Forgot Password' };
}

export default function ForgotPasswordPage({ params: { locale } }: Props) {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold mb-4">
          آ
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {locale === 'ar' ? 'استعادة كلمة المرور' : 'Password Recovery'}
        </h1>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <ForgotPasswordForm locale={locale} />
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        <a href={`/${locale}/login`} className="hover:text-primary-400 transition-colors">
          {locale === 'ar' ? '← العودة لتسجيل الدخول' : '← Back to Login'}
        </a>
      </p>
    </div>
  );
}
