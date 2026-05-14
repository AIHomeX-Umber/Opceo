import Link from 'next/link';
import type { ShipLog } from '@/lib/types';
import { formatRelativeTime, truncate } from '@/lib/utils';

interface ShipLogCardProps {
  log: ShipLog;
  showBuilder?: boolean;
}

export default function ShipLogCard({ log, showBuilder = true }: ShipLogCardProps) {
  const href = `/${log.builder?.slug}/logs/${log.id}`;

  return (
    <Link href={href} className="block group">
      <article className="border border-white/8 rounded-lg p-5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-colors">
        {/* Builder header */}
        {showBuilder && log.builder && (
          <div className="flex items-center gap-2.5 mb-4">
            {log.builder.avatar_url ? (
              <img
                src={log.builder.avatar_url}
                alt={log.builder.display_name}
                width={28}
                height={28}
                className="rounded-full object-cover bg-white/10"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#534AB7]/30 flex items-center justify-center text-xs text-[#a49ef5] font-medium shrink-0">
                {log.builder.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-white/70 group-hover:text-white transition-colors font-medium">
              {log.builder.display_name}
            </span>
          </div>
        )}

        {/* Week + time */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-[#534AB7]">
            Week {log.week_number} · {log.year}
          </span>
          <span className="text-white/20">·</span>
          <time
            dateTime={log.created_at}
            className="text-xs text-white/30"
          >
            {formatRelativeTime(log.created_at)}
          </time>
        </div>

        {/* Shipped content */}
        <p className="text-sm text-white/80 leading-relaxed mb-4 group-hover:text-white transition-colors">
          {truncate(log.shipped, 160)}
        </p>

        {/* Tags */}
        {log.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {log.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-white/5 border border-white/10 text-white/40 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: upvote count */}
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <svg
            width="12"
            height="12"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M7 2L12 9H2L7 2Z" />
          </svg>
          <span>{log.upvote_count}</span>
        </div>
      </article>
    </Link>
  );
}
