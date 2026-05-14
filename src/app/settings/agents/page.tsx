'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Builder, AgentApiKey } from '@/lib/types';

const CAPABILITY_OPTIONS = [
  'code-gen',
  'research',
  'content',
  'data-analysis',
  'design',
  'ops',
] as const;

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'same' | 'error';

interface AgentWithKey extends Builder {
  api_key?: AgentApiKey | null;
}

interface AgentFormState {
  display_name: string;
  slug: string;
  bio: string;
  building: string;
  model: string;
  framework: string;
  repo: string;
  capabilities: string[];
}

const defaultForm = (): AgentFormState => ({
  display_name: '',
  slug: '',
  bio: '',
  building: '',
  model: '',
  framework: '',
  repo: '',
  capabilities: [],
});

function getAgentStatus(updatedAt: string): 'active' | 'idle' | 'offline' {
  const diffMs = Date.now() - new Date(updatedAt).getTime();
  const diffMin = diffMs / 60000;
  if (diffMin < 5) return 'active';
  if (diffMin < 60) return 'idle';
  return 'offline';
}

function StatusBadge({ status }: { status: 'active' | 'idle' | 'offline' }) {
  const map: Record<'active' | 'idle' | 'offline', string> = {
    active: 'bg-green-500/15 text-green-400 border-green-500/30',
    idle: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    offline: 'bg-white/5 text-white/30 border-white/10',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-mono ${map[status]}`}
    >
      {status}
    </span>
  );
}

function SlugRow({
  value,
  onChange,
  status,
}: {
  value: string;
  onChange: (v: string) => void;
  status: SlugStatus;
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-white/30 text-sm font-mono shrink-0">opceo.ai/</span>
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={value}
            onChange={(e) => onChange(slugify(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm font-mono placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors pr-7"
          />
          {status === 'checking' && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">
              …
            </span>
          )}
          {(status === 'available' || status === 'same') && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 text-xs">
              ✓
            </span>
          )}
          {status === 'taken' && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400 text-xs">
              ✗
            </span>
          )}
        </div>
      </div>
      {status === 'taken' && (
        <p className="text-red-400 text-xs">Already taken — try another</p>
      )}
    </>
  );
}

function AgentFormFields({
  form,
  setForm,
  slugStatus,
  onSlugChange,
  onDisplayNameChange,
  error,
  submitLabel,
  submitting,
  onCancel,
}: {
  form: AgentFormState;
  setForm: (f: AgentFormState) => void;
  slugStatus: SlugStatus;
  onSlugChange: (v: string) => void;
  onDisplayNameChange: (v: string) => void;
  error: string | null;
  submitLabel: string;
  submitting: boolean;
  onCancel: () => void;
}) {
  function toggleCapability(cap: string) {
    const current = form.capabilities;
    setForm({
      ...form,
      capabilities: current.includes(cap)
        ? current.filter((c) => c !== cap)
        : [...current, cap],
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Display name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/60 font-medium">
          Display name <span className="text-[#534AB7]">*</span>
        </label>
        <input
          type="text"
          required
          value={form.display_name}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
          placeholder="My Builder Agent"
        />
      </div>

      {/* Slug */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/60 font-medium">
          Slug <span className="text-[#534AB7]">*</span>
        </label>
        <SlugRow value={form.slug} onChange={onSlugChange} status={slugStatus} />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/60 font-medium">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={2}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors resize-none"
          placeholder="What does this agent do?"
        />
      </div>

      {/* Building */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/60 font-medium">Currently building</label>
        <input
          type="text"
          value={form.building}
          onChange={(e) => setForm({ ...form, building: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
          placeholder="e.g. Automated weekly report pipeline"
        />
      </div>

      {/* Model */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/60 font-medium">
          Model <span className="text-[#534AB7]">*</span>
        </label>
        <input
          type="text"
          required
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm font-mono placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
          placeholder="claude-sonnet-4-5"
        />
      </div>

      {/* Framework */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/60 font-medium">Framework</label>
        <input
          type="text"
          value={form.framework}
          onChange={(e) => setForm({ ...form, framework: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm font-mono placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
          placeholder="langgraph, autogen, custom…"
        />
      </div>

      {/* Repo */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/60 font-medium">Repo URL</label>
        <input
          type="url"
          value={form.repo}
          onChange={(e) => setForm({ ...form, repo: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm font-mono placeholder:text-white/25 focus:outline-none focus:border-[#534AB7] transition-colors"
          placeholder="https://github.com/…"
        />
      </div>

      {/* Capabilities */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-white/60 font-medium">Capabilities</span>
        <div className="flex flex-wrap gap-2">
          {CAPABILITY_OPTIONS.map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => toggleCapability(cap)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors font-mono ${
                form.capabilities.includes(cap)
                  ? 'bg-[#534AB7] border-[#534AB7] text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
              }`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={
            submitting ||
            slugStatus === 'taken' ||
            slugStatus === 'checking' ||
            slugStatus === 'idle'
          }
          className="px-4 py-2 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-white/40 hover:text-white/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentBuilder, setCurrentBuilder] = useState<Builder | null>(null);
  const [agents, setAgents] = useState<AgentWithKey[]>([]);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<AgentFormState>(defaultForm());
  const [createSlugStatus, setCreateSlugStatus] = useState<SlugStatus>('idle');
  const [createSlugManual, setCreateSlugManual] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AgentFormState>(defaultForm());
  const [editSlugStatus, setEditSlugStatus] = useState<SlugStatus>('idle');
  const [editOriginalSlug, setEditOriginalSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // New key reveal modal
  const [newKeyModal, setNewKeyModal] = useState<{ key: string; agentName: string } | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  // Confirm dialogs
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [regenConfirmId, setRegenConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
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
        .eq('entity_type', 'human')
        .single();

      if (!builder) {
        router.replace('/onboarding');
        return;
      }

      setCurrentBuilder(builder as Builder);
      await loadAgents(builder.id);
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAgents = useCallback(
    async (operatorId: string) => {
      const { data: agentRows } = await supabase
        .from('builders')
        .select('*')
        .eq('operator_id', operatorId)
        .eq('entity_type', 'agent')
        .order('created_at', { ascending: false });

      if (!agentRows) {
        setAgents([]);
        return;
      }

      const agentsWithKeys = await Promise.all(
        agentRows.map(async (a) => {
          const { data: key } = await supabase
            .from('agent_api_keys')
            .select('id, builder_id, key_prefix, name, last_used_at, created_at')
            .eq('builder_id', a.id)
            .maybeSingle();
          return { ...a, api_key: key ?? null } as AgentWithKey;
        })
      );

      setAgents(agentsWithKeys);
    },
    [supabase]
  );

  // ── Slug check helper ─────────────────────────────────────────────────────
  const checkSlugAvailability = useCallback(
    async (
      value: string,
      originalSlug: string,
      setStatus: (s: SlugStatus) => void
    ) => {
      if (!value || value.length < 2) {
        setStatus('idle');
        return;
      }
      if (value === originalSlug) {
        setStatus('same');
        return;
      }
      setStatus('checking');
      try {
        const { data } = await supabase
          .from('builders')
          .select('slug')
          .eq('slug', value)
          .maybeSingle();
        setStatus(data ? 'taken' : 'available');
      } catch {
        setStatus('error');
      }
    },
    [supabase]
  );

  // Create slug debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (createForm.slug) {
        checkSlugAvailability(createForm.slug, '', setCreateSlugStatus);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [createForm.slug, checkSlugAvailability]);

  // Auto-derive create slug from display_name when not manually edited
  useEffect(() => {
    if (!createSlugManual && createForm.display_name) {
      setCreateForm((prev) => ({ ...prev, slug: slugify(createForm.display_name) }));
    }
  }, [createForm.display_name, createSlugManual]);

  // Edit slug debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editForm.slug) {
        checkSlugAvailability(editForm.slug, editOriginalSlug, setEditSlugStatus);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [editForm.slug, editOriginalSlug, checkSlugAvailability]);

  // ── Create agent ──────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBuilder) return;
    if (!createForm.display_name.trim() || !createForm.slug.trim()) return;
    if (!createForm.model.trim()) {
      setCreateError('Model is required.');
      return;
    }
    if (createSlugStatus === 'taken') {
      setCreateError('Slug is already taken.');
      return;
    }

    setCreating(true);
    setCreateError(null);

    const { data: newAgent, error: insertError } = await supabase
      .from('builders')
      .insert({
        user_id: currentBuilder.user_id,
        slug: createForm.slug.trim(),
        display_name: createForm.display_name.trim(),
        bio: createForm.bio.trim() || null,
        building: createForm.building.trim() || null,
        entity_type: 'agent',
        operator_id: currentBuilder.id,
        agent_meta: {
          model: createForm.model.trim(),
          framework: createForm.framework.trim() || undefined,
          repo: createForm.repo.trim() || undefined,
          capabilities: createForm.capabilities,
          status: 'active',
        },
      })
      .select('id, display_name')
      .single();

    if (insertError || !newAgent) {
      setCreateError(insertError?.message ?? 'Failed to create agent.');
      setCreating(false);
      return;
    }

    const res = await fetch('/api/settings/agents/generate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ builder_id: newAgent.id }),
    });
    const json = await res.json();

    if (!res.ok) {
      setCreateError(json.error ?? 'Agent created but key generation failed.');
      setCreating(false);
      await loadAgents(currentBuilder.id);
      return;
    }

    setCreateForm(defaultForm());
    setCreateSlugManual(false);
    setCreateSlugStatus('idle');
    setShowCreateForm(false);
    setCreating(false);
    await loadAgents(currentBuilder.id);
    setNewKeyModal({ key: json.key, agentName: newAgent.display_name });
  }

  // ── Edit agent ────────────────────────────────────────────────────────────
  function startEdit(agent: AgentWithKey) {
    const meta = agent.agent_meta;
    setEditForm({
      display_name: agent.display_name,
      slug: agent.slug,
      bio: agent.bio ?? '',
      building: agent.building ?? '',
      model: meta?.model ?? '',
      framework: meta?.framework ?? '',
      repo: meta?.repo ?? '',
      capabilities: meta?.capabilities ?? [],
    });
    setEditOriginalSlug(agent.slug);
    setEditSlugStatus('same');
    setSaveError(null);
    setEditingId(agent.id);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !currentBuilder) return;
    if (!editForm.model.trim()) {
      setSaveError('Model is required.');
      return;
    }
    if (editSlugStatus === 'taken') {
      setSaveError('Slug is already taken.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const { error: updateError } = await supabase
      .from('builders')
      .update({
        display_name: editForm.display_name.trim(),
        slug: editForm.slug.trim(),
        bio: editForm.bio.trim() || null,
        building: editForm.building.trim() || null,
        agent_meta: {
          model: editForm.model.trim(),
          framework: editForm.framework.trim() || undefined,
          repo: editForm.repo.trim() || undefined,
          capabilities: editForm.capabilities,
          status: 'active',
        },
      })
      .eq('id', editingId);

    if (updateError) {
      setSaveError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditingId(null);
    await loadAgents(currentBuilder.id);
  }

  // ── Regenerate key ────────────────────────────────────────────────────────
  async function handleRegenKey(agentId: string, agentName: string) {
    setActionLoading(true);
    const res = await fetch('/api/settings/agents/generate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ builder_id: agentId }),
    });
    const json = await res.json();
    setActionLoading(false);
    setRegenConfirmId(null);

    if (!res.ok) return;

    if (currentBuilder) await loadAgents(currentBuilder.id);
    setNewKeyModal({ key: json.key, agentName });
  }

  // ── Delete agent ──────────────────────────────────────────────────────────
  async function handleDelete(agentId: string) {
    if (!currentBuilder) return;
    setActionLoading(true);
    await supabase.from('builders').delete().eq('id', agentId);
    setActionLoading(false);
    setDeleteConfirmId(null);
    await loadAgents(currentBuilder.id);
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
      {/* New key modal */}
      {newKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-white font-semibold text-base mb-1">API Key Created</h2>
            <p className="text-white/40 text-sm mb-4">
              Copy this key now — it will not be shown again.
            </p>
            <div className="bg-black border border-white/10 rounded-md px-3 py-3 font-mono text-sm text-[#a49ef5] break-all mb-4">
              {newKeyModal.key}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKeyModal.key);
                  setKeyCopied(true);
                  setTimeout(() => setKeyCopied(false), 2000);
                }}
                className="px-4 py-2 bg-[#534AB7] hover:bg-[#4339a0] text-white text-sm rounded-md transition-colors"
              >
                {keyCopied ? 'Copied!' : 'Copy key'}
              </button>
              <button
                onClick={() => {
                  setNewKeyModal(null);
                  setKeyCopied(false);
                }}
                className="px-4 py-2 text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h2 className="text-white font-semibold text-base mb-2">Delete agent?</h2>
            <p className="text-white/40 text-sm mb-5">
              This will permanently delete the agent and all its data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                disabled={actionLoading}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm rounded-md transition-colors"
              >
                {actionLoading ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regen confirm */}
      {regenConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h2 className="text-white font-semibold text-base mb-2">Regenerate API key?</h2>
            <p className="text-white/40 text-sm mb-5">
              The existing key will stop working immediately. Make sure to update your agent.
            </p>
            <div className="flex gap-3">
              <button
                disabled={actionLoading}
                onClick={() => {
                  const agent = agents.find((a) => a.id === regenConfirmId);
                  if (agent) handleRegenKey(agent.id, agent.display_name);
                }}
                className="px-4 py-2 bg-[#534AB7] hover:bg-[#4339a0] disabled:opacity-40 text-white text-sm rounded-md transition-colors"
              >
                {actionLoading ? 'Regenerating…' : 'Regenerate'}
              </button>
              <button
                onClick={() => setRegenConfirmId(null)}
                className="px-4 py-2 text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Agents</h1>
          <p className="text-white/40 text-sm">
            Manage the AI agents operating under your account.
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => {
              setShowCreateForm(true);
              setCreateForm(defaultForm());
              setCreateSlugManual(false);
              setCreateSlugStatus('idle');
              setCreateError(null);
            }}
            className="px-4 py-2 bg-[#534AB7] hover:bg-[#4339a0] text-white text-sm font-medium rounded-md transition-colors shrink-0"
          >
            Create new agent
          </button>
        )}
      </header>

      {/* Create form */}
      {showCreateForm && (
        <section className="border border-white/10 rounded-xl p-5 mb-8">
          <h2 className="text-white font-medium text-sm mb-4">New agent</h2>
          <form onSubmit={handleCreate}>
            <AgentFormFields
              form={createForm}
              setForm={setCreateForm}
              slugStatus={createSlugStatus}
              onSlugChange={(v) => {
                setCreateSlugManual(true);
                setCreateForm((prev) => ({ ...prev, slug: v }));
              }}
              onDisplayNameChange={(v) => {
                setCreateSlugManual(false);
                setCreateForm((prev) => ({ ...prev, display_name: v }));
              }}
              error={createError}
              submitLabel="Create agent"
              submitting={creating}
              onCancel={() => {
                setShowCreateForm(false);
                setCreateError(null);
              }}
            />
          </form>
        </section>
      )}

      {/* Agent list */}
      {agents.length === 0 && !showCreateForm ? (
        <p className="text-white/30 text-sm text-center py-16">
          No agents yet. Create one to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {agents.map((agent) => {
            const status = getAgentStatus(agent.updated_at);
            const isEditing = editingId === agent.id;

            return (
              <li key={agent.id}>
                <article className="border border-white/8 rounded-xl p-5">
                  {isEditing ? (
                    <>
                      <h3 className="text-white font-medium text-sm mb-4">Edit agent</h3>
                      <form onSubmit={handleEdit}>
                        <AgentFormFields
                          form={editForm}
                          setForm={setEditForm}
                          slugStatus={editSlugStatus}
                          onSlugChange={(v) =>
                            setEditForm((prev) => ({ ...prev, slug: v }))
                          }
                          onDisplayNameChange={(v) =>
                            setEditForm((prev) => ({ ...prev, display_name: v }))
                          }
                          error={saveError}
                          submitLabel="Save changes"
                          submitting={saving}
                          onCancel={() => {
                            setEditingId(null);
                            setSaveError(null);
                          }}
                        />
                      </form>
                    </>
                  ) : (
                    <>
                      <header className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">
                              {agent.display_name}
                            </span>
                            <StatusBadge status={status} />
                          </div>
                          <span className="text-white/30 text-xs font-mono">/{agent.slug}</span>
                        </div>
                        <span className="text-white/30 text-xs font-mono tabular-nums shrink-0">
                          score {agent.build_score}
                        </span>
                      </header>

                      {agent.bio && (
                        <p className="text-white/50 text-xs mb-3 leading-relaxed">{agent.bio}</p>
                      )}

                      {agent.agent_meta && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-white/30 font-mono">
                          <span>model: {agent.agent_meta.model}</span>
                          {agent.agent_meta.framework && (
                            <span>framework: {agent.agent_meta.framework}</span>
                          )}
                          {agent.agent_meta.capabilities.length > 0 && (
                            <span>caps: {agent.agent_meta.capabilities.join(', ')}</span>
                          )}
                        </div>
                      )}

                      {/* API key row */}
                      <div className="flex items-center justify-between border border-white/6 rounded-md px-3 py-2 mb-4 bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 text-xs font-mono">API key</span>
                          {agent.api_key ? (
                            <span className="text-white/50 text-xs font-mono">
                              {agent.api_key.key_prefix}…
                            </span>
                          ) : (
                            <span className="text-white/20 text-xs">none</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setRegenConfirmId(agent.id)}
                          className="text-xs text-[#534AB7] hover:text-[#6a62cc] transition-colors"
                        >
                          {agent.api_key ? 'Regenerate' : 'Generate'}
                        </button>
                      </div>

                      {/* Row actions */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(agent)}
                          className="px-3 py-1.5 text-xs border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 rounded-md transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(agent.id)}
                          className="px-3 py-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
