'use client';

import Link from 'next/link';
import { useState } from 'react';

const PLANS = [
    {
        name: 'Free',
        slug: 'free',
        price: '$0',
        period: 'forever',
        desc: 'Get started and claim your profile. Perfect for individual practitioners.',
        highlight: false,
        badge: null,
        conditions: 2,
        leads: 5,
        features: [
            { label: 'Basic profile listing', included: true },
            { label: 'Up to 2 condition specialties', included: true },
            { label: '5 patient lead credits / month', included: true },
            { label: 'Standard search ranking', included: true },
            { label: 'AI-generated bio', included: false },
            { label: 'Lead scoring & quality filters', included: false },
            { label: 'Telelink (booking integration)', included: false },
            { label: 'Priority listing', included: false },
            { label: 'Analytics & insights dashboard', included: false },
            { label: 'Dedicated account manager', included: false },
        ],
    },
    {
        name: 'Premium',
        slug: 'premium',
        price: '$19',
        period: '/month',
        desc: 'For growing practices that want more visibility and patient flow.',
        highlight: true,
        badge: 'Most Popular',
        conditions: 15,
        leads: 50,
        features: [
            { label: 'Enhanced profile with AI bio', included: true },
            { label: 'Up to 15 condition specialties', included: true },
            { label: '50 patient lead credits / month', included: true },
            { label: 'Priority search ranking', included: true },
            { label: 'AI-generated bio', included: true },
            { label: 'Lead scoring & quality filters', included: true },
            { label: 'Telelink (booking integration)', included: true },
            { label: 'Priority listing on condition pages', included: true },
            { label: 'Analytics & insights dashboard', included: false },
            { label: 'Dedicated account manager', included: false },
        ],
    },
    {
        name: 'Enterprise',
        slug: 'enterprise',
        price: '$59',
        period: '/month',
        desc: 'For hospitals, clinics, and multi-specialty practices.',
        highlight: false,
        badge: 'Best Value',
        conditions: 1000,
        leads: 500,
        features: [
            { label: 'Premium profile with full customization', included: true },
            { label: 'Up to 1,000 condition specialties', included: true },
            { label: '500 patient lead credits / month', included: true },
            { label: 'Top-tier search ranking', included: true },
            { label: 'AI-generated bio', included: true },
            { label: 'Lead scoring & quality filters', included: true },
            { label: 'Telelink (booking integration)', included: true },
            { label: 'Priority listing on condition pages', included: true },
            { label: 'Analytics & insights dashboard', included: true },
            { label: 'Dedicated account manager', included: true },
        ],
    },
];

const PROMOTIONS = [
    {
        title: 'Early adopter',
        desc: 'First 500 doctors get 3 months free on any paid plan.',
        code: 'EARLY500',
        discount: '3 months free',
    },
    {
        title: 'Annual plan',
        desc: 'Pay yearly and save 20% on Premium or Enterprise.',
        code: 'ANNUAL20',
        discount: '20% off',
    },
    {
        title: 'Referral bonus',
        desc: 'Refer a colleague and both get 1 month free.',
        code: 'REFER1MO',
        discount: '1 month free each',
    },
];

const FAQS = [
    {
        q: 'Can I start for free?',
        a: 'Yes. The Free plan gives you a verified profile, 2 specialty conditions, and 5 lead credits per month. No credit card required.',
    },
    {
        q: 'What are lead credits?',
        a: 'Lead credits let you view and respond to patient enquiries. Each credit reveals one patient contact. Credits reset monthly.',
    },
    {
        q: 'Can I change plans later?',
        a: 'Absolutely. Upgrade or downgrade at any time. Upgrades take effect immediately, downgrades at the end of your billing cycle.',
    },
    {
        q: 'Is there a lock-in period?',
        a: 'No lock-in. Monthly plans can be cancelled anytime. Annual plans can be cancelled but are non-refundable.',
    },
    {
        q: 'How does verification work?',
        a: 'We verify your medical registration number, qualifications, and clinic/hospital affiliation. This typically takes 24–48 hours.',
    },
    {
        q: 'Do you support international doctors?',
        a: 'Yes. We have pricing for India, US, UK, and other regions. Contact us for enterprise pricing in your region.',
    },
];

