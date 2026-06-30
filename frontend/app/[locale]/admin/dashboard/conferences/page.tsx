/**
 * Admin Conferences — قائمة + إدارة التسجيلات
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { localize, formatDate, conferenceStatusLabel } from '@/lib/utils/locale';
import type { Conference } from '@/lib/api/types';

const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const;

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

interface Registration {
  id: string;
  registrationCode: string;
  attendeeNameAr: string;
  attendeeEmail: string;
  status: 'pending' | 'confirmed' | 'rejected';
  attendeeType: string;
  createdAt: string;
}

export default function AdminConferencesPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedConf, setSelectedConf] = useState<Conference | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titleAr: '', titleEn: '', number: 1, themeAr: '', startDate: '', endDate: '', status: 'upcoming' as typeof STATUSES[number] });
  const [saving, setSaving] = useState(false);

  const loadConf = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { items: Conference[]; total: number } }>('/conferences', { params: { limit: 50 } });
      setConferences(data.data.items);
      setTotal(data.data.total);
    } catch { setConferences([]); } finally { setLoading(false); }
  };

  const loadRegs = async (confId: string) => {
    setRegsLoading(true);
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { items: Registration[] } }>(`/conferences/${confId}/registrations`, { params: { limit: 50 } });
      setRegistrations(data.data.items);
    } catch { setRegistrations([]); } finally { setRegsLoading(false); }
  };

  useEffect(() => { loadConf(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await apiClient.post('/conferences', form);
      setShowForm(false);
      loadConf();
    } catch { alert(isAr ? 'حدث خطأ' : 'Error'); } finally { setSaving(false); }
  }

  async function updateRegStatus(confId: string, regId: string, status: string) {
    try {
      await apiClient.put(`/conferences/${confId}/registrations/${regId}`, { status });
      loadRegs(confId);
    } catch { /* ignore */ }
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'إدارة المؤتمرات' : 'Conferences Management'}</h2>
          <p className="text-sm text-gray-500">{total} {isAr ? 'مؤتمر' : 'conferences'}</p>
        </div>
        <button onClick={() => { setForm({ titleAr: '', titleEn: '', number: total + 1, themeAr: '', startDate: '', endDate: '', status: 'upcoming' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {isAr ? 'إنشاء مؤتمر' : 'New Conference'}
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold">{isAr ? 'إنشاء مؤتمر جديد' : 'New Conference'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
              {[{ id: 'titleAr', label: isAr ? 'العنوان (عربي)' : 'Title (AR)', req: true }, { id: 'titleEn', label: isAr ? 'العنوان (إنجليزي)' : 'Title (EN)', req: false }, { id: 'themeAr', label: isAr ? 'المحور الرئيسي' : 'Theme', req: false }].map(({ id, label, req }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}{req && ' *'}</label>
                  <input required={req} value={form[id as keyof typeof form] as string} onChange={(e) => setForm(f => ({ ...f, [id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'رقم المؤتمر' : 'Number'}</label>
                  <input type="number" min={1} value={form.number} onChange={(e) => setForm(f => ({ ...f, number: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الحالة' : 'Status'}</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as typeof STATUSES[number] }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
                    {STATUSES.map(s => <option key={s} value={s}>{conferenceStatusLabel(s, locale)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: 'startDate', label: isAr ? 'تاريخ البدء' : 'Start Date' }, { id: 'endDate', label: isAr ? 'تاريخ الانتهاء' : 'End Date' }].map(({ id, label }) => (
                  <div key={id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type="date" value={form[id as keyof typeof form] as string} onChange={(e) => setForm(f => ({ ...f, [id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg disabled:opacity-60">{saving ? '...' : (isAr ? 'إنشاء' : 'Create')}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg">{isAr ? 'إلغاء' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations Panel */}
      {selectedConf && (
        <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {isAr ? `تسجيلات: ${selectedConf.titleAr}` : `Registrations: ${selectedConf.titleEn ?? selectedConf.titleAr}`}
            </h3>
            <button onClick={() => setSelectedConf(null)} className="text-gray-400 hover:text-gray-600 text-sm">{isAr ? 'إغلاق' : 'Close'}</button>
          </div>
          {regsLoading ? (
            <div className="flex justify-center py-6"><svg className="w-6 h-6 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
          ) : registrations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{isAr ? 'لا توجد تسجيلات' : 'No registrations'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b">
                  <th className={`px-4 py-2 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الاسم' : 'Name'}</th>
                  <th className={`px-4 py-2 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>Email</th>
                  <th className="px-4 py-2 font-semibold text-gray-600 text-center">{isAr ? 'الكود' : 'Code'}</th>
                  <th className="px-4 py-2 font-semibold text-gray-600 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 font-medium text-gray-900">{reg.attendeeNameAr}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{reg.attendeeEmail}</td>
                      <td className="px-4 py-2 text-center font-mono text-xs text-gray-600">{reg.registrationCode}</td>
                      <td className="px-4 py-2 text-center">
                        <select value={reg.status}
                          onChange={(e) => updateRegStatus(selectedConf.id, reg.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer
                            ${reg.status === 'confirmed' ? 'bg-green-100 text-green-700' : reg.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          <option value="pending">{isAr ? 'معلق' : 'Pending'}</option>
                          <option value="confirmed">{isAr ? 'مقبول' : 'Confirmed'}</option>
                          <option value="rejected">{isAr ? 'مرفوض' : 'Rejected'}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Conferences list */}
      {loading ? (
        <div className="flex justify-center py-12"><svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
      ) : (
        <div className="space-y-3">
          {conferences.map((conf) => (
            <div key={conf.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{localize(conf.titleAr, conf.titleEn, locale)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAr ? `المؤتمر رقم ${conf.number}` : `Conference #${conf.number}`}
                  {conf.startDate ? ` • ${formatDate(conf.startDate, locale)}` : ''}
                  {conf._count ? ` • ${conf._count.registrations} ${isAr ? 'مسجل' : 'registrations'}` : ''}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[conf.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {conferenceStatusLabel(conf.status, locale)}
              </span>
              <button onClick={() => { setSelectedConf(conf); loadRegs(conf.id); }}
                className="shrink-0 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                {isAr ? 'التسجيلات' : 'Registrations'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
