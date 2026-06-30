/**
 * Admin Audit Logs — سجل التدقيق الكامل
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getAuditLogs, type AuditLog } from '@/lib/api/dashboard';
import { formatDate } from '@/lib/utils/locale';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-gray-100 text-gray-600',
  LOGOUT: 'bg-gray-100 text-gray-600',
};

const ENTITY_TYPES = ['News', 'FacultyMember', 'Student', 'Course', 'Result', 'Conference', 'LibraryBook', 'User', 'Page', 'Publication'];

export default function AdminAuditLogsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const LIMIT = 25;

  const load = async (pg = 1) => {
    setLoading(true);
    try {
      const params: { page?: number; limit?: number; entityType?: string; action?: string } = { page: pg, limit: LIMIT };
      if (entityType) params.entityType = entityType;
      if (action) params.action = action;
      const res = await getAuditLogs(params);
      setLogs(res.items);
      setTotal(res.total);
    } catch { setLogs([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page, entityType, action]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{isAr ? 'سجل التدقيق' : 'Audit Logs'}</h2>
        <p className="text-sm text-gray-500 mt-1">{total} {isAr ? 'سجل' : 'entries'}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
          <option value="">{isAr ? 'كل الكيانات' : 'All Entities'}</option>
          {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
          <option value="">{isAr ? 'كل الأحداث' : 'All Actions'}</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400">{isAr ? 'لا توجد سجلات' : 'No log entries'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الحدث' : 'Action'}</th>
              <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الكيان' : 'Entity'}</th>
              <th className={`px-4 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المستخدم' : 'User'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'التاريخ' : 'Date'}</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'التفاصيل' : 'Details'}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <>
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{log.entityType}</p>
                      {log.entityId && <p className="text-xs text-gray-400 font-mono">{log.entityId.slice(0, 8)}...</p>}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <>
                          <p className="text-gray-900 text-sm">{log.user.nameAr}</p>
                          <p className="text-xs text-gray-400">{log.user.email}</p>
                        </>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {formatDate(log.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(!!log.newData || !!log.oldData) && (
                        <button onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                          className="text-xs text-primary-600 hover:underline">
                          {expanded === log.id ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'عرض' : 'Show')}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr key={`${log.id}-details`} className="bg-gray-50">
                      <td colSpan={5} className="px-5 py-3">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {!!log.oldData && (
                            <div>
                              <p className="font-semibold text-gray-600 mb-1">{isAr ? 'قبل التعديل' : 'Before'}</p>
                              <pre className="bg-red-50 rounded-lg p-3 text-red-700 overflow-auto max-h-32 text-xs">
                                {JSON.stringify(log.oldData as Record<string, unknown>, null, 2)}
                              </pre>
                            </div>
                          )}
                          {!!log.newData && (
                            <div>
                              <p className="font-semibold text-gray-600 mb-1">{isAr ? 'بعد التعديل' : 'After'}</p>
                              <pre className="bg-green-50 rounded-lg p-3 text-green-700 overflow-auto max-h-32 text-xs">
                                {JSON.stringify(log.newData as Record<string, unknown>, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        {log.ipAddress && <p className="text-xs text-gray-400 mt-2">IP: {log.ipAddress}</p>}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t">
              <p className="text-xs text-gray-500">{total} {isAr ? 'سجل' : 'entries'}</p>
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
