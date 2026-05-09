import prisma from '@/lib/db';
import Link from 'next/link';

export default async function TpasAdminPage() {
    const [tpas, stats] = await Promise.all([
        prisma.tpa.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        insuranceLinks: true,
                        hospitalLinks: true,
                        geographyPresence: true,
                    },
                },
            },
        }),
        Promise.all([
            prisma.tpa.count(),
            prisma.tpa.count({ where: { isActive: true } }),
            prisma.tpa.aggregate({ _sum: { networkHospitalsCount: true, livesManaged: true } }),
        ]),
    ]);

    const [totalCount, activeCount, sumStats] = stats;

    const tpaTypeLabels: Record<string, string> = {
        private: 'Private',
        public: 'Public',
        government: 'Government',
    };

    const statCards: Array<{ label: string; value: string; code: string }> = [
        { label: 'Total TPAs', value: totalCount.toLocaleString(), code: 'TT' },
        { label: 'Active', value: activeCount.toLocaleString(), code: 'AC' },
        { label: 'Network Hospitals', value: (sumStats._sum.networkHospitalsCount || 0).toLocaleString(), code: 'NH' },
        { label: 'Lives Managed', value: `${((sumStats._sum.livesManaged || 0) / 100000).toFixed(1)}L`, code: 'LM' },
    ];

    const thStyle: React.CSSProperties = {
        padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--mono)',
        fontSize: 10, fontWeight: 600, color: 'var(--ink-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
    };
    const tdStyle: React.CSSProperties = {
        padding: '14px 16px', fontSize: 13, color: 'var(--ink-2)', verticalAlign: 'middle',
    };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <Link
                href="/admin/insurance"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to insurance
            </Link>

            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / tpas</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Third Party Administrators<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage TPAs, insurance partnerships, and hospital networks.
                    </p>
                </div>
                <Link href="/admin/tpas/new" className="btn btn-cobalt">
                    + Add TPA
                </Link>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 0,
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--r-3)',
                    background: 'var(--paper)',
                    overflow: 'hidden',
                }}
            >
                {statCards.map((s) => (
                    <div
                        key={s.label}
                        className="col gap-2"
                        style={{
                            padding: 20,
                            borderRight: '1px solid var(--rule)',
                            borderBottom: '1px solid var(--rule)',
                            background: 'var(--paper)',
                        }}
                    >
                        <div className="row ai-center gap-3">
                            <span className="spec-icon" aria-hidden="true">{s.code}</span>
                            <span className="kicker">{s.label}</span>
                        </div>
                        <div className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                {tpas.length === 0 ? (
                    <div className="col ai-center gap-4" style={{ padding: 48, textAlign: 'center' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            No TPAs added yet
                        </span>
                        <Link href="/admin/tpas/new" className="btn btn-cobalt">
                            Add First TPA
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                                <tr>
                                    <th scope="col" style={thStyle}>TPA</th>
                                    <th scope="col" style={thStyle}>Type</th>
                                    <th scope="col" style={thStyle}>HQ</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Insurers</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Hospitals</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Presence</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Rating</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tpas.map((tpa) => (
                                    <tr key={tpa.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                        <td style={tdStyle}>
                                            <div className="row ai-center gap-3">
                                                {tpa.logo ? (
                                                    <img src={tpa.logo} alt={tpa.name} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'contain', border: '1px solid var(--rule)', background: 'var(--paper)' }} />
                                                ) : (
                                                    <span className="spec-icon" aria-hidden="true">{tpa.name.charAt(0)}</span>
                                                )}
                                                <div className="col" style={{ gap: 2 }}>
                                                    <Link href={`/admin/tpas/${tpa.id}`} style={{ fontWeight: 500, color: 'var(--ink)' }}>
                                                        {tpa.name}
                                                    </Link>
                                                    {tpa.shortName && (
                                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{tpa.shortName}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span className="pill">{tpaTypeLabels[tpa.tpaType] || tpa.tpaType}</span>
                                        </td>
                                        <td style={tdStyle}>{tpa.headquartersCity || '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{tpa._count.insuranceLinks}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{tpa.networkHospitalsCount || tpa._count.hospitalLinks || '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{tpa._count.geographyPresence} cities</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            {tpa.rating ? (
                                                <div className="row ai-center center gap-1">
                                                    <span style={{ color: 'var(--lemon-2)' }}>★</span>
                                                    <span style={{ fontWeight: 500 }}>{Number(tpa.rating).toFixed(1)}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--ink-4)' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <span className={tpa.isActive ? 'pill pill-mint' : 'pill pill-orange'}>
                                                {tpa.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <Link
                                                href={`/admin/tpas/${tpa.id}`}
                                                className="btn btn-ghost btn-sm"
                                                style={{ color: 'var(--cobalt)' }}
                                            >
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card-flat row ai-start gap-3" style={{ padding: 16, background: 'var(--cobalt-50)', borderColor: 'rgba(28, 91, 255, .22)' }}>
                <span className="kicker" style={{ color: 'var(--cobalt)', flexShrink: 0 }}>i</span>
                <div className="col gap-1">
                    <span style={{ fontWeight: 500, color: 'var(--cobalt-2)' }}>What is a TPA?</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                        Third Party Administrators (TPAs) are intermediaries licensed by IRDAI to process health insurance claims.
                        They manage cashless hospitalization, claim settlements, and maintain networks of hospitals for insurance companies.
                    </span>
                </div>
            </div>
        </div>
    );
}
