// Footer — warm editorial global footer for all routes except /.
// / gets its own LandingFooter via the homepage component tree.
// Visual system: #F3EFE6 bg, #DDD8CB border, #847E72 text, #C15F3C accent.

import Link from 'next/link';

const NAV_LINKS = [
  { href: '/explore',    label: 'Explore' },
  { href: '/agents',     label: 'Agents' },
  { href: '/quests',     label: 'Quests' },
  { href: '/calendar',   label: 'Calendar' },
  { href: '/about',      label: 'About' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#DDD8CB] bg-[#F3EFE6]">
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{ maxWidth: 1152, margin: '0 auto', padding: '32px clamp(16px, 4vw, 48px)' }}
      >
        {/* Left — logo + copyright */}
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="font-display text-[1rem] font-medium text-[#302B24] no-underline tracking-[-0.02em]"
          >
            OpCEO<span className="text-[#C15F3C]">.</span>AI
          </Link>
          <p className="font-body-serif text-[0.75rem] text-[#847E72]">
            © {year} Mashi Technology (马时科技). The Infinite Build.
          </p>
        </div>

        {/* Right — nav links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body-serif text-[0.8rem] text-[#847E72] hover:text-[#5C564C] transition-colors no-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
