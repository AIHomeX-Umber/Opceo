// HowItWorks — 3-step section explaining OpCEO's value proposition.
// Warm parchment background (#F3EFE6), numbered steps in terra accent.
// Server component: no state, no data fetching.

const STEPS = [
  {
    num: '01',
    title: 'We track builders',
    desc: 'Every solo founder building in public — across X, IndieHackers, newsletters, and GitHub — is monitored for real ship signals, not just tweets.',
  },
  {
    num: '02',
    title: 'We structure the arc',
    desc: 'Raw signal becomes an intel brief: the decision, the inflection point, the growth lever. Each brief is one founder, one growth arc, fully narrated.',
  },
  {
    num: '03',
    title: 'You extract the moves',
    desc: 'Filter by category, revenue tier, or tactic. Copy what works. Skip the noise. Build faster with pattern recognition, not luck.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      style={{
        background: '#F3EFE6',
        borderTop: '1px solid #DDD8CB',
        borderBottom: '1px solid #DDD8CB',
        padding: 'clamp(56px, 8vw, 96px) clamp(24px, 5vw, 72px)',
      }}
    >
      {/* Heading */}
      <h2
        className="font-display text-center font-medium text-[#191613] leading-[1.2] mb-[clamp(40px,6vw,64px)]"
        style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
      >
        Intelligence, not interviews.
      </h2>

      {/* 3-col grid → 1-col on mobile */}
      <div className="grid gap-8 how-grid">
        {STEPS.map((step) => (
          <div key={step.num} className="flex flex-col gap-4">
            <span className="font-mono-jb text-[0.72rem] font-[500] tracking-widest text-[#C15F3C]">
              {step.num}
            </span>
            <h3 className="font-display text-[1.25rem] font-medium text-[#191613] leading-[1.3]">
              {step.title}
            </h3>
            <p className="font-body-serif text-[0.88rem] text-[#5C564C] leading-[1.7] font-[300]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        .how-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 700px) {
          .how-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
