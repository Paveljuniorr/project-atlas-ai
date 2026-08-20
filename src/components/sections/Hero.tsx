'use client';

import { Sparkles, ArrowRight, ShieldCheck, Zap, Bot, Users, BarChart3, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

export default function Hero() {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50 border-b border-slate-200/80">
      <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 mb-6">
            <Sparkles className="size-3.5 text-indigo-600" />
            AI-Driven Revenue & Lead Automation Engine
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Autonomous Lead Acquisition & <span className="text-indigo-600">AI CRM Workflows</span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Project Atlas AI instantly qualifies leads, powers autonomous multi-channel conversations, and automates sales pipeline actions for high-velocity teams.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!isSignedIn ? (
              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-indigo-700 transition"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-indigo-700 transition"
              >
                Go to Workspace Dashboard <ArrowRight className="size-5" />
              </Link>
            )}

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              Explore Interactive Platform
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-500" /> Enterprise RBAC Security</span>
            <span className="flex items-center gap-1.5"><Zap className="size-4 text-amber-500" /> WhatsApp & Omnichannel</span>
            <span className="flex items-center gap-1.5"><Check className="size-4 text-indigo-500" /> Google Single Sign-On</span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Bot className="size-5" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Autonomous Lead Qualification</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI evaluates intent, budget, and urgency from incoming messages and updates stage & score instantly.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="size-5" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Omnichannel Unified Inbox</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consolidate WhatsApp Cloud, Twilio SMS, and Email into a single conversation stream with AI drafts.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <BarChart3 className="size-5" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Real-Time Revenue Analytics</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track conversion rates, AI response acceptance, pipeline stages, and upcoming appointment velocity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
