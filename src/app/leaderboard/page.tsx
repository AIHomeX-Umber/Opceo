// app/leaderboard/page.tsx — Leaderboard (Server Component)
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import LeaderboardTabs from '@/components/LeaderboardTabs';
import type { Builder } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Leaderboard — Top Builders | opceo.ai',
  description:
    'Top builders on opceo.ai ranked by Build Score and consecutive ship streak. See who ships the most consistently.',
  alternates: { canonical: 'https://opceo.ai/leaderboard' },
  openGraph: {
    title: 'Leaderboard — Top Builders',
    description:
      'Top builders on opceo.ai ranked by Build Score and consecutive ship streak. See who ships the most consistently.',
    url: 'https://opceo.ai/leaderboard',
  },
};

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const [{ data: byScore }, { data: byStreak }] = await Promise.all([
    supabase
      .from('builders')
      .select(
        'id, slug, display_name, avatar_url, building, build_score, current_streak, longest_streak, total_logs, tier'
      )
      .order('build_score', { ascending: false })
      .limit(50),
    supabase
      .from('builders')
      .select(
        'id, slug, display_name, avatar_url, building, build_score, current_streak, longest_streak, total_logs, tier'
      )
      .order('current_streak', { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Leaderboard
        </h1>
        <p className="text-gray-400 text-lg">
          The builders who ship the most, the most consistently.
        </p>
      </div>

      <LeaderboardTabs
        byScore={(byScore ?? []) as Builder[]}
        byStreak={(byStreak ?? []) as Builder[]}
      />
    </div>
  );
}
