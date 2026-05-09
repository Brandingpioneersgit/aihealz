import prisma from '@/lib/db';
import Link from 'next/link';

export default async function InsurancePlansPage() {
    const plans = await prisma.insurancePlan.findMany({
        orderBy: [{ provider: { name: 'asc' } }, { premiumStartsAt: 'asc' }],
        include: {
            provider: {
                select: { id: true, name: true, logo: true },
            },
        },
    });

    const planTypeLabels: Record<string, string> = {
        individual: 'Individual',
        family_floater: 'Family Floater',
        senior_citizen: 'Senior Citizen',
        critical_illness: 'Critical Illness',
        top_up: 'Top-Up',
        super_top_up: 'Super Top-Up',
        group: 'Group',
    };

    type PlanGroup = { provider: typeof plans[0]['provider']; plans: typeof plans };
    const groupedPlans = plans.reduce((acc, plan) => {
        const key = plan.provider.name;
        if (!acc[key]) acc[key] = { provider: plan.provider, plans: [] };
        acc[key].plans.push(plan);
        return acc;
    }, {} as Record<string, PlanGroup>);

    const stats = {
        total: plans.length,
        active: plans.filter(p => p.isActive).length,
        avgPremium: plans.length > 0
            ? Math.round(plans.reduce((sum, p) => sum + Number(p.premiumStartsAt || 0), 0) / Math.max(1, plans.filter(p => p.premiumStartsAt).length))
            : 0,
    };

    const statCards: Array<{ label: string; value: string; code: string }> = [
        { label: 'Total Plans', value: stats.total.toLocaleString(), code: 'TT' },
        { label: 'Active Plans', value: stats.active.toLocaleString(), code: 'AC' },
        { label: 'Avg Base Premium', value: `₹${stats.avgPremium.toLocaleString()}`, code: 'AP' },
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
                href="/admin/insurance"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to insurance
            </Link>

            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / insurance / plans</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Insurance Plans<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage all insurance plans across providers.
                    </p>
                </div>
                <Link href="/admin/insurance/plans/new" className="btn btn-cobalt">
                    + Add Plan
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

            {Object.keys(groupedPlans).length === 0 ? (
                <div className="card col ai-center gap-4" style={{ padding: 48, textAlign: 'center' }}>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        No insurance plans added yet
                    </span>
                    <Link href="/admin/insurance/plans/new" className="btn btn-cobalt">
                        Add First Plan
                    </Link>
                </div>
            ) : (
                <div className="col gap-4">
                    {Object.entries(groupedPlans).map(([name, group]) => (
                        <div key={name} className="card" style={{ overflow: 'hidden' }}>
                            <div className="hairline-b row between ai-center" style={{ padding: 16, background: 'var(--bg-2)' }}>
                                <div className="row ai-center gap-3">
                                    {group.provider.logo ? (
                                        <img src={group.provider.logo} alt={name} style={{ width: 32, height: 32, borderRadius: 'var(--r-2)', objectFit: 'contain' }} />
                                    ) : (
                                        <span className="spec-icon" aria-hidden="true">{name.charAt(0)}</span>
                                    )}
                                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{name}</span>
                                </div>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {group.plans.length} plans
                                </span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr className="hairline-b">
                                            <th scope="col" style={thStyle}>Plan Name</th>
                                            <th scope="col" style={thStyle}>Type</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Sum Insured</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Base Premium</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.plans.map((plan) => (
                                            <tr key={plan.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                                <td style={tdStyle}>
                                                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{plan.name}</span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span className="pill">{planTypeLabels[plan.planType] || plan.planType}</span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    {plan.sumInsuredMax ? `₹${(Number(plan.sumInsuredMax) / 100000).toFixed(0)}L` : '—'}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>
                                                    {plan.premiumStartsAt ? `₹${Number(plan.premiumStartsAt).toLocaleString()}` : '—'}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <span className={plan.isActive ? 'pill pill-mint' : 'pill'}>
                                                        {plan.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <Link
                                                        href={`/admin/insurance/plans/${plan.id}`}
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
        </div>
    );
}
