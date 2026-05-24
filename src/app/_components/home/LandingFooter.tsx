import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#FAFAF5] px-6 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="font-display text-[1rem] font-medium tracking-[-0.02em] text-[#111111] no-underline"
          >
            OpCEO<span className="text-[#C15F3C]">.</span>AI
          </Link>
          <p className="mt-1 font-body-serif text-[0.82rem] text-black/40">
            用 AI 做出来，然后公开 Ship。
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {[
            { href: '/ship', label: '提交 Ship Log' },
            { href: '/explore?tab=live', label: 'Build Signals' },
            { href: '/calendar', label: '活动日历' },
            { href: '/accelerate', label: '加速计划' },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="font-body-serif text-[0.86rem] text-black/44 no-underline transition-colors hover:text-[#111111]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
