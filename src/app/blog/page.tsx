import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';
import NewsletterSignup from './NewsletterSignup';
import { HERO_IMAGES, SPECIALTY_IMAGES } from '@/lib/stock-images';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Blog — patient-friendly health articles by aihealz',
  description: 'Articles, condition guides, and evidence-based health writing reviewed by our editorial board.',
  alternates: { canonical: 'https://aihealz.com/blog' },
  openGraph: {
    title: 'aihealz Blog',
    description: 'Articles by our editorial team and clinical reviewers.',
    url: 'https://aihealz.com/blog',
    siteName: 'aihealz',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'aihealz Blog', description: 'Articles by our editorial team.' },
};

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author?: string;
  image?: { src: string; alt: string };
  eyebrow?: string;
}

async function loadPosts(): Promise<Post[]> {
  // BlogPost model doesn't exist in Prisma yet — return empty so the
  // "Coming soon" preview renders. Hook in DB lookup once the model lands.
  return [];
}

// Previewed editorial slate — used in the "Coming soon" state so the
// blog page still reads like a real publication while the CMS catches up.
const COMING_SOON_PREVIEW: Post[] = [
  {
    slug: 'tsh-6-8',
    title: 'TSH 6.8 — the borderline number nobody explains',
    excerpt: 'A walkthrough of subclinical hypothyroidism: who needs treatment, who needs a repeat test, and what to ask your endocrinologist.',
    publishedAt: '2026-05-01',
    author: 'Dr. M. Pillai, Endocrinology',
    image: SPECIALTY_IMAGES.medication,
    eyebrow: 'endocrinology',
  },
  {
    slug: 'statins-at-40',
    title: 'Statins at 40 — the new threshold',
    excerpt: 'The 2025 cholesterol guidelines lowered the starting line. Here is what the evidence actually says about who benefits.',
    publishedAt: '2026-04-22',
    author: 'Dr. A. Rao, Cardiology',
    image: SPECIALTY_IMAGES.cardio,
    eyebrow: 'cardiology',
  },
  {
    slug: 'iron-deficiency',
    title: 'When ferritin lies',
    excerpt: 'Iron deficiency hides in plain sight on routine labs. The pattern, the next test, and what to do about it.',
    publishedAt: '2026-04-10',
    author: 'Dr. J. Okoro, Internal Medicine',
    image: SPECIALTY_IMAGES.blood,
    eyebrow: 'internal medicine',
  },
];

export default async function BlogPage() {
  const posts = await loadPosts();
  const display = posts.length === 0 ? COMING_SOON_PREVIEW : posts;
  const isPreview = posts.length === 0;

  return (
    <V4Page>
      <div className="v4-root" style={{ background: 'var(--bg)', color: 'var(--ink-1)', padding: '48px clamp(16px, 4vw, 28px) 80px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <nav className="row gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Link href="/">Home</Link><span>/</span><span style={{ color: 'var(--ink)' }}>Blog</span>
          </nav>

          {/* Hero banner */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '32 / 9',
              maxHeight: 320,
              overflow: 'hidden',
              borderRadius: 'var(--r-3, 8px)',
              border: '1px solid var(--rule)',
              marginBottom: 32,
            }}
          >
            <Image
              src={HERO_IMAGES.tools.src}
              alt={HERO_IMAGES.tools.alt}
              fill
              sizes="(max-width: 1080px) 100vw, 1080px"
              priority
              style={{ objectFit: 'cover' }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(10,26,47,0.55) 0%, rgba(10,26,47,0.20) 50%, rgba(10,26,47,0) 90%)',
              }}
            />
            <span
              className="mono"
              style={{
                position: 'absolute',
                left: 'clamp(16px, 3vw, 28px)',
                bottom: 18,
                color: 'rgba(255,255,255,0.9)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 500,
              }}
            >
              ● the blog / dispatches from the bureau
            </span>
          </div>

          <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 16px', fontWeight: 600 }}>
            The aihealz blog<span style={{ color: 'var(--orange)' }}>.</span>
          </h1>
          <p className="lede" style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 640, marginBottom: 32 }}>
            Articles by our editorial team — reviewed by clinicians, written for patients.
          </p>

          {isPreview && (
            <div
              className="card-flat"
              style={{
                padding: 24,
                borderRadius: 14,
                marginBottom: 32,
                background: 'var(--bg-2)',
                border: '1px dashed var(--rule)',
              }}
            >
              <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-1" style={{ flex: '1 1 360px', minWidth: 0 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                    Coming soon — preview below
                  </h2>
                  <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                    The first issue lands shortly. Subscribe to get it in your inbox.
                  </p>
                </div>
                <div style={{ flex: '0 1 320px' }}>
                  <NewsletterSignup />
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: 20,
            }}
          >
            {display.map((p) => {
              const Wrapper: React.ElementType = isPreview ? 'article' : Link;
              const wrapperProps = isPreview ? {} : { href: `/blog/${p.slug}` };
              return (
                <Wrapper
                  key={p.slug}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    opacity: isPreview ? 0.92 : 1,
                  }}
                  {...wrapperProps}
                >
                  {p.image && (
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
                        src={p.image.src}
                        alt={p.image.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 360px"
                        style={{ objectFit: 'cover' }}
                      />
                      <div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(10,26,47,0) 60%, rgba(10,26,47,0.18) 100%)',
                        }}
                      />
                    </div>
                  )}
                  <div className="col gap-2" style={{ padding: 18 }}>
                    {p.eyebrow && (
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--cobalt)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.10em',
                          fontWeight: 500,
                        }}
                      >
                        {p.eyebrow}
                      </span>
                    )}
                    <h3
                      className="display"
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        margin: 0,
                        letterSpacing: '-0.015em',
                        lineHeight: 1.25,
                      }}
                    >
                      {p.title}
                    </h3>
                    <p
                      className="muted"
                      style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}
                    >
                      {p.excerpt}
                    </p>
                    <div
                      className="row between ai-center"
                      style={{ paddingTop: 8, marginTop: 4, borderTop: '1px solid var(--rule)' }}
                    >
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {p.author && (
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                          {p.author}
                        </span>
                      )}
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </div>
    </V4Page>
  );
}
