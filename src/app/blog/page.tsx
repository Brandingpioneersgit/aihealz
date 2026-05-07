import { Metadata } from 'next';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';
import NewsletterSignup from './NewsletterSignup';

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
}

async function loadPosts(): Promise<Post[]> {
  // BlogPost model doesn't exist in Prisma yet — return empty so the
  // "Coming soon" UI renders. Hook in DB lookup once the model lands.
  return [];
}

export default async function BlogPage() {
  const posts = await loadPosts();
  return (
    <V4Page>
      <div className="v4-root" style={{ background: 'var(--bg)', color: 'var(--ink-1)', padding: '48px 28px 80px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <nav className="row gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Link href="/">Home</Link><span>/</span><span style={{ color: 'var(--ink)' }}>Blog</span>
          </nav>

          <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 16px', fontWeight: 600 }}>
            The aihealz blog.
          </h1>
          <p className="lede" style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 640, marginBottom: 32 }}>
            Articles by our editorial team — reviewed by clinicians, written for patients.
          </p>

          {posts.length === 0 ? (
            <div className="card-flat" style={{ padding: 32, borderRadius: 16, marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Coming soon</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16 }}>
                Articles by our editorial team are on the way. Subscribe to get the first issue in your inbox.
              </p>
              <NewsletterSignup />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="card-flat"
                  style={{ padding: 20, borderRadius: 14, textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>
                    {new Date(p.publishedAt).toLocaleDateString()}{p.author ? ` · ${p.author}` : ''}
                  </p>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{p.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{p.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </V4Page>
  );
}
