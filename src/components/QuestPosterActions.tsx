'use client';
// components/QuestPosterActions.tsx — poster manages claims

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { QuestClaim } from '@/lib/types';
import { truncate } from '@/lib/utils';

interface Props {
  questId: string;
  claims: QuestClaim[];
  questStatus: string;
}

const CLAIM_STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400',
  accepted: 'text-green-400',
  rejected: 'text-red-400',
  completed: 'text-gray-400',
  abandoned: 'text-gray-600',
};

export default function QuestPosterActions({ questId, claims, questStatus }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function acceptClaim(claimId: string) {
    setLoading(claimId + '-accept');
    setError('');
    try {
      const { error: e1 } = await supabase
        .from('quest_claims')
        .update({ status: 'accepted' })
        .eq('id', claimId);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from('quests')
        .update({ status: 'in_progress' })
        .eq('id', questId);
      if (e2) throw e2;
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setLoading(null);
    }
  }

  async function rejectClaim(claimId: string) {
    setLoading(claimId + '-reject');
    setError('');
    try {
      const { error: e } = await supabase
        .from('quest_claims')
        .update({ status: 'rejected' })
        .eq('id', claimId);
      if (e) throw e;
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setLoading(null);
    }
  }

  async function markCompleted(claimId: string) {
    setLoading(claimId + '-complete');
    setError('');
    try {
      const { error: e1 } = await supabase
        .from('quest_claims')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', claimId);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from('quests')
        .update({ status: 'completed' })
        .eq('id', questId);
      if (e2) throw e2;
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setLoading(null);
    }
  }

  async function cancelQuest() {
    setLoading('cancel');
    setError('');
    try {
      const { error: e } = await supabase
        .from('quests')
        .update({ status: 'cancelled' })
        .eq('id', questId);
      if (e) throw e;
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Claims ({claims.length})
        </h3>
        {questStatus !== 'completed' && questStatus !== 'cancelled' && (
          <button
            onClick={cancelQuest}
            disabled={loading === 'cancel'}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            {loading === 'cancel' ? 'Cancelling…' : 'Cancel quest'}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs border border-red-400/20 bg-red-400/5 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      {claims.length === 0 ? (
        <p className="text-sm text-gray-500">No claims yet.</p>
      ) : (
        <ul className="space-y-3">
          {claims.map((claim) => (
            <li
              key={claim.id}
              className="border border-white/10 rounded-sm p-4 space-y-3"
            >
              {/* Claimer header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {claim.claimer?.avatar_url ? (
                    <Image
                      src={claim.claimer.avatar_url}
                      alt={claim.claimer.display_name}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#534AB7]/30 flex items-center justify-center text-[10px] text-[#534AB7] font-bold">
                      {(claim.claimer?.display_name ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                  <Link
                    href={`/${claim.claimer?.slug ?? '#'}`}
                    className="text-sm text-white hover:text-[#534AB7] transition-colors"
                  >
                    {claim.claimer?.display_name ?? 'Unknown'}
                  </Link>
                </div>
                <span className={`text-xs font-mono ${CLAIM_STATUS_COLORS[claim.status] ?? 'text-gray-400'}`}>
                  {claim.status}
                </span>
              </div>

              {/* Pitch */}
              <p className="text-sm text-gray-400 leading-relaxed">
                {truncate(claim.pitch, 200)}
              </p>

              {/* Submitted work */}
              {claim.submitted_work && (
                <div className="text-xs text-gray-500 bg-white/5 rounded-sm px-3 py-2">
                  <span className="text-gray-400 font-medium">Deliverable: </span>
                  {claim.submitted_work}
                </div>
              )}

              {/* Actions */}
              {claim.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptClaim(claim.id)}
                    disabled={loading === claim.id + '-accept'}
                    className="h-7 px-3 bg-[#534AB7] hover:bg-[#4a42a8] disabled:opacity-50 text-white text-xs rounded-sm transition-colors"
                  >
                    {loading === claim.id + '-accept' ? '…' : 'Accept'}
                  </button>
                  <button
                    onClick={() => rejectClaim(claim.id)}
                    disabled={loading === claim.id + '-reject'}
                    className="h-7 px-3 border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/30 disabled:opacity-50 text-xs rounded-sm transition-colors"
                  >
                    {loading === claim.id + '-reject' ? '…' : 'Reject'}
                  </button>
                </div>
              )}

              {claim.status === 'accepted' && questStatus === 'review' && (
                <button
                  onClick={() => markCompleted(claim.id)}
                  disabled={loading === claim.id + '-complete'}
                  className="h-7 px-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs rounded-sm transition-colors"
                >
                  {loading === claim.id + '-complete' ? '…' : 'Mark completed'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
