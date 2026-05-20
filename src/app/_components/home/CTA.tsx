// CTA — full-width closing section.
// Parchment bg, large editorial headline, single CTA button.
// Server component: no state.

import Link from 'next/link';

export function CTA() {
  return (
    <section
      style={{
        background: '#F3EFE6',
        borderTop: '1px solid #DDD8CB',
        padding: 'clamp(64px, 10vw, 120px) clamp(24px, 5vw, 72px)',
        textAlign: 'center',
      }}
    >
      <p className="font-mono-jb text-[0.68rem] tracking-widest text-[#C15F3C] uppercase mb-6">
        加入 OpCEO
      </p>

      <h2
        className="font-display font-medium text-[#191613] leading-[1.15] mx-auto mb-8"
        style={{
          fontSize: 'clamp(1.9rem, 5vw, 3.4rem)',
          maxWidth: 680,
        }}
      >
        Builder 正在 Ship，
        <br />
        <span style={{ color: '#5C564C', fontStyle: 'italic' }}>你看见了吗？</span>
      </h2>

      <p
        className="font-body-serif text-[0.92rem] text-[#5C564C] leading-[1.75] font-[300] mx-auto mb-10"
        style={{ maxWidth: 420 }}
      >
        每周一份 Brief，一位 Builder，一条增长弧线。免费订阅，无需绑卡。
      </p>

      <Link
        href="/auth/register"
        className="inline-block font-body-serif text-[0.95rem] text-[#FAFAF5] bg-[#191613] hover:bg-[#302B24] px-8 py-[14px] rounded-[8px] no-underline transition-colors duration-[200ms]"
      >
        开始阅读
      </Link>
    </section>
  );
}
