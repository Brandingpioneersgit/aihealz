import prisma from '@/lib/db';
import Link from 'next/link';

const STATUS_PILL: Record<string, string> = {
    draft: 'pill',
    pending_review: 'pill pill-lemon',
    approved: 'pill pill-cobalt',
    active: 'pill pill-mint',
    paused: 'pill pill-orange',
    rejected: 'pill pill-orange',
    expired: 'pill',
    completed: 'pill pill-mint',
};

export default async function CampaignsPage() {
    const campaigns = await prisma.adCampaign.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            advertiser: {
                select: { id: true, companyName: true, slug: true },
            },
            _count: {
                select: { impressions: true, clicks: true, conversions: true },
            },
        },
    });

    const statCards: Array<{ label: string; value: number; code: string }> = [
        { label: 'Total', value: campaigns.length, code: 'TT' },
        { label: 'Active', value: campaigns.filter((c) => c.status === 'active').length, code: 'AC' },
        { label: 'Pending Review', value: campaigns.filter((c) => c.status === 'pending_review').length, code: 'PR' },
        { label: 'Paused', value: campaigns.filter((c) => c.status === 'paused').length, code: 'PA' },
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
                    <span className="section-mark">admin / advertising / campaigns</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Ad Campaigns<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage advertising campaigns.
                    </p>
                </div>
                <Link href="/admin/advertising/campaigns/new" className="btn btn-cobalt">
                    + New Campaign
                </Link>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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
                {campaigns.length === 0 ? (
                    <div className="col ai-center gap-4" style={{ padding: 48, textAlign: 'center' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            No campaigns yet
                        </span>
                        <Link href="/admin/advertising/campaigns/new" className="btn btn-cobalt">
                            Create First Campaign
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                                <tr>
                                    <th scope="col" style={thStyle}>Campaign</th>
                                    <th scope="col" style={thStyle}>Advertiser</th>
                                    <th scope="col" style={thStyle}>Status</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Budget</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Impressions</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Clicks</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>CTR</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign) => {
                                    const ctr = campaign._count.impressions > 0
                                        ? ((campaign._count.clicks / campaign._count.impressions) * 100).toFixed(2)
                                        : '0.00';
                                    return (
                                        <tr key={campaign.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                            <td style={tdStyle}>
                                                <Link href={`/admin/advertising/campaigns/${campaign.id}`} style={{ display: 'block' }}>
                                                    <div className="col" style={{ gap: 2 }}>
                                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{campaign.name}</span>
                                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                            {campaign.billingModel.toUpperCase()} · {campaign.objective}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td style={tdStyle}>
                                                <Link href={`/admin/advertising/advertisers/${campaign.advertiser.id}`} style={{ color: 'var(--ink-2)' }}>
                                                    {campaign.advertiser.companyName}
                                                </Link>
                                            </td>
                                            <td style={tdStyle}>
                                                <span className={STATUS_PILL[campaign.status] || 'pill'}>
                                                    {campaign.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                <div className="col ai-end" style={{ gap: 2 }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                                                        ${Number(campaign.totalBudget).toLocaleString()}
                                                    </span>
                                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                                        ${Number(campaign.spentAmount).toLocaleString()} spent
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{campaign._count.impressions.toLocaleString()}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{campaign._count.clicks.toLocaleString()}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: 'var(--cobalt)' }}>{ctr}%</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                <Link
                                                    href={`/admin/advertising/campaigns/${campaign.id}`}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--cobalt)' }}
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
