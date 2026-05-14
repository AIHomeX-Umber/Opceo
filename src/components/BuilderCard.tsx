import Link from 'next/link';
import Image from 'next/image';
import type { Builder } from '@/lib/types';
import { getTierLabel, getTierColor } from '@/lib/utils';

interface BuilderCardProps {
  builder: Builder;
  rank?: number;
  showBuildScore?: boolean;
}

export default function BuilderCard({ builder, rank, showBuildScore = true }: BuilderCardProps) {
  return (
    <Link
      href={`/${builder.slug}`}
      className="block p-5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/3 transition-all group"
    >
      <div className="flex items-start gap-4">
        {rank !== undefined && (
          <span className="text-sm font-mono text-white/30 w-6 shrink-0 pt-1">
            #{rank}
          </span>
        )}

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-white/10 shrink-0 overflow-hidden">
          {builder.avatar_url ? (
            <Image
              src={builder.avatar_url}
              alt={`${builder.display_name} avatar`}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-lg font-semibold">
              {builder.display_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white group-hover:text-[#534AB7] transition-colors">
              {builder.display_name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 border rounded font-mono ${getTierColor(builder.tier)}`}>
              {getTierLabel(builder.tier)}
            </span>
          </div>

          {builder.building && (
            <p className="text-xs text-white/50 mt-0.5 truncate">{builder.building}</p>
          )}

          {builder.skills && builder.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {builder.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-1.5 py-0.5 bg-white/6 text-white/50 rounded font-mono"
                >
                  {skill}
                </span>
              ))}
              {builder.skills.length > 4 && (
                <span className="text-xs text-white/30">+{builder.skills.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {showBuildScore && (
          <div className="text-right shrink-0">
            <div className="text-lg font-mono font-semibold text-white">
              {builder.build_score}
            </div>
            <div className="text-xs text-white/40">
              🔥 {builder.current_streak}w
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
