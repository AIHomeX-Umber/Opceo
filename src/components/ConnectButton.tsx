'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ConnectButtonProps {
  targetId: string;
  targetName: string;
}

export default function ConnectButton({ targetId, targetName }: ConnectButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (context.trim().length < 50) return;
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: fromBuilder, error: fromErr } = await supabase
      .from('builders')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (fromErr || !fromBuilder) {
      setError('Complete your profile before connecting.');
      setLoading(false);
      return;
    }

    if (fromBuilder.id === targetId) {
      setError("You can't connect with yourself.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('connect_requests')
      .insert({
        from_id: fromBuilder.id,
        to_id: targetId,
        context: context.trim(),
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
    setTimeout(() => setOpen(false), 1500);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-4 py-2 rounded-md text-sm font-medium border border-white/15 text-white/70 hover:border-white/40 hover:text-white bg-white/5 transition-colors"
        aria-label={`Request to connect with ${targetName}`}
      >
        {sent ? <span className="text-green-400">Request sent ✓</span> : 'Connect'}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Connect with ${targetName}`}
        >
          <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-base">
                Connect with {targetName}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white transition-colors text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-white/40 text-sm">
              Tell them why you want to connect. Be specific — this goes directly to them.
            </p>

            {sent ? (
              <p className="text-green-400 text-sm text-center py-4">Request sent ✓</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="connect-context" className="text-xs text-white/50 flex justify-between">
                    <span>Context <span className="text-[#534AB7]">*</span></span>
                    <span className={context.length < 50 ? 'text-white/30' : 'text-green-400'}>
                      {context.length}/50 min
                    </span>
                  </label>
                  <textarea
                    id="connect-context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={5}
                    required
                    minLength={50}
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
                    placeholder="Why do you want to connect? What specific collaboration or conversation do you have in mind?"
                  />
                  {context.length > 0 && context.length < 50 && (
                    <p className="text-white/30 text-xs">{50 - context.length} more characters required</p>
                  )}
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || context.trim().length < 50}
                  className="px-4 py-2.5 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                >
                  {loading ? 'Sending…' : 'Send request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
