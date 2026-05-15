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
    <span className="inline-flex items-baseline font-mono font-medium tracking-wider">
      <span className={`${cls} text-[#534AB7] dark:text-[#7F77DD]`}>OPCEO</span>
      <span className={`${cls} text-[#534AB7]/50 dark:text-[#7F77DD]/50`}>^</span>
      <span className={`${cls} text-[#0EA5E9] dark:text-[#38BDF8]`}>ai</span>
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
