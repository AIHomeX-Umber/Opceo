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
    <div style={{ background: '#FAFAF5', minHeight: '100vh' }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* ── Tab bar ──────────────────────────────────────────────────
          Warm editorial underline tabs. Mobile: overflow-x-auto scroll.
          URL-driven: each click is a full navigation → back/forward works.
      ─────────────────────────────────────────────────────────────── */}
      <div className="mb-8 overflow-x-auto border-b border-[#DDD8CB]">
        <div className="flex gap-0 min-w-max sm:min-w-0 -mb-px">
          {TABS.map(({ key, label }) => (
            <Link
              key={key}
              href={`/explore?tab=${key}`}
              className={`font-body-serif px-5 py-2.5 text-[0.88rem] transition-colors whitespace-nowrap -mb-px border-b-2 ${
                activeTab === key
                  ? 'border-[#C15F3C] text-[#191613]'
                  : 'border-transparent text-[#847E72] hover:text-[#5C564C]'
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
    </div>
  );
}
