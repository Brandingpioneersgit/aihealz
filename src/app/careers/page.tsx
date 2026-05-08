import { Metadata } from 'next';
import Link from 'next/link';

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
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      {jobPostingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
        />
      )}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">Careers</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-4">
          Build the future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">care.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
          We are a small team organizing the world&apos;s medical expertise. Engineers, clinicians,
          designers, and operators all welcome.
        </p>

        {ROLES.length === 0 ? (
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">No openings right now</h2>
            <p className="text-slate-400 mb-6">
              We are not actively hiring at the moment, but we are always open to exceptional people.
            </p>
            <a
              href="mailto:careers@aihealz.com"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold transition-colors shadow-lg shadow-teal-500/20"
            >
              careers@aihealz.com
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-8">
            {ROLES.map((r) => (
              <div
                key={r.title}
                className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 hover:border-teal-500/30 p-5 flex items-center justify-between gap-4 transition-colors"
              >
                <div>
                  <p className="text-base font-semibold text-white">{r.title}</p>
                  <p className="text-sm text-slate-500">{r.category} · {r.location} · {r.type}</p>
                </div>
                <a
                  href={`mailto:careers@aihealz.com?subject=Application: ${encodeURIComponent(r.title)}`}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 text-sm font-bold transition-colors"
                >
                  Apply →
                </a>
              </div>
            ))}
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Where we hire</h2>
          <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-5">
            {CATEGORIES.map((c) => (
              <div
                key={c}
                className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 px-4 py-3 text-sm font-medium text-white text-center"
              >
                {c}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
