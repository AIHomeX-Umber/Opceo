import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getTierLabel, getTierColor, formatRelativeTime } from '@/lib/utils';
import { builderProfileJsonLd, agentJsonLd } from '@/lib/jsonld';
import { generateMetadata as genMeta } from '@/lib/seo';
import type { Builder } from '@/lib/types';
import SignalBetButton from '@/components/SignalBetButton';
import ConnectButton from '@/components/ConnectButton';
import StreakCalendar from '@/components/StreakCalendar';
import WelcomeBanner from '@/components/WelcomeBanner';
import { Suspense } from 'react';
import { SIGNAL_STATUS_LABELS, SIGNAL_STATUS_COLORS, type SignalStatus } from '@/lib/signal-lifecycle';
import {
  Globe, Mail, X as XIcon, Rss, ExternalLink,
  Rocket, Code, Code2, BookOpen, Briefcase, Heart, Music, Camera,
  PenTool, ShoppingBag, Mic, Newspaper, Video, Hash,
  Link as LinkIcon, type LucideIcon,
} from 'lucide-react';
import type { FeaturedLink, ShowcaseItem } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const ICON_MAP: Record<string, LucideIcon> = {
  globe: Globe, mail: Mail, github: Code2, twitter: XIcon,
  youtube: Rss, linkedin: ExternalLink, instagram: Camera,
  rocket: Rocket, code: Code, 'book-open': BookOpen, briefcase: Briefcase,
  heart: Heart, music: Music, camera: Hash, 'pen-tool': PenTool,
  'shopping-bag': ShoppingBag, mic: Mic, newspaper: Newspaper,
  video: Video, link: LinkIcon,
};
function FeaturedLinkIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? LinkIcon;
  return <Icon size={16} className="shrink-0 text-white/50" />;
}

function agentStatus(updatedAt: string): 'active' | 'idle' | 'offline' {
  const diffMin = (Date.now() - new Date(updatedAt).getTime()) / 60000;
  if (diffMin < 5) return 'active';
  if (diffMin < 60) return 'idle';
  return 'offline';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: builder } = await supabase
    .from('builders')
    .select('display_name, bio, slug, entity_type, building, current_streak, build_score, operator_id, headline')
    .eq('slug', slug)
    .single();

  if (!builder) {
    return { title: 'Builder not found | OPCEO' };
  }

  if (builder.entity_type === 'agent') {
    let operatorSlug = '';
    if (builder.operator_id) {
      const { data: op } = await supabase
        .from('builders')
        .select('slug')
        .eq('id', builder.operator_id)
        .single();
      operatorSlug = op?.slug ?? '';
    }
    return genMeta({
      title: `${builder.display_name} — AI Agent Profile`,
      description: `${builder.display_name} is an AI agent on OPCEO operated by @${operatorSlug}, building ${builder.building ?? 'in public'}. ${builder.current_streak}-week ship streak. Build Score: ${builder.build_score}.`,
      path: `/${builder.slug}`,
      type: 'website',
    });
  }

  return genMeta({
    title: `${builder.display_name} — Builder Profile`,
    description:
      builder.headline ||
      builder.bio ||
      `${builder.display_name} is building in public on OPCEO — tracking weekly ship logs, build streaks, and signal bets.`,
    path: `/${builder.slug}`,
    type: 'website',
  });
}

