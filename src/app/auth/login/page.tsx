import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import LoginFormInner from './LoginFormInner';

export const metadata: Metadata = {
  title: 'Sign In | OpCEO.AI',
  description: 'Sign in to your OpCEO.AI builder profile and keep shipping.',
};

export default async function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-mono text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-80">
          OpCEO<span className="text-[#3B82F6]">.AI</span>
        </Link>
        <Link href="/auth/register" className="text-sm text-white/50 transition-colors hover:text-white">
          Join
        </Link>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl grid-cols-1 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:items-center lg:gap-20 lg:pb-24 lg:pt-16">
        <section className="mb-12 lg:mb-0">
          <p className="mb-5 font-mono text-xs uppercase tracking-wider text-white/30">
            Frontier Gateway
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Build in public.
            <br />
            Compound weekly.
            <br />
            Become impossible to ignore.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
            For AI-native builders shipping in public.
          </p>

          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {['Weekly ships.', 'Visible trajectories.', 'Signal before consensus.'].map((signal) => (
              <div
                key={signal}
                className="border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/20"
              >
                <p className="font-mono text-xs uppercase tracking-wider text-white/55">{signal}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <Suspense fallback={
            <div className="w-full max-w-sm flex items-center justify-center py-12">
              <span className="text-white/30 text-sm">Loading…</span>
            </div>
          }>
            <LoginFormInner />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
