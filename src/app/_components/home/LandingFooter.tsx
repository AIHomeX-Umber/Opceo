// LandingFooter — minimal footer for the homepage.
// Copyright left, 3 links right. Dark border-top on parchment.
// Server component.

import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid #DDD8CB',
        padding: 'clamp(20px, 3vw, 32px) clamp(24px, 5vw, 72px)',
        background: '#F3EFE6',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left — copyright */}
        <span className="font-mono-jb text-[0.68rem] text-[#847E72]">
          © 2026 OpCEO<span style={{ color: '#C15F3C' }}>.</span>AI
        </span>

        {/* Right — links */}
        <nav className="flex items-center gap-6">
          {[
            { href: 'https://x.com/opceoai', label: 'X / Twitter', external: true },
            { href: '/auth/register', label: 'Newsletter', external: false },
            { href: '/ship', label: 'Submit a builder', external: false },
          ].map(({ href, label, external }) => (
            <Link
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="font-mono-jb text-[0.68rem] text-[#847E72] hover:text-[#302B24] transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Micro tagline */}
      <p className="font-mono-jb text-[0.6rem] text-[#AEA899] mt-4 text-center tracking-[0.06em]">
        New intel published weekly · Open for builder submissions
      </p>
    </footer>
  );
}
