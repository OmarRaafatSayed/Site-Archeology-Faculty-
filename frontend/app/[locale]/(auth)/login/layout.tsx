/**
 * Login page layout — داخل route group (auth)
 * يضيف centered container للـ login form
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      {/* Gold top accent */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
      {children}
    </div>
  );
}
