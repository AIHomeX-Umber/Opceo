'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);
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
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  async function handleOAuth(provider: 'github' | 'google') {
    setOauthLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">📬</div>
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
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Start building</h1>
        <p className="text-sm text-white/50">Ship weekly. Track your streak. Build in public.</p>
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={() => handleOAuth('github')}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-white/15 rounded-md text-sm text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {oauthLoading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
        </button>

        <button
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-white/15 rounded-md text-sm text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
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
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#534AB7] transition-colors"
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
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#534AB7] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!oauthLoading}
          className="mt-1 px-4 py-2.5 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
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
