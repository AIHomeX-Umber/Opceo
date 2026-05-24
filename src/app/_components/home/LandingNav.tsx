// LandingNav — homepage-only nav bar.
// Sticky at top-0 (global Nav is hidden on /).
// Bilingual hybrid: English key + Chinese descriptor.
// Does NOT modify the global Nav component.

import Link from 'next/link';

export function LandingNav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-[#DDD8CB] bg-[#FAFAF5]"
      style={{ height: 64 }}
    >
      <div
        className="h-full flex items-center justify-between"
        style={{ padding: '0 clamp(24px, 5vw, 72px)' }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-[1.2rem] font-medium text-[#191613] no-underline tracking-[-0.02em]"
        >
          OpCEO<span className="text-[#C15F3C]">.</span>AI
        </Link>

        {/* Center links — hidden below md */}
        <div className="hidden md:flex gap-7">
          {[
            { href: '#intelligence', label: 'Intel 情报' },
            { href: '#signals',      label: 'Signals 信号' },
            { href: '/agents',       label: 'Agents' },
            { href: '/ship',         label: 'Ship →', accent: true },
          ].map(({ href, label, accent }) => (
            <Link
              key={label}
              href={href}
              className={`font-body-serif text-[0.88rem] transition-colors no-underline ${
                accent
                  ? 'text-[#C15F3C] hover:text-[#A04B2E]'
                  : 'text-[#5C564C] hover:text-[#191613]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: Login + CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="font-body-serif text-[0.88rem] text-[#5C564C] no-underline"
          >
            登录
          </Link>
          <Link
            href="/auth/register"
            className="font-body-serif text-[0.84rem] text-[#FAFAF5] bg-[#191613] hover:bg-[#302B24] px-[18px] py-2 rounded-[6px] no-underline transition-colors"
          >
            加入 OpCEO
          </Link>
        </div>
      </div>
    </nav>
  );
}
