import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sitemap — all pages on aihealz',
  description: 'A categorized, human-readable map of major pages on aihealz.',
  alternates: { canonical: 'https://aihealz.com/sitemap' },
  openGraph: {
    title: 'aihealz Sitemap',
    description: 'A categorized index of all major pages on aihealz.',
    url: 'https://aihealz.com/sitemap',
    siteName: 'aihealz',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'aihealz Sitemap', description: 'All pages.' },
};

const SECTIONS = [
  {
    title: 'For Patients',
    links: [
      ['/symptoms', 'Symptom checker'],
      ['/conditions', 'Browse conditions A–Z'],
      ['/treatments', 'Treatments & costs'],
      ['/doctors', 'Find a doctor'],
      ['/hospitals', 'Hospitals'],
      ['/diagnostic-labs', 'Diagnostic labs'],
      ['/tests', 'Lab tests'],
      ['/analyze', 'Analyze a medical report'],
      ['/healz-ai', 'Healz AI'],
      ['/medical-travel', 'Medical travel'],
      ['/vault', 'Patient vault'],
      ['/book', 'Book an appointment'],
    ],
  },
  {
    title: 'For Providers',
    links: [
      ['/provider/join', 'List your practice'],
      ['/provider/login', 'Doctor login'],
      ['/provider/dashboard', 'Doctor dashboard'],
      ['/provider/hospital/dashboard', 'Hospital dashboard'],
      ['/provider/lab/dashboard', 'Lab dashboard'],
      ['/pricing', 'Pricing & plans'],
    ],
  },
  {
    title: 'Insurance & Billing',
    links: [
      ['/insurance', 'Insurance providers'],
      ['/tpas', 'TPAs'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['/about', 'About'],
      ['/careers', 'Careers'],
      ['/press', 'Press & media'],
      ['/contact', 'Contact'],
      ['/editorial-board', 'Editorial board'],
      ['/blog', 'Blog'],
      ['/faq', 'FAQ'],
    ],
  },
  {
    title: 'Trust & Legal',
    links: [
      ['/privacy', 'Privacy policy'],
      ['/terms', 'Terms of service'],
      ['/medical-disclaimer', 'Medical disclaimer'],
      ['/accessibility', 'Accessibility'],
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">Sitemap</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-4">
          Site<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">map.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
          A categorized index of major pages on aihealz.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <section key={s.title} className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
              <h2 className="text-base font-bold text-white mb-3">{s.title}</h2>
              <ul className="flex flex-col gap-2">
                {s.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
