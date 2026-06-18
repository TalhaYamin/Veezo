import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiRequest } from '../lib/api';
import type { SiteSettings } from '../types/admin';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  useEffect(() => {
    apiRequest<SiteSettings>('/settings').then(setSettings).catch(() => null);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    }
  };

  return (
    <Layout>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Contact</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">We are here to help</h1>
          <p className="mt-4 text-zinc-300">For private appointments, wholesale inquiries, or product support, reach our concierge team.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Email</p>
              <a href={`mailto:${settings?.footer.contactInfo.email || 'concierge@veezo.com'}`} className="mt-2 block text-amber-200">
                {settings?.footer.contactInfo.email || 'concierge@veezo.com'}
              </a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Phone</p>
              <p className="mt-2 text-zinc-300">{settings?.footer.contactInfo.phone || 'Mon–Sat, 10am–7pm'}</p>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40" />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40" />
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40" />
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40" />
            <button type="submit" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">Send message</button>
            {sent ? <p className="text-sm text-amber-200">Thank you. Our team will respond within 24 hours.</p> : null}
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </form>
        </section>
      </main>
    </Layout>
  );
}
