// /intel — Intel list page.
// Shows all 6 briefs in a clean editorial grid. Links to detail pages.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newsreader, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import { getAllBriefs } from '@/data/intel-briefs';
import { generateMetadata as gm } from '@/lib/seo';

const newsreader = Newsreader({
  subsets: ['latin'], variable: '--font-display', display: 'swap',
  style: ['normal', 'italic'], weight: ['300', '400', '500'],
});
const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'], variable: '--font-body-serif', display: 'swap',
  style: ['normal', 'italic'], weight: ['300', '400'],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'], variable: '--font-mono-jb', display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = gm({
  title: 'Builder Intelligence — OpCEO.AI',
  description: '真实 Builder 的增长情报。每篇 Brief 包含完整时间线、关键决策拆解和可复用动作。',
  path: '/intel',
});

export default function IntelListPage() {
  const briefs = getAllBriefs();

  return (
    <div className={`${newsreader.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} intel-root`}
      style={{ background: '#FAFAF5', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#191613', padding: 'clamp(48px, 7vw, 80px) clamp(24px, 5vw, 72px) clamp(40px, 5vw, 56px)' }}>
        <Link href="/" className="font-mono-jb" style={{ fontSize: '0.68rem', color: '#5C564C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
          ← OpCEO.AI
        </Link>
        <p className="font-mono-jb" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#C15F3C', textTransform: 'uppercase', marginBottom: 16 }}>
          Builder Intelligence
        </p>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, lineHeight: 1.12, letterSpacing: '-0.02em', color: '#F3EFE6', maxWidth: 640, marginBottom: 16 }}>
          增长情报库
        </h1>
        <p className="font-body-serif" style={{ fontSize: '0.96rem', fontStyle: 'italic', fontWeight: 300, color: '#847E72', maxWidth: 480 }}>
          每篇 Brief：完整时间线、关键决策、工具栈、可复用动作。
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(24px, 5vw, 48px)' }}>
        <div className="intel-list-grid">
          {briefs.map((b) => (
            <Link
              key={b.slug}
              href={`/intel/${b.slug}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', border: '1px solid #DDD8CB', borderRadius: 12, overflow: 'hidden', background: '#FAFAF5', transition: 'transform 0.2s, box-shadow 0.2s' }}
              className="hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(25,22,19,0.07)]"
            >
              {/* Color bar */}
              <div style={{ height: 6, background: b.cardColor }} />
              {/* Body */}
              <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="font-mono-jb" style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(193,95,60,0.08)', color: '#C15F3C' }}>{b.category}</span>
                  <span className="font-mono-jb" style={{ fontSize: '0.62rem', color: '#AEA899' }}>{b.readTime}</span>
                </div>
                <h2 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 400, color: '#191613', lineHeight: 1.3 }}>{b.title}</h2>
                <p className="font-body-serif" style={{ fontSize: '0.82rem', color: '#847E72', lineHeight: 1.6, fontWeight: 300, flex: 1 }}>{b.headline}</p>
                <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid #DDD8CB' }}>
                  <Stat value={b.metrics.primary.value} label={b.metrics.primary.label} />
                  <Stat value={b.metrics.secondary.value} label={b.metrics.secondary.label} />
                  {b.metrics.tertiary && <Stat value={b.metrics.tertiary.value} label={b.metrics.tertiary.label} />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .intel-root ::selection { background: rgba(193,95,60,0.12); }
        .intel-list-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) { .intel-list-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .intel-list-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono-jb" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#302B24' }}>{value}</p>
      <p className="font-mono-jb" style={{ fontSize: '0.6rem', color: '#AEA899' }}>{label}</p>
    </div>
  );
}
