/**
 * Admin Students — قائمة + استيراد Excel
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import type { ImportReport } from '@/lib/api/dashboard';

interface Student {
  id: string;
  studentId: string;
  nameAr: string;
  nameEn: string | null;
  level: number;
  semester: string;
  academicYear: string;
  department?: { nameAr: string; nameEn: string | null };
}

export default function AdminStudentsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importing, setImporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const LIMIT = 20;

  const load = async (pg = 1, q = '') => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, limit: LIMIT };
      if (q) params.search = q;
      const { data } = await apiClient.get<{ success: boolean; data: { items: Student[]; total: number } }>('/students', { params });
      setStudents(data.data.items);
      setTotal(data.data.total);
    } catch { setStudents([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(page, search); }, [page]);

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await apiClient.post<{ success: boolean; data: ImportReport }>('/students/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReport(data.data);
    } catch { alert(isAr ? 'فشل رفع الملف' : 'File upload failed'); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function confirmImport() {
    setConfirming(true);
    try {
      await apiClient.post('/students/import/confirm');
      setReport(null);
      load(1, search);
      alert(isAr ? 'تم استيراد الطلاب بنجاح' : 'Students imported successfully');
    } catch { alert(isAr ? 'فشل الاستيراد' : 'Import failed'); }
    finally { setConfirming(false); }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'إدارة الطلاب' : 'Students Management'}</h2>
          <p className="text-sm text-gray-500">{total} {isAr ? 'طالب' : 'students'}</p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={handleExcelUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-60">
            {importing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            )}
            {isAr ? 'استيراد Excel' : 'Import Excel'}
          </button>
        </div>
      </div>

      {/* Validation Report */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">{isAr ? 'تقرير التحقق من الملف' : 'Validation Report'}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-700">{report.toCreate.length}</p>
              <p className="text-xs text-green-600">{isAr ? 'سيتم إضافتهم' : 'To Create'}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-700">{report.toUpdate.length}</p>
              <p className="text-xs text-blue-600">{isAr ? 'سيتم تحديثهم' : 'To Update'}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-700">{report.errors.length}</p>
              <p className="text-xs text-red-600">{isAr ? 'أخطاء' : 'Errors'}</p>
            </div>
          </div>
          {report.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              {report.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-700">{isAr ? `سطر ${err.row}:` : `Row ${err.row}:`} {err.message}</p>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={confirmImport} disabled={confirming || report.errors.length > 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
              {confirming ? (isAr ? 'جارٍ الاستيراد...' : 'Importing...') : (isAr ? 'تأكيد الاستيراد' : 'Confirm Import')}
            </button>
            <button onClick={() => setReport(null)} className="px-5 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(1, search); } }}
          placeholder={isAr ? 'بحث بالاسم أو رقم القيد...' : 'Search by name or ID...'}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
        <button onClick={() => { setPage(1); load(1, search); }}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          {isAr ? 'بحث' : 'Search'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الاسم' : 'Name'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'رقم القيد' : 'Student ID'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الفرقة' : 'Year'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'القسم' : 'Dept.'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'العام الدراسي' : 'Acad. Year'}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{s.nameAr}</p>
                    {s.nameEn && <p className="text-xs text-gray-400">{s.nameEn}</p>}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-gray-700">{s.studentId}</td>
                  <td className="px-4 py-3 text-center"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{isAr ? `الفرقة ${s.level}` : `Year ${s.level}`}</span></td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">{s.department ? (locale === 'ar' ? s.department.nameAr : (s.department.nameEn ?? s.department.nameAr)) : '—'}</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">{s.academicYear}</td>
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
