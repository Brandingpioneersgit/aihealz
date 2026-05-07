import { Metadata } from 'next';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';

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
    <V4Page>
      <div className="v4-root" style={{ background: 'var(--bg)', color: 'var(--ink-1)', padding: '48px 28px 80px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <nav className="row gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Link href="/">Home</Link><span>/</span><span style={{ color: 'var(--ink)' }}>Sitemap</span>
          </nav>

          <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 16px', fontWeight: 600 }}>
            Sitemap.
          </h1>
          <p className="lede" style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 640, marginBottom: 40 }}>
            A categorized index of major pages on aihealz.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--ink-1)' }}>{s.title}</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} style={{ fontSize: 14, color: 'var(--ink-2)' }}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </V4Page>
  );
}
