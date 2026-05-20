// HowItWorks — 3-step section explaining OpCEO's value proposition.
// Warm parchment background (#F3EFE6), numbered steps in terra accent.
// Server component: no state, no data fetching.

const STEPS = [
  {
    num: '01',
    title: '追踪真实 Builder',
    desc: '我们监控公开建造的 Solo Founder——从 X、独立黑客论坛、Newsletter 到 GitHub——只关注真实 Ship 信号，不看自我包装。',
  },
  {
    num: '02',
    title: '拆解增长路径',
    desc: '原始信号变成结构化情报：关键决策节点、增长拐点、核心杠杆。每份 Brief 对应一位 Builder，一条完整的增长弧线。',
  },
  {
    num: '03',
    title: '提炼可复用动作',
    desc: '按品类、收入阶段或增长打法筛选。直接复用有效动作，跳过噪音，用模式识别而非运气加速自己的 Build。',
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
        不是访谈，是结构化情报。
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
