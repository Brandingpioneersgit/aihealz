import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { SLUG_TO_CODE, getCountryBySlug, buildAlternateLanguages } from '@/lib/countries';

// ── Locale map for currency formatting ──────────────────────
const LOCALE_MAP: Record<string, string> = {
    in: 'en-IN', us: 'en-US', gb: 'en-GB', ae: 'en-AE', sg: 'en-SG',
    au: 'en-AU', ca: 'en-CA', de: 'de-DE', fr: 'fr-FR', jp: 'ja-JP',
    kr: 'ko-KR', br: 'pt-BR', mx: 'es-MX', sa: 'ar-SA', za: 'en-ZA',
    my: 'en-MY', th: 'th-TH', ph: 'en-PH', ng: 'en-NG', ke: 'en-KE',
};

function formatCost(amount: number | { toNumber?: () => number }, currency: string, countryCode: string): string {
    const num = typeof amount === 'number' ? amount : (amount?.toNumber?.() ?? Number(amount));
    const locale = LOCALE_MAP[countryCode.toLowerCase()] || 'en-US';
    try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(num);
    } catch {
        return `${currency} ${num.toLocaleString()}`;
    }
}

// ── Dynamic SEO Metadata ────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ country: string; lang: string; condition: string }> }): Promise<Metadata> {
    const { country, lang, condition } = await params;
    const mc = await prisma.medicalCondition.findUnique({ where: { slug: condition } });
    const countryName = getCountryBySlug(country)?.name
        ?? country.charAt(0).toUpperCase() + country.slice(1);
    const canonical = `/${country}/${lang}/${condition}/cost`;
    return {
        title: mc ? `Cost of ${mc.commonName} Treatment in ${countryName} | aihealz` : 'Treatment Costs | aihealz',
        description: mc ? `Compare treatment costs for ${mc.commonName} in ${countryName}. AI-estimated pricing from verified hospitals.` : 'Compare medical treatment costs.',
        alternates: {
            canonical,
            languages: buildAlternateLanguages(country, `/${condition}/cost`),
        },
    };
}

