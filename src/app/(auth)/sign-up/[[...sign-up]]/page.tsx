import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
      <div className="mb-6 text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-slate-900 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <span className="text-xl font-bold text-slate-900">Project Atlas AI</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Create your Account</h1>
        <p className="text-slate-500 text-sm">Get started with Google in seconds</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
        <SignUp forceRedirectUrl="/dashboard" signInUrl="/sign-in" />
      </div>
    </div>
  );
}


