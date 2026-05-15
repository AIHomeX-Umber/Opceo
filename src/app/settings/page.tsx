'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Globe, Mail, X as XIcon, Rss, ExternalLink,
  Rocket, Code, Code2, BookOpen, Briefcase, Heart, Music, Camera,
  PenTool, ShoppingBag, Mic, Newspaper, Video, Hash,
  Link as LinkIcon, type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Builder, ConnectRequest, FeaturedLink, ShowcaseItem } from '@/lib/types';

const SKILL_OPTIONS = [
  'AI', 'Cross-border', 'React', 'Design', 'Marketing',
  'Content', 'Ops', 'Research', 'Dev', 'Product',
];

interface IconOption { name: string; Icon: LucideIcon }
const FEATURED_ICONS: IconOption[] = [
  { name: 'globe', Icon: Globe },
  { name: 'mail', Icon: Mail },
  { name: 'github', Icon: Code2 },
  { name: 'twitter', Icon: XIcon },
  { name: 'youtube', Icon: Rss },
  { name: 'linkedin', Icon: ExternalLink },
  { name: 'instagram', Icon: Camera },
  { name: 'rocket', Icon: Rocket },
  { name: 'code', Icon: Code },
  { name: 'book-open', Icon: BookOpen },
  { name: 'briefcase', Icon: Briefcase },
  { name: 'heart', Icon: Heart },
  { name: 'music', Icon: Music },
  { name: 'camera', Icon: Hash },
  { name: 'pen-tool', Icon: PenTool },
  { name: 'shopping-bag', Icon: ShoppingBag },
  { name: 'mic', Icon: Mic },
  { name: 'newspaper', Icon: Newspaper },
  { name: 'video', Icon: Video },
  { name: 'link', Icon: LinkIcon },
];

