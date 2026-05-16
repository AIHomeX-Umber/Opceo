'use client';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  linkToHome?: boolean;
}

const sizes = {
  sm: { text: 'text-sm', dot: 'w-1 h-1' },
  md: { text: 'text-lg', dot: 'w-1.5 h-1.5' },
  lg: { text: 'text-2xl', dot: 'w-2 h-2' },
  xl: { text: 'text-4xl', dot: 'w-2.5 h-2.5' },
};

export function Wordmark({ size = 'md', linkToHome = true }: WordmarkProps) {
  const s = sizes[size];

  const mark = (
    <span className="inline-flex items-baseline font-mono font-medium tracking-wider">
      <span className={`${s.text} text-white dark:text-white`}>OPCEO</span>
      <span
        className={`${s.dot} rounded-full bg-[#534AB7] dark:bg-[#7F77DD] ml-0.5 mb-0.5 self-end flex-shrink-0`}
        aria-hidden="true"
      />
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
