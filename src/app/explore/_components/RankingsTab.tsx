// RankingsTab — Step 2 placeholder
// Full implementation (stats bar, filter pills, sortable table, methodology) lands in Step 3.
// Layout containers are reserved so Step 3 can fill them in without restructuring.

export function RankingsTab() {
  return (
    <div className="max-w-4xl">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-2">Builder Rankings</h1>
        <p className="text-sm text-white/40 max-w-lg">
          Builders ranked by shipping consistency, build streaks, and completion rate.
          Updated weekly from real ship log data.
        </p>
      </div>

      {/* ── Stats bar placeholder (Step 3 fills this) ────────────────
          Will become a horizontal row of platform-wide aggregate metrics.
          e.g. Active builders · Ships this week · Avg streak · Completion rate
      ─────────────────────────────────────────────────────────────── */}
      <div className="mb-8 h-12 rounded-sm border border-white/5 bg-white/[0.02] flex items-center px-4">
        <span className="text-xs font-mono text-white/15">stats bar · coming in Step 3</span>
      </div>

      {/* ── Filter pills placeholder (Step 3 fills this) ────────────
          Will become: [All] [AI] [Cross-border] [SaaS] [Content] ...
      ─────────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-2">
        <span className="rounded-sm bg-[#534AB7] px-3 py-1 text-xs font-mono text-white">
          All
        </span>
        <span className="rounded-sm border border-white/8 px-3 py-1 text-xs font-mono text-white/20">
          AI
        </span>
        <span className="rounded-sm border border-white/8 px-3 py-1 text-xs font-mono text-white/20">
          SaaS
        </span>
        <span className="text-xs font-mono text-white/15 ml-1">· more in Step 3</span>
      </div>

      {/* ── Rankings table placeholder (Step 3 fills this) ──────────
          Will become a sortable table: # · Builder · Ships/wk · Streak · Score
      ─────────────────────────────────────────────────────────────── */}
      <div className="rounded-sm border border-white/8 bg-white/[0.02] overflow-hidden mb-8">
        {/* Table header skeleton */}
        <div className="grid grid-cols-[2rem_1fr_6rem_6rem_6rem] border-b border-white/5 px-4 py-2 gap-4">
          <span className="text-[10px] font-mono text-white/20">#</span>
          <span className="text-[10px] font-mono text-white/20">Builder</span>
          <span className="text-[10px] font-mono text-white/20 text-right">Ships/wk</span>
          <span className="text-[10px] font-mono text-white/20 text-right">Streak</span>
          <span className="text-[10px] font-mono text-white/20 text-right">Score</span>
        </div>

        {/* Coming soon body */}
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-3xl">📊</div>
          <p className="text-sm font-medium text-white/60">Rankings coming soon</p>
          <p className="text-xs text-white/25 max-w-xs text-center">
            Live data is being wired up. Check back after the next deploy.
          </p>
        </div>
      </div>

      {/* ── Methodology placeholder (Step 3 fills this) ─────────────
          Will become a collapsible "How rankings work →" section
      ─────────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/5 pt-5">
        <button
          disabled
          className="text-xs text-white/20 font-mono cursor-default"
        >
          How rankings work → (coming soon)
        </button>
      </div>
    </div>
  );
}
