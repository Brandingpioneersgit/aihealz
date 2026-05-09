import prisma from '@/lib/db';
import Link from 'next/link';

export default async function AdvertisersPage() {
    const advertisers = await prisma.advertiser.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            geography: {
                select: { name: true, slug: true },
            },
            campaigns: { select: { id: true } },
            creatives: { select: { id: true } },
        },
    });

    const companyTypeLabels: Record<string, string> = {
        clinic: 'Clinic',
        hospital: 'Hospital',
        diagnostic: 'Diagnostic Lab',
        pharmacy: 'Pharmacy',
        pharma: 'Pharmaceutical',
        medtech: 'MedTech',
        insurance: 'Insurance',
        wellness: 'Wellness',
        other: 'Other',
    };

    const statCards: Array<{ label: string; value: number; code: string }> = [
        { label: 'Total Advertisers', value: advertisers.length, code: 'TT' },
        { label: 'Verified', value: advertisers.filter((a) => a.isVerified).length, code: 'VR' },
        { label: 'Active', value: advertisers.filter((a) => a.isActive).length, code: 'AC' },
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
                href="/admin/advertising"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to advertising
            </Link>

            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / advertising / advertisers</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Advertisers<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage advertiser accounts.
                    </p>
                </div>
                <Link href="/admin/advertising/advertisers/new" className="btn btn-cobalt">
                    + Add Advertiser
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
                            {s.value.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                {advertisers.length === 0 ? (
                    <div className="col ai-center gap-4" style={{ padding: 48, textAlign: 'center' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            No advertisers yet
                        </span>
                        <Link href="/admin/advertising/advertisers/new" className="btn btn-cobalt">
                            Add First Advertiser
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                                <tr>
                                    <th scope="col" style={thStyle}>Company</th>
                                    <th scope="col" style={thStyle}>Type</th>
                                    <th scope="col" style={thStyle}>Location</th>
                                    <th scope="col" style={thStyle}>Status</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Campaigns</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Creatives</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {advertisers.map((advertiser) => (
                                    <tr key={advertiser.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                        <td style={tdStyle}>
                                            <Link href={`/admin/advertising/advertisers/${advertiser.id}`} style={{ display: 'block' }}>
                                                <div className="row ai-center gap-3">
                                                    {advertiser.logo ? (
                                                        <img src={advertiser.logo} alt={advertiser.companyName} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'cover', border: '1px solid var(--rule)' }} />
                                                    ) : (
                                                        <span className="spec-icon" aria-hidden="true">{advertiser.companyName.charAt(0)}</span>
                                                    )}
                                                    <div className="col" style={{ gap: 2 }}>
                                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{advertiser.companyName}</span>
                                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{advertiser.email}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td style={tdStyle}>{companyTypeLabels[advertiser.companyType] || advertiser.companyType}</td>
                                        <td style={tdStyle}>{advertiser.geography?.name || '—'}</td>
                                        <td style={tdStyle}>
                                            <div className="row ai-center gap-1">
                                                {advertiser.isVerified ? (
                                                    <span className="pill pill-mint">Verified</span>
                                                ) : (
                                                    <span className="pill pill-lemon">Pending</span>
                                                )}
                                                {!advertiser.isActive && <span className="pill pill-orange">Inactive</span>}
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{advertiser.campaigns.length}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{advertiser.creatives.length}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <Link
                                                href={`/admin/advertising/advertisers/${advertiser.id}`}
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
        </div>
    );
}
