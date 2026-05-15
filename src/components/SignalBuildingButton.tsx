'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calculateSignalStatus, type SignalStatus } from '@/lib/signal-lifecycle';

interface Props {
  questId: string;
  viewerBuilderId: string | null;
  initialIsBuilding: boolean;
  currentSignalStatus: SignalStatus;
  currentSeenCount: number;
  onStatusChange?: (status: SignalStatus) => void;
}

export default function SignalBuildingButton({
  questId,
  viewerBuilderId,
  initialIsBuilding,
  currentSignalStatus,
  currentSeenCount,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [isBuilding, setIsBuilding] = useState(initialIsBuilding);
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleClick() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth/login?next=/quests/${questId}`);
      return;
    }
    setShowForm(true);
  }

  async function submitBuild() {
    const { data: { user } } = await supabase.auth.getUser();
    const builderId = viewerBuilderId ?? user?.id;
    if (!builderId || saving || !projectName.trim()) return;
    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('signal_builders')
      .insert({
        quest_id: questId,
        builder_id: builderId,
        project_name: projectName.trim(),
        project_url: projectUrl.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    const newStatus = calculateSignalStatus({
      seen_count: currentSeenCount,
      comment_count: 0,
      builders_count: 1,
      has_solution: false,
    });

    await supabase
      .from('quests')
      .update({ signal_status: newStatus })
      .eq('id', questId);

    await supabase.from('activity_feed').insert({
      actor_id: builderId,
      action: 'signal_building',
      summary: `started building for a signal`,
      target_id: questId,
    });

    setIsBuilding(true);
    setShowForm(false);
    setSaving(false);
    onStatusChange?.(newStatus as SignalStatus);
  }

  if (isBuilding) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 border border-violet-400/30 rounded-md text-sm text-violet-400/70">
        <span>💡</span>
        <span>You&apos;re building for this ✓</span>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="border border-white/10 rounded-md p-4 space-y-3">
        <p className="text-sm text-white/70 font-medium">What are you building?</p>
        <div className="space-y-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value.slice(0, 120))}
            placeholder="Project name *"
            required
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
          />
          <input
            type="url"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="Project URL (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitBuild}
            disabled={saving || !projectName.trim()}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors"
          >
            {saving ? 'Saving…' : 'I\'m building this'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2.5 border border-white/10 hover:border-violet-400/40 hover:bg-violet-400/5 rounded-md text-sm text-white/70 transition-colors"
    >
      <span>💡</span>
      <span>I&apos;m building for this</span>
    </button>
  );
}
