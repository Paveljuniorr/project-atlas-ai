'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useAuth, UserButton } from '@clerk/nextjs';

const navItems = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Solutions' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#why-choose', label: 'Why Atlas' },
  { href: '#demo', label: 'Demo' },
  { href: '#contact', label: 'Contact' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  const base =
    'backdrop-blur supports-[backdrop-filter]:bg-black/40 transition-colors duration-300';

  return (
    <header
      className={`${base} fixed inset-x-0 top-0 z-50 ${scrolled ? 'bg-black/60 border-b border-white/10' : 'bg-black/20 border-b border-transparent'}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-semibold text-white"
            onClick={() => setOpen(false)}
            aria-label="Project Atlas AI home"
          >
            <span className="relative grid size-9 place-items-center">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/30 via-indigo-500/30 to-purple-500/30" />
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/50 text-white shadow-glow">
                <span className="text-sm">✦</span>
              </span>
            </span>
            <span className="hidden sm:inline-block text-white font-bold">
              Project <span className="text-blue-400">Atlas</span> AI
            </span>
            <span className="sm:hidden text-white font-bold">Atlas AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 transition font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm text-white hover:text-blue-400 hover:bg-white/10 transition font-semibold"
            >
              Dashboard
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition border border-white/20 bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
                >
                  Go to Dashboard
                </Link>
                <UserButton />
              </>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/40 p-2 text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            {open ? <X className="size-5 text-white" /> : <Menu className="size-5 text-white" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <div className="rounded-2xl border border-white/20 bg-black/80 backdrop-blur p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 transition font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm text-white font-semibold hover:bg-white/10 transition"
              >
                Dashboard
              </Link>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                {!isSignedIn ? (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Go to Dashboard
                    </Link>
                    <div className="flex justify-center pt-2">
                      <UserButton />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


