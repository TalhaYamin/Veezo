import { useState } from 'react';
import Layout from '../components/Layout';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

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
              <a href="mailto:concierge@veezo.com" className="mt-2 block text-amber-200">concierge@veezo.com</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Hours</p>
              <p className="mt-2 text-zinc-300">Mon–Sat, 10am–7pm</p>
            </div>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <input required placeholder="Your name" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40" />
            <input required type="email" placeholder="Email address" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40" />
            <textarea required rows={4} placeholder="How can we help?" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40" />
            <button type="submit" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">Send message</button>
            {sent ? <p className="text-sm text-amber-200">Thank you. Our team will respond within 24 hours.</p> : null}
          </form>
        </section>
      </main>
    </Layout>
  );
}
