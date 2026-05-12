import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';
import { SPECIALTY_IMAGES } from '@/lib/stock-images';

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
    <V4Page>
      <div className="v4-root" style={{ background: 'var(--bg)', color: 'var(--ink-1)', padding: '48px clamp(16px, 4vw, 28px) 80px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <nav className="row gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Link href="/">Home</Link><span>/</span><span style={{ color: 'var(--ink)' }}>Book</span>
          </nav>

          <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 16px', fontWeight: 600 }}>
            Book in under a minute.
          </h1>
          <p className="lede" style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 640, marginBottom: 40 }}>
            Pick what you need. We'll match you to a verified doctor or lab nearby.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
            <Link
              href="/book/doctor"
              className="card"
              style={{ padding: 0, borderRadius: 18, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  overflow: 'hidden',
                  background: 'var(--bg-2)',
                  borderBottom: '1px solid var(--rule)',
                }}
              >
                <Image
                  src={SPECIALTY_IMAGES.consultation.src}
                  alt={SPECIALTY_IMAGES.consultation.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(10,26,47,0) 60%, rgba(10,26,47,0.20) 100%)',
                  }}
                />
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>For consultations</p>
                <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Book a doctor</h2>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.55 }}>
                  In-person or teleconsult with a verified specialist. Instant confirmation, clinic details, and a reminder.
                </p>
                <span style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500 }}>Continue →</span>
              </div>
            </Link>

            <Link
              href="/tests"
              className="card"
              style={{ padding: 0, borderRadius: 18, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  overflow: 'hidden',
                  background: 'var(--bg-2)',
                  borderBottom: '1px solid var(--rule)',
                }}
              >
                <Image
                  src={SPECIALTY_IMAGES.blood.src}
                  alt={SPECIALTY_IMAGES.blood.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(10,26,47,0) 60%, rgba(10,26,47,0.20) 100%)',
                  }}
                />
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>For diagnostics</p>
                <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Book a test</h2>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.55 }}>
                  Compare prices on lab tests and health checkups. Home collection where available.
                </p>
                <span style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500 }}>Browse tests →</span>
              </div>
            </Link>
          </div>

          <div
            className="row gap-4 mono"
            style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.10em', flexWrap: 'wrap' }}
          >
            {TRUST.map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>
      </div>
    </V4Page>
  );
}
