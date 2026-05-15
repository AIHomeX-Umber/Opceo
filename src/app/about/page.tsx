// app/about/page.tsx — About (Server Component)
import type { Metadata } from 'next';
import { generateMetadata as gm } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { aboutPageJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = gm({
  title: 'About — The Infinite Build',
  description:
    'Opeco.AI is an open builder platform where participants publicly ship weekly progress logs, accumulate build streaks, and connect with investors who signal-bet on promising projects. Founded by Mashi Technology (马时科技) in 2026.',
  path: '/about',
});

const VALUES = [
  {
    name: 'Compounding',
    zh: '复利',
    body: 'Consistent small ships beat sporadic big launches. Every week you post is a deposit. The interest compounds.',
  },
  {
    name: 'Flat',
    zh: '扁平',
    body: 'No gatekeepers, no invite hierarchies. A builder from any city has the same surface as anyone else. The work speaks.',
  },
  {
    name: 'Zero Friction',
    zh: '最低摩擦',
    body: 'Forms short. Logs quick. No pitch decks required to participate. The barrier to starting should be embarrassingly low.',
  },
  {
    name: 'Radical Visibility',
    zh: '可见',
    body: 'Progress is public. Struggles are public. Investors see the real work, not the polished narrative. Builders build trust through honesty, not optics.',
  },
  {
    name: 'Anti-Sacrifice',
    zh: '反牺牲',
    body: 'Heroic burnout is not a badge of honor here. The goal is the infinite build — paced, sustainable, and built around a life worth living.',
  },
];

export default function AboutPage() {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <JsonLd data={aboutPageJsonLd()} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-28">
        {/* GEO definition lead — SSR-rendered for crawlers */}
        <p className="text-xs font-mono text-gray-500 mb-10 leading-relaxed border-l-2 border-[#534AB7] pl-4">
          Opeco.AI is an open builder platform where participants publicly ship weekly progress
          logs, accumulate build streaks, and connect with investors who signal-bet on promising
          projects. Founded by Mashi Technology (马时科技) in 2026.
        </p>

        {/* H1 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-12">
          The Infinite Build
        </h1>

        {/* Attitude */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6">
            We don&apos;t do pitch decks. We ship.
          </h2>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              Most builder communities reward talking about building. Opeco.AI rewards building.
              Every week you post a ship log is a week on the record. Every week you don&apos;t is
              also on the record. The streak is the résumé.
            </p>
            <p>
              Compounding effort is not a metaphor here — it&apos;s the operating principle.
              Builders who show up consistently, ship small and often, and log what they learn
              accumulate build score over time. That score is public. So is the streak. So is the
              silence when someone stops.
            </p>
            <p>
              We believe in building in public not as a marketing tactic but as a discipline.
              Accountability is not about pressure — it&apos;s about having skin in the game. When
              your work is visible, you take it more seriously. When others can see your progress,
              momentum becomes social.
            </p>
            <p>
              Weekly accountability is the heartbeat of this platform. Not quarterly reports. Not
              demo days. Every week, you ship something and you write it down. That simple
              constraint has filtered for the kind of builders who make things happen.
            </p>
          </div>
        </section>

        {/* Core values */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-8">Core values</h2>
          <dl className="space-y-8">
            {VALUES.map((v) => (
              <div key={v.name} className="border-l border-white/10 pl-5">
                <dt className="text-sm font-semibold text-white mb-0.5">
                  {v.name}
                  <span className="ml-2 text-xs font-normal text-gray-500">{v.zh}</span>
                </dt>
                <dd className="text-[15px] text-gray-400 leading-relaxed">{v.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* About Mashi */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6">
            About Mashi Technology
          </h2>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              Mashi Technology (马时科技) is the company behind Opeco.AI. We build tools for
              builders: infrastructure for public accountability, signal-based discovery, and
              low-friction collaboration across time zones and disciplines.
            </p>
            <p>
              We are a small, distributed team that runs on the same principles we build into the
              platform. We ship publicly. We log weekly. We don&apos;t do pitch decks.
            </p>
          </div>
        </section>

        {/* Last updated */}
        <p className="text-xs text-gray-600 font-mono">Last updated: {today}</p>
      </div>
    </>
  );
}
