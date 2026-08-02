'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import Link from 'next/link';

function NetworkBg() {
  const dots = useMemo(() => {
    const out: Array<{ x: number; y: number; s: number; o: number }> = [];
    for (let i = 0; i < 70; i++) {
      out.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 1 + Math.random() * 2,
        o: 0.25 + Math.random() * 0.6
      });
    }
    return out;
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 left-1/2 w-[860px] h-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_60%)] blur-2xl" />
      <div className="absolute inset-0 opacity-70 bg-grid" />
      <div className="absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {dots.map((d, idx) => (
            <g key={idx}>
              <circle cx={d.x} cy={d.y} r={d.s * 0.22} fill="rgba(99,102,241,0.9)" opacity={d.o} />
            </g>
          ))}
          <path
            d="M5 65 C 20 55, 35 45, 52 53 S 80 70, 95 60"
            fill="none"
            stroke="rgba(34,211,238,0.35)"
            strokeWidth="0.6"
          />
          <path
            d="M8 35 C 28 25, 44 30, 55 40 S 82 60, 92 44"
            fill="none"
            stroke="rgba(168,85,247,0.35)"
            strokeWidth="0.6"
          />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-[#060815]" />
    </div>
  );
}

export default function Hero() {
  const [trustedIndex, setTrustedIndex] = useState(0);
  const trust = [
    'Built for speed',
    'Lead capture focused',
    'Automation-first design',
    'Enterprise-ready delivery'
  ];

  return (
    <section className="relative pt-24 sm:pt-28">
      <NetworkBg />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Reveal delayMs={60}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                <Sparkles className="size-3.5 text-electricBlue" />
                Premium AI automation for modern teams
              </div>
            </Reveal>

            <Reveal delayMs={120} className="mt-6">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                Automate Your Business With <span className="text-transparent bg-clip-text bg-gradient-to-r from-electricBlue via-purple-500 to-cyan-400">AI</span>
              </h1>
            </Reveal>

            <Reveal delayMs={180} className="mt-5">
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-xl">
                Project Atlas AI builds intelligent automation systems that help
                businesses respond faster, manage leads, and eliminate repetitive work.
              </p>
            </Reveal>

            <Reveal delayMs={240} className="mt-8">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
                >
                  Access Dashboard <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  Sign Up
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                >
                  Book Demo
                </Link>
              </div>
            </Reveal>

            <Reveal delayMs={300} className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex -space-x-2">
                  {['#8b5cf6', '#22d3ee', '#60a5fa'].map((c, i) => (
                    <span
                      key={i}
                      className="inline-grid size-9 place-items-center rounded-full border border-white/15 bg-black/30"
                      style={{ boxShadow: `0 0 0 3px rgba(255,255,255,0.02), 0 0 40px ${c}33` }}
                    >
                      <span className="size-2.5 rounded-full bg-gradient-to-r from-electricBlue to-purple-500" />
                    </span>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold">Trusted by teams that move fast</div>
                  <div className="text-sm text-white/65">
                    {trust[trustedIndex]} • Built with privacy-first design
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delayMs={120}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-electricBlue/20 via-purple-500/20 to-cyan-400/20 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-black/30 backdrop-blur p-5 shadow-glow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                    <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                  </div>
                  <div className="text-xs text-white/60">Atlas Console</div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Lead response</div>
                    <div className="mt-2 flex items-end gap-2">
                      <div className="text-3xl font-semibold">2m</div>
                      <div className="text-sm text-white/60 pb-1">avg time</div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-electricBlue via-purple-500 to-cyan-400" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Automation coverage</div>
                    <div className="mt-2 flex items-end gap-2">
                      <div className="text-3xl font-semibold">87%</div>
                      <div className="text-sm text-white/60 pb-1">workflows</div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-11/14 bg-gradient-to-r from-purple-500 via-electricBlue to-cyan-400" />
                    </div>
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/60">Next best actions</div>
                        <div className="mt-1 text-sm font-semibold">AI agent pipeline</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                        Live
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        { t: 'Qualify leads', p: 'Instant scoring & routing' },
                        { t: 'Support replies', p: '24/7 answers with context' },
                        { t: 'Ops automation', p: 'Workflows across your stack' }
                      ].map((x) => (
                        <div key={x.t} className="rounded-xl bg-black/20 border border-white/10 p-3">
                          <div className="text-xs font-semibold">{x.t}</div>
                          <div className="mt-1 text-xs text-white/60">{x.p}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Neural workflow simulation</div>
                    <button
                      className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75 hover:bg-white/10 transition"
                      onClick={() => setTrustedIndex((i) => (i + 1) % trust.length)}
                    >
                      Cycle status
                    </button>
                  </div>
                  <div className="mt-3 h-28 rounded-xl bg-gradient-to-br from-electricBlue/10 via-purple-500/10 to-cyan-400/10 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.35),transparent_45%)]" />
                    <div className="absolute inset-0 opacity-70">
                      <div className="absolute left-6 top-6 animate-floaty h-3 w-3 rounded-full bg-electricBlue/80" />
                      <div className="absolute right-8 top-14 animate-floaty delay-150 h-2.5 w-2.5 rounded-full bg-purple-500/80" />
                      <div className="absolute left-14 bottom-10 animate-floaty delay-300 h-2.5 w-2.5 rounded-full bg-cyan-400/80" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

