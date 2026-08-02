import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060815] text-white p-4">
      <div className="mb-6 text-center max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Project Atlas AI</h1>
        <p className="text-white/80 text-sm">Sign in to manage your AI leads and workflows</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/40 p-2 shadow-2xl backdrop-blur">
        <SignIn />
      </div>
    </div>
  );
}

