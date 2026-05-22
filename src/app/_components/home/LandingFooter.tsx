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
            OpCEO<span className="text-[#5B4BFF]">.</span>AI
          </Link>
          <p className="mt-1 font-body-serif text-[0.82rem] text-black/40">
            AI-native builders network. Powered by Makox.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {[
            { href: '/explore?tab=builders', label: '建造者' },
            { href: '/calendar', label: '活动日历' },
            { href: '/accelerate', label: '加速计划' },
            { href: '/auth/register', label: '加入 OpCEO' },
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