export default function DoctorPricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    const handleCheckout = async (planSlug: string) => {
        if (planSlug === 'free') {
            window.location.href = '/for-doctors#join-form';
            return;
        }

        setLoadingPlan(planSlug);
        try {
            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: planSlug }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Checkout failed');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setErrorMessage('Unable to initialize checkout. Please try again later.');
            setTimeout(() => setErrorMessage(null), 5000);
            setLoadingPlan(null);
        }
    };

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
            <div
                style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 96px' }}
                className="col gap-7"
            >
                {/* Error */}
                {errorMessage && (
                    <div
                        className="row gap-2 ai-center"
                        style={{
                            padding: '12px 16px',
                            background: 'var(--orange-50)',
                            border: '1px solid rgba(255, 90, 46, .28)',
                            borderRadius: 'var(--r-2)',
                            color: 'var(--orange-2)',
                            fontSize: 13,
                        }}
                        role="alert"
                    >
                        <span
                            className="mono"
                            style={{ fontSize: 11, fontWeight: 500 }}
                            aria-hidden="true"
                        >
                            ● error
                        </span>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Hero */}
                <header className="col gap-3" style={{ maxWidth: 760 }}>
                    <span className="section-mark">doctor plans / pricing</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 6vw, 88px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Built for{' '}
                        <span style={{ color: 'var(--cobalt)' }}>your practice</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 580 }}
                    >
                        Start free, upgrade when you grow. Every plan includes a verified profile and patient matching — no surprise fees.
                    </p>
                </header>

                {/* Promotions Strip */}
                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 0,
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--r-3)',
                        overflow: 'hidden',
                        background: 'var(--paper)',
                    }}
                >
                    {PROMOTIONS.map((promo, i, arr) => (
                        <div
                            key={promo.code}
                            className="col gap-3"
                            style={{
                                padding: '20px 22px',
                                borderRight:
                                    i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                            }}
                        >
                            <div
                                className="row between ai-center gap-2"
                                style={{ flexWrap: 'wrap' }}
                            >
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                    }}
                                >
                                    § {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="pill pill-mint">{promo.discount}</span>
                            </div>
                            <div
                                className="display"
                                style={{
                                    fontSize: 18,
                                    fontWeight: 500,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {promo.title}
                            </div>
                            <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                                {promo.desc}
                            </p>
                            <code
                                className="mono"
                                style={{
                                    fontSize: 12,
                                    color: 'var(--cobalt)',
                                    background: 'var(--cobalt-50)',
                                    border: '1px solid rgba(28, 91, 255, .22)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--r-2)',
                                    width: 'fit-content',
                                    fontWeight: 500,
                                }}
                            >
                                {promo.code}
                            </code>
                        </div>
                    ))}
                </section>

                {/* Billing Toggle */}
                <div
                    className="row ai-center gap-3"
                    style={{ flexWrap: 'wrap' }}
                >
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: billingCycle === 'monthly' ? 'var(--ink)' : 'var(--ink-4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: billingCycle === 'monthly' ? 500 : 400,
                        }}
                    >
                        Monthly
                    </span>
                    <button
                        onClick={() =>
                            setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')
                        }
                        role="switch"
                        aria-checked={billingCycle === 'annual'}
                        aria-label="Toggle billing cycle"
                        style={{
                            position: 'relative',
                            width: 44,
                            height: 24,
                            borderRadius: 999,
                            background: billingCycle === 'annual' ? 'var(--cobalt)' : 'var(--rule)',
                            border: 'none',
                            transition: 'background 120ms',
                            cursor: 'pointer',
                        }}
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                top: 3,
                                left: 3,
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                background: 'var(--paper)',
                                transform:
                                    billingCycle === 'annual' ? 'translateX(20px)' : 'translateX(0)',
                                transition: 'transform 160ms ease',
                                boxShadow: '0 1px 3px rgba(10, 26, 47, .15)',
                            }}
                        />
                    </button>
                    <span
                        className="mono row ai-center gap-2"
                        style={{
                            fontSize: 11,
                            color: billingCycle === 'annual' ? 'var(--ink)' : 'var(--ink-4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: billingCycle === 'annual' ? 500 : 400,
                        }}
                    >
                        Annual
                        <span
                            className="pill pill-mint"
                            style={{ textTransform: 'none' }}
                        >
                            save 20%
                        </span>
                    </span>
                </div>

                {/* Plans Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16,
                    }}
                >
                    {PLANS.map((plan) => {
                        const isFree = plan.slug === 'free';
                        const numericPrice = parseInt(plan.price.replace('$', ''), 10) || 0;
                        const isAnnual = billingCycle === 'annual' && !isFree;
                        const displayPrice = isAnnual
                            ? `$${Math.floor(numericPrice * 0.8)}`
                            : plan.price;
                        const displayPeriod = isFree
                            ? plan.period
                            : isAnnual
                                ? '/month, billed annually'
                                : plan.period;

                        return (
                            <div
                                key={plan.slug}
                                className={plan.highlight ? 'card' : 'card-flat'}
                                style={{
                                    padding: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderColor: plan.highlight ? 'var(--ink)' : 'var(--rule)',
                                    borderWidth: plan.highlight ? 2 : 1,
                                    position: 'relative',
                                }}
                            >
                                {plan.badge && (
                                    <div
                                        className="mono"
                                        style={{
                                            padding: '8px 16px',
                                            background: plan.highlight ? 'var(--ink)' : 'var(--bg-2)',
                                            color: plan.highlight ? 'var(--paper)' : 'var(--ink-3)',
                                            fontSize: 11,
                                            letterSpacing: '0.10em',
                                            textTransform: 'uppercase',
                                            fontWeight: 500,
                                            borderBottom: '1px solid var(--rule)',
                                        }}
                                    >
                                        {plan.badge}
                                    </div>
                                )}

                                {/* Header */}
                                <div
                                    className="col gap-2 hairline-b"
                                    style={{ padding: '24px 24px 20px' }}
                                >
                                    <h2
                                        className="display"
                                        style={{
                                            fontSize: 22,
                                            margin: 0,
                                            fontWeight: 600,
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {plan.name}
                                    </h2>
                                    <p
                                        className="muted"
                                        style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}
                                    >
                                        {plan.desc}
                                    </p>
                                    <div
                                        className="row ai-baseline gap-1"
                                        style={{ marginTop: 6 }}
                                    >
                                        <span
                                            className="display num"
                                            style={{
                                                fontSize: 40,
                                                fontWeight: 600,
                                                letterSpacing: '-0.04em',
                                                color: 'var(--ink)',
                                                lineHeight: 1,
                                            }}
                                        >
                                            {displayPrice}
                                        </span>
                                        <span
                                            className="mono"
                                            style={{ fontSize: 12, color: 'var(--ink-3)' }}
                                        >
                                            {displayPeriod}
                                        </span>
                                    </div>
                                </div>

                                {/* Limits */}
                                <div
                                    className="row hairline-b"
                                    style={{ background: 'var(--bg-2)' }}
                                >
                                    <div
                                        className="col gap-1"
                                        style={{
                                            flex: 1,
                                            padding: '14px 18px',
                                            borderRight: '1px solid var(--rule)',
                                        }}
                                    >
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Specialties
                                        </span>
                                        <span
                                            className="num"
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 500,
                                                color: 'var(--ink)',
                                            }}
                                        >
                                            {plan.conditions >= 1000 ? 'Unlimited' : plan.conditions}
                                        </span>
                                    </div>
                                    <div
                                        className="col gap-1"
                                        style={{ flex: 1, padding: '14px 18px' }}
                                    >
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Leads / month
                                        </span>
                                        <span
                                            className="num"
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 500,
                                                color: 'var(--ink)',
                                            }}
                                        >
                                            {plan.leads}
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul
                                    className="clean col gap-2"
                                    style={{ padding: '20px 24px', flex: 1 }}
                                >
                                    {plan.features.map((feature, i) => (
                                        <li
                                            key={i}
                                            className="row gap-2 ai-baseline"
                                            style={{
                                                fontSize: 13,
                                                color: feature.included
                                                    ? 'var(--ink-2)'
                                                    : 'var(--ink-4)',
                                            }}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="mono"
                                                style={{
                                                    color: feature.included
                                                        ? 'var(--mint-3)'
                                                        : 'var(--ink-4)',
                                                    fontSize: 12,
                                                    minWidth: 14,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {feature.included ? '✓' : '×'}
                                            </span>
                                            <span style={{ flex: 1 }}>{feature.label}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <div style={{ padding: '0 24px 24px' }}>
                                    <button
                                        onClick={() => handleCheckout(plan.slug)}
                                        disabled={loadingPlan === plan.slug}
                                        className={
                                            plan.highlight ? 'btn btn-cobalt' : 'btn btn-paper'
                                        }
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        {loadingPlan === plan.slug
                                            ? 'Connecting checkout…'
                                            : isFree
                                                ? 'Get started free →'
                                                : 'Start free trial →'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ */}
                <section className="col gap-4" style={{ maxWidth: 880 }}>
                    <div className="col gap-2">
                        <span className="section-mark">faq</span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 'clamp(28px, 4vw, 44px)',
                                margin: 0,
                                letterSpacing: '-0.035em',
                                fontWeight: 600,
                            }}
                        >
                            Questions before you start.
                        </h2>
                    </div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {FAQS.map((faq, i, arr) => (
                            <div
                                key={i}
                                className="col gap-2"
                                style={{
                                    padding: '20px 24px',
                                    borderBottom:
                                        i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                }}
                            >
                                <div className="row gap-3 ai-baseline">
                                    <span
                                        className="num"
                                        style={{
                                            fontSize: 14,
                                            color: 'var(--cobalt)',
                                            fontWeight: 500,
                                            minWidth: 22,
                                        }}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <h3
                                        className="display"
                                        style={{
                                            fontSize: 17,
                                            fontWeight: 500,
                                            letterSpacing: '-0.02em',
                                            margin: 0,
                                        }}
                                    >
                                        {faq.q}
                                    </h3>
                                </div>
                                <p
                                    className="muted"
                                    style={{
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        margin: 0,
                                        paddingLeft: 32,
                                    }}
                                >
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="card-ink" style={{ padding: '36px 32px' }}>
                    <div
                        className="row between ai-center gap-4"
                        style={{ flexWrap: 'wrap' }}
                    >
                        <div className="col gap-2" style={{ flex: '1 1 360px', minWidth: 0 }}>
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
                                still deciding?
                            </span>
                            <h2
                                className="display"
                                style={{
                                    fontSize: 'clamp(24px, 3vw, 36px)',
                                    margin: 0,
                                    letterSpacing: '-0.03em',
                                    fontWeight: 600,
                                    color: 'var(--paper)',
                                    lineHeight: 1.1,
                                }}
                            >
                                Talk to our team
                                <span style={{ color: 'var(--orange)' }}>.</span>
                            </h2>
                            <p
                                style={{
                                    color: 'rgba(255,255,255,.7)',
                                    fontSize: 15,
                                    margin: 0,
                                    maxWidth: 480,
                                }}
                            >
                                We&rsquo;ll help you pick the right tier for your specialty, region, and patient volume.
                            </p>
                        </div>
                        <Link
                            href="/contact?subject=Doctor%20Pricing%20Inquiry"
                            className="btn btn-cobalt btn-lg"
                        >
                            Contact sales →
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
