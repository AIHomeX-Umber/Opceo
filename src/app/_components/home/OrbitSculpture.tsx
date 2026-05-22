export function OrbitSculpture() {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center rounded-[2rem] border border-black/[0.04] bg-white shadow-[0_40px_120px_rgba(21,19,15,0.08)]">
      <div className="absolute inset-8 rounded-[1.5rem] border border-black/[0.035] bg-[linear-gradient(145deg,#ffffff,#f6f4ee)]" />

      <div className="relative h-[78%] w-[78%]">
        <div className="absolute inset-[12%] rounded-full border border-[#d8d2c5]" />
        <div className="absolute inset-[23%] rotate-[28deg] rounded-full border border-[#e6e1d8]" />
        <div className="absolute inset-[34%] -rotate-[22deg] rounded-full border border-[#ece8df]" />

        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.06] bg-white shadow-[0_18px_44px_rgba(28,24,18,0.08)]">
          <div className="absolute inset-4 rounded-full bg-[#f4f1ea]" />
          <div className="absolute inset-[34px] rounded-full bg-[#5B4BFF]" />
        </div>

        {[
          { label: 'ship', className: 'left-[6%] top-[38%]' },
          { label: 'signal', className: 'right-[13%] top-[18%]' },
          { label: 'feedback', className: 'bottom-[14%] right-[20%]' },
          { label: 'compound', className: 'bottom-[26%] left-[10%]' },
        ].map((node) => (
          <div
            key={node.label}
            className={`absolute ${node.className} h-3 w-3 rounded-full border border-[#b9ad94] bg-white shadow-[0_8px_20px_rgba(28,24,18,0.12)]`}
          >
            <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap font-mono-jb text-[0.58rem] uppercase tracking-[0.16em] text-black/32">
              {node.label}
            </span>
          </div>
        ))}

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <path
            d="M84 236C138 292 243 310 315 208"
            stroke="url(#signal-line)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M95 170C159 82 274 88 319 147"
            stroke="url(#signal-line)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="signal-line" x1="84" y1="160" x2="326" y2="250" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d9d1c0" stopOpacity="0" />
              <stop offset="0.55" stopColor="#b9ad94" stopOpacity="0.95" />
              <stop offset="1" stopColor="#5B4BFF" stopOpacity="0.35" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
