/**
 * Faculty Publications — CRUD أبحاث عضو التدريس
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  getFacultyProfile,
  createPublication,
  updatePublication,
  deletePublication,
  type FacultyPublication,
} from '@/lib/api/dashboard';
import { apiFetch } from '@/lib/api/client';
import { localize } from '@/lib/utils/locale';
import type { PaginatedResponse } from '@/lib/api/types';

const EMPTY: Partial<FacultyPublication> = {
  titleAr: '', titleEn: '', abstractAr: '',
  journalName: '', publishYear: new Date().getFullYear(), doi: '',
};

export default function FacultyPublicationsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [facultyId, setFacultyId] = useState<string>('');
  const [pubs, setPubs] = useState<FacultyPublication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FacultyPublication | null>(null);
  const [form, setForm] = useState<Partial<FacultyPublication>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadPubs = (fid: string) =>
    apiFetch<PaginatedResponse<FacultyPublication>>(`/faculty/${fid}/publications`, { limit: 100 })
      .then((res) => { setPubs(res.items); setTotal(res.total); })
      .catch(() => null);

  useEffect(() => {
    getFacultyProfile()
      .then((p) => { setFacultyId(p.id); return loadPubs(p.id); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setShowForm(true);
  }

  function openEdit(pub: FacultyPublication) {
    setEditing(pub);
    setForm({ ...pub });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await updatePublication(editing.id, form);
      } else {
        await createPublication(form);
      }
      setShowForm(false);
      await loadPubs(facultyId);
    } catch {
      setError(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(isAr ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
    setDeleting(id);
    try {
      await deletePublication(id);
      setPubs((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert(isAr ? 'فشل الحذف' : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'أبحاثي' : 'My Publications'}</h2>
          <p className="text-sm text-gray-500 mt-1">{isAr ? `${total} بحث` : `${total} publications`}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isAr ? 'إضافة بحث' : 'Add Publication'}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {editing ? (isAr ? 'تعديل البحث' : 'Edit Publication') : (isAr ? 'إضافة بحث جديد' : 'New Publication')}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
              {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
              {[
                { id: 'titleAr', label: isAr ? 'عنوان البحث (عربي)' : 'Title (Arabic)', required: true },
                { id: 'titleEn', label: isAr ? 'عنوان البحث (إنجليزي)' : 'Title (English)', required: false },
                { id: 'journalName', label: isAr ? 'اسم المجلة' : 'Journal Name', required: false },
                { id: 'doi', label: 'DOI', required: false },
              ].map(({ id, label, required }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={id}
                    type="text"
                    required={required}
                    value={(form[id as keyof typeof form] as string) ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="publishYear" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'سنة النشر' : 'Publish Year'}
                </label>
                <input
                  id="publishYear"
                  type="number"
                  min={1950}
                  max={new Date().getFullYear()}
                  value={form.publishYear ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, publishYear: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label htmlFor="abstractAr" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'الملخص' : 'Abstract'}
                </label>
                <textarea
                  id="abstractAr"
                  rows={3}
                  value={form.abstractAr ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, abstractAr: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : pubs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 mb-3">{isAr ? 'لم تضف أي أبحاث بعد' : 'No publications yet'}</p>
          <button onClick={openCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
            {isAr ? 'إضافة أول بحث' : 'Add your first publication'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pubs.map((pub) => (
            <div key={pub.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {localize(pub.titleAr, pub.titleEn, locale)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pub.journalName ?? '—'}
                    {pub.publishYear ? ` • ${pub.publishYear}` : ''}
                    {pub.doi ? ` • DOI: ${pub.doi}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${pub.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {pub.isPublished ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
                  </span>
                  <button
                    onClick={() => openEdit(pub)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    aria-label={isAr ? 'تعديل' : 'Edit'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(pub.id)}
                    disabled={deleting === pub.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    aria-label={isAr ? 'حذف' : 'Delete'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
