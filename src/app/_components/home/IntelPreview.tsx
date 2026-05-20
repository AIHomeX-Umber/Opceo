// IntelPreview — split layout teasing a real intel brief.
// Left: editorial copy + CTA link. Right: mock intel card (Jake Kim).
// Server component: no state, no data fetching.

export function IntelPreview() {
  return (
    <section
      style={{
        padding: 'clamp(56px, 8vw, 96px) clamp(24px, 5vw, 72px)',
        background: '#FAFAF5',
        borderBottom: '1px solid #DDD8CB',
      }}
    >
      <div className="intel-preview-grid">
        {/* Left — editorial copy */}
        <div className="flex flex-col justify-center gap-6">
          <p className="font-mono-jb text-[0.68rem] tracking-widest text-[#C15F3C] uppercase">
            Sample brief
          </p>
          <h2
            className="font-display font-medium text-[#191613] leading-[1.2]"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}
          >
            Inside every brief.
          </h2>
          <p className="font-body-serif text-[0.92rem] text-[#5C564C] leading-[1.75] font-[300] max-w-[380px]">
            Not a case study. Not a podcast. A structured arc — from the first commit to the first dollar — with the exact levers the founder pulled, in the order they pulled them.
          </p>
          <a
            href="/auth/register"
            className="font-body-serif text-[0.88rem] text-[#C15F3C] no-underline flex items-center gap-1.5 group w-fit"
          >
            Read a full brief
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Right — mock intel card */}
        <div
          className="rounded-[14px] overflow-hidden border border-[#DDD8CB]"
          style={{ background: '#FAFAF5', boxShadow: '0 4px 24px rgba(25,22,19,0.06)' }}
        >
          {/* Card header — colored vis area */}
          <div
            className="flex flex-col justify-end p-6"
            style={{ height: 180, background: '#D4896A' }}
          >
            {/* Timeline bar */}
            <div className="flex items-center gap-0 w-full">
              {['Day 1', 'Day 12', 'Day 22', 'Day 43'].map((label, i) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ background: i === 3 ? '#191613' : 'rgba(25,22,19,0.35)' }}
                  />
                  <span
                    className="font-mono-jb text-[0.55rem] text-center"
                    style={{ color: i === 3 ? '#191613' : 'rgba(25,22,19,0.45)' }}
                  >
                    {label}
                  </span>
                </div>
              ))}
              {/* connector line behind dots */}
            </div>
          </div>

          {/* Card body */}
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-[1.15rem] font-medium text-[#191613] leading-[1.3]">
                  Jake Kim — AI Thumbnails
                </h3>
                <p className="font-body-serif text-[0.8rem] text-[#847E72] mt-1 leading-[1.5] font-[300]">
                  Free watermark tier as distribution. 22-sec build clips on X. Cut onboarding from 5 steps to 2.
                </p>
              </div>
            </div>
            {/* Stats footer */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#DDD8CB] mt-1">
              <span className="font-mono-jb text-[0.68rem] text-[#847E72] flex items-center gap-1">
                <strong className="text-[#302B24] font-[500]">$8.2K</strong> MRR
              </span>
              <span className="w-px h-[10px] bg-[#DDD8CB]" />
              <span className="font-mono-jb text-[0.68rem] text-[#847E72] flex items-center gap-1">
                <strong className="text-[#302B24] font-[500]">43</strong> days
              </span>
              <span className="font-mono-jb text-[0.62rem] ml-auto px-2 py-[3px] rounded-[4px] bg-[rgba(25,22,19,0.05)] text-[#5C564C]">
                AI Tools
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .intel-preview-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: clamp(32px, 6vw, 80px);
          align-items: center;
        }
        @media (max-width: 720px) {
          .intel-preview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
