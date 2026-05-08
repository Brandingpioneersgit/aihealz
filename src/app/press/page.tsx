import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Press & Media — aihealz',
  description: 'Press kit, founder bios, brand assets, and recent coverage of aihealz.',
  alternates: { canonical: 'https://aihealz.com/press' },
  openGraph: {
    title: 'aihealz Press Room',
    description: 'Press kit, founder bios, and recent coverage.',
    url: 'https://aihealz.com/press',
    siteName: 'aihealz',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'aihealz Press Room', description: 'Press kit.' },
};

const FOUNDERS = [
  {
    name: 'Founding Team',
    role: 'Product & Engineering',
    bio: 'aihealz is built by a small founding team of engineers and clinicians focused on AI-driven medical access.',
  },
];

const COVERAGE: { outlet: string; title: string; href: string; date: string }[] = [];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">Press</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-4">
          Press &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">media.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
          Brand assets, founder bios, and recent coverage. For interviews and media requests, email{' '}
          <a href="mailto:press@aihealz.com" className="text-teal-400 hover:text-teal-300 font-medium">press@aihealz.com</a>.
        </p>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Brand assets</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/og-default.jpg" download className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 hover:border-teal-500/30 p-5 transition-colors block">
              <p className="text-sm font-semibold text-white">Logo (PNG)</p>
              <p className="text-xs text-slate-500 mt-1">Download →</p>
            </a>
            <a href="/og-default.jpg" download className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 hover:border-teal-500/30 p-5 transition-colors block">
              <p className="text-sm font-semibold text-white">OG image</p>
              <p className="text-xs text-slate-500 mt-1">1200×630 →</p>
            </a>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Founder bios</h2>
          <div className="flex flex-col gap-3">
            {FOUNDERS.map((f) => (
              <div key={f.name} className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 p-5">
                <p className="text-base font-semibold text-white">{f.name}</p>
                <p className="text-xs text-slate-500 mb-2">{f.role}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{f.bio}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Recent coverage</h2>
          {COVERAGE.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 p-5 text-sm text-slate-400">
              Recent coverage will appear here as it lands. Press inquiries: <a href="mailto:press@aihealz.com" className="text-teal-400 hover:text-teal-300 font-medium">press@aihealz.com</a>.
            </div>
          ) : (
            <ul className="flex flex-col gap-2 list-none">
              {COVERAGE.map((c) => (
                <li key={c.href} className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 hover:border-teal-500/30 p-4 transition-colors">
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="block">
                    <p className="text-sm font-semibold text-white">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.outlet} · {c.date}</p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
