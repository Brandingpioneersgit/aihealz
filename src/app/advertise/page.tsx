'use client';

import Link from 'next/link';
import { useState } from 'react';
import MediaTile from '@/components/v4/MediaTile';
import { UTIL_IMAGES } from '@/lib/stock-images';

const STATS = [
    { value: '71,000+', label: 'medical conditions' },
    { value: '1M+', label: 'monthly visitors' },
    { value: '18+', label: 'countries' },
    { value: '15+', label: 'languages' },
];

const AD_PLACEMENTS = [
    {
        abbr: 'CS',
        name: 'Condition page sidebar',
        description: 'Premium sidebar placement on condition detail pages. Highly targeted to users researching specific medical conditions.',
        size: '300×250 / 300×600',
        ctr: '2.1%',
    },
    {
        abbr: 'HF',
        name: 'Homepage featured',
        description: 'Showcase your clinic or hospital in the featured section of our homepage. Maximum visibility for brand awareness.',
        size: '970×250',
        ctr: '3.2%',
    },
    {
        abbr: 'SR',
        name: 'Search results',
        description: 'Appear at the top of search results when users look for treatments, doctors, or conditions in your specialty.',
        size: '728×90 · native',
        ctr: '2.8%',
    },
    {
        abbr: 'DP',
        name: 'Doctor profile sidebar',
        description: 'Cross-promote your services alongside doctor profiles. Ideal for hospitals, diagnostic labs, and pharmacies.',
        size: '300×250',
        ctr: '1.9%',
    },
    {
        abbr: 'SL',
        name: 'Sponsored listings',
        description: 'Get featured as a recommended provider in condition pages. Native ad format that blends with content.',
        size: 'native card',
        ctr: '4.1%',
    },
    {
        abbr: 'GB',
        name: 'Global banner',
        description: 'Site-wide header or footer banner for maximum reach. Perfect for brand campaigns and awareness drives.',
        size: '970×90',
        ctr: '1.5%',
    },
];

const PRICING_TIERS = [
    {
        name: 'Starter',
        price: '$0.50',
        unit: 'CPM',
        description: 'Perfect for small clinics testing digital advertising',
        features: [
            'Self-serve dashboard',
            'Basic geo-targeting',
            'Condition page placements',
            'Real-time analytics',
            'Email support',
        ],
        cta: 'Start free trial',
        popular: false,
    },
    {
        name: 'Professional',
        price: '$0.25',
        unit: 'CPC',
        description: 'Best for growing healthcare businesses',
        features: [
            'Everything in Starter',
            'Advanced targeting',
            'All placement types',
            'A/B testing',
            'Dedicated account manager',
            'Custom reporting',
        ],
        cta: 'Get started',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        unit: 'flat rate',
        description: 'For hospitals and healthcare networks',
        features: [
            'Everything in Professional',
            'Premium placements',
            'Exclusive sponsorships',
            'API access',
            'White-glove onboarding',
            'SLA guarantee',
            'Multi-location support',
        ],
        cta: 'Contact sales',
        popular: false,
    },
];

const TARGETING_OPTIONS = [
    { name: 'Geographic', desc: '18+ countries · 500+ cities' },
    { name: 'Condition', desc: '71,000+ medical conditions' },
    { name: 'Specialty', desc: '25+ medical specialties' },
    { name: 'Language', desc: '15+ supported languages' },
];

const TESTIMONIALS = [
    {
        quote: 'AIHealz helped us reach patients actively researching our specialty. Our appointment bookings increased by 40% in the first month.',
        author: 'Dr. Priya Sharma',
        role: 'Director, Apollo Multi-Specialty Clinic',
        location: 'Mumbai, India',
    },
    {
        quote: 'The targeting options are incredible. We can reach patients looking for specific treatments in specific cities. No wasted impressions.',
        author: 'James Mitchell',
        role: 'Marketing Head, HealthFirst Network',
        location: 'London, UK',
    },
];

