import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // قائمة اللغات المدعومة
  locales: ['ar', 'en'],
  
  // اللغة الافتراضية
  defaultLocale: 'ar',
  
  // إعادة توجيه المستخدم للغة المناسبة تلقائياً
  localeDetection: true,
});

export const config = {
  // تطبيق الـ middleware على كل المسارات ما عدا API وملفات static
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
