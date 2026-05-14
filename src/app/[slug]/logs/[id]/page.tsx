import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { shipLogJsonLd } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';
import UpvoteButton from '@/components/UpvoteButton';
import { formatRelativeTime } from '@/lib/utils';
import type { Builder, ShipLog } from '@/lib/types';

interface Params {
  slug: string;
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: log } = await supabase
    .from('ship_logs')
    .select('week_number, year, shipped, created_at, builders(display_name, slug)')
    .eq('id', id)
    .single();

  if (!log) {
    return { title: 'Ship Log not found' };
  }
  const builderMeta = log.builders as unknown as { slug: string; display_name: string } | null;
  if (!builderMeta || builderMeta.slug !== slug) {
    return { title: 'Ship Log not found' };
  }

  const builder = builderMeta;

  return buildMetadata({
    title: `Week ${log.week_number} Ship Log by ${builder.display_name}`,
    description: (log.shipped as string).slice(0, 155),
    path: `/${slug}/logs/${id}`,
    type: 'article',
    publishedTime: log.created_at as string,
  });
}

export default async function ShipLogPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();

  // Fetch log with builder join
  const { data: logData } = await supabase
    .from('ship_logs')
    .select(
      'id, builder_id, week_number, year, shipped, learned, next_week, tags, upvote_count, created_at, builders(id, slug, display_name, avatar_url, bio, building, build_score, links, skills, tier, is_investor, current_streak, longest_streak, total_logs, created_at, updated_at, user_id)'
    )
    .eq('id', id)
    .single();

  if (!logData) notFound();

  const builderRaw = logData.builders as unknown as Builder | null;
  if (!builderRaw || builderRaw.slug !== slug) notFound();

  const log: ShipLog = {
    id: logData.id,
    builder_id: logData.builder_id,
    week_number: logData.week_number,
    year: logData.year,
    shipped: logData.shipped,
    learned: logData.learned,
    next_week: logData.next_week,
    tags: logData.tags ?? [],
    upvote_count: logData.upvote_count ?? 0,
    created_at: logData.created_at,
  };
  const builder = builderRaw;

  // Check if current user has already upvoted
  let currentBuilderId: string | null = null;
  let hasUpvoted = false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: cb } = await supabase
      .from('builders')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cb) {
      currentBuilderId = cb.id;
      const { data: upvote } = await supabase
        .from('upvotes')
        .select('id')
        .eq('builder_id', cb.id)
        .eq('log_id', id)
        .maybeSingle();
      hasUpvoted = !!upvote;
    }
  }

  const logUrl = `https://opceo.ai/${slug}/logs/${id}`;
  const shareText = `Week ${log.week_number} ship log 🚀 ${log.shipped.slice(0, 80)}${log.shipped.length > 80 ? '…' : ''} — ${logUrl}`;
  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const publishedDate = new Date(log.created_at);
  const formattedDate = publishedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <JsonLd data={shipLogJsonLd(log, builder)} />

      <div className="min-h-[calc(100vh-56px)] px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <article>
            {/* Header */}
            <header className="mb-8">
              <p className="text-xs font-mono text-[#534AB7] mb-2">
                Week {log.week_number} · {log.year}
              </p>
              <h1 className="text-3xl font-semibold text-white mb-3">
                Week {log.week_number} — {builder.display_name}
              </h1>
              <time
                dateTime={log.created_at}
                className="text-sm text-white/40"
              >
                {formattedDate}
              </time>
            </header>

            {/* Shipped */}
            <section className="mb-8">
              <h2 className="text-xs font-mono font-semibold text-white/40 uppercase tracking-widest mb-3">
                Shipped
              </h2>
              <p className="text-base text-white/90 leading-relaxed whitespace-pre-wrap">
                {log.shipped}
              </p>
            </section>

            {/* Learned */}
            {log.learned && (
              <section className="mb-8">
                <h2 className="text-xs font-mono font-semibold text-white/40 uppercase tracking-widest mb-3">
                  Learned
                </h2>
                <p className="text-base text-white/90 leading-relaxed whitespace-pre-wrap">
                  {log.learned}
                </p>
              </section>
            )}

            {/* Next week */}
            {log.next_week && (
              <section className="mb-8">
                <h2 className="text-xs font-mono font-semibold text-white/40 uppercase tracking-widest mb-3">
                  Next week
                </h2>
                <p className="text-base text-white/90 leading-relaxed whitespace-pre-wrap">
                  {log.next_week}
                </p>
              </section>
            )}

            {/* Tags */}
            {log.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-8">
                {log.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-white/50 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions: upvote + share */}
            <div className="flex items-center gap-3 mb-10 pb-10 border-b border-white/8">
              <UpvoteButton
                logId={log.id}
                builderId={currentBuilderId ?? ''}
                initialCount={log.upvote_count}
                initialUpvoted={hasUpvoted}
              />

              {/* Copy link */}
              <CopyLinkButton url={logUrl} />

              {/* X share */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/15 text-sm text-white/50 hover:border-white/30 hover:text-white transition-colors"
                aria-label="Share on X"
              >
                <svg width="14" height="14" viewBox="0 0 1200 1227" fill="currentColor">
                  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6898H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.828Z" />
                </svg>
                Share
              </a>
            </div>

            {/* Builder card */}
            <div className="border border-white/8 rounded-lg p-5 bg-white/[0.02]">
              <Link href={`/${builder.slug}`} className="group flex items-start gap-4">
                {builder.avatar_url ? (
                  <img
                    src={builder.avatar_url}
                    alt={builder.display_name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover bg-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#534AB7]/30 flex items-center justify-center text-lg text-[#a49ef5] font-semibold shrink-0">
                    {builder.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-[#a49ef5] transition-colors">
                    {builder.display_name}
                  </p>
                  {builder.building && (
                    <p className="text-xs text-white/40 mt-0.5 truncate">
                      Building {builder.building}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-white/30">
                      Build score{' '}
                      <span className="text-white/60 font-mono">{builder.build_score}</span>
                    </span>
                    <span className="text-white/15">·</span>
                    <span className="text-xs text-white/30">
                      {builder.total_logs}{' '}
                      {builder.total_logs === 1 ? 'log' : 'logs'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </article>

          {/* Last updated */}
          <p className="mt-8 text-xs text-white/20 text-center">
            Last updated:{' '}
            <time dateTime={log.created_at}>{formatRelativeTime(log.created_at)}</time>
          </p>
        </div>
      </div>
    </>
  );
}

// Client component for copy-to-clipboard
import CopyLinkButton from './CopyLinkButton';
