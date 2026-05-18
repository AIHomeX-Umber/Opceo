// app/page.tsx — Homepage (Server Component)
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import JsonLd from '@/components/JsonLd';
import { websiteJsonLd, organizationJsonLd } from '@/lib/jsonld';
import { generateMetadata as gm } from '@/lib/seo';
import {
  formatRelativeTime,
  getDifficultyColor,
  getCategoryColor,
  getTierColor,
  truncate,
} from '@/lib/utils';
import type { Builder, ShipLog, Quest, Spotlight, ActivityItem } from '@/lib/types';
import { SIGNAL_STATUS_LABELS, SIGNAL_STATUS_COLORS, type SignalStatus } from '@/lib/signal-lifecycle';
import LivePulse from '@/components/LivePulse';

export const metadata: Metadata = gm({
  title: 'OpCEO.AI — The Infinite Build',
  description:
    'Watch real builders ship real things. Every week. OpCEO.AI is an open platform for weekly ship logs, build streaks, and signal-based investing.',
  path: '/',
});

const TECH_TAGS = [
  'AI', 'Cross-border', 'React', 'Design',
  'Marketing', 'Content', 'SaaS', 'Mobile',
  'Growth', 'No-code',
];

const REWARD_LABELS: Record<string, string> = {
  credit: 'Credit', collab: 'Collab', paid: 'Paid', equity: 'Equity', learning: 'Learning',
};

// ── Sub-components (inline, no client state needed) ─────────────────────────

