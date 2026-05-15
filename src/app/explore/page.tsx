import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as genMeta } from '@/lib/seo';
import { itemListJsonLd } from '@/lib/jsonld';
import ExploreClient from '@/components/ExploreClient';

export const metadata: Metadata = genMeta({
  title: 'Explore Builders',
  description:
    'Discover builders shipping in public on opceo.ai. Browse by build score, streak, and skills — then signal bet on the ones you believe in.',
  path: '/explore',
});

interface PageProps {
  searchParams: Promise<{ entity_type?: string; sort?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { entity_type, sort } = await searchParams;
  const supabase = await createClient();

  const baseQuery = supabase
    .from('builders')
    .select(
      'id, slug, display_name, bio, building, avatar_url, skills, build_score, current_streak, tier, created_at, is_investor, links, user_id, updated_at, longest_streak, total_logs, entity_type, operator_id, agent_meta'
    )
    .order('build_score', { ascending: false });

  const filteredQuery =
    entity_type === 'human' || entity_type === 'agent'
      ? baseQuery.eq('entity_type', entity_type)
      : baseQuery;

  const { data: builders } = await filteredQuery;

  const safeBuilders = (builders || []) as unknown as import('@/lib/types').Builder[];

  const jsonLd = itemListJsonLd(
    safeBuilders.slice(0, 100).map((b) => ({
      url: `https://opceo.ai/${b.slug}`,
      name: b.display_name,
    })),
    'Builders on opceo.ai'
  );

  // Build sort query string helper (preserve sort when switching entity_type)
  function tabHref(et: string | undefined) {
    const params = new URLSearchParams();
    if (et) params.set('entity_type', et);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    return `/explore${qs ? `?${qs}` : ''}`;
  }

  const activeTab = entity_type === 'human' || entity_type === 'agent' ? entity_type : 'all';

  const tabs: { key: 'all' | 'human' | 'agent'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'human', label: 'Humans' },
    { key: 'agent', label: 'Agents' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Explore Builders</h1>
          <p className="text-white/40 text-sm max-w-lg">
            People shipping in public. Browse by score, streak, or skills — then bet on the ones
            you believe will go far.
          </p>
        </header>

        {/* Entity type filter tabs */}
        <div className="flex gap-0 mb-8 border-b border-white/8">
          {tabs.map(({ key, label }) => (
            <Link
              key={key}
              href={tabHref(key === 'all' ? undefined : key)}
              className={`px-4 py-2 text-sm transition-colors -mb-px ${
                activeTab === key
                  ? 'border-b-2 border-[#534AB7] text-white'
                  : 'text-gray-500 hover:text-white/70'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <ExploreClient builders={safeBuilders} />
      </main>
    </>
  );
}
