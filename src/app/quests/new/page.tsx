'use client';
// app/quests/new/page.tsx — Post a Quest form

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = ['ai-workflow', 'content', 'design', 'dev', 'research', 'ops', 'other'] as const;
const REWARD_TYPES = ['credit', 'collab', 'paid', 'equity', 'learning'] as const;
const DIFFICULTIES = ['starter', 'medium', 'hard', 'legendary'] as const;

export default function NewQuestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [builderId, setBuilderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'dev' as typeof CATEGORIES[number],
    skills_needed: [] as string[],
    reward_type: 'collab' as typeof REWARD_TYPES[number],
    reward_detail: '',
    difficulty: 'starter' as typeof DIFFICULTIES[number],
    max_claimers: 1,
    deadline: '',
  });

  // Auth check + fetch builder id
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login?next=/quests/new');
        return;
      }
      const { data: builder } = await supabase
        .from('builders')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!builder) {
        router.replace('/onboarding');
        return;
      }
      setBuilderId(builder.id);
    })();
  }, [supabase, router]);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !form.skills_needed.includes(s)) {
      set('skills_needed', [...form.skills_needed, s]);
    }
    setSkillInput('');
  }

  function removeSkill(s: string) {
    set('skills_needed', form.skills_needed.filter((x) => x !== s));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!builderId) return;
    if (form.title.trim().length < 5) {
      setError('Title must be at least 5 characters.');
      return;
    }
    if (form.description.trim().length < 20) {
      setError('Description must be at least 20 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        poster_id: builderId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        skills_needed: form.skills_needed,
        reward_type: form.reward_type,
        reward_detail: form.reward_detail.trim() || null,
        difficulty: form.difficulty,
        max_claimers: form.max_claimers,
        deadline: form.deadline || null,
        status: 'open',
      };

      const { data, error: insertError } = await supabase
        .from('quests')
        .insert(payload)
        .select('id')
        .single();

      if (insertError) throw insertError;
      router.push(`/quests/${data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!builderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-sm">Checking authentication…</p>
      </div>
    );
  }

  const labelClass = 'block text-sm text-gray-300 mb-1.5';
  const inputClass =
    'w-full bg-[#0f0f0f] border border-white/10 text-white text-sm rounded-sm px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-[#534AB7] transition-colors';
  const selectClass =
    'w-full bg-[#0f0f0f] border border-white/10 text-white text-sm rounded-sm px-3 py-2 focus:outline-none focus:border-[#534AB7] transition-colors cursor-pointer';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Post a Quest</h1>
        <p className="text-gray-400 text-sm">
          Describe the task. The right builder will find it.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClass}>
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            maxLength={120}
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Build a landing page for our beta launch"
            className={inputClass}
          />
          <p className="text-xs text-gray-600 mt-1 text-right">
            {form.title.length}/120
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            rows={6}
            maxLength={2000}
            required
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What needs to be done? What does success look like? Any context the claimer should know."
            className={`${inputClass} resize-none`}
          />
          <p className="text-xs text-gray-600 mt-1 text-right">
            {form.description.length}/2000
          </p>
        </div>

        {/* Category + Difficulty row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => set('category', e.target.value as typeof CATEGORIES[number])}
              className={selectClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="difficulty" className={labelClass}>
              Difficulty <span className="text-red-400">*</span>
            </label>
            <select
              id="difficulty"
              value={form.difficulty}
              onChange={(e) => set('difficulty', e.target.value as typeof DIFFICULTIES[number])}
              className={selectClass}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills needed */}
        <div>
          <label className={labelClass}>Skills needed</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. React (press Enter to add)"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addSkill}
              className="shrink-0 px-3 h-9 border border-white/10 text-gray-300 text-sm rounded-sm hover:border-[#534AB7] transition-colors"
            >
              Add
            </button>
          </div>
          {form.skills_needed.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.skills_needed.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 bg-[#534AB7]/10 border border-[#534AB7]/30 text-[#534AB7] rounded-sm"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-red-400 transition-colors"
                    aria-label={`Remove ${s}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reward type + detail */}
        <div>
          <label htmlFor="reward_type" className={labelClass}>
            Reward type <span className="text-red-400">*</span>
          </label>
          <select
            id="reward_type"
            value={form.reward_type}
            onChange={(e) => set('reward_type', e.target.value as typeof REWARD_TYPES[number])}
            className={`${selectClass} mb-3`}
          >
            {REWARD_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <label htmlFor="reward_detail" className={labelClass}>
            Reward details{' '}
            <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            id="reward_detail"
            type="text"
            maxLength={500}
            value={form.reward_detail}
            onChange={(e) => set('reward_detail', e.target.value)}
            placeholder="e.g. Credit in product + backlink"
            className={inputClass}
          />
        </div>

        {/* Max claimers + deadline */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="max_claimers" className={labelClass}>
              Max claimers
            </label>
            <input
              id="max_claimers"
              type="number"
              min={1}
              max={20}
              value={form.max_claimers}
              onChange={(e) => set('max_claimers', parseInt(e.target.value) || 1)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="deadline" className={labelClass}>
              Deadline{' '}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => set('deadline', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm border border-red-400/20 bg-red-400/5 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-[#534AB7] hover:bg-[#4a42a8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-sm transition-colors"
        >
          {loading ? 'Posting…' : 'Post quest'}
        </button>
      </form>
    </div>
  );
}
