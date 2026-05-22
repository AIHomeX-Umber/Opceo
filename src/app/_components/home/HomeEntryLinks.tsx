import Link from 'next/link';

const ENTRIES = [
  {
    href: '/calendar',
    label: '活动日历',
    title: '和建造者在线下见面',
    body: '工作坊、Demo Day 与 AI 创业者聚会，适合正在寻找反馈和同路人的你。',
  },
  {
    href: '/accelerate',
    label: '加速计划',
    title: '让产品进入下一轮节奏',
    body: '面向 AI-native builders 的短周期加速，帮助你把方向、发布和增长压实。',
  },
];

export function HomeEntryLinks() {
  return (
    <section className="bg-white px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono-jb text-[0.72rem] uppercase tracking-[0.18em] text-black/35">
            Gather and accelerate
          </p>
          <h2 className="font-display text-4xl font-medium tracking-[-0.04em] text-[#111111] sm:text-5xl">
            想 build 得更快？
          </h2>
          <p className="mt-5 font-body-serif text-[1.12rem] leading-8 text-black/54">
            加入线下工作坊与加速计划。不是广告入口，而是让公开建造更快形成节奏的下一步。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {ENTRIES.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group rounded-2xl border border-black/5 bg-[#FAFAF5] p-8 no-underline transition-all duration-200 hover:-translate-y-1 hover:border-black/10 hover:bg-white hover:shadow-[0_24px_70px_rgba(20,20,20,0.055)]"
            >
              <p className="font-mono-jb text-[0.72rem] uppercase tracking-[0.16em] text-[#5B4BFF]/70">
                {entry.label}
              </p>
              <h3 className="mt-8 max-w-md font-display text-3xl font-medium tracking-[-0.04em] text-[#111111]">
                {entry.title}
              </h3>
              <p className="mt-4 max-w-lg font-body-serif text-[1rem] leading-7 text-black/54">
                {entry.body}
              </p>
              <span className="mt-10 inline-flex font-body-serif text-[0.95rem] text-black/46 transition-colors group-hover:text-[#111111]">
                进入 {entry.label} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
