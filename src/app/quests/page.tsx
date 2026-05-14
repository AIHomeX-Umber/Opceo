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
  title: 'Quest Board — Find Tasks & Collaborations',
  description:
    'Post a task. Claim a quest. Ship together. Browse open quests across AI, design, dev, content, and research on opceo.ai.',
  path: '/quests',
});

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    difficulty?: string;
    reward_type?: string;
  }>;
}

export default async function QuestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Auth for "Post a Quest" button
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Build query
  let query = supabase
    .from('quests')
    .select(
      `
      id, poster_id, title, description, category, skills_needed,
      reward_type, reward_detail, difficulty, status,
      max_claimers, deadline, created_at, updated_at,
      poster:builders!quests_poster_id_fkey(slug, display_name, avatar_url),
      claims_count:quest_claims(count)
    `
    )
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (params.category) query = query.eq('category', params.category);
  if (params.status) query = query.eq('status', params.status);
  if (params.difficulty) query = query.eq('difficulty', params.difficulty);
  if (params.reward_type) query = query.eq('reward_type', params.reward_type);

  const { data: rawQuests } = await query;

  // Normalize Supabase aggregate shape
  const quests: Quest[] = (rawQuests ?? []).map((q: Record<string, unknown>) => {
    const claimsArr = q.claims_count as Array<{ count: number }> | null;
    const count = Array.isArray(claimsArr) && claimsArr.length > 0
      ? (claimsArr[0].count ?? 0)
      : 0;
    const posterRaw = q.poster as Quest['poster'] | Quest['poster'][] | null;
    const poster = Array.isArray(posterRaw) ? posterRaw[0] : posterRaw ?? undefined;
    return { ...(q as unknown as Quest), poster, claims_count: count };
  });

  const jsonLd = itemListJsonLd(
    quests.map((q) => ({ url: `https://opceo.ai/quests/${q.id}`, name: q.title })),
    'Quest Board — opceo.ai'
  );

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Quest Board
          </h1>
          <p className="text-gray-400 text-lg">
            Post a task. Claim a quest. Ship together.
          </p>
        </div>

        {/* Actions + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <div className="flex-1">
            <QuestFilters current={params} />
          </div>
          {user ? (
            <Link
              href="/quests/new"
              className="shrink-0 inline-flex items-center justify-center h-9 px-4 bg-[#534AB7] hover:bg-[#4a42a8] text-white text-sm font-medium rounded-sm transition-colors"
            >
              Post a quest
            </Link>
          ) : (
            <Link
              href="/auth/login?next=/quests/new"
              className="shrink-0 inline-flex items-center justify-center h-9 px-4 border border-[#534AB7] text-[#534AB7] hover:bg-[#534AB7]/10 text-sm font-medium rounded-sm transition-colors"
            >
              Post a quest
            </Link>
          )}
        </div>

        {/* Grid */}
        {quests.length === 0 ? (
          <div className="border border-white/5 rounded-sm p-16 text-center">
            <p className="text-gray-500 text-sm">No quests match your filters.</p>
            <Link
              href="/quests"
              className="mt-4 inline-block text-xs text-[#534AB7] hover:underline"
            >
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
