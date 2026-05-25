// src/data/intel-briefs.ts
// Complete structured content for all 6 OpCEO Intel Briefs.
// Used by /intel/[slug] SSG pages.

export interface TimelineEvent {
  day: string;
  action: string;
  result: string;
  detail?: string;
}

export interface Decision {
  title: string;
  why: string;
  action: string;
  result: string;
  unexpected: string;
  ifRedo: string;
}

export interface IntelBrief {
  slug: string;
  title: string;
  builderName: string;
  builderInitials: string;
  location: string;
  product: string;
  category: string;
  cardColor: string;
  headline: string;
  metrics: {
    primary: { value: string; label: string };
    secondary: { value: string; label: string };
    tertiary?: { value: string; label: string };
  };
  stack: string[];
  growthSource: string;
  biggestLever: string;
  timeline: TimelineEvent[];
  decisions: Decision[];
  resourceStack: {
    tools: { name: string; purpose: string }[];
    monthlyCost: string;
  };
  repeatableMoves: string[];
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
  readTime: string;
}

// ─── Brief 1 ─────────────────────────────────────────────────────────────────

const brief1: IntelBrief = {
  slug: 'ai-thumbnail-43days',
  title: '从副业项目到 $8.2K MRR：43 天复盘',
  builderName: 'Jake Kim',
  builderInitials: 'JK',
  location: 'Seoul',
  product: 'AI Thumbnail Generator',
  category: 'Coding Agents',
  cardColor: '#D4896A',
  headline: 'Free tier as distribution + short build clips on X = compound growth',
  metrics: {
    primary:   { value: '$8.2K', label: 'MRR' },
    secondary: { value: '43',    label: '天' },
    tertiary:  { value: '$87',   label: '总花费' },
  },
  stack: ['Claude API', 'Next.js', 'Vercel', 'Replicate', 'LemonSqueezy'],
  growthSource: 'X short clips + free watermark tier',
  biggestLever: 'Free watermark export — users became distribution',
  timeline: [
    { day: 'Day 1',  action: '上线 waitlist 单页', result: '34 signups', detail: '只用了个人朋友圈，没有公开推广' },
    { day: 'Day 3',  action: '用 Claude API + Replicate 搭出 MVP', result: '核心功能跑通', detail: '图片生成 + 文字叠加，2 天写完' },
    { day: 'Day 6',  action: '在 X 发第一条 build clip（22 秒屏录）', result: '12K views, 89 signups', detail: '没有剪辑，直接录屏 + 配字幕' },
    { day: 'Day 11', action: '上线免费层：无限免费导出，带水印', result: '注册率 +340%', detail: '原来犹豫要不要做免费层，后来发现免费用户变成了最好的分发渠道' },
    { day: 'Day 15', action: '优化 prompt engineering，提升图片质量', result: '用户满意度明显提升', detail: '从通用 prompt 改为按场景分类的 prompt 模板' },
    { day: 'Day 22', action: '增加模板预设功能', result: '日活从 120 涨到 340', detail: '用户不想从零开始，模板降低了使用门槛' },
    { day: 'Day 27', action: '重新设计 onboarding：从 5 步压缩到 2 步', result: '激活率 21% → 38%', detail: '去掉了注册时的问卷和教程弹窗' },
    { day: 'Day 35', action: 'Cold DM 73 位内容创作者，推 affiliate', result: '3 位合作，带来 220 个付费转化', detail: '只联系了粉丝量 5K-50K 的中腰部创作者' },
    { day: 'Day 43', action: 'Template marketplace 上线——用户可分享和购买预设', result: '达到 $8.2K MRR', detail: '用户生成内容变成了新的增长引擎' },
  ],
  decisions: [
    {
      title: 'Free Watermark Plan',
      why: '付费转化率太低，用户不信任输出质量。需要让用户先体验到价值。',
      action: '上线无限免费导出，但所有免费导出的图片带产品水印。',
      result: '注册率 +340%。付费转化前两周没变化，模板功能上线后翻倍。',
      unexpected: '大部分免费用户变成了分发渠道——他们在社交媒体上发的图片自带水印广告。',
      ifRedo: '会更早上线免费层，不应该犹豫了两周。',
    },
    {
      title: 'Onboarding 精简',
      why: '数据显示 60% 的用户在注册后第二步就流失了。Onboarding 太长太复杂。',
      action: '把 5 步注册流程压缩到 2 步：选模板 → 生成第一张图。',
      result: '激活率从 21% 涨到 38%。',
      unexpected: '去掉用户问卷后，反而更容易通过用户行为数据判断他们的需求。',
      ifRedo: '从第一天就应该是 2 步 onboarding。不要在早期做用户画像收集。',
    },
    {
      title: '中腰部创作者 Affiliate',
      why: '头部 KOL 不回复，广告太贵。中腰部创作者（5K-50K 粉丝）回复率高且更信任产品。',
      action: 'Cold DM 73 位，给 30% 佣金 + 免费 Pro 账户。',
      result: '3 位合作，带来 220 个付费转化，CAC ≈ $0.4。',
      unexpected: '其中一位创作者自发做了产品对比视频，带来了后续长尾流量。',
      ifRedo: '会更系统化地做 affiliate outreach，而不是随缘 DM。',
    },
  ],
  resourceStack: {
    tools: [
      { name: 'Claude API',        purpose: '文案生成和 prompt 优化' },
      { name: 'Replicate',         purpose: '图片生成模型托管' },
      { name: 'Next.js + Vercel',  purpose: '前端和部署' },
      { name: 'Supabase',          purpose: '用户数据和认证' },
      { name: 'LemonSqueezy',      purpose: '支付和订阅管理' },
      { name: 'Resend',            purpose: '交易邮件' },
    ],
    monthlyCost: '~$312/月',
  },
  repeatableMoves: [
    '先发 10 条短 build clip 再优化产品——验证需求比打磨功能更重要',
    '在加功能之前先加一个免费分发层——让用户帮你做广告',
    '联系中腰部创作者而不是买广告——CAC 可以接近 $0',
  ],
  metaTitle: '从副业到 $8.2K MRR：43 天 AI 缩略图工具增长复盘 | OpCEO.AI',
  metaDescription: 'Jake Kim 如何用 Claude + Replicate 做了一个 AI 缩略图工具，43 天达到 $8.2K MRR。免费水印策略、22 秒 build clip、onboarding 精简的完整决策拆解。',
  publishedAt: '2026-05-20',
  readTime: '4 min',
};