export default async function BuilderProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch builder
  const { data: builder } = await supabase
    .from('builders')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!builder) notFound();

  // Fetch operator when agent
  let operator: Pick<Builder, 'slug' | 'display_name'> | null = null;
  if (builder.entity_type === 'agent' && builder.operator_id) {
    const { data } = await supabase
      .from('builders')
      .select('slug, display_name')
      .eq('id', builder.operator_id)
      .single();
    operator = data;
  }

  // Signal activity
  const [
    { count: signalsSpotted },
    { count: signalsValidated },
    { count: signalsBuilding },
    { data: recentSignalsRaw },
  ] = await Promise.all([
    supabase.from('quests').select('*', { count: 'exact', head: true }).eq('poster_id', builder.id).eq('category', 'signal'),
    supabase.from('quests').select('*', { count: 'exact', head: true }).eq('poster_id', builder.id).eq('category', 'signal').eq('signal_status', 'validated'),
    supabase.from('quests').select('*', { count: 'exact', head: true }).eq('poster_id', builder.id).eq('category', 'signal').eq('signal_status', 'building'),
    supabase.from('quests').select('id, title, signal_status, seen_count, created_at').eq('poster_id', builder.id).eq('category', 'signal').order('created_at', { ascending: false }).limit(5),
  ]);

  const hasSignalActivity = (signalsSpotted ?? 0) > 0;

  // Fetch ship logs (latest 20 for timeline + all for streak calendar)
  const { data: shipLogs } = await supabase
    .from('ship_logs')
    .select('id, week_number, year, shipped, upvote_count, created_at')
    .eq('builder_id', builder.id)
    .order('created_at', { ascending: false });

  // Signal bet count
  const { count: betCount } = await supabase
    .from('signal_bets')
    .select('*', { count: 'exact', head: true })
    .eq('target_id', builder.id);

  // Posted quests
  const { data: quests } = await supabase
    .from('quests')
    .select('id, title, category, difficulty, status, reward_type, created_at')
    .eq('poster_id', builder.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Check if current user has already bet
  const { data: { user } } = await supabase.auth.getUser();
  let initialBetted = false;
  if (user) {
    const { data: myBuilder } = await supabase
      .from('builders')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (myBuilder) {
      const { data: existingBet } = await supabase
        .from('signal_bets')
        .select('id')
        .eq('bettor_id', myBuilder.id)
        .eq('target_id', builder.id)
        .maybeSingle();
      initialBetted = !!existingBet;
    }
  }

  const jsonLd =
    builder.entity_type === 'agent'
      ? agentJsonLd(builder, operator)
      : builderProfileJsonLd(builder);

  const logs = shipLogs || [];
  const calendarLogs = logs.map((l) => ({ week_number: l.week_number, year: l.year }));

  const isAgent = builder.entity_type === 'agent';
  const status = isAgent ? agentStatus(builder.updated_at) : null;
  const statusColor =
    status === 'active'
      ? 'bg-green-400'
      : status === 'idle'
      ? 'bg-yellow-400'
      : 'bg-red-400';

  const geoDesc = isAgent
    ? `${builder.display_name} is an AI agent on OPCEO operated by @${operator?.slug ?? 'unknown'}, currently building ${builder.building ?? 'in public'}. It runs on ${builder.agent_meta?.model ?? 'unknown model'} and has maintained a ${builder.current_streak}-week consecutive ship streak with a Build Score of ${builder.build_score}.`
    : `${builder.display_name} is a builder on OPCEO. ${builder.headline || builder.bio || `Building ${builder.building ?? 'in public'}`}. ${builder.current_streak}-week ship streak. Build Score: ${builder.build_score}.`;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* GEO lead */}
      <p className="sr-only">{geoDesc}</p>

      {/* Cover image — full width, outside main container */}
      {builder.cover_url && (
        <div className="relative w-full h-[200px] sm:h-[180px] overflow-hidden">
          <Image src={builder.cover_url} alt="" fill className="object-cover" unoptimized priority />
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 pb-16">
        {/* Welcome banner — shown only on first arrival via ?welcome=1 */}
        <Suspense>
          <WelcomeBanner slug={builder.slug} displayName={builder.display_name} />
        </Suspense>

        {/* Profile header */}
        <header className={`flex flex-col sm:flex-row gap-6 mb-8 ${builder.cover_url ? 'mt-[-36px]' : 'pt-12'}`}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            {builder.avatar_url ? (
              <Image
                src={builder.avatar_url}
                alt={`${builder.display_name}'s avatar`}
                width={96}
                height={96}
                className={`rounded-full object-cover w-24 h-24 ${builder.cover_url ? 'ring-2 ring-black' : ''}`}
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-full bg-[#534AB7]/20 border border-[#534AB7]/30 flex items-center justify-center ${builder.cover_url ? 'ring-2 ring-black' : ''}`}
                aria-label={`${builder.display_name}'s avatar placeholder`}
              >
                <span className="text-3xl font-semibold text-[#534AB7]">
                  {builder.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-white leading-tight">{builder.display_name}</h1>

            {/* Agent badge + operator */}
            {isAgent && (
              <>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#534AB7]/20 text-[#534AB7] border border-[#534AB7]/30 rounded-sm uppercase tracking-wide self-start">
                  AI AGENT
                </span>
                {operator && (
                  <p className="text-sm text-gray-400">
                    Operated by{' '}
                    <Link href={`/${operator.slug}`} className="text-[#534AB7] hover:text-[#6a62cc] transition-colors">
                      @{operator.slug}
                    </Link>
                  </p>
                )}
                {/* Agent info block */}
                <div className="border border-white/8 rounded-lg p-3 bg-white/2 flex flex-col gap-1.5 text-xs font-mono mt-1">
                  {builder.agent_meta?.model && (
                    <div className="flex gap-2">
                      <span className="text-white/30 w-20 shrink-0">Model</span>
                      <span className="text-white/70">{builder.agent_meta.model}</span>
                    </div>
                  )}
                  {builder.agent_meta?.framework && (
                    <div className="flex gap-2">
                      <span className="text-white/30 w-20 shrink-0">Framework</span>
                      <span className="text-white/70">{builder.agent_meta.framework}</span>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <span className="text-white/30 w-20 shrink-0">Status</span>
                    <span className="flex items-center gap-1.5 text-white/70">
                      <span className={`w-2 h-2 rounded-full inline-block ${statusColor}`} aria-hidden="true" />
                      {status}
                    </span>
                  </div>
                  {builder.agent_meta?.capabilities && builder.agent_meta.capabilities.length > 0 && (
                    <div className="flex gap-2 items-start">
                      <span className="text-white/30 w-20 shrink-0">Capabilities</span>
                      <div className="flex flex-wrap gap-1">
                        {builder.agent_meta.capabilities.map((cap: string) => (
                          <span
                            key={cap}
                            className="px-1.5 py-0 bg-white/5 border border-white/8 text-white/50 rounded-sm"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Headline (only show for humans or always) */}
            {builder.headline && (
              <p className="text-white/70 text-base leading-relaxed">{builder.headline}</p>
            )}

            {/* Bio */}
            {builder.bio && (
              <p className="text-white/50 text-sm leading-relaxed">{builder.bio}</p>
            )}

            {/* Currently building */}
            {builder.building && (
              <p className="text-white/50 text-sm">
                <span className="text-white/30">Currently building:</span>{' '}
                <span className="text-white/80">{builder.building}</span>
              </p>
            )}

            {/* Links — only for humans */}
            {!isAgent && (builder.links?.x || builder.links?.github || builder.links?.website) && (
              <nav aria-label="Social links" className="flex items-center gap-3 mt-1">
                {builder.links?.x && (
                  <a
                    href={`https://x.com/${builder.links.x.replace('@', '')}`}
                    rel="nofollow noopener"
                    target="_blank"
                    aria-label="X (Twitter) profile"
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                    </svg>
                  </a>
                )}
                {builder.links?.github && (
                  <a
                    href={`https://github.com/${builder.links.github.replace('@', '')}`}
                    rel="nofollow noopener"
                    target="_blank"
                    aria-label="GitHub profile"
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                )}
                {builder.links?.website && (
                  <a
                    href={builder.links.website.startsWith('http') ? builder.links.website : `https://${builder.links.website}`}
                    rel="nofollow noopener"
                    target="_blank"
                    aria-label="Personal website"
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  </a>
                )}
              </nav>
            )}
          </div>
        </header>

        {/* Build Score + Tier */}
        <section
          aria-labelledby="score-heading"
          className="border border-white/8 rounded-xl p-5 mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div>
              <span className="text-white/30 text-xs uppercase tracking-widest block mb-0.5">Build Score</span>
              <span className="text-4xl font-bold text-white tabular-nums" id="score-heading">
                {builder.build_score}
              </span>
            </div>
            <div className="h-10 w-px bg-white/8" aria-hidden="true" />
            <div>
              <span className="text-white/30 text-xs uppercase tracking-widest block mb-0.5">Streak</span>
              <span className="text-2xl font-semibold text-white tabular-nums">
                {builder.current_streak}
                <span className="text-base ml-1 text-orange-400" aria-label="fire streak">🔥</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(builder.tier)}`}
              aria-label={`Tier: ${getTierLabel(builder.tier)}`}
            >
              {getTierLabel(builder.tier)}
            </span>
            {!isAgent && builder.builder_type && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/15 text-white/50 capitalize">
                {builder.builder_type}
              </span>
            )}
            {builder.is_investor && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-amber-400/40 text-amber-400">
                Investor
              </span>
            )}
          </div>
        </section>

        {/* Signal Bet + Connect */}
        <section aria-label="Signal bet and connect actions" className="flex flex-wrap gap-3 mb-8">
          <SignalBetButton
            targetId={builder.id}
            targetSlug={builder.slug}
            initialCount={betCount ?? 0}
            initialBetted={initialBetted}
          />
          <ConnectButton targetId={builder.id} targetName={builder.display_name} />
        </section>

        {/* Featured Links (new — only if has items) */}
        {(builder.featured_links ?? []).length > 0 && (
          <section aria-label="Featured links" className="mb-8">
            <div className="flex flex-wrap gap-2.5">
              {(builder.featured_links ?? []).map((link: FeaturedLink, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-white/10 rounded-lg hover:border-white/25 hover:bg-white/[0.04] transition-colors"
                >
                  <FeaturedLinkIcon name={link.icon} />
                  <span className="text-sm text-white/70">{link.title}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Showcase (new — only if has items) */}
        {(builder.showcase ?? []).length > 0 && (
          <section aria-labelledby="showcase-heading" className="mb-8">
            <h2 id="showcase-heading" className="text-xs text-white/30 uppercase tracking-widest mb-4">
              Showcase
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(builder.showcase ?? []).map((item: ShowcaseItem, i: number) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/8 rounded-xl overflow-hidden hover:border-white/20 transition-colors group block"
                >
                  {item.image_url && (
                    <div className="relative h-32 overflow-hidden bg-white/5">
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm font-medium text-white group-hover:text-[#a49ef5] transition-colors mb-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Streak Calendar */}
        <section aria-labelledby="streak-cal-heading" className="mb-8">
          <h2 id="streak-cal-heading" className="text-xs text-white/30 uppercase tracking-widest mb-3">
            52-Week Ship History
          </h2>
          <StreakCalendar logs={calendarLogs} />
        </section>

        {/* Ship Log Timeline */}
        {logs.length > 0 && (
          <section aria-labelledby="shiplogs-heading" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 id="shiplogs-heading" className="text-sm font-medium text-white/70">
                Ship Log
              </h2>
              {logs.length >= 10 && (
                <Link
                  href={`/${builder.slug}/logs`}
                  className="text-xs text-[#534AB7] hover:text-[#6a62cc] transition-colors"
                >
                  View all →
                </Link>
              )}
            </div>
            <ol className="flex flex-col gap-3">
              {logs.slice(0, 10).map((log) => (
                <li key={log.id}>
                  <article className="border border-white/8 rounded-xl p-4 hover:border-white/15 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-white/30 font-mono mb-1 block">
                          Week {log.week_number} · {formatRelativeTime(log.created_at)}
                        </span>
                        <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
                          {log.shipped}
                        </p>
                      </div>
                      {log.upvote_count > 0 && (
                        <span className="text-white/30 text-xs tabular-nums flex-shrink-0 mt-0.5">
                          ↑ {log.upvote_count}
                        </span>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Signal Activity */}
        {hasSignalActivity && (
          <section aria-labelledby="signal-activity-heading" className="mb-8">
            <h2 id="signal-activity-heading" className="text-sm font-medium text-white/70 mb-4">
              Signal activity
            </h2>
            <div className="flex gap-6 mb-4 border border-white/8 rounded-xl p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{signalsSpotted ?? 0}</p>
                <p className="text-xs text-white/30 mt-0.5">Spotted</p>
              </div>
              <div className="h-10 w-px bg-white/8 self-center" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{signalsValidated ?? 0}</p>
                <p className="text-xs text-white/30 mt-0.5">Validated</p>
              </div>
              <div className="h-10 w-px bg-white/8 self-center" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{signalsBuilding ?? 0}</p>
                <p className="text-xs text-white/30 mt-0.5">Building</p>
              </div>
            </div>
            {(recentSignalsRaw ?? []).length > 0 && (
              <ul className="flex flex-col gap-2">
                {(recentSignalsRaw ?? []).map((signal) => {
                  const status = (signal.signal_status ?? 'observed') as SignalStatus;
                  return (
                    <li key={signal.id}>
                      <a
                        href={`/quests/${signal.id}`}
                        className="flex items-center justify-between gap-3 border border-white/8 rounded-xl px-4 py-3 hover:border-white/15 transition-colors group"
                      >
                        <span className="text-white/80 text-sm group-hover:text-white transition-colors truncate">{signal.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${SIGNAL_STATUS_COLORS[status]}`}>
                            {SIGNAL_STATUS_LABELS[status]}
                          </span>
                          <span className="text-xs text-[#D85A30]/70 font-mono">🔥 {signal.seen_count ?? 0}</span>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* Posted Quests */}
        {quests && quests.length > 0 && (
          <section aria-labelledby="quests-heading">
            <h2 id="quests-heading" className="text-sm font-medium text-white/70 mb-4">
              Posted Quests
            </h2>
            <ul className="flex flex-col gap-2">
              {quests.map((quest) => (
                <li key={quest.id}>
                  <Link
                    href={`/quests/${quest.id}`}
                    className="flex items-center justify-between gap-3 border border-white/8 rounded-xl px-4 py-3 hover:border-white/15 transition-colors group"
                  >
                    <span className="text-white/80 text-sm group-hover:text-white transition-colors truncate">
                      {quest.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                        quest.status === 'open'
                          ? 'border-green-400/30 text-green-400'
                          : 'border-white/10 text-white/30'
                      }`}
                    >
                      {quest.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
