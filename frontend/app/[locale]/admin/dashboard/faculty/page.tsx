/**
 * Admin Faculty Management
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { localize, degreeLabel } from '@/lib/utils/locale';
import type { FacultyMember } from '@/lib/api/types';

const DEGREES = [
  'demonstrator',
  'assistant_lecturer',
  'lecturer',
  'assistant_professor',
  'professor',
] as const;

interface Department {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
}

const EMPTY_FORM = {
  nameAr: '',
  nameEn: '',
  degree: 'lecturer' as typeof DEGREES[number],
  email: '',
  departmentId: '',
};

// ─── Photo Upload Component ──────────────────────────────────────────────────
function PhotoUpload({ memberId, currentUrl, token, onUploaded }: {
  memberId: string;
  currentUrl?: string | null;
  token: string | null;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/faculty/${memberId}/photo`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? json.error ?? 'Upload failed');
      onUploaded(json.data?.photoUrl ?? '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* معاينة الصورة */}
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
        {preview ? (
          <img src={preview} alt="photo" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>
      {/* زرار الرفع */}
      <label className="cursor-pointer px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors">
        {uploading ? '...' : 'رفع صورة'}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminFacultyPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [faculty, setFaculty]       = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<FacultyMember | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [editingPhotoUrl, setEditingPhotoUrl] = useState<string | null>(null);
  const [authToken, setAuthToken]   = useState<string | null>(null);
  const LIMIT = 15;

  // جلب الـ token من الـ Zustand store (sessionStorage key: fa-auth)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('fa-auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          setAuthToken(parsed?.state?.accessToken ?? null);
        }
      } catch { /* ignore */ }
    }
  }, [showForm]); // نجدد الـ token كل ما فُتح الـ modal

  // ── جلب الأقسام ──────────────────────────────────────────────────────────
  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: Department[] | { items: Department[] } }>('/departments')
      .then(({ data }) => {
        // الـ API بيرجع array مباشرة أو { items: [...] }
        const list = Array.isArray(data.data)
          ? data.data
          : (data.data as any)?.items ?? [];
        setDepartments(list);
      })
      .catch(() => setDepartments([]));
  }, []);

  // ── جلب هيئة التدريس ─────────────────────────────────────────────────────
  const load = async (pg = 1, q = '') => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, limit: LIMIT };
      if (q) params.search = q;
      const { data } = await apiClient.get<{
        success: boolean;
        data: { items: FacultyMember[]; total: number };
      }>('/faculty', { params });
      setFaculty(data.data.items);
      setTotal(data.data.total);
    } catch {
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, search); }, [page]);

  // ── فتح فورم الإضافة ──────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setEditingPhotoUrl(null);
    setForm({ ...EMPTY_FORM, departmentId: departments[0]?.id ?? '' });
    setFormError(null);
    setShowForm(true);
  }

  // ── فتح فورم التعديل ──────────────────────────────────────────────────────
  function openEdit(m: FacultyMember) {
    setEditing(m);
    setEditingPhotoUrl(m.photoUrl ?? null);
    setForm({
      nameAr:       m.nameAr,
      nameEn:       m.nameEn ?? '',
      degree:       m.degree,
      email:        m.email ?? '',
      departmentId: m.department?.id ?? departments[0]?.id ?? '',
    });
    setFormError(null);
    setShowForm(true);
  }

  // ── حفظ ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.departmentId) {
      setFormError(isAr ? 'يرجى اختيار القسم' : 'Please select a department');
      return;
    }

    // نبني الـ payload — التخصص بيتملى من اسم القسم تلقائياً في الباكند
    const selectedDept = departments.find((d) => d.id === form.departmentId);
    const payload = {
      ...form,
      specializationAr: selectedDept?.nameAr ?? '',
      specializationEn: selectedDept?.nameEn ?? '',
    };

    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await apiClient.put(`/faculty/${editing.id}`, payload);
        setShowForm(false);
      } else {
        const { data } = await apiClient.post<{ success: boolean; data: FacultyMember }>('/faculty', payload);
        // بعد الإضافة نفتح فورم التعديل عشان يقدر يرفع صورة
        setEditing(data.data);
        setEditingPhotoUrl(data.data.photoUrl ?? null);
      }
      load(page, search);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setFormError(msg ?? (isAr ? 'حدث خطأ، تحقق من البيانات' : 'Save failed, check the data'));
    } finally {
      setSaving(false);
    }
  }

  // ── حذف ──────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm(isAr ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try { await apiClient.delete(`/faculty/${id}`); load(page, search); } catch { /* ignore */ }
  }

  const totalPages = Math.ceil(total / LIMIT);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isAr ? 'هيئة التدريس' : 'Faculty Management'}
          </h2>
          <p className="text-sm text-gray-500">{total} {isAr ? 'عضو' : 'members'}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isAr ? 'إضافة عضو' : 'Add Member'}
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(1, search); } }}
          placeholder={isAr ? 'بحث بالاسم...' : 'Search by name...'}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm"
        />
        <button
          onClick={() => { setPage(1); load(1, search); }}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {isAr ? 'بحث' : 'Search'}
        </button>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold">
                {editing
                  ? (isAr ? 'تعديل عضو' : 'Edit Member')
                  : (isAr ? 'إضافة عضو' : 'Add Member')}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
              {formError && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              {/* القسم */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'القسم *' : 'Department *'}
                </label>
                <select
                  required
                  value={form.departmentId}
                  onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm"
                >
                  <option value="">{isAr ? '— اختر القسم —' : '— Select Department —'}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isAr ? d.nameAr : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* الاسم عربي */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'الاسم (عربي) *' : 'Name (AR) *'}
                </label>
                <input
                  required
                  value={form.nameAr}
                  onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm"
                />
              </div>

              {/* الاسم إنجليزي */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'الاسم (إنجليزي)' : 'Name (EN)'}
                </label>
                <input
                  value={form.nameEn}
                  onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm"
                />
              </div>

              {/* الدرجة العلمية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'الدرجة العلمية' : 'Degree'}
                </label>
                <select
                  value={form.degree}
                  onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value as typeof DEGREES[number] }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm"
                >
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>{degreeLabel(d, locale)}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg disabled:opacity-60"
                >
                  {saving ? '...' : (isAr ? 'حفظ' : 'Save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>

              {/* رفع الصورة — بعد الحفظ لو عضو موجود */}
              {editing && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-600 mb-3 text-center">
                    {isAr ? 'صورة العضو' : 'Member Photo'}
                  </p>
                  <PhotoUpload
                    memberId={editing.id}
                    currentUrl={editingPhotoUrl}
                    token={authToken}
                    onUploaded={(url) => setEditingPhotoUrl(url)}
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>
                  {isAr ? 'الاسم' : 'Name'}
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                  {isAr ? 'القسم' : 'Department'}
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                  {isAr ? 'الدرجة' : 'Degree'}
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                  {isAr ? 'التخصص' : 'Specialization'}
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                  {isAr ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {faculty.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{localize(m.nameAr, m.nameEn, locale)}</p>
                    <p className="text-xs text-gray-400">{m.email ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {m.department ? localize(m.department.nameAr, m.department.nameEn, locale) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      {degreeLabel(m.degree, locale)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {localize(m.specializationAr ?? '', m.specializationEn ?? '', locale) || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        aria-label="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border disabled:opacity-40"
                >
                  {isAr ? 'السابق' : 'Prev'}
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-600">{page}/{totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border disabled:opacity-40"
                >
                  {isAr ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
