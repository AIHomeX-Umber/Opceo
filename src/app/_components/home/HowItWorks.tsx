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
          maxWidth: 560,
        }}
      >
        Not interviews. Not case studies.
        <br />
        Structured action intelligence from real builders.
      </p>
      <p
        className="font-body-serif"
        style={{
          fontSize: 'clamp(0.82rem, 1.2vw, 0.92rem)',
          fontWeight: 300,
          color: '#AEA899',
          lineHeight: 1.6,
          margin: '10px auto 0',
          maxWidth: 440,
        }}
      >
        不是访谈，不是案例分析。来自真实 builder 的结构化行动情报。
      </p>
    </section>
  );
}
