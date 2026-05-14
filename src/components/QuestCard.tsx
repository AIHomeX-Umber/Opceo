// components/QuestCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Quest } from '@/lib/types';
import { getCategoryColor, getDifficultyColor, formatRelativeTime } from '@/lib/utils';

const REWARD_LABELS: Record<string, string> = {
  credit: 'Credit',
  collab: 'Collab',
  paid: 'Paid',
  equity: 'Equity',
  learning: 'Learning',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  claimed: 'Claimed',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'text-green-400 bg-green-400/10',
  claimed: 'text-blue-400 bg-blue-400/10',
  in_progress: 'text-violet-400 bg-violet-400/10',
  review: 'text-yellow-400 bg-yellow-400/10',
  completed: 'text-gray-400 bg-gray-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

interface QuestCardProps {
  quest: Quest;
}

export default function QuestCard({ quest }: QuestCardProps) {
  const visibleSkills = quest.skills_needed.slice(0, 3);
  const extraSkills = quest.skills_needed.length - 3;

  return (
    <Link
      href={`/quests/${quest.id}`}
      className="block border border-white/10 bg-[#0f0f0f] rounded-sm p-5 hover:border-[#534AB7]/60 transition-colors group"
    >
      {/* Top row: category + status */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-sm ${getCategoryColor(quest.category)}`}
        >
          {quest.category}
        </span>
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-sm ${STATUS_COLORS[quest.status] ?? 'text-gray-400 bg-gray-400/10'}`}
        >
          {STATUS_LABELS[quest.status] ?? quest.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2 mb-3 group-hover:text-[#534AB7] transition-colors">
        {quest.title}
      </h3>

      {/* Difficulty + Reward */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-sm ${getDifficultyColor(quest.difficulty)}`}
        >
          {quest.difficulty}
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-sm text-[#534AB7] bg-[#534AB7]/10">
          {REWARD_LABELS[quest.reward_type] ?? quest.reward_type}
        </span>
      </div>

      {/* Skills */}
      {quest.skills_needed.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-mono px-1.5 py-0.5 border border-white/10 text-gray-400 rounded-sm"
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 border border-white/10 text-gray-400 rounded-sm">
              +{extraSkills} more
            </span>
          )}
        </div>
      )}

      {/* Footer: poster + meta */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {quest.poster?.avatar_url ? (
            <Image
              src={quest.poster.avatar_url}
              alt={quest.poster.display_name}
              width={20}
              height={20}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#534AB7]/30 flex items-center justify-center">
              <span className="text-[9px] text-[#534AB7] font-bold">
                {(quest.poster?.display_name ?? '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-400">
            {quest.poster?.display_name ?? 'Unknown'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
          <span>
            {quest.claims_count ?? 0}/{quest.max_claimers} claimed
          </span>
          {quest.deadline && (
            <span>due {formatRelativeTime(quest.deadline)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
