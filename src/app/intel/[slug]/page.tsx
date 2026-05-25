// /intel/[slug] — Intel Brief detail page.
// SSG via generateStaticParams. Full structured Builder Intelligence content.
// Fonts scoped to .intel-root wrapper via same CSS vars as homepage.
// Scope: ONLY this file. Does NOT modify homepage or other routes.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Newsreader, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import { getAllBriefs, getBriefBySlug } from '@/data/intel-briefs';
import type { IntelBrief, TimelineEvent, Decision } from '@/data/intel-briefs';

// ── Fonts (same vars as homepage) ─────────────────────────────────────────────
const newsreader = Newsreader({
  subsets: ['latin'], variable: '--font-display', display: 'swap',
  style: ['normal', 'italic'], weight: ['300', '400', '500', '600'],
});
const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'], variable: '--font-body-serif', display: 'swap',
  style: ['normal', 'italic'], weight: ['300', '400'],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'], variable: '--font-mono-jb', display: 'swap',
  weight: ['400', '500'],
});

// ── SSG ───────────────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return getAllBriefs().map((b) => ({ slug: b.slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const brief = getBriefBySlug(slug);
  if (!brief) return { title: 'Not Found' };

  return {
    title: brief.metaTitle,
    description: brief.metaDescription,
    alternates: { canonical: `https://opceo.ai/intel/${brief.slug}` },
    openGraph: {
      title: brief.metaTitle,
      description: brief.metaDescription,
      url: `https://opceo.ai/intel/${brief.slug}`,
      siteName: 'OpCEO.AI',
      type: 'article',
      publishedTime: brief.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: brief.metaTitle,
      description: brief.metaDescription,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function IntelDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const brief = getBriefBySlug(slug);
  if (!brief) notFound();

  return (
    <div className={`${newsreader.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} intel-root`}>
      <IntelDetail brief={brief} />
    </div>
  );
}

// ── Components ────────────────────────────────────────────────────────────────

function IntelDetail({ brief }: { brief: IntelBrief }) {
  return (
    <div style={{ background: '#FAFAF5', minHeight: '100vh' }}>
      {/* ── Header band ── */}
      <div style={{ background: '#191613', padding: 'clamp(48px, 7vw, 80px) clamp(24px, 5vw, 72px) clamp(40px, 5vw, 64px)' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 32 }}>
          <span className="font-mono-jb" style={{ fontSize: '0.7rem', color: '#5C564C', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#5C564C', textDecoration: 'none' }} className="hover:text-[#AEA899] transition-colors">OpCEO.AI</Link>
            <span>›</span>
            <Link href="/#intelligence" style={{ color: '#5C564C', textDecoration: 'none' }} className="hover:text-[#AEA899] transition-colors">Intel</Link>
            <span>›</span>
            <span style={{ color: '#AEA899' }}>{brief.product}</span>
          </span>
        </nav>

        {/* Category + read time */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <span className="font-mono-jb" style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: 4, background: 'rgba(193,95,60,0.15)', color: '#C15F3C', letterSpacing: '0.08em' }}>
            {brief.category}
          </span>
          <span className="font-mono-jb" style={{ fontSize: '0.65rem', color: '#5C564C' }}>
            {brief.readTime} · {brief.publishedAt}
          </span>
        </div>

        {/* Editorial note */}
        <p className="font-mono-jb" style={{ fontSize: '0.6rem', color: '#3A342D', marginBottom: 20, letterSpacing: '0.02em' }}>
          Editorial intelligence · structured from public builder patterns and submitted build logs.
        </p>

        {/* Title */}
        <h1 className="font-display" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#F3EFE6', maxWidth: 720, marginBottom: 16 }}>
          {brief.title}
        </h1>

        {/* Headline */}
        <p className="font-body-serif" style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.05rem)', fontStyle: 'italic', fontWeight: 300, color: '#847E72', lineHeight: 1.6, maxWidth: 600 }}>
          {brief.headline}
        </p>
      </div>

      {/* ── Content wrapper ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 clamp(24px, 5vw, 48px)' }}>

        {/* ── Snapshot card ── */}
        <section style={{ background: '#F3EFE6', border: '1px solid #DDD8CB', borderRadius: 14, padding: 'clamp(24px, 4vw, 40px)', margin: '40px 0', display: 'grid', gap: 32 }} className="snapshot-grid">
          {/* Left — builder info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Builder */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: brief.cardColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="font-mono-jb" style={{ fontSize: '0.78rem', fontWeight: 500, color: '#191613' }}>{brief.builderInitials}</span>
              </div>
              <div>
                <p className="font-display" style={{ fontSize: '1rem', fontWeight: 500, color: '#191613', lineHeight: 1.2 }}>{brief.builderName}</p>
                <p className="font-mono-jb" style={{ fontSize: '0.65rem', color: '#847E72', marginTop: 2 }}>{brief.location} · {brief.product}</p>
              </div>
            </div>

            {/* Growth source + lever */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              <SnapshotRow label="增长来源" value={brief.growthSource} />
              <SnapshotRow label="最大杠杆" value={brief.biggestLever} />
            </div>

            {/* Stack */}
            <div>
              <p className="font-mono-jb" style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: '#AEA899', marginBottom: 8, textTransform: 'uppercase' }}>Stack</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {brief.stack.map((s) => (
                  <span key={s} className="font-mono-jb" style={{ fontSize: '0.68rem', padding: '3px 8px', background: 'rgba(25,22,19,0.06)', borderRadius: 4, color: '#5C564C' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
            <MetricBlock m={brief.metrics.primary} accent />
            <MetricBlock m={brief.metrics.secondary} />
            {brief.metrics.tertiary && <MetricBlock m={brief.metrics.tertiary} />}
          </div>
        </section>

        {/* ── Timeline ── */}
        <Section label="增长时间线" id="timeline">
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {/* vertical line */}
            <div style={{ position: 'absolute', left: 6, top: 8, bottom: 8, width: 1, background: '#DDD8CB' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {brief.timeline.map((event, i) => (
                <TimelineRow key={i} event={event} isLast={i === brief.timeline.length - 1} />
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* ── Decisions ── */}
        <Section label="关键决策拆解" id="decisions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {brief.decisions.map((d, i) => (
              <DecisionCard key={i} decision={d} index={i + 1} />
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── Resource Stack ── */}
        <Section label="工具栈" id="stack">
          <div style={{ border: '1px solid #DDD8CB', borderRadius: 10, overflow: 'hidden' }}>
            {brief.resourceStack.tools.map((tool, i) => (
              <div key={tool.name} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, padding: '14px 20px', background: i % 2 === 0 ? '#FAFAF5' : '#F3EFE6', borderBottom: i < brief.resourceStack.tools.length - 1 ? '1px solid #DDD8CB' : 'none' }}>
                <span className="font-mono-jb" style={{ fontSize: '0.78rem', fontWeight: 500, color: '#191613' }}>{tool.name}</span>
                <span className="font-body-serif" style={{ fontSize: '0.82rem', color: '#5C564C', fontWeight: 300 }}>{tool.purpose}</span>
              </div>
            ))}
          </div>
          <p className="font-mono-jb" style={{ fontSize: '0.72rem', color: '#847E72', marginTop: 14, textAlign: 'right' }}>
            月成本：<strong style={{ color: '#302B24' }}>{brief.resourceStack.monthlyCost}</strong>
          </p>
        </Section>

        <Divider />

        {/* ── Repeatable Moves ── */}
        <Section label="可复用动作" id="moves">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {brief.repeatableMoves.map((move, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span className="font-mono-jb" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#C15F3C', flexShrink: 0, lineHeight: 1.6 }}>
                  0{i + 1}
                </span>
                <p className="font-body-serif" style={{ fontSize: '0.95rem', color: '#302B24', lineHeight: 1.75, fontWeight: 300 }}>
                  {move}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CTA ── */}
        <div style={{ background: '#191613', borderRadius: 14, padding: 'clamp(32px, 5vw, 48px)', margin: '48px 0 64px', textAlign: 'center' }}>
          <p className="font-mono-jb" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#C15F3C', textTransform: 'uppercase', marginBottom: 16 }}>
            加入 OpCEO
          </p>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400, color: '#F3EFE6', lineHeight: 1.2, marginBottom: 12 }}>
            有值得被记录的 Build？
          </h2>
          <p className="font-body-serif" style={{ fontSize: '0.9rem', color: '#847E72', lineHeight: 1.7, fontWeight: 300, maxWidth: 380, margin: '0 auto 28px' }}>
            提交你的 Ship 记录，我们来结构化你的增长故事。
          </p>
          <Link href="/ship" style={{ display: 'inline-block', padding: '12px 28px', background: '#F3EFE6', color: '#191613', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem' }} className="font-body-serif hover:bg-[#FAFAF5] transition-colors">
            提交你的 Build
          </Link>
        </div>
      </div>

      {/* Scoped styles */}
      <style>{`
        .intel-root ::selection { background: rgba(193,95,60,0.12); }
        .snapshot-grid { grid-template-columns: 1.4fr 1fr; }
        @media (max-width: 640px) {
          .snapshot-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: '40px 0 8px' }}>
      <p className="font-mono-jb" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#C15F3C', textTransform: 'uppercase', marginBottom: 24 }}>
        {label}
      </p>
      {children}
    </section>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#DDD8CB', margin: '8px 0' }} />;
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-mono-jb" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#AEA899', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>{label}</span>
      <span className="font-body-serif" style={{ fontSize: '0.84rem', color: '#302B24', fontWeight: 300, lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

function MetricBlock({ m, accent }: { m: { value: string; label: string }; accent?: boolean }) {
  return (
    <div style={{ borderLeft: `2px solid ${accent ? '#C15F3C' : '#DDD8CB'}`, paddingLeft: 14 }}>
      <p className="font-display" style={{ fontSize: accent ? 'clamp(1.6rem, 4vw, 2.4rem)' : 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 400, color: '#191613', lineHeight: 1 }}>
        {m.value}
      </p>
      <p className="font-mono-jb" style={{ fontSize: '0.65rem', color: '#847E72', marginTop: 4, letterSpacing: '0.06em' }}>
        {m.label}
      </p>
    </div>
  );
}

function TimelineRow({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 0, paddingBottom: isLast ? 0 : 28, position: 'relative' }}>
      {/* dot */}
      <div style={{ position: 'absolute', left: -22, top: 6, width: 9, height: 9, borderRadius: '50%', background: '#C15F3C', border: '2px solid #FAFAF5', zIndex: 1 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 6 }}>
          <span className="font-mono-jb" style={{ fontSize: '0.65rem', color: '#C15F3C', fontWeight: 500, letterSpacing: '0.06em', flexShrink: 0 }}>{event.day}</span>
          <span className="font-display" style={{ fontSize: '0.96rem', fontWeight: 400, color: '#191613', lineHeight: 1.3 }}>{event.action}</span>
        </div>
        <p className="font-mono-jb" style={{ fontSize: '0.72rem', color: '#302B24', fontWeight: 500, marginBottom: event.detail ? 4 : 0 }}>→ {event.result}</p>
        {event.detail && (
          <p className="font-body-serif" style={{ fontSize: '0.82rem', color: '#847E72', lineHeight: 1.6, fontWeight: 300, marginTop: 4 }}>{event.detail}</p>
        )}
      </div>
    </div>
  );
}

function DecisionCard({ decision, index }: { decision: Decision; index: number }) {
  const fields: { key: keyof Decision; label: string }[] = [
    { key: 'why',        label: '为什么' },
    { key: 'action',     label: '做了什么' },
    { key: 'result',     label: '结果' },
    { key: 'unexpected', label: '意料之外' },
    { key: 'ifRedo',     label: '如果重来' },
  ];
  return (
    <div style={{ border: '1px solid #DDD8CB', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#F3EFE6', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span className="font-mono-jb" style={{ fontSize: '0.65rem', color: '#C15F3C', fontWeight: 500 }}>决策 {String(index).padStart(2, '0')}</span>
        <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 500, color: '#191613', lineHeight: 1.3 }}>{decision.title}</h3>
      </div>
      {/* Fields */}
      <div>
        {fields.map(({ key, label }, i) => (
          <div key={key} style={{ padding: '12px 20px', background: i % 2 === 0 ? '#FAFAF5' : 'rgba(243,239,230,0.4)', borderTop: '1px solid #DDD8CB', display: 'grid', gridTemplateColumns: '72px 1fr', gap: 16, alignItems: 'baseline' }}>
            <span className="font-mono-jb" style={{ fontSize: '0.62rem', color: '#AEA899', letterSpacing: '0.08em', textTransform: 'uppercase', paddingTop: 2 }}>{label}</span>
            <p className="font-body-serif" style={{ fontSize: '0.88rem', color: '#302B24', lineHeight: 1.7, fontWeight: 300 }}>{decision[key] as string}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
