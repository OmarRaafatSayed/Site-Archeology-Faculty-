/**
 * صفحة تسجيل الدخول — توجّه حسب الـ Role بعد النجاح
 * Student → /student/dashboard
 * Faculty → /faculty/dashboard
 * Admin / CM → /admin/dashboard
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from './LoginForm';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'تسجيل الدخول' : 'Login',
    description: locale === 'ar' ? 'تسجيل الدخول للبوابة الأكاديمية' : 'Login to the academic portal',
  };
}

export default function LoginPage({ params: { locale } }: Props) {
  return (
    <div className="w-full max-w-md">
      {/* Logo / header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-gold-600 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-gold">
          آ
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === 'ar' ? 'كلية الآثار' : 'Faculty of Archaeology'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {locale === 'ar' ? 'البوابة الأكاديمية' : 'Academic Portal'}
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
        <LoginForm locale={locale} />
      </div>

      {/* Back to site */}
      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href={`/${locale}`} className="hover:text-gold-700 transition-colors">
          {locale === 'ar' ? '← العودة للموقع' : '← Back to website'}
        </Link>
      </p>
    </div>
  );
}
