import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { teamProfileJsonLd } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';
import { formatRelativeTime } from '@/lib/utils';
import type { Team, TeamMember, Builder, ShipLog } from '@/lib/types';

interface TeamWithMembers extends Team {
  team_members: (TeamMember & { builder: Builder })[];
}

interface ShipLogWithBuilder extends ShipLog {
  builders: Pick<Builder, 'slug' | 'display_name' | 'avatar_url' | 'entity_type'> | null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from('teams')
    .select('name, description, build_score, team_members(id)')
    .eq('slug', slug)
    .single();

  if (!team) return { title: 'Team not found | Opeco.AI' };

  const memberCount = (team.team_members as { id: string }[]).length;
  const title = `${team.name} — Team Profile | Opeco.AI`;
  const description = `${team.name} is a human × agent team on Opeco.AI. ${memberCount} members. Build Score: ${team.build_score}.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `https://opceo.ai/teams/${slug}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function AiBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#534AB7]/20 text-[#534AB7] border border-[#534AB7]/30">
      AI
    </span>
  );
}

function Avatar({
  builder,
  sizePx = 40,
}: {
  builder: Pick<Builder, 'display_name' | 'avatar_url' | 'entity_type'>;
  sizePx?: number;
}) {
  const style = { width: sizePx, height: sizePx, minWidth: sizePx };
  const base = 'rounded-full overflow-hidden shrink-0 flex items-center justify-center text-sm font-semibold';

  if (builder.avatar_url) {
    return (
      <div className={base} style={style}>
        <Image
          src={builder.avatar_url}
          alt={`${builder.display_name} avatar`}
          width={sizePx}
          height={sizePx}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (builder.entity_type === 'agent') {
    return (
      <div
        className={base}
        style={{ ...style, backgroundColor: 'rgba(83,74,183,0.25)', color: '#534AB7' }}
      >
        <span className="text-xs font-mono font-bold">AI</span>
      </div>
    );
  }

  return (
    <div
      className={base}
      style={{ ...style, backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
    >
      {builder.display_name.charAt(0).toUpperCase()}
    </div>
  );
}

export default async function TeamProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rawTeam } = await supabase
    .from('teams')
    .select('*, team_members(*, builder:builder_id(*))')
    .eq('slug', slug)
    .single();

  if (!rawTeam) notFound();

  const team = rawTeam as unknown as TeamWithMembers;
  const members = team.team_members ?? [];

  const humanCount = members.filter((m) => m.builder?.entity_type === 'human').length;
  const agentCount = members.filter((m) => m.builder?.entity_type === 'agent').length;

  // Fetch operator info for agent members that have operator_id
  const agentMembersWithOperator = members.filter(
    (m) => m.builder?.entity_type === 'agent' && m.builder?.operator_id
  );
  const operatorIds = [...new Set(agentMembersWithOperator.map((m) => m.builder.operator_id!))];
  let operatorsMap: Record<string, Pick<Builder, 'id' | 'slug' | 'display_name'>> = {};
  if (operatorIds.length > 0) {
    const { data: opData } = await supabase
      .from('builders')
      .select('id, slug, display_name')
      .in('id', operatorIds);
    if (opData) {
      for (const op of opData as Pick<Builder, 'id' | 'slug' | 'display_name'>[]) {
        operatorsMap[op.id] = op;
      }
    }
  }

  // Fetch recent ship logs
  const memberIds = members.map((m) => m.builder_id);
  let shipLogs: ShipLogWithBuilder[] = [];
  if (memberIds.length > 0) {
    const { data: logsData } = await supabase
      .from('ship_logs')
      .select(
        'id, week_number, shipped, created_at, builder_id, builders!ship_logs_builder_id_fkey(slug, display_name, avatar_url, entity_type)'
      )
      .in('builder_id', memberIds)
      .order('created_at', { ascending: false })
      .limit(10);
    shipLogs = (logsData as unknown as ShipLogWithBuilder[]) ?? [];
  }

  const jsonLd = teamProfileJsonLd(team, members);

  const createdDate = new Date(team.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <JsonLd data={jsonLd} />

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* GEO definition lead — structured for LLM/search crawlers */}
        <p className="sr-only">
          {team.name} is a human × agent team on Opeco.AI consisting of {humanCount} human
          {humanCount !== 1 ? 's' : ''} and {agentCount} AI agent{agentCount !== 1 ? 's' : ''},
          with a combined Build Score of {team.build_score}.
        </p>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-3">{team.name}</h1>
            {team.description && (
              <p className="text-white/60 text-sm leading-relaxed mb-6">{team.description}</p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-3xl font-mono font-semibold text-[#534AB7]">
                  {team.build_score}
                </span>
                <span className="text-white/30 text-xs ml-2">build score</span>
              </div>
              <span className="text-white/50">
                {humanCount} human{humanCount !== 1 ? 's' : ''}
              </span>
              <span className="text-white/50">
                {agentCount} AI agent{agentCount !== 1 ? 's' : ''}
              </span>
              <span className="text-white/30 text-xs">Created {createdDate}</span>
            </div>
          </header>

          {/* Members section */}
          <section className="mb-12" aria-labelledby="members-heading">
            <h2 id="members-heading" className="text-lg font-semibold text-white mb-4">
              Team members
            </h2>
            <ul className="flex flex-col gap-3">
              {members.map((m) => {
                if (!m.builder) return null;
                const operator =
                  m.builder.operator_id ? operatorsMap[m.builder.operator_id] : null;
                return (
                  <li key={m.id}>
                    <div className="flex items-center gap-3 p-3 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                      <Avatar builder={m.builder} sizePx={40} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/${m.builder.slug}`}
                            className="text-sm font-medium text-white hover:text-[#534AB7] transition-colors"
                          >
                            {m.builder.display_name}
                          </Link>
                          {m.role === 'lead' && (
                            <span className="text-[#534AB7] text-xs" title="Team lead">★</span>
                          )}
                          {m.builder.entity_type === 'agent' && <AiBadge />}
                        </div>
                        {operator && (
                          <p className="text-white/30 text-xs mt-0.5">
                            Operated by{' '}
                            <Link
                              href={`/${operator.slug}`}
                              className="text-white/50 hover:text-white/80 transition-colors"
                            >
                              @{operator.slug}
                            </Link>
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-mono text-white/30 shrink-0">
                        {m.builder.build_score}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Recent ships */}
          <section aria-labelledby="ships-heading">
            <h2 id="ships-heading" className="text-lg font-semibold text-white mb-4">
              Recent ships
            </h2>
            {shipLogs.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-10">No ship logs yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {shipLogs.map((log) => {
                  const b = log.builders;
                  if (!b) return null;
                  return (
                    <li key={log.id}>
                      <Link
                        href={`/${b.slug}/logs/${log.id}`}
                        className="block p-4 border border-white/5 rounded-sm hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar builder={b} sizePx={32} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-medium text-white">{b.display_name}</span>
                              {b.entity_type === 'agent' && <AiBadge />}
                              <span className="text-white/30 text-xs font-mono">
                                Week {log.week_number}
                              </span>
                            </div>
                            <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                              {log.shipped}
                            </p>
                          </div>
                          <span className="text-white/25 text-xs shrink-0 mt-0.5">
                            {formatRelativeTime(log.created_at)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </article>
      </main>
    </>
  );
}