export default async function CostPage({ params }: { params: Promise<{ country: string, lang: string, condition: string }> }) {
    const { country, lang, condition } = await params;

    const medicalCondition = await prisma.medicalCondition.findUnique({
        where: { slug: condition, isActive: true }
    });

    if (!medicalCondition) notFound();

    // Convert country slug to ISO code for database lookup
    const countryCode = SLUG_TO_CODE[country]?.toLowerCase() || country;
    const countryConfig = getCountryBySlug(country);

    const costData = await prisma.treatmentCost.findFirst({
        where: { conditionSlug: condition, countryCode: countryCode }
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
    const pageUrl = `${siteUrl}/${country}/${lang}/${condition}/cost`;
    const serviceSchema = costData ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `${costData.treatmentName || medicalCondition.commonName} treatment`,
        serviceType: 'MedicalProcedure',
        provider: { '@type': 'Organization', name: 'aihealz', url: siteUrl },
        ...(countryConfig && {
            areaServed: { '@type': 'Country', name: countryConfig.name },
        }),
        about: {
            '@type': 'MedicalCondition',
            name: medicalCondition.commonName,
        },
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: costData.currency,
            lowPrice: Number(costData.minCost),
            highPrice: Number(costData.maxCost),
            priceSpecification: {
                '@type': 'PriceSpecification',
                price: Number(costData.avgCost),
                priceCurrency: costData.currency,
                valueAddedTaxIncluded: false,
            },
            url: pageUrl,
        },
    } : null;
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: medicalCondition.commonName, item: `${siteUrl}/${country}/${lang}/${condition}` },
            { '@type': 'ListItem', position: 3, name: 'Cost Analysis', item: pageUrl },
        ],
    };

    const countryDisplay = countryConfig?.name || country;

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            {serviceSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <div
                style={{ maxWidth: 1024, margin: '0 auto', padding: '48px 28px 80px' }}
                className="col gap-7"
            >
                {/* ── Breadcrumb ─────────────────────────── */}
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href={`/${country}/${lang}/${condition}`}>{medicalCondition.commonName}</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>Cost Analysis</span>
                </nav>

                {/* ── Hero ────────────────────────────────── */}
                <header className="col gap-4">
                    <span className="section-mark">cost · {countryDisplay}</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5.5vw, 64px)',
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Cost of <span style={{ color: 'var(--cobalt)' }}>{medicalCondition.commonName}</span> treatment
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', maxWidth: 720 }}>
                        Hospital estimates and average procedure costs for treating {medicalCondition.commonName.toLowerCase()} in {countryDisplay}. AI-aggregated from public health data and private hospital rate cards.
                    </p>
                </header>

                {/* ── Cost cards ──────────────────────────── */}
                {costData ? (
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
                        {[
                            { label: 'Minimum', value: formatCost(costData.minCost, costData.currency, country), tone: 'muted' as const },
                            { label: 'AI database average', value: formatCost(costData.avgCost, costData.currency, country), tone: 'cobalt' as const },
                            { label: 'Maximum', value: formatCost(costData.maxCost, costData.currency, country), tone: 'muted' as const },
                        ].map((s, i, arr) => (
                            <div
                                key={s.label}
                                className="col gap-2"
                                style={{
                                    padding: '24px 28px',
                                    borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                    background: s.tone === 'cobalt' ? 'var(--cobalt-50)' : 'var(--paper)',
                                }}
                            >
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: s.tone === 'cobalt' ? 'var(--cobalt)' : 'var(--ink-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    {s.label}
                                </span>
                                <span
                                    className="display num"
                                    style={{
                                        fontSize: s.tone === 'cobalt' ? 36 : 24,
                                        fontWeight: 500,
                                        letterSpacing: '-0.03em',
                                        color: s.tone === 'cobalt' ? 'var(--cobalt)' : 'var(--ink)',
                                        lineHeight: 1,
                                    }}
                                >
                                    {s.value}
                                </span>
                                {s.tone === 'cobalt' && costData.treatmentName && (
                                    <span className="muted" style={{ fontSize: 12 }}>{costData.treatmentName}</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className="card-quiet col gap-2 ai-center"
                        style={{ padding: 32, textAlign: 'center' }}
                    >
                        <span className="kicker"><span className="dot" />gathering data</span>
                        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
                            Detailed cost data is currently being gathered for this region.
                        </p>
                    </div>
                )}

                {/* ── What's included ─────────────────────── */}
                <section className="card col gap-4" style={{ padding: 'clamp(24px, 3vw, 32px)' }}>
                    <div className="row gap-3 ai-baseline">
                        <span
                            className="num"
                            style={{
                                fontSize: 14,
                                color: 'var(--cobalt)',
                                fontWeight: 500,
                                letterSpacing: '0.06em',
                            }}
                        >
                            § 01
                        </span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 'clamp(22px, 2.5vw, 28px)',
                                margin: 0,
                                letterSpacing: '-0.025em',
                                fontWeight: 600,
                            }}
                        >
                            What&rsquo;s included typically
                        </h2>
                    </div>
                    <ul className="clean col gap-3">
                        {[
                            'Initial specialist consultation and physical examination.',
                            'Standard diagnostic tests (varies heavily by severity).',
                            `The core procedure or treatment protocol (${costData?.treatmentName || 'standard care'}).`,
                            'Follow-up visits (usually 1–2 included post-procedure).',
                            'Standard hospital room charges for basic tiers (if surgical).',
                        ].map((item, i) => (
                            <li key={i} className="row gap-3 ai-baseline">
                                <span
                                    className="num"
                                    style={{
                                        fontSize: 14,
                                        color: 'var(--cobalt)',
                                        minWidth: 28,
                                        fontWeight: 500,
                                    }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55 }}>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="hairline" />
                    <p className="muted" style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                        These are AI-estimated averages based on public health data and private hospital rate cards. Actual costs vary based on the patient&rsquo;s specific health profile, room category, doctor seniority, and exact hospital tier.
                    </p>
                </section>

                {/* ── Concierge CTA ───────────────────────── */}
                <section
                    className="card-ink"
                    style={{ padding: 'clamp(28px, 4vw, 48px)' }}
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
                                concierge · 24h turnaround
                            </span>
                            <h2
                                className="display"
                                style={{
                                    fontSize: 'clamp(28px, 3.5vw, 40px)',
                                    lineHeight: 1.1,
                                    margin: 0,
                                    fontWeight: 600,
                                    color: 'var(--paper)',
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                Need an exact quote? <span style={{ color: 'var(--cobalt-3)' }}>Match with top-rated hospitals</span><span style={{ color: 'var(--orange)' }}>.</span>
                            </h2>
                            <p
                                style={{
                                    fontSize: 15,
                                    color: 'rgba(255,255,255,.7)',
                                    lineHeight: 1.55,
                                    maxWidth: 540,
                                    margin: 0,
                                }}
                            >
                                Connect with our medical travel concierge. We verify your exact procedure cost within 24 hours — free service, transparent pricing, no obligations.
                            </p>
                        </div>
                        <Link href="/medical-travel/bot" className="btn btn-cobalt btn-lg">
                            Get PDF estimate →
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
