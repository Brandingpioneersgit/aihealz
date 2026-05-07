import { Metadata } from 'next';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';

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
    <V4Page>
      <div className="v4-root" style={{ background: 'var(--bg)', color: 'var(--ink-1)', padding: '48px 28px 80px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <nav className="row gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Link href="/">Home</Link><span>/</span><span style={{ color: 'var(--ink)' }}>Press</span>
          </nav>

          <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 16px', fontWeight: 600 }}>
            Press & media.
          </h1>
          <p className="lede" style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 640, marginBottom: 32 }}>
            Brand assets, founder bios, and recent coverage. For interviews and media requests, email{' '}
            <a href="mailto:press@aihealz.com" style={{ color: 'var(--cobalt)' }}>press@aihealz.com</a>.
          </p>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Brand assets</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <a href="/og-default.jpg" download className="card-flat" style={{ padding: 20, borderRadius: 12, textDecoration: 'none', color: 'inherit' }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>Logo (PNG)</p>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Download →</p>
              </a>
              <a href="/og-default.jpg" download className="card-flat" style={{ padding: 20, borderRadius: 12, textDecoration: 'none', color: 'inherit' }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>OG image</p>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>1200×630 →</p>
              </a>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Founder bios</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FOUNDERS.map((f) => (
                <div key={f.name} className="card-flat" style={{ padding: 20, borderRadius: 12 }}>
                  <p style={{ fontSize: 15, fontWeight: 600 }}>{f.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>{f.role}</p>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{f.bio}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Recent coverage</h2>
            {COVERAGE.length === 0 ? (
              <div className="card-flat" style={{ padding: 20, borderRadius: 12, fontSize: 14, color: 'var(--ink-2)' }}>
                Recent coverage will appear here as it lands. Press inquiries: <a href="mailto:press@aihealz.com" style={{ color: 'var(--cobalt)' }}>press@aihealz.com</a>.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {COVERAGE.map((c) => (
                  <li key={c.href} className="card-flat" style={{ padding: 16, borderRadius: 10 }}>
                    <a href={c.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>{c.outlet} · {c.date}</p>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </V4Page>
  );
}
