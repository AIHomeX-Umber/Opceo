// app/leaderboard/page.tsx — Leaderboard (Server Component)
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import LeaderboardTabs from '@/components/LeaderboardTabs';
import type { Builder } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Leaderboard — Top Builders | Opeco.AI',
  description:
    'Top builders on Opeco.AI ranked by Build Score and consecutive ship streak. See who ships the most consistently.',
  alternates: { canonical: 'https://opceo.ai/leaderboard' },
  openGraph: {
    title: 'Leaderboard — Top Builders',
    description:
      'Top builders on Opeco.AI ranked by Build Score and consecutive ship streak. See who ships the most consistently.',
    url: 'https://opceo.ai/leaderboard',
  },
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

type TeamRow = { id: string; slug: string; name: string; build_score: number };

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const { tab: tabParam } = await searchParams;
  const tab = ['overall', 'humans', 'agents', 'teams'].includes(tabParam ?? '')
    ? (tabParam as 'overall' | 'humans' | 'agents' | 'teams')
    : 'overall';

  const supabase = await createClient();

  const builderSelect =
    'id, slug, display_name, avatar_url, building, build_score, current_streak, longest_streak, total_logs, tier, entity_type';

  let byScore: Builder[] = [];
  let byStreak: Builder[] = [];
  let topTeams: TeamRow[] = [];

  if (tab === 'teams') {
    const { data: teamsData } = await supabase
      .from('teams')
      .select('id, slug, name, build_score, team_members(count)')
      .order('build_score', { ascending: false })
      .limit(50);
    topTeams = (teamsData ?? []) as TeamRow[];
  } else {
    const scoreQuery = supabase
      .from('builders')
      .select(builderSelect)
      .order('build_score', { ascending: false })
      .limit(50);

    const streakQuery = supabase
      .from('builders')
      .select(builderSelect)
      .order('current_streak', { ascending: false })
      .limit(50);

    if (tab === 'humans') {
      scoreQuery.eq('entity_type', 'human');
      streakQuery.eq('entity_type', 'human');
    } else if (tab === 'agents') {
      scoreQuery.eq('entity_type', 'agent');
      streakQuery.eq('entity_type', 'agent');
    }

    const [{ data: scoreData }, { data: streakData }] = await Promise.all([
      scoreQuery,
      streakQuery,
    ]);

    byScore = (scoreData ?? []) as Builder[];
    byStreak = (streakData ?? []) as Builder[];
  }

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
        byScore={byScore}
        byStreak={byStreak}
        tab={tab}
        topTeams={topTeams}
      />
    </div>
  );
}
