export type SignalStatus = 'observed' | 'discussed' | 'validated' | 'building' | 'solved';

export function calculateSignalStatus(signal: {
  seen_count: number;
  comment_count: number;
  builders_count: number;
  has_solution: boolean;
}): SignalStatus {
  if (signal.has_solution) return 'solved';
  if (signal.builders_count > 0) return 'building';
  if (signal.seen_count >= 5) return 'validated';
  if (signal.comment_count >= 3 || signal.seen_count >= 3) return 'discussed';
  return 'observed';
}

export const SIGNAL_STATUS_STEPS: SignalStatus[] = [
  'observed',
  'discussed',
  'validated',
  'building',
  'solved',
];

export const SIGNAL_STATUS_LABELS: Record<SignalStatus, string> = {
  observed: 'Observed',
  discussed: 'Discussed',
  validated: 'Validated',
  building: 'Building',
  solved: 'Solved',
};

export const SIGNAL_STATUS_COLORS: Record<SignalStatus, string> = {
  observed: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  discussed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  validated: 'text-green-400 bg-green-400/10 border-green-400/20',
  building: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  solved: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
};
