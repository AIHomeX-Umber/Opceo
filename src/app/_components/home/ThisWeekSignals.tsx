// ThisWeekSignals — 3 compact editorial signal cards.
// Dark background, minimal styling, info-first.
// No hover, no shadows, no click targets.

const SIGNALS = [
  {
    stat: '↗ $8.2K MRR in 43 days',
    name: 'AI 缩略图工具',
    nameEn: 'AI Thumbnail Tool',
    stack: 'Claude + Next.js',
  },
  {
    stat: '↗ 2,400 users · $0 广告',
    name: 'Notion 模板市场',
    nameEn: 'Notion Template Marketplace',
    stack: 'Notion + Reddit SEO',
  },
  {
    stat: '↗ $4K/月 · 12 周',
    name: 'AI Newsletter',
    nameEn: 'AI Newsletter',
    stack: 'Twitter + Beehiiv',
  },
];

export function ThisWeekSignals() {
  return (
    <section
      id="signals"
      style={{
        background: '#191613',
        padding: '40px clamp(24px, 5vw, 72px)',
      }}
    >
      {/* Section label */}
      <p className="font-mono-jb text-[0.62rem] tracking-[0.14em] text-[#C15F3C] uppercase mb-5">
        本周信号 · This Week&apos;s Signals
      </p>

      {/* Cards row */}
      <div
        className="signals-grid"
        style={{
          display: 'grid',
          gap: 12,
        }}
      >
        {SIGNALS.map((s) => (
          <div
            key={s.name}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10,
              padding: '18px 20px',
            }}
          >
            <p
              className="font-mono-jb"
              style={{
                fontSize: '1.05rem',
                fontWeight: 500,
                color: '#C15F3C',
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}
            >
              {s.stat}
            </p>
            <p
              className="font-display"
              style={{
                fontSize: '0.95rem',
                fontWeight: 400,
                color: '#F3EFE6',
                marginBottom: 2,
              }}
            >
              {s.name}
            </p>
            <p
              className="font-mono-jb"
              style={{
                fontSize: '0.63rem',
                color: '#847E72',
                marginBottom: 8,
                letterSpacing: '0.01em',
              }}
            >
              {s.nameEn}
            </p>
            <p
              className="font-mono-jb"
              style={{
                fontSize: '0.68rem',
                color: '#5C564C',
                letterSpacing: '0.04em',
              }}
            >
              Stack: {s.stack}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        .signals-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 700px) {
          .signals-grid {
            grid-template-columns: repeat(3, minmax(220px, 1fr));
            overflow-x: auto;
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </section>
  );
}
