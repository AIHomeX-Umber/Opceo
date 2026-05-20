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
    title: '从副业项目到 $8.2K MRR：43 天复盘',
    desc: 'AI 缩略图工具。免费水印计划做冷启动，X 上 22 秒 Build 短片引流，注册流程从 5 步压缩到 2 步。',
    stat1Value: '$8.2K', stat1Label: 'MRR',
    stat2Value: '43',    stat2Label: '天',
    category: 'AI工具',
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
    title: '0 广告预算拿到 2,400 用户：Notion 模板增长路径',
    desc: 'Reddit 长文作为增长主渠道，定价从 $9 涨到 $29，收入翻三倍而转化率几乎不变。',
    stat1Value: '2.4K', stat1Label: '用户',
    stat2Value: '$0',   stat2Label: '广告',
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
    title: 'Newsletter 12 周做到 $4K/月',
    desc: 'AI 主题 Newsletter。Twitter 线程引流至 8K 订阅，用决策框架模板做 Freebie，3.2% 转付费。',
    stat1Value: '8K',  stat1Label: '订阅',
    stat2Value: '12',  stat2Label: '周',
    category: '内容增长',
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
    title: '周末 Hack 卖 API：$12K MRR 的路径',
    desc: '图像处理 API，2 天做完发 HN，从按次计费迭代到月付套餐，ARPU 提升 4 倍。',
    stat1Value: '$12K', stat1Label: 'MRR',
    stat2Value: '67',   stat2Label: '天',
    category: '开发工具',
    visColor: '#D4C17A',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
        <path d="M16 48l8-16 8 10 8-20 8 12"/>
        <path d="M12 48h40"/>
      </svg>
    ),
  },
  {
    title: '工厂老板的第一个 AI 产品：首月 $3K',
    desc: '跨境 AI 选品工具，解决自身痛点，上线 TikTok Shop，用 Claude 批量生成商品文案。',
    stat1Value: '$3K', stat1Label: '首月',
    stat2Value: '30',  stat2Label: '天',
    category: '跨境出海',
    visColor: '#8BAEC4',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
        <circle cx="32" cy="28" r="12"/>
        <path d="M20 46c0-6.63 5.37-12 12-12s12 5.37 12 12"/>
      </svg>
    ),
  },
  {
    title: 'Build in Public 如何真正转化：90 天证据',
    desc: '设计工具。公开所有数据指标，把透明度变成信任资产，仅靠 X 就带来 500 名付费用户。',
    stat1Value: '500', stat1Label: '付费',
    stat2Value: '90',  stat2Label: '天',
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
