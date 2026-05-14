'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { href: '/', label: 'Live' },
  { href: '/explore', label: 'Explore' },
  { href: '/quests', label: 'Quests' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
];

export default function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [builderSlug, setBuilderSlug] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        supabase
          .from('builders')
          .select('slug')
          .eq('user_id', data.user.id)
          .single()
          .then(({ data: b }) => setBuilderSlug(b?.slug ?? null));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setBuilderSlug(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0a0a]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-mono text-base font-semibold tracking-tight text-white hover:text-[#534AB7] transition-colors"
        >
          opceo.ai
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? 'text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/ship"
                className="text-sm px-3 py-1.5 bg-[#534AB7] hover:bg-[#4339a0] text-white rounded-md transition-colors font-medium"
              >
                Ship →
              </Link>
              {builderSlug && (
                <Link
                  href={`/${builderSlug}`}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm px-3 py-1.5 bg-[#534AB7] hover:bg-[#4339a0] text-white rounded-md transition-colors font-medium"
              >
                Start building
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/60 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen ? (
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/8 bg-[#0a0a0a] px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm py-1 transition-colors ${
                pathname === link.href ? 'text-white' : 'text-white/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/8 pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/ship"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm px-3 py-2 bg-[#534AB7] text-white rounded-md text-center"
                >
                  Ship →
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-white/40 text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-white/60 py-1"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm px-3 py-2 bg-[#534AB7] text-white rounded-md text-center"
                >
                  Start building
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
