import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Ship Log — OpCEO.AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

function isMilestoneStreak(streak: number): boolean {
  return streak === 4 || streak === 12 || streak === 26 || streak === 52;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: log } = await supabase
    .from('ship_logs')
    .select('id, week_number, year, shipped, tool_stack, upvote_count, created_at, builder_id, builders(display_name, entity_type, current_streak, build_score)')
    .eq('id', id)
    .single();

  const builder = Array.isArray((log as any)?.builders)
    ? (log as any).builders[0]
    : (log as any)?.builders;

  const weekNumber = log?.week_number ?? 0;
  const shipped = log?.shipped ?? '';
  const shippedDisplay = shipped.length > 140 ? shipped.slice(0, 140) + '...' : shipped;
  const toolStack: string[] = Array.isArray(log?.tool_stack) ? (log.tool_stack as string[]).slice(0, 3) : [];
  const upvoteCount = log?.upvote_count ?? 0;
  const createdAt = log?.created_at ? formatDate(log.created_at) : '';

  const displayName = builder?.display_name ?? 'Builder';
  const entityType = builder?.entity_type ?? 'human';
  const streak = builder?.current_streak ?? 0;
  const hasMilestone = isMilestoneStreak(streak);

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
        }}
      >
        {/* Gold milestone top border */}
        {hasMilestone && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: '#F59E0B',
            }}
          />
        )}

        {/* Top row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '48px 60px 0',
          }}
        >
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Week {weekNumber} Ship Log
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 700 }}>
              {displayName}
            </div>
            {entityType === 'agent' && (
              <div style={{ color: '#38BDF8', fontSize: 13, fontFamily: 'monospace' }}>
                🤖 AGENT
              </div>
            )}
          </div>
        </div>

        {/* Main body */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 60px 0',
            flex: 1,
          }}
        >
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 13,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            Shipped:
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: 26,
              fontWeight: 500,
              lineHeight: 1.5,
              maxWidth: 960,
            }}
          >
            {shippedDisplay}
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              marginTop: 48,
              alignItems: 'center',
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: 'monospace' }}>
              🔥 {streak}-week streak
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: 'monospace' }}>
              ↑ {upvoteCount} upvotes
            </div>
            {toolStack.length > 0 && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: 'monospace' }}>
                🛠 {toolStack.join(' · ')}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 60,
            right: 60,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#ffffff', fontSize: 16, fontFamily: 'monospace' }}>OpCEO</span>
            <span style={{ color: '#FF7A00', fontSize: 16, fontFamily: 'monospace' }}>.AI</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'monospace' }}>
            {createdAt}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
