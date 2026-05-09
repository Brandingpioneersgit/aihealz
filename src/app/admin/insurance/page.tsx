import prisma from '@/lib/db';
import Link from 'next/link';

export default async function InsuranceAdminPage() {
    const [providers, stats] = await Promise.all([
        prisma.insuranceProvider.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                _count: {
                    select: {
                        plans: true,
                        hospitalTies: true,
                        tpaAssociations: true,
                        claims: true,
                    },
                },
            },
        }),
        Promise.all([
            prisma.insuranceProvider.count(),
            prisma.insuranceProvider.count({ where: { isActive: true } }),
            prisma.insuranceProvider.aggregate({ _avg: { claimSettlementRatio: true, rating: true } }),
            prisma.insurancePlan.count({ where: { isActive: true } }),
            prisma.insuranceClaim.count({ where: { status: 'submitted' } }),
        ]),
    ]);

    const [totalCount, activeCount, avgStats, totalPlans, pendingClaims] = stats;

    const providerTypeLabels: Record<string, string> = {
        private: 'Private',
        public: 'Public Sector',
        general: 'General',
        health: 'Health Only',
        standalone_health: 'Standalone Health',
    };

    const statCards: Array<{ label: string; value: string; code: string }> = [
        { label: 'Total Providers', value: totalCount.toLocaleString(), code: 'TT' },
        { label: 'Active', value: activeCount.toLocaleString(), code: 'AC' },
        { label: 'Avg CSR', value: `${Number(avgStats._avg.claimSettlementRatio || 0).toFixed(0)}%`, code: 'CSR' },
        { label: 'Total Plans', value: totalPlans.toLocaleString(), code: 'PL' },
        { label: 'Pending Claims', value: pendingClaims.toLocaleString(), code: 'PC' },
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
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / insurance</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Insurance Providers<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage insurance companies, plans, and hospital networks.
                    </p>
                </div>
                <Link href="/admin/insurance/new" className="btn btn-cobalt">
                    + Add Provider
                </Link>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
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

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <Link href="/admin/insurance/plans" className="card row ai-center gap-3" style={{ padding: 20 }}>
                    <span className="spec-icon" aria-hidden="true">PL</span>
                    <div className="col" style={{ gap: 2 }}>
                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Manage Plans</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {totalPlans} active plans
                        </span>
                    </div>
                </Link>
                <Link href="/admin/tpas" className="card row ai-center gap-3" style={{ padding: 20 }}>
                    <span className="spec-icon" aria-hidden="true">TP</span>
                    <div className="col" style={{ gap: 2 }}>
                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>TPAs</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Third Party Administrators
                        </span>
                    </div>
                </Link>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                {providers.length === 0 ? (
                    <div className="col ai-center gap-4" style={{ padding: 48, textAlign: 'center' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            No insurance providers added yet
                        </span>
                        <Link href="/admin/insurance/new" className="btn btn-cobalt">
                            Add First Provider
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                                <tr>
                                    <th scope="col" style={thStyle}>Provider</th>
                                    <th scope="col" style={thStyle}>Type</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>CSR</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Rating</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Plans</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Hospitals</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>TPAs</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {providers.map((provider) => {
                                    const csr = provider.claimSettlementRatio ? Number(provider.claimSettlementRatio) : null;
                                    const csrColor =
                                        csr === null ? 'var(--ink-4)'
                                        : csr >= 95 ? 'var(--mint-3)'
                                        : csr >= 90 ? 'var(--mint-3)'
                                        : csr >= 80 ? 'var(--lemon-2)'
                                        : 'var(--orange-2)';
                                    return (
                                        <tr key={provider.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                            <td style={tdStyle}>
                                                <div className="row ai-center gap-3">
                                                    {provider.logo ? (
                                                        <img src={provider.logo} alt={provider.name} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'contain', border: '1px solid var(--rule)', background: 'var(--paper)' }} />
                                                    ) : (
                                                        <span className="spec-icon" aria-hidden="true">{provider.name.charAt(0)}</span>
                                                    )}
                                                    <div className="col" style={{ gap: 2 }}>
                                                        <Link href={`/admin/insurance/${provider.id}`} style={{ fontWeight: 500, color: 'var(--ink)' }}>
                                                            {provider.name}
                                                        </Link>
                                                        {provider.shortName && (
                                                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{provider.shortName}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span className="pill">{providerTypeLabels[provider.providerType] || provider.providerType}</span>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                {csr !== null ? (
                                                    <span style={{ fontWeight: 600, color: csrColor }}>{csr.toFixed(1)}%</span>
                                                ) : (
                                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>N/A</span>
                                                )}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                {provider.rating ? (
                                                    <div className="row ai-center center gap-1">
                                                        <span style={{ color: 'var(--lemon-2)' }}>★</span>
                                                        <span style={{ fontWeight: 500 }}>{Number(provider.rating).toFixed(1)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>{provider._count.plans}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>{provider._count.hospitalTies}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>{provider._count.tpaAssociations}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <span className={provider.isActive ? 'pill pill-mint' : 'pill pill-orange'}>
                                                    {provider.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                <div className="row ai-center gap-1" style={{ justifyContent: 'flex-end' }}>
                                                    <Link
                                                        href={`/insurance/${provider.slug}`}
                                                        target="_blank"
                                                        className="btn btn-ghost btn-sm"
                                                    >
                                                        View ↗
                                                    </Link>
                                                    <Link
                                                        href={`/admin/insurance/${provider.id}`}
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ color: 'var(--cobalt)' }}
                                                    >
                                                        Manage
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card-flat row ai-start gap-3" style={{ padding: 16, background: 'var(--cobalt-50)', borderColor: 'rgba(28, 91, 255, .22)' }}>
                <span className="kicker" style={{ color: 'var(--cobalt)', flexShrink: 0 }}>i</span>
                <div className="col gap-1">
                    <span style={{ fontWeight: 500, color: 'var(--cobalt-2)' }}>CSR = Claim Settlement Ratio</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                        Higher CSR indicates better claim approval rates. IRDAI requires insurers to disclose this metric annually.
                        Providers with CSR above 95% are marked as excellent.
                    </span>
                </div>
            </div>
        </div>
    );
}
