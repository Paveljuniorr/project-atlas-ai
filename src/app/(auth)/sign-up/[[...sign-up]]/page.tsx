"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
      <div className="mb-6 text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-slate-900 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Project Atlas AI</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Create your Workspace</h1>
        <p className="text-slate-500 text-sm">Continue with Google to initialize your company workspace</p>
      </div>

      <div className="w-full max-w-sm">
        <SignUp
          appearance={{
            elements: {
              card: "shadow-xl border border-slate-200 rounded-2xl bg-white",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "rounded-xl border border-slate-200 font-semibold py-2.5 shadow-sm hover:bg-slate-50 text-slate-700",
              dividerRow: "hidden",
              form: "hidden",
              footerAction: "hidden",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
