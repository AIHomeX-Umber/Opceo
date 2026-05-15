import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Opeco.AI — The Infinite Build';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
        <div style={{ color: '#534AB7', fontSize: 18, marginBottom: 32, letterSpacing: 2 }}>
          THE INFINITE BUILD
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 32,
          }}
        >
          Opeco.AI
        </div>
        <div style={{ color: '#6b7280', fontSize: 28, maxWidth: 700 }}>
          We don't do pitch decks. We ship.
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            color: '#374151',
            fontSize: 18,
          }}
        >
          Opeco.AI · Built by Mashi Technology
        </div>
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 80,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#534AB7',
            boxShadow: '0 0 40px 20px rgba(83,74,183,0.3)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
