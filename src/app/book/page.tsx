import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book an appointment — doctor or test | aihealz',
  description: 'Book a verified doctor consultation or a diagnostic test in under 60 seconds.',
  alternates: { canonical: 'https://aihealz.com/book' },
  openGraph: {
    title: 'Book on aihealz',
    description: 'Book a verified doctor or a diagnostic test.',
    url: 'https://aihealz.com/book',
    siteName: 'aihealz',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Book on aihealz', description: 'Doctors & tests.' },
};

const TRUST = [
  '◆ Verified providers',
  '◆ Encrypted bookings',
  '◆ Free to use',
  '◆ Cancel anytime',
];

export default function BookPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">Book</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-4">
          Book in under a <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">minute.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
          Pick what you need. We&apos;ll match you to a verified doctor or lab nearby.
        </p>

        <div className="grid gap-4 md:grid-cols-2 mb-10">
          <Link
            href="/book/doctor"
            className="block bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-teal-500/30 hover:bg-slate-900/60 p-7 transition-all"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">For consultations</p>
            <h2 className="text-2xl font-bold text-white mb-2">Book a doctor</h2>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              In-person or teleconsult with a verified specialist. Instant confirmation, clinic details, and a reminder.
            </p>
            <span className="text-sm text-teal-400 font-semibold">Continue →</span>
          </Link>

          <Link
            href="/tests"
            className="block bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-teal-500/30 hover:bg-slate-900/60 p-7 transition-all"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">For diagnostics</p>
            <h2 className="text-2xl font-bold text-white mb-2">Book a test</h2>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Compare prices on lab tests and health checkups. Home collection where available.
            </p>
            <span className="text-sm text-teal-400 font-semibold">Browse tests →</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500 uppercase tracking-widest font-medium">
          {TRUST.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>
    </main>
  );
}
