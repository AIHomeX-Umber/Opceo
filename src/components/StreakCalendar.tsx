'use client';

interface StreakCalendarProps {
  logs: Array<{ week_number: number; year: number }>;
}

export default function StreakCalendar({ logs }: StreakCalendarProps) {
  // Build a set of "year-week" keys for fast lookup
  const logSet = new Set(logs.map((l) => `${l.year}-${l.week_number}`));

  // Generate the last 52 week slots starting from today
  const today = new Date();
  // ISO week utility
  function getISOWeek(d: Date): { week: number; year: number } {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // ISO week: Monday = day 1
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return { week, year: date.getUTCFullYear() };
  }

  const weeks: Array<{ week: number; year: number }> = [];
  for (let i = 51; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 7);
    weeks.push(getISOWeek(d));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max pb-1">
        {weeks.map(({ week, year }, idx) => {
          const key = `${year}-${week}`;
          const shipped = logSet.has(key);
          return (
            <div
              key={idx}
              title={shipped ? `Week ${week} · Shipped` : `Week ${week} · No ship`}
              className={`w-4 h-4 rounded-sm transition-colors cursor-default ${
                shipped
                  ? 'bg-[#534AB7] hover:bg-[#6a62cc]'
                  : 'bg-white/8 hover:bg-white/15'
              }`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-white/25 text-xs">52 weeks ago</span>
        <span className="text-white/25 text-xs">This week</span>
      </div>
    </div>
  );
}
