'use client';

import { useMemo, useState } from 'react';

const AI_TOOLS = [
  'ChatGPT',
  'Claude',
  'Cursor',
  'Lovable',
  'Bolt',
  'Replit',
  'Supabase',
  'Midjourney',
  'Vercel',
  'Other',
];

type FormState = {
  what_built: string;
  why_built: string;
  ai_tools: string[];
  what_broke: string;
  what_learned: string;
  project_url: string;
  name: string;
  x_handle: string;
  email: string;
};

const initialForm: FormState = {
  what_built: '',
  why_built: '',
  ai_tools: [],
  what_broke: '',
  what_learned: '',
  project_url: '',
  name: '',
  x_handle: '',
  email: '',
};

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="font-body-serif text-[0.95rem] text-[#302B24]">
      {children}
      {required && <span className="text-[#C15F3C]"> *</span>}
    </label>
  );
}

function TextAreaField({
  label,
  required,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel required={required}>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="min-h-28 resize-y rounded-[6px] border border-[#DDD8CB] bg-transparent px-4 py-3 font-body-serif text-[0.95rem] leading-7 text-[#191613] outline-none transition-colors placeholder:text-[#AEA899] focus:border-[#191613]"
      />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="h-11 rounded-[6px] border border-[#DDD8CB] bg-transparent px-4 font-body-serif text-[0.95rem] text-[#191613] outline-none transition-colors placeholder:text-[#AEA899] focus:border-[#191613]"
      />
    </div>
  );
}

export default function ShipPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => form.what_built.trim().length > 0, [form.what_built]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleTool(tool: string) {
    setForm((current) => {
      const ai_tools = current.ai_tools.includes(tool)
        ? current.ai_tools.filter((item) => item !== tool)
        : [...current.ai_tools, tool];
      return { ...current, ai_tools };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please tell us what you built.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
      setForm(initialForm);
      requestAnimationFrame(() => window.scrollTo({ top: 0 }));
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#FAFAF5] px-5 py-16 text-[#191613]">
        <section className="mx-auto flex min-h-[58vh] max-w-2xl flex-col justify-center">
          <p className="mb-5 font-mono-jb text-[0.72rem] uppercase tracking-[0.16em] text-[#C15F3C]">
            Received
          </p>
          <h1 className="font-display text-4xl font-medium leading-[1.02] tracking-[-0.03em] text-[#191613] sm:text-6xl">
            Your Ship Log has entered the frontier.
          </h1>
          <div className="mt-9 space-y-2 border-l border-[#DDD8CB] pl-5 font-body-serif text-[1rem] leading-7 text-[#5C564C]">
            <p>We&apos;ll review it for Weekly Spotlight.</p>
            <p>Great logs may become OpCEO Builder Briefs.</p>
            <p>Keep shipping. Streaks are coming.</p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-10 inline-flex h-11 w-fit items-center justify-center rounded-[6px] border border-[#DDD8CB] px-5 font-body-serif text-[0.95rem] text-[#302B24] transition-colors hover:border-[#191613]"
          >
            Submit another
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#FAFAF5] px-5 py-12 text-[#191613] sm:py-16">
      <section className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <p className="mb-6 font-mono-jb text-[0.72rem] uppercase tracking-[0.16em] text-[#AEA899]">
            Ship Log
          </p>
          <h1 className="max-w-xl font-display text-5xl font-medium leading-[0.96] tracking-[-0.045em] text-[#191613] sm:text-7xl">
            Ship the build.
            <br />
            Log the truth.
          </h1>
          <p className="mt-7 max-w-md font-body-serif text-[1.16rem] leading-8 text-[#5C564C]">
            Built with AI? Submit the journey: what worked, what broke, what changed.
          </p>
          <p className="mt-5 max-w-md font-body-serif text-[1rem] leading-8 text-[#7C756A]">
            不用是工程师。只要你真的用 AI 做过一个东西，就可以提交。
          </p>
          <a
            href="#ship-log-form"
            className="mt-9 inline-flex h-11 items-center justify-center rounded-[6px] bg-[#191613] px-5 font-body-serif text-[0.95rem] text-[#FAFAF5] no-underline transition-colors hover:bg-[#302B24]"
          >
            Start Ship Log
          </a>
        </div>

        <form
          id="ship-log-form"
          onSubmit={handleSubmit}
          noValidate
          className="border-t border-[#DDD8CB] pt-6"
        >
          <div className="space-y-8">
            {error && (
              <div className="rounded-[6px] border border-[#C15F3C]/25 bg-[#C15F3C]/8 px-4 py-3 font-body-serif text-[0.92rem] text-[#9C4529]">
                {error}
              </div>
            )}

            <TextAreaField
              label="Built"
              required
              value={form.what_built}
              onChange={(value) => set('what_built', value)}
              placeholder="An AI customer support flow. A tiny SaaS. A video pipeline. A workflow that saved three hours."
              rows={5}
            />

            <TextAreaField
              label="Why"
              value={form.why_built}
              onChange={(value) => set('why_built', value)}
              placeholder="The problem, the person, the reason it mattered."
            />

            <div className="flex flex-col gap-3">
              <FieldLabel>AI tools</FieldLabel>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {AI_TOOLS.map((tool) => {
                  const selected = form.ai_tools.includes(tool);
                  return (
                    <label
                      key={tool}
                      className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-[6px] border px-3 font-body-serif text-[0.9rem] transition-colors ${
                        selected
                          ? 'border-[#191613] bg-[#191613] text-[#FAFAF5]'
                          : 'border-[#DDD8CB] text-[#5C564C] hover:border-[#191613] hover:text-[#191613]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleTool(tool)}
                        className="h-4 w-4 accent-[#C15F3C]"
                      />
                      {tool}
                    </label>
                  );
                })}
              </div>
            </div>

            <TextAreaField
              label="Broke"
              value={form.what_broke}
              onChange={(value) => set('what_broke', value)}
              placeholder="The bug, the wall, the messy part."
            />

            <TextAreaField
              label="Learned"
              value={form.what_learned}
              onChange={(value) => set('what_learned', value)}
              placeholder="The lesson worth taking into the next build."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Demo URL"
                value={form.project_url}
                onChange={(value) => set('project_url', value)}
                placeholder="https://..."
                type="url"
              />
              <InputField
                label="Name"
                value={form.name}
                onChange={(value) => set('name', value)}
                placeholder="Optional"
              />
              <InputField
                label="X"
                value={form.x_handle}
                onChange={(value) => set('x_handle', value)}
                placeholder="@handle"
              />
              <InputField
                label="Email"
                value={form.email}
                onChange={(value) => set('email', value)}
                placeholder="you@example.com"
                type="email"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="flex h-12 w-full items-center justify-center rounded-[6px] bg-[#191613] px-5 font-body-serif text-[0.98rem] text-[#FAFAF5] transition-colors hover:bg-[#302B24] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? 'Submitting...' : 'Submit Ship Log'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