// ─── Brief 2 ─────────────────────────────────────────────────────────────────

const brief2: IntelBrief = {
  slug: 'notion-templates-zero-ads',
  title: '0 广告预算拿到 2,400 用户：Notion 模板增长路径',
  builderName: 'Maria Chen',
  builderInitials: 'MC',
  location: 'Toronto',
  product: 'Notion Template Marketplace',
  category: 'AI SaaS',
  cardColor: '#B7C9B5',
  headline: 'Reddit long-form as growth channel + 3x price increase without losing conversion',
  metrics: {
    primary:   { value: '2,400', label: '用户' },
    secondary: { value: '$0',    label: '广告花费' },
    tertiary:  { value: '$9→$29', label: '定价迭代' },
  },
  stack: ['Notion API', 'Gumroad', 'Reddit', 'Carrd'],
  growthSource: 'Reddit long-form posts in niche subreddits',
  biggestLever: 'Price increase from $9 to $29 — tripled revenue, same conversion',
  timeline: [
    { day: 'Week 1',  action: '调研 Notion 模板市场，锁定 freelancer 人群', result: '确定方向：项目管理 + 发票模板', detail: '发现现有模板要么太简单要么太复杂' },
    { day: 'Week 2',  action: '做出第一批 5 个模板，定价 $9', result: '上线 Gumroad，第一周 3 笔销售', detail: '用 Carrd 做了极简落地页' },
    { day: 'Week 4',  action: '在 r/freelance 和 r/Notion 发长文帖子', result: '单帖带来 340 次访问，22 笔转化', detail: "帖子内容是'我如何用 Notion 管理 15 个客户'的真实经验分享" },
    { day: 'Week 6',  action: '定价从 $9 调到 $19', result: '转化率只掉了 8%，收入翻倍', detail: '在涨价前给已有客户发了感谢邮件和免费升级' },
    { day: 'Week 8',  action: '再次涨价到 $29，增加 bundle 套餐', result: '收入再翻 1.5 倍', detail: 'Bundle 包含 5 个模板 + 视频教程，$29 的定价反而让用户觉得更专业' },
    { day: 'Week 10', action: '在 3 个 subreddit 保持每周 2 篇长文节奏', result: '累计 2,400 用户', detail: '帖子不推销产品，只分享方法论，底部留链接' },
    { day: 'Week 12', action: '建立邮件列表，开始发周报', result: '邮件列表 800 人，打开率 42%', detail: '周报内容是 freelancer 效率技巧，自然引导到模板' },
  ],
  decisions: [
    {
      title: 'Reddit 长文而非广告',
      why: '预算为零。尝试过 Twitter 但没有粉丝基础。Reddit 的 niche subreddit 有精准用户。',
      action: '在 r/freelance, r/Notion, r/productivity 发真实经验分享帖，1500-2000 字。',
      result: '平均每篇帖子带来 200-400 次产品页访问。',
      unexpected: '帖子的长期 SEO 效果超出预期——发了 3 个月后仍有搜索流量进来。',
      ifRedo: '从第一天就开始发帖，不要花两周"准备"。',
    },
    {
      title: '三次涨价',
      why: '第一版定价 $9 是因为没自信。看到转化数据后决定测试价格弹性。',
      action: '$9 → $19 → $29，每次间隔 2 周观察数据。',
      result: '收入从 $9×22/周 涨到 $29×18/周。转化率只从 6.5% 掉到 5.2%。',
      unexpected: '涨价后 support ticket 反而减少了——高价用户更认真使用产品。',
      ifRedo: '第一天就定 $29。低价吸引的是不认真的用户。',
    },
  ],
  resourceStack: {
    tools: [
      { name: 'Notion',     purpose: '模板制作' },
      { name: 'Gumroad',    purpose: '销售和支付' },
      { name: 'Carrd',      purpose: '落地页' },
      { name: 'Mailchimp',  purpose: '邮件列表' },
      { name: 'Loom',       purpose: '视频教程录制' },
    ],
    monthlyCost: '~$45/月',
  },
  repeatableMoves: [
    '在 niche subreddit 发长文分享，不推销——让内容自然引导',
    '不要害怕涨价——从 $9 到 $29 收入翻 3 倍但转化率只掉 20%',
    '给老用户发感谢邮件 + 免费升级后再涨价——减少负面反馈',
  ],
  metaTitle: '0 广告预算 2,400 用户：Notion 模板的 Reddit 增长路径 | OpCEO.AI',
  metaDescription: 'Maria Chen 零广告预算做 Notion 模板，通过 Reddit 长文获取 2,400 用户，三次涨价收入翻三倍的完整复盘。',
  publishedAt: '2026-05-18',
  readTime: '4 min',
};

