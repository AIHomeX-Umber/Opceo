'use client';
// components/LivePulse.tsx — Real-time activity feed with polling

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { ActivityItem } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface Props {
  initialItems: ActivityItem[];
}

function AiBadge() {
  return (
    <span className="text-[9px] font-mono px-1 py-0 bg-[#534AB7]/20 text-[#534AB7] border border-[#534AB7]/20 rounded-sm ml-1 inline-block leading-[1.6]">
      AI
    </span>
  );
}

function ActivityRow({ item, isNew }: { item: ActivityItem; isNew: boolean }) {
  const [visible, setVisible] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      // Trigger fade-in on next tick
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isNew]);

  const actor = item.actor;
  const initials = actor?.display_name
    ? actor.display_name[0].toUpperCase()
    : '?';
  const isAgent = actor?.entity_type === 'agent';

  return (
    <div
      className={`flex items-center gap-2 py-1 border-b border-white/5 last:border-0 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Avatar */}
      {actor?.avatar_url ? (
        <Image
          src={actor.avatar_url}
          alt={actor.display_name ?? ''}
          width={20}
          height={20}
          className="rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-5 h-5 shrink-0 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#534AB7] text-[9px] font-bold">
          {initials}
        </div>
      )}

      {/* Content */}
      <p className="font-mono text-xs text-gray-400 min-w-0 flex-1 truncate">
        <span className="text-gray-300">
          @{actor?.slug ?? 'unknown'}
        </span>
        {isAgent && <AiBadge />}
        {' '}
        <span>{item.action}</span>
        {' '}
        <span>{item.summary}</span>
      </p>

      {/* Time */}
      <span className="font-mono text-[10px] text-gray-600 shrink-0">
        {formatRelativeTime(item.created_at)}
      </span>
    </div>
  );
}

export default function LivePulse({ initialItems }: Props) {
  const [items, setItems] = useState<ActivityItem[]>(initialItems);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const latestIdRef = useRef<string | null>(initialItems[0]?.id ?? null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/activity?limit=10');
        if (!res.ok) return;
        const fresh: ActivityItem[] = await res.json();
        if (!fresh.length) return;

        const newTopId = fresh[0].id;
        if (newTopId === latestIdRef.current) return;

        // Find items that are genuinely new
        const currentIds = new Set(items.map((i) => i.id));
        const incoming = fresh.filter((i) => !currentIds.has(i.id));
        if (!incoming.length) return;

        latestIdRef.current = newTopId;
        const incomingIds = new Set(incoming.map((i) => i.id));
        setNewIds(incomingIds);
        setItems((prev) => [...incoming, ...prev].slice(0, 10));

        // Clear new-id markers after animation completes
        setTimeout(() => setNewIds(new Set()), 600);
      } catch {
        // Silently ignore poll errors
      }
    };

    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!items.length) return null;

  return (
    <div className="max-h-[200px] overflow-hidden">
      {items.map((item) => (
        <ActivityRow key={item.id} item={item} isNew={newIds.has(item.id)} />
      ))}
    </div>
  );
}
