import { SIGNAL_STATUS_STEPS, SIGNAL_STATUS_LABELS, type SignalStatus } from '@/lib/signal-lifecycle';

interface Props {
  status: SignalStatus;
}

export default function SignalStatusBar({ status }: Props) {
  const currentIdx = SIGNAL_STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full" aria-label={`Signal status: ${SIGNAL_STATUS_LABELS[status]}`}>
      {SIGNAL_STATUS_STEPS.map((step, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-full h-1 rounded-full transition-colors ${
                  isPast
                    ? 'bg-[#D85A30]'
                    : isCurrent
                    ? 'bg-[#D85A30]/60'
                    : 'bg-white/10'
                }`}
              />
              <span
                className={`mt-1.5 text-[10px] font-mono whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-[#D85A30] font-semibold'
                    : isPast
                    ? 'text-[#D85A30]/50'
                    : 'text-white/20'
                }`}
              >
                {isPast ? '✓ ' : ''}{SIGNAL_STATUS_LABELS[step]}
              </span>
            </div>
            {i < SIGNAL_STATUS_STEPS.length - 1 && (
              <div className={`w-2 h-1 shrink-0 ${i < currentIdx ? 'bg-[#D85A30]' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
