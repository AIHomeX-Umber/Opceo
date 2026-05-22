'use client';

// Nav — warm editorial global nav for all routes except /.
// / gets its own LandingNav via ConditionalNav in layout.tsx.
// Auth logic and mobile menu preserved; top-level information architecture is intentionally compact.
// Visual system: #FAFAF5 bg, #302B24 text, #C15F3C accent, #DDD8CB border.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const NAV_ITEMS = [
  { href: '/explore?tab=live', label: 'Live', active: (pathname: string) => pathname === '/explore' },
  { href: '/explore?tab=builders', label: 'Builders', active: () => false },
  { href: '/calendar', label: 'Calendar', active: (pathname: string) => pathname.startsWith('/calendar') },
  { href: '/accelerate', label: 'Accelerate', active: (pathname: string) => pathname.startsWith('/accelerate') },
];

export default function Nav() {
  const pathname = usePathname();
  const [user,        setUser]        = useState<User | null>(null);
  const [builderSlug, setBuilderSlug] = useState<string | null>(null);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const supabase = createClient();
  const isAuthRoute = pathname?.startsWith('/auth/');

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

  // Underline indicator for active nav links
  const linkCls = (active: boolean) =>
    `font-body-serif text-[0.88rem] transition-colors relative pb-[2px] ${
      active
        ? 'text-[#191613] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C15F3C] after:rounded-full'
        : 'text-[#5C564C] hover:text-[#302B24]'
    }`;

  if (isAuthRoute) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-[#DDD8CB] bg-[#FAFAF5]">
      <div
        className="h-14 flex items-center justify-between"
        style={{ padding: '0 clamp(16px, 4vw, 48px)' }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-[1.15rem] font-medium text-[#191613] no-underline tracking-[-0.02em] flex-shrink-0"
        >
          OpCEO<span className="text-[#C15F3C]">.</span>AI
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkCls(item.active(pathname))}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side — auth area */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/ship"
                className="font-body-serif text-[0.84rem] px-[18px] py-[7px] bg-[#191613] hover:bg-[#302B24] text-[#FAFAF5] rounded-[6px] no-underline transition-colors"
              >
                Ship →
              </Link>
              {builderSlug && (
                <Link
                  href={`/${builderSlug}`}
                  className="font-body-serif text-[0.88rem] text-[#5C564C] hover:text-[#302B24] transition-colors no-underline"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="font-body-serif text-[0.88rem] text-[#AEA899] hover:text-[#5C564C] transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="font-body-serif text-[0.88rem] text-[#5C564C] hover:text-[#302B24] transition-colors no-underline"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="font-body-serif text-[0.84rem] px-[18px] py-[7px] bg-[#191613] hover:bg-[#302B24] text-[#FAFAF5] rounded-[6px] no-underline transition-colors"
              >
                Ship →
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#5C564C] hover:text-[#302B24] transition-colors"
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
        <div className="md:hidden border-t border-[#DDD8CB] bg-[#FAFAF5] px-5 py-4 flex flex-col gap-1">
          <Link
            href="/explore?tab=live"
            onClick={() => setMenuOpen(false)}
            className={`font-body-serif text-[0.88rem] py-2.5 transition-colors border-b border-[#EBE6DA] ${
              pathname.startsWith('/explore') ? 'text-[#191613]' : 'text-[#5C564C]'
            }`}
          >
            Live
          </Link>
          <Link
            href="/explore?tab=builders"
            onClick={() => setMenuOpen(false)}
            className={`font-body-serif text-[0.88rem] py-2.5 transition-colors border-b border-[#EBE6DA] ${
              pathname.startsWith('/explore') ? 'text-[#191613]' : 'text-[#5C564C]'
            }`}
          >
            Builders
          </Link>
          <Link
            href="/calendar"
            onClick={() => setMenuOpen(false)}
            className={`font-body-serif text-[0.88rem] py-2.5 transition-colors border-b border-[#EBE6DA] ${
              pathname.startsWith('/calendar') ? 'text-[#191613]' : 'text-[#5C564C]'
            }`}
          >
            Calendar
          </Link>
          <Link
            href="/accelerate"
            onClick={() => setMenuOpen(false)}
            className={`font-body-serif text-[0.88rem] py-2.5 transition-colors border-b border-[#EBE6DA] ${
              pathname.startsWith('/accelerate') ? 'text-[#191613]' : 'text-[#5C564C]'
            }`}
          >
            Accelerate
          </Link>

          <div className="pt-3 mt-1 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link
                  href="/ship"
                  onClick={() => setMenuOpen(false)}
                  className="font-body-serif text-[0.88rem] py-2.5 bg-[#191613] text-[#FAFAF5] rounded-[6px] text-center no-underline"
                >
                  Ship →
                </Link>
                {builderSlug && (
                  <Link
                    href={`/${builderSlug}`}
                    onClick={() => setMenuOpen(false)}
                    className="font-body-serif text-[0.88rem] text-[#5C564C] py-1 no-underline"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="font-body-serif text-[0.88rem] text-[#AEA899] text-left py-1 cursor-pointer"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="font-body-serif text-[0.88rem] text-[#5C564C] py-1 no-underline"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="font-body-serif text-[0.88rem] py-2.5 bg-[#191613] text-[#FAFAF5] rounded-[6px] text-center no-underline"
                >
                  Ship →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
