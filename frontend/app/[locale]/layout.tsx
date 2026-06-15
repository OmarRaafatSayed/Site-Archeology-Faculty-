import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import './globals.css';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isArabic = locale === 'ar';
  
  return {
    title: {
      template: isArabic 
        ? '%s | كلية الآثار — جامعة القاهرة' 
        : '%s | Faculty of Archaeology - Cairo University',
      default: isArabic 
        ? 'كلية الآثار — جامعة القاهرة' 
        : 'Faculty of Archaeology - Cairo University',
    },
    description: isArabic
      ? 'الموقع الرسمي لكلية الآثار بجامعة القاهرة'
      : 'Official website of the Faculty of Archaeology - Cairo University',
  };
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  // Validate locale
  if (locale !== 'ar' && locale !== 'en') {
    notFound();
  }

  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