// ─── Brief 3 ─────────────────────────────────────────────────────────────────

const brief3: IntelBrief = {
  slug: 'ai-newsletter-12weeks',
  title: 'Newsletter 12 周做到 $4K/月',
  builderName: 'Alex Rivera',
  builderInitials: 'AR',
  location: 'Berlin',
  product: 'AI Weekly Digest',
  category: 'AI Media',
  cardColor: '#B8A9D4',
  headline: 'Weekly depth > daily volume — and a template freebie beat every paid ad',
  metrics: {
    primary:   { value: '8K',  label: '订阅' },
    secondary: { value: '12',  label: '周' },
    tertiary:  { value: '3.2%', label: '付费转化' },
  },
  stack: ['Beehiiv', 'Claude API', 'Typefully', 'X / Twitter'],
  growthSource: 'X threads + Decision Framework template as lead magnet',
  biggestLever: 'Weekly deep dives instead of daily digest — open rate 18% → 41%',
  timeline: [
    { day: 'Week 1',  action: '在 X 发第一条 AI 工具汇总线程，日更', result: '获得 800 次展示，12 个新关注', detail: '内容是"5 个替代我设计流程的 AI 工具"' },
    { day: 'Week 2',  action: '改成每周 2 条深度线程，停止日更', result: '互动率 3 倍提升，粉丝增速加快', detail: '日更内容稀薄，用户开始忽略；深度内容每条都有数十条转发' },
    { day: 'Week 3',  action: '开设 Beehiiv newsletter，X 上公告', result: '第一天 340 个订阅者', detail: '直接从 X 粉丝导流，转化率约 6%' },
    { day: 'Week 4',  action: '用 Claude 起草前 4 期内容，自己编辑润色', result: '每期出稿时间从 4 小时压缩到 1 小时', detail: '流程：15 分钟列大纲 → Claude 生成草稿 → 45 分钟编辑加入自己的判断' },
    { day: 'Week 5',  action: '做"AI 决策框架"Google Doc，固定在 X 主页', result: '3 天内带来 800 个新订阅', detail: '模板可复制可分享，比 PDF 传播快 10 倍' },
    { day: 'Week 7',  action: '突破 3,000 订阅，上线付费版 $8/月', result: '第一周 42 个付费订阅，$336 MRR', detail: '付费内容包含深度案例拆解和每周 prompt 模板包' },
    { day: 'Week 9',  action: '切换为每周一篇深度报告格式（停日报）', result: '退订率下降 60%，打开率从 18% 升至 41%', detail: '读者开始期待这封邮件，而不是把它当作噪音' },
    { day: 'Week 11', action: '与 2 家 AI 工具公司达成赞助协议', result: '每月额外 $1,200 赞助收入', detail: '赞助形式是"本周工具推荐"，限每期 1 家，不影响内容调性' },
    { day: 'Week 12', action: '8,000 订阅，258 付费用户', result: '$4,064/月总收入（付费 $2,864 + 赞助 $1,200）', detail: '增长全部来自 X 有机流量，$0 广告投入' },
  ],
  decisions: [
    {
      title: '每周深度 vs 每日快报',
      why: '日更邮件打开率跌到 18%，读者开始退订。内容量多但价值密度低。',
      action: '停止日更，改为每周一篇 1,500-2,000 字深度报告，聚焦一个 AI 工具或策略主题。',
      result: '打开率从 18% 涨到 41%，退订率下降 60%，付费转化率 3 倍提升。',
      unexpected: '减少发送频率反而让读者更期待。每周发布变成了"事件"，而不是"噪音"。',
      ifRedo: '从第一期就做每周深度。不要因为"更新慢显得不勤奋"而日更——勤奋不等于价值。',
    },
    {
      title: '模板作为 Freebie，而非 PDF',
      why: '最初准备做一本 20 页的 PDF 指南作为 lead magnet，花了 3 天没做完。',
      action: '改做"AI 决策框架"Google Sheet 模板，2 小时完成，分享链接可直接复制。',
      result: '3 天内带来 800 个订阅，是之前单篇 X 线程引流的 4 倍。',
      unexpected: '模板被分享到 LinkedIn 和几个 Slack 社区，带来了 X 受众以外的流量。',
      ifRedo: '所有 freebie 都做成模板而非 PDF。模板有使用门槛，用了才会记住你。',
    },
    {
      title: 'Claude 起草 + 人工编辑',
      why: '内容需求量大，全手写不可持续。但直接发 AI 内容会失去个人声音。',
      action: '用 Claude 生成结构化草稿（事实、数据、框架），自己写观点段落和结语。',
      result: '出稿时间从 4 小时压缩到 1 小时，读者反馈内容质量没有下降。',
      unexpected: '一些读者说这期"特别有你的风格"——恰好是 Claude 写的那期（我编辑了 60%）。',
      ifRedo: '更早建立这个工作流。前 3 周全手写浪费了大量时间。',
    },
  ],
  resourceStack: {
    tools: [
      { name: 'Beehiiv',     purpose: 'Newsletter 平台，订阅管理和发送' },
      { name: 'Claude API',  purpose: '每期草稿生成和 prompt 模板包制作' },
      { name: 'Typefully',   purpose: 'X 线程排期和数据分析' },
      { name: 'Loom',        purpose: '付费版专属视频内容录制' },
      { name: 'Gumroad',     purpose: '早期付费订阅（后迁移至 Beehiiv 内置付费）' },
    ],
    monthlyCost: '~$108/月',
  },
  repeatableMoves: [
    '发你的过程，不只是你的产品——"我如何用 AI" 的 X 线程比产品推广转化高 3 倍',
    '做模板而不是 PDF——模板可复制可分享，传播速度快 10 倍',
    '用 Claude 起草，但用你自己的观点收尾——读者为你的判断买单，不是为 AI 知识',
  ],
  metaTitle: 'AI Newsletter 12 周做到 $4K/月：从 0 到 8K 订阅的完整路径 | OpCEO.AI',
  metaDescription: 'Alex Rivera 如何在没有广告预算的情况下，用 X 线程 + 决策框架模板，12 周做到 8,000 订阅和 $4,000/月的 Newsletter 收入。',
  publishedAt: '2026-05-15',
  readTime: '4 min',
};

