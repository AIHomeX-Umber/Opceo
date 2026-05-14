'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Builder } from '@/lib/types';
import { getTierLabel, getTierColor } from '@/lib/utils';

const PAGE_SIZE = 24;

type SortKey = 'build_score' | 'current_streak' | 'created_at';

interface ExploreClientProps {
  builders: Builder[];
}

export default function ExploreClient({ builders }: ExploreClientProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('build_score');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let result = q
      ? builders.filter(
          (b) =>
            b.display_name.toLowerCase().includes(q) ||
            (b.building && b.building.toLowerCase().includes(q))
        )
      : [...builders];

    result.sort((a, b) => {
      if (sort === 'build_score') return b.build_score - a.build_score;
      if (sort === 'current_streak') return b.current_streak - a.current_streak;
      // newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [builders, query, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by name or project…"
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors pr-8"
            aria-label="Search builders"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-lg leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {([
            ['build_score', 'Build Score'],
            ['current_streak', 'Streak'],
            ['created_at', 'Newest'],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setSort(key); setPage(1); }}
              className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                sort === key
                  ? 'bg-[#534AB7] border-[#534AB7] text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25'
              }`}
              aria-pressed={sort === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-white/30 text-xs mb-5 tabular-nums">
        {filtered.length} builder{filtered.length !== 1 ? 's' : ''}
        {query && ` matching "${query}"`}
      </p>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-16">No builders found.</p>
      ) : (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Builder profiles"
        >
          {visible.map((builder) => (
            <li key={builder.id}>
              <Link
                href={`/${builder.slug}`}
                className="block border border-white/8 rounded-xl p-5 hover:border-white/20 transition-colors group h-full"
                aria-label={`View ${builder.display_name}'s profile`}
              >
                <article className="flex flex-col gap-3 h-full">
                  {/* Avatar + name */}
                  <header className="flex items-center gap-3">
                    {builder.avatar_url ? (
                      <Image
                        src={builder.avatar_url}
                        alt={`${builder.display_name}'s avatar`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover w-10 h-10 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#534AB7]/15 border border-[#534AB7]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#534AB7] text-sm font-semibold">
                          {builder.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate group-hover:text-white transition-colors">
                        {builder.display_name}
                      </p>
                      <span
                        className={`text-xs border rounded-full px-1.5 py-0 inline-block mt-0.5 ${getTierColor(builder.tier)}`}
                      >
                        {getTierLabel(builder.tier)}
                      </span>
                    </div>
                  </header>

                  {/* Building */}
                  {builder.building && (
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2 flex-1">
                      {builder.building}
                    </p>
                  )}

                  {/* Skills */}
                  {builder.skills && builder.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {builder.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/40"
                        >
                          {skill}
                        </span>
                      ))}
                      {builder.skills.length > 4 && (
                        <span className="text-xs text-white/25">+{builder.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <footer className="flex items-center gap-3 pt-1 border-t border-white/5">
                    <span className="text-white/40 text-xs tabular-nums">
                      <span className="text-white/70 font-medium">{builder.build_score}</span> pts
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40 text-xs tabular-nums">
                      <span className="text-white/70 font-medium">{builder.current_streak}</span>
                      <span className="text-orange-400 ml-0.5" aria-label="streak">🔥</span>
                    </span>
                  </footer>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2.5 border border-white/10 rounded-md text-white/60 text-sm hover:border-white/30 hover:text-white transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
}
