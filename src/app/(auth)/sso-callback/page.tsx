"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-slate-600">Completing secure Google sign-in...</p>
      </div>
      <AuthenticateWithRedirectCallback fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
