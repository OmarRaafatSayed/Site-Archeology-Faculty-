/**
 * (public) Route Group Layout
 * الصفحات العامة — مع PublicNavbar و Footer
 */
import PublicNavbar from '@/components/layout/PublicNavbar';
import Footer from '@/components/layout/Footer';
import SkipNav from '@/components/layout/SkipNav';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function PublicLayout({ children, params: { locale } }: Props) {
  return (
    <>
      <SkipNav locale={locale} />
      <PublicNavbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}
