import type { Metadata } from 'next';
import { Geist, Geist_Mono, Newsreader, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ConditionalNav from '@/components/ConditionalNav';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Warm editorial fonts — loaded globally so Nav/Footer/Explore can use them
// without duplicating font loading in every page.
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600'],
});

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['300', '400'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-jb',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    default: 'OpCEO.AI — The Infinite Build',
    template: '%s | OpCEO.AI',
  },
  description:
    'OpCEO.AI is an open platform where builders publicly ship weekly progress logs, track build streaks, and connect with investors who signal-bet on promising projects.',
  metadataBase: new URL('https://opceo.ai'),
  openGraph: {
    siteName: 'OpCEO.AI — The Infinite Build',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0a0a] text-[#fafafa] min-h-screen flex flex-col`}
      >
        <ConditionalNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
