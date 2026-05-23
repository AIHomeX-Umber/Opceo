'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(
        error.message.toLowerCase().includes('already')
          ? 'Looks like you already have an account. Sign in instead.'
          : error.message
      );
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  async function handleOAuth(provider: 'github') {
    setOauthLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (done) {
    return (
      <div className="w-full text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.04em] text-[#111111]">
          Check your email
        </h1>
        <p className="mt-4 font-body-serif text-[1rem] leading-7 text-black/54">
          We sent a confirmation link to <span className="text-[#111111]">{email}</span>.
          Click it to activate your account and start building.
        </p>
        <Link href="/" className="mt-7 inline-flex font-body-serif text-[0.95rem] text-[#5B4BFF] no-underline transition-colors hover:text-[#111111]">
          Back to home →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-3 font-mono-jb text-[0.7rem] uppercase tracking-[0.16em] text-black/32">
          Builder onboarding
        </p>
        <h1 className="font-display text-4xl font-medium tracking-[-0.04em] text-[#111111]">
          Start building
        </h1>
        <p className="mt-3 font-body-serif text-[1rem] leading-7 text-black/54">
          创建你的 Builder Profile，开始记录每周进展。
        </p>
      </div>

      <button
        onClick={() => handleOAuth('github')}
        disabled={!!oauthLoading}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#111111] px-4 font-body-serif text-[0.95rem] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2a244e] disabled:translate-y-0 disabled:opacity-55"
      >
        <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        {oauthLoading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/5" />
        </div>
        <div className="relative flex justify-center text-xs">
          <button
            type="button"
            onClick={() => setShowEmail((value) => !value)}
            className="bg-white px-3 font-body-serif text-[0.82rem] text-black/36 transition-colors hover:text-black/62"
          >
            Use email instead
          </button>
        </div>
      </div>

      {showEmail && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl border border-red-500/15 bg-red-50 px-4 py-3 font-body-serif text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-body-serif text-[0.86rem] text-black/50">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="rounded-xl border border-black/8 bg-[#FAFAF5] px-3 py-3 text-sm text-[#111111] placeholder-black/28 transition-colors focus:border-[#5B4BFF]/50 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body-serif text-[0.86rem] text-black/50">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="8+ characters"
              className="rounded-xl border border-black/8 bg-[#FAFAF5] px-3 py-3 text-sm text-[#111111] placeholder-black/28 transition-colors focus:border-[#5B4BFF]/50 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!oauthLoading}
            className="mt-1 h-11 rounded-xl border border-black/5 bg-[#FAFAF5] px-4 font-body-serif text-[0.92rem] text-[#111111] transition-colors hover:bg-white disabled:opacity-55"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}

      <p className="mt-7 text-center font-body-serif text-[0.92rem] text-black/42">
        Already building?{' '}
        <Link href="/auth/login" className="text-[#5B4BFF] no-underline transition-colors hover:text-[#111111]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
