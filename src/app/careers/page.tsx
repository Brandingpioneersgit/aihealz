import { Metadata } from 'next';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';
import EditorialFigure from '@/components/v4/EditorialFigure';
import MediaTile from '@/components/v4/MediaTile';
import { ABOUT_IMAGES } from '@/lib/stock-images';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'Careers — build the future of care with aihealz',
  description: 'Open roles at aihealz. We are hiring engineers, clinicians, and operators to organize the world\'s medical expertise.',
  alternates: { canonical: 'https://aihealz.com/careers' },
  openGraph: {
    title: 'Careers at aihealz',
    description: 'Help us organize the world\'s medical expertise.',
    url: 'https://aihealz.com/careers',
    siteName: 'aihealz',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Careers at aihealz', description: 'Open roles.' },
};

interface Role {
  title: string;
  location: string;
  category: string;
  type: string;
  description: string;
}

const ROLES: Role[] = [];

const CATEGORIES = ['Engineering', 'Clinical', 'Design', 'Operations', 'Growth'];

const jobPostingSchema = ROLES.length
  ? ROLES.map((r) => ({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: r.title,
      description: r.description,
      employmentType: r.type,
      hiringOrganization: { '@type': 'Organization', name: 'aihealz', sameAs: 'https://aihealz.com' },
      jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: r.location } },
      datePosted: new Date().toISOString().split('T')[0],
    }))
  : null;

export default function CareersPage() {
  return (
    <V4Page>
      {jobPostingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
        />
      )}
      <div className="v4-root" style={{ background: 'var(--bg)', color: 'var(--ink-1)', padding: '48px clamp(16px, 4vw, 28px) 80px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <nav className="row gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Link href="/">Home</Link><span>/</span><span style={{ color: 'var(--ink)' }}>Careers</span>
          </nav>

          <div className="row gap-7 ai-end" style={{ flexWrap: 'wrap', marginBottom: 48 }}>
            <div className="col gap-3" style={{ flex: '1 1 420px', minWidth: 0 }}>
              <span className="section-mark">careers / build the bureau</span>
              <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.04em', margin: 0, fontWeight: 600 }}>
                Build the future of care<span style={{ color: 'var(--orange)' }}>.</span>
              </h1>
              <p className="lede" style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 640, margin: 0 }}>
                We are a small team organizing the world&rsquo;s medical expertise. Engineers, clinicians,
                designers, and operators all welcome.
              </p>
            </div>
            <div style={{ flex: '1 1 360px', minWidth: 0 }}>
              <MediaTile
                alt={ABOUT_IMAGES.training.alt}
                icon={ABOUT_IMAGES.training.icon}
                tone={ABOUT_IMAGES.training.tone}
                aspect="4 / 3"
                iconSize={72}
                priority
                style={{
                  borderRadius: 'var(--r-3, 8px)',
                  border: '1px solid var(--rule)',
                }}
              />
            </div>
          </div>

          <EditorialFigure
            image={ABOUT_IMAGES.pairing}
            eyebrow="The culture"
            caption="Cross-functional pairing every day — engineers next to clinicians, design next to operations. The work is fast and the standards are clinical-grade."
          />


          {ROLES.length === 0 ? (
            <div
              className="card-flat"
              style={{ padding: 32, borderRadius: 16, textAlign: 'center', marginBottom: 32 }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No openings right now</h2>
              <p style={{ color: 'var(--ink-2)', fontSize: 15, marginBottom: 16 }}>
                We are not actively hiring at the moment, but we are always open to exceptional people.
              </p>
              <a
                href="mailto:careers@aihealz.com"
                style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--cobalt)', color: '#fff', borderRadius: 10, fontWeight: 500, textDecoration: 'none' }}
              >
                careers@aihealz.com
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {ROLES.map((r) => (
                <div
                  key={r.title}
                  className="card-flat"
                  style={{ padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                >
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{r.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>{r.category} · {r.location} · {r.type}</p>
                  </div>
                  <a
                    href={`mailto:careers@aihealz.com?subject=Application: ${encodeURIComponent(r.title)}`}
                    style={{ padding: '8px 16px', background: 'var(--cobalt)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
                  >
                    Apply →
                  </a>
                </div>
              ))}
            </div>
          )}

          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Where we hire</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {CATEGORIES.map((c) => (
                <div key={c} className="card-flat" style={{ padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 500 }}>
                  {c}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </V4Page>
  );
}
