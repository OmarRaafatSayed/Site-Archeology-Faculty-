/**
 * (auth) Route Group Layout
 * صفحات المصادقة — بدون PublicNavbar أو Footer
 * الـ route group "(auth)" لا يضيف segment للـ URL
 * Marker to tell root layout: don't add navbar/footer
 */

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  // This is a simple passthrough - it marks that pages in this group
  // should NOT get navbar/footer from LayoutContent
  return <>{children}</>;
}
