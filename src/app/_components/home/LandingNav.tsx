// LandingNav — homepage-only nav bar.
// Sticky below the global site Nav (top-14 = 56px).
// Warm white (#FAFAF5), Newsreader logo, 3 center links, Login + Try OpCEO.
// Does NOT modify the global Nav component.

import Link from 'next/link';

export function LandingNav() {
  return (
    <nav
      className="sticky top-14 z-40 border-b border-[#DDD8CB] bg-[#FAFAF5]"
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
            { href: '#intel', label: 'Intelligence' },
            { href: '#how',   label: 'How it works' },
            { href: '/auth/register', label: 'Submit a builder' },
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
            className="text-[0.88rem] text-[#5C564C] no-underline"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="font-body-serif text-[0.84rem] text-[#FAFAF5] bg-[#191613] hover:bg-[#302B24] px-[18px] py-2 rounded-[6px] no-underline transition-colors"
          >
            Try OpCEO
          </Link>
        </div>
      </div>
    </nav>
  );
}
