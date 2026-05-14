'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Wrench } from 'lucide-react';
import { getToolIconUrl } from '@/lib/tool-icons';

interface ToolStackPillProps {
  name: string;
  size?: 'sm' | 'md';
}

export function ToolStackPill({ name, size = 'md' }: ToolStackPillProps) {
  const iconUrl = getToolIconUrl(name);
  const [imgError, setImgError] = useState(false);

  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-sm gap-1.5';
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <span
      className={`inline-flex items-center ${sizeClass} rounded-md font-mono
        bg-white/5 border border-white/10 text-white/60
        hover:border-white/20 hover:text-white/80 transition-colors`}
    >
      {iconUrl && !imgError ? (
        <Image
          src={iconUrl}
          alt={`${name} icon`}
          width={iconSize}
          height={iconSize}
          className="shrink-0"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        <Wrench size={iconSize} className="shrink-0 opacity-40" />
      )}
      {name}
    </span>
  );
}
