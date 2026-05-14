'use client';
// components/ClaimQuestButton.tsx

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  questId: string;
  maxClaimers: number;
}

export default function ClaimQuestButton({ questId, maxClaimers: _maxClaimers }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  const handleOpen = useCallback(() => {
    if (!userId) {
      router.push('/auth/login');
      return;
    }
    setOpen(true);
  }, [userId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pitch.trim().length < 30) {
      setError('Please write at least 30 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Get builder id
      const { data: builder, error: builderErr } = await supabase
        .from('builders')
        .select('id')
        .eq('user_id', userId!)
        .single();
      if (builderErr || !builder) throw new Error('Builder profile not found.');

      const { error: insertErr } = await supabase.from('quest_claims').insert({
        quest_id: questId,
        claimer_id: builder.id,
        pitch: pitch.trim(),
        status: 'pending',
      });
      if (insertErr) throw insertErr;

      setOpen(false);
      setPitch('');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit claim.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center justify-center h-10 px-5 bg-[#534AB7] hover:bg-[#4a42a8] text-white text-sm font-medium rounded-sm transition-colors"
      >
        Claim this quest
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-sm p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="claim-dialog-title"
          >
            <h2 id="claim-dialog-title" className="text-lg font-semibold text-white mb-1">
              Claim this quest
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Why are you the right person for this?
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <textarea
                rows={5}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Describe your relevant experience, how you'd approach it, and what you'll deliver."
                className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm rounded-sm px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
                autoFocus
              />
              <p className="text-xs text-gray-600 mt-1 text-right mb-4">
                {pitch.trim().length} chars{' '}
                {pitch.trim().length < 30 && (
                  <span className="text-yellow-500">
                    (min 30)
                  </span>
                )}
              </p>

              {error && (
                <p className="text-red-400 text-xs mb-3">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-9 bg-[#534AB7] hover:bg-[#4a42a8] disabled:opacity-50 text-white text-sm font-medium rounded-sm transition-colors"
                >
                  {loading ? 'Submitting…' : 'Submit claim'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 border border-white/10 text-gray-400 hover:text-white text-sm rounded-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
