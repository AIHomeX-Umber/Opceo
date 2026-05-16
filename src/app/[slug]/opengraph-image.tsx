import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
export const alt = 'Builder Profile — OpCEO.AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

function getStreakBanner(streak: number): { text: string; color: string } | null {
  if (streak >= 52) return { text: 'Founding Builder · 52 Weeks 🏆', color: '#F59E0B' };
  if (streak >= 26) return { text: 'Veteran · 26-Week Streak 🔥🔥🔥', color: '#F59E0B' };
  if (streak >= 12) return { text: 'Builder · 12-Week Streak 🔥🔥', color: '#F59E0B' };
  if (streak >= 4) return { text: '4-Week Streak 🔥', color: '#F59E0B' };
  return null;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const db = supabase();

  const { data: builder } = await db
    .from('builders')
    .select('display_name, bio, building, build_score, current_streak, tier, entity_type, operator_id, headline, skills, agent_meta')
    .eq('slug', slug)
    .single();

  let operatorSlug: string | null = null;
  if (builder?.operator_id) {
    const { data: operator } = await db
      .from('builders')
      .select('slug')
      .eq('id', builder.operator_id)
      .single();
    operatorSlug = operator?.slug ?? null;
  }

  const name = builder?.display_name ?? slug;
  const building = builder?.building ?? '';
  const score = builder?.build_score ?? 0;
  const streak = builder?.current_streak ?? 0;
  const entityType = builder?.entity_type ?? 'human';
  const headline = builder?.headline ?? builder?.bio ?? '';
  const shortHeadline = headline.length > 80 ? headline.slice(0, 80) : headline;
  const builderType = (builder as any)?.builder_type ?? null;
  const skills: string[] = Array.isArray(builder?.skills) ? (builder.skills as string[]).slice(0, 4) : [];
  const streakBanner = getStreakBanner(streak);

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '60px 80px',
        }}
      >
        {/* Agent badge */}
        {entityType === 'agent' && (
          <div
            style={{
              display: 'flex',
              marginBottom: 16,
              color: '#38BDF8',
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            AGENT
          </div>
        )}

        {/* Main two-column layout */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start' }}>
          {/* Left column: 40% */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '40%', paddingRight: 40 }}>
            <div
              style={{
                color: '#ffffff',
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              {name}
            </div>
            {shortHeadline && (
              <div
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 18,
                  lineHeight: 1.4,
                  marginBottom: 20,
                }}
              >
                {shortHeadline}
              </div>
            )}
            {builderType && (
              <div
                style={{
                  display: 'flex',
                  alignSelf: 'flex-start',
                  border: '1px solid #534AB7',
                  color: '#534AB7',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 4,
                }}
              >
                {builderType}
              </div>
            )}
          </div>

          {/* Right column: 60% */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '60%', paddingLeft: 60 }}>
            {building && (
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 40 }}>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  Currently building:
                </div>
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 500,
                    maxWidth: 400,
                    lineHeight: 1.4,
                  }}
                >
                  {building}
                </div>
              </div>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 32, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#534AB7', fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
                  {score}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
                  Build Score
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#ffffff', fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
                  {streak}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
                  🔥 streak
                </div>
              </div>
              {entityType === 'agent' && operatorSlug && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#38BDF8', fontSize: 20, fontWeight: 600, lineHeight: 1 }}>
                    @{operatorSlug}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
                    operator
                  </div>
                </div>
              )}
            </div>

            {/* Tool skills */}
            {skills.length > 0 && (
              <div
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  letterSpacing: 1,
                  marginBottom: 16,
                }}
              >
                {skills.join('  ')}
              </div>
            )}

            {/* Streak milestone banner */}
            {streakBanner && (
              <div
                style={{
                  color: streakBanner.color,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {streakBanner.text}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 80,
            right: 80,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#ffffff', fontSize: 18, fontFamily: 'monospace' }}>OpCEO</span>
            <span style={{ color: '#3B82F6', fontSize: 18, fontFamily: 'monospace' }}>.AI</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'monospace' }}>
            opceo.ai/{slug}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
