'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SignalBetButtonProps {
  targetId: string;
  targetSlug: string;
  initialCount: number;
  initialBetted: boolean;
}

export default function SignalBetButton({
  targetId,
  targetSlug,
  initialCount,
  initialBetted,
}: SignalBetButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [betted, setBetted] = useState(initialBetted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBet() {
    if (betted || loading) return;
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Get bettor builder id
    const { data: bettor, error: bettorErr } = await supabase
      .from('builders')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (bettorErr || !bettor) {
      setError('Complete your profile first.');
      setLoading(false);
      return;
    }

    if (bettor.id === targetId) {
      setError("You can't bet on yourself.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('signal_bets')
      .insert({ bettor_id: bettor.id, target_id: targetId });

    if (insertError) {
      // Could be duplicate key
      if (insertError.code === '23505') {
        setBetted(true);
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    // Write activity feed entry
    await supabase.from('activity_feed').insert({
      actor_id: bettor.id,
      action: 'bet',
      target_id: targetId,
      summary: `bet on @${targetSlug}`,
    });

    setBetted(true);
    setCount((c) => c + 1);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-1.5 items-start">
      <button
        onClick={handleBet}
        disabled={betted || loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
          betted
            ? 'border-[#534AB7]/40 text-[#534AB7] bg-[#534AB7]/10 cursor-default'
            : 'border-white/15 text-white/70 hover:border-[#534AB7] hover:text-white bg-white/5 hover:bg-[#534AB7]/10'
        } disabled:cursor-not-allowed`}
        aria-label={betted ? 'You already bet on this builder' : "Bet on this builder's success"}
      >
        {loading ? (
          <span className="text-white/40">…</span>
        ) : betted ? (
          <>You bet on this <span className="text-green-400">✓</span></>
        ) : (
          <>I&apos;d bet on this</>
        )}
        <span className="ml-1 tabular-nums text-white/40">{count}</span>
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
