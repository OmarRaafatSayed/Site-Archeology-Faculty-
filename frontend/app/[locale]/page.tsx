import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('nav');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-white p-8">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-primary-700">
          كلية الآثار — جامعة القاهرة
        </h1>
        <h2 className="mb-2 text-2xl text-primary-600">
          Faculty of Archaeology — Cairo University
        </h2>
        
        <div className="mt-8 rounded-lg bg-white p-6 shadow-lg">
          <p className="text-lg font-medium text-green-600">
            ✅ Phase 0 — Project Setup Complete
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Backend: http://localhost:3001/health
          </p>
          <p className="text-sm text-gray-600">
            Frontend: http://localhost:3000
          </p>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Next: Phase 1 — Auth System</p>
        </div>
      </div>
    </main>
  );
}
