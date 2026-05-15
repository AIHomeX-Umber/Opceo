// app/quests/page.tsx — Quest Board (Server Component + client filters)
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as gm } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { itemListJsonLd } from '@/lib/jsonld';
import QuestCard from '@/components/QuestCard';
import QuestFilters from '@/components/QuestFilters';
import type { Quest } from '@/lib/types';

export const metadata: Metadata = gm({
  title: 'Quest Board — Find Tasks & Signals',
  description:
    'Post a task. Claim a quest. Signal real-world friction. Browse open quests and signals across AI, design, dev, content, and research on Opeco.AI.',
  path: '/quests',
});

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    difficulty?: string;
    reward_type?: string;
    signal_status?: string;
    market_size?: string;
  }>;
}

export default async function QuestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('quests')
    .select(`
      id, poster_id, title, description, category, skills_needed,
      reward_type, reward_detail, difficulty, status,
      max_claimers, deadline, created_at, updated_at,
      signal_strength, signal_status, market_size, location, seen_count,
      poster:builders!quests_poster_id_fkey(slug, display_name, avatar_url),
      claims_count:quest_claims(count)
    `)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (params.category) query = query.eq('category', params.category);
  if (params.status && params.category !== 'signal') query = query.eq('status', params.status);
  if (params.difficulty && params.category !== 'signal') query = query.eq('difficulty', params.difficulty);
  if (params.reward_type && params.category !== 'signal') query = query.eq('reward_type', params.reward_type);
  if (params.signal_status && params.category === 'signal') query = query.eq('signal_status', params.signal_status);
  if (params.market_size && params.category === 'signal') query = query.eq('market_size', params.market_size);

  // Signal board sorts by seen_count desc; others by newest
  if (params.category === 'signal') {
    query = query.order('seen_count', { ascending: false });
  }

  const { data: rawQuests } = await query;

  const quests: Quest[] = (rawQuests ?? []).map((q: Record<string, unknown>) => {
    const claimsArr = q.claims_count as Array<{ count: number }> | null;
    const count = Array.isArray(claimsArr) && claimsArr.length > 0 ? (claimsArr[0].count ?? 0) : 0;
    const posterRaw = q.poster as Quest['poster'] | Quest['poster'][] | null;
    const poster = Array.isArray(posterRaw) ? posterRaw[0] : posterRaw ?? undefined;
    return { ...(q as unknown as Quest), poster, claims_count: count };
  });

  const jsonLd = itemListJsonLd(
    quests.map((q) => ({ url: `https://opceo.ai/quests/${q.id}`, name: q.title })),
    'Quest Board — Opeco.AI'
  );

  const isSignalView = params.category === 'signal';

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {isSignalView ? 'Real World Signals' : 'Quest Board'}
          </h1>
          <p className="text-gray-400 text-lg">
            {isSignalView
              ? 'Problems builders are finding in the wild.'
              : 'Post a task. Claim a quest. Ship together.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <div className="flex-1">
            <QuestFilters current={params} />
          </div>
          {user ? (
            <Link
              href="/quests/new"
              className={`shrink-0 inline-flex items-center justify-center h-9 px-4 text-white text-sm font-medium rounded-sm transition-colors ${
                isSignalView
                  ? 'bg-[#D85A30] hover:bg-[#c04e28]'
                  : 'bg-[#534AB7] hover:bg-[#4a42a8]'
              }`}
            >
              {isSignalView ? 'Post a signal' : 'Post a quest'}
            </Link>
          ) : (
            <Link
              href="/auth/login?next=/quests/new"
              className="shrink-0 inline-flex items-center justify-center h-9 px-4 border border-[#534AB7] text-[#534AB7] hover:bg-[#534AB7]/10 text-sm font-medium rounded-sm transition-colors"
            >
              {isSignalView ? 'Post a signal' : 'Post a quest'}
            </Link>
          )}
        </div>

        {quests.length === 0 ? (
          <div className="border border-white/5 rounded-sm p-16 text-center">
            <p className="text-gray-500 text-sm">No {isSignalView ? 'signals' : 'quests'} match your filters.</p>
            <Link href={isSignalView ? '/quests?category=signal' : '/quests'} className="mt-4 inline-block text-xs text-[#534AB7] hover:underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
