'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | null>(null);
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
        <h1 className="text-xl font-semibold text-white mb-2">Check your email</h1>
        <p className="text-sm text-white/50 mb-6">
          We sent a confirmation link to <span className="text-white">{email}</span>.
          Click it to activate your account and start building.
        </p>
        <Link href="/" className="text-sm text-[#534AB7] hover:text-white transition-colors">
          Back to home →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-white/30">Join OpCEO.AI</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Start building</h1>
        <p className="text-sm text-zinc-400">GitHub is the fastest path into the frontier.</p>
      </div>

      {/* OAuth buttons */}
      <div className="mb-6">
        <button
          onClick={() => handleOAuth('github')}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-50 rounded-md text-sm font-medium text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {oauthLoading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0a0a0a] px-2 text-white/30">or</span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#534AB7] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="8+ characters"
            className="px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#534AB7] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!oauthLoading}
          className="mt-1 px-4 py-2.5 border border-white/10 bg-white/[0.02] hover:border-white/20 disabled:opacity-50 text-white/70 hover:text-white text-sm font-medium rounded-md transition-colors"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Already building?{' '}
        <Link href="/auth/login" className="text-[#534AB7] hover:text-white transition-colors">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-white/25">
        By signing up, you commit to shipping. Lurkers not welcome.
      </p>
    </div>
  );
}
