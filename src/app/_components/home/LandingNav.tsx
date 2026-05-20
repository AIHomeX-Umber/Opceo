// LandingNav — homepage-only nav bar.
// Sticky at top-0 (global Nav is hidden on /).
// Chinese navigation labels for mainland-friendly experience.
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
            { href: '#intelligence', label: '增长情报' },
            { href: '/explore?tab=rankings', label: '建造者排行' },
            { href: '/agents', label: 'AI 员工' },
            { href: '/auth/register', label: '提交案例' },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="font-body-serif text-[0.88rem] text-[#5C564C] hover:text-[#191613] transition-colors no-underline"
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
