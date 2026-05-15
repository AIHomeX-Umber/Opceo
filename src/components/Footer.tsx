import { Wordmark } from '@/components/Wordmark';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 mt-24">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <Wordmark size="sm" linkToHome={false} />
          <p className="text-xs text-white/30">
            © {year} Mashi Technology (马时科技). The Infinite Build.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { href: '/', label: 'Live' },
            { href: '/explore', label: 'Explore' },
            { href: '/leaderboard', label: 'Leaderboard' },
            { href: '/quests', label: 'Quests' },
            { href: '/about', label: 'About' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
