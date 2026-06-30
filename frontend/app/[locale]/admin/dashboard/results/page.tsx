/**
 * Admin Results — نشر / سحب نشر + استيراد Excel
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { localize } from '@/lib/utils/locale';
import type { ImportReport } from '@/lib/api/dashboard';

interface Result {
  id: string;
  totalScore: number | null;
  gradeLetter: string | null;
  isPassed: boolean | null;
  isPublished: boolean;
  academicYear: string;
  semester: string;
  course: { id: string; nameAr: string; nameEn: string | null; code: string };
  student?: { id: string; nameAr: string; studentId: string };
}

export default function AdminResultsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [results, setResults] = useState<Result[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importing, setImporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const LIMIT = 20;

  const load = async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { items: Result[]; total: number } }>('/results', { params: { page: pg, limit: LIMIT } });
      setResults(data.data.items);
      setTotal(data.data.total);
    } catch { setResults([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page]);

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await apiClient.post<{ success: boolean; data: ImportReport }>('/results/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReport(data.data);
    } catch { alert(isAr ? 'فشل رفع الملف' : 'Upload failed'); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function confirmImport() {
    setConfirming(true);
    try {
      await apiClient.post('/results/import/confirm');
      setReport(null);
      load(1);
      alert(isAr ? 'تم استيراد النتائج (غير منشورة)' : 'Results imported (unpublished)');
    } catch { alert(isAr ? 'فشل الاستيراد' : 'Import failed'); }
    finally { setConfirming(false); }
  }

  async function togglePublish(id: string, current: boolean) {
    try {
      if (current) {
        await apiClient.put('/results/unpublish-batch', { resultIds: [id] });
      } else {
        await apiClient.put(`/results/${id}/publish`);
      }
      load(page);
    } catch { /* ignore */ }
  }

  async function publishAll() {
    if (!confirm(isAr ? 'نشر كل النتائج الغير منشورة؟' : 'Publish all unpublished results?')) return;
    setPublishing(true);
    try {
      await apiClient.put('/results/publish-batch', {});
      load(page);
    } catch { /* ignore */ } finally { setPublishing(false); }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'إدارة النتائج' : 'Results Management'}</h2>
          <p className="text-sm text-gray-500">{total} {isAr ? 'نتيجة' : 'results'}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={handleExcelUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 disabled:opacity-60 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {importing ? '...' : (isAr ? 'استيراد Excel' : 'Import Excel')}
          </button>
          <button onClick={publishAll} disabled={publishing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {publishing ? '...' : (isAr ? 'نشر الكل' : 'Publish All')}
          </button>
        </div>
      </div>

      {/* Import report */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold">{isAr ? 'تقرير التحقق' : 'Validation Report'}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 rounded-lg p-3"><p className="text-2xl font-bold text-green-700">{report.toCreate.length}</p><p className="text-xs text-green-600">{isAr ? 'جديدة' : 'New'}</p></div>
            <div className="bg-blue-50 rounded-lg p-3"><p className="text-2xl font-bold text-blue-700">{report.toUpdate.length}</p><p className="text-xs text-blue-600">{isAr ? 'تحديث' : 'Update'}</p></div>
            <div className="bg-red-50 rounded-lg p-3"><p className="text-2xl font-bold text-red-700">{report.errors.length}</p><p className="text-xs text-red-600">{isAr ? 'أخطاء' : 'Errors'}</p></div>
          </div>
          {report.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
              {report.errors.map((err, i) => <p key={i} className="text-xs text-red-700">Row {err.row}: {err.message}</p>)}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={confirmImport} disabled={confirming || report.errors.length > 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:opacity-60">
              {confirming ? '...' : (isAr ? 'تأكيد الاستيراد' : 'Confirm Import')}
            </button>
            <button onClick={() => setReport(null)} className="px-5 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">{isAr ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الطالب' : 'Student'}</th>
              <th className={`px-4 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المقرر' : 'Course'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'المجموع' : 'Total'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'التقدير' : 'Grade'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الحالة' : 'Status'}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{r.student?.nameAr ?? '—'}</p>
                    <p className="text-xs text-gray-400">{r.student?.studentId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{localize(r.course.nameAr, r.course.nameEn, locale)}</p>
                    <p className="text-xs text-gray-400">{r.course.code}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{r.totalScore ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                      ${r.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.gradeLetter ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(r.id, r.isPublished)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors
                        ${r.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                      {r.isPublished ? (isAr ? 'منشور' : 'Live') : (isAr ? 'مخفي' : 'Hidden')}
                    </button>
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
