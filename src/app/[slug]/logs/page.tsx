import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import ShipLogCard from '@/components/ShipLogCard';
import type { Builder, ShipLog } from '@/lib/types';
import Link from 'next/link';

interface Params {
  slug: string;
}

const PAGE_SIZE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: builder } = await supabase
    .from('builders')
    .select('display_name, slug')
    .eq('slug', slug)
    .single();

  if (!builder) return { title: 'Builder not found' };

  return buildMetadata({
    title: `${builder.display_name}'s Ship Logs`,
    description: `All weekly ship logs from ${builder.display_name} on OpCEO.AI.`,
    path: `/${slug}/logs`,
  });
}

export default async function BuilderLogsPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const supabase = await createClient();

  const { data: builder } = await supabase
    .from('builders')
    .select('id, slug, display_name, avatar_url, building, build_score, total_logs, bio, links, skills, tier, is_investor, current_streak, longest_streak, created_at, updated_at, user_id, entity_type')
    .eq('slug', slug)
    .single();

  if (!builder) notFound();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: logsRaw, count } = await supabase
    .from('ship_logs')
    .select('id, builder_id, week_number, year, shipped, learned, next_week, tool_stack, upvote_count, created_at', {
      count: 'exact',
    })
    .eq('builder_id', builder.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  const logs: ShipLog[] = (logsRaw ?? []).map((l) => ({
    ...l,
    builder: {
      slug: builder.slug,
      display_name: builder.display_name,
      avatar_url: builder.avatar_url,
      entity_type: (builder.entity_type ?? 'human') as 'human' | 'agent',
    },
  }));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href={`/${slug}`}
            className="text-xs text-white/30 hover:text-white/60 transition-colors mb-3 inline-block"
          >
            ← {builder.display_name}
          </Link>
          <h1 className="text-2xl font-semibold text-white">Ship Logs</h1>
          <p className="text-sm text-white/40 mt-1">
            {count ?? 0} {(count ?? 0) === 1 ? 'log' : 'logs'} shipped
          </p>
        </header>

        {logs.length === 0 ? (
          <p className="text-sm text-white/30">No logs yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {logs.map((log) => (
              <ShipLogCard key={log.id} log={log} showBuilder={false} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/8">
            {page > 1 ? (
              <Link
                href={`/${slug}/logs?page=${page - 1}`}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-xs text-white/30 font-mono">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/${slug}/logs?page=${page + 1}`}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
