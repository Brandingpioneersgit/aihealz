import prisma from '@/lib/db';
import Link from 'next/link';

const STATUS_PILL: Record<string, string> = {
    new: 'pill pill-cobalt',
    contacted: 'pill pill-lemon',
    qualified: 'pill pill-magenta',
    converted: 'pill pill-mint',
    closed: 'pill',
    draft: 'pill',
    pending_review: 'pill pill-lemon',
    approved: 'pill pill-cobalt',
    active: 'pill pill-mint',
    paused: 'pill pill-orange',
    rejected: 'pill pill-orange',
    expired: 'pill',
    completed: 'pill pill-mint',
};

export default async function AdvertisingDashboard() {
    const [
        totalAdvertisers,
        activeAdvertisers,
        activeCampaigns,
        pendingCampaigns,
        totalEnquiries,
        newEnquiries,
        totalImpressions,
        totalClicks,
        recentEnquiries,
        recentCampaigns,
    ] = await Promise.all([
        prisma.advertiser.count(),
        prisma.advertiser.count({ where: { isActive: true, isVerified: true } }),
        prisma.adCampaign.count({ where: { status: 'active' } }),
        prisma.adCampaign.count({ where: { status: 'pending_review' } }),
        prisma.adEnquiry.count(),
        prisma.adEnquiry.count({ where: { status: 'new' } }),
        prisma.adImpression.count(),
        prisma.adClick.count(),
        prisma.adEnquiry.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                companyName: true,
                companyType: true,
                email: true,
                adBudget: true,
                status: true,
                createdAt: true,
            },
        }),
        prisma.adCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                advertiser: {
                    select: { companyName: true, slug: true },
                },
            },
        }),
    ]);

    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

    const stats: Array<{ label: string; value: string; subtext: string; code: string }> = [
        { label: 'Total Advertisers', value: totalAdvertisers.toLocaleString(), subtext: `${activeAdvertisers} verified`, code: 'AD' },
        { label: 'Active Campaigns', value: activeCampaigns.toLocaleString(), subtext: `${pendingCampaigns} pending review`, code: 'CA' },
        { label: 'Total Impressions', value: totalImpressions.toLocaleString(), subtext: `${ctr}% CTR`, code: 'IM' },
        { label: 'Ad Enquiries', value: totalEnquiries.toLocaleString(), subtext: `${newEnquiries} new`, code: 'EN' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / advertising</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Advertising Dashboard<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage ad campaigns, advertisers, and enquiries.
                    </p>
                </div>
                <div className="row gap-2">
                    <Link href="/admin/advertising/enquiries" className="btn btn-paper">
                        View Enquiries
                        {newEnquiries > 0 && (
                            <span
                                className="mono"
                                style={{
                                    marginLeft: 8,
                                    padding: '2px 6px',
                                    background: 'var(--orange)',
                                    color: '#fff',
                                    borderRadius: 999,
                                    fontSize: 10,
                                    fontWeight: 600,
                                }}
                            >
                                {newEnquiries}
                            </span>
                        )}
                    </Link>
                    <Link href="/admin/advertising/campaigns/new" className="btn btn-cobalt">
                        + New Campaign
                    </Link>
                </div>
            </div>

            {/* Stats grid */}
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
                {stats.map((s) => (
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
                        <div className="num bignum" style={{ fontSize: 32, color: 'var(--ink)' }}>
                            {s.value}
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {s.subtext}
                        </span>
                    </div>
                ))}
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                <div className="card col" style={{ overflow: 'hidden' }}>
                    <div className="hairline-b row between ai-center" style={{ padding: 16 }}>
                        <span className="section-mark">recent / enquiries</span>
                        <Link
                            href="/admin/advertising/enquiries"
                            className="mono"
                            style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                        >
                            View all →
                        </Link>
                    </div>
                    {recentEnquiries.length === 0 ? (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No enquiries yet
                        </div>
                    ) : (
                        <div className="col">
                            {recentEnquiries.map((enquiry) => (
                                <Link
                                    key={enquiry.id}
                                    href={`/admin/advertising/enquiries?id=${enquiry.id}`}
                                    className="col gap-1"
                                    style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}
                                >
                                    <div className="row between ai-center">
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{enquiry.companyName}</span>
                                        <span className={STATUS_PILL[enquiry.status] || 'pill'}>{enquiry.status}</span>
                                    </div>
                                    <div className="row ai-center gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        <span>{enquiry.companyType}</span>
                                        <span>·</span>
                                        <span>{enquiry.adBudget || 'Budget TBD'}</span>
                                    </div>
                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                        {new Date(enquiry.createdAt).toLocaleDateString()}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card col" style={{ overflow: 'hidden' }}>
                    <div className="hairline-b row between ai-center" style={{ padding: 16 }}>
                        <span className="section-mark">recent / campaigns</span>
                        <Link
                            href="/admin/advertising/campaigns"
                            className="mono"
                            style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                        >
                            View all →
                        </Link>
                    </div>
                    {recentCampaigns.length === 0 ? (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No campaigns yet
                        </div>
                    ) : (
                        <div className="col">
                            {recentCampaigns.map((campaign) => (
                                <Link
                                    key={campaign.id}
                                    href={`/admin/advertising/campaigns/${campaign.id}`}
                                    className="col gap-1"
                                    style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}
                                >
                                    <div className="row between ai-center">
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{campaign.name}</span>
                                        <span className={STATUS_PILL[campaign.status] || 'pill'}>
                                            {campaign.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{campaign.advertiser.companyName}</span>
                                    <div className="row ai-center gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        <span>Budget: ${Number(campaign.totalBudget).toLocaleString()}</span>
                                        <span>·</span>
                                        <span>{campaign.billingModel}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div className="card col gap-4" style={{ padding: 24 }}>
                <span className="section-mark">quick actions</span>
                <div
                    className="grid grid-cols-2 md:grid-cols-4"
                    style={{ gap: 0, border: '1px solid var(--rule)', borderRadius: 'var(--r-3)', overflow: 'hidden', background: 'var(--paper)' }}
                >
                    {[
                        { href: '/admin/advertising/advertisers', label: 'Add Advertiser', desc: 'Create new account', code: '+AD' },
                        { href: '/admin/advertising/creatives', label: 'Upload Creative', desc: 'Add new ad images', code: '+CR' },
                        { href: '/admin/advertising/pricing', label: 'Manage Pricing', desc: 'Set CPM/CPC rates', code: 'PR' },
                        { href: '/admin/advertising/reports', label: 'View Reports', desc: 'Performance analytics', code: 'RP' },
                    ].map((a) => (
                        <Link
                            key={a.href}
                            href={a.href}
                            className="row ai-center gap-3"
                            style={{
                                padding: 16,
                                borderRight: '1px solid var(--rule)',
                                borderBottom: '1px solid var(--rule)',
                                color: 'var(--ink)',
                                background: 'var(--paper)',
                            }}
                        >
                            <span className="spec-icon" aria-hidden="true">{a.code}</span>
                            <div className="col" style={{ gap: 2 }}>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{a.label}</span>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {a.desc}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
