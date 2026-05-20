// /accelerate — Factory AI Readiness
// Narrative: AI transformation layer for real factories, real teams, real workflows.
// Tone: infrastructure, readiness signal, transformation — not sales.

import Link from 'next/link';
import { generateMetadata as gm } from '@/lib/seo';
import { ReadinessIndex } from './_components/ReadinessIndex';

export const metadata = gm({
  title: 'Factory AI Readiness',
  description:
    'AI is leaving the builder bubble. This page tracks the second wave — stable AI access, workflow transformation, and AI employee deployment for manufacturing teams.',
  path: '/accelerate',
});

const LAYERS = [
  {
    level: 'Level 1',
    title: 'Stable AI Access',
    body: 'ChatGPT, Claude, Gemini and model gateway setup for teams entering the AI world for the first time.',
  },
  {
    level: 'Level 2',
    title: 'AI-Ready Workflows',
    body: 'Sales, export, customer support and operations workflows redesigned around AI-native execution.',
  },
  {
    level: 'Level 3',
    title: 'AI Employee Deployment',
    body: 'Role-based AI employees such as Hunter, Spec and Harbor deployed into real manufacturing export scenarios.',
  },
] as const;

export default function AcceleratePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

      {/* ── Section 1: Hero ─────────────────────────────────────────── */}
      <div className="mb-20">
        <p className="mb-4 font-mono text-[0.65rem] tracking-widest uppercase text-[#C15F3C]">
          Real World AI Adoption
        </p>

        <h1 className="mb-5 text-3xl sm:text-4xl font-bold text-white leading-[1.15] max-w-2xl">
          AI access is the first step of AI transformation.
        </h1>

        <p className="text-base text-white/45 leading-relaxed max-w-xl">
          Before a factory can deploy AI employees, the team needs stable AI access,
          shared workflows, and a clear path from usage to adoption.
        </p>
      </div>

      {/* ── Section 2: Three Layers ─────────────────────────────────── */}
      <section className="mb-16 border-t border-white/5 pt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {LAYERS.map((layer) => (
            <div
              key={layer.level}
              className="rounded-sm border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 transition-colors"
            >
              <p className="font-mono text-[0.65rem] tracking-widest uppercase text-[#C15F3C] mb-3">
                {layer.level}
              </p>
              <h3 className="text-base font-semibold text-white mb-3 leading-snug">
                {layer.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {layer.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Factory AI Readiness Index ───────────────────── */}
      <ReadinessIndex />

      {/* ── Section 4: Narrative Bridge ─────────────────────────────── */}
      <section className="mb-16 border-t border-white/5 pt-14">
        <p
          className="mx-auto text-center text-base sm:text-lg leading-[1.8] italic text-white/40 max-w-xl"
          style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
        >
          OpCEO tracks who is winning in the AI builder world.<br />
          But AI is not staying in the builder bubble.<br />
          It is entering real factories, real teams, real workflows.
          <br /><br />
          <span className="text-white/60 not-italic">This page tracks that second wave.</span>
        </p>
      </section>

      {/* ── Section 5: CTA ──────────────────────────────────────────── */}
      <section className="border-t border-white/5 pt-14">
        <div className="max-w-lg">
          <h2 className="mb-3 text-xl font-semibold text-white">
            Start with AI Access
          </h2>
          <p className="mb-8 text-sm text-white/40 leading-relaxed">
            Get your team&apos;s first stable AI gateway — the foundation
            for everything that follows.
          </p>

          <Link
            href="mailto:hi@makox.ai"
            className="inline-block font-mono text-sm px-5 py-2.5 rounded-sm border border-[#C15F3C] text-[#C15F3C] hover:bg-[#C15F3C] hover:text-white transition-colors duration-200"
          >
            Talk to us →
          </Link>

          <p className="mt-5 text-[11px] font-mono text-white/20 tracking-wide">
            Powered by Makox AI Ready Kit
          </p>
        </div>
      </section>

    </div>
  );
}
