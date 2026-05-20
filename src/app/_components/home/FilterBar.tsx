'use client';

// FilterBar — Chinese-first category tabs + grid/list toggle.
// Sticky at top: 64px (just below LandingNav; global Nav is hidden on /).
// Client component for active-tab state. V1: visual only (no actual filtering).

import { useState } from 'react';

const TABS = [
  { label: '全部',    count: 6 },
  { label: 'AI工具',  count: 2 },
  { label: 'SaaS',   count: 2 },
  { label: '内容增长', count: 1 },
  { label: '跨境出海', count: 1 },
  { label: '开发工具', count: 1 },
];

export function FilterBar() {
  const [active, setActive] = useState(0);
  const [view,   setView]   = useState<'grid' | 'list'>('grid');

  return (
    <div
      id="intelligence"
      className="sticky z-30 border-b border-[#DDD8CB] bg-[#FAFAF5] flex items-stretch justify-between"
      style={{ top: 64, padding: '0 clamp(24px, 5vw, 72px)' }}
    >
      {/* Tabs */}
      <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`font-body-serif text-[0.88rem] px-5 py-[14px] whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              active === i
                ? 'text-[#191613] border-[#C15F3C]'
                : 'text-[#847E72] border-transparent hover:text-[#302B24]'
            }`}
          >
            {tab.label}
            <span
              className={`font-mono-jb text-[0.62rem] px-[6px] py-[1px] rounded-[10px] ${
                active === i
                  ? 'bg-[rgba(193,95,60,0.1)] text-[#C15F3C]'
                  : 'bg-[#EBE6DA] text-[#847E72]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* View toggle — hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2.5 py-2.5 flex-shrink-0">
        {/* Grid button */}
        <button
          onClick={() => setView('grid')}
          className={`w-8 h-8 border rounded-[6px] flex items-center justify-center transition-all cursor-pointer ${
            view === 'grid'
              ? 'bg-[#191613] border-[#191613] text-[#FAFAF5]'
              : 'bg-[#FAFAF5] border-[#DDD8CB] text-[#847E72] hover:border-[#AEA899]'
          }`}
          title="网格视图"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1"  y="1"  width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="9"  y="1"  width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1"  y="9"  width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="9"  y="9"  width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        </button>

        {/* List button */}
        <button
          onClick={() => setView('list')}
          className={`w-8 h-8 border rounded-[6px] flex items-center justify-center transition-all cursor-pointer ${
            view === 'list'
              ? 'bg-[#191613] border-[#191613] text-[#FAFAF5]'
              : 'bg-[#FAFAF5] border-[#DDD8CB] text-[#847E72] hover:border-[#AEA899]'
          }`}
          title="列表视图"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M1 3h14M1 8h14M1 13h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
