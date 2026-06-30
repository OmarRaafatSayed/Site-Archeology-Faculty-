import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { buildOrganizationSchema } from '@/lib/utils/seo';
import LayoutContent from './LayoutContent';
import './globals.css';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';

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
      ? 'الموقع الرسمي لكلية الآثار بجامعة القاهرة — أول كلية آثار مستقلة في العالم العربي، تأسست عام ١٩٧٠'
      : 'Official website of the Faculty of Archaeology, Cairo University — the first independent archaeology faculty in the Arab world, founded in 1970',
    keywords: isArabic
      ? ['كلية الآثار', 'جامعة القاهرة', 'آثار مصرية', 'ترميم الآثار', 'علم الآثار الإسلامية', 'آثار يونانية رومانية']
      : ['Faculty of Archaeology', 'Cairo University', 'Egyptology', 'Conservation', 'Islamic Archaeology', 'Greco-Roman'],
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ar: `${BASE_URL}/ar`,
        en: `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isArabic ? 'ar_EG' : 'en_US',
      alternateLocale: isArabic ? 'en_US' : 'ar_EG',
      siteName: isArabic ? 'كلية الآثار — جامعة القاهرة' : 'Faculty of Archaeology — Cairo University',
      url: `${BASE_URL}/${locale}`,
      images: [
        {
          url: `${BASE_URL}/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: isArabic ? 'كلية الآثار — جامعة القاهرة' : 'Faculty of Archaeology — Cairo University',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@CairoUniversity',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (locale !== 'ar' && locale !== 'en') notFound();

  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <JsonLd data={buildOrganizationSchema()} />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-white text-gray-900" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
