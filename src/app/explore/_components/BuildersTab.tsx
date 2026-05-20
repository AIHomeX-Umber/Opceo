// BuildersTab — warm editorial reskin.
// ALL data logic, queries, entityType/sort filters, itemListJsonLd UNCHANGED.
// ExploreClient component is NOT modified (dark-styled client, out of scope).
// Only visual: heading text and entity sub-tabs changed to warm editorial style.

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { itemListJsonLd } from '@/lib/jsonld';
import ExploreClient from '@/components/ExploreClient';
import type { Builder } from '@/lib/types';

interface BuildersTabProps {
  entityType?: string;
  sort?: string;
}

type EntityTabKey = 'all' | 'human' | 'agent';

const ENTITY_TABS: { key: EntityTabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'human', label: 'Humans' },
  { key: 'agent', label: 'Agents' },
];

export async function BuildersTab({ entityType, sort }: BuildersTabProps) {
  const supabase = await createClient();

  const baseQuery = supabase
    .from('builders')
    .select(
      'id, slug, display_name, bio, building, avatar_url, skills, build_score, current_streak, tier, created_at, is_investor, links, user_id, updated_at, longest_streak, total_logs, entity_type, operator_id, agent_meta'
    )
    .order('build_score', { ascending: false });

  const filteredQuery =
    entityType === 'human' || entityType === 'agent'
      ? baseQuery.eq('entity_type', entityType)
      : baseQuery;

  const { data: builders } = await filteredQuery;
  const safeBuilders = (builders ?? []) as unknown as Builder[];

  // JSON-LD for SEO
  const jsonLd = itemListJsonLd(
    safeBuilders.slice(0, 100).map((b) => ({
      url: `https://opceo.ai/${b.slug}`,
      name: b.display_name,
    })),
    'Builders on OpCEO.AI'
  );

  const activeEntity: EntityTabKey =
    entityType === 'human' || entityType === 'agent' ? entityType : 'all';

  function entityTabHref(key: EntityTabKey) {
    const params = new URLSearchParams({ tab: 'builders' });
    if (key !== 'all') params.set('entity_type', key);
    if (sort) params.set('sort', sort);
    return `/explore?${params.toString()}`;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-[1.4rem] font-medium text-[#191613]">Builders</h2>
            <p className="font-body-serif text-[0.8rem] text-[#AEA899] mt-0.5">
              People shipping in public — browse by score, streak, or skills.
            </p>
          </div>
        </div>

        {/* Entity sub-filter — warm underline tabs */}
        <div className="flex gap-0 mb-8 border-b border-[#DDD8CB]">
          {ENTITY_TABS.map(({ key, label }) => (
            <Link
              key={key}
              href={entityTabHref(key)}
              className={`font-body-serif px-4 py-2 text-[0.88rem] transition-colors -mb-px border-b-2 ${
                activeEntity === key
                  ? 'border-[#C15F3C] text-[#191613]'
                  : 'border-transparent text-[#847E72] hover:text-[#5C564C]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <ExploreClient builders={safeBuilders} />
      </div>
    </>
  );
}
