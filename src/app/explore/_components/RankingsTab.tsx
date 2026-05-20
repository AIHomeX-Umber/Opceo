// RankingsTab — warm editorial reskin.
// ALL data logic, queries, ranking_score, sort/category/limit, buildUrl, show-more UNCHANGED.
// Only visual: colors, borders, typography changed to warm editorial system.

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

// ── Types ───────────────────────────────────────────────────────────────────

interface RankingRow {
  builder_id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
  tier: string;
  skills: unknown;
  total_logs: number;
  current_streak: number;
  longest_streak: number;
  build_score: number;
  ships_last_4_weeks: number;
  ships_per_week: number | string;
  ranking_score: number | string;
}

interface StatsRow {
  ships_last_4_weeks: number;
  ships_per_week: number | string;
  current_streak: number;
  skills: unknown;
}

type SortKey = 'ranking_score' | 'ships_per_week' | 'current_streak';

interface Props {
  sort?: string;
  category?: string;
  limit: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const FALLBACK_TAGS = [
  'AI', 'SaaS', '跨境', '制造业', 'AI出海', '外贸', '供应链', '内容', '设计', '增长',
];

function toNum(v: number | string | undefined | null): number {
  return Number(v ?? 0);
}

// Warm editorial rank colors: gold/silver/bronze earth tones + muted default
function rankColor(i: number): string {
  if (i === 0) return 'text-[#B8860B]';   // deep gold
  if (i === 1) return 'text-[#847E72]';   // warm silver
  if (i === 2) return 'text-[#A0522D]';   // sienna bronze
  return 'text-[#C9C3B8]';               // warm muted
}

function safeSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);
}

