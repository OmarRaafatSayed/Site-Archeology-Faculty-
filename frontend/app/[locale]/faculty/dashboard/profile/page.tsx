/**
 * Faculty Profile — ملف عضو التدريس
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getFacultyProfile, updateFacultyProfile, type FacultyProfile } from '@/lib/api/dashboard';
import { localize, degreeLabel } from '@/lib/utils/locale';

export default function FacultyProfilePage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ phone: '', officeNumber: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFacultyProfile()
      .then((p) => {
        setProfile(p);
        setForm({ phone: p.phone ?? '', officeNumber: p.officeNumber ?? '', bio: p.bio ?? '' });
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await updateFacultyProfile(form);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{isAr ? 'ملفي الشخصي' : 'My Profile'}</h2>
        <p className="text-sm text-gray-500 mt-1">{isAr ? 'بياناتك الأكاديمية والشخصية' : 'Your academic and personal data'}</p>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        {profile?.photoUrl ? (
          <img src={profile.photoUrl} alt={profile.nameAr}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary-100 shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl shrink-0">
            {profile?.nameAr?.charAt(0) ?? '?'}
          </div>
        )}
        <div>
          <p className="text-xl font-bold text-gray-900">{profile?.nameAr}</p>
          {profile?.nameEn && <p className="text-sm text-gray-500">{profile.nameEn}</p>}
          <p className="text-sm text-primary-600 font-medium mt-1">
            {profile ? degreeLabel(profile.degree, locale) : ''}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {profile?.department ? localize(profile.department.nameAr, profile.department.nameEn, locale) : ''}
          </p>
        </div>
      </div>

      {/* Read-only info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">{isAr ? 'البيانات الأكاديمية' : 'Academic Data'}</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: isAr ? 'البريد الإلكتروني' : 'Email', value: profile?.email },
            { label: isAr ? 'التخصص (عربي)' : 'Specialization (AR)', value: profile?.specializationAr },
            { label: isAr ? 'التخصص (إنجليزي)' : 'Specialization (EN)', value: profile?.specializationEn },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
              <dd className="text-sm font-medium text-gray-900">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Editable form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
        dir={isAr ? 'rtl' : 'ltr'}>
        <h3 className="font-semibold text-gray-800">{isAr ? 'تعديل البيانات' : 'Edit Information'}</h3>

        {error && <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        {saved && <div role="status" className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{isAr ? 'تم الحفظ ✓' : 'Saved ✓'}</div>}

        {[
          { id: 'phone', label: isAr ? 'رقم الهاتف' : 'Phone', type: 'tel' },
          { id: 'officeNumber', label: isAr ? 'رقم المكتب' : 'Office Number', type: 'text' },
        ].map(({ id, label, type }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
              id={id}
              type={type}
              value={form[id as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition text-sm"
            />
          </div>
        ))}

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">
            {isAr ? 'نبذة شخصية' : 'Biography'}
          </label>
          <textarea
            id="bio"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition text-sm resize-none"
          />
        </div>

        <button type="submit" disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 transition-colors">
          {saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
        </button>
      </form>
    </div>
  );
}
