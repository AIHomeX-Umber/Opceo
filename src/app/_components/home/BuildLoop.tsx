const STEPS = [
  {
    label: 'Ship',
    title: '每周发布',
    body: '把本周真正推进的产品、实验和学习写下来。',
  },
  {
    label: 'Get Feedback',
    title: '获得反馈',
    body: '让其他建造者、用户和投资人看见你的真实进展。',
  },
  {
    label: 'Compound',
    title: '持续复利',
    body: '连续的公开轨迹会积累信任、机会和长期影响力。',
  },
];

export function BuildLoop() {
  return (
    <section className="bg-[#FAFAF5] px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono-jb text-[0.72rem] uppercase tracking-[0.18em] text-black/35">
            Build in public loop
          </p>
          <h2 className="font-display text-4xl font-medium tracking-[-0.04em] text-[#111111] sm:text-5xl">
            公开建造不是口号，是一个简单循环。
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.label}
              className="relative rounded-2xl border border-black/5 bg-white p-7 shadow-[0_18px_60px_rgba(20,20,20,0.03)]"
            >
              <div className="mb-9 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-[#FAFAF5] font-mono-jb text-[0.72rem] text-black/42">
                  0{index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div className="hidden h-px flex-1 bg-gradient-to-r from-black/10 to-transparent md:block" />
                )}
              </div>
              <p className="mb-3 font-mono-jb text-[0.7rem] uppercase tracking-[0.16em] text-[#5B4BFF]/70">
                {step.label}
              </p>
              <h3 className="font-display text-2xl font-medium tracking-[-0.035em] text-[#111111]">
                {step.title}
              </h3>
              <p className="mt-4 font-body-serif text-[1rem] leading-7 text-black/54">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
