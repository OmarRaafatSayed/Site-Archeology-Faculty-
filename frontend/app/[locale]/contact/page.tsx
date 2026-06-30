'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

export default function ContactPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO Phase 7+: wire up contact API
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'اتصل بنا' : 'Contact Us'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-5">{isAr ? 'معلومات التواصل' : 'Contact Information'}</h2>
            <div className="space-y-4 text-gray-600">
              {[
                { icon: '📍', label: isAr ? 'العنوان' : 'Address', value: isAr ? 'شارع النيل — الجيزة، مصر' : 'Nile Street — Giza, Egypt' },
                { icon: '📧', label: isAr ? 'البريد' : 'Email', value: 'archaeology@cu.edu.eg' },
                { icon: '🌐', label: isAr ? 'الموقع' : 'Website', value: 'fa-arch.cu.edu.eg' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">✅</div>
                <p className="font-semibold text-gray-900">{isAr ? 'شكراً! تم استلام رسالتك.' : 'Thank you! Your message has been received.'}</p>
                <button onClick={() => setSent(false)} className="mt-4 text-sm text-gold-700 hover:text-gold-600 hover:underline transition-colors">
                  {isAr ? 'إرسال رسالة أخرى' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { name: 'name', label: isAr ? 'الاسم *' : 'Name *', type: 'text', required: true },
                  { name: 'email', label: isAr ? 'البريد الإلكتروني *' : 'Email *', type: 'email', required: true },
                  { name: 'subject', label: isAr ? 'الموضوع' : 'Subject', type: 'text', required: false },
                ].map(({ name, label, type, required }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input type={type} required={required} value={form[name as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{isAr ? 'الرسالة *' : 'Message *'}</label>
                  <textarea rows={5} required value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 text-sm resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gold-600 text-white font-semibold rounded-xl hover:bg-gold-700 disabled:opacity-60 transition-colors">
                  {loading ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة' : 'Send Message')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
