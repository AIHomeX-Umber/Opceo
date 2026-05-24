'use client';

// Nav — warm editorial global nav for all routes except /.
// / gets its own LandingNav via ConditionalNav in layout.tsx.
// All auth logic, Programs dropdown, and mobile menu preserved exactly.
// Visual system: #FAFAF5 bg, #302B24 text, #C15F3C accent, #DDD8CB border.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const PROGRAMS_ITEMS = [
  { href: '/quests',     label: 'Quests',     desc: '发布任务，认领 Quest，一起 Ship。' },
  { href: '/calendar',  label: 'Calendar',   desc: '即将举行的活动与重要节点。' },
  { href: '/accelerate',label: 'Accelerate', desc: '面向 Builder 的成长项目。' },
];

export default function Nav() {
  const pathname = usePathname();
  const [user,               setUser]               = useState<User | null>(null);
  const [builderSlug,        setBuilderSlug]        = useState<string | null>(null);
  const [menuOpen,           setMenuOpen]           = useState(false);
  const [programsOpen,       setProgramsOpen]       = useState(false);
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

  const programsActive = PROGRAMS_ITEMS.some(
    (p) => pathname === p.href || pathname.startsWith(p.href + '/')
  );

  // Underline indicator for active nav links
  const linkCls = (active: boolean) =>
    `font-body-serif text-[0.88rem] transition-colors relative pb-[2px] ${
      active
        ? 'text-[#191613] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C15F3C] after:rounded-full'
        : 'text-[#5C564C] hover:text-[#302B24]'
    }`;

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
          <Link
            href="/explore"
            className={linkCls(pathname === '/explore' || pathname.startsWith('/explore'))}
          >
            Explore
          </Link>

          <Link
            href="/agents"
            className={linkCls(pathname === '/agents' || pathname.startsWith('/agents/'))}
          >
            Agents
          </Link>

          {/* Programs dropdown */}
          <div className="relative" ref={programsRef}>
            <button
              onClick={() => setProgramsOpen((v) => !v)}
              className={`font-body-serif text-[0.88rem] transition-colors flex items-center gap-1 cursor-pointer ${
                programsActive || programsOpen ? 'text-[#191613]' : 'text-[#5C564C] hover:text-[#302B24]'
              }`}
            >
              Programs
              <svg
                width="10" height="10" viewBox="0 0 10 10"
                fill="none" stroke="currentColor" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${programsOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 3.5L5 6.5L8 3.5"/>
              </svg>
            </button>

            {programsOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-[8px] border border-[#DDD8CB] bg-[#FAFAF5] shadow-[0_8px_32px_rgba(25,22,19,0.08)] py-1 z-50">
                {PROGRAMS_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setProgramsOpen(false)}
                    className="block px-4 py-3 hover:bg-[#F3EFE6] transition-colors group"
                  >
                    <div className="font-body-serif text-[0.88rem] text-[#302B24] group-hover:text-[#191613] transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[0.75rem] text-[#AEA899] mt-0.5">{item.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side — auth area */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/ship"
                className="font-body-serif text-[0.84rem] px-[18px] py-[7px] bg-[#191613] hover:bg-[#302B24] text-[#FAFAF5] rounded-[6px] no-underline transition-colors"
              >
                Submit Ship Log
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
                href="/ship"
                className="font-body-serif text-[0.84rem] px-[18px] py-[7px] bg-[#191613] hover:bg-[#302B24] text-[#FAFAF5] rounded-[6px] no-underline transition-colors"
              >
                Submit Ship Log
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
            href="/explore"
            onClick={() => setMenuOpen(false)}
            className={`font-body-serif text-[0.88rem] py-2.5 transition-colors border-b border-[#EBE6DA] ${
              pathname.startsWith('/explore') ? 'text-[#191613]' : 'text-[#5C564C]'
            }`}
          >
            Explore
          </Link>
          <Link
            href="/agents"
            onClick={() => setMenuOpen(false)}
            className={`font-body-serif text-[0.88rem] py-2.5 transition-colors border-b border-[#EBE6DA] ${
              pathname.startsWith('/agents') ? 'text-[#191613]' : 'text-[#5C564C]'
            }`}
          >
            Agents
          </Link>

          {/* Programs — tap to expand */}
          <div className="border-b border-[#EBE6DA]">
            <button
              onClick={() => setMobileProgramsOpen((v) => !v)}
              className={`w-full flex items-center justify-between font-body-serif text-[0.88rem] py-2.5 transition-colors cursor-pointer ${
                programsActive || mobileProgramsOpen ? 'text-[#191613]' : 'text-[#5C564C]'
              }`}
            >
              Programs
              <svg
                width="10" height="10" viewBox="0 0 10 10"
                fill="none" stroke="currentColor" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${mobileProgramsOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 3.5L5 6.5L8 3.5"/>
              </svg>
            </button>
            {mobileProgramsOpen && (
              <div className="ml-3 mb-1 flex flex-col gap-0 border-l-2 border-[#DDD8CB] pl-3">
                {PROGRAMS_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setMenuOpen(false); setMobileProgramsOpen(false); }}
                    className="font-body-serif text-[0.84rem] py-2 text-[#5C564C] hover:text-[#302B24] transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-1 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link
                  href="/ship"
                  onClick={() => setMenuOpen(false)}
                  className="font-body-serif text-[0.88rem] py-2.5 bg-[#191613] text-[#FAFAF5] rounded-[6px] text-center no-underline"
                >
                  Submit Ship Log
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
                  href="/ship"
                  onClick={() => setMenuOpen(false)}
                  className="font-body-serif text-[0.88rem] py-2.5 bg-[#191613] text-[#FAFAF5] rounded-[6px] text-center no-underline"
                >
                  Submit Ship Log
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