function ShipLogCard({ log }: { log: ShipLog }) {
  return (
    <div className="border border-white/5 rounded-sm p-4 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {log.builder?.avatar_url ? (
          <Image
            src={log.builder.avatar_url}
            alt={log.builder.display_name}
            width={32}
            height={32}
            className="rounded-full object-cover shrink-0 mt-0.5"
          />
        ) : (
          <div className="w-8 h-8 shrink-0 mt-0.5 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#534AB7] text-xs font-bold">
            {(log.builder?.display_name ?? '?')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/${log.builder?.slug ?? '#'}`}
              className="text-sm font-medium text-white hover:text-[#534AB7] transition-colors"
            >
              {log.builder?.display_name ?? 'Builder'}
            </Link>
            <span className="text-xs font-mono text-gray-600">
              W{log.week_number}
            </span>
            <span className="text-xs text-gray-600">
              {formatRelativeTime(log.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
            {log.shipped}
          </p>
          {log.tool_stack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {log.tool_stack.slice(0, 4).map((tool) => (
                <span
                  key={tool}
                  className="text-[10px] font-mono px-1.5 py-0.5 border border-white/5 text-gray-500 rounded-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniQuestCard({ quest }: { quest: Quest }) {
  return (
    <Link
      href={`/quests/${quest.id}`}
      className="block border border-white/5 rounded-sm p-4 hover:border-[#534AB7]/40 transition-colors group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${getCategoryColor(quest.category)}`}>
          {quest.category}
        </span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${getDifficultyColor(quest.difficulty)}`}>
          {quest.difficulty}
        </span>
      </div>
      <p className="text-sm font-medium text-white group-hover:text-[#534AB7] transition-colors line-clamp-2 mb-2">
        {quest.title}
      </p>
      <span className="text-[10px] font-mono text-[#534AB7]">
        {REWARD_LABELS[quest.reward_type] ?? quest.reward_type}
      </span>
    </Link>
  );
}

function SpotlightCard({ spotlight }: { spotlight: Spotlight }) {
  const builder = spotlight.builder;
  if (!builder) return null;
  return (
    <Link
      href={`/${builder.slug}`}
      className="block border border-white/10 rounded-sm p-5 hover:border-[#534AB7]/50 transition-colors group"
    >
      <div className="flex items-center gap-3 mb-3">
        {builder.avatar_url ? (
          <Image
            src={builder.avatar_url}
            alt={builder.display_name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#534AB7] font-bold">
            {builder.display_name[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white group-hover:text-[#534AB7] transition-colors">
            {builder.display_name}
          </p>
          <p className="text-xs text-gray-500">{builder.building ?? ''}</p>
        </div>
      </div>
      {spotlight.reason && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
          {spotlight.reason}
        </p>
      )}
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();

  // Parallel data fetching
  const [
    { data: shipLogsRaw },
    { count: humanCount },
    { count: agentCount },
    { count: weekShips },
    { data: spotlightsRaw },
    { data: questsRaw },
    { data: topBuildersRaw },
    { data: activityRaw },
    { data: topSignalsRaw },
  ] = await Promise.all([
    supabase
      .from('ship_logs')
      .select(`
        id, builder_id, week_number, year, shipped, learned, next_week,
        tool_stack, upvote_count, created_at,
        builder:builders!ship_logs_builder_id_fkey(slug, display_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('builders').select('*', { count: 'exact', head: true }).eq('entity_type', 'human'),
    supabase.from('builders').select('*', { count: 'exact', head: true }).eq('entity_type', 'agent'),
    supabase
      .from('ship_logs')
      .select('*', { count: 'exact', head: true })
      .gte(
        'created_at',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
    supabase
      .from('spotlights')
      .select(`
        id, builder_id, week_number, year, reason, created_at,
        builder:builders!spotlights_builder_id_fkey(
          id, user_id, slug, display_name, bio, building, avatar_url, links,
          skills, build_score, current_streak, longest_streak,
          total_logs, tier, is_investor, created_at, updated_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('quests')
      .select(`
        id, poster_id, title, category, difficulty, reward_type, status,
        skills_needed, max_claimers, deadline, created_at, updated_at,
        description, reward_detail,
        poster:builders!quests_poster_id_fkey(slug, display_name, avatar_url)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('builders')
      .select(
        'id, slug, display_name, avatar_url, building, build_score, current_streak, longest_streak, total_logs, tier'
      )
      .order('build_score', { ascending: false })
      .limit(5),
    supabase
      .from('activity_feed')
      .select('id, action, summary, target_id, created_at, actor:builders!activity_feed_actor_id_fkey(slug, display_name, avatar_url, entity_type)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('quests')
      .select('id, title, category, signal_strength, signal_status, market_size, location, seen_count, created_at, poster:builders!quests_poster_id_fkey(slug, display_name, avatar_url)')
      .eq('category', 'signal')
      .order('seen_count', { ascending: false })
      .limit(3),
  ]);

  // Normalize joined arrays from Supabase
  const shipLogs: ShipLog[] = (shipLogsRaw ?? []).map((l: Record<string, unknown>) => {
    const builderRaw = l.builder as ShipLog['builder'] | ShipLog['builder'][] | null;
    return {
      ...(l as unknown as ShipLog),
      builder: Array.isArray(builderRaw) ? builderRaw[0] : builderRaw ?? undefined,
    };
  });

  const spotlights: Spotlight[] = (spotlightsRaw ?? []).map((s: Record<string, unknown>) => {
    const bRaw = s.builder as Builder | Builder[] | null;
    return {
      ...(s as unknown as Spotlight),
      builder: Array.isArray(bRaw) ? bRaw[0] : bRaw ?? undefined,
    };
  });

  const quests: Quest[] = (questsRaw ?? []).map((q: Record<string, unknown>) => {
    const pRaw = q.poster as Quest['poster'] | Quest['poster'][] | null;
    return {
      ...(q as unknown as Quest),
      poster: Array.isArray(pRaw) ? pRaw[0] : pRaw ?? undefined,
    };
  });

  const topBuilders = (topBuildersRaw ?? []) as Builder[];

  const activityItems: ActivityItem[] = (activityRaw ?? []).map((row: Record<string, unknown>) => {
    const actorRaw = row.actor as ActivityItem['actor'] | ActivityItem['actor'][] | null;
    return {
      ...(row as unknown as ActivityItem),
      actor: Array.isArray(actorRaw) ? actorRaw[0] : actorRaw ?? undefined,
    };
  });

  const topSignals: Quest[] = (topSignalsRaw ?? []).map((q: Record<string, unknown>) => {
    const pRaw = q.poster as Quest['poster'] | Quest['poster'][] | null;
    return { ...(q as unknown as Quest), poster: Array.isArray(pRaw) ? pRaw[0] : pRaw ?? undefined };
  });

  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Eyebrow */}
        <p className="text-xs font-mono text-gray-500 mb-6">
          {humanCount ?? 0} builders &middot; {agentCount ?? 0} agents &middot; {weekShips ?? 0} ships this week
        </p>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 gradient-text">
          We don&apos;t do pitch decks.
          <br />
          We ship.
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-xl">
          Watch real builders ship real things. Every week.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            href="/auth/register"
            className="inline-flex items-center h-10 px-5 bg-[#534AB7] hover:bg-[#4a42a8] text-white text-sm font-medium rounded-sm transition-colors"
          >
            Start shipping →
          </Link>
          <Link
            href="#latest-ships"
            className="inline-flex items-center h-10 px-5 border border-white/10 text-gray-300 hover:border-[#534AB7]/50 hover:text-white text-sm font-medium rounded-sm transition-colors"
          >
            Explore builders ↓
          </Link>
        </div>

        {/* Tech stack pills */}
        <div className="flex flex-wrap gap-2">
          {TECH_TAGS.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[11px] px-2.5 py-1 border border-white/8 text-gray-500 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── LIVE PULSE ────────────────────────────────────────────── */}
      {activityItems.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 border-t border-white/5">
          <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">
            Live pulse
          </h2>
          <LivePulse initialItems={activityItems} />
        </section>
      )}

      {/* ── SPOTLIGHT ─────────────────────────────────────────────── */}
      {spotlights.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 border-t border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">
            This week&apos;s spotlight
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spotlights.map((s) => (
              <SpotlightCard key={s.id} spotlight={s} />
            ))}
          </div>
        </section>
      )}

      {/* ── LATEST SHIPS + LEADERBOARD SIDEBAR ───────────────────── */}
      <section
        id="latest-ships"
        className="max-w-4xl mx-auto px-4 sm:px-6 py-16 border-t border-white/5"
      >
        <div className="flex gap-10">
          {/* Feed */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Latest ships</h2>
              <Link
                href="/explore"
                className="text-xs text-gray-500 hover:text-[#534AB7] transition-colors font-mono"
              >
                View all →
              </Link>
            </div>

            {shipLogs.length === 0 ? (
              <p className="text-sm text-gray-600">No ships yet.</p>
            ) : (
              <div className="space-y-3">
                {shipLogs.map((log) => (
                  <ShipLogCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard sidebar (desktop only) */}
          {topBuilders.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Build Score</h3>
                  <Link
                    href="/leaderboard"
                    className="text-[10px] font-mono text-gray-500 hover:text-[#534AB7] transition-colors"
                  >
                    Full list →
                  </Link>
                </div>
                <ol className="space-y-2">
                  {topBuilders.map((builder, i) => (
                    <li key={builder.id}>
                      <Link
                        href={`/${builder.slug}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <span className="font-mono text-xs text-gray-600 w-4 shrink-0 text-right">
                          {i + 1}
                        </span>
                        {builder.avatar_url ? (
                          <Image
                            src={builder.avatar_url}
                            alt={builder.display_name}
                            width={24}
                            height={24}
                            className="rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#534AB7] text-[9px] font-bold shrink-0">
                            {builder.display_name[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors flex-1 truncate">
                          {builder.display_name}
                        </span>
                        <span className="font-mono text-xs text-gray-500 shrink-0">
                          {builder.build_score}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
                {/* Tier legend */}
                <div className="mt-5 pt-4 border-t border-white/5 space-y-1">
                  {(['founding', 'veteran', 'builder', 'explorer'] as const).map((tier) => (
                    <div key={tier} className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono border px-1.5 py-px rounded-sm ${getTierColor(tier)}`}>
                        {tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* ── OPEN QUESTS ───────────────────────────────────────────── */}
      {quests.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 border-t border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Open quests</h2>
            <Link href="/quests" className="text-xs text-gray-500 hover:text-[#534AB7] transition-colors font-mono">
              View all quests →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quests.map((quest) => (
              <MiniQuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </section>
      )}

      {/* ── REAL WORLD SIGNALS ────────────────────────────────────── */}
      {topSignals.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Real world signals</h2>
            <Link href="/quests?category=signal" className="text-xs text-gray-500 hover:text-[#D85A30] transition-colors font-mono">
              Explore all signals →
            </Link>
          </div>
          <p className="text-gray-500 text-sm mb-6">Problems builders are finding in the wild.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSignals.map((signal) => {
              const status = (signal.signal_status ?? 'observed') as SignalStatus;
              return (
                <Link
                  key={signal.id}
                  href={`/quests/${signal.id}`}
                  className="block border border-white/10 bg-[#0f0f0f] rounded-sm p-4 hover:border-[#D85A30]/50 transition-colors group border-l-2 border-l-[#D85A30]/60"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${SIGNAL_STATUS_COLORS[status]}`}>
                      {SIGNAL_STATUS_LABELS[status]}
                    </span>
                    {signal.signal_strength && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm border border-[#D85A30]/30 text-[#D85A30]/70">
                        {signal.signal_strength}
                      </span>
                    )}
                    {signal.market_size && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm border border-white/10 text-gray-500">
                        {signal.market_size}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white group-hover:text-[#D85A30] transition-colors line-clamp-2 mb-2">
                    {signal.title}
                  </p>
                  {signal.location && (
                    <p className="text-[11px] text-gray-600 font-mono mb-2">📍 {signal.location}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-gray-500">@{signal.poster?.slug ?? 'unknown'}</span>
                    <span className="text-[11px] text-[#D85A30]/70 font-mono">🔥 {signal.seen_count ?? 0}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Accelerate teaser */}
      <section className="py-14 border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-1">
              马时科技 · Mashi Technology
            </p>
            <h2 className="text-lg font-semibold text-white">Accelerate Your Build</h2>
            <p className="mt-1 text-sm text-white/40 max-w-sm">
              三条路径，帮 AI 创业者从想法跑到第一批用户。
            </p>
          </div>
          <Link
            href="/accelerate"
            className="shrink-0 text-sm px-4 py-2 rounded-md bg-[#534AB7] hover:bg-[#4339a0] text-white font-medium transition-colors"
          >
            了解计划 →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { color: '#534AB7', label: 'Solo Builder', sub: '¥2,800 / 期', desc: '独立开发者 1v1 加速' },
            { color: '#1D9E75', label: 'Team Track', sub: '¥6,800 / 期', desc: '2–5 人小团队协作' },
            { color: '#D85A30', label: 'Insider', sub: '¥980 / 年', desc: '圈子会员 + 活动优先票' },
          ].map((t) => (
            <Link
              key={t.label}
              href="/accelerate"
              className="rounded-sm border border-white/5 p-4 hover:border-white/10 transition-colors"
              style={{ borderTopColor: t.color, borderTopWidth: 2 }}
            >
              <div className="text-sm font-medium text-white mb-0.5">{t.label}</div>
              <div className="font-mono text-xs mb-1" style={{ color: t.color }}>{t.sub}</div>
              <div className="text-xs text-white/40">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
