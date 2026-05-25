// CTA — dual-path closing section: reader left, builder right.
// Desktop 2-col, mobile stacked.
// Server component: no state.

import Link from 'next/link';

export function CTA() {
  return (
    <section
      style={{
        background: '#F3EFE6',
        borderTop: '1px solid #DDD8CB',
        padding: 'clamp(56px, 9vw, 104px) clamp(24px, 5vw, 72px)',
      }}
    >
      <div className="cta-grid">
        {/* Left — Reader path */}
        <div
          style={{
            padding: 'clamp(32px, 4vw, 48px)',
            background: '#191613',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h2
            className="font-display font-medium text-[#F3EFE6] leading-[1.15]"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}
          >
            Start reading.
          </h2>
          <p className="font-body-serif text-[0.9rem] text-[#AEA899] leading-[1.7] font-[300]">
            New intel brief every week.
            <br />
            Free. No account required.
          </p>
          <Link
            href="#intelligence"
            className="font-body-serif text-[0.9rem] text-[#191613] bg-[#F3EFE6] hover:bg-[#FAFAF5] px-6 py-[12px] rounded-[8px] no-underline transition-colors duration-[200ms] self-start"
          >
            Browse Intel
          </Link>
        </div>

        {/* Right — Builder path */}
        <div
          style={{
            padding: 'clamp(32px, 4vw, 48px)',
            background: '#F3EFE6',
            border: '1px solid #DDD8CB',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h2
            className="font-display font-medium text-[#191613] leading-[1.15]"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}
          >
            Got a build worth tracking?
          </h2>
          <p className="font-body-serif text-[0.9rem] text-[#5C564C] leading-[1.7] font-[300]">
            Submit your ship log.
            <br />
            We&apos;ll structure the story.
          </p>
          <Link
            href="/ship"
            className="font-body-serif text-[0.9rem] text-[#FAFAF5] bg-[#191613] hover:bg-[#302B24] px-6 py-[12px] rounded-[8px] no-underline transition-colors duration-[200ms] self-start"
          >
            Submit Your Build
          </Link>
        </div>
      </div>

      <style>{`
        .cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 640px) {
          .cta-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
