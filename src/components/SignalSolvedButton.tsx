'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  questId: string;
  viewerBuilderId: string | null;
  questPosterId: string;
  viewerIsBuilder: boolean;
  onSolved?: () => void;
}

export default function SignalSolvedButton({
  questId,
  viewerBuilderId,
  questPosterId,
  viewerIsBuilder,
  onSolved,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const canMark =
    viewerBuilderId !== null &&
    (viewerBuilderId === questPosterId || viewerIsBuilder);

  if (!canMark) return null;
  if (done) {
    return (
      <div className="text-sm text-yellow-400/70 flex items-center gap-2">
        <span>🏆</span> Signal marked as solved
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="border border-yellow-400/20 rounded-md p-4 space-y-3 bg-yellow-400/5">
        <p className="text-sm text-white/70 font-medium">Solution summary</p>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value.slice(0, 500))}
          rows={4}
          placeholder="How was this solved? Link to the project, key insight, or outcome."
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-yellow-400/50 resize-none transition-colors"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/25">{summary.length}/500</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                setSaving(true);
                setError(null);
                const { error: updateError } = await supabase
                  .from('quests')
                  .update({
                    signal_status: 'solved',
                    reward_detail: summary.trim() || null,
                  })
                  .eq('id', questId);

                if (updateError) {
                  setError(updateError.message);
                  setSaving(false);
                  return;
                }

                await supabase.from('activity_feed').insert({
                  actor_id: viewerBuilderId,
                  action: 'signal_solved',
                  summary: `marked a signal as solved`,
                  target_id: questId,
                });

                setDone(true);
                setSaving(false);
                onSolved?.();
              }}
              disabled={saving || !summary.trim()}
              className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors"
            >
              {saving ? 'Marking…' : 'Mark as solved'}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowForm(true)}
      className="text-xs text-yellow-400/50 hover:text-yellow-400 transition-colors font-mono underline underline-offset-2"
    >
      Mark as solved
    </button>
  );
}
