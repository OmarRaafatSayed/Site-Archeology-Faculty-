/**
 * Admin Static Pages — تعديل الصفحات الثابتة
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import type { Page } from '@/lib/api/types';

export default function AdminPagesPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm] = useState({ titleAr: '', titleEn: '', contentAr: '', contentEn: '', metaDescriptionAr: '', metaDescriptionEn: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.get<{ success: boolean; data: Page[] }>('/pages')
      .then((res) => setPages(res.data.data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function openEdit(p: Page) {
    setEditing(p);
    setForm({ titleAr: p.titleAr, titleEn: p.titleEn ?? '', contentAr: p.contentAr ?? '', contentEn: p.contentEn ?? '', metaDescriptionAr: p.metaDescriptionAr ?? '', metaDescriptionEn: p.metaDescriptionEn ?? '' });
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await apiClient.put(`/pages/${editing.slug}`, form);
      setPages((prev) => prev.map((p) => p.slug === editing.slug ? { ...p, ...form } : p));
      setSaved(true);
    } catch { alert(isAr ? 'حدث خطأ' : 'Error'); } finally { setSaving(false); }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">{isAr ? 'الصفحات الثابتة' : 'Static Pages'}</h2>
        <p className="text-sm text-gray-500 mt-1">{isAr ? 'تعديل محتوى الصفحات الثابتة للموقع' : 'Edit static page content'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages list */}
        <div className="lg:col-span-1">
          {loading ? (
            <div className="flex justify-center py-8"><svg className="w-6 h-6 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {pages.map((p) => (
                <button key={p.slug} onClick={() => openEdit(p)}
                  className={`w-full text-start px-5 py-3.5 border-b border-gray-50 last:border-0 transition-colors
                    ${editing?.slug === p.slug ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                  <p className="font-medium text-sm">{p.titleAr}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.slug}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2">
          {!editing ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
              <p className="text-gray-400 text-sm">{isAr ? 'اختر صفحة لتعديلها' : 'Select a page to edit'}</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
              dir={isAr ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{editing.titleAr}</h3>
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{editing.slug}</span>
              </div>

              {saved && <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{isAr ? 'تم الحفظ ✓' : 'Saved ✓'}</div>}

              {[
                { id: 'titleAr', label: isAr ? 'العنوان (عربي)' : 'Title (AR)' },
                { id: 'titleEn', label: isAr ? 'العنوان (إنجليزي)' : 'Title (EN)' },
                { id: 'metaDescriptionAr', label: isAr ? 'الوصف التعريفي (عربي)' : 'Meta Description (AR)' },
                { id: 'metaDescriptionEn', label: isAr ? 'الوصف التعريفي (إنجليزي)' : 'Meta Description (EN)' },
              ].map(({ id, label }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[id as keyof typeof form]}
                    onChange={(e) => setForm(f => ({ ...f, [id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm" />
                </div>
              ))}

              {[
                { id: 'contentAr', label: isAr ? 'المحتوى (عربي)' : 'Content (AR)' },
                { id: 'contentEn', label: isAr ? 'المحتوى (إنجليزي)' : 'Content (EN)' },
              ].map(({ id, label }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <textarea rows={5} value={form[id as keyof typeof form]}
                    onChange={(e) => setForm(f => ({ ...f, [id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm resize-none" />
                </div>
              ))}

              <button type="submit" disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 transition-colors">
                {saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
