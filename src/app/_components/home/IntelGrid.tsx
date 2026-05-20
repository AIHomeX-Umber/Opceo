// IntelGrid — 6 hardcoded intel brief cards.
// 3-col desktop → 2-col tablet → 1-col mobile.
// Server component: no data fetching, no client state.

import Link from 'next/link';

type Card = {
  title: string;
  desc: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  category: string;
  visColor: string;
  icon: React.ReactNode;
};

const CARDS: Card[] = [
  {
    title: 'From side project to $8.2K MRR in 43 days',
    desc: 'AI thumbnail tool. Free watermark plan as distribution, 22-sec build clips on X, onboarding cut from 5 steps to 2.',
    stat1Value: '$8.2K', stat1Label: 'MRR',
    stat2Value: '43',    stat2Label: 'days',
    category: 'AI Tools',
    visColor: '#D4896A',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
        <rect x="14" y="20" width="36" height="28" rx="3"/>
        <path d="M14 28h36M24 20v-6h16v6"/>
        <circle cx="32" cy="38" r="4"/>
      </svg>
    ),
  },
  {
    title: '2,400 users with zero ad spend — Notion templates',
    desc: 'Reddit long-form as growth channel, pricing jump from $9 to $29 tripled revenue without losing conversion.',
    stat1Value: '2.4K', stat1Label: 'users',
    stat2Value: '$0',   stat2Label: 'ads',
    category: 'SaaS',
    visColor: '#B7C9B5',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
        <path d="M18 46V22l14-8 14 8v24"/>
        <path d="M18 28l14 8 14-8M32 36v14"/>
      </svg>
    ),
  },
  {
    title: 'Newsletter to $4K/mo in 12 weeks',
    desc: 'AI newsletter. Twitter threads → 8K subs, converted 3.2% to paid with a decision-framework template freebie.',
    stat1Value: '8K',  stat1Label: 'subs',
    stat2Value: '12',  stat2Label: 'wks',
    category: 'Content',
    visColor: '#B8A9D4',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
        <rect x="16" y="12" width="20" height="28" rx="2"/>
        <rect x="28" y="24" width="20" height="28" rx="2"/>
        <path d="M28 32h8M28 38h8"/>
      </svg>
    ),
  },
  {
    title: '$12K MRR selling API access to a weekend hack',
    desc: 'Image processing API. Built in 2 days, posted HN, iterated from pay-per-use to monthly tiers — 4× ARPU.',
    stat1Value: '$12K', stat1Label: 'MRR',
    stat2Value: '67',   stat2Label: 'days',
    category: 'Dev Tools',
    visColor: '#D4C17A',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
        <path d="M16 48l8-16 8 10 8-20 8 12"/>
        <path d="M12 48h40"/>
      </svg>
    ),
  },
  {
    title: "Factory owner's first AI product — $3K month one",
    desc: 'Cross-border AI listing tool. Solved own pain, launched TikTok Shop, Claude for product copy at scale.',
    stat1Value: '$3K', stat1Label: 'mo 1',
    stat2Value: '30',  stat2Label: 'days',
    category: 'E-commerce',
    visColor: '#8BAEC4',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
        <circle cx="32" cy="28" r="12"/>
        <path d="M20 46c0-6.63 5.37-12 12-12s12 5.37 12 12"/>
      </svg>
    ),
  },
  {
    title: 'Building in public actually converted — 90-day proof',
    desc: 'Design tool. Shared every metric publicly, turned transparency into trust, 500 paying users from X alone.',
    stat1Value: '500', stat1Label: 'paid',
    stat2Value: '90',  stat2Label: 'days',
    category: 'SaaS',
    visColor: '#D4A0A0',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
        <rect x="12" y="16" width="40" height="32" rx="3"/>
        <path d="M12 24h40M20 32h12M20 38h8"/>
      </svg>
    ),
  },
];

export function IntelGrid() {
  return (
    <section style={{ padding: '40px clamp(24px, 5vw, 72px) 80px', background: '#FAFAF5' }}>
      <div
        className="intel-grid grid gap-6"
      >
        {CARDS.map((card) => (
          <Link
            key={card.title}
            href="#"
            className="flex flex-col border border-[#DDD8CB] rounded-[12px] overflow-hidden bg-[#FAFAF5] text-inherit no-underline transition-all duration-[250ms] hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(25,22,19,0.07)]"
          >
            {/* Coloured vis area */}
            <div
              className="flex items-center justify-center"
              style={{ height: 180, background: card.visColor, color: '#191613', opacity: 1 }}
            >
              <span style={{ opacity: 0.85 }}>{card.icon}</span>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-6">
              <h3 className="font-display text-[1.2rem] font-medium text-[#191613] leading-[1.3] mb-2">
                {card.title}
              </h3>
              <p className="font-body-serif text-[0.84rem] text-[#847E72] leading-[1.6] font-[300] mb-4 flex-1">
                {card.desc}
              </p>

              {/* Footer: stats + category */}
              <div className="flex items-center gap-3 pt-[14px] border-t border-[#DDD8CB]">
                <span className="font-mono-jb text-[0.68rem] text-[#847E72] flex items-center gap-1">
                  <strong className="text-[#302B24] font-[500]">{card.stat1Value}</strong>
                  {card.stat1Label}
                </span>
                <span className="w-px h-[10px] bg-[#DDD8CB]" />
                <span className="font-mono-jb text-[0.68rem] text-[#847E72] flex items-center gap-1">
                  <strong className="text-[#302B24] font-[500]">{card.stat2Value}</strong>
                  {card.stat2Label}
                </span>
                <span className="font-mono-jb text-[0.62rem] ml-auto px-2 py-[3px] rounded-[4px] bg-[rgba(25,22,19,0.05)] text-[#5C564C]">
                  {card.category}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Responsive grid overrides via style tag — Tailwind can't express grid-template breakpoints as cleanly */}
      <style>{`
        .intel-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 960px) {
          .intel-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .intel-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