function buildUrl(
  base: { sort: SortKey; category: string | undefined; limit: number },
  overrides: Partial<{ sort: SortKey; category: string | null; limit: number }> = {},
): string {
  const effectiveSort = overrides.sort !== undefined ? overrides.sort : base.sort;
  const effectiveCategory =
    overrides.category !== undefined ? overrides.category ?? undefined : base.category;
  const effectiveLimit = overrides.limit !== undefined ? overrides.limit : base.limit;

  const p = new URLSearchParams({ tab: 'rankings' });
  if (effectiveSort !== 'ranking_score') p.set('sort', effectiveSort);
  if (effectiveCategory) p.set('category', effectiveCategory);
  if (effectiveLimit !== 20) p.set('limit', String(effectiveLimit));
  return `/explore?${p.toString()}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export async function RankingsTab({ sort: sortParam, category, limit }: Props) {
  const supabase = await createClient();

  // ── Current user (for self-row highlight) ─────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  let currentBuilderId: string | null = null;
  if (user) {
    const { data: b } = await supabase
      .from('builders')
      .select('id')
      .eq('user_id', user.id)
      .single();
    currentBuilderId = b?.id ?? null;
  }

  const validSort: SortKey =
    sortParam === 'ships_per_week' || sortParam === 'current_streak'
      ? sortParam
      : 'ranking_score';

  // ── Query 1: all rows for platform-wide stats + tag derivation ────────────
  const { data: statsRows } = await supabase
    .from('builder_rankings')
    .select('ships_last_4_weeks, ships_per_week, current_streak, skills');

  const allRows = (statsRows ?? []) as StatsRow[];
  const totalBuilders = allRows.length;

  const totalShips4w = allRows.reduce((s, r) => s + (r.ships_last_4_weeks ?? 0), 0);

  const avgShipsPerWeek =
    totalBuilders > 0
      ? allRows.reduce((s, r) => s + toNum(r.ships_per_week), 0) / totalBuilders
      : 0;

  const avgStreak =
    totalBuilders > 0
      ? allRows.reduce((s, r) => s + (r.current_streak ?? 0), 0) / totalBuilders
      : 0;

  // Derive filter tags from JSONB skills across all builders
  const tagCounts: Record<string, number> = {};
  for (const row of allRows) {
    for (const tag of safeSkills(row.skills)) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const derivedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
  const filterTags = derivedTags.length >= 3 ? derivedTags : FALLBACK_TAGS;

  // ── Query 2: filtered + sorted display rows (limit + 1 for has-more) ──────
  let query = supabase
    .from('builder_rankings')
    .select(
      'builder_id, slug, display_name, avatar_url, tier, skills, total_logs, current_streak, longest_streak, build_score, ships_last_4_weeks, ships_per_week, ranking_score',
    )
    .order(validSort, { ascending: false })
    .limit(limit + 1);

  if (category) {
    query = query.contains('skills', [category]);
  }

  const { data: rowsRaw } = await query;
  const hasMore = (rowsRaw?.length ?? 0) > limit;
  const rows = ((rowsRaw ?? []).slice(0, limit)) as RankingRow[];

  // URL builder params
  const urlBase = { sort: validSort, category, limit };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-[1.6rem] font-medium text-[#191613] mb-1.5 leading-[1.2]">
          持续建造者排行榜
        </h1>
        <p className="font-body-serif text-[0.88rem] text-[#847E72] max-w-lg leading-[1.6]">
          基于连续建造天数、周产出频率和综合评分，实时反映谁在真实持续地 Ship。
        </p>
      </div>

      {/* Stats bar — 2×2 on mobile, 4 cols on sm+ */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#DDD8CB] rounded-[8px] overflow-hidden border border-[#DDD8CB]">
        {[
          { label: '活跃建造者', value: totalBuilders.toString() },
          { label: '近4周 Ship', value: totalShips4w.toString() },
          {
            label: '平均周产出',
            value: avgShipsPerWeek > 0 ? avgShipsPerWeek.toFixed(1) : '—',
          },
          {
            label: '平均连续建造',
            value: avgStreak > 0 ? `${Math.round(avgStreak)}天` : '—',
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#FAFAF5] px-4 py-3">
            <div className="font-display text-[1.25rem] font-medium text-[#191613] tabular-nums">
              {value}
            </div>
            <div className="font-body-serif text-[0.72rem] text-[#AEA899] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="mb-5 overflow-x-auto">
        <div className="flex gap-2 min-w-max sm:min-w-0 flex-wrap sm:flex-nowrap">
          {/* All pill */}
          <Link
            href={buildUrl(urlBase, { category: null })}
            className={`font-body-serif px-3 py-1 text-[0.78rem] rounded-full whitespace-nowrap transition-colors ${
              !category
                ? 'bg-[#191613] text-[#FAFAF5]'
                : 'border border-[#DDD8CB] text-[#847E72] hover:text-[#5C564C] hover:border-[#C9C3B8]'
            }`}
          >
            全部
          </Link>

          {filterTags.slice(0, 12).map((tag) => (
            <Link
              key={tag}
              href={buildUrl(urlBase, { category: category === tag ? null : tag })}
              className={`font-body-serif px-3 py-1 text-[0.78rem] rounded-full whitespace-nowrap transition-colors ${
                category === tag
                  ? 'bg-[#C15F3C] text-[#FAFAF5]'
                  : 'border border-[#DDD8CB] text-[#847E72] hover:text-[#5C564C] hover:border-[#C9C3B8]'
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-[#DDD8CB] bg-[#FAFAF5] overflow-hidden mb-6">

        {/* Column headers — must match row grid exactly */}
        <div className="grid grid-cols-[2rem_1fr_5rem] sm:grid-cols-[2rem_1fr_6rem_6rem_6rem] border-b border-[#DDD8CB] px-4 py-2.5 gap-3 bg-[#F3EFE6]">
          <span className="font-mono-jb text-[0.65rem] text-[#AEA899] uppercase tracking-wider">#</span>
          <span className="font-mono-jb text-[0.65rem] text-[#AEA899] uppercase tracking-wider">建造者</span>
          {/* Ships/wk and Streak hidden on mobile */}
          <span className="hidden sm:block font-mono-jb text-[0.65rem] text-[#AEA899] uppercase tracking-wider text-right">
            <Link
              href={buildUrl(urlBase, { sort: validSort === 'ships_per_week' ? 'ranking_score' : 'ships_per_week' })}
              className={`transition-colors hover:text-[#5C564C] ${validSort === 'ships_per_week' ? 'text-[#C15F3C]' : ''}`}
            >
              周产出{validSort === 'ships_per_week' ? ' ↓' : ''}
            </Link>
          </span>
          <span className="hidden sm:block font-mono-jb text-[0.65rem] text-[#AEA899] uppercase tracking-wider text-right">
            <Link
              href={buildUrl(urlBase, { sort: validSort === 'current_streak' ? 'ranking_score' : 'current_streak' })}
              className={`transition-colors hover:text-[#5C564C] ${validSort === 'current_streak' ? 'text-[#C15F3C]' : ''}`}
            >
              连续建造{validSort === 'current_streak' ? ' ↓' : ''}
            </Link>
          </span>
          <span className="font-mono-jb text-[0.65rem] text-[#AEA899] uppercase tracking-wider text-right">
            <Link
              href={buildUrl(urlBase, { sort: 'ranking_score' })}
              className={`transition-colors hover:text-[#5C564C] ${validSort === 'ranking_score' ? 'text-[#C15F3C]' : ''}`}
            >
              综合评分{validSort === 'ranking_score' ? ' ↓' : ''}
            </Link>
          </span>
        </div>

        {/* Rows */}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-3xl">📊</div>
            <p className="font-body-serif text-[0.88rem] text-[#847E72]">
              {category ? `暂无 "${category}" 分类的建造者` : '暂无数据'}
            </p>
            {category && (
              <Link
                href={buildUrl(urlBase, { category: null })}
                className="font-body-serif text-[0.8rem] text-[#C15F3C] hover:underline"
              >
                查看全部建造者
              </Link>
            )}
          </div>
        ) : (
          rows.map((row, i) => {
            const spw = toNum(row.ships_per_week);
            const streak = row.current_streak ?? 0;
            const score = toNum(row.ranking_score);
            const skills = safeSkills(row.skills);
            const streakWeeks = Math.floor(streak / 7);
            const showStreakBadge = streakWeeks >= 4;
            const isSelf = currentBuilderId !== null && row.builder_id === currentBuilderId;

            return (
              <Link
                key={row.builder_id}
                href={`/${row.slug}`}
                className={`grid grid-cols-[2rem_1fr_5rem] sm:grid-cols-[2rem_1fr_6rem_6rem_6rem] items-start gap-3 px-4 py-3 border-b border-[#EBE6DA] last:border-0 hover:bg-[#F3EFE6] transition-colors group ${
                  isSelf ? 'bg-[rgba(193,95,60,0.06)] shadow-[inset_2px_0_0_rgba(193,95,60,0.45)]' : ''
                }`}
              >
                {/* Rank number */}
                <span className={`font-mono-jb text-[0.88rem] font-bold tabular-nums mt-0.5 ${rankColor(i)}`}>
                  {i + 1}
                </span>

                {/* Builder info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {row.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={row.avatar_url}
                        alt={row.display_name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#DDD8CB] flex-shrink-0 flex items-center justify-center">
                        <span className="font-mono-jb text-[10px] text-[#847E72]">
                          {row.display_name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>
                    )}
                    <span className="font-body-serif text-[0.88rem] text-[#302B24] group-hover:text-[#191613] transition-colors font-medium truncate">
                      {row.display_name ?? row.slug}
                    </span>
                    {showStreakBadge && (
                      <span className="hidden sm:inline-flex items-center gap-0.5 font-mono-jb text-[10px] text-[#C15F3C] bg-[rgba(193,95,60,0.08)] px-1.5 py-0.5 rounded-sm flex-shrink-0">
                        🔥 {streakWeeks}w
                      </span>
                    )}
                  </div>

                  {/* Skills tags */}
                  {skills.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="font-mono-jb text-[10px] text-[#AEA899] border border-[#DDD8CB] px-1.5 py-0.5 rounded-sm"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mobile sub-row: ships/wk + streak */}
                  <div className="sm:hidden mt-1 flex gap-3 font-mono-jb text-[10px] text-[#AEA899] tabular-nums">
                    <span>周产出 {spw > 0 ? spw.toFixed(1) : '—'}</span>
                    <span>
                      连续 {streak > 0 ? `${streak}天` : '—'}
                      {showStreakBadge && ' 🔥'}
                    </span>
                  </div>
                </div>

                {/* Ships/week — desktop only */}
                <span className="hidden sm:block font-mono-jb text-[0.84rem] tabular-nums text-[#5C564C] text-right mt-0.5">
                  {spw > 0 ? spw.toFixed(1) : '—'}
                </span>

                {/* Streak — desktop only */}
                <span className="hidden sm:flex items-center justify-end gap-1 font-mono-jb text-[0.84rem] tabular-nums text-[#5C564C] text-right mt-0.5">
                  {streak > 0 ? `${streak}天` : '—'}
                  {showStreakBadge && <span className="text-[#C15F3C] text-[10px]">🔥</span>}
                </span>

                {/* Score */}
                <span className="font-mono-jb text-[0.84rem] tabular-nums text-[#302B24] text-right mt-0.5 font-medium">
                  {score > 0 ? score.toFixed(2) : '—'}
                </span>
              </Link>
            );
          })
        )}
      </div>

      {/* Thin-table nudge: < 10 rows but at least 1 */}
      {rows.length > 0 && rows.length < 10 && !hasMore && (
        <p className="font-body-serif text-[0.78rem] text-[#AEA899] text-center mb-6">
          更多 Builder 正在加入长期建造。
        </p>
      )}

      {/* Show more */}
      {hasMore && (
        <div className="mb-8 flex justify-center">
          <Link
            href={buildUrl(urlBase, { limit: limit + 20 })}
            className="font-body-serif text-[0.84rem] text-[#847E72] border border-[#DDD8CB] px-5 py-2 rounded-full hover:text-[#5C564C] hover:border-[#C9C3B8] transition-colors"
          >
            显示更多建造者 →
          </Link>
        </div>
      )}

      {/* Methodology */}
      <div className="border-t border-[#DDD8CB] pt-5">
        <details className="group">
          <summary className="font-body-serif text-[0.8rem] text-[#AEA899] cursor-pointer hover:text-[#847E72] transition-colors select-none list-none flex items-center gap-1.5">
            <span className="transition-transform group-open:rotate-90 inline-block">›</span>
            排行榜如何计算？
          </summary>
          <div className="mt-4 font-body-serif text-[0.8rem] text-[#847E72] leading-relaxed space-y-3 max-w-2xl">
            <p>
              <span className="text-[#5C564C] font-medium">综合评分</span>由三个维度加权计算：
            </p>
            <ul className="space-y-1.5 ml-3">
              <li>
                <span className="text-[#5C564C]">· 连续建造（35%）</span>
                — 基于当前连续 Ship 天数取对数，奖励长期坚持者，抵抗短期冲榜。
              </li>
              <li>
                <span className="text-[#5C564C]">· 周产出频率（35%）</span>
                — 近4周日均 Ship 数×7，每条 Ship 最多计5分，防止批量刷榜。
              </li>
              <li>
                <span className="text-[#5C564C]">· 历史积累（20%）</span>
                — 总 Ship 数取对数，给资历深的建造者一定权重，但不让老账户躺赢。
              </li>
              <li>
                <span className="text-[#5C564C]">· 社区认可（10%）</span>
                — 获得的点赞数取对数，衡量内容质量与影响力。
              </li>
            </ul>
            <p>
              <span className="text-[#5C564C] font-medium">冷启动保护：</span>
              注册不足4周的建造者综合评分乘以 0.85 系数，避免新号突击刷榜影响排名。
            </p>
            <p>
              <span className="text-[#5C564C] font-medium">数据刷新：</span>
              排行榜为实时视图，每次访问直接读取最新数据。
            </p>
          </div>
        </details>
      </div>

    </div>
  );
}
