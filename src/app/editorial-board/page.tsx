import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import V4Page from '@/components/v4/Shell';
import { UTIL_IMAGES } from '@/lib/stock-images';

export const revalidate = 604800;

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
    <V4Page>
      <div className="v4-root" style={{ background: 'var(--bg)', color: 'var(--ink-1)', padding: '48px clamp(16px, 4vw, 28px) 80px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <nav className="row gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Link href="/">Home</Link><span>/</span><span style={{ color: 'var(--ink)' }}>Editorial Board</span>
          </nav>

          <div className="row gap-7 ai-end" style={{ flexWrap: 'wrap', marginBottom: 32 }}>
            <div className="col gap-3" style={{ flex: '1 1 420px', minWidth: 0 }}>
              <span className="section-mark">the bureau / editorial board</span>
              <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.04em', margin: 0, fontWeight: 600 }}>
                Editorial board<span style={{ color: 'var(--orange)' }}>.</span>
              </h1>
              <p className="lede" style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 720, margin: 0 }}>
                Every patient-facing page on aihealz is written or reviewed by qualified clinicians.
              </p>
            </div>
            <div
              style={{
                position: 'relative',
                flex: '1 1 320px',
                minWidth: 0,
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                borderRadius: 'var(--r-3, 8px)',
                border: '1px solid var(--rule)',
              }}
            >
              <Image
                src={UTIL_IMAGES.pen.src}
                alt={UTIL_IMAGES.pen.alt}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                priority
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
          </div>

          {hasPlaceholder && (
            <div className="card-flat" style={{ padding: 16, borderRadius: 12, fontSize: 13, color: 'var(--ink-2)', marginBottom: 32 }}>
              Editorial board listing coming soon — current reviewers are anonymized.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {members.map((m) => (
              <div key={m.name} className="card-flat" style={{ padding: 20, borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--cobalt-50, #e0ecff)', color: 'var(--cobalt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {m.initials || m.name.replace(/^Dr\.\s*/, '').charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{m.name}</p>
                    {m.qualifications && <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>{m.qualifications}</p>}
                  </div>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--cobalt)', marginBottom: 8 }}>
                  {m.specialty}{m.city ? ` · ${m.city}` : ''}
                </p>
                {m.bio && <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{m.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </V4Page>
  );
}
