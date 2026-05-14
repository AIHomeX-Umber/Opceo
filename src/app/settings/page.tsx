'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Builder, ConnectRequest } from '@/lib/types';

const SKILL_OPTIONS = [
  'AI', 'Cross-border', 'React', 'Design', 'Marketing',
  'Content', 'Ops', 'Research', 'Dev', 'Product',
];

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'same' | 'error';
type Tab = 'profile' | 'requests';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('profile');

  // Profile fields
  const [originalSlug, setOriginalSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [building, setBuilding] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [linkX, setLinkX] = useState('');
  const [linkGithub, setLinkGithub] = useState('');
  const [linkWebsite, setLinkWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [builderId, setBuilderId] = useState<string | null>(null);

  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Connect requests
  const [requests, setRequests] = useState<(ConnectRequest & { from: Pick<Builder, 'slug' | 'display_name' | 'avatar_url' | 'building'> })[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      const { data: builder } = await supabase
        .from('builders')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!builder) { router.replace('/onboarding'); return; }

      setBuilderId(builder.id);
      setOriginalSlug(builder.slug);
      setDisplayName(builder.display_name);
      setSlug(builder.slug);
      setBio(builder.bio || '');
      setBuilding(builder.building || '');
      setSkills(builder.skills || []);
      setLinkX(builder.links?.x || '');
      setLinkGithub(builder.links?.github || '');
      setLinkWebsite(builder.links?.website || '');
      setAvatarUrl(builder.avatar_url || null);
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch connect requests when tab switches
  useEffect(() => {
    if (tab !== 'requests' || !builderId) return;
    async function fetchRequests() {
      if (!builderId) return;
      setRequestsLoading(true);
      const { data } = await supabase
        .from('connect_requests')
        .select('*, from:from_id(slug, display_name, avatar_url, building)')
        .eq('to_id', builderId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      setRequests((data as unknown as (ConnectRequest & { from: Pick<Builder, 'slug' | 'display_name' | 'avatar_url' | 'building'> })[]) || []);
      setRequestsLoading(false);
    }
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, builderId]);

  const checkSlug = useCallback(
    async (value: string) => {
      if (!value || value.length < 2) { setSlugStatus('idle'); return; }
      if (value === originalSlug) { setSlugStatus('same'); return; }
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
    [supabase, originalSlug]
  );

  useEffect(() => {
    const timer = setTimeout(() => { if (slug) checkSlug(slug); }, 400);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  // Auto-slug from display name if not manually edited
  useEffect(() => {
    if (!slugManuallyEdited) return;
  }, [slugManuallyEdited]);

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !builderId) return;
    setAvatarUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${builderId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setError('Avatar upload failed: ' + uploadError.message);
      setAvatarUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(urlData.publicUrl);
    setAvatarUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || !slug.trim()) return;
    if (slugStatus === 'taken') return;
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    const { error: updateError } = await supabase
      .from('builders')
      .update({
        display_name: displayName.trim(),
        slug: slug.trim(),
        bio: bio.trim() || null,
        building: building.trim() || null,
        skills,
        links: {
          x: linkX.trim() || undefined,
          github: linkGithub.trim() || undefined,
          website: linkWebsite.trim() || undefined,
        },
        avatar_url: avatarUrl,
      })
      .eq('id', builderId!);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    setOriginalSlug(slug.trim());
    setSlugStatus('same');
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  async function handleRequestAction(requestId: string, action: 'accepted' | 'declined') {
    await supabase
      .from('connect_requests')
      .update({ status: action })
      .eq('id', requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-white/40 text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Manage your builder profile and incoming requests.</p>
      </header>

      {/* Tabs */}
      <nav className="flex gap-1 border-b border-white/8 mb-8" aria-label="Settings tabs">
        {(['profile', 'requests'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-[#534AB7] text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'requests' ? 'Connect Requests' : 'Profile'}
          </button>
        ))}
      </nav>

      {tab === 'profile' && (
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Your avatar"
                  width={72}
                  height={72}
                  className="rounded-full object-cover w-[72px] h-[72px]"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full bg-[#534AB7]/20 border border-[#534AB7]/30 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-[#534AB7]">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <span className="text-white/60 text-xs">…</span>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-sm text-[#534AB7] hover:text-[#6a62cc] transition-colors disabled:opacity-40"
              >
                {avatarUploading ? 'Uploading…' : 'Change avatar'}
              </button>
              <p className="text-white/25 text-xs mt-0.5">JPG, PNG, WebP · max 2 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
              aria-label="Upload avatar"
            />
          </div>

          {/* Display Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-display_name" className="text-sm text-white/70 font-medium">
              Display name <span className="text-[#534AB7]">*</span>
            </label>
            <input
              id="s-display_name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-slug" className="text-sm text-white/70 font-medium">
              Profile URL <span className="text-[#534AB7]">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-sm font-mono">opceo.ai/</span>
              <div className="relative flex-1">
                <input
                  id="s-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm font-mono placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors pr-8"
                />
                {slugStatus === 'checking' && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">…</span>
                )}
                {(slugStatus === 'available' || slugStatus === 'same') && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 text-xs">✓</span>
                )}
                {slugStatus === 'taken' && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400 text-xs">✗</span>
                )}
              </div>
            </div>
            {slugStatus === 'taken' && (
              <p className="text-red-400 text-xs">Already taken — try another</p>
            )}
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-bio" className="text-sm text-white/70 font-medium flex justify-between">
              <span>Bio</span>
              <span className="text-white/30 text-xs font-normal">{bio.length}/160</span>
            </label>
            <textarea
              id="s-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              rows={3}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
            />
          </div>

          {/* Building */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-building" className="text-sm text-white/70 font-medium">
              Currently building
            </label>
            <input
              id="s-building"
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
              placeholder="e.g. An AI tool for cross-border sellers"
            />
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

          {/* Links */}
          <fieldset className="flex flex-col gap-3 border-0 p-0">
            <legend className="text-sm text-white/70 font-medium mb-1">Links</legend>
            <div className="flex items-center gap-2">
              <span className="w-16 text-xs text-white/30">X</span>
              <input
                type="text"
                value={linkX}
                onChange={(e) => setLinkX(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
                placeholder="@handle"
                aria-label="X (Twitter) handle"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-xs text-white/30">GitHub</span>
              <input
                type="text"
                value={linkGithub}
                onChange={(e) => setLinkGithub(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
                placeholder="@username"
                aria-label="GitHub username"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-xs text-white/30">Website</span>
              <input
                type="url"
                value={linkWebsite}
                onChange={(e) => setLinkWebsite(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
                placeholder="https://yoursite.com"
                aria-label="Personal website URL"
              />
            </div>
          </fieldset>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || slugStatus === 'taken' || slugStatus === 'checking'}
              className="px-5 py-2.5 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saveSuccess && (
              <span className="text-green-400 text-sm">Saved ✓</span>
            )}
          </div>
        </form>
      )}

      {tab === 'requests' && (
        <section aria-labelledby="requests-heading">
          <h2 id="requests-heading" className="sr-only">Connect Requests</h2>
          {requestsLoading ? (
            <p className="text-white/30 text-sm text-center py-16">Loading…</p>
          ) : requests.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-16">No pending connect requests.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {requests.map((req) => (
                <li key={req.id}>
                  <article className="border border-white/8 rounded-xl p-5">
                    <header className="flex items-start gap-3 mb-3">
                      {req.from?.avatar_url ? (
                        <Image
                          src={req.from.avatar_url}
                          alt={`${req.from.display_name}'s avatar`}
                          width={40}
                          height={40}
                          className="rounded-full object-cover w-10 h-10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
                          <span className="text-white/40 text-sm font-medium">
                            {req.from?.display_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">{req.from?.display_name}</p>
                        {req.from?.building && (
                          <p className="text-white/40 text-xs mt-0.5">Building: {req.from.building}</p>
                        )}
                      </div>
                    </header>
                    <blockquote className="text-white/60 text-sm leading-relaxed border-l-2 border-white/10 pl-3 mb-4">
                      {req.context}
                    </blockquote>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestAction(req.id, 'accepted')}
                        className="px-3 py-1.5 text-xs font-medium bg-[#534AB7] hover:bg-[#4339a0] text-white rounded-md transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(req.id, 'declined')}
                        className="px-3 py-1.5 text-xs font-medium border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 rounded-md transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
