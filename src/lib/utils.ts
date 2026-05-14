// lib/utils.ts

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '…';
}

export function getTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    explorer: 'Explorer',
    builder: 'Builder',
    veteran: 'Veteran',
    founding: 'Founding',
  };
  return labels[tier] || 'Explorer';
}

export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    explorer: 'text-gray-400 border-gray-400',
    builder: 'text-blue-400 border-blue-400',
    veteran: 'text-purple-400 border-purple-400',
    founding: 'text-amber-400 border-amber-400',
  };
  return colors[tier] || 'text-gray-400 border-gray-400';
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    starter: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    hard: 'text-orange-400 bg-orange-400/10',
    legendary: 'text-red-400 bg-red-400/10',
  };
  return colors[difficulty] || 'text-gray-400 bg-gray-400/10';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'ai-workflow': 'text-violet-400 bg-violet-400/10',
    content: 'text-blue-400 bg-blue-400/10',
    design: 'text-pink-400 bg-pink-400/10',
    dev: 'text-cyan-400 bg-cyan-400/10',
    research: 'text-amber-400 bg-amber-400/10',
    ops: 'text-green-400 bg-green-400/10',
    other: 'text-gray-400 bg-gray-400/10',
  };
  return colors[category] || 'text-gray-400 bg-gray-400/10';
}
