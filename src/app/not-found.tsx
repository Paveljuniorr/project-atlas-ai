import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-sm text-white/60">404</div>
      <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-white/70 max-w-xl">
        The page you are looking for doesn’t exist or may have been moved.
      </p>
      <Link
        href="#"
        className="mt-6 inline-flex rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
      >
        Back to home
      </Link>
    </div>
  );
}

