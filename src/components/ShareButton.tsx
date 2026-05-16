'use client';

import { Share2, X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  url: string;
  text: string;
  variant?: 'icon' | 'full';
}

export function ShareButton({ url, text, variant = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareToX = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
    setOpen(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-colors text-sm"
      >
        <Share2 size={14} />
        {variant === 'full' && <span>Share</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-[#111] border border-white/10 rounded-md p-1.5 flex flex-col gap-0.5 min-w-[160px] z-50 shadow-lg">
            <button
              onClick={shareToX}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-white/60 hover:bg-white/5 hover:text-white w-full text-left transition-colors"
            >
              <X size={14} />
              Share on X
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-white/60 hover:bg-white/5 hover:text-white w-full text-left transition-colors"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy link + text'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
