'use client';

import { useState, useEffect } from 'react';

type Track = 'solo' | 'team' | 'insider';

const TRACKS = [
  {
    id: 'solo' as Track,
    label: 'Solo Builder',
    subtitle: '独立开发者加速',
    color: '#534AB7',
    description: '一个人，一条产品线，快速验证+推出',
    price: '¥2,800 / 期',
    perks: ['每周 1v1 战略同步', '产品工单审阅', '飞书/Discord 随时响应'],
  },
  {
    id: 'team' as Track,
    label: 'Team Track',
    subtitle: '小团队协作加速',
    color: '#1D9E75',
    description: '2–5 人团队，有产品、有用户、想快跑',
    price: '¥6,800 / 期',
    badge: 'Most Popular',
    perks: ['每周团队 OKR 复盘', '技术架构审阅', '投资人网络对接'],
  },
  {
    id: 'insider' as Track,
    label: 'Insider',
    subtitle: '创业者圈子会员',
    color: '#D85A30',
    description: '不需要一对一，只想要最强信息流+人脉',
    price: '¥980 / 年',
    perks: ['长三角 AI 活动优先票', '私域创业者群', '月度 AMA 直播'],
  },
] as const;

const GOAL_OPTIONS = [
  '尽快上线第一个付费用户',
  '产品打磨 + PMF 验证',
  '融资准备 / 讲好故事',
  '团队扩张 + 流程建立',
  '我只是想看看有什么',
];

const TIMELINE_OPTIONS = [
  '1 个月内想启动',
  '3 个月内规划中',
  '6 个月后的事',
  '先了解，没有时间表',
];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  track: Track | '';
  goal: string;
  timeline: string;
  wechat: string;
  email: string;
}

interface AccelerateIntakeProps {
  defaultTrack?: Track;
}

export function AccelerateIntake({ defaultTrack }: AccelerateIntakeProps) {
  const [step, setStep] = useState<Step>(1);
  const [animKey, setAnimKey] = useState(0);
  const [form, setForm] = useState<FormData>({
    track: defaultTrack ?? '',
    goal: '',
    timeline: '',
    wechat: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultTrack) {
      setForm((f) => ({ ...f, track: defaultTrack }));
      goTo(2);
    }
  }, [defaultTrack]);

  function goTo(next: Step) {
    setAnimKey((k) => k + 1);
    setStep(next);
  }

  function selectTrack(t: Track) {
    setForm((f) => ({ ...f, track: t }));
    setTimeout(() => goTo(2), 250);
  }

  function selectOption(field: 'goal' | 'timeline', value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setTimeout(() => goTo(field === 'goal' ? 3 : 4), 250);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.wechat.trim()) {
      setError('请填写微信号，方便我们联系你');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/accelerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('submit failed');
      setDone(true);
    } catch {
      setError('提交失败，请稍后重试或直接微信联系 mashitech');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-sm border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mb-4 text-4xl">🚀</div>
        <h3 className="mb-2 text-lg font-semibold text-white">收到！</h3>
        <p className="text-sm text-white/50">
          24 小时内通过微信联系你。急的话直接加{' '}
          <span className="font-mono text-white/70">mashitech</span>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-[#534AB7]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <div
        key={animKey}
        style={{
          animation: 'fadeSlideIn 0.25s ease both',
        }}
      >
        {/* Step 1 — Track */}
        {step === 1 && (
          <div>
            <p className="mb-1 text-xs font-mono text-white/30 uppercase tracking-widest">
              Step 1 / 4
            </p>
            <h3 className="mb-5 text-base font-semibold text-white">
              你想走哪条路径？
            </h3>
            <div className="flex flex-col gap-3">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTrack(t.id)}
                  className={`group relative rounded-sm border p-4 text-left transition-all hover:border-white/20 hover:-translate-y-0.5 ${
                    form.track === t.id
                      ? 'border-white/20 bg-white/5'
                      : 'border-white/8 bg-white/[0.02]'
                  }`}
                >
                  {'badge' in t && t.badge && (
                    <span
                      className="absolute right-3 top-3 rounded-sm px-1.5 py-0.5 text-[10px] font-mono text-white"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.badge}
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {t.label}
                        <span className="ml-2 text-xs text-white/40">{t.subtitle}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-white/50">{t.description}</div>
                      <div className="mt-1 text-xs font-mono" style={{ color: t.color }}>
                        {t.price}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Goal */}
        {step === 2 && (
          <div>
            <p className="mb-1 text-xs font-mono text-white/30 uppercase tracking-widest">
              Step 2 / 4
            </p>
            <h3 className="mb-5 text-base font-semibold text-white">
              现在最想解决的是？
            </h3>
            <StepOptions
              options={GOAL_OPTIONS}
              selected={form.goal}
              onSelect={(v) => selectOption('goal', v)}
            />
          </div>
        )}

        {/* Step 3 — Timeline */}
        {step === 3 && (
          <div>
            <p className="mb-1 text-xs font-mono text-white/30 uppercase tracking-widest">
              Step 3 / 4
            </p>
            <h3 className="mb-5 text-base font-semibold text-white">
              大概什么时间段？
            </h3>
            <StepOptions
              options={TIMELINE_OPTIONS}
              selected={form.timeline}
              onSelect={(v) => selectOption('timeline', v)}
            />
          </div>
        )}

        {/* Step 4 — Contact */}
        {step === 4 && (
          <form onSubmit={handleSubmit}>
            <p className="mb-1 text-xs font-mono text-white/30 uppercase tracking-widest">
              Step 4 / 4
            </p>
            <h3 className="mb-5 text-base font-semibold text-white">最后，留个联系方式</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-white/50">
                  微信号 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="mashitech"
                  value={form.wechat}
                  onChange={(e) => setForm((f) => ({ ...f, wechat: e.target.value }))}
                  className="w-full rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[#534AB7] transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/50">
                  邮箱（可选）
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[#534AB7] transition-colors"
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-[#534AB7] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4339a0] disabled:opacity-50"
              >
                {submitting ? '提交中…' : '提交申请 →'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Back */}
      {step > 1 && (
        <button
          onClick={() => goTo((step - 1) as Step)}
          className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ← 上一步
        </button>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function StepOptions({
  options,
  selected,
  onSelect,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`rounded-sm border px-4 py-3 text-left text-sm transition-all hover:border-white/20 hover:-translate-y-0.5 ${
            selected === opt
              ? 'border-[#534AB7]/60 bg-[#534AB7]/10 text-white'
              : 'border-white/8 bg-white/[0.02] text-white/60 hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
