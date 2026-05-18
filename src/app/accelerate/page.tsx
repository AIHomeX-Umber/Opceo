import { generateMetadata as gm } from '@/lib/seo';
import { AccelerateIntake } from '@/components/AccelerateIntake';

export const metadata = gm({
  title: 'Accelerate Your Build',
  description:
    '三条 AI 加速路径：Solo Builder、Team Track、Insider。马时科技帮你从 0 到 1 快速验证并推出产品。',
  path: '/accelerate',
});

const TRACKS = [
  {
    id: 'solo',
    label: 'Solo Builder',
    subtitle: '独立开发者加速',
    color: '#534AB7',
    description: '一个人，一条产品线，快速验证+推出',
    price: '¥2,800 / 期',
    perks: ['每周 1v1 战略同步', '产品工单审阅', '飞书/Discord 随时响应'],
  },
  {
    id: 'team',
    label: 'Team Track',
    subtitle: '小团队协作加速',
    color: '#1D9E75',
    description: '2–5 人团队，有产品、有用户、想快跑',
    price: '¥6,800 / 期',
    badge: 'Most Popular',
    perks: ['每周团队 OKR 复盘', '技术架构审阅', '投资人网络对接'],
  },
  {
    id: 'insider',
    label: 'Insider',
    subtitle: '创业者圈子会员',
    color: '#D85A30',
    description: '不需要一对一，只想要最强信息流+人脉',
    price: '¥980 / 年',
    perks: ['长三角 AI 活动优先票', '私域创业者群', '月度 AMA 直播'],
  },
] as const;

export default function AcceleratePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero */}
      <div className="mb-14">
        <p className="mb-3 font-mono text-xs text-white/30 uppercase tracking-widest">
          马时科技 · Mashi Technology
        </p>
        <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          Accelerate Your Build
        </h1>
        <p className="max-w-xl text-base text-white/50 leading-relaxed">
          选择一条路径，让马时团队帮你加速——从想法到付费用户，从局部混乱到有节奏地成长。
        </p>
      </div>

      {/* Track cards */}
      <div className="mb-16 grid gap-4 sm:grid-cols-3">
        {TRACKS.map((t) => (
          <div
            key={t.id}
            className="relative rounded-sm border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-colors"
            style={{ borderTopColor: t.color, borderTopWidth: 2 }}
          >
            {'badge' in t && t.badge && (
              <span
                className="absolute right-3 top-3 rounded-sm px-1.5 py-0.5 text-[10px] font-mono text-white"
                style={{ backgroundColor: t.color }}
              >
                {t.badge}
              </span>
            )}
            <div className="mb-3">
              <div className="text-sm font-semibold text-white">{t.label}</div>
              <div className="text-xs text-white/40">{t.subtitle}</div>
            </div>
            <p className="mb-3 text-xs text-white/50 leading-relaxed">{t.description}</p>
            <p className="mb-4 font-mono text-sm font-medium" style={{ color: t.color }}>
              {t.price}
            </p>
            <ul className="flex flex-col gap-1.5">
              {t.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-xs text-white/40">
                  <span style={{ color: t.color }}>✓</span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section className="mb-16 border-t border-white/5 pt-14">
        <h2 className="mb-8 text-lg font-semibold text-white">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            { step: '01', label: '填写申请', desc: '3 分钟表单，选路径、说目标' },
            { step: '02', label: '24h 回应', desc: '马时团队微信确认，了解现状' },
            { step: '03', label: '启动会', desc: '制定 4 周冲刺计划' },
            { step: '04', label: '持续加速', desc: '每周复盘，公开 Build Log' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-2">
              <span className="font-mono text-xs text-white/20">{item.step}</span>
              <span className="text-sm font-medium text-white">{item.label}</span>
              <span className="text-xs text-white/40 leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Intake form */}
      <section className="border-t border-white/5 pt-14">
        <h2 className="mb-2 text-lg font-semibold text-white">申请加入</h2>
        <p className="mb-8 text-sm text-white/40">4 步，不到 3 分钟。</p>
        <div className="max-w-lg">
          <AccelerateIntake />
        </div>
      </section>
    </div>
  );
}
