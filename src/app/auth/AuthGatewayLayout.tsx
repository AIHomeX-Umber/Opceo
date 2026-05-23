import Link from 'next/link';

const SIGNALS = [
  { label: 'Weekly ships', zh: '每周发布' },
  { label: 'Visible trajectories', zh: '成长轨迹可见' },
  { label: 'Signal before consensus', zh: '在共识前被看见' },
];

interface AuthGatewayLayoutProps {
  mode: 'login' | 'register';
  children: React.ReactNode;
}

export function AuthGatewayLayout({ mode, children }: AuthGatewayLayoutProps) {
  const action =
    mode === 'login'
      ? { href: '/auth/register', label: 'Join' }
      : { href: '/auth/login', label: 'Sign in' };

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#111111]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-[1.08rem] font-medium tracking-[-0.025em] text-[#111111] no-underline"
        >
          OpCEO<span className="text-[#5B4BFF]">.</span>AI
        </Link>
        <Link
          href={action.href}
          className="rounded-xl border border-black/5 bg-white px-4 py-2 font-body-serif text-[0.9rem] text-black/56 no-underline shadow-[0_14px_40px_rgba(20,20,20,0.035)] transition-colors hover:text-[#111111]"
        >
          {action.label}
        </Link>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl grid-cols-1 items-center gap-14 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1fr_420px] lg:gap-20 lg:pb-24 lg:pt-12">
        <section>
          <p className="mb-7 font-mono-jb text-[0.72rem] uppercase tracking-[0.18em] text-black/36">
            Frontier Gateway
          </p>
          <h1 className="max-w-3xl font-display text-[clamp(3.1rem,7vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.055em] text-[#111111]">
            在公开中建造。
            <br />
            让世界看到你的成长轨迹。
          </h1>
          <p className="mt-8 max-w-xl font-body-serif text-[1.12rem] leading-8 text-black/58 sm:text-[1.22rem]">
            OpCEO 是面向 AI 时代的建造者网络。持续发布、获得反馈、积累影响力。
          </p>

          <div className="mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
            {SIGNALS.map((signal) => (
              <div
                key={signal.label}
                className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(20,20,20,0.035)]"
              >
                <p className="font-mono-jb text-[0.68rem] uppercase tracking-[0.14em] text-[#5B4BFF]/72">
                  {signal.label}
                </p>
                <p className="mt-3 font-body-serif text-[0.95rem] text-black/52">
                  {signal.zh}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_30px_90px_rgba(20,20,20,0.075)] sm:p-8">
          {children}
        </section>
      </main>
    </div>
  );
}
