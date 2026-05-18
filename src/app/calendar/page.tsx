import { generateMetadata as gm } from '@/lib/seo';
import { CalendarClient, type CalendarEvent } from '@/components/CalendarClient';

export const metadata = gm({
  title: '马时工作坊 · 长三角 AI 活动日历',
  description:
    '马时科技主办的 AI 创业者工作坊，以及精选长三角 AI 行业活动。每月更新。',
  path: '/calendar',
});

const EVENTS: CalendarEvent[] = [
  // ── June 2026 ──
  {
    id: 'w-2026-06-07',
    date: '2026-06-07',
    title: '马时工作坊 #12 — AI 产品 PMF 加速',
    type: 'internal',
    format: '线下工作坊',
    location: '上海 · 静安区',
    description: '从 0 到第一个付费用户：产品定位、定价策略、冷启动获客三板斧。',
    recurring: true,
  },
  {
    id: 'w-2026-06-14',
    date: '2026-06-14',
    title: '马时工作坊 #13 — 独立开发者如何写会销售的文案',
    type: 'internal',
    format: '线上直播',
    location: '飞书直播间',
    description: 'Landing page、朋友圈、冷邮件——用最少文字让陌生人付钱。',
    recurring: true,
  },
  {
    id: 'w-2026-06-21',
    date: '2026-06-21',
    title: '马时工作坊 #14 — Build in Public：公开建设的第一步',
    type: 'internal',
    format: '线下工作坊',
    location: '上海 · 静安区',
    description: '如何写周报、选平台、积累关注者，让建造过程本身成为营销。',
    recurring: true,
  },
  {
    id: 'w-2026-06-28',
    date: '2026-06-28',
    title: 'Accelerate 第 3 期 Demo Day',
    type: 'internal',
    format: '路演活动',
    location: '上海 · 静安区',
    description: '马时 Accelerate 第 3 期学员公开路演，欢迎投资人及行业伙伴旁听。',
  },
  {
    id: 'ext-2026-06-10',
    date: '2026-06-10',
    title: 'AI Founders Meetup · 上海站',
    type: 'external',
    format: '线下 Meetup',
    location: '上海 · 长宁区',
    description: '华东区 AI 创业者网络活动，聚焦 B2B SaaS 与企业级 AI 应用落地。',
    link: 'https://lu.ma',
  },
  {
    id: 'ext-2026-06-20',
    date: '2026-06-20',
    title: 'WAIC 2026 — 世界人工智能大会',
    type: 'external',
    format: '行业展会',
    location: '上海世博展览馆',
    description: '年度最大规模 AI 行业盛会，含论坛、展览与投融资路演专场。',
    link: 'https://www.worldaic.com.cn',
  },

  // ── July 2026 ──
  {
    id: 'w-2026-07-05',
    date: '2026-07-05',
    title: '马时工作坊 #15 — 用 AI 工具链提速 10 倍',
    type: 'internal',
    format: '线下工作坊',
    location: '上海 · 静安区',
    description: 'Cursor、Claude、n8n、Vercel——搭建一套属于独立开发者的 AI 工作流。',
    recurring: true,
  },
  {
    id: 'w-2026-07-12',
    date: '2026-07-12',
    title: '马时工作坊 #16 — SaaS 定价实战',
    type: 'internal',
    format: '线上直播',
    location: '飞书直播间',
    description: '免费增值 vs 订阅 vs 一次性买断：如何为你的 AI 工具选对定价模式。',
    recurring: true,
  },
  {
    id: 'accel-2026-07-14',
    date: '2026-07-14',
    title: 'Accelerate 第 4 期 · 启动日',
    type: 'internal',
    format: '线下工作坊',
    location: '上海 · 静安区',
    description: '马时 Accelerate 第 4 期正式启动，新一批 Solo Builder 与 Team Track 学员集结。',
  },
  {
    id: 'w-2026-07-19',
    date: '2026-07-19',
    title: '马时工作坊 #17 — 海外发布：Product Hunt + 英文社区增长',
    type: 'internal',
    format: '线下工作坊',
    location: '上海 · 静安区',
    description: '如何在 Product Hunt、Hacker News、Reddit 正确发布你的 AI 产品。',
    recurring: true,
  },
  {
    id: 'ext-2026-07-09',
    date: '2026-07-09',
    title: 'AI × 独立创作者论坛 · 杭州',
    type: 'external',
    format: '线下论坛',
    location: '杭州 · 西湖区',
    description: '聚焦内容创业与 AI 工具融合，适合媒体、播客、课程创作者。',
    link: 'https://lu.ma',
  },
  {
    id: 'ext-2026-07-26',
    date: '2026-07-26',
    title: 'IndieHackers China 夏季聚会',
    type: 'external',
    format: '线下 Meetup',
    location: '上海 · 黄浦区',
    description: '独立开发者与微型 SaaS 创始人非正式交流，无演讲只聊天。',
    link: 'https://x.com',
  },
];

export default function CalendarPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <p className="mb-3 font-mono text-xs text-white/30 uppercase tracking-widest">
          马时科技 · Mashi Technology
        </p>
        <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
          活动日历
        </h1>
        <p className="max-w-xl text-sm text-white/50 leading-relaxed">
          马时工作坊每周举办，聚焦 AI 创业者的产品、增长与融资话题。
          同步精选长三角 AI 行业活动，帮你一站式追踪值得出现的场合。
        </p>
      </div>

      <CalendarClient events={EVENTS} />

      {/* Disclaimer */}
      <p className="mt-12 border-t border-white/5 pt-6 text-xs text-white/20 leading-relaxed">
        外部活动为精选观察，最终以主办方公开信息为准。如需提交活动收录，请联系{' '}
        <span className="font-mono">mashitech</span>（微信）。
      </p>
    </div>
  );
}
