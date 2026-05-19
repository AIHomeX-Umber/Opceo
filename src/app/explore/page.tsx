// app/explore/page.tsx — Explore hub with tab architecture
// Tab state lives in ?tab=rankings|live|builders (URL-driven, back/forward safe).
// Each tab is an async Server Component; only the active tab fetches data (lazy).

import type { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata as genMeta } from '@/lib/seo';
import { RankingsTab } from './_components/RankingsTab';
import { LiveFeedTab } from './_components/LiveFeedTab';
import { BuildersTab } from './_components/BuildersTab';

export const metadata: Metadata = genMeta({
  title: '持续建造者排行榜',
  description:
    '按真实 Ship 记录、连续建造周数与长期复利信号排序。发现真正持续建造的 AI Native Builder。',
  path: '/explore',
});

type Tab = 'rankings' | 'live' | 'builders';

const TABS: { key: Tab; label: string }[] = [
  { key: 'rankings', label: '排行榜' },
  { key: 'live', label: 'Live' },
  { key: 'builders', label: 'Builders' },
];

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    entity_type?: string;
    sort?: string;
    category?: string;
    limit?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { tab: tabParam, entity_type, sort, category, limit: limitStr } = await searchParams;

  // Default to rankings; only accept known tab values
  const activeTab: Tab =
    tabParam === 'live' || tabParam === 'builders' ? tabParam : 'rankings';

  // Clamp limit: min 20, max 200
  const limit = Math.min(Math.max(parseInt(limitStr ?? '20', 10) || 20, 20), 200);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* ── Tab bar ──────────────────────────────────────────────────
          Horizontal pill-style tabs. Mobile: overflow-x-auto scroll.
          URL-driven: each click is a full navigation → back/forward works.
      ─────────────────────────────────────────────────────────────── */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max sm:min-w-0">
          {TABS.map(({ key, label }) => (
            <Link
              key={key}
              href={`/explore?tab=${key}`}
              className={`px-4 py-1.5 text-sm rounded-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'bg-[#534AB7] text-white'
                  : 'border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Active tab content ───────────────────────────────────────
          Conditional rendering: only the active tab server component
          is instantiated, so only that tab's data fetch runs.
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'rankings' && (
        <RankingsTab sort={sort} category={category} limit={limit} />
      )}
      {activeTab === 'live' && <LiveFeedTab />}
      {activeTab === 'builders' && (
        <BuildersTab entityType={entity_type} sort={sort} />
      )}
    </div>
  );
}
