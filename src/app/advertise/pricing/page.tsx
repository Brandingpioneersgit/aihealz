import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Advertising pricing | aihealz',
    description: 'Flexible advertising pricing for healthcare businesses. CPM, CPC, and flat-rate options available.',
    openGraph: {
        title: 'Advertising pricing | aihealz',
        description: "Flexible advertising pricing for healthcare businesses on the world's biggest multilingual healthcare platform.",
        url: 'https://aihealz.com/advertise/pricing',
    },
};

const PRICING_TIERS = [
    {
        name: 'Starter',
        price: '$0.50',
        unit: 'CPM',
        minSpend: '$100',
        description: 'Perfect for small clinics testing digital advertising',
        features: [
            { text: 'Self-serve dashboard', included: true },
            { text: 'Basic geo-targeting (country level)', included: true },
            { text: 'Condition page sidebar placements', included: true },
            { text: 'Real-time analytics', included: true },
            { text: 'Email support (48hr response)', included: true },
            { text: 'Advanced city-level targeting', included: false },
            { text: 'A/B testing', included: false },
            { text: 'Dedicated account manager', included: false },
            { text: 'Custom reporting', included: false },
        ],
        cta: 'Start free trial',
        popular: false,
    },
    {
        name: 'Professional',
        price: '$0.25',
        unit: 'CPC',
        minSpend: '$500',
        description: 'Best for growing healthcare businesses',
        features: [
            { text: 'Everything in Starter', included: true },
            { text: 'Advanced city-level targeting', included: true },
            { text: 'All placement types', included: true },
            { text: 'A/B testing (up to 3 variants)', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Priority support (24hr response)', included: true },
            { text: 'Custom reporting', included: true },
            { text: 'Conversion tracking', included: true },
            { text: 'API access', included: false },
        ],
        cta: 'Get started',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        unit: 'flat rate',
        minSpend: 'Custom',
        description: 'For hospitals and healthcare networks',
        features: [
            { text: 'Everything in Professional', included: true },
            { text: 'Premium homepage placements', included: true },
            { text: 'Exclusive sponsorships', included: true },
            { text: 'Unlimited A/B testing', included: true },
            { text: 'API access', included: true },
            { text: 'White-glove onboarding', included: true },
            { text: 'SLA guarantee (99.9% uptime)', included: true },
            { text: 'Multi-location support', included: true },
            { text: 'Custom integrations', included: true },
        ],
        cta: 'Contact sales',
        popular: false,
    },
];

const PLACEMENT_PRICING = [
    { placement: 'Condition page sidebar', size: '300×250', cpm: '$0.50', cpc: '$0.25', flatRate: '$200/mo' },
    { placement: 'Condition page inline', size: 'Native', cpm: '$0.75', cpc: '$0.35', flatRate: '$300/mo' },
    { placement: 'Homepage hero', size: '970×250', cpm: '$1.50', cpc: '$0.75', flatRate: '$1,000/mo' },
    { placement: 'Homepage featured', size: 'Card', cpm: '$1.00', cpc: '$0.50', flatRate: '$750/mo' },
    { placement: 'Search results top', size: '728×90', cpm: '$0.80', cpc: '$0.40', flatRate: '$400/mo' },
    { placement: 'Doctor profile sidebar', size: '300×250', cpm: '$0.60', cpc: '$0.30', flatRate: '$250/mo' },
    { placement: 'Global header banner', size: '970×90', cpm: '$2.00', cpc: '$1.00', flatRate: '$2,000/mo' },
    { placement: 'Global footer banner', size: '970×90', cpm: '$0.40', cpc: '$0.20', flatRate: '$150/mo' },
];

const REGIONAL_MULTIPLIERS = [
    { region: 'United States', multiplier: '1.5x' },
    { region: 'United Kingdom', multiplier: '1.3x' },
    { region: 'Australia', multiplier: '1.3x' },
    { region: 'Canada', multiplier: '1.2x' },
    { region: 'UAE', multiplier: '1.2x' },
    { region: 'Germany', multiplier: '1.1x' },
    { region: 'India', multiplier: '1.0x · base' },
    { region: 'Nigeria', multiplier: '0.8x' },
    { region: 'Kenya', multiplier: '0.8x' },
];

const FAQS = [
    {
        q: 'What is CPM vs CPC billing?',
        a: 'CPM (Cost Per Mille) charges you for every 1,000 impressions your ad receives, regardless of clicks. CPC (Cost Per Click) only charges when someone clicks. CPM is better for brand awareness, CPC is better for direct response.',
    },
    {
        q: 'Is there a minimum spend requirement?',
        a: 'Yes — Starter requires $100/month, Professional requires $500/month. Enterprise minimums are negotiated based on your campaign scope.',
    },
    {
        q: 'How do I pay for advertising?',
        a: 'We accept all major credit cards via Stripe. Enterprise accounts can also pay via wire transfer or invoice. You can prepay or set up automatic billing.',
    },
    {
        q: 'Can I change my billing model mid-campaign?',
        a: 'Yes, you can switch between CPM and CPC billing at any time. Changes take effect from the next billing cycle. Flat-rate campaigns cannot be changed once started.',
    },
    {
        q: 'Do you offer discounts for long-term commitments?',
        a: '10% off for 3-month commitments, 15% off for 6-month commitments, and 20% off for annual contracts. Contact our sales team to discuss.',
    },
];

function multiplierColor(m: string): string {
    if (m.includes('base')) return 'var(--cobalt)';
    if (m.startsWith('0')) return 'var(--mint-3)';
    return 'var(--orange-2)';
}

export default function AdvertisePricingPage() {
    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 28px 96px' }} className="col gap-8">
                {/* Breadcrumb */}
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        flexWrap: 'wrap',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/advertise" style={{ color: 'var(--ink-3)' }}>Advertise</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>Pricing</span>
                </nav>

                {/* Hero */}
                <header className="col gap-4">
                    <span className="section-mark">pricing / for advertisers</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 6.5vw, 80px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Simple, <span style={{ color: 'var(--cobalt)' }}>transparent pricing</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', maxWidth: 680, margin: 0 }}>
                        Choose the billing model that works for your business. CPM, CPC, or flat-rate. No hidden fees.
                    </p>
                </header>

                {/* Pricing Tiers */}
                <section aria-labelledby="tiers-heading">
                    <h2 id="tiers-heading" className="sr-only">Pricing tiers</h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {PRICING_TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className={tier.popular ? 'card-ink col gap-4' : 'card col gap-4'}
                                style={{ padding: 28, position: 'relative' }}
                            >
                                {tier.popular && (
                                    <span
                                        className="pill"
                                        style={{
                                            position: 'absolute',
                                            top: -10,
                                            right: 20,
                                            background: 'var(--cobalt)',
                                            color: '#fff',
                                            borderColor: 'var(--cobalt)',
                                        }}
                                    >
                                        most popular
                                    </span>
                                )}
                                <div className="col gap-1">
                                    <h3
                                        className="display"
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 600,
                                            margin: 0,
                                            letterSpacing: '-0.025em',
                                            color: tier.popular ? 'var(--paper)' : 'var(--ink)',
                                        }}
                                    >
                                        {tier.name}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: 13,
                                            color: tier.popular ? 'rgba(255,255,255,.65)' : 'var(--ink-3)',
                                            margin: 0,
                                        }}
                                    >
                                        {tier.description}
                                    </p>
                                </div>
                                <div className="col gap-1">
                                    <div className="row ai-baseline gap-2">
                                        <span
                                            className="display num"
                                            style={{
                                                fontSize: 40,
                                                fontWeight: 500,
                                                letterSpacing: '-0.03em',
                                                color: tier.popular ? 'var(--paper)' : 'var(--ink)',
                                            }}
                                        >
                                            {tier.price}
                                        </span>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: tier.popular ? 'rgba(255,255,255,.5)' : 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            / {tier.unit}
                                        </span>
                                    </div>
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: tier.popular ? 'rgba(255,255,255,.5)' : 'var(--ink-4)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                        }}
                                    >
                                        min spend · {tier.minSpend}/mo
                                    </span>
                                </div>
                                <ul className="clean col gap-2">
                                    {tier.features.map((f, i) => (
                                        <li key={i} className="row gap-2 ai-baseline">
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 11,
                                                    color: f.included
                                                        ? (tier.popular ? 'var(--cobalt-3)' : 'var(--cobalt)')
                                                        : (tier.popular ? 'rgba(255,255,255,.25)' : 'var(--ink-5)'),
                                                    minWidth: 14,
                                                }}
                                                aria-hidden="true"
                                            >
                                                {f.included ? '✓' : '×'}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    color: f.included
                                                        ? (tier.popular ? 'rgba(255,255,255,.85)' : 'var(--ink-2)')
                                                        : (tier.popular ? 'rgba(255,255,255,.4)' : 'var(--ink-4)'),
                                                    textDecoration: f.included ? 'none' : 'line-through',
                                                }}
                                            >
                                                {f.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/advertise/enquiry"
                                    className={tier.popular ? 'btn btn-cobalt' : 'btn btn-paper'}
                                    style={{ width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                                >
                                    {tier.cta} →
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Placement Pricing Table */}
                <section aria-labelledby="placement-heading" className="col gap-5">
                    <div className="col gap-2">
                        <span className="section-mark">placement rates</span>
                        <h2
                            id="placement-heading"
                            className="display"
                            style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}
                        >
                            Pricing by placement.
                        </h2>
                        <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 600 }}>
                            Base rates shown below. Final pricing may vary by targeting and region.
                        </p>
                    </div>

                    <div className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: 14,
                                }}
                            >
                                <thead>
                                    <tr className="hairline-b">
                                        <th
                                            scope="col"
                                            className="mono"
                                            style={{
                                                textAlign: 'left',
                                                padding: '14px 20px',
                                                fontSize: 11,
                                                fontWeight: 500,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Placement
                                        </th>
                                        <th
                                            scope="col"
                                            className="mono"
                                            style={{
                                                textAlign: 'left',
                                                padding: '14px 20px',
                                                fontSize: 11,
                                                fontWeight: 500,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Size
                                        </th>
                                        <th
                                            scope="col"
                                            className="mono"
                                            style={{
                                                textAlign: 'right',
                                                padding: '14px 20px',
                                                fontSize: 11,
                                                fontWeight: 500,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            CPM
                                        </th>
                                        <th
                                            scope="col"
                                            className="mono"
                                            style={{
                                                textAlign: 'right',
                                                padding: '14px 20px',
                                                fontSize: 11,
                                                fontWeight: 500,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            CPC
                                        </th>
                                        <th
                                            scope="col"
                                            className="mono"
                                            style={{
                                                textAlign: 'right',
                                                padding: '14px 20px',
                                                fontSize: 11,
                                                fontWeight: 500,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Flat rate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PLACEMENT_PRICING.map((p, i) => (
                                        <tr
                                            key={p.placement}
                                            style={{
                                                borderBottom:
                                                    i < PLACEMENT_PRICING.length - 1
                                                        ? '1px solid var(--rule-2)'
                                                        : 'none',
                                            }}
                                        >
                                            <td style={{ padding: '14px 20px', color: 'var(--ink)', fontWeight: 500 }}>
                                                {p.placement}
                                            </td>
                                            <td className="mono" style={{ padding: '14px 20px', color: 'var(--ink-3)', fontSize: 12 }}>
                                                {p.size}
                                            </td>
                                            <td className="num" style={{ padding: '14px 20px', textAlign: 'right', color: 'var(--cobalt)', fontWeight: 500 }}>
                                                {p.cpm}
                                            </td>
                                            <td className="num" style={{ padding: '14px 20px', textAlign: 'right', color: 'var(--mint-3)', fontWeight: 500 }}>
                                                {p.cpc}
                                            </td>
                                            <td className="num" style={{ padding: '14px 20px', textAlign: 'right', color: 'var(--ink)', fontWeight: 500 }}>
                                                {p.flatRate}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Regional Multipliers */}
                <section aria-labelledby="regional-heading" className="col gap-5">
                    <div className="col gap-2">
                        <span className="section-mark">regional pricing</span>
                        <h2
                            id="regional-heading"
                            className="display"
                            style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}
                        >
                            Geographic rate adjustments.
                        </h2>
                        <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 600 }}>
                            Prices vary by target region based on market demand and purchasing power.
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: 0,
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {REGIONAL_MULTIPLIERS.map((r, i) => {
                            const cols = 3;
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= REGIONAL_MULTIPLIERS.length - cols;
                            return (
                                <div
                                    key={r.region}
                                    className="row between ai-center"
                                    style={{
                                        padding: '18px 22px',
                                        borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                    }}
                                >
                                    <span style={{ fontSize: 14, color: 'var(--ink)' }}>{r.region}</span>
                                    <span
                                        className="num"
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: multiplierColor(r.multiplier),
                                        }}
                                    >
                                        {r.multiplier}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* FAQ */}
                <section aria-labelledby="faq-heading" className="col gap-5">
                    <div className="col gap-2">
                        <span className="section-mark">FAQ</span>
                        <h2
                            id="faq-heading"
                            className="display"
                            style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}
                        >
                            Pricing questions.
                        </h2>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {FAQS.map((faq) => (
                            <article key={faq.q} className="card col gap-2" style={{ padding: 24 }}>
                                <h3
                                    className="display"
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 600,
                                        margin: 0,
                                        letterSpacing: '-0.015em',
                                    }}
                                >
                                    {faq.q}
                                </h3>
                                <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
                                    {faq.a}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="card-ink" style={{ padding: 'clamp(28px, 4vw, 56px)' }}>
                    <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 24 }}>
                        <div className="col gap-3" style={{ flex: '1 1 480px', minWidth: 0 }}>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.10em',
                                    fontWeight: 500,
                                }}
                            >
                                ready to start
                            </span>
                            <h2
                                className="display"
                                style={{
                                    fontSize: 'clamp(28px, 3.6vw, 44px)',
                                    lineHeight: 1.1,
                                    margin: 0,
                                    fontWeight: 600,
                                    color: 'var(--paper)',
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                Pick a plan. <span style={{ color: 'var(--cobalt-3)' }}>We&rsquo;ll set you up</span>
                                <span style={{ color: 'var(--orange)' }}>.</span>
                            </h2>
                        </div>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            <Link href="/advertise/enquiry" className="btn btn-cobalt btn-lg">
                                Start advertising →
                            </Link>
                            <Link
                                href="/contact"
                                className="btn btn-lg"
                                style={{
                                    background: 'rgba(255,255,255,.08)',
                                    color: 'var(--paper)',
                                    borderColor: 'rgba(255,255,255,.15)',
                                }}
                            >
                                Contact sales
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