// ─── Brief 4 ─────────────────────────────────────────────────────────────────

const brief4: IntelBrief = {
  slug: 'api-weekend-hack',
  title: '周末 Hack 卖 API：$12K MRR 的路径',
  builderName: 'Dev Patel',
  builderInitials: 'DP',
  location: 'Singapore',
  product: 'ImagePipe API',
  category: 'AI Infra',
  cardColor: '#D4C17A',
  headline: 'HN launch + monthly pricing + Hetzner migration = $12K MRR with $175/mo infra cost',
  metrics: {
    primary:   { value: '$12K', label: 'MRR' },
    secondary: { value: '67',   label: '天' },
    tertiary:  { value: '$0',   label: '营销花费' },
  },
  stack: ['Python', 'FastAPI', 'Hetzner', 'Stripe', 'Cloudflare'],
  growthSource: 'Hacker News "Show HN" — #4 that day, zero paid promotion',
  biggestLever: 'Switching from pay-per-use to monthly plans — ARPU 4×',
  timeline: [
    { day: 'Day 1–2',  action: '利用周末搭建 ImagePipe MVP：调整大小、压缩、格式转换 API', result: '核心接口跑通，部署到 AWS', detail: '只用了 FastAPI + Pillow，代码 400 行。没有文档，只有一个 README' },
    { day: 'Day 3',   action: '在 HN 发 "Show HN: Simple image API that doesn\'t need AWS SDK"', result: '当日排名第 4，1,200 upvotes，300 个注册', detail: '标题强调"简单"和"无 SDK"——开发者讨厌复杂 API' },
    { day: 'Day 5',   action: '按次计费上线，$0.002/次调用', result: '$0 收入，没人愿意付钱', detail: '用户反馈：不知道每月会花多少钱，所以选择不用' },
    { day: 'Day 8',   action: '对 20 个注册用户发邮件问为什么没有升级', result: '17 人回复：都说想要月付方案', detail: '用户原话：开发者不喜欢按次计费，太难预算' },
    { day: 'Day 12',  action: '上线三档月付套餐：$19 / $49 / $99', result: '一周内 $1,400 收入', detail: '$49 套餐选择最多，超出预期' },
    { day: 'Day 20',  action: '达到 $3K MRR，AWS 账单 $890/月', result: 'AWS 成本占收入近 30%', detail: '主要成本是带宽和 EC2，随流量线性增长' },
    { day: 'Day 35',  action: '将全部基础设施迁移到 Hetzner（柏林节点）', result: '月度基础设施成本从 $890 降到 $145', detail: '同等性能，Hetzner 专用服务器 €89/月；用自建队列替代 AWS SQS' },
    { day: 'Day 50',  action: '新增批量处理接口，推出 Enterprise 套餐 $299/月', result: '第一周 3 个企业客户，+$897 MRR', detail: '企业需求：一次调用处理 500 张图，之前的套餐无法支持' },
    { day: 'Day 67',  action: '148 个活跃客户（8 企业 + 140 普通），稳定增长', result: '达到 $12K MRR', detail: '完全 $0 广告投入，所有增长来自 HN 口碑和 SEO' },
  ],
  decisions: [
    {
      title: '月付套餐代替按次计费',
      why: '300 个注册，$0 收入。发现按次计费让开发者无法预估成本，干脆不用。',
      action: '停掉按次计费，上线 $19/$49/$99 月付三档，提供调用量上限。',
      result: 'ARPU 从 $3.20（按次估算） 涨到平均 $49/月，一周内收入 $1,400。',
      unexpected: '涨价到 $99 的企业套餐比预期受欢迎——大客户更愿意支付固定成本以获得 SLA。',
      ifRedo: '第一天就上月付套餐。按次计费在 API 产品上几乎不可行，除非你是 OpenAI。',
    },
    {
      title: 'Hetzner 替代 AWS',
      why: 'AWS 账单随用户增长线性膨胀，$3K MRR 时基础设施成本已占 30%。',
      action: '把全部服务迁移到 Hetzner 专用服务器（€89/月），用 BullMQ 替代 SQS，Cloudflare 做 CDN。',
      result: '月基础设施成本从 $890 降到 $145，降幅 84%，性能没有下降。',
      unexpected: '迁移只花了 3 天，没有停机。比预期容易得多——AWS 的迁出比迁入简单。',
      ifRedo: '收入超过 $1K/月就迁 Hetzner，不用等到 $3K。AWS 在早期纯属过度工程。',
    },
    {
      title: '只用 HN，不用 Product Hunt',
      why: 'Product Hunt 发布越来越卷，大量产品同时竞争，开发者用户比例低。HN 读者是真实的工程师。',
      action: '写了一个诚实的 Show HN 帖：没有营销语言，直接描述 API 做什么、用了哪些技术。',
      result: '当天排名第 4，带来 1,200 次 upvote 和 300 个注册。至今仍有长尾 SEO 流量。',
      unexpected: 'HN 帖子在 Google 搜索 "image processing API" 排名第二，至今每周还有 30-40 个自然注册。',
      ifRedo: '发 HN 之前先把文档写完——300 个注册里有 40% 因为没有文档就离开了。',
    },
  ],
  resourceStack: {
    tools: [
      { name: 'Python + FastAPI',  purpose: 'API 核心逻辑' },
      { name: 'Hetzner VPS',       purpose: '主服务器（€89/月）' },
      { name: 'Cloudflare',        purpose: 'CDN + DDoS 防护（免费）' },
      { name: 'BullMQ + Redis',    purpose: '批量任务队列（替代 AWS SQS）' },
      { name: 'Stripe',            purpose: '订阅和支付管理' },
      { name: 'Plausible',         purpose: '流量分析（$9/月）' },
    ],
    monthlyCost: '~$175/月',
  },
  repeatableMoves: [
    '发 HN Show HN 早于 Product Hunt——开发者工具在 HN 的转化质量高 5 倍',
    '对所有 API 产品用月付套餐，别做按次计费——开发者要可预测的成本',
    'MRR 超过 $1K 就从 AWS 迁到 Hetzner——同等性能，节省 80% 基础设施成本',
  ],
  metaTitle: '周末 Hack 卖 API：67 天做到 $12K MRR 的完整路径 | OpCEO.AI',
  metaDescription: 'Dev Patel 如何在新加坡独自开发 ImagePipe API，从 HN 发布、月付定价到 Hetzner 迁移，67 天做到 $12K MRR 且基础设施成本仅 $175/月。',
  publishedAt: '2026-05-12',
  readTime: '5 min',
};

