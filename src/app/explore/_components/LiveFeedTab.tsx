// LiveFeedTab — warm editorial reskin.
// ALL data logic, queries, formatRelativeTime UNCHANGED.
// Only visual: warm bg/border/text replacing dark system colors.

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
    <div className="border border-[#DDD8CB] rounded-[8px] p-4 bg-[#FAFAF5] hover:border-[#C9C3B8] hover:bg-[#F3EFE6] transition-colors">
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
          <div className="w-8 h-8 shrink-0 mt-0.5 rounded-full bg-[rgba(193,95,60,0.12)] flex items-center justify-center text-[#C15F3C] font-mono-jb text-xs font-bold">
            {(log.builder?.display_name ?? '?')[0].toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              href={`/${log.builder?.slug ?? '#'}`}
              className="font-body-serif text-[0.88rem] font-medium text-[#302B24] hover:text-[#C15F3C] transition-colors"
            >
              {log.builder?.display_name ?? 'Builder'}
            </Link>
            <span className="font-mono-jb text-[0.72rem] text-[#AEA899]">W{log.week_number}</span>
            <span className="font-mono-jb text-[0.72rem] text-[#AEA899]">
              {formatRelativeTime(log.created_at)}
            </span>
          </div>

          <p className="font-body-serif text-[0.88rem] text-[#5C564C] leading-relaxed line-clamp-3">
            {log.shipped}
          </p>

          {log.tool_stack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {log.tool_stack.slice(0, 4).map((tool) => (
                <span
                  key={tool}
                  className="font-mono-jb text-[10px] px-1.5 py-0.5 border border-[#DDD8CB] text-[#AEA899] rounded-sm"
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
          <h2 className="font-display text-[1.4rem] font-medium text-[#191613]">实时 Ship 流</h2>
          <p className="font-body-serif text-[0.8rem] text-[#AEA899] mt-0.5">
            正在建造的人们，正在发生的事。
          </p>
        </div>
        {/* Pulse indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="font-mono-jb text-[10px] text-[#AEA899]">live</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="font-body-serif text-[0.88rem] text-[#AEA899]">暂无 Ship 记录。</p>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <ShipCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {logs.length === 20 && (
        <p className="mt-6 font-mono-jb text-[0.72rem] text-[#C9C3B8] text-center">
          显示最近 20 条 Ship 记录
        </p>
      )}
    </div>
  );
}
