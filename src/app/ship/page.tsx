'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getISOWeek, getISOWeekYear } from '@/lib/score';
import { ToolStackInput } from '@/components/ToolStackInput';
import type { Builder } from '@/lib/types';

const MAX_CHARS = 500;

function CharCount({ value, max }: { value: string; max: number }) {
  const pct = value.length / max;
  return value.length > 0 ? (
    <span className={`text-xs font-mono ${pct > 0.9 ? 'text-red-400' : 'text-white/25'}`}>
      {value.length}/{max}
    </span>
  ) : null;
}

export default function ShipPage() {
  const router = useRouter();
  const supabase = createClient();

  const [builder, setBuilder] = useState<Builder | null>(null);
  const [existingLog, setExistingLog] = useState<{ id: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [shipped, setShipped] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [learned, setLearned] = useState('');
  const [toolStack, setToolStack] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login?next=/ship'); return; }

      const { data: b } = await supabase
        .from('builders').select('*').eq('user_id', user.id).single();
      if (!b) { router.replace('/onboarding'); return; }

      setBuilder(b as Builder);

      const now = new Date();
      const week = getISOWeek(now);
      const year = getISOWeekYear(now);

      const { data: existing } = await supabase
        .from('ship_logs').select('id')
        .eq('builder_id', b.id).eq('week_number', week).eq('year', year)
        .maybeSingle();

      if (existing) setExistingLog({ id: existing.id, slug: b.slug });
      setLoading(false);
    }
    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!builder) return;

    if (!shipped.trim()) {
      setError('Please describe what you shipped this week.');
      return;
    }
    if (!nextWeek.trim()) {
      setError("Please describe your plan for next week.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const now = new Date();
    const week_number = getISOWeek(now);
    const year = getISOWeekYear(now);

    const { data: log, error: insertError } = await supabase
      .from('ship_logs')
      .insert({
        builder_id: builder.id,
        week_number,
        year,
        shipped: shipped.trim(),
        next_week: nextWeek.trim(),
        learned: learned.trim() || null,
        tool_stack: toolStack,
      })
      .select('id')
      .single();

    if (insertError || !log) {
      setError(insertError?.message ?? 'Failed to submit. Please try again.');
      setSubmitting(false);
      return;
    }

    await supabase
      .from('builders')
      .update({ total_logs: builder.total_logs + 1, updated_at: new Date().toISOString() })
      .eq('id', builder.id);

    await supabase.from('activity_feed').insert({
      actor_id: builder.id,
      action: 'shipped',
      summary: `shipped Week ${week_number}`,
    });

    router.push(`/${builder.slug}/logs/${log.id}`);
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <p className="text-white/30 text-sm">Loading…</p>
      </div>
    );
  }

  if (existingLog) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-white/60 text-sm mb-1">You already shipped this week.</p>
          <Link
            href={`/${existingLog.slug}/logs/${existingLog.id}`}
            className="text-[#534AB7] hover:text-white text-sm transition-colors"
          >
            View your Week {getISOWeek(new Date())} log →
          </Link>
        </div>
      </div>
    );
  }

  const currentWeek = getISOWeek(new Date());
  const canSubmit = !!shipped.trim() && !!nextWeek.trim();

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-xs text-white/30 font-mono mb-1">Week {currentWeek}</p>
          <h1 className="text-2xl font-semibold text-white">Ship your log</h1>
          <p className="text-sm text-white/40 mt-1">What did you build this week?</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* 1 — Shipped (required) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/60">
                What did you ship this week?{' '}
                <span className="text-red-400">*</span>
              </label>
              <CharCount value={shipped} max={MAX_CHARS} />
            </div>
            <textarea
              value={shipped}
              onChange={(e) => setShipped(e.target.value.slice(0, MAX_CHARS))}
              rows={5}
              placeholder="Launched the auth flow, shipped the landing page redesign, pushed the first API endpoint…"
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white
                placeholder-white/20 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
              required
            />
          </div>

          {/* 2 — Next week (required) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/60">
                What&apos;s your plan for next week?{' '}
                <span className="text-red-400">*</span>
              </label>
              <CharCount value={nextWeek} max={MAX_CHARS} />
            </div>
            <textarea
              value={nextWeek}
              onChange={(e) => setNextWeek(e.target.value.slice(0, MAX_CHARS))}
              rows={3}
              placeholder="Integrate Stripe, build the dashboard, write three more blog posts…"
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white
                placeholder-white/20 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
              required
            />
          </div>

          {/* 3 — Learned (optional) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/60">
                Blockers &amp; lessons{' '}
                <span className="text-white/25 font-normal">optional</span>
              </label>
              <CharCount value={learned} max={MAX_CHARS} />
            </div>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value.slice(0, MAX_CHARS))}
              rows={4}
              placeholder="What slowed you down? What did you figure out?"
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white
                placeholder-white/20 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
            />
          </div>

          {/* 4 — Tool stack (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/60">
              Tool stack{' '}
              <span className="text-white/25 font-normal">optional</span>
            </label>
            <ToolStackInput
              value={toolStack}
              onChange={setToolStack}
              maxItems={10}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="mt-2 px-5 py-3 bg-[#534AB7] hover:bg-[#4339a0]
              disabled:opacity-40 disabled:cursor-not-allowed
              text-white text-sm font-medium rounded-md transition-colors"
          >
            {submitting ? 'Shipping…' : 'Ship it →'}
          </button>
        </form>
      </div>
    </div>
  );
}
