// LiveFeedTab — chronological stream of ship logs
// Mirrors the "Latest ships" section from the homepage.
// Fetches its own data; only runs when tab=live is active.

import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatRelativeTime } from '@/lib/utils';
import type { ShipLog } from '@/lib/types';

async function getLiveFeed(): Promise<ShipLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('ship_logs')
    .select(
      `id, builder_id, week_number, year, shipped, learned, next_week,
       tool_stack, upvote_count, created_at,
       builder:builders!ship_logs_builder_id_fkey(slug, display_name, avatar_url, entity_type)`
    )
    .order('created_at', { ascending: false })
    .limit(20);

  return (data ?? []).map((l: Record<string, unknown>) => {
    const builderRaw = l.builder as ShipLog['builder'] | ShipLog['builder'][] | null;
    return {
      ...(l as unknown as ShipLog),
      builder: Array.isArray(builderRaw) ? builderRaw[0] : builderRaw ?? undefined,
    };
  });
}

function ShipCard({ log }: { log: ShipLog }) {
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              href={`/${log.builder?.slug ?? '#'}`}
              className="text-sm font-medium text-white hover:text-[#534AB7] transition-colors"
            >
              {log.builder?.display_name ?? 'Builder'}
            </Link>
            <span className="text-xs font-mono text-gray-600">W{log.week_number}</span>
            <span className="text-xs text-gray-600">
              {formatRelativeTime(log.created_at)}
            </span>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
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

export async function LiveFeedTab() {
  const logs = await getLiveFeed();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">实时 Ship 流</h2>
          <p className="text-xs text-white/30 mt-0.5">
            正在建造的人们，正在发生的事。
          </p>
        </div>
        {/* Pulse indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[10px] font-mono text-white/25">live</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-white/30">暂无 Ship 记录。</p>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <ShipCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {logs.length === 20 && (
        <p className="mt-6 text-xs text-white/20 text-center font-mono">
          显示最近 20 条 Ship 记录
        </p>
      )}
    </div>
  );
}
