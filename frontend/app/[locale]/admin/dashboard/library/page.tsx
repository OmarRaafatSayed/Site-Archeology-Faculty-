/**
 * Admin Library — CRUD + استيراد Excel
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { localize } from '@/lib/utils/locale';
import type { LibraryBook } from '@/lib/api/types';
import type { ImportReport } from '@/lib/api/dashboard';

const TYPES = ['egyptology', 'islamic', 'conservation', 'postgraduate'] as const;
const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  egyptology: { ar: 'آثار مصرية', en: 'Egyptology' },
  islamic: { ar: 'آثار إسلامية', en: 'Islamic' },
  conservation: { ar: 'ترميم', en: 'Conservation' },
  postgraduate: { ar: 'دراسات عليا', en: 'Postgraduate' },
};

const EMPTY = { titleAr: '', titleEn: '', authorAr: '', authorEn: '', publisher: '', publishYear: new Date().getFullYear(), libraryType: 'egyptology' as typeof TYPES[number], copiesCount: 1, isbn: '' };

export default function AdminLibraryPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LibraryBook | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const LIMIT = 15;

  const load = async (pg = 1, q = '', t = '') => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, limit: LIMIT };
      if (q) params.q = q;
      if (t) params.type = t;
      const { data } = await apiClient.get<{ success: boolean; data: { items: LibraryBook[]; total: number } }>('/library', { params });
      setBooks(data.data.items);
      setTotal(data.data.total);
    } catch { setBooks([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(page, search, typeFilter); }, [page, typeFilter]);

  function openCreate() { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(b: LibraryBook) {
    setEditing(b);
    setForm({ titleAr: b.titleAr, titleEn: b.titleEn ?? '', authorAr: b.authorAr ?? '', authorEn: b.authorEn ?? '', publisher: b.publisher ?? '', publishYear: b.publishYear ?? new Date().getFullYear(), libraryType: b.libraryType, copiesCount: b.copiesCount, isbn: b.isbn ?? '' });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await apiClient.put(`/library/${editing.id}`, form); }
      else { await apiClient.post('/library', form); }
      setShowForm(false); load(page, search, typeFilter);
    } catch { alert(isAr ? 'حدث خطأ' : 'Error'); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(isAr ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try { await apiClient.delete(`/library/${id}`); load(page, search, typeFilter); } catch { /* ignore */ }
  }

  async function handleExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const { data } = await apiClient.post<{ success: boolean; data: ImportReport }>('/library/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReport(data.data);
    } catch { alert(isAr ? 'فشل رفع الملف' : 'Upload failed'); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function confirmImport() {
    try { await apiClient.post('/library/import/confirm'); setReport(null); load(1, search, typeFilter); alert(isAr ? 'تم الاستيراد' : 'Imported successfully'); } catch { alert(isAr ? 'فشل' : 'Failed'); }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'إدارة المكتبة' : 'Library Management'}</h2>
          <p className="text-sm text-gray-500">{total} {isAr ? 'كتاب' : 'books'}</p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={handleExcel} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {importing ? '...' : (isAr ? 'Excel' : 'Excel')}
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {isAr ? 'إضافة كتاب' : 'Add Book'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(1, search, typeFilter); } }}
          placeholder={isAr ? 'بحث...' : 'Search...'}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
          <option value="">{isAr ? 'كل الأنواع' : 'All Types'}</option>
          {TYPES.map(t => <option key={t} value={t}>{isAr ? TYPE_LABELS[t].ar : TYPE_LABELS[t].en}</option>)}
        </select>
      </div>

      {/* Import report */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold">{isAr ? 'تقرير التحقق' : 'Validation Report'}</h3>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xl font-bold text-green-700">{report.toCreate.length}</p><p className="text-xs text-green-600">{isAr ? 'جديد' : 'New'}</p></div>
            <div className="bg-blue-50 rounded-lg p-3"><p className="text-xl font-bold text-blue-700">{report.toUpdate.length}</p><p className="text-xs text-blue-600">{isAr ? 'تحديث' : 'Update'}</p></div>
            <div className="bg-red-50 rounded-lg p-3"><p className="text-xl font-bold text-red-700">{report.errors.length}</p><p className="text-xs text-red-600">{isAr ? 'خطأ' : 'Errors'}</p></div>
          </div>
          <div className="flex gap-3">
            <button onClick={confirmImport} disabled={report.errors.length > 0}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:opacity-60">{isAr ? 'تأكيد' : 'Confirm'}</button>
            <button onClick={() => setReport(null)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">{isAr ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold">{editing ? (isAr ? 'تعديل كتاب' : 'Edit Book') : (isAr ? 'إضافة كتاب' : 'Add Book')}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
              {[{ id: 'titleAr', label: isAr ? 'العنوان (عربي)' : 'Title (AR)', req: true }, { id: 'titleEn', label: isAr ? 'العنوان (إنجليزي)' : 'Title (EN)', req: false }, { id: 'authorAr', label: isAr ? 'المؤلف (عربي)' : 'Author (AR)', req: false }, { id: 'publisher', label: isAr ? 'الناشر' : 'Publisher', req: false }, { id: 'isbn', label: 'ISBN', req: false }].map(({ id, label, req }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}{req && ' *'}</label>
                  <input required={req} value={form[id as keyof typeof form] as string}
                    onChange={(e) => setForm(f => ({ ...f, [id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'سنة النشر' : 'Year'}</label>
                  <input type="number" min={1900} max={new Date().getFullYear()} value={form.publishYear}
                    onChange={(e) => setForm(f => ({ ...f, publishYear: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'النسخ' : 'Copies'}</label>
                  <input type="number" min={1} value={form.copiesCount}
                    onChange={(e) => setForm(f => ({ ...f, copiesCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'نوع المكتبة' : 'Library Type'}</label>
                <select value={form.libraryType} onChange={(e) => setForm(f => ({ ...f, libraryType: e.target.value as typeof TYPES[number] }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
                  {TYPES.map(t => <option key={t} value={t}>{isAr ? TYPE_LABELS[t].ar : TYPE_LABELS[t].en}</option>)}
                </select>
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
              <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'العنوان' : 'Title'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'النوع' : 'Type'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'النسخ' : 'Copies'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{localize(b.titleAr, b.titleEn, locale)}</p>
                    {b.authorAr && <p className="text-xs text-gray-400">{localize(b.authorAr, b.authorEn, locale)}</p>}
                  </td>
                  <td className="px-4 py-3 text-center"><span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{isAr ? TYPE_LABELS[b.libraryType].ar : TYPE_LABELS[b.libraryType].en}</span></td>
                  <td className="px-4 py-3 text-center text-gray-700">{b.copiesCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t">
              <p className="text-xs text-gray-500">{total} {isAr ? 'كتاب' : 'books'}</p>
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
