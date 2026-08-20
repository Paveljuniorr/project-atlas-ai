'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();

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
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition flex items-center gap-1.5"
                >
                  Continue with Google <ArrowRight className="size-4" />
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Dashboard
                </Link>
                <UserButton />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle menu"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden shadow-lg">
          <nav className="flex flex-col gap-3">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-700 py-1"
              onClick={() => setOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#solution"
              className="text-sm font-medium text-slate-700 py-1"
              onClick={() => setOpen(false)}
            >
              Solutions
            </Link>
            <Link
              href="#architecture"
              className="text-sm font-medium text-slate-700 py-1"
              onClick={() => setOpen(false)}
            >
              Platform
            </Link>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {!isSignedIn ? (
                <Link
                  href="/sign-in"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                  onClick={() => setOpen(false)}
                >
                  Continue with Google
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                  onClick={() => setOpen(false)}
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
