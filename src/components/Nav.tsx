'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Wordmark } from '@/components/Wordmark';

const PROGRAMS_ITEMS = [
  { href: '/quests', label: 'Quests', desc: 'Post a task. Claim a quest. Ship together.' },
  { href: '/calendar', label: 'Calendar', desc: 'Upcoming events and deadlines.' },
  { href: '/accelerate', label: 'Accelerate', desc: 'Growth programs for builders.' },
];

export default function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [builderSlug, setBuilderSlug] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const programsRef = useRef<HTMLDivElement>(null);
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

  // Close Programs dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (programsRef.current && !programsRef.current.contains(e.target as Node)) {
        setProgramsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  // Programs is "active" if current path is one of its children
  const programsActive = PROGRAMS_ITEMS.some((p) => pathname === p.href || pathname.startsWith(p.href + '/'));

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0a0a]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Wordmark size="md" linkToHome />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {/* Explore */}
          <Link
            href="/explore"
            className={`text-sm transition-colors ${
              pathname === '/explore' || pathname.startsWith('/explore')
                ? 'text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Explore
          </Link>

          {/* Agents */}
          <Link
            href="/agents"
            className={`text-sm transition-colors ${
              pathname === '/agents' || pathname.startsWith('/agents/')
                ? 'text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Agents
          </Link>

          {/* Programs dropdown */}
          <div className="relative" ref={programsRef}>
            <button
              onClick={() => setProgramsOpen((v) => !v)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                programsActive || programsOpen ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Programs
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="currentColor"
                className={`transition-transform ${programsOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {programsOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-sm border border-white/10 bg-[#0f0f0f] shadow-xl py-1 z-50">
                {PROGRAMS_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setProgramsOpen(false)}
                    className="block px-4 py-3 hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="text-sm text-white/80 group-hover:text-white transition-colors">
                      {item.label}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">{item.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: auth area */}
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
                Ship →
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
        <div className="md:hidden border-t border-white/8 bg-[#0a0a0a] px-4 py-4 flex flex-col gap-1">
          <Link
            href="/explore"
            onClick={() => setMenuOpen(false)}
            className={`text-sm py-2 transition-colors ${
              pathname.startsWith('/explore') ? 'text-white' : 'text-white/50'
            }`}
          >
            Explore
          </Link>
          <Link
            href="/agents"
            onClick={() => setMenuOpen(false)}
            className={`text-sm py-2 transition-colors ${
              pathname.startsWith('/agents') ? 'text-white' : 'text-white/50'
            }`}
          >
            Agents
          </Link>

          {/* Programs — tap to expand */}
          <div>
            <button
              onClick={() => setMobileProgramsOpen((v) => !v)}
              className={`w-full flex items-center justify-between text-sm py-2 transition-colors ${
                programsActive || mobileProgramsOpen ? 'text-white' : 'text-white/50'
              }`}
            >
              Programs
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="currentColor"
                className={`transition-transform ${mobileProgramsOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {mobileProgramsOpen && (
              <div className="ml-3 mt-1 mb-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                {PROGRAMS_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setMenuOpen(false); setMobileProgramsOpen(false); }}
                    className="text-sm py-1.5 text-white/50 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/8 pt-3 mt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/ship"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm px-3 py-2 bg-[#534AB7] text-white rounded-md text-center font-medium"
                >
                  Ship →
                </Link>
                {builderSlug && (
                  <Link
                    href={`/${builderSlug}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-white/60 py-1"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-white/40 text-left py-1"
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
                  className="text-sm px-3 py-2 bg-[#534AB7] text-white rounded-md text-center font-medium"
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