// ─── Brief 5 ─────────────────────────────────────────────────────────────────

const brief5: IntelBrief = {
  slug: 'factory-first-ai-product',
  title: '工厂老板的第一个 AI 产品：首月 $3K',
  builderName: 'Li Wei',
  builderInitials: 'LW',
  location: 'Suzhou',
  product: 'ListCraft — AI Listing Tool',
  category: 'AI Commerce',
  cardColor: '#8BAEC4',
  headline: 'Solving your own workflow beats user research every time — especially in manufacturing',
  metrics: {
    primary:   { value: '$3K', label: '首月收入' },
    secondary: { value: '30',  label: '天' },
    tertiary:  { value: '40',  label: '付费客户' },
  },
  stack: ['Claude API', 'n8n', 'TikTok Shop API', 'Feishu / 飞书'],
  growthSource: 'WeChat factory owner groups — 2 groups, 40 customers, $0 acquisition cost',
  biggestLever: 'Solving own daily pain point — zero market research, immediate product-market fit',
  timeline: [
    { day: 'Week 1 — 发现痛点', action: '每天花 3 小时给自己工厂的 300 个 SKU 写 TikTok Shop 商品描述', result: '确认痛点：批量生成符合平台规范的文案是核心需求', detail: '工厂旺季时描述质量参差不齐，转化率波动大' },
    { day: 'Week 1 — 搭原型', action: '用 n8n 搭了一个自动化流程：上传商品图片和规格 → Claude 生成 5 个文案版本', result: '核心功能 8 小时搭完，自己工厂先跑', detail: '没有 UI，只有 n8n 的 webhook 和飞书表单' },
    { day: 'Week 2 — 自用测试', action: '用工具处理自己工厂 300 个 SKU', result: '80% 的文案直接可用，节省每天 2.5 小时', detail: '剩余 20% 需要人工调整，主要是专有名词和品类规范' },
    { day: 'Week 2 — 验证需求', action: '在工厂老板微信群（450 人）发了一条消息：我做了个工具帮我省了 2.5 小时，有人需要吗', result: '23 条私信，全是"怎么用"或"多少钱"', detail: '没有任何推销，只是一句实话——真实需求自己冒出来了' },
    { day: 'Week 3 — 定价上线', action: '给第一批 8 位朋友开权限，定价 ¥299/月', result: '8 人全部付款，当天到账', detail: '用飞书表单收需求，用飞书机器人发账户信息——全程无代码' },
    { day: 'Week 4 — 迭代功能', action: '根据 8 位用户反馈新增视频脚本生成和买家评论回复模板', result: '用户续费率 100%，继续传播', detail: '功能来自用户的真实诉求，不是自己猜的' },
    { day: 'Week 6 — 口碑扩散', action: '微信群里的用户开始主动分享截图，新用户持续涌入', result: '付费客户累计 40 人，月收入 ¥11,960（约 $1,650）', detail: '完全依靠口碑，没有做任何主动推广' },
    { day: 'Week 8 — TikTok Shop API', action: '对接 TikTok Shop 官方 API，支持直接发布商品，不只是生成文案', result: '首月总收入突破 $3,000（含早期客户升级付费）', detail: 'TikTok Shop 直接发布功能让产品从"省时工具"升级为"自动化工具"' },
  ],
  decisions: [
    {
      title: '先解决自己的问题',
      why: '没有时间做用户调研，也不确定有没有市场。就想解决自己每天浪费的 3 小时。',
      action: '做了一个只为自己用的 n8n + Claude 自动化流程，没有 UI，没有品牌。',
      result: '自用 1 周后确认有效，在微信群分享，23 个人主动问价格。',
      unexpected: '解决自己问题的工具，往往也是解决同行问题的工具——工厂老板的工作流程高度相似。',
      ifRedo: '会更早在同行群里分享自己的痛点，而不是先把产品做"完整"再推广。真实的痛点描述比产品演示更能引发共鸣。',
    },
    {
      title: '微信群而非社交媒体',
      why: 'TikTok 卖家群体聚集在微信群，不在 Twitter 或 LinkedIn。目标用户在哪，就去哪。',
      action: '在 2 个工厂老板微信群（合计 750 人）直接分享使用截图和时间节省数据，底部加一句"有需要私信我"。',
      result: '前 40 个付费客户全部来自这 2 个微信群。获客成本 = $0。',
      unexpected: '老用户会自发在新群里推荐，不需要要求他们——解决了真实问题的工具会自己传播。',
      ifRedo: '会更系统地整理目标客户在哪些微信群、QQ 群活跃，优先进驻最垂直的圈子。',
    },
    {
      title: 'TikTok Shop 而非速卖通或亚马逊',
      why: '亚马逊 listing 优化工具已经是红海。TikTok Shop 2024 年快速增长，卖家工具极度稀缺。',
      action: '优先对接 TikTok Shop API，在工具上线 2 个月内支持直接发布，不只是生成文案。',
      result: '直接发布功能成为付费升级的核心理由，客单价从 ¥299 提升到 ¥599。',
      unexpected: 'TikTok Shop 官方 API 申请比预期简单——申请通过用了 3 天，不是 3 周。',
      ifRedo: '在搭 MVP 的第一天就申请 API 权限，不要等产品成型再去申请。',
    },
  ],
  resourceStack: {
    tools: [
      { name: 'Claude API',       purpose: '商品文案、视频脚本、评论回复生成' },
      { name: 'n8n（自托管）',    purpose: '核心自动化流程编排' },
      { name: 'TikTok Shop API',  purpose: '商品直接发布' },
      { name: '飞书（Feishu）',   purpose: '用户提交表单 + 内部通知机器人' },
      { name: '腾讯云 CVM',       purpose: '服务器托管（¥239/月）' },
    ],
    monthlyCost: '~¥1,560/月（约 $215）',
  },
  repeatableMoves: [
    '先做自己每天用的工具，不要先做市场调研——自己的痛点往往就是同行的痛点',
    '中国商业用户在微信群，不在 Twitter——找到目标客户聚集的那 2 个群，比开 10 个广告账户有效',
    '盯新平台而不是大平台——TikTok Shop 工具比亚马逊工具竞争少 90%，先发优势真实存在',
  ],
  metaTitle: '工厂老板的第一个 AI 产品：30 天首月 $3K | OpCEO.AI',
  metaDescription: '苏州工厂老板 Li Wei 如何用 Claude + n8n 解决自己的选品文案痛点，通过 2 个微信群获取 40 个付费客户，首月做到 $3K 收入。',
  publishedAt: '2026-05-10',
  readTime: '4 min',
};

