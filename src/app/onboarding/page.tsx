'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

const SKILL_OPTIONS = [
  'AI', 'Cross-border', 'React', 'Design', 'Marketing',
  'Content', 'Ops', 'Research', 'Dev', 'Product',
];

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [building, setBuilding] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Check auth + existing profile
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      const { data: builder } = await supabase
        .from('builders')
        .select('slug, building, display_name')
        .eq('user_id', user.id)
        .single();

      if (builder?.building) {
        router.replace(`/${builder.slug}`);
        return;
      }
      // Pre-fill display_name from user metadata or email
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '';
      setDisplayName(builder?.display_name || name);
      if (builder?.slug) {
        setSlug(builder.slug);
        setSlugStatus('available');
      } else if (name) {
        const s = slugify(name);
        setSlug(s);
      }
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate slug from display_name unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited && displayName) {
      setSlug(slugify(displayName));
    }
  }, [displayName, slugManuallyEdited]);

  // Debounced slug uniqueness check
  const checkSlug = useCallback(
    async (value: string) => {
      if (!value || value.length < 2) {
        setSlugStatus('idle');
        return;
      }
      setSlugStatus('checking');
      try {
        const { data } = await supabase
          .from('builders')
          .select('slug')
          .eq('slug', value)
          .maybeSingle();
        setSlugStatus(data ? 'taken' : 'available');
      } catch {
        setSlugStatus('error');
      }
    },
    [supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug) checkSlug(slug);
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || !slug.trim()) return;
    if (slugStatus === 'taken') return;
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/auth/login'); return; }

    const { error: upsertError } = await supabase
      .from('builders')
      .upsert(
        {
          user_id: user.id,
          display_name: displayName.trim(),
          slug: slug.trim(),
          bio: bio.trim() || null,
          building: building.trim() || null,
          skills,
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }
    router.push(`/${slug.trim()}`);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-white/40 text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-white mb-2">Set up your builder profile</h1>
        <p className="text-white/50 text-sm">
          Your public page on opceo.ai. You can edit this anytime in Settings.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Display Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display_name" className="text-sm text-white/70 font-medium">
            Display name <span className="text-[#534AB7]">*</span>
          </label>
          <input
            id="display_name"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
            placeholder="Your name"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm text-white/70 font-medium">
            Profile URL <span className="text-[#534AB7]">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-sm font-mono">opceo.ai/</span>
            <div className="relative flex-1">
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm font-mono placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors pr-8"
                placeholder="your-slug"
              />
              {slugStatus === 'checking' && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">…</span>
              )}
              {slugStatus === 'available' && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 text-xs">✓</span>
              )}
              {slugStatus === 'taken' && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400 text-xs">✗</span>
              )}
            </div>
          </div>
          {slugStatus === 'available' && (
            <p className="text-green-400 text-xs">Available</p>
          )}
          {slugStatus === 'taken' && (
            <p className="text-red-400 text-xs">Already taken — try another</p>
          )}
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm text-white/70 font-medium flex items-center justify-between">
            <span>Bio</span>
            <span className="text-white/30 text-xs font-normal">{bio.length}/160</span>
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            rows={3}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
            placeholder="One or two sentences about who you are."
          />
        </div>

        {/* Building */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="building" className="text-sm text-white/70 font-medium">
            What are you building right now?
          </label>
          <input
            id="building"
            type="text"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
            placeholder="e.g. An AI tool for cross-border sellers"
          />
          <p className="text-white/30 text-xs">Showing this publicly drives signal bets and connects.</p>
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-white/70 font-medium">Skills</span>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  skills.includes(skill)
                    ? 'bg-[#534AB7] border-[#534AB7] text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || slugStatus === 'taken' || slugStatus === 'checking' || !displayName.trim() || !slug.trim()}
          className="mt-2 px-5 py-3 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving ? 'Saving…' : 'Continue to profile →'}
        </button>
      </form>
    </main>
  );
}
