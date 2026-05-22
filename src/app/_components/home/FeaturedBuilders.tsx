import Image from 'next/image';
import Link from 'next/link';
import type { Builder } from '@/lib/types';

const FALLBACK_BUILDERS = [
  {
    slug: 'explore?tab=builders',
    display_name: '公开建造者',
    headline: '每周发布进展，把轨迹变成信任资产。',
    building: 'AI-native product',
    current_streak: 6,
    total_logs: 18,
    avatar_url: null,
  },
  {
    slug: 'explore?tab=builders',
    display_name: 'Solo Builder',
    headline: '用小步 ship 换来真实反馈和长期复利。',
    building: 'AI workflow',
    current_streak: 4,
    total_logs: 11,
    avatar_url: null,
  },
  {
    slug: 'explore?tab=builders',
    display_name: 'AI Founder',
    headline: '公开记录产品、用户和学习曲线。',
    building: 'public launch',
    current_streak: 3,
    total_logs: 9,
    avatar_url: null,
  },
];

type FeaturedBuilder = Pick<
  Builder,
  'slug' | 'display_name' | 'headline' | 'building' | 'current_streak' | 'total_logs' | 'avatar_url'
>;

export function FeaturedBuilders({ builders }: { builders: FeaturedBuilder[] }) {
  const visibleBuilders = builders.length > 0 ? builders : FALLBACK_BUILDERS;

  return (
    <section id="builders" className="bg-white px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 font-mono-jb text-[0.72rem] uppercase tracking-[0.18em] text-black/35">
              Featured builders
            </p>
            <h2 className="max-w-2xl font-display text-4xl font-medium tracking-[-0.04em] text-[#111111] sm:text-5xl">
              本周最值得关注的建造者
            </h2>
          </div>
          <Link
            href="/explore?tab=builders"
            className="font-body-serif text-[0.95rem] text-black/48 no-underline transition-colors hover:text-[#111111]"
          >
            查看全部 →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {visibleBuilders.map((builder) => {
            const href = builder.slug.startsWith('explore') ? `/${builder.slug}` : `/${builder.slug}`;
            const initial = builder.display_name.charAt(0).toUpperCase();

            return (
              <Link
                key={`${builder.slug}-${builder.display_name}`}
                href={href}
                className="group rounded-2xl border border-black/5 bg-white p-6 no-underline shadow-[0_18px_60px_rgba(20,20,20,0.035)] transition-all duration-200 hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_24px_70px_rgba(20,20,20,0.06)]"
              >
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full border border-black/5 bg-[#f4f1ea]">
                    {builder.avatar_url ? (
                      <Image
                        src={builder.avatar_url}
                        alt={`${builder.display_name} avatar`}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-xl text-black/42">
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[1.3rem] font-medium tracking-[-0.025em] text-[#111111]">
                      {builder.display_name}
                    </h3>
                    <p className="truncate font-body-serif text-[0.9rem] text-black/42">
                      {builder.building || 'building in public'}
                    </p>
                  </div>
                </div>

                <p className="min-h-[72px] font-body-serif text-[1rem] leading-7 text-black/58">
                  {builder.headline || '持续发布每周进展，让建造轨迹被更多人看见。'}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 border-t border-black/5 pt-5">
                  <div>
                    <p className="font-display text-3xl tracking-[-0.04em] text-[#111111]">
                      {builder.current_streak}
                    </p>
                    <p className="mt-1 font-mono-jb text-[0.62rem] uppercase tracking-[0.14em] text-black/34">
                      week streak
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-3xl tracking-[-0.04em] text-[#111111]">
                      {builder.total_logs}
                    </p>
                    <p className="mt-1 font-mono-jb text-[0.62rem] uppercase tracking-[0.14em] text-black/34">
                      weekly ships
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
