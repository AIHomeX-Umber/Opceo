// app/quests/[id]/page.tsx — Quest / Signal Detail (Server Component)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import JsonLd from '@/components/JsonLd';
import { questJsonLd, signalJsonLd } from '@/lib/jsonld';
import ClaimQuestButton from '@/components/ClaimQuestButton';
import QuestPosterActions from '@/components/QuestPosterActions';
import SubmitWorkForm from '@/components/SubmitWorkForm';
import SignalStatusBar from '@/components/SignalStatusBar';
import SignalSeenThisButton from '@/components/SignalSeenThisButton';
import SignalBuildingButton from '@/components/SignalBuildingButton';
import SignalSolvedButton from '@/components/SignalSolvedButton';
import { getDifficultyColor, getCategoryColor, formatRelativeTime } from '@/lib/utils';
import { SIGNAL_STATUS_LABELS, SIGNAL_STATUS_COLORS, type SignalStatus } from '@/lib/signal-lifecycle';
import type { Quest, QuestClaim, SignalConfirmation, SignalBuilder } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('quests')
    .select('title, description, category, signal_strength, seen_count, market_size, poster:builders!quests_poster_id_fkey(slug, display_name)')
    .eq('id', id)
    .single();

  if (!data) return { title: 'Quest not found | OpCEO.AI' };

  const posterRaw = data.poster as { slug: string; display_name: string } | { slug: string; display_name: string }[] | null;
  const poster = Array.isArray(posterRaw) ? posterRaw[0] : posterRaw;

  if (data.category === 'signal') {
    const desc = `Signal spotted by @${poster?.slug ?? 'unknown'} on OpCEO.AI. ${data.signal_strength ?? 'observed'} signal. ${data.seen_count ?? 0} builders have confirmed this.${data.market_size ? ` Market size: ${data.market_size}.` : ''}`;
    return {
      title: `${data.title} — Real World Signal | OpCEO.AI`,
      description: desc,
      alternates: { canonical: `https://opceo.ai/quests/${id}` },
      openGraph: { title: `${data.title} — Real World Signal`, description: desc, url: `https://opceo.ai/quests/${id}` },
    };
  }

  return {
    title: `${data.title} — Quest | OpCEO.AI`,
    description: data.description.slice(0, 160),
    alternates: { canonical: `https://opceo.ai/quests/${id}` },
    openGraph: { title: `${data.title} — Quest`, description: data.description.slice(0, 160), url: `https://opceo.ai/quests/${id}` },
  };
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', claimed: 'Claimed', in_progress: 'In Progress',
  review: 'Review', completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'text-green-400 bg-green-400/10 border-green-400/20',
  claimed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  in_progress: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  review: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  completed: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};
const REWARD_LABELS: Record<string, string> = {
  credit: 'Credit', collab: 'Collab', paid: 'Paid', equity: 'Equity', learning: 'Learning',
};

