'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const isSignedIn = !!session;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm'
          : 'bg-white/50 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-slate-900"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Project <span className="text-indigo-600">Atlas</span> AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-slate-900 transition">Features</Link>
            <Link href="#solution" className="hover:text-slate-900 transition">Solutions</Link>
            <Link href="#architecture" className="hover:text-slate-900 transition">Platform</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Go to Dashboard <ArrowRight className="size-4" />
                </Link>
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {session?.user?.name?.[0] || "A"}
                  </div>
                )}
              </>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pb-4 pt-2 shadow-lg">
          <nav className="flex flex-col gap-2 font-medium text-slate-700">
            <Link href="#features" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">Features</Link>
            <Link href="#solution" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">Solutions</Link>
            <Link href="#architecture" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">Platform</Link>
          </nav>
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col gap-2">
            {!isSignedIn ? (
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Continue with Google
              </Link>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
