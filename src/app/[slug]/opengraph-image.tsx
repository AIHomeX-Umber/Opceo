import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Builder Profile — OpCEO.AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: builder } = await supabase
    .from('builders')
    .select('display_name, bio, building, build_score, current_streak, tier')
    .eq('slug', slug)
    .single();

  const name = builder?.display_name ?? slug;
  const building = builder?.building ?? '';
  const score = builder?.build_score ?? 0;
  const streak = builder?.current_streak ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ color: '#534AB7', fontSize: 16, marginBottom: 40, letterSpacing: 2 }}>
          OpCEO.AI · BUILDER
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          {name}
        </div>
        {building && (
          <div style={{ color: '#9ca3af', fontSize: 24, marginBottom: 48, maxWidth: 800 }}>
            {building}
          </div>
        )}
        <div style={{ display: 'flex', gap: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#534AB7', fontSize: 40, fontWeight: 700 }}>{score}</div>
            <div style={{ color: '#6b7280', fontSize: 16 }}>Build Score</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#534AB7', fontSize: 40, fontWeight: 700 }}>{streak}</div>
            <div style={{ color: '#6b7280', fontSize: 16 }}>Week Streak</div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 80,
            color: '#374151',
            fontSize: 16,
          }}
        >
          opceo.ai/{slug}
        </div>
      </div>
    ),
    { ...size }
  );
}
