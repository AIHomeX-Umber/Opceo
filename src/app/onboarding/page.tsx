'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { ToolStackInput } from '@/components/ToolStackInput';

const BUILDER_TYPES = [
  { key: 'founder', label: 'Founder' },
  { key: 'operator', label: 'Operator' },
  { key: 'engineer', label: 'Engineer' },
  { key: 'researcher', label: 'Researcher' },
  { key: 'designer', label: 'Designer' },
  { key: 'creator', label: 'Creator' },
  { key: 'other', label: 'Other' },
] as const;

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [headline, setHeadline] = useState('');
  const [building, setBuilding] = useState('');
  const [builderType, setBuilderType] = useState<string>('');
  const [currentBuilderId, setCurrentBuilderId] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Step 2 fields
  const [tools, setTools] = useState<string[]>([]);

  // Check auth + redirect if profile already complete
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      let { data: builder } = await supabase
        .from('builders')
        .select('id, slug, building, display_name, headline, builder_type, skills, tool_stack')
        .eq('user_id', user.id)
        .single();

      if (!builder) {
        const { data: legacyBuilder } = await supabase
          .from('builders')
          .select('id, slug, building, display_name, headline, builder_type, skills')
          .eq('user_id', user.id)
          .single();
        builder = legacyBuilder ? { ...legacyBuilder, tool_stack: null } : null;
      }

      if (builder?.building) {
        router.replace(`/${builder.slug}`);
        return;
      }
      setCurrentBuilderId(builder?.id ?? null);
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '';
      setDisplayName(builder?.display_name || name);
      setHeadline(builder?.headline || '');
      setBuilderType(builder?.builder_type || '');
      setTools(builder?.tool_stack || builder?.skills || []);
      if (builder?.slug) {
        setSlug(builder.slug);
        setSlugStatus('available');
      } else if (name) {
        setSlug(slugify(name));
      }
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate slug from displayName unless manually edited
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
          .select('id, slug')
          .eq('slug', value)
          .maybeSingle();
        setSlugStatus(data && data.id !== currentBuilderId ? 'taken' : 'available');
      } catch {
        setSlugStatus('error');
      }
    },
    [currentBuilderId, supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug) checkSlug(slug);
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  function handleStep1Next(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || !slug.trim()) return;
    if (slugStatus === 'taken' || slugStatus === 'checking') return;
    setStep(2);
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/auth/login'); return; }

    const payload = {
      user_id: user.id,
      display_name: displayName.trim(),
      slug: slug.trim(),
      headline: headline.trim() || null,
      building: building.trim() || null,
      builder_type: builderType || null,
      skills: tools,
      tool_stack: tools,
    };

    let { error: upsertError } = await supabase
      .from('builders')
      .upsert(payload, { onConflict: 'user_id' });

    if (upsertError && upsertError.message.toLowerCase().includes('tool_stack')) {
      const { tool_stack: _toolStack, ...legacyPayload } = payload;
      const retry = await supabase
        .from('builders')
        .upsert(legacyPayload, { onConflict: 'user_id' });
      upsertError = retry.error;
    }

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }
    router.push(`/${slug.trim()}?welcome=1`);
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
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-[#534AB7]' : 'bg-white/20'}`} />
        <div className="h-px w-8 bg-white/10" />
        <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-[#534AB7]' : 'bg-white/20'}`} />
      </div>

      {step === 1 && (
        <>
          <header className="mb-10">
            <h1 className="text-2xl font-semibold text-white mb-2">Set up your profile</h1>
            <p className="text-white/50 text-sm">Your public page on OPCEO.</p>
          </header>

          <form onSubmit={handleStep1Next} className="flex flex-col gap-6">
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

            {/* Headline */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="headline" className="text-sm text-white/70 font-medium flex items-center justify-between">
                <span>Headline</span>
                <span className="text-white/30 text-xs font-normal">{headline.length}/80</span>
              </label>
              <input
                id="headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value.slice(0, 80))}
                className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
                placeholder="e.g. Building AI tools for cross-border teams"
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
            </div>

            {/* Builder type */}
            <div className="flex flex-col gap-2">
              <span className="text-sm text-white/70 font-medium">I am a…</span>
              <div className="flex flex-wrap gap-2">
                {BUILDER_TYPES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBuilderType(builderType === key ? '' : key)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      builderType === key
                        ? 'bg-[#534AB7] border-[#534AB7] text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={slugStatus === 'taken' || slugStatus === 'checking' || !displayName.trim() || !slug.trim()}
              className="mt-2 px-5 py-3 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
            >
              Next: Your tools →
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <header className="mb-10">
            <h1 className="text-2xl font-semibold text-white mb-2">Your tool stack</h1>
            <p className="text-white/50 text-sm">
              What tools do you build with? Helps others find you by stack.
            </p>
          </header>

          <form onSubmit={handleFinalSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-white/70 font-medium">Tools &amp; technologies</span>
              <ToolStackInput value={tools} onChange={setTools} maxItems={12} />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 border border-white/10 text-white/50 text-sm rounded-md hover:text-white/80 hover:border-white/20 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-5 py-3 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
              >
                {saving ? 'Saving…' : 'Launch my profile →'}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
