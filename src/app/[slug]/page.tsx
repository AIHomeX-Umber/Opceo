import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getTierLabel, getTierColor, formatRelativeTime } from '@/lib/utils';
import { builderProfileJsonLd } from '@/lib/jsonld';
import { generateMetadata as genMeta } from '@/lib/seo';
import SignalBetButton from '@/components/SignalBetButton';
import ConnectButton from '@/components/ConnectButton';
import StreakCalendar from '@/components/StreakCalendar';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: builder } = await supabase
    .from('builders')
    .select('display_name, bio, slug')
    .eq('slug', slug)
    .single();

  if (!builder) {
    return { title: 'Builder not found | opceo.ai' };
  }

  return genMeta({
    title: `${builder.display_name} — Builder Profile`,
    description:
      builder.bio ||
      `${builder.display_name} is building in public on opceo.ai — tracking weekly ship logs, build streaks, and signal bets.`,
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

  const jsonLd = builderProfileJsonLd(builder);
  const logs = shipLogs || [];
  const calendarLogs = logs.map((l) => ({ week_number: l.week_number, year: l.year }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* GEO definition lead — SSR rendered */}
        <p className="sr-only">
          {builder.display_name} is a builder on opceo.ai, a public build-in-public platform where
          makers ship weekly progress logs, track streaks, and receive signal bets from the community.
        </p>

        {/* Profile header */}
        <header className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            {builder.avatar_url ? (
              <Image
                src={builder.avatar_url}
                alt={`${builder.display_name}'s avatar`}
                width={96}
                height={96}
                className="rounded-full object-cover w-24 h-24"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full bg-[#534AB7]/20 border border-[#534AB7]/30 flex items-center justify-center"
                aria-label={`${builder.display_name}'s avatar placeholder`}
              >
                <span className="text-3xl font-semibold text-[#534AB7]">
                  {builder.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-white leading-tight">
              {builder.display_name}
            </h1>

            {builder.bio && (
              <p className="text-white/60 text-sm leading-relaxed">{builder.bio}</p>
            )}

            {builder.building && (
              <p className="text-white/50 text-sm">
                <span className="text-white/30">Currently building:</span>{' '}
                <span className="text-white/80">{builder.building}</span>
              </p>
            )}

            {/* Links */}
            {(builder.links?.x || builder.links?.github || builder.links?.website) && (
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
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(builder.tier)}`}
              aria-label={`Tier: ${getTierLabel(builder.tier)}`}
            >
              {getTierLabel(builder.tier)}
            </span>
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
            initialCount={betCount ?? 0}
            initialBetted={initialBetted}
          />
          <ConnectButton targetId={builder.id} targetName={builder.display_name} />
        </section>

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
