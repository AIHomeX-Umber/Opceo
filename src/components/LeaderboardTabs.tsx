'use client';
// components/LeaderboardTabs.tsx — client tab switcher

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Builder } from '@/lib/types';
import { getTierColor } from '@/lib/utils';

interface Props {
  byScore: Builder[];
  byStreak: Builder[];
}

export default function LeaderboardTabs({ byScore, byStreak }: Props) {
  const [tab, setTab] = useState<'score' | 'streak'>('score');
  const rows = tab === 'score' ? byScore : byStreak;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border border-white/10 rounded-sm w-fit mb-8 overflow-hidden">
        <button
          onClick={() => setTab('score')}
          className={`px-5 h-9 text-sm font-medium transition-colors ${
            tab === 'score'
              ? 'bg-[#534AB7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Build Score
        </button>
        <button
          onClick={() => setTab('streak')}
          className={`px-5 h-9 text-sm font-medium transition-colors ${
            tab === 'streak'
              ? 'bg-[#534AB7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Streak
        </button>
      </div>

      {/* Table */}
      <div className="border border-white/10 rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-mono text-gray-500 px-4 py-3 w-12">#</th>
              <th className="text-left text-xs font-mono text-gray-500 px-4 py-3">Builder</th>
              <th className="text-left text-xs font-mono text-gray-500 px-4 py-3 hidden sm:table-cell">
                Building
              </th>
              <th className="text-right text-xs font-mono text-gray-500 px-4 py-3">
                {tab === 'score' ? 'Score' : 'Streak'}
              </th>
              <th className="text-right text-xs font-mono text-gray-500 px-4 py-3 hidden sm:table-cell">
                Tier
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((builder, i) => (
              <tr
                key={builder.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                {/* Rank */}
                <td className="px-4 py-3 font-mono text-sm text-gray-500">
                  {i === 0 ? (
                    <span className="text-amber-400 font-bold">1</span>
                  ) : i === 1 ? (
                    <span className="text-gray-300 font-bold">2</span>
                  ) : i === 2 ? (
                    <span className="text-orange-700 font-bold">3</span>
                  ) : (
                    i + 1
                  )}
                </td>

                {/* Builder */}
                <td className="px-4 py-3">
                  <Link
                    href={`/${builder.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    {builder.avatar_url ? (
                      <Image
                        src={builder.avatar_url}
                        alt={builder.display_name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#534AB7] text-xs font-bold">
                        {builder.display_name[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-white group-hover:text-[#534AB7] transition-colors font-medium">
                      {builder.display_name}
                    </span>
                  </Link>
                </td>

                {/* Building */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-gray-400 line-clamp-1">
                    {builder.building ?? '—'}
                  </span>
                </td>

                {/* Score/Streak */}
                <td className="px-4 py-3 text-right font-mono text-sm text-white">
                  {tab === 'score'
                    ? builder.build_score.toLocaleString()
                    : `${builder.current_streak}w`}
                </td>

                {/* Tier */}
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span
                    className={`text-xs font-mono px-2 py-0.5 border rounded-sm ${getTierColor(builder.tier)}`}
                  >
                    {builder.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No builders yet.
          </div>
        )}
      </div>
    </div>
  );
}
