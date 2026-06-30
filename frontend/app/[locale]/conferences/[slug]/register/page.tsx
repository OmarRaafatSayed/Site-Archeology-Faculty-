'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';

interface FormData {
  fullName: string;
  institution: string;
  email: string;
  phone: string;
  participationType: 'presenter' | 'attendee';
  paperTitle: string;
  abstract: string;
}

export default function ConferenceRegisterPage() {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const isAr = locale === 'ar';

  // We need the conference ID not slug for registration — fetch it first
  const [confId, setConfId] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regCode, setRegCode] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    institution: '',
    email: '',
    phone: '',
    participationType: 'attendee',
    paperTitle: '',
    abstract: '',
  });

  // Fetch conference ID from slug on mount
  useState(() => {
    apiClient.get(`/conferences/${params.slug}`)
      .then((r) => setConfId(r.data.data.id))
      .catch(() => setError(isAr ? 'تعذر تحميل بيانات المؤتمر' : 'Failed to load conference'));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post(`/conferences/${confId}/register`, form);
      setRegCode(data.data.registrationCode);
      setStep('success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? (isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="text-5xl mb-6">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{isAr ? 'تم التسجيل بنجاح!' : 'Registration Successful!'}</h1>
        <p className="text-gray-600 mb-6">{isAr ? 'رقم تسجيلك:' : 'Your registration code:'}</p>
        <div className="inline-block bg-gray-900 text-primary-400 font-mono text-xl font-bold px-8 py-4 rounded-xl mb-8 tracking-widest">
          {regCode}
        </div>
        <p className="text-sm text-gray-500 mb-8">{isAr ? 'سيصلك بريد تأكيد على عنوانك الإلكتروني.' : 'A confirmation email has been sent to your address.'}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          {isAr ? 'العودة' : 'Go Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16" dir={isAr ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{isAr ? 'التسجيل في المؤتمر' : 'Conference Registration'}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {isAr ? 'الاسم الكامل *' : 'Full Name *'}
          </label>
          <input type="text" required value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {isAr ? 'البريد الإلكتروني *' : 'Email *'}
          </label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Institution + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{isAr ? 'المؤسسة' : 'Institution'}</label>
            <input type="text" value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{isAr ? 'الهاتف' : 'Phone'}</label>
            <input type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        {/* Participation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{isAr ? 'نوع المشاركة *' : 'Participation Type *'}</label>
          <div className="flex gap-4">
            {(['attendee', 'presenter'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="participationType" value={type} checked={form.participationType === type}
                  onChange={() => setForm({ ...form, participationType: type })}
                  className="text-primary-600" />
                <span className="text-sm text-gray-700">
                  {type === 'attendee' ? (isAr ? 'حضور' : 'Attendee') : (isAr ? 'باحث مقدم' : 'Presenter')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Paper info (presenter only) */}
        {form.participationType === 'presenter' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isAr ? 'عنوان البحث' : 'Paper Title'}</label>
              <input type="text" value={form.paperTitle}
                onChange={(e) => setForm({ ...form, paperTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isAr ? 'ملخص البحث' : 'Abstract'}</label>
              <textarea rows={5} value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {loading ? (isAr ? 'جارٍ التسجيل...' : 'Submitting...') : (isAr ? 'تأكيد التسجيل' : 'Submit Registration')}
        </button>
      </form>
    </div>
  );
}
