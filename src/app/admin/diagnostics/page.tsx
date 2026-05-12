import Link from 'next/link';
import { Metadata } from 'next';
import prisma from '@/lib/db';

export const metadata: Metadata = {
    title: 'Diagnostics — admin | aihealz',
    robots: { index: false, follow: false },
};

const SECTIONS = [
    {
        href: '/admin/diagnostics/providers',
        abbr: 'PR',
        title: 'Providers',
        desc: 'Lab + diagnostic-centre directory. Approve, edit, or deactivate.',
    },
    {
        href: '/admin/diagnostics/tests',
        abbr: 'TS',
        title: 'Tests',
        desc: 'Catalog of individual lab tests, panels, and imaging studies.',
    },
    {
        href: '/admin/diagnostics/packages',
        abbr: 'PK',
        title: 'Packages',
        desc: 'Bundled test packages — pricing, included tests, eligibility.',
    },
    {
        href: '/admin/diagnostics/bookings',
        abbr: 'BK',
        title: 'Bookings',
        desc: 'Recent bookings across the network. Filter by provider or status.',
    },
];

export default async function AdminDiagnosticsIndex() {
    const [providers, tests, packages, bookings] = await Promise.all([
        prisma.diagnosticProvider.count().catch(() => 0),
        prisma.diagnosticTest.count().catch(() => 0),
        prisma.diagnosticPackage.count().catch(() => 0),
        prisma.diagnosticBooking.count().catch(() => 0),
    ]);

    const counts: Record<string, number> = {
        '/admin/diagnostics/providers': providers,
        '/admin/diagnostics/tests': tests,
        '/admin/diagnostics/packages': packages,
        '/admin/diagnostics/bookings': bookings,
    };

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1280, margin: '0 auto', padding: '40px clamp(16px, 4vw, 28px) 80px' }}
                className="col gap-6"
            >
                <div className="col gap-3">
                    <div
                        className="row gap-2 mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}
                        aria-label="Breadcrumb"
                    >
                        <Link href="/admin">Admin</Link>
                        <span>/</span>
                        <span style={{ color: 'var(--ink)' }}>Diagnostics</span>
                    </div>
                    <span className="section-mark">admin / diagnostics</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(32px, 4.5vw, 56px)',
                            margin: 0,
                            letterSpacing: '-0.04em',
                            fontWeight: 600,
                            lineHeight: 1.05,
                        }}
                    >
                        Diagnostics network<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 18, maxWidth: 640 }}>
                        Manage providers, tests, packages, and bookings across the diagnostic network.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 0,
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--r-3)',
                        background: 'var(--paper)',
                        overflow: 'hidden',
                    }}
                >
                    {SECTIONS.map((s, i, arr) => {
                        const cols = 4;
                        const isLastCol = (i + 1) % cols === 0;
                        const isLastRow = i >= arr.length - cols;
                        const count = counts[s.href];
                        return (
                            <Link
                                key={s.href}
                                href={s.href}
                                className="col gap-3"
                                style={{
                                    padding: '24px 22px',
                                    borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                    borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                }}
                            >
                                <div className="row between ai-center">
                                    <div className="spec-icon">{s.abbr}</div>
                                    <span
                                        className="num"
                                        style={{
                                            fontSize: 16,
                                            color: 'var(--ink-2)',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {count.toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <div
                                        className="display"
                                        style={{
                                            fontSize: 18,
                                            letterSpacing: '-0.02em',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {s.title}
                                    </div>
                                    <div
                                        className="muted"
                                        style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}
                                    >
                                        {s.desc}
                                    </div>
                                </div>
                                <span
                                    className="mono"
                                    style={{
                                        marginTop: 'auto',
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                    }}
                                >
                                    Open →
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
