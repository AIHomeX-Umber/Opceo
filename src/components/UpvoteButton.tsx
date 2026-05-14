'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UpvoteButtonProps {
  logId: string;
  builderId: string;
  initialCount: number;
  initialUpvoted: boolean;
}

export default function UpvoteButton({
  logId,
  builderId,
  initialCount,
  initialUpvoted,
}: UpvoteButtonProps) {
  const router = useRouter();
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleUpvote() {
    if (upvoted || loading) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Get current user's builder id
    const { data: currentBuilder } = await supabase
      .from('builders')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!currentBuilder) {
      router.push('/onboarding');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('upvotes')
      .insert({ builder_id: currentBuilder.id, log_id: logId });

    if (!error) {
      setUpvoted(true);
      setCount((c) => c + 1);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={upvoted || loading}
      aria-label={upvoted ? `${count} upvotes` : 'Upvote this ship log'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
        upvoted
          ? 'bg-[#534AB7]/20 border-[#534AB7]/60 text-[#a49ef5] cursor-default'
          : 'bg-transparent border-white/15 text-white/50 hover:border-white/30 hover:text-white'
      } ${loading ? 'opacity-60 cursor-wait' : ''}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill={upvoted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        className="shrink-0"
      >
        <path d="M7 2L12 9H2L7 2Z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
