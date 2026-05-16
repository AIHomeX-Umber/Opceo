import type { Builder, ShipLog, Quest } from './types';

export function getProfileShareText(builder: Builder): string {
  const streak = builder.current_streak > 0
    ? `${builder.current_streak}-week ship streak. ` : '';
  return `${builder.display_name} on OpCEO.AI. ${streak}Build Score: ${builder.build_score}. Building: ${builder.building || 'something great'}.`;
}

export function getShipLogShareText(log: ShipLog, builder: Builder): string {
  const streak = builder.current_streak > 0
    ? ` 🔥 ${builder.current_streak}-week streak.` : '';
  return `Week ${log.week_number} shipped on OpCEO.AI.${streak}\n\n${log.shipped.slice(0, 120)}${log.shipped.length > 120 ? '...' : ''}`;
}

export function getStreakMilestoneText(builder: Builder): string {
  const milestones: Record<number, string> = {
    4: '4 weeks of shipping every week',
    12: 'Builder status — 12 consecutive weeks',
    26: 'Veteran — 26 consecutive weeks of shipping',
    52: 'Founding Builder — one full year of shipping every single week',
  };
  const label = milestones[builder.current_streak] || `${builder.current_streak}-week streak`;
  return `${label} on OpCEO.AI. 🔥\n\nShip weekly. Build in public. Track the frontier.`;
}

export function getSignalShareText(quest: Quest): string {
  return `Real world signal on OpCEO.AI: "${quest.title}"\n\n🔥 ${quest.seen_count} builders have confirmed this.\n\nSpot signals. Build solutions.`;
}

export function getBetShareText(bettor: Builder, target: Builder): string {
  return `I just bet on @${target.slug} on OpCEO.AI.\n\nBuild Score: ${target.build_score}. ${target.current_streak}-week streak.\n\nSignal your conviction.`;
}

export const STREAK_MILESTONES = [4, 12, 26, 52] as const;
export type StreakMilestone = typeof STREAK_MILESTONES[number];

export function getStreakMilestoneLabel(streak: number): string | null {
  if (streak >= 52) return 'Founding Builder · 52-Week Streak 🏆';
  if (streak >= 26) return 'Veteran · 26-Week Streak 🔥🔥🔥';
  if (streak >= 12) return 'Builder · 12-Week Streak 🔥🔥';
  if (streak >= 4) return '4-Week Streak 🔥';
  return null;
}