function AvatarSmall({ builder }: { builder: { slug: string; display_name: string; avatar_url?: string | null } }) {
  return (
    <Link href={`/${builder.slug}`} className="flex items-center gap-2 hover:text-white transition-colors">
      {builder.avatar_url ? (
        <Image src={builder.avatar_url} alt={builder.display_name} width={20} height={20} className="rounded-full object-cover" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-[#534AB7]/30 flex items-center justify-center text-[9px] text-[#534AB7] font-bold">
          {builder.display_name[0].toUpperCase()}
        </div>
      )}
      <span>{builder.display_name}</span>
    </Link>
  );
}

export default async function QuestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawQuest } = await supabase
    .from('quests')
    .select(`
      id, poster_id, title, description, category, skills_needed,
      reward_type, reward_detail, difficulty, status,
      max_claimers, deadline, created_at, updated_at,
      signal_strength, signal_status, market_size, location, seen_count,
      poster:builders!quests_poster_id_fkey(slug, display_name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (!rawQuest) notFound();

  const posterRaw = rawQuest.poster as unknown as Quest['poster'] | Quest['poster'][] | null;
  const quest: Quest = {
    ...(rawQuest as unknown as Quest),
    poster: Array.isArray(posterRaw) ? posterRaw[0] : posterRaw ?? undefined,
  };

  const isSignal = quest.category === 'signal';

  // Viewer's builder id
  let viewerBuilderId: string | null = null;
  if (user) {
    const { data: vb } = await supabase.from('builders').select('id').eq('user_id', user.id).single();
    viewerBuilderId = vb?.id ?? null;
  }

  // ── Signal-specific data ──────────────────────────────────────────────────
  let confirmations: SignalConfirmation[] = [];
  let signalBuilders: SignalBuilder[] = [];
  let viewerHasConfirmed = false;
  let viewerIsBuilding = false;

  if (isSignal) {
    const [{ data: rawConf }, { data: rawBuilders }] = await Promise.all([
      supabase
        .from('signal_confirmations')
        .select('id, quest_id, builder_id, note, created_at, builder:builders!signal_confirmations_builder_id_fkey(slug, display_name, avatar_url)')
        .eq('quest_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('signal_builders')
        .select('id, quest_id, builder_id, project_name, project_url, created_at, builder:builders!signal_builders_builder_id_fkey(slug, display_name, avatar_url)')
        .eq('quest_id', id)
        .order('created_at', { ascending: true }),
    ]);

    confirmations = (rawConf ?? []).map((c: Record<string, unknown>) => {
      const b = c.builder as SignalConfirmation['builder'] | SignalConfirmation['builder'][] | null;
      return { ...(c as unknown as SignalConfirmation), builder: Array.isArray(b) ? b[0] : b ?? undefined };
    });
    signalBuilders = (rawBuilders ?? []).map((b: Record<string, unknown>) => {
      const bl = b.builder as SignalBuilder['builder'] | SignalBuilder['builder'][] | null;
      return { ...(b as unknown as SignalBuilder), builder: Array.isArray(bl) ? bl[0] : bl ?? undefined };
    });

    if (viewerBuilderId) {
      viewerHasConfirmed = confirmations.some((c) => c.builder_id === viewerBuilderId);
      viewerIsBuilding = signalBuilders.some((sb) => sb.builder_id === viewerBuilderId);
    }
  }

  // ── Standard Quest data ───────────────────────────────────────────────────
  let claims: QuestClaim[] = [];
  if (!isSignal) {
    const { data: rawClaims } = await supabase
      .from('quest_claims')
      .select(`id, quest_id, claimer_id, pitch, status, submitted_work, score_reward, created_at, completed_at, claimer:builders!quest_claims_claimer_id_fkey(slug, display_name, avatar_url)`)
      .eq('quest_id', id)
      .order('created_at', { ascending: true });

    claims = (rawClaims ?? []).map((c: Record<string, unknown>) => {
      const claimerRaw = c.claimer as QuestClaim['claimer'] | QuestClaim['claimer'][] | null;
      return { ...(c as unknown as QuestClaim), claimer: Array.isArray(claimerRaw) ? claimerRaw[0] : claimerRaw ?? undefined };
    });
  }

  const isPoster = viewerBuilderId === quest.poster_id;
  const myAcceptedClaim = claims.find((c) => c.claimer_id === viewerBuilderId && c.status === 'accepted');
  const hasAlreadyClaimed = claims.some((c) => c.claimer_id === viewerBuilderId);
  const canClaim = !isPoster && quest.status === 'open' && !hasAlreadyClaimed && !!viewerBuilderId;

  const signalStatus = (quest.signal_status ?? 'observed') as SignalStatus;

  // ── Signal detail render ──────────────────────────────────────────────────
  if (isSignal) {
    const geoLead = `This real world signal was first spotted by @${quest.poster?.slug ?? 'unknown'} on OpCEO.AI on ${new Date(quest.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. ${quest.seen_count ?? 0} builders have independently confirmed this observation. Signal strength: ${quest.signal_strength ?? 'observed'}${quest.market_size ? `. Market size: ${quest.market_size}` : ''}.`;

    return (
      <>
        <JsonLd data={signalJsonLd(quest)} />
        <p className="sr-only">{geoLead}</p>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <article>
            <Link href="/quests?category=signal" className="inline-block text-xs text-gray-500 hover:text-gray-300 mb-8 transition-colors font-mono">
              ← Real World Signals
            </Link>

            {/* Status flow bar */}
            <div className="mb-6">
              <SignalStatusBar status={signalStatus} />
            </div>

            {/* Attribution + badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {quest.poster && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {quest.poster.avatar_url ? (
                    <Image src={quest.poster.avatar_url} alt={quest.poster.display_name} width={20} height={20} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#D85A30]/20 flex items-center justify-center text-[9px] text-[#D85A30] font-bold">
                      {quest.poster.display_name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-white/30">First spotted by</span>
                  <Link href={`/${quest.poster.slug}`} className="text-[#D85A30] hover:text-[#e06a40] transition-colors">
                    @{quest.poster.slug}
                  </Link>
                  <span className="text-white/20">·</span>
                  <span className="text-xs font-mono">{formatRelativeTime(quest.created_at)}</span>
                </div>
              )}
            </div>

            {/* Signal badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm border border-[#D85A30]/40 text-[#D85A30] bg-[#D85A30]/10">
                signal
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-sm border ${SIGNAL_STATUS_COLORS[signalStatus]}`}>
                {SIGNAL_STATUS_LABELS[signalStatus]}
              </span>
              {quest.signal_strength && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-white/10 text-gray-400">
                  {quest.signal_strength}
                </span>
              )}
              {quest.market_size && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-white/10 text-gray-400">
                  {quest.market_size}
                </span>
              )}
              {quest.location && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-white/10 text-gray-400">
                  📍 {quest.location}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-6">
              {quest.title}
            </h1>

            {/* Signal report */}
            <section className="mb-8">
              <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">Signal report</h2>
              <p className="text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap">{quest.description}</p>
            </section>

            {/* Related domains */}
            {quest.skills_needed.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">Related domains</h2>
                <div className="flex flex-wrap gap-2">
                  {quest.skills_needed.map((s) => (
                    <span key={s} className="text-xs font-mono px-2 py-0.5 border border-white/10 text-gray-300 rounded-sm">{s}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Interaction buttons */}
            <div className="flex flex-wrap gap-3 mb-8 pt-4 border-t border-white/5">
              <SignalSeenThisButton
                questId={quest.id}
                viewerBuilderId={viewerBuilderId}
                initialSeenCount={quest.seen_count ?? 0}
                initialHasConfirmed={viewerHasConfirmed}
                currentSignalStatus={signalStatus}
                currentBuildersCount={signalBuilders.length}
              />
              <SignalBuildingButton
                questId={quest.id}
                viewerBuilderId={viewerBuilderId}
                initialIsBuilding={viewerIsBuilding}
                currentSignalStatus={signalStatus}
                currentSeenCount={quest.seen_count ?? 0}
              />
            </div>

            {/* Confirmations list */}
            <section className="mb-8">
              <h2 className="text-sm font-medium text-white/70 mb-4">
                Builders who&apos;ve seen this
                <span className="text-white/30 text-xs font-normal ml-2">{confirmations.length}</span>
              </h2>
              {confirmations.length === 0 ? (
                <p className="text-sm text-gray-600">No confirmations yet. Be the first to validate this signal.</p>
              ) : (
                <ul className="space-y-3">
                  {confirmations.map((conf) => (
                    <li key={conf.id} className="flex items-start gap-3 border border-white/5 rounded-sm p-3">
                      {conf.builder && (
                        <Link href={`/${conf.builder.slug}`} className="flex-shrink-0">
                          {conf.builder.avatar_url ? (
                            <Image src={conf.builder.avatar_url} alt={conf.builder.display_name} width={28} height={28} className="rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#534AB7] text-xs font-bold">
                              {conf.builder.display_name[0].toUpperCase()}
                            </div>
                          )}
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {conf.builder && (
                            <Link href={`/${conf.builder.slug}`} className="text-sm text-white/80 hover:text-white transition-colors">
                              {conf.builder.display_name}
                            </Link>
                          )}
                          <span className="text-xs font-mono text-gray-600">{formatRelativeTime(conf.created_at)}</span>
                        </div>
                        {conf.note && <p className="text-sm text-gray-400 leading-relaxed">{conf.note}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Builders working on this */}
            <section className="mb-8">
              <h2 className="text-sm font-medium text-white/70 mb-4">
                Builders working on this
                <span className="text-white/30 text-xs font-normal ml-2">{signalBuilders.length}</span>
              </h2>
              {signalBuilders.length === 0 ? (
                <p className="text-sm text-gray-600">No one is building for this yet. Be the first.</p>
              ) : (
                <ul className="space-y-3">
                  {signalBuilders.map((sb) => (
                    <li key={sb.id} className="flex items-start gap-3 border border-white/5 rounded-sm p-3">
                      {sb.builder && (
                        <Link href={`/${sb.builder.slug}`} className="flex-shrink-0">
                          {sb.builder.avatar_url ? (
                            <Image src={sb.builder.avatar_url} alt={sb.builder.display_name} width={28} height={28} className="rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#534AB7] text-xs font-bold">
                              {sb.builder.display_name[0].toUpperCase()}
                            </div>
                          )}
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {sb.builder && (
                            <Link href={`/${sb.builder.slug}`} className="text-sm text-white/80 hover:text-white transition-colors">
                              {sb.builder.display_name}
                            </Link>
                          )}
                          <span className="text-sm font-medium text-violet-400">{sb.project_name}</span>
                          <span className="text-xs font-mono text-gray-600">{formatRelativeTime(sb.created_at)}</span>
                        </div>
                        {sb.project_url && (
                          <a href={sb.project_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#534AB7] hover:text-[#6a62cc] transition-colors">
                            {sb.project_url} →
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Mark as solved */}
            <div className="pt-4 border-t border-white/5">
              <SignalSolvedButton
                questId={quest.id}
                viewerBuilderId={viewerBuilderId}
                questPosterId={quest.poster_id}
                viewerIsBuilder={viewerIsBuilding}
              />
            </div>

            <p className="text-xs text-gray-600 font-mono mt-8">
              Last updated: {formatRelativeTime(quest.updated_at)}
            </p>
          </article>
        </div>
      </>
    );
  }

  // ── Standard Quest render ─────────────────────────────────────────────────
  return (
    <>
      <JsonLd data={questJsonLd(quest)} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <article>
          <Link href="/quests" className="inline-block text-xs text-gray-500 hover:text-gray-300 mb-8 transition-colors font-mono">
            ← Quest Board
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-mono px-2 py-0.5 rounded-sm ${getCategoryColor(quest.category)}`}>{quest.category}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-sm border ${STATUS_COLORS[quest.status] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
              {STATUS_LABELS[quest.status] ?? quest.status}
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-sm ${getDifficultyColor(quest.difficulty)}`}>{quest.difficulty}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm text-[#534AB7] bg-[#534AB7]/10">
              {REWARD_LABELS[quest.reward_type] ?? quest.reward_type}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-6">{quest.title}</h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 mb-10 pb-8 border-b border-white/5">
            {quest.poster && (
              <AvatarSmall builder={quest.poster} />
            )}
            <span className="font-mono text-xs">{claims.length}/{quest.max_claimers} claimed</span>
            {quest.deadline && <span className="font-mono text-xs">deadline: {formatRelativeTime(quest.deadline)}</span>}
            <span className="font-mono text-xs">posted {formatRelativeTime(quest.created_at)}</span>
          </div>

          <section className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">Description</h2>
            <p className="text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap">{quest.description}</p>
          </section>

          {quest.skills_needed.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">Skills needed</h2>
              <div className="flex flex-wrap gap-2">
                {quest.skills_needed.map((s) => (
                  <span key={s} className="text-xs font-mono px-2 py-0.5 border border-white/10 text-gray-300 rounded-sm">{s}</span>
                ))}
              </div>
            </section>
          )}

          {quest.reward_detail && (
            <section className="mb-10">
              <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">Reward</h2>
              <p className="text-[15px] text-gray-200 leading-relaxed">{quest.reward_detail}</p>
            </section>
          )}

          {canClaim && (
            <div className="mb-10">
              <ClaimQuestButton questId={quest.id} maxClaimers={quest.max_claimers} />
            </div>
          )}

          {!isPoster && hasAlreadyClaimed && !myAcceptedClaim && (
            <div className="mb-10 text-sm text-gray-400 border border-white/5 rounded-sm px-4 py-3">
              Your claim is under review.
            </div>
          )}

          {!isPoster && myAcceptedClaim && !myAcceptedClaim.submitted_work && (
            <div className="mb-10">
              <SubmitWorkForm claimId={myAcceptedClaim.id} />
            </div>
          )}

          {isPoster && (
            <div className="mb-10 border border-white/10 rounded-sm p-5">
              <QuestPosterActions questId={quest.id} claims={claims} questStatus={quest.status} />
            </div>
          )}

          <p className="text-xs text-gray-600 font-mono mt-10">Last updated: {formatRelativeTime(quest.updated_at)}</p>
        </article>
      </div>
    </>
  );
}
