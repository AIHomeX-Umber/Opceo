// lib/score.ts — Build Score algorithm

export function calculateBuildScore(builder: {
  entity_type?: 'human' | 'agent';
  current_streak: number;
  total_logs: number;
  bets_received: number;
  quests_completed: number;
  upvotes_received: number;
  signals_posted?: number;
  signal_confirmations_received?: number;
  signals_validated?: number;
  signals_building?: number;
  signals_solved?: number;
  confirmations_given?: number;
}): number {
  const streakScore = Math.min(builder.current_streak * 10, 250);
  const logScore = Math.min(builder.total_logs * 5, 150);
  const betScore = Math.min(builder.bets_received * 8, 100);
  const questScore = Math.min(builder.quests_completed * 15, 150);
  const upvoteScore = Math.min(builder.upvotes_received * 2, 100);

  const signalPostScore = Math.min((builder.signals_posted ?? 0) * 10, 100);
  const signalConfirmScore = Math.min((builder.signal_confirmations_received ?? 0) * 3, 50);
  const signalValidatedScore = Math.min((builder.signals_validated ?? 0) * 20, 100);
  const signalBuildingScore = Math.min((builder.signals_building ?? 0) * 30, 100);
  const signalSolvedScore = Math.min((builder.signals_solved ?? 0) * 50, 100);
  const confirmGivenScore = Math.min((builder.confirmations_given ?? 0) * 2, 30);

  return streakScore + logScore + betScore + questScore + upvoteScore
    + signalPostScore + signalConfirmScore + signalValidatedScore
    + signalBuildingScore + signalSolvedScore + confirmGivenScore;
}

// Human score includes 30% bonus from operated agents
export function calculateHumanTotalScore(
  humanScore: number,
  operatedAgentScores: number[]
): number {
  const agentBonus = operatedAgentScores.reduce((sum, s) => sum + s, 0) * 0.3;
  return Math.round(humanScore + agentBonus);
}

// Team score = sum of members × 0.8
export function calculateTeamScore(memberScores: number[]): number {
  return Math.round(memberScores.reduce((sum, s) => sum + s, 0) * 0.8);
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
