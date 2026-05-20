// ReadinessIndex — Factory AI Readiness Index timeline.
// Desktop: horizontal nodes + connector lines.
// Mobile: vertical steps list.
// Server component: no state.

const LEVELS = [
  { id: 'L0', label: 'No AI access',           active: false },
  { id: 'L1', label: 'GPT enabled',             active: true  },
  { id: 'L2', label: 'AI workflow active',      active: true  },
  { id: 'L3', label: 'Team AI collaboration',   active: true  },
  { id: 'L4', label: 'AI employee deployment',  active: false },
  { id: 'L5', label: 'AI-native organization',  active: false },
];

export function ReadinessIndex() {
  return (
    <section className="border-t border-white/5 pt-14 mb-16">
      <h2 className="mb-2 text-lg font-semibold text-white">Factory AI Readiness Index</h2>
      <p className="mb-10 text-sm text-white/30 max-w-lg leading-relaxed">
        Where is your organization on the path from first AI access to AI-native operations?
      </p>

      {/* Desktop: horizontal timeline */}
      <div className="hidden sm:flex items-start gap-0">
        {LEVELS.map((level, i) => (
          <div key={level.id} className="flex items-start flex-1 min-w-0">
            {/* Node + label */}
            <div className="flex flex-col items-center w-full relative">
              {/* Connector line left */}
              {i > 0 && (
                <div
                  className="absolute top-[9px] right-1/2 w-1/2 h-px"
                  style={{
                    background: level.active
                      ? 'rgba(193,95,60,0.5)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                />
              )}
              {/* Connector line right */}
              {i < LEVELS.length - 1 && (
                <div
                  className="absolute top-[9px] left-1/2 w-1/2 h-px"
                  style={{
                    background: LEVELS[i + 1].active
                      ? 'rgba(193,95,60,0.5)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                />
              )}

              {/* Circle node */}
              <div
                className="relative z-10 w-[18px] h-[18px] rounded-full border flex-shrink-0 mb-3"
                style={{
                  background: level.active ? 'rgba(193,95,60,0.15)' : 'rgba(255,255,255,0.03)',
                  borderColor: level.active ? '#C15F3C' : 'rgba(255,255,255,0.10)',
                }}
              >
                {level.active && (
                  <div
                    className="absolute inset-[4px] rounded-full"
                    style={{ background: '#C15F3C' }}
                  />
                )}
              </div>

              {/* Level ID */}
              <span
                className="font-mono text-[10px] tracking-widest mb-1"
                style={{ color: level.active ? '#C15F3C' : 'rgba(255,255,255,0.18)' }}
              >
                {level.id}
              </span>

              {/* Label */}
              <span
                className="text-[11px] text-center leading-snug px-1"
                style={{
                  color: level.active ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)',
                  fontFamily: 'inherit',
                }}
              >
                {level.label}
              </span>

              {/* "Currently serving" badge on L1–L3 range */}
              {level.id === 'L1' && (
                <span
                  className="mt-2 font-mono text-[9px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm"
                  style={{
                    color: '#C15F3C',
                    background: 'rgba(193,95,60,0.10)',
                    border: '1px solid rgba(193,95,60,0.25)',
                  }}
                >
                  entry
                </span>
              )}
              {level.id === 'L3' && (
                <span
                  className="mt-2 font-mono text-[9px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm"
                  style={{
                    color: '#C15F3C',
                    background: 'rgba(193,95,60,0.10)',
                    border: '1px solid rgba(193,95,60,0.25)',
                  }}
                >
                  active
                </span>
              )}
              {(level.id === 'L4' || level.id === 'L5') && (
                <span
                  className="mt-2 font-mono text-[9px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm"
                  style={{
                    color: 'rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  soon
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: vertical steps */}
      <div className="sm:hidden flex flex-col gap-0">
        {LEVELS.map((level, i) => (
          <div key={level.id} className="flex gap-4 items-start">
            {/* Left: node + vertical connector */}
            <div className="flex flex-col items-center flex-shrink-0 w-5">
              <div
                className="w-[18px] h-[18px] rounded-full border flex-shrink-0 relative"
                style={{
                  background: level.active ? 'rgba(193,95,60,0.15)' : 'rgba(255,255,255,0.03)',
                  borderColor: level.active ? '#C15F3C' : 'rgba(255,255,255,0.10)',
                }}
              >
                {level.active && (
                  <div className="absolute inset-[4px] rounded-full" style={{ background: '#C15F3C' }} />
                )}
              </div>
              {i < LEVELS.length - 1 && (
                <div
                  className="w-px flex-1 my-1"
                  style={{
                    minHeight: 28,
                    background: LEVELS[i + 1].active
                      ? 'rgba(193,95,60,0.3)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                />
              )}
            </div>

            {/* Right: content */}
            <div className="pb-6">
              <span
                className="font-mono text-[10px] tracking-widest block mb-0.5"
                style={{ color: level.active ? '#C15F3C' : 'rgba(255,255,255,0.18)' }}
              >
                {level.id}
              </span>
              <span
                className="text-sm leading-snug"
                style={{ color: level.active ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)' }}
              >
                {level.label}
              </span>
              {(level.id === 'L4' || level.id === 'L5') && (
                <span
                  className="ml-2 font-mono text-[9px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm align-middle"
                  style={{
                    color: 'rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  soon
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
