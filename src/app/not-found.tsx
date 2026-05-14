import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-mono text-[#534AB7] text-sm mb-4">404</p>
        <h1 className="text-2xl font-semibold text-white mb-3">
          This page didn't ship.
        </h1>
        <p className="text-sm text-white/50 mb-8">
          No log for this week. No page here either.
          The only way forward is to build.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 text-sm text-white/60 border border-white/15 rounded-md hover:bg-white/5 transition-colors"
          >
            ← Home
          </Link>
          <Link
            href="/ship"
            className="px-4 py-2 text-sm bg-[#534AB7] hover:bg-[#4339a0] text-white rounded-md transition-colors font-medium"
          >
            Ship something →
          </Link>
        </div>
      </div>
    </div>
  );
}
