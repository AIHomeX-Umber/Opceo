// RealWorldSignal — one-sentence pull quote linking to /accelerate.
// No badge, no label, no card. Just two italic lines and a link.
// Server component: no state.

import Link from 'next/link';

export function RealWorldSignal() {
  return (
    <section
      style={{
        background: '#F3EFE6',
        borderTop: '1px solid #DDD8CB',
        padding: '64px clamp(24px, 5vw, 72px)',
        textAlign: 'center',
      }}
    >
      <p
        className="font-display"
        style={{
          fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: '#5C564C',
          lineHeight: 1.45,
          margin: '0 auto',
          maxWidth: 560,
        }}
      >
        AI is leaving the builder bubble.<br />
        Factories are entering the AI era.
      </p>

      <Link
        href="/accelerate"
        className="font-body-serif inline-flex items-center gap-2 group no-underline"
        style={{
          marginTop: 28,
          fontSize: '0.9rem',
          color: '#C15F3C',
        }}
      >
        <span className="transition-transform duration-200 group-hover:translate-x-[-2px]">→</span>
        <span>Explore Factory AI Readiness</span>
      </Link>
    </section>
  );
}
