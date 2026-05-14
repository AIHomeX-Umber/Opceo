'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getISOWeek, getISOWeekYear } from '@/lib/score';
import type { Builder } from '@/lib/types';

const MAX_CHARS = 500;
const MAX_TAGS = 10;

export default function ShipPage() {
  const router = useRouter();
  const supabase = createClient();

  const [builder, setBuilder] = useState<Builder | null>(null);
  const [existingLog, setExistingLog] = useState<{ id: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [shipped, setShipped] = useState('');
  const [learned, setLearned] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login?next=/ship');
        return;
      }

      const { data: b } = await supabase
        .from('builders')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!b) {
        router.replace('/onboarding');
        return;
      }

      setBuilder(b as Builder);

      // Check for existing log this ISO week
      const now = new Date();
      const week = getISOWeek(now);
      const year = getISOWeekYear(now);

      const { data: existing } = await supabase
        .from('ship_logs')
        .select('id')
        .eq('builder_id', b.id)
        .eq('week_number', week)
        .eq('year', year)
        .maybeSingle();

      if (existing) {
        setExistingLog({ id: existing.id, slug: b.slug });
      }

      setLoading(false);
    }
    init();
  }, []);

  function addTag() {
    const val = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!val) return;
    if (tags.includes(val)) {
      setTagInput('');
      return;
    }
    if (tags.length >= MAX_TAGS) return;
    setTags([...tags, val]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!builder) return;
    if (!shipped.trim()) {
      setError('Please describe what you shipped this week.');
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
        learned: learned.trim() || null,
        next_week: nextWeek.trim() || null,
        tags,
      })
      .select('id')
      .single();

    if (insertError || !log) {
      setError(insertError?.message ?? 'Failed to submit. Please try again.');
      setSubmitting(false);
      return;
    }

    // Update builder total_logs
    await supabase
      .from('builders')
      .update({ total_logs: builder.total_logs + 1, updated_at: new Date().toISOString() })
      .eq('id', builder.id);

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

  const now = new Date();
  const currentWeek = getISOWeek(now);

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

          {/* Shipped — required */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/60">
                What did you ship this week? <span className="text-red-400">*</span>
              </label>
              <span className={`text-xs font-mono ${shipped.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-white/30'}`}>
                {shipped.length}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              value={shipped}
              onChange={(e) => setShipped(e.target.value.slice(0, MAX_CHARS))}
              rows={5}
              placeholder="Launched the auth flow, shipped the landing page redesign, pushed the first API endpoint…"
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
              required
            />
          </div>

          {/* Learned — optional */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/60">
                What did you learn?
                <span className="ml-1.5 text-white/25">optional</span>
              </label>
              <span className={`text-xs font-mono ${learned.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-white/30'}`}>
                {learned.length > 0 ? `${learned.length}/${MAX_CHARS}` : ''}
              </span>
            </div>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value.slice(0, MAX_CHARS))}
              rows={4}
              placeholder="Found that streaming LLM responses cuts perceived latency by 40%…"
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
            />
          </div>

          {/* Next week — optional */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/60">
                What&apos;s next week?
                <span className="ml-1.5 text-white/25">optional</span>
              </label>
              <span className={`text-xs font-mono ${nextWeek.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-white/30'}`}>
                {nextWeek.length > 0 ? `${nextWeek.length}/${MAX_CHARS}` : ''}
              </span>
            </div>
            <textarea
              value={nextWeek}
              onChange={(e) => setNextWeek(e.target.value.slice(0, MAX_CHARS))}
              rows={3}
              placeholder="Integrate Stripe, build the dashboard, write three more blog posts…"
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/60">
              Tags
              <span className="ml-1.5 text-white/25">optional · press Enter to add · max {MAX_TAGS}</span>
            </label>
            <div
              className="min-h-[44px] flex flex-wrap gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-md cursor-text focus-within:border-[#534AB7] transition-colors"
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#534AB7]/20 border border-[#534AB7]/40 text-[#a49ef5] text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                    className="hover:text-white transition-colors leading-none"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {tags.length < MAX_TAGS && (
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? 'nextjs, ai, saas…' : ''}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-white/20 focus:outline-none"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !shipped.trim()}
            className="mt-2 px-5 py-3 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            {submitting ? 'Shipping…' : 'Ship it →'}
          </button>
        </form>
      </div>
    </div>
  );
}
