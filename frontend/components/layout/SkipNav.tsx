/**
 * SkipNav — Phase 9: Accessibility
 * ==================================
 * Keyboard skip navigation — يسمح لمستخدمي لوحة المفاتيح
 * بتخطي الـ Navbar والانتقال مباشرة للمحتوى الرئيسي.
 * مخفي بصرياً حتى يتلقى focus.
 */
'use client';

interface SkipNavProps {
  locale?: string;
}

export default function SkipNav({ locale = 'ar' }: SkipNavProps) {
  const isAr = locale === 'ar';

  return (
    <a
      href="#main-content"
      className={`
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:z-[9999]
        focus:px-6 focus:py-3
        focus:bg-primary-600 focus:text-white
        focus:font-semibold focus:text-sm focus:rounded-xl
        focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400
        transition-all
        ${isAr ? 'focus:right-4' : 'focus:left-4'}
      `}
    >
      {isAr ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'}
    </a>
  );
}
