/**
 * Admin Users — إدارة المستخدمين والصلاحيات
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, type AdminUser } from '@/lib/api/dashboard';

const ROLES = ['student', 'faculty', 'content_manager', 'admin'] as const;
const ROLE_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  student: { ar: 'طالب', en: 'Student', color: 'bg-blue-100 text-blue-700' },
  faculty: { ar: 'أستاذ', en: 'Faculty', color: 'bg-green-100 text-green-700' },
  content_manager: { ar: 'مدير المحتوى', en: 'Content Manager', color: 'bg-purple-100 text-purple-700' },
  admin: { ar: 'مدير', en: 'Admin', color: 'bg-red-100 text-red-700' },
};

const EMPTY_FORM = { email: '', password: '', nameAr: '', nameEn: '', role: 'student' as typeof ROLES[number] };

export default function AdminUsersPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const LIMIT = 20;

  const load = async (pg = 1, role = '', q = '') => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, limit: LIMIT };
      if (role) params.role = role;
      if (q) params.search = q;
      const res = await getAdminUsers(params as { page?: number; limit?: number; role?: string; search?: string });
      setUsers(res.items);
      setTotal(res.total);
    } catch { setUsers([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(page, roleFilter, search); }, [page, roleFilter]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setFormError(null); setShowForm(true); }
  function openEdit(u: AdminUser) { setEditing(u); setForm({ email: u.email, password: '', nameAr: u.faculty?.nameAr ?? u.student?.nameAr ?? '', nameEn: '', role: u.role as typeof ROLES[number] }); setFormError(null); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setFormError(null);
    try {
      if (editing) {
        const payload: Partial<AdminUser & { password?: string }> = { role: form.role };
        if (form.password) payload.password = form.password;
        await updateAdminUser(editing.id, payload);
      } else {
        await createAdminUser(form);
      }
      setShowForm(false);
      load(page, roleFilter, search);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? (isAr ? 'حدث خطأ' : 'Error'));
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف المستخدم؟' : 'Delete user?')) return;
    try { await deleteAdminUser(id); load(page, roleFilter, search); } catch { /* ignore */ }
  }

  async function toggleActive(user: AdminUser) {
    try { await updateAdminUser(user.id, { isActive: !user.isActive }); load(page, roleFilter, search); } catch { /* ignore */ }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'إدارة المستخدمين' : 'Users Management'}</h2>
          <p className="text-sm text-gray-500">{total} {isAr ? 'مستخدم' : 'users'}</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {isAr ? 'إضافة مستخدم' : 'Add User'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(1, roleFilter, search); } }}
          placeholder={isAr ? 'بحث بالبريد الإلكتروني...' : 'Search by email...'}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
          <option value="">{isAr ? 'كل الأدوار' : 'All Roles'}</option>
          {ROLES.map(r => <option key={r} value={r}>{isAr ? ROLE_LABELS[r].ar : ROLE_LABELS[r].en}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold">{editing ? (isAr ? 'تعديل مستخدم' : 'Edit User') : (isAr ? 'إضافة مستخدم' : 'Add User')}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
              {formError && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
              {!editing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الاسم (عربي)' : 'Name (AR)'} *</label>
                    <input required value={form.nameAr} onChange={(e) => setForm(f => ({ ...f, nameAr: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editing ? (isAr ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء على الحالية)' : 'New Password (leave blank to keep)') : (isAr ? 'كلمة المرور' : 'Password') + ' *'}
                </label>
                <input type="password" required={!editing} value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الدور' : 'Role'}</label>
                <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as typeof ROLES[number] }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
                  {ROLES.map(r => <option key={r} value={r}>{isAr ? ROLE_LABELS[r].ar : ROLE_LABELS[r].en}</option>)}
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

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>Email</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الدور' : 'Role'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 text-sm">{u.email}</p>
                    {(u.faculty ?? u.student) && (
                      <p className="text-xs text-gray-400">{u.faculty?.nameAr ?? u.student?.nameAr}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_LABELS[u.role]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                      {isAr ? (ROLE_LABELS[u.role]?.ar ?? u.role) : (ROLE_LABELS[u.role]?.en ?? u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(u)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors
                        ${u.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                      {u.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
