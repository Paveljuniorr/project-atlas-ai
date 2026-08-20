"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, AlertCircle, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const clerkSignIn = useSignIn() as any;
  const signIn = clerkSignIn?.signIn;
  const isLoaded = clerkSignIn?.isLoaded;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError(null);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setLoading(false);
      setError(err?.errors?.[0]?.message || err.message || "Failed to initiate Google sign-in.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
      {/* Brand Header */}
      <div className="mb-6 text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-slate-900 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md">
            <Sparkles className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Project Atlas AI</span>
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1.5">
          Sign In to your Workspace
        </h1>
        <p className="text-slate-500 text-sm">
          Access your AI Revenue Operating System with Google SSO
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={!isLoaded || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? (
              <div className="size-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            ) : (
              <svg className="size-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span>{loading ? "Redirecting to Google..." : "Continue with Google"}</span>
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign up with Google
            </Link>
          </p>
        </div>
      </div>

      {/* Security Footer */}
      <p className="mt-8 text-center text-xs text-slate-400 max-w-xs">
        Protected by Clerk enterprise authentication and Google Single Sign-On.
      </p>
    </div>
  );
}