function getIconComponent(name: string): LucideIcon {
  return FEATURED_ICONS.find((i) => i.name === name)?.Icon ?? LinkIcon;
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'same' | 'error';
type Tab = 'profile' | 'requests';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const showcaseInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('profile');

  // Basic info
  const [builderId, setBuilderId] = useState<string | null>(null);
  const [originalSlug, setOriginalSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Current project
  const [building, setBuilding] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Featured links
  const [featuredLinks, setFeaturedLinks] = useState<FeaturedLink[]>([]);
  const [openIconPickerIndex, setOpenIconPickerIndex] = useState<number | null>(null);

  // Showcase
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [showcaseUploading, setShowcaseUploading] = useState<number | null>(null);

  // Social links
  const [linkX, setLinkX] = useState('');
  const [linkGithub, setLinkGithub] = useState('');
  const [linkWebsite, setLinkWebsite] = useState('');
  const [linkWechat, setLinkWechat] = useState('');

  // Slug check
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

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
      setHeadline(builder.headline || '');
      setBio(builder.bio || '');
      setBuilding(builder.building || '');
      setSkills(builder.skills || []);
      setAvatarUrl(builder.avatar_url || null);
      setCoverUrl(builder.cover_url || null);
      setFeaturedLinks(builder.featured_links || []);
      setShowcaseItems(builder.showcase || []);
      setLinkX(builder.links?.x || '');
      setLinkGithub(builder.links?.github || '');
      setLinkWebsite(builder.links?.website || '');
      setLinkWechat(builder.links?.wechat || '');
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const { data } = await supabase.from('builders').select('slug').eq('slug', value).maybeSingle();
        setSlugStatus(data ? 'taken' : 'available');
      } catch { setSlugStatus('error'); }
    },
    [supabase, originalSlug]
  );

  useEffect(() => {
    const timer = setTimeout(() => { if (slug) checkSlug(slug); }, 400);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  useEffect(() => { void slugManuallyEdited; }, [slugManuallyEdited]);

  function toggleSkill(skill: string) {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  }

  // ── Avatar upload ──────────────────────────────────────────────────────────
  async function uploadAvatar(file: File) {
    if (!builderId) return;
    const ext = file.name.split('.').pop();
    const path = `${builderId}.${ext}`;
    setAvatarUploading(true);
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) { setError('Avatar upload failed: ' + uploadError.message); setAvatarUploading(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(urlData.publicUrl);
    setAvatarUploading(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  }

  function handleAvatarDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAvatar(file);
  }

  // ── Cover upload ───────────────────────────────────────────────────────────
  async function uploadCover(file: File) {
    if (!builderId) return;
    if (file.size > 5 * 1024 * 1024) { setError('Cover image must be under 5 MB.'); return; }
    const ext = file.name.split('.').pop();
    const path = `covers/${builderId}.${ext}`;
    setCoverUploading(true);
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) { setError('Cover upload failed: ' + uploadError.message); setCoverUploading(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    setCoverUrl(urlData.publicUrl);
    setCoverUploading(false);
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadCover(file);
  }

  function handleCoverDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadCover(file);
  }

  // ── Showcase image upload ──────────────────────────────────────────────────
  async function uploadShowcaseImage(file: File, index: number) {
    if (!builderId) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }
    const ext = file.name.split('.').pop();
    const path = `showcase/${builderId}/${index}.${ext}`;
    setShowcaseUploading(index);
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) { setError('Image upload failed: ' + uploadError.message); setShowcaseUploading(null); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    setShowcaseItems((prev) => prev.map((item, i) => i === index ? { ...item, image_url: urlData.publicUrl } : item));
    setShowcaseUploading(null);
  }

  // ── Featured links helpers ─────────────────────────────────────────────────
  function addFeaturedLink() {
    if (featuredLinks.length >= 6) return;
    setFeaturedLinks((prev) => [...prev, { title: '', url: '', icon: 'globe' }]);
  }

  function removeFeaturedLink(index: number) {
    setFeaturedLinks((prev) => prev.filter((_, i) => i !== index));
    if (openIconPickerIndex === index) setOpenIconPickerIndex(null);
  }

  function updateFeaturedLink(index: number, patch: Partial<FeaturedLink>) {
    setFeaturedLinks((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  function moveFeaturedLink(index: number, dir: -1 | 1) {
    setFeaturedLinks((prev) => {
      const next = [...prev];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  }

  // ── Showcase helpers ───────────────────────────────────────────────────────
  function addShowcaseItem() {
    if (showcaseItems.length >= 4) return;
    setShowcaseItems((prev) => [...prev, { title: '', description: '', url: '', image_url: null }]);
  }

  function removeShowcaseItem(index: number) {
    setShowcaseItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateShowcaseItem(index: number, patch: Partial<ShowcaseItem>) {
    setShowcaseItems((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  function moveShowcaseItem(index: number, dir: -1 | 1) {
    setShowcaseItems((prev) => {
      const next = [...prev];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  }

  // ── Save ───────────────────────────────────────────────────────────────────
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
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        building: building.trim() || null,
        skills,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        featured_links: featuredLinks,
        showcase: showcaseItems,
        links: {
          x: linkX.trim() || undefined,
          github: linkGithub.trim() || undefined,
          website: linkWebsite.trim() || undefined,
          wechat: linkWechat.trim() || undefined,
        },
      })
      .eq('id', builderId!);

    if (updateError) { setError(updateError.message); setSaving(false); return; }
    setOriginalSlug(slug.trim());
    setSlugStatus('same');
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  async function handleRequestAction(requestId: string, action: 'accepted' | 'declined') {
    await supabase.from('connect_requests').update({ status: action }).eq('id', requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-white/40 text-sm">Loading…</span>
      </div>
    );
  }

  const inputCls = 'bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors';
  const labelCls = 'text-sm text-white/70 font-medium';
  const sectionHeadingCls = 'text-xs font-semibold text-white/40 uppercase tracking-widest mb-4';

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
              tab === t ? 'border-[#534AB7] text-white' : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'requests' ? 'Connect Requests' : 'Profile'}
          </button>
        ))}
      </nav>

      {/* ── PROFILE TAB ─────────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <form onSubmit={handleSave} className="flex flex-col gap-8">

          {/* ── SECTION 1: Basic Info ────────────────────────────────────── */}
          <section>
            <h2 className={sectionHeadingCls}>Basic Info</h2>

            {/* Cover image */}
            <div className="flex flex-col gap-1.5 mb-5">
              <span className={labelCls}>Cover image</span>
              {coverUrl ? (
                <div className="relative w-full aspect-[16/5] rounded-md overflow-hidden bg-white/5">
                  <Image src={coverUrl} alt="Cover" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => setCoverUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition-colors text-sm leading-none"
                    aria-label="Remove cover image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full aspect-[16/5] rounded-md border border-dashed border-white/15 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#534AB7]/50 hover:bg-white/[0.02] transition-colors"
                  onClick={() => coverInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && coverInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCoverDrop}
                >
                  {coverUploading ? (
                    <span className="text-white/30 text-xs">Uploading…</span>
                  ) : (
                    <>
                      <span className="text-white/30 text-xs">Add cover image</span>
                      <span className="text-white/20 text-[10px]">JPG PNG WebP · max 5 MB · drag or click</span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverChange}
                aria-label="Upload cover image"
              />
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div
                role="button"
                tabIndex={0}
                className="relative cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleAvatarDrop}
                onClick={() => avatarInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && avatarInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Your avatar" width={72} height={72} className="rounded-full object-cover w-[72px] h-[72px]" />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-full bg-[#534AB7]/20 border border-[#534AB7]/30 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-[#534AB7]">{displayName.charAt(0).toUpperCase()}</span>
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
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="text-sm text-[#534AB7] hover:text-[#6a62cc] transition-colors disabled:opacity-40"
                >
                  {avatarUploading ? 'Uploading…' : 'Change avatar'}
                </button>
                <p className="text-white/25 text-xs mt-0.5">JPG, PNG, WebP · max 2 MB · drag or click</p>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} aria-label="Upload avatar" />
            </div>

            {/* Display name */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="s-display_name" className={labelCls}>
                Display name <span className="text-[#534AB7]">*</span>
              </label>
              <input id="s-display_name" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="s-slug" className={labelCls}>
                Profile URL <span className="text-[#534AB7]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-sm font-mono shrink-0">opceo.ai/</span>
                <div className="relative flex-1">
                  <input
                    id="s-slug"
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => { setSlugManuallyEdited(true); setSlug(slugify(e.target.value)); }}
                    className={`${inputCls} w-full font-mono pr-8`}
                  />
                  {slugStatus === 'checking' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">…</span>}
                  {(slugStatus === 'available' || slugStatus === 'same') && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 text-xs">✓</span>}
                  {slugStatus === 'taken' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400 text-xs">✗</span>}
                </div>
              </div>
              {slugStatus === 'taken' && <p className="text-red-400 text-xs">Already taken — try another</p>}
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="s-headline" className={`${labelCls} flex justify-between`}>
                <span>Headline</span>
                <span className="text-white/30 text-xs font-normal">{headline.length}/80</span>
              </label>
              <input
                id="s-headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value.slice(0, 80))}
                placeholder="One sentence about who you are and what you're building."
                className={inputCls}
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="s-bio" className={`${labelCls} flex justify-between`}>
                <span>Bio</span>
                <span className="text-white/30 text-xs font-normal">{bio.length}/160</span>
              </label>
              <textarea
                id="s-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </section>

          <div className="border-t border-white/8" />

          {/* ── SECTION 2: Current Project ───────────────────────────────── */}
          <section>
            <h2 className={sectionHeadingCls}>Current Project</h2>

            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="s-building" className={labelCls}>Currently building</label>
              <input
                id="s-building"
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. An AI tool for cross-border sellers"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className={labelCls}>Skills</span>
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
          </section>

          <div className="border-t border-white/8" />

          {/* ── SECTION 3: Featured Links ─────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Featured Links</h2>
              <span className="text-xs text-white/30 font-mono">{featuredLinks.length}/6</span>
            </div>

            <div className="flex flex-col gap-3">
              {featuredLinks.map((link, i) => {
                const CurrentIcon = getIconComponent(link.icon);
                return (
                  <div key={i} className="border border-white/8 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      {/* Icon picker */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setOpenIconPickerIndex(openIconPickerIndex === i ? null : i)}
                          className="w-9 h-9 rounded-md border border-white/10 bg-white/5 flex items-center justify-center hover:border-white/25 transition-colors"
                          aria-label="Pick icon"
                        >
                          <CurrentIcon size={16} className="text-white/60" />
                        </button>
                        {openIconPickerIndex === i && (
                          <div className="absolute left-0 top-full mt-1 z-20 bg-[#111] border border-white/15 rounded-lg p-2 shadow-xl grid grid-cols-5 gap-1 w-52">
                            {FEATURED_ICONS.map(({ name, Icon }) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => { updateFeaturedLink(i, { icon: name }); setOpenIconPickerIndex(null); }}
                                className={`w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors ${link.icon === name ? 'bg-[#534AB7]/30 text-[#a49ef5]' : 'text-white/50'}`}
                                aria-label={name}
                              >
                                <Icon size={14} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Title + URL */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateFeaturedLink(i, { title: e.target.value })}
                          placeholder="Title"
                          className={`${inputCls} py-2`}
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateFeaturedLink(i, { url: e.target.value })}
                          placeholder="https://…"
                          className={`${inputCls} py-2`}
                        />
                      </div>

                      {/* Reorder + remove */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button type="button" onClick={() => moveFeaturedLink(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-md border border-white/8 flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors text-xs" aria-label="Move up">↑</button>
                        <button type="button" onClick={() => moveFeaturedLink(i, 1)} disabled={i === featuredLinks.length - 1} className="w-7 h-7 rounded-md border border-white/8 flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors text-xs" aria-label="Move down">↓</button>
                        <button type="button" onClick={() => removeFeaturedLink(i)} className="w-7 h-7 rounded-md border border-white/8 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors text-xs" aria-label="Remove">×</button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addFeaturedLink}
                disabled={featuredLinks.length >= 6}
                className="w-full py-2.5 border border-dashed border-white/15 rounded-lg text-sm text-white/40 hover:border-[#534AB7]/50 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                + Add link
              </button>
            </div>
          </section>

          <div className="border-t border-white/8" />

          {/* ── SECTION 4: Showcase ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Showcase</h2>
              <span className="text-xs text-white/30 font-mono">{showcaseItems.length}/4</span>
            </div>

            <div className="flex flex-col gap-3">
              {showcaseItems.map((item, i) => (
                <div key={i} className="border border-white/8 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    {/* Image thumbnail */}
                    <div className="shrink-0">
                      {item.image_url ? (
                        <div className="relative w-20 h-14 rounded overflow-hidden bg-white/5 group cursor-pointer" onClick={() => showcaseInputRefs.current[i]?.click()}>
                          <Image src={item.image_url} alt="" fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updateShowcaseItem(i, { image_url: null }); }}
                              className="text-white/80 text-sm"
                              aria-label="Remove image"
                            >×</button>
                          </div>
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          className="w-20 h-14 rounded border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-[#534AB7]/40 transition-colors"
                          onClick={() => showcaseInputRefs.current[i]?.click()}
                          onKeyDown={(e) => e.key === 'Enter' && showcaseInputRefs.current[i]?.click()}
                        >
                          {showcaseUploading === i ? (
                            <span className="text-white/30 text-[9px]">…</span>
                          ) : (
                            <span className="text-white/25 text-[9px] text-center leading-tight px-1">Add image</span>
                          )}
                        </div>
                      )}
                      <input
                        ref={(el) => { showcaseInputRefs.current[i] = el; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadShowcaseImage(f, i); }}
                        aria-label={`Upload image for showcase item ${i + 1}`}
                      />
                    </div>

                    {/* Fields */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <input type="text" value={item.title} onChange={(e) => updateShowcaseItem(i, { title: e.target.value })} placeholder="Title" className={`${inputCls} py-2`} />
                      <input type="text" value={item.description} onChange={(e) => updateShowcaseItem(i, { description: e.target.value })} placeholder="Short description" className={`${inputCls} py-2`} />
                      <input type="url" value={item.url} onChange={(e) => updateShowcaseItem(i, { url: e.target.value })} placeholder="https://…" className={`${inputCls} py-2`} />
                    </div>

                    {/* Reorder + remove */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" onClick={() => moveShowcaseItem(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-md border border-white/8 flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors text-xs" aria-label="Move up">↑</button>
                      <button type="button" onClick={() => moveShowcaseItem(i, 1)} disabled={i === showcaseItems.length - 1} className="w-7 h-7 rounded-md border border-white/8 flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors text-xs" aria-label="Move down">↓</button>
                      <button type="button" onClick={() => removeShowcaseItem(i)} className="w-7 h-7 rounded-md border border-white/8 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors text-xs" aria-label="Remove">×</button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addShowcaseItem}
                disabled={showcaseItems.length >= 4}
                className="w-full py-2.5 border border-dashed border-white/15 rounded-lg text-sm text-white/40 hover:border-[#534AB7]/50 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                + Add project
              </button>
            </div>
          </section>

          <div className="border-t border-white/8" />

          {/* ── SECTION 5: Social Links ───────────────────────────────────── */}
          <section>
            <h2 className={sectionHeadingCls}>Social Links</h2>
            <fieldset className="flex flex-col gap-3 border-0 p-0">
              <legend className="sr-only">Social links</legend>
              {([
                { id: 's-link-x', label: 'X', value: linkX, onChange: setLinkX, placeholder: '@handle', type: 'text' },
                { id: 's-link-gh', label: 'GitHub', value: linkGithub, onChange: setLinkGithub, placeholder: '@username', type: 'text' },
                { id: 's-link-web', label: 'Website', value: linkWebsite, onChange: setLinkWebsite, placeholder: 'https://yoursite.com', type: 'url' },
                { id: 's-link-wc', label: 'WeChat', value: linkWechat, onChange: setLinkWechat, placeholder: 'WeChat ID', type: 'text' },
              ] as const).map(({ id, label, value, onChange, placeholder, type }) => (
                <div key={id} className="flex items-center gap-2">
                  <span className="w-16 text-xs text-white/30 shrink-0">{label}</span>
                  <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
                    placeholder={placeholder}
                    className={`${inputCls} flex-1`}
                    aria-label={label}
                  />
                </div>
              ))}
            </fieldset>
          </section>

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
            {saveSuccess && <span className="text-green-400 text-sm">Saved ✓</span>}
          </div>
        </form>
      )}

      {/* ── REQUESTS TAB ────────────────────────────────────────────────────── */}
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
                        <Image src={req.from.avatar_url} alt={`${req.from.display_name}'s avatar`} width={40} height={40} className="rounded-full object-cover w-10 h-10 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
                          <span className="text-white/40 text-sm font-medium">{req.from?.display_name?.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">{req.from?.display_name}</p>
                        {req.from?.building && <p className="text-white/40 text-xs mt-0.5">Building: {req.from.building}</p>}
                      </div>
                    </header>
                    <blockquote className="text-white/60 text-sm leading-relaxed border-l-2 border-white/10 pl-3 mb-4">
                      {req.context}
                    </blockquote>
                    <div className="flex gap-2">
                      <button onClick={() => handleRequestAction(req.id, 'accepted')} className="px-3 py-1.5 text-xs font-medium bg-[#534AB7] hover:bg-[#4339a0] text-white rounded-md transition-colors">Accept</button>
                      <button onClick={() => handleRequestAction(req.id, 'declined')} className="px-3 py-1.5 text-xs font-medium border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 rounded-md transition-colors">Decline</button>
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
