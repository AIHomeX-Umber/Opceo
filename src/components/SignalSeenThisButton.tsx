'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calculateSignalStatus, type SignalStatus } from '@/lib/signal-lifecycle';

interface Props {
  questId: string;
  viewerBuilderId: string | null;
  initialSeenCount: number;
  initialHasConfirmed: boolean;
  currentSignalStatus: SignalStatus;
  currentBuildersCount: number;
  onStatusChange?: (status: SignalStatus, newCount: number) => void;
}

export default function SignalSeenThisButton({
  questId,
  viewerBuilderId,
  initialSeenCount,
  initialHasConfirmed,
  currentSignalStatus,
  currentBuildersCount,
  onStatusChange,
}: Props) {
  const [hasConfirmed, setHasConfirmed] = useState(initialHasConfirmed);
  const [seenCount, setSeenCount] = useState(initialSeenCount);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleConfirm() {
    if (!viewerBuilderId) {
      window.location.href = `/auth/login?next=/quests/${questId}`;
      return;
    }
    setShowNote(true);
  }

  async function submitConfirmation() {
    if (!viewerBuilderId || saving) return;
    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('signal_confirmations')
      .insert({ quest_id: questId, builder_id: viewerBuilderId, note: note.trim() || null });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    const newCount = seenCount + 1;

    // Recalculate status
    const newStatus = calculateSignalStatus({
      seen_count: newCount,
      comment_count: 0,
      builders_count: currentBuildersCount,
      has_solution: currentSignalStatus === 'solved',
    });

    // Update quest
    await supabase
      .from('quests')
      .update({ seen_count: newCount, signal_status: newStatus })
      .eq('id', questId);

    // Activity feed
    await supabase.from('activity_feed').insert({
      actor_id: viewerBuilderId,
      action: 'signal_confirmed',
      summary: `confirmed a signal`,
      target_id: questId,
    });

    const VALID_TRANSITION_ACTIONS = new Set(['validated', 'building', 'solved']);
    if (newStatus !== currentSignalStatus && VALID_TRANSITION_ACTIONS.has(newStatus)) {
      await supabase.from('activity_feed').insert({
        actor_id: viewerBuilderId,
        action: `signal_${newStatus}`,
        summary: `Signal reached ${newStatus} status`,
        target_id: questId,
      });
    }

    setSeenCount(newCount);
    setHasConfirmed(true);
    setShowNote(false);
    setSaving(false);
    onStatusChange?.(newStatus as SignalStatus, newCount);
  }

  if (hasConfirmed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 border border-[#D85A30]/30 rounded-md text-sm text-[#D85A30]/70">
        <span>🔥</span>
        <span>You&apos;ve confirmed this · {seenCount}</span>
        <span className="text-[#D85A30]/50 text-xs">✓</span>
      </div>
    );
  }

  if (showNote) {
    return (
      <div className="border border-white/10 rounded-md p-4 space-y-3">
        <p className="text-sm text-white/70">Add your observation <span className="text-white/30">(optional)</span></p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 300))}
          rows={3}
          placeholder="Where did you see this? What context can you add?"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#D85A30] resize-none transition-colors"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/25">{note.length}/300</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowNote(false)}
              className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitConfirmation}
              disabled={saving}
              className="px-4 py-1.5 bg-[#D85A30] hover:bg-[#c04e28] disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors"
            >
              {saving ? 'Confirming…' : 'Confirm'}
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
      onClick={handleConfirm}
      className="flex items-center gap-2 px-4 py-2.5 border border-[#D85A30]/40 hover:border-[#D85A30] hover:bg-[#D85A30]/5 rounded-md text-sm text-white/80 transition-colors"
    >
      <span>🔥</span>
      <span>I&apos;ve seen this too · {seenCount}</span>
    </button>
  );
}
