import { Metadata } from 'next';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Editorial Board — clinical reviewers at aihealz',
  description: 'Meet the doctors and specialists who review patient-facing content on aihealz.',
  alternates: { canonical: 'https://aihealz.com/editorial-board' },
  openGraph: {
    title: 'aihealz Editorial Board',
    description: 'Doctors who review patient-facing content on aihealz.',
    url: 'https://aihealz.com/editorial-board',
    siteName: 'aihealz',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'aihealz Editorial Board', description: 'Clinical reviewers.' },
};

interface Member {
  name: string;
  specialty?: string;
  city?: string;
  initials?: string;
  qualifications?: string;
  bio?: string;
  placeholder?: boolean;
}

async function loadBoard(): Promise<Member[]> {
  try {
    const file = await fs.readFile(path.join(process.cwd(), 'public/data/editorial-board.json'), 'utf-8');
    const parsed = JSON.parse(file);
    if (Array.isArray(parsed)) return parsed as Member[];
    if (parsed && Array.isArray(parsed.members)) return parsed.members as Member[];
    return [];
  } catch {
    return [];
  }
}

export default async function EditorialBoardPage() {
  const members = await loadBoard();
  const hasPlaceholder = members.some((m) => m.placeholder);
  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">Editorial Board</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-4">
          Editorial <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">board.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-6 leading-relaxed">
          Every patient-facing page on aihealz is written or reviewed by qualified clinicians.
        </p>

        {hasPlaceholder && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3 text-sm text-amber-200/90 mb-8">
            Editorial board listing coming soon — current reviewers are anonymized.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.name} className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 hover:border-teal-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">
                  {m.initials || m.name.replace(/^Dr\.\s*/, '').charAt(0)}
                </div>
                <div>
                  <p className="text-base font-semibold text-white">{m.name}</p>
                  {m.qualifications && <p className="text-xs text-slate-500">{m.qualifications}</p>}
                </div>
              </div>
              <p className="text-sm font-medium text-teal-400 mb-2">
                {m.specialty}{m.city ? ` · ${m.city}` : ''}
              </p>
              {m.bio && <p className="text-sm text-slate-400 leading-relaxed">{m.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
