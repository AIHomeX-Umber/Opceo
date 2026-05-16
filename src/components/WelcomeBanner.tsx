'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface WelcomeBannerProps {
  slug: string;
  displayName: string;
}

export default function WelcomeBanner({ slug, displayName }: WelcomeBannerProps) {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!searchParams.get('welcome')) return;
    const key = `welcome_dismissed_${slug}`;
    if (localStorage.getItem(key)) return;
    setVisible(true);
  }, [searchParams, slug]);

  function dismiss() {
    localStorage.setItem(`welcome_dismissed_${slug}`, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-start justify-between gap-4 border border-[#534AB7]/40 bg-[#534AB7]/10 rounded-xl px-5 py-4">
      <div>
        <p className="text-white font-medium text-sm mb-0.5">Welcome to OpCEO.AI, {displayName}!</p>
        <p className="text-white/50 text-sm">
          Your profile is live. Ship your first weekly log to start your streak.
        </p>
      </div>
      <button
        onClick={dismiss}
        className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
