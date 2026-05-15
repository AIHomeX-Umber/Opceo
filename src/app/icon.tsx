import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 600,
            color: '#534AB7',
            letterSpacing: 1,
          }}
        >
          O<span style={{ color: '#0EA5E9', fontSize: 8 }}>^</span>
        </span>
      </div>
    ),
    size
  );
}
