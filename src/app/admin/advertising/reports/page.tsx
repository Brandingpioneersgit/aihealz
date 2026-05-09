import prisma from '@/lib/db';
import Link from 'next/link';

export default async function ReportsPage() {
    const [
        totalImpressions,
        totalClicks,
        totalConversions,
        impressionsByPlacement,
        clicksByPlacement,
        topCampaigns,
        recentMetrics,
    ] = await Promise.all([
        prisma.adImpression.count(),
        prisma.adClick.count(),
        prisma.adConversion.count(),
        prisma.adImpression.groupBy({
            by: ['placement'],
            _count: true,
        }),
        prisma.adClick.groupBy({
            by: ['placement'],
            _count: true,
        }),
        prisma.adCampaign.findMany({
            where: { status: 'active' },
            orderBy: { spentAmount: 'desc' },
            take: 5,
            include: {
                advertiser: { select: { companyName: true } },
                _count: { select: { impressions: true, clicks: true, conversions: true } },
            },
        }),
        prisma.adDailyMetrics.findMany({
            orderBy: { date: 'desc' },
            take: 30,
            include: {
                campaign: { select: { name: true } },
            },
        }),
    ]);

    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

    const placementLabels: Record<string, string> = {
        condition_sidebar: 'Condition Sidebar',
        condition_inline: 'Condition Inline',
        homepage_hero: 'Homepage Hero',
        homepage_featured: 'Homepage Featured',
        search_results_top: 'Search Top',
        search_results_inline: 'Search Inline',
        doctor_profile_sidebar: 'Doctor Profile',
        treatment_page_sidebar: 'Treatment Page',
        global_header_banner: 'Header Banner',
        global_footer_banner: 'Footer Banner',
    };

    const placementStats = impressionsByPlacement.map((imp) => {
        const clicks = clicksByPlacement.find((c) => c.placement === imp.placement)?._count || 0;
        const placementCtr = imp._count > 0 ? ((clicks / imp._count) * 100).toFixed(2) : '0.00';
        return {
            placement: imp.placement,
            label: placementLabels[imp.placement] || imp.placement,
            impressions: imp._count,
            clicks,
            ctr: placementCtr,
        };
    }).sort((a, b) => b.impressions - a.impressions);

    const stats: Array<{ label: string; value: string; subtext?: string; code: string }> = [
        { label: 'Total Impressions', value: totalImpressions.toLocaleString(), code: 'IM' },
        { label: 'Total Clicks', value: totalClicks.toLocaleString(), code: 'CL' },
        { label: 'CTR', value: `${ctr}%`, code: 'CTR' },
        { label: 'Conversions', value: totalConversions.toLocaleString(), subtext: `${conversionRate}% rate`, code: 'CV' },
    ];

    const thStyle: React.CSSProperties = {
        padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--mono)',
        fontSize: 10, fontWeight: 600, color: 'var(--ink-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
    };
    const tdStyle: React.CSSProperties = {
        padding: '12px 16px', fontSize: 13, color: 'var(--ink-2)', verticalAlign: 'middle',
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

            <div className="col gap-2">
                <span className="section-mark">admin / advertising / reports</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    Advertising Reports<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                    Performance analytics and metrics.
                </p>
            </div>

            {/* Overview */}
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
                        {s.subtext && (
                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {s.subtext}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                {/* Performance by Placement */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="hairline-b" style={{ padding: 16 }}>
                        <span className="section-mark">performance by placement</span>
                    </div>
                    {placementStats.length === 0 ? (
                        <div className="mono" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No data yet
                        </div>
                    ) : (
                        <div className="col">
                            {placementStats.map((stat) => (
                                <div key={stat.placement} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    <div className="col" style={{ gap: 2 }}>
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{stat.label}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            {stat.impressions.toLocaleString()} impressions
                                        </span>
                                    </div>
                                    <div className="col ai-end" style={{ gap: 2 }}>
                                        <span style={{ fontWeight: 600, color: 'var(--cobalt)' }}>{stat.ctr}% CTR</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{stat.clicks} clicks</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Campaigns */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="hairline-b" style={{ padding: 16 }}>
                        <span className="section-mark">top active campaigns</span>
                    </div>
                    {topCampaigns.length === 0 ? (
                        <div className="mono" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No active campaigns
                        </div>
                    ) : (
                        <div className="col">
                            {topCampaigns.map((campaign, index) => {
                                const campaignCtr = campaign._count.impressions > 0
                                    ? ((campaign._count.clicks / campaign._count.impressions) * 100).toFixed(2)
                                    : '0.00';
                                return (
                                    <div key={campaign.id} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                        <div className="row ai-center gap-3">
                                            <span className="spec-icon" aria-hidden="true">{index + 1}</span>
                                            <div className="col" style={{ gap: 2 }}>
                                                <Link href={`/admin/advertising/campaigns/${campaign.id}`} style={{ fontWeight: 500, color: 'var(--ink)' }}>
                                                    {campaign.name}
                                                </Link>
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                    {campaign.advertiser.companyName}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col ai-end" style={{ gap: 2 }}>
                                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>${Number(campaign.spentAmount).toFixed(2)}</span>
                                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{campaignCtr}% CTR</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Metrics */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="hairline-b row between ai-center" style={{ padding: 16 }}>
                    <span className="section-mark">recent daily metrics</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Last 30 days
                    </span>
                </div>
                {recentMetrics.length === 0 ? (
                    <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        No daily metrics recorded yet
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                                <tr>
                                    <th scope="col" style={thStyle}>Date</th>
                                    <th scope="col" style={thStyle}>Campaign</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Impressions</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Clicks</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>CTR</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Spend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentMetrics.map((metric) => (
                                    <tr key={metric.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                        <td style={tdStyle}>{new Date(metric.date).toLocaleDateString()}</td>
                                        <td style={tdStyle}>{metric.campaign.name}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{metric.impressions.toLocaleString()}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{metric.clicks}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--cobalt)', fontWeight: 600 }}>
                                            {metric.ctr ? `${Number(metric.ctr).toFixed(2)}%` : '—'}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>
                                            ${Number(metric.spend).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Export */}
            <div className="card row between ai-center" style={{ padding: 24, flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-1">
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Export Reports</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Download detailed reports in CSV format
                    </span>
                </div>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    <button className="btn btn-paper">Export Impressions</button>
                    <button className="btn btn-paper">Export Clicks</button>
                    <button className="btn btn-cobalt">Full Report</button>
                </div>
            </div>
        </div>
    );
}
