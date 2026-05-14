'use client';
// components/SubmitWorkForm.tsx — claimer submits deliverable

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  claimId: string;
}

export default function SubmitWorkForm({ claimId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [work, setWork] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (work.trim().length < 10) {
      setError('Please describe your deliverable (min 10 chars).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error: updateErr } = await supabase
        .from('quest_claims')
        .update({ submitted_work: work.trim(), status: 'pending' })
        .eq('id', claimId);
      if (updateErr) throw updateErr;
      setDone(true);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-green-400">
        Work submitted. Waiting for poster review.
      </p>
    );
  }

  return (
    <div className="border border-white/10 rounded-sm p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Submit your work</h3>
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <textarea
          rows={4}
          value={work}
          onChange={(e) => setWork(e.target.value)}
          placeholder="Link to deliverable, description of what you built, or a summary of results."
          className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm rounded-sm px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-9 px-4 bg-[#534AB7] hover:bg-[#4a42a8] disabled:opacity-50 text-white text-sm font-medium rounded-sm transition-colors"
        >
          {loading ? 'Submitting…' : 'Submit deliverable'}
        </button>
      </form>
    </div>
  );
}
