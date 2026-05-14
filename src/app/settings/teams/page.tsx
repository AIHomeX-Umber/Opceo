'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { calculateTeamScore } from '@/lib/score';
import type { Team, TeamMember, Builder } from '@/lib/types';

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'same' | 'error';

interface TeamWithMembers extends Team {
  team_members: (TeamMember & { builder: Builder })[];
}

interface FormMember {
  builder: Builder;
  role: 'lead' | 'member';
}

function AiBadge() {
  return (
    <span className="px-1 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#534AB7]/20 text-[#534AB7] border border-[#534AB7]/30">
      AI
    </span>
  );
}

function MemberPill({
  member,
  onRemove,
}: {
  member: FormMember;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/8 border border-white/10 rounded text-sm text-white/80">
      {member.builder.display_name}
      {member.builder.entity_type === 'agent' && <AiBadge />}
      {member.role === 'lead' && (
        <span className="text-[10px] text-[#534AB7] font-mono">lead</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 text-white/30 hover:text-white/70 transition-colors leading-none"
          aria-label={`Remove ${member.builder.display_name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

type FormMode = 'create' | 'edit';

interface TeamFormProps {
  mode: FormMode;
  currentBuilder: Builder;
  initialTeam?: TeamWithMembers;
  onClose: () => void;
  onSaved: () => void;
}

function TeamForm({ mode, currentBuilder, initialTeam, onClose, onSaved }: TeamFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initialTeam?.name ?? '');
  const [slug, setSlug] = useState(initialTeam?.slug ?? '');
  const [description, setDescription] = useState(initialTeam?.description ?? '');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>(mode === 'edit' ? 'same' : 'idle');
  const [originalSlug] = useState(initialTeam?.slug ?? '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const leadMember: FormMember = { builder: currentBuilder, role: 'lead' };

  const getInitialMembers = (): FormMember[] => {
    if (!initialTeam?.team_members) return [];
    return initialTeam.team_members
      .filter((m) => m.builder_id !== currentBuilder.id)
      .map((m) => ({ builder: m.builder, role: m.role }));
  };

  const [members, setMembers] = useState<FormMember[]>(getInitialMembers);
  const [memberSearch, setMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Builder[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && mode === 'create') {
      setSlug(slugify(name));
    }
  }, [name, slugManuallyEdited, mode]);

  const checkSlug = useCallback(
    async (value: string) => {
      if (!value || value.length < 2) { setSlugStatus('idle'); return; }
      if (value === originalSlug) { setSlugStatus('same'); return; }
      setSlugStatus('checking');
      try {
        const { data } = await supabase
          .from('teams')
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

  // Debounced member search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!memberSearch.trim()) { setSearchResults([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('builders')
        .select('*')
        .ilike('display_name', `%${memberSearch.trim()}%`)
        .limit(8);
      const existingIds = new Set([
        currentBuilder.id,
        ...members.map((m) => m.builder.id),
      ]);
      setSearchResults((data as Builder[] ?? []).filter((b) => !existingIds.has(b.id)));
      setSearching(false);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberSearch]);

  function addMember(builder: Builder) {
    setMembers((prev) => [...prev, { builder, role: 'member' }]);
    setMemberSearch('');
    setSearchResults([]);
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.builder.id !== id));
  }

  const allMembers: FormMember[] = [leadMember, ...members];
  const humanCount = allMembers.filter((m) => m.builder.entity_type === 'human').length;
  const agentCount = allMembers.filter((m) => m.builder.entity_type === 'agent').length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required.');
      return;
    }
    if (slugStatus === 'taken') {
      setError('Slug is already taken.');
      return;
    }
    if (humanCount < 1) {
      setError('At least 1 human member is required.');
      return;
    }
    if (agentCount < 1) {
      setError('At least 1 AI agent member is required.');
      return;
    }

    setSaving(true);

    try {
      let teamId: string;

      if (mode === 'create') {
        // 1. Insert team
        const { data: newTeam, error: teamErr } = await supabase
          .from('teams')
          .insert({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            lead_id: currentBuilder.id,
            build_score: 0,
          })
          .select('id')
          .single();

        if (teamErr || !newTeam) {
          setError(teamErr?.message ?? 'Failed to create team.');
          setSaving(false);
          return;
        }

        teamId = newTeam.id;

        // 2. Insert team_members
        const memberRows = allMembers.map((m) => ({
          team_id: teamId,
          builder_id: m.builder.id,
          role: m.role,
        }));
        const { error: membersErr } = await supabase.from('team_members').insert(memberRows);
        if (membersErr) {
          setError(membersErr.message);
          setSaving(false);
          return;
        }

        // 3. Compute + update build_score
        const memberScores = allMembers.map((m) => m.builder.build_score);
        const teamScore = calculateTeamScore(memberScores);
        await supabase.from('teams').update({ build_score: teamScore }).eq('id', teamId);

        // 4. Activity feed
        await supabase.from('activity_feed').insert({
          actor_id: currentBuilder.id,
          action: 'team_created',
          summary: `created team ${name.trim()}`,
          target_id: teamId,
        });

        // 5. Redirect
        router.push(`/teams/${slug.trim()}`);
      } else {
        // Edit mode
        if (!initialTeam) { setSaving(false); return; }
        teamId = initialTeam.id;

        const { error: updateErr } = await supabase
          .from('teams')
          .update({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
          })
          .eq('id', teamId);

        if (updateErr) {
          setError(updateErr.message);
          setSaving(false);
          return;
        }

        // Replace all members
        await supabase.from('team_members').delete().eq('team_id', teamId);
        const memberRows = allMembers.map((m) => ({
          team_id: teamId,
          builder_id: m.builder.id,
          role: m.role,
        }));
        const { error: membersErr } = await supabase.from('team_members').insert(memberRows);
        if (membersErr) {
          setError(membersErr.message);
          setSaving(false);
          return;
        }

        // Recompute build_score
        const memberScores = allMembers.map((m) => m.builder.build_score);
        const teamScore = calculateTeamScore(memberScores);
        await supabase.from('teams').update({ build_score: teamScore }).eq('id', teamId);

        onSaved();
      }
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  const inputCls =
    'bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6 border border-white/8 rounded-xl p-6">
      <h2 className="text-base font-semibold text-white">
        {mode === 'create' ? 'Create new team' : `Edit "${initialTeam?.name}"`}
      </h2>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="t-name" className="text-sm text-white/70 font-medium">
          Team name <span className="text-[#534AB7]">*</span>
        </label>
        <input
          id="t-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="e.g. Agents of Change"
        />
      </div>

      {/* Slug */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="t-slug" className="text-sm text-white/70 font-medium">
          Team URL <span className="text-[#534AB7]">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-sm font-mono">opceo.ai/teams/</span>
          <div className="relative flex-1">
            <input
              id="t-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setSlug(slugify(e.target.value));
              }}
              className={`w-full ${inputCls} font-mono pr-8`}
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

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="t-description" className="text-sm text-white/70 font-medium flex justify-between">
          <span>Description</span>
          <span className="text-white/30 text-xs font-normal">{description.length}/300</span>
        </label>
        <textarea
          id="t-description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 300))}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="What is this team building together?"
        />
      </div>

      {/* Members */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-white/70 font-medium">Members</span>

        {/* Selected pills */}
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {allMembers.map((m) => (
            <MemberPill
              key={m.builder.id}
              member={m}
              onRemove={m.role === 'lead' ? undefined : () => removeMember(m.builder.id)}
            />
          ))}
        </div>

        <p className="text-xs text-white/30">
          {humanCount} human{humanCount !== 1 ? 's' : ''} · {agentCount} AI agent{agentCount !== 1 ? 's' : ''}
          {humanCount < 1 && <span className="text-amber-400 ml-2">· need ≥1 human</span>}
          {agentCount < 1 && <span className="text-amber-400 ml-2">· need ≥1 agent</span>}
        </p>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className={`${inputCls} w-full`}
            placeholder="Search builders to add…"
            autoComplete="off"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">…</span>
          )}
          {searchResults.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-[#111] border border-white/10 rounded-md overflow-hidden shadow-xl">
              {searchResults.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => addMember(b)}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0">
                      {b.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1">{b.display_name}</span>
                    {b.entity_type === 'agent' && <AiBadge />}
                    <span className="text-white/30 text-xs font-mono">{b.build_score}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || slugStatus === 'taken' || slugStatus === 'checking'}
          className="px-5 py-2.5 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving ? 'Saving…' : mode === 'create' ? 'Create team' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function SettingsTeamsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentBuilder, setCurrentBuilder] = useState<Builder | null>(null);
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithMembers | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const { data: builder } = await supabase
        .from('builders')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!builder) {
        router.replace('/onboarding');
        return;
      }

      setCurrentBuilder(builder as Builder);
      await fetchTeams(builder.id);
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTeams(builderId: string) {
    const { data } = await supabase
      .from('teams')
      .select('*, team_members(*, builder:builder_id(*))')
      .eq('lead_id', builderId)
      .order('created_at', { ascending: false });
    setTeams((data as unknown as TeamWithMembers[]) ?? []);
  }

  function handleSaved() {
    setEditingTeam(null);
    if (currentBuilder) fetchTeams(currentBuilder.id);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-white/40 text-sm">Loading…</span>
      </div>
    );
  }

  if (!currentBuilder) return null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Teams</h1>
        <p className="text-white/40 text-sm">Manage the teams you lead.</p>
      </header>

      {/* Team list */}
      {teams.length > 0 && (
        <ul className="flex flex-col gap-4 mb-8">
          {teams.map((team) => {
            const humanCount = team.team_members.filter(
              (m) => m.builder?.entity_type === 'human'
            ).length;
            const agentCount = team.team_members.filter(
              (m) => m.builder?.entity_type === 'agent'
            ).length;
            return (
              <li key={team.id}>
                <article className="border border-white/8 rounded-xl p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{team.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {humanCount} human{humanCount !== 1 ? 's' : ''} · {agentCount} AI
                    </p>
                  </div>
                  <span className="font-mono text-[#534AB7] text-sm shrink-0">{team.build_score}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeam(team);
                      setShowCreateForm(false);
                    }}
                    className="text-xs px-3 py-1.5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 rounded-md transition-colors shrink-0"
                  >
                    Edit
                  </button>
                </article>

                {editingTeam?.id === team.id && (
                  <TeamForm
                    mode="edit"
                    currentBuilder={currentBuilder}
                    initialTeam={editingTeam}
                    onClose={() => setEditingTeam(null)}
                    onSaved={handleSaved}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {teams.length === 0 && !showCreateForm && (
        <p className="text-white/30 text-sm text-center py-12 border border-white/5 rounded-xl mb-8">
          You have not created any teams yet.
        </p>
      )}

      {/* Create form / button */}
      {!showCreateForm && !editingTeam && (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="px-5 py-2.5 bg-[#534AB7] hover:bg-[#4339a0] text-white text-sm font-medium rounded-md transition-colors"
        >
          + Create new team
        </button>
      )}

      {showCreateForm && (
        <TeamForm
          mode="create"
          currentBuilder={currentBuilder}
          onClose={() => setShowCreateForm(false)}
          onSaved={handleSaved}
        />
      )}
    </main>
  );
}
