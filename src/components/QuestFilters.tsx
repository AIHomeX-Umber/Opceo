'use client';
// components/QuestFilters.tsx — client-side URL-param driven filters

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'ai-workflow', label: 'AI Workflow' },
  { value: 'content', label: 'Content' },
  { value: 'design', label: 'Design' },
  { value: 'dev', label: 'Dev' },
  { value: 'research', label: 'Research' },
  { value: 'ops', label: 'Ops' },
  { value: 'signal', label: 'Signal 🔥' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
];

const DIFFICULTIES = [
  { value: '', label: 'All difficulties' },
  { value: 'starter', label: 'Starter' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'legendary', label: 'Legendary' },
];

const REWARD_TYPES = [
  { value: '', label: 'All rewards' },
  { value: 'credit', label: 'Credit' },
  { value: 'collab', label: 'Collab' },
  { value: 'paid', label: 'Paid' },
  { value: 'equity', label: 'Equity' },
  { value: 'learning', label: 'Learning' },
];

const SIGNAL_STATUSES = [
  { value: '', label: 'All signal statuses' },
  { value: 'observed', label: 'Observed' },
  { value: 'discussed', label: 'Discussed' },
  { value: 'validated', label: 'Validated' },
  { value: 'building', label: 'Building' },
  { value: 'solved', label: 'Solved' },
];

const MARKET_SIZES = [
  { value: '', label: 'All markets' },
  { value: 'niche', label: 'Niche' },
  { value: 'local', label: 'Local' },
  { value: 'national', label: 'National' },
  { value: 'global', label: 'Global' },
];

interface Props {
  current: {
    category?: string;
    status?: string;
    difficulty?: string;
    reward_type?: string;
    signal_status?: string;
    market_size?: string;
  };
}

export default function QuestFilters({ current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // When switching away from signal category, clear signal-specific params
      if (key === 'category' && value !== 'signal') {
        params.delete('signal_status');
        params.delete('market_size');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const selectClass =
    'h-8 px-2 bg-[#0f0f0f] border border-white/10 text-gray-300 text-xs font-mono rounded-sm focus:outline-none focus:border-[#534AB7] cursor-pointer';
  const signalSelectClass =
    'h-8 px-2 bg-[#0f0f0f] border border-[#D85A30]/30 text-gray-300 text-xs font-mono rounded-sm focus:outline-none focus:border-[#D85A30] cursor-pointer';

  const isSignal = current.category === 'signal';

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={current.category ?? ''}
        onChange={(e) => updateParam('category', e.target.value)}
        className={selectClass}
        aria-label="Filter by category"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      {!isSignal && (
        <>
          <select
            value={current.status ?? ''}
            onChange={(e) => updateParam('status', e.target.value)}
            className={selectClass}
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={current.difficulty ?? ''}
            onChange={(e) => updateParam('difficulty', e.target.value)}
            className={selectClass}
            aria-label="Filter by difficulty"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          <select
            value={current.reward_type ?? ''}
            onChange={(e) => updateParam('reward_type', e.target.value)}
            className={selectClass}
            aria-label="Filter by reward type"
          >
            {REWARD_TYPES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </>
      )}

      {isSignal && (
        <>
          <select
            value={current.signal_status ?? ''}
            onChange={(e) => updateParam('signal_status', e.target.value)}
            className={signalSelectClass}
            aria-label="Filter by signal status"
          >
            {SIGNAL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={current.market_size ?? ''}
            onChange={(e) => updateParam('market_size', e.target.value)}
            className={signalSelectClass}
            aria-label="Filter by market size"
          >
            {MARKET_SIZES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
