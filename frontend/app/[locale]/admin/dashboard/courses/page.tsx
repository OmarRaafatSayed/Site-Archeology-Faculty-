/**
 * Admin Courses — إدارة المقررات والجداول
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { localize } from '@/lib/utils/locale';

interface Course {
  id: string;
  nameAr: string;
  nameEn: string | null;
  code: string;
  creditHours: number | null;
  level: number | null;
  semester: string | null;
  isActive: boolean;
  department?: { nameAr: string; nameEn: string | null };
}

const EMPTY = { nameAr: '', nameEn: '', code: '', creditHours: 3, level: 1, semester: 'first' };

export default function AdminCoursesPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const LIMIT = 20;

  const load = async (pg = 1, q = '') => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, limit: LIMIT };
      if (q) params.search = q;
      const { data } = await apiClient.get<{ success: boolean; data: { items: Course[]; total: number } }>('/courses', { params });
      setCourses(data.data.items);
      setTotal(data.data.total);
    } catch { setCourses([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(page, search); }, [page]);

  function openCreate() { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(c: Course) {
    setEditing(c);
    setForm({ nameAr: c.nameAr, nameEn: c.nameEn ?? '', code: c.code, creditHours: c.creditHours ?? 3, level: c.level ?? 1, semester: c.semester ?? 'first' });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await apiClient.put(`/courses/${editing.id}`, form); }
      else { await apiClient.post('/courses', form); }
      setShowForm(false); load(page, search);
    } catch { alert(isAr ? 'حدث خطأ' : 'Error'); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(isAr ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try { await apiClient.delete(`/courses/${id}`); load(page, search); } catch { /* ignore */ }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'إدارة المقررات' : 'Courses Management'}</h2>
          <p className="text-sm text-gray-500">{total} {isAr ? 'مقرر' : 'courses'}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {isAr ? 'إضافة مقرر' : 'Add Course'}
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(1, search); } }}
          placeholder={isAr ? 'بحث بالاسم أو الكود...' : 'Search by name or code...'}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
        <button onClick={() => { setPage(1); load(1, search); }} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">{isAr ? 'بحث' : 'Search'}</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold">{editing ? (isAr ? 'تعديل مقرر' : 'Edit Course') : (isAr ? 'إضافة مقرر' : 'Add Course')}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
              {[{ id: 'nameAr', label: isAr ? 'اسم المقرر (عربي)' : 'Name (AR)', req: true }, { id: 'nameEn', label: isAr ? 'اسم المقرر (إنجليزي)' : 'Name (EN)', req: false }, { id: 'code', label: isAr ? 'كود المقرر' : 'Course Code', req: true }].map(({ id, label, req }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}{req && ' *'}</label>
                  <input required={req} value={form[id as keyof typeof form] as string} onChange={(e) => setForm(f => ({ ...f, [id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الساعات' : 'Credits'}</label>
                  <input type="number" min={1} max={6} value={form.creditHours} onChange={(e) => setForm(f => ({ ...f, creditHours: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الفرقة' : 'Year'}</label>
                  <input type="number" min={1} max={4} value={form.level} onChange={(e) => setForm(f => ({ ...f, level: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الفصل' : 'Semester'}</label>
                  <select value={form.semester} onChange={(e) => setForm(f => ({ ...f, semester: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
                    <option value="first">{isAr ? 'الأول' : 'First'}</option>
                    <option value="second">{isAr ? 'الثاني' : 'Second'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg disabled:opacity-60">{saving ? '...' : (isAr ? 'حفظ' : 'Save')}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg">{isAr ? 'إلغاء' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المقرر' : 'Course'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الكود' : 'Code'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الفرقة' : 'Year'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الساعات' : 'Credits'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{localize(c.nameAr, c.nameEn, locale)}</p>
                    {c.department && <p className="text-xs text-gray-400">{localize(c.department.nameAr, c.department.nameEn, locale)}</p>}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-primary-700 bg-primary-50/50">{c.code}</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-600">{c.level ? (isAr ? `الفرقة ${c.level}` : `Year ${c.level}`) : '—'}</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-600">{c.creditHours ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t">
              <p className="text-xs text-gray-500">{total} {isAr ? 'نتيجة' : 'results'}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border disabled:opacity-40">{isAr ? 'السابق' : 'Prev'}</button>
                <span className="px-3 py-1.5 text-xs">{page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border disabled:opacity-40">{isAr ? 'التالي' : 'Next'}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
