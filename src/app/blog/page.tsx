import { Metadata } from 'next';
import Link from 'next/link';
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
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">Blog</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-4">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">aihealz</span> blog.
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
          Articles by our editorial team — reviewed by clinicians, written for patients.
        </p>

        {posts.length === 0 ? (
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-8">
            <h2 className="text-xl font-bold text-white mb-2">Coming soon</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Articles by our editorial team are on the way. Subscribe to get the first issue in your inbox.
            </p>
            <NewsletterSignup />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-teal-500/30 hover:bg-slate-900/60 p-6 transition-all"
              >
                <p className="text-xs text-slate-500 mb-1">
                  {new Date(p.publishedAt).toLocaleDateString()}{p.author ? ` · ${p.author}` : ''}
                </p>
                <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
