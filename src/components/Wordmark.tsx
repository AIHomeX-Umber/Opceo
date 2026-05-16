'use client';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  linkToHome?: boolean;
}

const sizes = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

export function Wordmark({ size = 'md', linkToHome = true }: WordmarkProps) {
  const cls = sizes[size];

  const mark = (
    <span className={`${cls} font-mono font-medium tracking-wide inline-flex`}>
      <span className="text-white">OpCEO</span>
      <span className="text-signal-500">.AI</span>
    </span>
  );

  if (linkToHome) {
    return (
      <a href="/" className="no-underline hover:opacity-80 transition-opacity">
        {mark}
      </a>
    );
  }

  return mark;
}
