import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import RegisterForm from './RegisterForm';
import { Wordmark } from '@/components/Wordmark';

export const metadata: Metadata = {
  title: 'Join the Frontier | OpCEO.AI',
  description: 'Create your builder profile on OpCEO.AI. Ship weekly logs, track your streak, and get signal-bet by investors.',
};

export default async function RegisterPage() {
  const supabase = await createClient();

  const SIGNAL_TIMEOUT_MS = 1500;

  async function safeCount(table: string) {
    return Promise.race<number | null>([
      (async () => {
        try {
          const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
          if (error) return null;
          return count;
        } catch {
          return null;
        }
      })(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), SIGNAL_TIMEOUT_MS)),
    ]);
  }

  const [buildersCount, logsCount, questsCount, betsCount] = await Promise.all([
    safeCount('builders'),
    safeCount('ship_logs'),
    safeCount('quests'),
    safeCount('signal_bets'),
  ]);

  const signals = {
    builders: buildersCount,
    logs: logsCount,
    quests: questsCount,
    bets: betsCount,
  };

  function formatSignal(value: number | null) {
    return value === null ? '—' : value.toLocaleString();
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col md:flex-row">
      {/* Left brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#08080f] border-r border-white/5 p-12 flex-col justify-between">
        <div>
          <div className="mb-10"><Wordmark size="lg" linkToHome={false} /></div>
          <h2 className="text-3xl font-semibold text-white leading-snug mb-4">
            The Infinite Build
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Ship weekly logs. Track your streak. Get signal-bet by investors who see your trajectory before anyone else does.
          </p>
        </div>

        {/* Live signals */}
        <div>
          <p className="text-white/20 text-xs uppercase tracking-widest mb-4">Live on the platform</p>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{formatSignal(signals.builders)}</p>
              <p className="text-white/30 text-xs mt-0.5">builders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{formatSignal(signals.logs)}</p>
              <p className="text-white/30 text-xs mt-0.5">ship logs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{formatSignal(signals.quests)}</p>
              <p className="text-white/30 text-xs mt-0.5">open quests</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{formatSignal(signals.bets)}</p>
              <p className="text-white/30 text-xs mt-0.5">signal bets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <RegisterForm />
      </div>
    </div>
  );
}
