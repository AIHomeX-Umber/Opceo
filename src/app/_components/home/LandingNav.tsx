import Link from 'next/link';

export function LandingNav() {
  const centerLinks = [
    { href: '/', label: '首页', active: true },
    { href: '/explore?tab=live', label: 'Build Signals', active: false },
    { href: '#mission', label: 'Mission', active: false },
    { href: '/ship', label: 'Ship Log', active: false },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-black/8 bg-[#FAFAF5]/88 px-4 backdrop-blur-xl">
      <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-1 sm:px-0">
        <Link
          href="/"
          className="font-display text-[1.08rem] font-medium tracking-[-0.025em] text-[#111111] no-underline"
        >
          OpCEO<span className="text-[#C15F3C]">.</span>AI
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {centerLinks.map(({ href, label, active }) => (
            <Link
              key={label}
              href={href}
              className={`relative py-1 font-body-serif text-[0.9rem] no-underline transition-colors ${
                active ? 'text-[#111111]' : 'text-black/48 hover:text-[#111111]'
              }`}
            >
              {label}
              {active && (
                <span className="absolute inset-x-0 -bottom-1 mx-auto h-px w-5 rounded-full bg-[#111111]" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/auth/login"
            className="hidden font-body-serif text-[0.9rem] text-black/52 no-underline transition-colors hover:text-[#111111] sm:inline"
          >
            登录
          </Link>
          <Link
            href="/ship"
            className="rounded-[6px] bg-[#111111] px-4 py-2 font-body-serif text-[0.86rem] text-white no-underline transition-colors hover:bg-[#302B24]"
          >
            提交 Ship Log
          </Link>
        </div>
      </div>
    </nav>
  );
}
