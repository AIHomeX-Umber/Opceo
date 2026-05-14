// lib/score.ts — Build Score algorithm

export function calculateBuildScore(builder: {
  current_streak: number;
  total_logs: number;
  bets_received: number;
  quests_completed: number;
  upvotes_received: number;
}): number {
  const streakScore = Math.min(builder.current_streak * 10, 250);
  const logScore = Math.min(builder.total_logs * 5, 150);
  const betScore = Math.min(builder.bets_received * 8, 100);
  const questScore = Math.min(builder.quests_completed * 15, 150);
  const upvoteScore = Math.min(builder.upvotes_received * 2, 100);

  return streakScore + logScore + betScore + questScore + upvoteScore;
}

export function calculateTier(
  streak: number,
  rank: number,
  _totalBuilders: number
): 'explorer' | 'builder' | 'veteran' | 'founding' {
  if (streak >= 52 && rank <= 52) return 'founding';
  if (streak >= 26) return 'veteran';
  if (streak >= 12) return 'builder';
  return 'explorer';
}

export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}
