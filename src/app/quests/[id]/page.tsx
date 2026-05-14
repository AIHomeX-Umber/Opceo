// app/quests/[id]/page.tsx — Quest Detail (Server Component)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import JsonLd from '@/components/JsonLd';
import { questJsonLd } from '@/lib/jsonld';
import ClaimQuestButton from '@/components/ClaimQuestButton';
import QuestPosterActions from '@/components/QuestPosterActions';
import SubmitWorkForm from '@/components/SubmitWorkForm';
import { getDifficultyColor, getCategoryColor, formatRelativeTime } from '@/lib/utils';
import type { Quest, QuestClaim } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('quests')
    .select('title, description')
    .eq('id', id)
    .single();

  if (!data) return { title: 'Quest not found | opceo.ai' };

  return {
    title: `${data.title} — Quest | opceo.ai`,
    description: data.description.slice(0, 160),
    alternates: { canonical: `https://opceo.ai/quests/${id}` },
    openGraph: {
      title: `${data.title} — Quest`,
      description: data.description.slice(0, 160),
      url: `https://opceo.ai/quests/${id}`,
    },
  };
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  claimed: 'Claimed',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
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
  credit: 'Credit',
  collab: 'Collab',
  paid: 'Paid',
  equity: 'Equity',
  learning: 'Learning',
};

export default async function QuestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth
  const { data: { user } } = await supabase.auth.getUser();

  // Quest + poster
  const { data: rawQuest } = await supabase
    .from('quests')
    .select(`
      id, poster_id, title, description, category, skills_needed,
      reward_type, reward_detail, difficulty, status,
      max_claimers, deadline, created_at, updated_at,
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

  // Claims (with claimer info)
  const { data: rawClaims } = await supabase
    .from('quest_claims')
    .select(`
      id, quest_id, claimer_id, pitch, status, submitted_work,
      score_reward, created_at, completed_at,
      claimer:builders!quest_claims_claimer_id_fkey(slug, display_name, avatar_url)
    `)
    .eq('quest_id', id)
    .order('created_at', { ascending: true });

  const claims: QuestClaim[] = (rawClaims ?? []).map((c: Record<string, unknown>) => {
    const claimerRaw = c.claimer as QuestClaim['claimer'] | QuestClaim['claimer'][] | null;
    return {
      ...(c as unknown as QuestClaim),
      claimer: Array.isArray(claimerRaw) ? claimerRaw[0] : claimerRaw ?? undefined,
    };
  });

  // Determine viewer's builder id
  let viewerBuilderId: string | null = null;
  if (user) {
    const { data: vb } = await supabase
      .from('builders')
      .select('id')
      .eq('user_id', user.id)
      .single();
    viewerBuilderId = vb?.id ?? null;
  }

  const isPoster = viewerBuilderId === quest.poster_id;
  const myAcceptedClaim = claims.find(
    (c) => c.claimer_id === viewerBuilderId && c.status === 'accepted'
  );
  const hasAlreadyClaimed = claims.some((c) => c.claimer_id === viewerBuilderId);
  const canClaim =
    !isPoster &&
    quest.status === 'open' &&
    !hasAlreadyClaimed &&
    !!viewerBuilderId;

  return (
    <>
      <JsonLd data={questJsonLd(quest)} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <article>
          {/* Back */}
          <Link
            href="/quests"
            className="inline-block text-xs text-gray-500 hover:text-gray-300 mb-8 transition-colors font-mono"
          >
            ← Quest Board
          </Link>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-sm ${getCategoryColor(quest.category)}`}
            >
              {quest.category}
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-sm border ${STATUS_COLORS[quest.status] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}
            >
              {STATUS_LABELS[quest.status] ?? quest.status}
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-sm ${getDifficultyColor(quest.difficulty)}`}
            >
              {quest.difficulty}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm text-[#534AB7] bg-[#534AB7]/10">
              {REWARD_LABELS[quest.reward_type] ?? quest.reward_type}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-6">
            {quest.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 mb-10 pb-8 border-b border-white/5">
            {/* Poster */}
            {quest.poster && (
              <Link
                href={`/${quest.poster.slug}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                {quest.poster.avatar_url ? (
                  <Image
                    src={quest.poster.avatar_url}
                    alt={quest.poster.display_name}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#534AB7]/30 flex items-center justify-center text-[9px] text-[#534AB7] font-bold">
                    {quest.poster.display_name[0].toUpperCase()}
                  </div>
                )}
                {quest.poster.display_name}
              </Link>
            )}
            <span className="font-mono text-xs">
              {claims.length}/{quest.max_claimers} claimed
            </span>
            {quest.deadline && (
              <span className="font-mono text-xs">
                deadline: {formatRelativeTime(quest.deadline)}
              </span>
            )}
            <span className="font-mono text-xs">
              posted {formatRelativeTime(quest.created_at)}
            </span>
          </div>

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">
              Description
            </h2>
            <p className="text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap">
              {quest.description}
            </p>
          </section>

          {/* Skills needed */}
          {quest.skills_needed.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">
                Skills needed
              </h2>
              <div className="flex flex-wrap gap-2">
                {quest.skills_needed.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-mono px-2 py-0.5 border border-white/10 text-gray-300 rounded-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Reward */}
          {quest.reward_detail && (
            <section className="mb-10">
              <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">
                Reward
              </h2>
              <p className="text-[15px] text-gray-200 leading-relaxed">
                {quest.reward_detail}
              </p>
            </section>
          )}

          {/* Claim CTA */}
          {canClaim && (
            <div className="mb-10">
              <ClaimQuestButton
                questId={quest.id}
                maxClaimers={quest.max_claimers}
              />
            </div>
          )}

          {/* Already claimed (non-accepted) */}
          {!isPoster && hasAlreadyClaimed && !myAcceptedClaim && (
            <div className="mb-10 text-sm text-gray-400 border border-white/5 rounded-sm px-4 py-3">
              Your claim is under review.
            </div>
          )}

          {/* Submit work (accepted claimer) */}
          {!isPoster && myAcceptedClaim && !myAcceptedClaim.submitted_work && (
            <div className="mb-10">
              <SubmitWorkForm claimId={myAcceptedClaim.id} />
            </div>
          )}

          {/* Poster actions */}
          {isPoster && (
            <div className="mb-10 border border-white/10 rounded-sm p-5">
              <QuestPosterActions
                questId={quest.id}
                claims={claims}
                questStatus={quest.status}
              />
            </div>
          )}

          {/* Last updated */}
          <p className="text-xs text-gray-600 font-mono mt-10">
            Last updated: {formatRelativeTime(quest.updated_at)}
          </p>
        </article>
      </div>
    </>
  );
}
