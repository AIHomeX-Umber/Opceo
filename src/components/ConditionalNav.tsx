'use client';

// ConditionalNav — renders the global dark Nav on every route EXCEPT /.
// Homepage has its own LandingNav with a warm editorial style.
// This keeps the global Nav out of the homepage without touching layout logic.

import { usePathname } from 'next/navigation';
import Nav from '@/components/Nav';

export default function ConditionalNav() {
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/auth/')) return null;
  return <Nav />;
}
