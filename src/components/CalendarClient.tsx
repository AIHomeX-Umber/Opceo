'use client';

import { useState } from 'react';

export type CalendarEvent = {
  id: string;
  date: string; // ISO YYYY-MM-DD
  title: string;
  type: 'internal' | 'external';
  format: string;
  location: string;
  description: string;
  link?: string;
  recurring?: boolean;
};

type FilterType = 'all' | 'internal' | 'external';

function formatMonth(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
}

function formatDay(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
}

export function CalendarClient({ events }: { events: CalendarEvent[] }) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = events.filter((e) => filter === 'all' || e.type === filter);

  // Group by month
  const months = Array.from(new Set(filtered.map((e) => e.date.slice(0, 7)))).sort();

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {([['all', '全部'], ['internal', '马时活动'], ['external', '外部活动']] as const).map(
          ([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`rounded-sm px-3 py-1.5 text-xs font-mono transition-colors ${
                filter === val
                  ? 'bg-[#534AB7] text-white'
                  : 'border border-white/10 text-white/40 hover:text-white hover:border-white/20'
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-white/30">暂无活动</p>
      )}

      <div className="flex flex-col gap-10">
        {months.map((month) => {
          const monthEvents = filtered.filter((e) => e.date.startsWith(month));
          return (
            <div key={month}>
              <h2 className="mb-4 font-mono text-xs text-white/30 uppercase tracking-widest">
                {formatMonth(monthEvents[0].date)}
              </h2>
              <div className="flex flex-col gap-3">
                {monthEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  const accentColor = event.type === 'internal' ? '#FF6B00' : '#534AB7';

  return (
    <div
      className="rounded-sm border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-white/30">{formatDay(event.date)}</span>
            <span
              className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] text-white/80"
              style={{ backgroundColor: accentColor + '22', color: accentColor }}
            >
              {event.type === 'internal' ? '马时' : '外部'}
            </span>
            <span className="rounded-sm border border-white/8 px-1.5 py-0.5 font-mono text-[10px] text-white/40">
              {event.format}
            </span>
            {event.recurring && (
              <span className="text-[10px] text-white/25 font-mono">↻ 周期</span>
            )}
          </div>
          <h3 className="text-sm font-medium text-white">{event.title}</h3>
          <p className="mt-1 text-xs text-white/40 leading-relaxed">{event.description}</p>
          <p className="mt-1.5 text-xs text-white/25">
            <span className="mr-1">📍</span>
            {event.location}
          </p>
        </div>
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 shrink-0 self-start rounded-sm border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-white/20 hover:text-white transition-colors sm:mt-0 sm:ml-4"
          >
            了解更多 →
          </a>
        )}
      </div>
    </div>
  );
}
