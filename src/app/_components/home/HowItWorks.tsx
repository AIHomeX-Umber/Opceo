// IntelTransition — single editorial line between Intel Cards and Intel Preview.
// Replaces the old 3-column "How It Works" explainer.

export function HowItWorks() {
  return (
    <section
      style={{
        background: '#FAFAF5',
        padding: '48px clamp(24px, 5vw, 72px)',
        textAlign: 'center',
      }}
    >
      <p
        className="font-display"
        style={{
          fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: '#847E72',
          lineHeight: 1.55,
          margin: '0 auto',
          maxWidth: 540,
        }}
      >
        Not interviews. Not case studies.
        <br />
        Structured action intelligence from real builders.
      </p>
    </section>
  );
}
