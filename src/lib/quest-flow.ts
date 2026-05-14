// lib/quest-flow.ts — Quest state transition rules

export const QUEST_TRANSITIONS: Record<string, string[]> = {
  open: ['claimed', 'cancelled'],
  claimed: ['in_progress', 'open', 'cancelled'], // open = poster rejects, quest reverts
  in_progress: ['review', 'cancelled'],
  review: ['completed', 'in_progress', 'cancelled'], // in_progress = send back
  completed: [], // terminal
  cancelled: [], // terminal
};

export const CLAIM_TRANSITIONS: Record<string, string[]> = {
  pending: ['accepted', 'rejected'],
  accepted: ['completed', 'abandoned'],
  rejected: [],
  completed: [], // terminal
  abandoned: [],
};

export function canTransition(
  current: string,
  next: string,
  map: Record<string, string[]>
): boolean {
  return map[current]?.includes(next) ?? false;
}
