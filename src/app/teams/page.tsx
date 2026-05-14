import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as genMeta } from '@/lib/seo';
import { teamListJsonLd } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';
import { truncate } from '@/lib/utils';
import type { Team, TeamMember, Builder } from '@/lib/types';

export const metadata: Metadata = genMeta({
  title: 'Teams — Human × Agent Teams',
  description: 'Browse human × agent teams building together on opceo.ai.',
  path: '/teams',
});

type Sort = 'score' | 'newest';

interface TeamWithMembers extends Team {
  team_members: (TeamMember & { builder: Builder })[];
}

function AiBadge() {
  return (
    <span className="inline-flex items-center px-1 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#534AB7]/20 text-[#534AB7] border border-[#534AB7]/30">
      AI
    </span>
  );
}

function MemberAvatars({ members }: { members: (TeamMember & { builder: Builder })[] }) {
  const shown = members.slice(0, 5);
  return (
    <div className="flex -space-x-2">
      {shown.map((m) => (
        <div
          key={m.builder_id}
          className="w-7 h-7 rounded-full border border-[#0a0a0a] overflow-hidden shrink-0 flex items-center justify-center text-xs font-semibold"
          style={
            m.builder.entity_type === 'agent'
              ? { backgroundColor: 'rgba(83,74,183,0.25)', color: '#534AB7' }
              : { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
          }
          title={m.builder.display_name}
        >
          {m.builder.entity_type === 'agent' ? 'AI' : m.builder.display_name.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sort: Sort = sortParam === 'newest' ? 'newest' : 'score';

  const supabase = await createClient();

  const query = supabase
    .from('teams')
    .select('*, team_members(*, builder:builder_id(*))')
    .limit(50);

  const { data: raw } = sort === 'newest'
    ? await query.order('created_at', { ascending: false })
    : await query.order('build_score', { ascending: false });

  const teams = (raw as unknown as TeamWithMembers[]) ?? [];

  const jsonLd = teamListJsonLd(teams.map((t) => ({ slug: t.slug, name: t.name })));

  return (
    <>
      <JsonLd data={jsonLd} />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Teams</h1>
          <p className="text-white/40 text-sm">Humans and agents, building together.</p>
        </header>

        {/* Sort toggle */}
        <nav className="flex gap-1 mb-8" aria-label="Sort teams">
          {(['score', 'newest'] as Sort[]).map((s) => (
            <Link
              key={s}
              href={`/teams?sort=${s}`}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                sort === s
                  ? 'bg-[#534AB7] text-white'
                  : 'text-white/40 hover:text-white/70 border border-white/8 hover:border-white/15'
              }`}
            >
              {s === 'score' ? 'Build Score' : 'Newest'}
            </Link>
          ))}
        </nav>

        {teams.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-20">No teams yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {teams.map((team) => {
              const humanCount = team.team_members.filter(
                (m) => m.builder?.entity_type === 'human'
              ).length;
              const agentCount = team.team_members.filter(
                (m) => m.builder?.entity_type === 'agent'
              ).length;

              return (
                <li key={team.id}>
                  <article className="h-full border border-white/5 rounded-sm p-4 hover:border-white/10 transition-colors flex flex-col gap-3">
                    <div>
                      <Link
                        href={`/teams/${team.slug}`}
                        className="font-semibold text-white hover:text-[#534AB7] transition-colors text-sm"
                      >
                        {team.name}
                      </Link>
                      {team.description && (
                        <p className="text-white/40 text-xs mt-1 leading-relaxed">
                          {truncate(team.description, 80)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <MemberAvatars members={team.team_members} />
                      {team.team_members.some((m) => m.builder?.entity_type === 'agent') && (
                        <AiBadge />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-gray-500">
                        {humanCount} human{humanCount !== 1 ? 's' : ''} · {agentCount} agent{agentCount !== 1 ? 's' : ''}
                      </span>
                      <span className="font-mono text-[#534AB7] text-sm">{team.build_score}</span>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        {/* CTA */}
        <div className="text-center border-t border-white/5 pt-10">
          <Link
            href="/settings/teams"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Create a team →
          </Link>
        </div>
      </main>
    </>
  );
}
