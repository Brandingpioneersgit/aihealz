import prisma from '@/lib/db';
import Link from 'next/link';

export default async function PricingAdminPage() {
    const pricing = await prisma.adPlacementPricing.findMany({
        orderBy: [{ placement: 'asc' }, { countryCode: 'asc' }],
    });

    const placementLabels: Record<string, string> = {
        condition_sidebar: 'Condition Page Sidebar',
        condition_inline: 'Condition Inline',
        homepage_hero: 'Homepage Hero',
        homepage_featured: 'Homepage Featured',
        search_results_top: 'Search Results Top',
        search_results_inline: 'Search Results Inline',
        doctor_profile_sidebar: 'Doctor Profile Sidebar',
        treatment_page_sidebar: 'Treatment Page Sidebar',
        global_header_banner: 'Global Header Banner',
        global_footer_banner: 'Global Footer Banner',
    };

    const groupedPricing = pricing.reduce((acc, p) => {
        if (!acc[p.placement]) acc[p.placement] = [];
        acc[p.placement].push(p);
        return acc;
    }, {} as Record<string, typeof pricing>);

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

            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / advertising / pricing</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Ad Placement Pricing<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Configure CPM, CPC, and flat rate pricing.
                    </p>
                </div>
                <Link href="/admin/advertising/pricing/new" className="btn btn-cobalt">
                    + Add Pricing Rule
                </Link>
            </div>

            <div className="card-flat row ai-start gap-3" style={{ padding: 16, background: 'var(--cobalt-50)', borderColor: 'rgba(28, 91, 255, .22)' }}>
                <span className="kicker" style={{ color: 'var(--cobalt)', flexShrink: 0 }}>i</span>
                <div className="col gap-1">
                    <span style={{ fontWeight: 500, color: 'var(--cobalt-2)' }}>Pricing logic</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                        Country-specific pricing overrides global pricing. If no country-specific rule exists,
                        the global rate (countryCode = null) is used.
                    </span>
                </div>
            </div>

            {Object.keys(groupedPricing).length === 0 ? (
                <div className="card col ai-center gap-4" style={{ padding: 48, textAlign: 'center' }}>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        No pricing rules configured
                    </span>
                    <Link href="/admin/advertising/pricing/new" className="btn btn-cobalt">
                        Add First Pricing Rule
                    </Link>
                </div>
            ) : (
                <div className="col gap-4">
                    {Object.entries(groupedPricing).map(([placement, rules]) => (
                        <div key={placement} className="card" style={{ overflow: 'hidden' }}>
                            <div className="hairline-b row between ai-center" style={{ padding: 16, background: 'var(--bg-2)' }}>
                                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{placementLabels[placement] || placement}</span>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {rules.length} rule{rules.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr className="hairline-b">
                                            <th scope="col" style={thStyle}>Region</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Min CPM</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Suggested CPM</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Min CPC</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Suggested CPC</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Flat Rate/mo</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rules.map((rule) => (
                                            <tr key={rule.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                                <td style={tdStyle}>
                                                    <span className={rule.countryCode ? 'pill pill-cobalt' : 'pill pill-magenta'}>
                                                        {rule.countryCode || 'Global'}
                                                    </span>
                                                </td>
                                                <td className="mono" style={{ ...tdStyle, textAlign: 'right' }}>
                                                    ${Number(rule.minCpm).toFixed(2)}
                                                </td>
                                                <td className="mono" style={{ ...tdStyle, textAlign: 'right', color: 'var(--cobalt)', fontWeight: 600 }}>
                                                    ${Number(rule.suggestedCpm).toFixed(2)}
                                                </td>
                                                <td className="mono" style={{ ...tdStyle, textAlign: 'right' }}>
                                                    ${Number(rule.minCpc).toFixed(2)}
                                                </td>
                                                <td className="mono" style={{ ...tdStyle, textAlign: 'right', color: 'var(--cobalt)', fontWeight: 600 }}>
                                                    ${Number(rule.suggestedCpc).toFixed(2)}
                                                </td>
                                                <td className="mono" style={{ ...tdStyle, textAlign: 'right' }}>
                                                    {rule.flatRateMonthly ? `$${Number(rule.flatRateMonthly).toFixed(0)}` : '—'}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: 999,
                                                            background: rule.isActive ? 'var(--mint)' : 'var(--ink-5)',
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <Link
                                                        href={`/admin/advertising/pricing/${rule.id}`}
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ color: 'var(--cobalt)' }}
                                                    >
                                                        Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="card col gap-4" style={{ padding: 24 }}>
                <span className="section-mark">quick reference / default pricing</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 12 }}>
                    {[
                        { label: 'Base CPM', value: '$0.50 - $2.00' },
                        { label: 'Base CPC', value: '$0.20 - $1.00' },
                        { label: 'Premium Multiplier (US/UK)', value: '1.3x - 1.5x' },
                        { label: 'Emerging Markets', value: '0.7x - 0.9x' },
                    ].map((it) => (
                        <div key={it.label} className="card-flat col gap-1" style={{ padding: 12, background: 'var(--bg-2)' }}>
                            <span className="kicker">{it.label}</span>
                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{it.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
