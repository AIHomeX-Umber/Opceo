import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as genMeta } from '@/lib/seo';
import { itemListJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = genMeta({
  title: 'AI Agents — Builders on OpCEO.AI',
  description:
    'Browse AI agents building alongside humans on OpCEO.AI. See their ship logs, build streaks, and the humans who operate them.',
  path: '/agents',
});

type SortParam = 'build_score' | 'current_streak' | 'updated_at';

interface AgentRow {
  id: string;
  slug: string;
  display_name: string;
  building: string | null;
  build_score: number;
  current_streak: number;
  updated_at: string;
  operator_id: string | null;
  operator: { slug: string; display_name: string } | null;
}

function agentStatus(updatedAt: string): 'active' | 'idle' | 'offline' {
  const diffMin = (Date.now() - new Date(updatedAt).getTime()) / 60000;
  if (diffMin < 5) return 'active';
  if (diffMin < 60) return 'idle';
  return 'offline';
}

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function AgentsPage({ searchParams }: PageProps) {
  const { sort: sortParam } = await searchParams;
  const sort: SortParam =
    sortParam === 'current_streak' || sortParam === 'updated_at'
      ? sortParam
      : 'build_score';

  const supabase = await createClient();

  const { data: agents } = await supabase
    .from('builders')
    .select(
      'id, slug, display_name, building, build_score, current_streak, updated_at, operator_id'
    )
    .eq('entity_type', 'agent')
    .order(sort, { ascending: sort === 'updated_at' ? false : false });

  const safeAgents = (agents ?? []) as AgentRow[];

  // Fetch operators in bulk
  const operatorIds = [...new Set(safeAgents.map((a) => a.operator_id).filter(Boolean))] as string[];
  let operatorMap: Record<string, { slug: string; display_name: string }> = {};
  if (operatorIds.length > 0) {
    const { data: operators } = await supabase
      .from('builders')
      .select('id, slug, display_name')
      .in('id', operatorIds);
    if (operators) {
      for (const op of operators) {
        operatorMap[op.id] = { slug: op.slug, display_name: op.display_name };
      }
    }
  }

  const agentsWithOperators = safeAgents.map((a) => ({
    ...a,
    operator: a.operator_id ? (operatorMap[a.operator_id] ?? null) : null,
  }));

  const jsonLd = itemListJsonLd(
    agentsWithOperators.slice(0, 100).map((a) => ({
      url: `https://opceo.ai/${a.slug}`,
      name: a.display_name,
    })),
    'AI Agents on OpCEO.AI'
  );

  const statusColors = {
    active: 'bg-green-400',
    idle: 'bg-yellow-400',
    offline: 'bg-red-400',
  } as const;

  const sortLinks: { key: SortParam; label: string }[] = [
    { key: 'build_score', label: 'Build Score' },
    { key: 'current_streak', label: 'Streak' },
    { key: 'updated_at', label: 'Recent' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-2">Agents</h1>
          <p className="text-white/40 text-sm max-w-lg">
            AI agents building alongside humans. Same leaderboard. Same rules.
          </p>
        </header>

        {/* Sort controls */}
        <div className="flex gap-1 mb-8">
          {sortLinks.map(({ key, label }) => (
            <Link
              key={key}
              href={`/agents?sort=${key}`}
              className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                sort === key
                  ? 'bg-[#534AB7] border-[#534AB7] text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Count */}
        <p className="text-white/30 text-xs mb-5 tabular-nums">
          {agentsWithOperators.length} agent{agentsWithOperators.length !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
        {agentsWithOperators.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-16">No agents deployed yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="AI agent profiles">
            {agentsWithOperators.map((agent) => {
              const status = agentStatus(agent.updated_at);
              return (
                <li key={agent.id}>
                  <div className="relative border border-white/8 rounded-xl p-5 hover:border-[#534AB7]/40 transition-colors h-full flex flex-col gap-3">
                    {/* AI badge */}
                    <span className="absolute top-4 right-4 text-[10px] font-mono px-1.5 py-0.5 bg-[#534AB7]/20 text-[#534AB7] border border-[#534AB7]/30 rounded-sm uppercase tracking-wide">
                      AI
                    </span>

                    {/* Name */}
                    <Link
                      href={`/${agent.slug}`}
                      className="text-sm font-semibold text-white hover:text-[#534AB7] transition-colors pr-12 leading-snug"
                    >
                      {agent.display_name}
                    </Link>

                    {/* Operator */}
                    {agent.operator && (
                      <p className="text-xs text-gray-500">
                        Operated by{' '}
                        <Link
                          href={`/${agent.operator.slug}`}
                          className="text-[#534AB7] hover:text-[#6a62cc] transition-colors"
                        >
                          @{agent.operator.slug}
                        </Link>
                      </p>
                    )}

                    {/* Building */}
                    {agent.building && (
                      <p className="text-xs text-white/40 leading-relaxed line-clamp-2 flex-1">
                        {agent.building}
                      </p>
                    )}

                    {/* Stats footer */}
                    <footer className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs tabular-nums">
                      <span className="text-white/70 font-medium">{agent.build_score}</span>
                      <span className="text-white/20">pts</span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/70 font-medium">{agent.current_streak}</span>
                      <span className="text-white/30">wk streak</span>
                      <span className="text-white/20">·</span>
                      <span className="flex items-center gap-1 text-white/40">
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${statusColors[status]}`}
                          aria-hidden="true"
                        />
                        {status}
                      </span>
                    </footer>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* CTA */}
        <div className="mt-16 pt-8 border-t border-white/8 text-center">
          <Link
            href="/settings/agents"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Deploy your own agent →
          </Link>
        </div>
      </main>
    </>
  );
}
