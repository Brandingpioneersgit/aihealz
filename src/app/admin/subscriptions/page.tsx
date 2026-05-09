import prisma from '@/lib/db';
import Link from 'next/link';

interface SubscriptionStats {
    totalDoctors: number;
    freeTier: number;
    premiumTier: number;
    enterpriseTier: number;
    monthlyRevenue: number;
}

interface DoctorSubscription {
    id: number;
    name: string;
    slug: string;
    subscriptionTier: 'free' | 'premium' | 'enterprise';
    isVerified: boolean;
    createdAt: Date;
    geography: { name: string } | null;
    providerSubscription: {
        id: string;
        planId: string;
        status: string;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        stripeCustomerId: string | null;
    } | null;
}

async function getSubscriptionData(): Promise<{
    stats: SubscriptionStats;
    subscriptions: DoctorSubscription[];
}> {
    const [
        totalDoctors,
        freeTier,
        premiumTier,
        enterpriseTier,
        doctors,
    ] = await Promise.all([
        prisma.doctorProvider.count(),
        prisma.doctorProvider.count({ where: { subscriptionTier: 'free' } }),
        prisma.doctorProvider.count({ where: { subscriptionTier: 'premium' } }),
        prisma.doctorProvider.count({ where: { subscriptionTier: 'enterprise' } }),
        prisma.doctorProvider.findMany({
            where: {
                subscriptionTier: { in: ['premium', 'enterprise'] },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
            select: {
                id: true,
                name: true,
                slug: true,
                subscriptionTier: true,
                isVerified: true,
                createdAt: true,
                geography: { select: { name: true } },
                providerSubscription: {
                    select: {
                        id: true,
                        planId: true,
                        status: true,
                        currentPeriodStart: true,
                        currentPeriodEnd: true,
                        stripeCustomerId: true,
                    },
                },
            },
        }),
    ]);

    const premiumPrice = 2999;
    const enterprisePrice = 9999;
    const monthlyRevenue = (premiumTier * premiumPrice) + (enterpriseTier * enterprisePrice);

    return {
        stats: {
            totalDoctors,
            freeTier,
            premiumTier,
            enterpriseTier,
            monthlyRevenue,
        },
        subscriptions: doctors as DoctorSubscription[],
    };
}

export default async function SubscriptionsPage() {
    const { stats, subscriptions } = await getSubscriptionData();

    const tierPill: Record<string, string> = {
        free: 'pill',
        premium: 'pill pill-cobalt',
        enterprise: 'pill pill-magenta',
    };

    const statusPill: Record<string, string> = {
        active: 'pill pill-mint',
        trialing: 'pill pill-cobalt',
        past_due: 'pill pill-lemon',
        canceled: 'pill pill-orange',
        unpaid: 'pill pill-orange',
    };

    const freePct = stats.totalDoctors > 0 ? (stats.freeTier / stats.totalDoctors) * 100 : 0;
    const premiumPct = stats.totalDoctors > 0 ? (stats.premiumTier / stats.totalDoctors) * 100 : 0;
    const enterprisePct = stats.totalDoctors > 0 ? (stats.enterpriseTier / stats.totalDoctors) * 100 : 0;

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / subscriptions</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Subscriptions<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        Manage doctor subscription plans and billing.
                    </p>
                </div>
                <Link href="/admin/doctors" className="btn btn-cobalt">
                    Manage doctors →
                </Link>
            </div>

            {/* Stats strip */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 0,
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--r-3)',
                    background: 'var(--paper)',
                    overflow: 'hidden',
                }}
            >
                {[
                    { label: 'Total doctors', value: stats.totalDoctors.toLocaleString(), sub: '' },
                    { label: 'Free tier', value: stats.freeTier.toLocaleString(), sub: `${stats.totalDoctors > 0 ? Math.round((stats.freeTier / stats.totalDoctors) * 100) : 0}% of total` },
                    { label: 'Premium', value: stats.premiumTier.toLocaleString(), sub: 'Rs. 2,999/mo each', subTone: 'cobalt' },
                    { label: 'Enterprise', value: stats.enterpriseTier.toLocaleString(), sub: 'Rs. 9,999/mo each', subTone: 'magenta' },
                    { label: 'Est. monthly revenue', value: `Rs. ${stats.monthlyRevenue.toLocaleString()}`, sub: `Rs. ${(stats.monthlyRevenue * 12).toLocaleString()}/year`, subTone: 'mint' },
                ].map((m) => (
                    <div
                        key={m.label}
                        className="col gap-2"
                        style={{
                            padding: 20,
                            borderRight: '1px solid var(--rule)',
                            borderBottom: '1px solid var(--rule)',
                        }}
                    >
                        <span className="kicker">{m.label}</span>
                        <span className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>{m.value}</span>
                        {m.sub && (
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: m.subTone === 'cobalt' ? 'var(--cobalt)'
                                        : m.subTone === 'magenta' ? 'var(--magenta)'
                                        : m.subTone === 'mint' ? 'var(--mint-3)'
                                        : 'var(--ink-3)',
                                }}
                            >
                                {m.sub}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Distribution */}
            <section className="card col gap-3" style={{ padding: 24 }}>
                <span className="section-mark">subscription distribution</span>
                <div className="row" style={{ height: 32, borderRadius: 'var(--r-2)', overflow: 'hidden', border: '1px solid var(--rule)' }}>
                    <div
                        className="row center ai-center mono"
                        style={{ background: 'var(--ink-5)', color: 'var(--ink)', fontSize: 11, fontWeight: 600, width: `${freePct}%` }}
                    >
                        {stats.freeTier > 0 && freePct > 8 && 'Free'}
                    </div>
                    <div
                        className="row center ai-center mono"
                        style={{ background: 'var(--cobalt)', color: '#fff', fontSize: 11, fontWeight: 600, width: `${premiumPct}%` }}
                    >
                        {stats.premiumTier > 0 && premiumPct > 8 && 'Premium'}
                    </div>
                    <div
                        className="row center ai-center mono"
                        style={{ background: 'var(--magenta)', color: '#fff', fontSize: 11, fontWeight: 600, width: `${enterprisePct}%` }}
                    >
                        {stats.enterpriseTier > 0 && enterprisePct > 8 && 'Enterprise'}
                    </div>
                </div>
                <div className="row between mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    <span>Free: {Math.round(freePct)}%</span>
                    <span>Premium: {Math.round(premiumPct)}%</span>
                    <span>Enterprise: {Math.round(enterprisePct)}%</span>
                </div>
            </section>

            {/* Subscribers table */}
            <section className="card" style={{ overflow: 'hidden' }}>
                <div className="row between ai-center hairline-b" style={{ padding: '16px 24px', flexWrap: 'wrap', gap: 12 }}>
                    <div className="col gap-1">
                        <span className="section-mark">paying subscribers</span>
                        <span className="muted" style={{ fontSize: 13 }}>Doctors on premium and enterprise plans</span>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {subscriptions.length} subscriber{subscriptions.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="col ai-center gap-3" style={{ padding: 48, textAlign: 'center' }}>
                        <span className="spec-icon" style={{ width: 48, height: 48, fontSize: 18 }}>SU</span>
                        <h3 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600 }}>No paying subscribers yet</h3>
                        <p className="muted" style={{ fontSize: 13, margin: 0 }}>Premium and enterprise subscribers will appear here.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-2)' }}>
                                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                    {['Doctor', 'Location', 'Tier', 'Status', 'Period'].map(h => (
                                        <th key={h} scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                                    ))}
                                    <th scope="col" className="mono" style={{ textAlign: 'right', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((doc) => (
                                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--rule-2)' }}>
                                        <td style={{ padding: 14 }}>
                                            <div className="row ai-center gap-3">
                                                <span className="spec-icon" aria-hidden="true">{doc.name.charAt(0).toUpperCase()}</span>
                                                <div className="col gap-1">
                                                    <Link href={`/admin/doctors/${doc.id}`} style={{ fontWeight: 500, color: 'var(--ink)' }}>
                                                        {doc.name}
                                                    </Link>
                                                    <div className="row ai-center gap-2">
                                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>/{doc.slug}</span>
                                                        {doc.isVerified && <span className="pill pill-mint" aria-label="Verified">✓</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 14, color: 'var(--ink-2)' }}>{doc.geography?.name || '—'}</td>
                                        <td style={{ padding: 14 }}>
                                            <span className={tierPill[doc.subscriptionTier]}>{doc.subscriptionTier}</span>
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            {doc.providerSubscription ? (
                                                <span className={statusPill[doc.providerSubscription.status] || 'pill'}>
                                                    {doc.providerSubscription.status}
                                                </span>
                                            ) : (
                                                <span className="muted">—</span>
                                            )}
                                        </td>
                                        <td className="mono" style={{ padding: 14, fontSize: 12, color: 'var(--ink-3)' }}>
                                            {doc.providerSubscription?.currentPeriodEnd ? (
                                                <span>Renews {new Date(doc.providerSubscription.currentPeriodEnd).toLocaleDateString()}</span>
                                            ) : (
                                                <span style={{ color: 'var(--ink-4)' }}>Manual upgrade</span>
                                            )}
                                        </td>
                                        <td style={{ padding: 14, textAlign: 'right' }}>
                                            <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                                                <Link href={`/admin/doctors/${doc.id}`} className="btn btn-ghost btn-sm">View</Link>
                                                {doc.providerSubscription?.stripeCustomerId && (
                                                    <a
                                                        href={`https://dashboard.stripe.com/customers/${doc.providerSubscription.stripeCustomerId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-paper btn-sm"
                                                    >
                                                        Stripe
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Upgrade opportunities */}
            <section className="card col gap-4" style={{ padding: 24 }}>
                <span className="section-mark">upgrade opportunities</span>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                    <div className="card-quiet col gap-2" style={{ padding: 16 }}>
                        <span className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>{stats.freeTier.toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Free doctors</span>
                        <span className="muted" style={{ fontSize: 12 }}>
                            Potential monthly revenue: Rs. {(stats.freeTier * 2999).toLocaleString()}
                        </span>
                    </div>
                    <div className="card-quiet col gap-2" style={{ padding: 16 }}>
                        <span className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>{stats.premiumTier.toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Premium doctors</span>
                        <span className="muted" style={{ fontSize: 12 }}>
                            Upgrade potential: Rs. {(stats.premiumTier * 7000).toLocaleString()}/mo
                        </span>
                    </div>
                    <div className="card-quiet col gap-2" style={{ padding: 16 }}>
                        <span className="num bignum" style={{ fontSize: 28, color: 'var(--cobalt)' }}>
                            {stats.totalDoctors > 0 ? Math.round(((stats.premiumTier + stats.enterpriseTier) / stats.totalDoctors) * 100) : 0}%
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Conversion rate</span>
                        <span className="muted" style={{ fontSize: 12 }}>Free to paid conversion</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