// ─── Brief 6 ─────────────────────────────────────────────────────────────────

const brief6: IntelBrief = {
  slug: 'build-in-public-90days',
  title: 'Build in Public 如何真正转化：90 天证据',
  builderName: 'Sarah Nakamura',
  builderInitials: 'SN',
  location: 'Tokyo',
  product: 'DesignSnap',
  category: 'AI Workforce',
  cardColor: '#D4A0A0',
  headline: 'Sharing failures converts better than sharing wins — and no landing page outperformed every A/B test',
  metrics: {
    primary:   { value: '500', label: '付费用户' },
    secondary: { value: '90',  label: '天' },
    tertiary:  { value: '$0',  label: '广告花费' },
  },
  stack: ['Cursor', 'Supabase', 'Vercel', 'X / Twitter'],
  growthSource: 'X / Twitter — sole channel, zero paid distribution',
  biggestLever: 'Sharing failures publicly, not just wins — 3× engagement and trust',
  timeline: [
    { day: 'Day 1',  action: '在 X 发第一条 build in public 更新："Day 1：$0 收入，0 个用户，1 个想法。屏幕截图附上。"', result: '32 次互动，8 个新关注', detail: '没有任何产品演示，只有一个空的 dashboard 截图——真实感就是内容' },
    { day: 'Week 2', action: '收入 $47，公开发布数据（包括 $47 这个尴尬数字）', result: '互动量是之前 3 倍，40 个新关注', detail: '很多人私信说"谢谢你不假装成功"——低收入反而建立了信任' },
    { day: 'Week 3', action: '发了一条失败帖：AI 颜色推荐功能做出来效果很差，附截图', result: '最高转发推文，890 次转发', detail: '失败比成功更真实。建造者社区对"做烂了"有共鸣' },
    { day: 'Week 4', action: '突破 1,000 关注，没有落地页——X 主页直接链到注册', result: '前 12 个付费用户全部来自 X 主页点击', detail: 'Bio 一行字：AI design feedback tool. Try it free → [link]' },
    { day: 'Week 6', action: '发了 MRR 趋势图：$0 → $340 → $1,200，6 周增长弧线', result: '4,200 次转发，3,000 个新关注', detail: '图表比文字更直观，增长弧线让人想看接下来发生什么' },
    { day: 'Week 7', action: '达到 200 个付费用户', result: '$3,200 MRR', detail: '全部来自 X，$0 广告。增长速度开始加速' },
    { day: 'Week 8', action: '公开披露月支出 $890 和预计 Runway 14 个月', result: '评论区震惊，但信任度大幅提升，当周 +60 个付费用户', detail: '大部分建议我别公开 burn rate。公开后反而成了"投资人看着我成长"的感觉' },
    { day: 'Week 10', action: '拒绝了一个 VC 的冷接触，在 X 上发帖说明原因', result: '24 小时内 80 个新注册', detail: '解释了为什么不想接受稀释。读者认为这是产品自信的表现' },
    { day: 'Day 90', action: '500 个付费用户，$8K MRR，仍在增长', result: '全部来自 X，$0 广告，无落地页', detail: '90 天总结帖成为当月最多转发的 indie hacker 内容之一' },
  ],
  decisions: [
    {
      title: '公开失败，而不只是成功',
      why: '最初打算只发里程碑（$1K MRR、$5K MRR）。但发现这类帖子互动很低，感觉像广告。',
      action: '改成记录所有真实进展：$47 的尴尬收入、做烂的功能、有用户投诉的一周。',
      result: '失败帖互动量平均是成功帖的 3 倍。关注者数量增长速度加快 2 倍。',
      unexpected: '最多转发的帖子是"这个 AI 功能做烂了"——失败帖子带来的付费转化反而比成功帖子高。',
      ifRedo: '从第一天就只发真实内容，不过滤。"看起来成功"是 build in public 的最大陷阱。',
    },
    {
      title: '没有落地页',
      why: '本来计划做一个 Framer 落地页，但一直没时间做。测试期间直接用 X 主页链接注册。',
      action: '放弃落地页计划。X bio 一行字 + 注册链接，pinned tweet 是产品演示 GIF。',
      result: '从推文到注册的转化率（约 4.2%）高于后来 A/B 测试的落地页（2.8%）。',
      unexpected: '有了落地页反而转化率下降——多一个点击 = 多一次放弃机会。X 上的信任已经足够。',
      ifRedo: '对于已有 X 受众的产品，先不做落地页。等 MRR > $5K 再考虑 SEO 驱动的落地页。',
    },
    {
      title: '公开财务数据（包括 Runway）',
      why: 'build in public 社区里都发收入，但很少有人发支出和 runway。差异化机会。',
      action: '每月发一次：总收入、主要支出明细、剩余 runway。数字真实，不美化。',
      result: '当月最高涨粉周出现在发布 runway 帖子之后。付费用户增长提速。',
      unexpected: '企业客户更愿意付费——他们认为透明的创始人更值得信任，更不会突然关掉服务。',
      ifRedo: '更早开始发财务透明系列。这是建立长期信任最快的单一行动。',
    },
  ],
  resourceStack: {
    tools: [
      { name: 'Cursor',           purpose: '主要开发工具（内置 Claude 集成）' },
      { name: 'Supabase',         purpose: '数据库 + 用户认证' },
      { name: 'Vercel',           purpose: '前端部署' },
      { name: 'Stripe',           purpose: '支付和订阅' },
      { name: 'X / Twitter',      purpose: '唯一营销渠道（$0 花费）' },
    ],
    monthlyCost: '~$95/月',
  },
  repeatableMoves: [
    '在 X 发失败比发成功更重要——失败帖子的互动和转化都更高，而且建立更深的信任',
    '如果你已经有 X 受众，跳过落地页直接用 bio 链接——少一个点击就是多一次转化',
    '每月公开一次收入和支出——财务透明是 indie builder 最快建立信任的单一行动',
  ],
  metaTitle: 'Build in Public 90 天：如何用 X 做到 500 付费用户 $0 广告 | OpCEO.AI',
  metaDescription: 'Sarah Nakamura 在 Tokyo 用 90 天 Build in Public 策略，通过公开失败、无落地页、财务透明，从 X 获取 500 个付费用户和 $8K MRR，全程 $0 广告。',
  publishedAt: '2026-05-08',
  readTime: '5 min',
};

// ─── Exports ─────────────────────────────────────────────────────────────────

const BRIEFS: IntelBrief[] = [brief1, brief2, brief3, brief4, brief5, brief6];

export function getAllBriefs(): IntelBrief[] {
  return BRIEFS;
}

export function getBriefBySlug(slug: string): IntelBrief | undefined {
  return BRIEFS.find((b) => b.slug === slug);
}
