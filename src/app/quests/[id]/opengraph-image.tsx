import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Quest — OpCEO.AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ id: string }>;
}

const SIGNAL_STRENGTH_COLORS: Record<string, string> = {
  observed: '#6B7280',
  moderate: '#F59E0B',
  strong: '#EF4444',
  validated: '#10B981',
};

const CATEGORY_COLORS: Record<string, string> = {
  signal: '#D85A30',
  'ai-workflow': '#534AB7',
  content: '#0EA5E9',
  design: '#EC4899',
  dev: '#10B981',
  research: '#8B5CF6',
  ops: '#F59E0B',
  other: '#6B7280',
};

export default async function Image({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quest } = await supabase
    .from('quests')
    .select('title, description, category, signal_strength, seen_count, reward_type, difficulty, status, poster:builders!quests_poster_id_fkey(slug, display_name)')
    .eq('id', id)
    .single();

  const posterRaw = quest?.poster as { slug: string; display_name: string } | { slug: string; display_name: string }[] | null;
  const poster = Array.isArray(posterRaw) ? posterRaw[0] : posterRaw;

  const isSignal = quest?.category === 'signal';
  const title = quest?.title ?? 'Quest';
  const description = quest?.description ?? '';
  const shortDesc = description.length > 120 ? description.slice(0, 120) + '…' : description;
  const category = quest?.category ?? 'other';
  const catColor = CATEGORY_COLORS[category] ?? '#6B7280';

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
        {/* Signal accent bar */}
        {isSignal && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: '#D85A30',
            }}
          />
        )}

        {/* Category badge */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            marginBottom: 24,
            color: catColor,
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 700,
            textTransform: 'uppercase',
            border: `1px solid ${catColor}40`,
            padding: '4px 12px',
            borderRadius: 4,
          }}
        >
          {isSignal ? '⚡ Real World Signal' : category}
        </div>

        {/* Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Description */}
        {shortDesc && (
          <div
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 20,
              lineHeight: 1.5,
              marginBottom: 40,
              maxWidth: 860,
            }}
          >
            {shortDesc}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {isSignal && quest?.seen_count != null && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#D85A30', fontSize: 36, fontWeight: 700, lineHeight: 1 }}>
                {quest.seen_count}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4 }}>
                builders confirmed
              </div>
            </div>
          )}
          {isSignal && quest?.signal_strength && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  color: SIGNAL_strength_COLOR(quest.signal_strength),
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  lineHeight: 1,
                }}
              >
                {quest.signal_strength}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4 }}>
                signal strength
              </div>
            </div>
          )}
          {!isSignal && quest?.reward_type && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#534AB7', fontSize: 20, fontWeight: 600, fontFamily: 'monospace', lineHeight: 1 }}>
                {quest.reward_type}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4 }}>reward</div>
            </div>
          )}
          {!isSignal && quest?.difficulty && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 600, fontFamily: 'monospace', lineHeight: 1 }}>
                {quest.difficulty}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4 }}>difficulty</div>
            </div>
          )}
          {poster && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, fontFamily: 'monospace', lineHeight: 1 }}>
                @{poster.slug}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4 }}>posted by</div>
            </div>
          )}
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
            <span style={{ color: '#FF7A00', fontSize: 18, fontFamily: 'monospace' }}>.AI</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'monospace' }}>
            opceo.ai/quests/{id}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

function SIGNAL_strength_COLOR(strength: string): string {
  return SIGNAL_STRENGTH_COLORS[strength] ?? '#6B7280';
}
