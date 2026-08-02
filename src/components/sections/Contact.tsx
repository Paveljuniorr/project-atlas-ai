'use client';

import { useMemo, useState } from 'react';
import Reveal from '@/components/ui/Reveal';

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

const initial: FormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  message: ''
};

export default function Contact() {
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.company.trim().length >= 2 &&
      /.+@.+\..+/.test(form.email) &&
      form.phone.trim().length >= 6 &&
      form.message.trim().length >= 10
    );
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || status === 'submitting') return;

    setStatus('submitting');

    // Frontend-only handling for Vercel-compatible initial version.
    // Later, connect these fields to Formspree / Resend / Email API.
    // We intentionally do not call any backend.
    await new Promise((r) => setTimeout(r, 700));

    setStatus('success');;

    // Optional: reset form
    setForm(initial);

    // Provide a useful experience in early version:
    // open the user's mail client with prefilled content.
    const subject = encodeURIComponent('Request Demo - Project Atlas AI');
    const body = encodeURIComponent(
      `Name: ${form.name}\nCompany: ${form.company}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
    );

    window.location.href = `mailto:juniordouontio@gmail.com?subject=${subject}&body=${body}`;

    // Note: this redirect opens mail client; status remains success.
  }

  return (
    <section id="contact" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Request a demo
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
                Let’s automate your business
              </h2>
              <p className="mt-3 text-white/70 text-base md:text-lg leading-relaxed">
                Tell us what you want to automate. We’ll respond with a recommended
                AI workflow and next steps.
              </p>

              <div className="mt-7 space-y-3 text-sm text-white/75">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-2xl border border-white/10 bg-black/20 grid place-items-center">✉</span>
                  <a className="hover:text-white transition" href="mailto:juniordouontio@gmail.com">
                    juniordouontio@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-2xl border border-white/10 bg-black/20 grid place-items-center">☎</span>
                  <a className="hover:text-white transition" href="tel:+237672347508">
                    +237 672347508
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={120}>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 shadow-glow">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-white/75">Name</span>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-white/20"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-white/75">Company</span>
                    <input
                      value={form.company}
                      onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-white/20"
                      placeholder="Company name"
                      autoComplete="organization"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-white/75">Email</span>
                    <input
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-white/20"
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-white/75">Phone</span>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-white/20"
                      placeholder="Your phone"
                      autoComplete="tel"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm text-white/75">Message</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                    className="mt-2 min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-white/20"
                    placeholder="What repetitive tasks or workflows do you want to automate?"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!canSubmit || status === 'submitting'}
                  className="w-full rounded-xl bg-gradient-to-r from-electricBlue via-purple-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-black shadow-glow hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Submitting…' : status === 'success' ? 'Request sent!' : 'Request Demo'}
                </button>

                <div className="text-xs text-white/55 leading-relaxed">
                  Compatibility note: this version uses frontend-only handling. To connect later, replace the submit
                  logic with Formspree/Resend/Email API.
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

