/**
 * Student Profile — الملف الشخصي
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getStudentProfile, updateStudentProfile, type StudentProfile } from '@/lib/api/dashboard';
import { localize } from '@/lib/utils/locale';

export default function StudentProfilePage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStudentProfile()
      .then((p) => { setProfile(p); setPhone(p.phone ?? ''); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateStudentProfile({ phone });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const fields = [
    { label: isAr ? 'الاسم (عربي)' : 'Name (Arabic)', value: profile?.nameAr },
    { label: isAr ? 'الاسم (إنجليزي)' : 'Name (English)', value: profile?.nameEn },
    { label: isAr ? 'رقم القيد' : 'Student ID', value: profile?.studentId },
    { label: isAr ? 'البريد الإلكتروني' : 'Email', value: profile?.email },
    { label: isAr ? 'القسم' : 'Department', value: profile?.department ? localize(profile.department.nameAr, profile.department.nameEn, locale) : '—' },
    { label: isAr ? 'الفرقة' : 'Year', value: profile?.level },
    { label: isAr ? 'الفصل' : 'Semester', value: profile?.semester === 'first' ? (isAr ? 'الأول' : 'First') : (isAr ? 'الثاني' : 'Second') },
    { label: isAr ? 'العام الدراسي' : 'Academic Year', value: profile?.academicYear },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{isAr ? 'الملف الشخصي' : 'My Profile'}</h2>
        <p className="text-sm text-gray-500 mt-1">{isAr ? 'بياناتك الأكاديمية' : 'Your academic information'}</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl shrink-0">
          {profile?.nameAr?.charAt(0) ?? '?'}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{profile?.nameAr}</p>
          {profile?.nameEn && <p className="text-sm text-gray-500">{profile.nameEn}</p>}
          <p className="text-xs text-gray-400 mt-1">{profile?.email}</p>
        </div>
      </div>

      {/* Info grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">{isAr ? 'البيانات الأكاديمية' : 'Academic Data'}</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
              <dd className="text-sm font-medium text-gray-900">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Editable fields */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">{isAr ? 'تعديل البيانات' : 'Edit Information'}</h3>

        {error && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {saved && (
          <div role="status" className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {isAr ? 'تم الحفظ بنجاح ✓' : 'Changes saved successfully ✓'}
          </div>
        )}

        <div className="mb-5">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            {isAr ? 'رقم الهاتف' : 'Phone Number'}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition text-sm"
            placeholder="+201xxxxxxxxx"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {saving ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{isAr ? 'جارٍ الحفظ...' : 'Saving...'}</>
          ) : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
        </button>
      </form>
    </div>
  );
}