export default function AdvertisePage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const faqs = [
        {
            q: 'What types of healthcare businesses can advertise?',
            a: 'We welcome hospitals, clinics, diagnostic labs, pharmacies, medical device companies, health insurance providers, and pharmaceutical companies. All ads are reviewed for compliance with healthcare advertising standards.',
        },
        {
            q: 'How does geo-targeting work?',
            a: 'Our platform detects user location through IP geolocation and allows you to target by country, region, or city. You can target multiple locations in a single campaign or run location-specific campaigns.',
        },
        {
            q: 'What ad formats do you support?',
            a: 'We support display banners (various sizes), native sponsored listings, and featured placements. All formats are designed to be non-intrusive while maximizing engagement.',
        },
        {
            q: 'How is billing handled?',
            a: 'We offer CPM (cost per thousand impressions), CPC (cost per click), and flat-rate billing. You can set daily and total campaign budgets. Payment is processed securely through Stripe.',
        },
        {
            q: 'Can I track campaign performance?',
            a: 'Yes — our dashboard provides real-time analytics including impressions, clicks, CTR, conversions, and ROI. You can segment data by placement, geography, and time period.',
        },
    ];

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            {/* ── Hero ──────────────────────────────────── */}
            <section style={{ padding: '64px clamp(16px, 4vw, 28px) 32px', maxWidth: 1280, margin: '0 auto' }}>
                <div
                    className="row between ai-center hairline-b"
                    style={{ paddingBottom: 18, flexWrap: 'wrap', gap: 12 }}
                >
                    <span className="kicker">
                        <span className="dot" />advertise · vol. 04 · live inventory
                    </span>
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--mint-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        ● accepting advertisers
                    </span>
                </div>

                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '32 / 9',
                        maxHeight: 280,
                        overflow: 'hidden',
                        borderRadius: 'var(--r-3, 8px)',
                        border: '1px solid var(--rule)',
                        marginTop: 32,
                    }}
                >
                    <MediaTile
                        alt={UTIL_IMAGES.analytics.alt}
                        icon={UTIL_IMAGES.analytics.icon}
                        tone="cobalt"
                        aspect="32 / 9"
                        iconSize={80}
                        priority
                    />
                    <span
                        className="mono"
                        style={{
                            position: 'absolute',
                            left: 'clamp(16px, 3vw, 28px)',
                            bottom: 18,
                            color: 'var(--ink-3)',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            fontWeight: 500,
                        }}
                    >
                        ● the inventory / advertise on aihealz
                    </span>
                </div>

                <div className="col gap-5" style={{ paddingTop: 48, maxWidth: 920 }}>
                    <span className="section-mark">I / for advertisers</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(48px, 7vw, 96px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Reach millions of <span style={{ color: 'var(--cobalt)' }}>healthcare seekers</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 22px)', maxWidth: 720 }}>
                        Advertise on the world&rsquo;s biggest multilingual healthcare platform. 71,000+ conditions. 18+ countries. 15+ languages.
                    </p>
                    <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                        <Link href="/advertise/enquiry" className="btn btn-cobalt btn-lg">
                            Start advertising →
                        </Link>
                        <Link href="#pricing" className="btn btn-paper btn-lg">
                            View pricing
                        </Link>
                    </div>
                </div>

                {/* Stats strip */}
                <div
                    style={{
                        marginTop: 48,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 0,
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--r-3)',
                        background: 'var(--paper)',
                        overflow: 'hidden',
                    }}
                >
                    {STATS.map((s, i, arr) => (
                        <div
                            key={s.label}
                            className="col gap-1"
                            style={{
                                padding: '24px clamp(16px, 4vw, 28px)',
                                borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                            }}
                        >
                            <div
                                className="display num"
                                style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)' }}
                            >
                                {s.value}
                            </div>
                            <div
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Trust strip ────────────────────────────── */}
            <section style={{ padding: '32px clamp(16px, 4vw, 28px)', maxWidth: 1280, margin: '0 auto' }}>
                <div
                    className="row gap-5 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}
                >
                    <span>verified medical content</span>
                    <span>·</span>
                    <span>HIPAA-aware</span>
                    <span>·</span>
                    <span>E-E-A-T compliant</span>
                    <span>·</span>
                    <span>24/7 global reach</span>
                </div>
            </section>

            {/* ── Ad Placements ─────────────────────────── */}
            <section style={{ padding: '64px clamp(16px, 4vw, 28px)', maxWidth: 1280, margin: '0 auto' }}>
                <div className="row between ai-end" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <div className="col gap-2">
                        <span className="section-mark">II / placements</span>
                        <h2
                            className="display"
                            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', margin: 0, letterSpacing: '-0.035em', fontWeight: 600 }}
                        >
                            Premium placements, by inventory.
                        </h2>
                    </div>
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        {AD_PLACEMENTS.length} surfaces
                    </span>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 0,
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--r-3)',
                        background: 'var(--paper)',
                        overflow: 'hidden',
                    }}
                >
                    {AD_PLACEMENTS.map((placement, i) => {
                        const cols = 3;
                        const isLastCol = (i + 1) % cols === 0;
                        const isLastRow = i >= AD_PLACEMENTS.length - cols;
                        return (
                            <div
                                key={placement.name}
                                className="col gap-3"
                                style={{
                                    padding: 24,
                                    borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                    borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                }}
                            >
                                <div className="row between ai-center">
                                    <div className="spec-icon">{placement.abbr}</div>
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--cobalt)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        CTR · {placement.ctr}
                                    </span>
                                </div>
                                <div className="col gap-1">
                                    <h3
                                        className="display"
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 600,
                                            margin: 0,
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {placement.name}
                                    </h3>
                                    <span
                                        className="mono muted"
                                        style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                                    >
                                        {placement.size}
                                    </span>
                                </div>
                                <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                                    {placement.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Targeting ─────────────────────────────── */}
            <section style={{ padding: '64px clamp(16px, 4vw, 28px)', maxWidth: 1280, margin: '0 auto' }}>
                <div className="row gap-7" style={{ flexWrap: 'wrap' }}>
                    <div className="col gap-5" style={{ flex: '1 1 380px', minWidth: 0 }}>
                        <span className="section-mark">III / targeting</span>
                        <h2
                            className="display"
                            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', margin: 0, letterSpacing: '-0.035em', fontWeight: 600 }}
                        >
                            Reach the <span style={{ color: 'var(--cobalt)' }}>right patients</span><span style={{ color: 'var(--orange)' }}>.</span>
                        </h2>
                        <p className="lede" style={{ fontSize: 17, maxWidth: 540 }}>
                            Granular targeting ensures your ads reach users actively researching conditions relevant to your practice. No wasted impressions.
                        </p>
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
                            {TARGETING_OPTIONS.map((opt, i, arr) => (
                                <div
                                    key={opt.name}
                                    className="col gap-1"
                                    style={{
                                        padding: '18px 20px',
                                        borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
                                        borderBottom: i < arr.length - 2 ? '1px solid var(--rule)' : 'none',
                                    }}
                                >
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{opt.name}</span>
                                    <span className="muted mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        {opt.desc}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Example campaign card */}
                    <div className="card-ink col gap-3" style={{ flex: '1 1 360px', minWidth: 0, padding: 28 }}>
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
                            example campaign
                        </span>
                        <div className="col gap-2">
                            {[
                                ['Countries', 'India · USA · UK'],
                                ['Cities', 'Mumbai · Delhi · NYC'],
                                ['Conditions', 'Diabetes · Hypertension'],
                                ['Specialty', 'Cardiology'],
                                ['Languages', 'English · Hindi'],
                            ].map(([k, v]) => (
                                <div
                                    key={k}
                                    className="row between ai-center"
                                    style={{
                                        padding: '10px 14px',
                                        background: 'rgba(255,255,255,.04)',
                                        border: '1px solid rgba(255,255,255,.08)',
                                        borderRadius: 'var(--r-2)',
                                    }}
                                >
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{k}</span>
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 12,
                                            color: 'var(--cobalt-3)',
                                            letterSpacing: '0.02em',
                                        }}
                                    >
                                        {v}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div
                            className="col gap-2"
                            style={{
                                marginTop: 8,
                                padding: 14,
                                background: 'rgba(28,91,255,.10)',
                                border: '1px solid rgba(28,91,255,.20)',
                                borderRadius: 'var(--r-2)',
                            }}
                        >
                            <div className="row between ai-center">
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'rgba(255,255,255,.5)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    estimated reach
                                </span>
                                <span className="display num" style={{ fontSize: 24, fontWeight: 500, color: 'var(--paper)' }}>
                                    125K
                                </span>
                            </div>
                            <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2 }}>
                                <div style={{ width: '75%', height: '100%', background: 'var(--cobalt)', borderRadius: 2 }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Pricing ───────────────────────────────── */}
            <section id="pricing" style={{ padding: '64px clamp(16px, 4vw, 28px)', maxWidth: 1280, margin: '0 auto' }}>
                <div className="col gap-2" style={{ marginBottom: 32 }}>
                    <span className="section-mark">IV / pricing</span>
                    <h2
                        className="display"
                        style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', margin: 0, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Flexible for every budget.
                    </h2>
                </div>

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
                            <ul className="clean col gap-2">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="row gap-2 ai-baseline">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                minWidth: 14,
                                            }}
                                        >
                                            ✓
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 13,
                                                color: tier.popular ? 'rgba(255,255,255,.85)' : 'var(--ink-2)',
                                            }}
                                        >
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/advertise/enquiry"
                                className={tier.popular ? 'btn btn-cobalt' : 'btn btn-paper'}
                                style={{ width: '100%', marginTop: 'auto' }}
                            >
                                {tier.cta} →
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Testimonials ──────────────────────────── */}
            <section style={{ padding: '64px clamp(16px, 4vw, 28px)', maxWidth: 1280, margin: '0 auto' }}>
                <div className="col gap-2" style={{ marginBottom: 32 }}>
                    <span className="section-mark">V / customers</span>
                    <h2
                        className="display"
                        style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', margin: 0, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Trusted by healthcare leaders.
                    </h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                        gap: 16,
                    }}
                >
                    {TESTIMONIALS.map((t) => (
                        <article key={t.author} className="card col gap-4" style={{ padding: 28 }}>
                            <span
                                className="display"
                                style={{
                                    fontSize: 32,
                                    color: 'var(--cobalt)',
                                    lineHeight: 0.5,
                                    fontWeight: 600,
                                }}
                            >
                                &ldquo;
                            </span>
                            <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                                {t.quote}
                            </p>
                            <div className="hairline" />
                            <div className="col gap-1">
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{t.author}</span>
                                <span className="muted" style={{ fontSize: 12 }}>{t.role}</span>
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    {t.location}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────── */}
            <section style={{ padding: '64px clamp(16px, 4vw, 28px)', maxWidth: 880, margin: '0 auto' }}>
                <div className="col gap-2" style={{ marginBottom: 32 }}>
                    <span className="section-mark">VI / FAQ</span>
                    <h2
                        className="display"
                        style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', margin: 0, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Common questions.
                    </h2>
                </div>
                <div className="col gap-2">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="card-flat"
                            style={{ overflow: 'hidden' }}
                        >
                            <button
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                className="row between ai-center"
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{faq.q}</span>
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 18,
                                        color: 'var(--cobalt)',
                                        transition: 'transform 200ms ease',
                                        transform: activeFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                                    }}
                                >
                                    +
                                </span>
                            </button>
                            {activeFaq === i && (
                                <div className="hairline-t" style={{ padding: '16px 20px' }}>
                                    <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                                        {faq.a}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────── */}
            <section style={{ padding: '0 clamp(16px, 4vw, 28px) 96px' }}>
                <div
                    className="card-ink"
                    style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(36px, 5vw, 64px)' }}
                >
                    <div
                        className="row between ai-center"
                        style={{ flexWrap: 'wrap', gap: 24 }}
                    >
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
                                ready to grow
                            </span>
                            <h2
                                className="display"
                                style={{
                                    fontSize: 'clamp(32px, 4.5vw, 52px)',
                                    lineHeight: 1.05,
                                    margin: 0,
                                    fontWeight: 600,
                                    color: 'var(--paper)',
                                    letterSpacing: '-0.035em',
                                }}
                            >
                                Join the healthcare brands <span style={{ color: 'var(--cobalt-3)' }}>reaching millions</span><span style={{ color: 'var(--orange)' }}>.</span>
                            </h2>
                        </div>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            <Link href="/advertise/enquiry" className="btn btn-cobalt btn-lg">
                                Get started today →
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
                </div>
            </section>
        </main>
    );
}
