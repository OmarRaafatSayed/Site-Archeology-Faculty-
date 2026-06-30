/**
 * Admin News Management — CRUD + نشر / إلغاء نشر
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { localize, formatDate, categoryLabel } from '@/lib/utils/locale';
import type { NewsArticle } from '@/lib/api/types';

const CATEGORIES = ['general', 'academic', 'student', 'conference', 'research'] as const;

const EMPTY_FORM = { titleAr: '', titleEn: '', bodyAr: '', bodyEn: '', category: 'general' as NewsArticle['category'] };

export default function AdminNewsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const LIMIT = 15;

  const loadNews = async (pg = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, limit: LIMIT };
      if (filter === 'published') params.published = 'true';
      if (filter === 'draft') params.published = 'false';
      const { data } = await apiClient.get<{ success: boolean; data: { items: NewsArticle[]; total: number } }>('/news', { params });
      setNews(data.data.items);
      setTotal(data.data.total);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNews(page); }, [page, filter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(article: NewsArticle) {
    setEditing(article);
    setForm({ titleAr: article.titleAr, titleEn: article.titleEn ?? '', bodyAr: article.bodyAr, bodyEn: article.bodyEn ?? '', category: article.category });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await apiClient.put(`/news/${editing.id}`, form);
      } else {
        await apiClient.post('/news', form);
      }
      setShowForm(false);
      loadNews(page);
    } catch {
      setFormError(isAr ? 'حدث خطأ أثناء الحفظ' : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(article: NewsArticle) {
    try {
      if (article.isPublished) {
        await apiClient.put(`/news/${article.id}/unpublish`);
      } else {
        await apiClient.put(`/news/${article.id}/publish`);
      }
      loadNews(page);
    } catch { /* ignore */ }
  }

  async function handleDelete(id: string) {
    if (!confirm(isAr ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try { await apiClient.delete(`/news/${id}`); loadNews(page); } catch { /* ignore */ }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isAr ? 'إدارة الأخبار' : 'News Management'}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} {isAr ? 'خبر' : 'articles'}</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {isAr ? 'إضافة خبر' : 'Add News'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
            {f === 'all' ? (isAr ? 'الكل' : 'All') : f === 'published' ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">
                {editing ? (isAr ? 'تعديل الخبر' : 'Edit Article') : (isAr ? 'إضافة خبر جديد' : 'New Article')}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
              {formError && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'العنوان (عربي)' : 'Title (Arabic)'} *</label>
                <input required value={form.titleAr} onChange={(e) => setForm(f => ({ ...f, titleAr: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                <input value={form.titleEn} onChange={(e) => setForm(f => ({ ...f, titleEn: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'التصنيف' : 'Category'}</label>
                <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value as NewsArticle['category'] }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c, locale)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'المحتوى (عربي)' : 'Body (Arabic)'} *</label>
                <textarea required rows={5} value={form.bodyAr} onChange={(e) => setForm(f => ({ ...f, bodyAr: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'المحتوى (إنجليزي)' : 'Body (English)'}</label>
                <textarea rows={4} value={form.bodyEn} onChange={(e) => setForm(f => ({ ...f, bodyEn: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors">
                  {saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
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
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className={`px-5 py-3 font-semibold text-gray-600 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'العنوان' : 'Title'}</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'التصنيف' : 'Category'}</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'التاريخ' : 'Date'}</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {news.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{article.titleAr}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {categoryLabel(article.category, locale)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(article)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer
                        ${article.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                      {article.isPublished ? (isAr ? 'منشور' : 'Live') : (isAr ? 'مسودة' : 'Draft')}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400">
                    {formatDate(article.publishedAt ?? article.createdAt, locale)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(article)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" aria-label={isAr ? 'تعديل' : 'Edit'}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(article.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label={isAr ? 'حذف' : 'Delete'}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {isAr ? `${total} نتيجة` : `${total} results`}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:border-primary-300 transition-colors">
                  {isAr ? 'السابق' : 'Prev'}
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-600">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:border-primary-300 transition-colors">
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
