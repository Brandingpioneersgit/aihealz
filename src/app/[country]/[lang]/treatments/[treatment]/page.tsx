import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { isRTL, getLanguageConfig, getUITranslations } from '@/lib/i18n';
import { buildAlternateLanguages } from '@/lib/countries';

export const revalidate = 3600;

// ─── Types ───────────────────────────────────────────────────

interface TreatmentCost {
    usd: number;
    currency: string;
    range?: [number, number];
}

interface TreatmentReference {
    title: string;
    url: string;
}

interface TreatmentEntry {
    name: string;
    type: string;
    specialty: string;
    group?: string;
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
    description?: string;
    mechanism?: string;
    indications?: string[];
    sideEffects?: string[];
    references?: TreatmentReference[];
    costs?: {
        usa: TreatmentCost;
        uk: TreatmentCost;
        india: TreatmentCost;
        thailand: TreatmentCost;
        mexico: TreatmentCost;
        turkey: TreatmentCost;
        uae: TreatmentCost;
    };
}

type CountryKey = 'usa' | 'uk' | 'india' | 'thailand' | 'mexico' | 'turkey' | 'uae';

const COUNTRIES: { key: CountryKey; label: string; code: string; currency: string; slugs: string[] }[] = [
    { key: 'usa', label: 'United States', code: 'US', currency: 'USD', slugs: ['us', 'usa', 'united-states'] },
    { key: 'uk', label: 'United Kingdom', code: 'UK', currency: 'GBP', slugs: ['uk', 'united-kingdom', 'gb'] },
    { key: 'india', label: 'India', code: 'IN', currency: 'INR', slugs: ['india', 'in'] },
    { key: 'thailand', label: 'Thailand', code: 'TH', currency: 'THB', slugs: ['thailand', 'th'] },
    { key: 'mexico', label: 'Mexico', code: 'MX', currency: 'MXN', slugs: ['mexico', 'mx'] },
    { key: 'turkey', label: 'Turkey', code: 'TR', currency: 'TRY', slugs: ['turkey', 'tr'] },
    { key: 'uae', label: 'UAE', code: 'AE', currency: 'AED', slugs: ['uae', 'ae', 'dubai'] },
];

function findCountryBySlug(slug: string) {
    return COUNTRIES.find(c => c.slugs.includes(slug.toLowerCase()));
}

const TYPE_LABEL: Record<string, string> = {
    medical: 'Medical management',
    surgical: 'Surgical procedure',
    drug: 'Prescription drug',
    injection: 'Injectable treatment',
    prescription: 'Prescription medicine',
    otc: 'Over-the-counter',
    home_remedy: 'Home remedy',
    therapy: 'Therapy / rehabilitation',
};

interface TranslatedTreatmentEntry extends TreatmentEntry {
    translatedName?: string;
    typeLabel?: string;
}

function loadTreatmentData(treatmentSlug: string, lang: string = 'en'): TranslatedTreatmentEntry | undefined {
    try {
        const langFile = path.join(process.cwd(), 'public', 'data', `treatments-${lang}.json`);
        const defaultFile = path.join(process.cwd(), 'public', 'data', 'treatments.json');

        const filePath = fs.existsSync(langFile) ? langFile : defaultFile;
        const treatments: TranslatedTreatmentEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return treatments.find(t =>
            t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === treatmentSlug.toLowerCase()
        );
    } catch {
        return undefined;
    }
}

// ─── Generate Metadata ───────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ country: string; lang: string; treatment: string }> }): Promise<Metadata> {
    const { country, lang, treatment } = await params;
    const treatmentData = loadTreatmentData(treatment, lang);
    const treatmentName = treatmentData?.translatedName || treatmentData?.name || treatment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const dir = isRTL(lang) ? 'rtl' : 'ltr';

    const actualDescription = treatmentData?.description && treatmentData.description.length > 50
        ? treatmentData.description
        : null;

    const metaDescription = actualDescription
        ? `${actualDescription.substring(0, 120)}... Compare costs in USA, UK, India, Thailand, Mexico, Turkey & UAE.`
        : `Complete guide to ${treatmentName}: costs across 7 countries, procedure details, recovery timeline, risks, and find qualified specialists near you.`;

    const usaPrice = treatmentData?.costs?.usa;
    const indiaPrice = treatmentData?.costs?.india;
    const priceInfo = usaPrice && indiaPrice
        ? ` Prices from $${indiaPrice.usd} (India) to $${usaPrice.usd} (USA).`
        : '';

    const keywords = [
        treatmentName,
        `${treatmentName} cost`,
        `${treatmentName} price`,
        treatmentData?.specialty || '',
        treatmentData?.type || '',
        ...(treatmentData?.indications?.slice(0, 3) || []),
    ].filter(Boolean).join(', ');

    const countryLabel = findCountryBySlug(country)?.label || 'Global';

    return {
        title: `${treatmentName} - Cost, Procedure & Recovery in ${countryLabel} | AIHealz`,
        description: metaDescription + priceInfo,
        keywords,
        openGraph: {
            title: `${treatmentName} Treatment Guide - ${countryLabel} | AIHealz`,
            description: actualDescription?.substring(0, 200) || `Compare ${treatmentName} costs globally. USA, UK, India, Thailand, Mexico, Turkey & UAE pricing with recovery info.`,
            type: 'article',
            siteName: 'AIHealz',
            locale: `${lang}_${country.toUpperCase()}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${treatmentName} - Cost & Procedure Guide`,
            description: metaDescription.substring(0, 200),
        },
        alternates: {
            canonical: `https://aihealz.com/${country}/${lang}/treatments/${treatment}`,
            languages: buildAlternateLanguages(country, `/treatments/${treatment}`),
        },
        robots: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
        },
        other: {
            'content-language': lang,
            dir,
        },
    };
}

// ─── Main Page Component ─────────────────────────────────────

export default async function TreatmentPage({ params }: { params: Promise<{ country: string; lang: string; treatment: string }> }) {
    const { country, lang, treatment } = await params;

    const ui = getUITranslations(lang);
    const langConfig = getLanguageConfig(lang);
    const dir = isRTL(lang) ? 'rtl' : 'ltr';

    const langFile = path.join(process.cwd(), 'public', 'data', `treatments-${lang}.json`);
    const defaultFile = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    const filePath = fs.existsSync(langFile) ? langFile : defaultFile;
    let treatments: TranslatedTreatmentEntry[] = [];
    try {
        treatments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.error('Failed to load treatments:', e);
    }

    const treatmentSlug = treatment.toLowerCase();
    const treatmentData = treatments.find(t =>
        t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === treatmentSlug
    );

    const treatmentName = treatmentData?.translatedName || treatmentData?.name || treatment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const typeLabel = TYPE_LABEL[treatmentData?.type || 'medical'] || TYPE_LABEL.medical;

    // URL country is authoritative for this route; default to 'usa' if unknown.
    const userCountryKey: CountryKey = findCountryBySlug(country)?.key || 'usa';

    const relatedTreatments = treatments
        .filter(t => t.specialty === treatmentData?.specialty && t.name !== treatmentData?.name)
        .slice(0, 6);

    // Structured data
    const treatmentType = treatmentData?.type || 'medical';
    const isDrug = ['drug', 'prescription', 'otc', 'injection'].includes(treatmentType);
    const isTherapy = ['home_remedy', 'therapy', 'medical'].includes(treatmentType);
    const schemaType = isDrug ? 'Drug' : isTherapy ? 'MedicalTherapy' : 'MedicalProcedure';

    const treatmentSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': schemaType,
        name: treatmentName,
        description: treatmentData?.description || `${treatmentName} is a ${typeLabel.toLowerCase()} used in ${treatmentData?.specialty || 'General'} medicine.`,
        ...(treatmentData?.indications && treatmentData.indications.length > 0 && {
            indication: treatmentData.indications.map(ind => ({
                '@type': 'MedicalIndication',
                name: ind,
            })),
        }),
        ...(treatmentData?.specialty && {
            relevantSpecialty: {
                '@type': 'MedicalSpecialty',
                name: treatmentData.specialty,
            },
        }),
    };

    if (isDrug) {
        if (treatmentData?.brandNames && treatmentData.brandNames.length > 0) {
            treatmentSchema.nonProprietaryName = treatmentName;
            treatmentSchema.proprietaryName = treatmentData.brandNames;
        }
        if (treatmentData?.requiresPrescription !== undefined) {
            treatmentSchema.prescriptionStatus = treatmentData.requiresPrescription ? 'PrescriptionOnly' : 'OTC';
        }
        if (treatmentData?.mechanism) {
            treatmentSchema.mechanismOfAction = treatmentData.mechanism;
        }
        if (treatmentData?.sideEffects && treatmentData.sideEffects.length > 0) {
            treatmentSchema.adverseOutcome = treatmentData.sideEffects.map(s => ({
                '@type': 'MedicalEntity',
                name: s,
            }));
        }
    } else {
        if (schemaType === 'MedicalProcedure') {
            treatmentSchema.procedureType = treatmentType;
            if (treatmentData?.mechanism) treatmentSchema.howPerformed = treatmentData.mechanism;
        }
        if (treatmentData?.sideEffects && treatmentData.sideEffects.length > 0) {
            treatmentSchema.risks = treatmentData.sideEffects.join(', ');
        }
    }

    if (treatmentData?.costs) {
        treatmentSchema.offers = COUNTRIES.map(c => ({
            '@type': 'Offer',
            price: treatmentData.costs?.[c.key]?.range?.[0] || 0,
            priceCurrency: treatmentData.costs?.[c.key]?.currency || 'USD',
            priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            eligibleRegion: {
                '@type': 'Country',
                name: c.label,
            },
        }));
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: 'Treatments', item: 'https://aihealz.com/treatments' },
            { '@type': 'ListItem', position: 3, name: treatmentName, item: `https://aihealz.com/${country}/${lang}/treatments/${treatment}` },
        ],
    };

    const faqSchema = (treatmentData?.indications && treatmentData?.sideEffects) ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What is ${treatmentName} used for?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: treatmentData.indications.join(', '),
                },
            },
            {
                '@type': 'Question',
                name: `What are the side effects of ${treatmentName}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: treatmentData.sideEffects.join(', '),
                },
            },
            {
                '@type': 'Question',
                name: `How much does ${treatmentName} cost?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${treatmentName} costs vary by country: USA $${treatmentData.costs?.usa?.usd || 'N/A'}, UK $${treatmentData.costs?.uk?.usd || 'N/A'}, India $${treatmentData.costs?.india?.usd || 'N/A'}, Thailand $${treatmentData.costs?.thailand?.usd || 'N/A'}.`,
                },
            },
        ],
    } : null;

    return (
        <>
            <Script id="treatment-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(treatmentSchema) }} />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {faqSchema && (
                <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            )}

            <main
                dir={dir}
                lang={lang}
                style={{ background: 'var(--bg)', color: 'var(--ink)' }}
            >
                <div
                    style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
                    className="col gap-7"
                >
                    {/* Language indicator */}
                    {lang !== 'en' && (
                        <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                            <span className="pill pill-cobalt" style={{ textTransform: 'none' }}>
                                {langConfig.nativeName}
                            </span>
                            <Link
                                href={`/${country}/en/treatments/${treatment}`}
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                Switch to English →
                            </Link>
                        </div>
                    )}

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
                        <Link href="/">{ui.home}</Link>
                        <span>/</span>
                        <Link href={`/${country}/${lang}/treatments`}>{ui.treatments}</Link>
                        <span>/</span>
                        <span style={{ color: 'var(--ink)' }}>{treatmentName}</span>
                    </nav>

                    {/* Hero */}
                    <header className="col gap-4">
                        <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                            <span className="pill pill-cobalt">{typeLabel}</span>
                            {treatmentData?.specialty && (
                                <Link
                                    href={`/conditions/${treatmentData.specialty.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                    className="pill"
                                    style={{ textTransform: 'none' }}
                                >
                                    {treatmentData.specialty}
                                </Link>
                            )}
                            {treatmentData?.requiresPrescription && <span className="pill pill-orange">Rx required</span>}
                            {treatmentData?.genericAvailable && <span className="pill pill-mint">generic available</span>}
                        </div>
                        <h1
                            className="display"
                            style={{
                                fontSize: 'clamp(36px, 6vw, 72px)',
                                margin: 0,
                                letterSpacing: '-0.04em',
                                fontWeight: 600,
                                lineHeight: 1.02,
                            }}
                        >
                            {treatmentName}
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 720 }}>
                            Comprehensive guide to {treatmentName.toLowerCase()} — global cost comparison, procedure details, recovery expectations, and qualified specialists.
                        </p>
                        {treatmentData?.brandNames && treatmentData.brandNames.length > 0 && (
                            <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    Brand names
                                </span>
                                {treatmentData.brandNames.map((brand, i) => (
                                    <span key={i} className="pill" style={{ textTransform: 'none' }}>{brand}</span>
                                ))}
                            </div>
                        )}
                    </header>

                    {/* Cost comparison */}
                    {treatmentData?.costs && (
                        <section className="col gap-4">
                            <div className="row gap-3 ai-baseline">
                                <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 01</span>
                                <h2 className="display" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                    Cost comparison · 7 countries
                                </h2>
                            </div>
                            <div
                                className="card"
                                style={{ padding: 0, overflow: 'hidden' }}
                            >
                                <div
                                    className="row hairline-b"
                                    style={{ padding: '14px 22px' }}
                                >
                                    <span
                                        className="mono"
                                        style={{
                                            flex: 2,
                                            fontSize: 11,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        Country
                                    </span>
                                    <span
                                        className="mono"
                                        style={{
                                            flex: 2,
                                            fontSize: 11,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            textAlign: 'right',
                                        }}
                                    >
                                        Range
                                    </span>
                                    <span
                                        className="mono"
                                        style={{
                                            flex: 1,
                                            fontSize: 11,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            textAlign: 'right',
                                        }}
                                    >
                                        ~USD
                                    </span>
                                </div>
                                {COUNTRIES.map((c, i, arr) => {
                                    const cost = treatmentData.costs?.[c.key];
                                    if (!cost?.range) return null;
                                    const isUserCountry = c.key === userCountryKey;
                                    return (
                                        <div
                                            key={c.key}
                                            className="row ai-center"
                                            style={{
                                                padding: '16px 22px',
                                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                background: isUserCountry ? 'var(--cobalt-50)' : 'var(--paper)',
                                            }}
                                        >
                                            <span
                                                className="display"
                                                style={{
                                                    flex: 2,
                                                    fontSize: 16,
                                                    fontWeight: 500,
                                                    letterSpacing: '-0.015em',
                                                    color: isUserCountry ? 'var(--cobalt)' : 'var(--ink)',
                                                }}
                                            >
                                                {c.label}
                                                {isUserCountry && (
                                                    <span
                                                        className="mono"
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'var(--cobalt)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.08em',
                                                            marginLeft: 8,
                                                        }}
                                                    >
                                                        ★ your location
                                                    </span>
                                                )}
                                            </span>
                                            <span
                                                className="num"
                                                style={{
                                                    flex: 2,
                                                    fontSize: 14,
                                                    color: isUserCountry ? 'var(--cobalt)' : 'var(--ink-2)',
                                                    fontWeight: isUserCountry ? 500 : 400,
                                                    textAlign: 'right',
                                                }}
                                            >
                                                {c.currency} {cost.range[0].toLocaleString()}–{cost.range[1].toLocaleString()}
                                            </span>
                                            <span
                                                className="num mono"
                                                style={{
                                                    flex: 1,
                                                    fontSize: 12,
                                                    color: 'var(--ink-3)',
                                                    textAlign: 'right',
                                                }}
                                            >
                                                ~${cost.usd}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="muted" style={{ fontSize: 12, lineHeight: 1.55, margin: 0 }}>
                                Prices are estimates and may vary based on hospital, facility, and individual requirements.
                            </p>
                        </section>
                    )}

                    {/* Two-column body */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
                            gap: 32,
                            alignItems: 'flex-start',
                        }}
                    >
                        <div className="col gap-6" style={{ minWidth: 0 }}>
                            {/* Overview */}
                            <section className="card col gap-3" style={{ padding: 28 }}>
                                <div className="row gap-3 ai-baseline">
                                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 02</span>
                                    <h2 className="display" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                        What is {treatmentName}?
                                    </h2>
                                </div>
                                <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>
                                    {treatmentData?.description || `${treatmentName} is a ${typeLabel.toLowerCase()} commonly used in ${treatmentData?.specialty || 'general'} medicine. This treatment approach helps address various health conditions and symptoms, providing patients with effective therapeutic options.`}
                                </p>
                                {treatmentData?.mechanism && (
                                    <div
                                        className="card-quiet col gap-2"
                                        style={{ padding: 16 }}
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
                                            How it works
                                        </span>
                                        <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                                            {treatmentData.mechanism}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Indications */}
                            {treatmentData?.indications && treatmentData.indications.length > 0 && (
                                <section className="card col gap-3" style={{ padding: 28 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 03</span>
                                        <h2 className="display" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                            Common uses &amp; indications
                                        </h2>
                                    </div>
                                    <ul
                                        className="clean"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                            gap: 10,
                                        }}
                                    >
                                        {treatmentData.indications.map((indication, i) => (
                                            <li key={i} className="row gap-2 ai-baseline">
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 18 }}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{indication}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Side effects */}
                            {treatmentData?.sideEffects && treatmentData.sideEffects.length > 0 && (
                                <section
                                    className="col gap-3"
                                    style={{
                                        padding: 28,
                                        background: 'var(--orange-50)',
                                        border: '1px solid rgba(255, 90, 46, .22)',
                                        borderRadius: 'var(--r-4)',
                                    }}
                                >
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--orange-2)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 04</span>
                                        <h2 className="display" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                            Possible side effects
                                        </h2>
                                    </div>
                                    <ul className="clean col gap-2">
                                        {treatmentData.sideEffects.map((effect, i) => (
                                            <li key={i} className="row gap-2 ai-baseline">
                                                <span style={{ color: 'var(--orange-2)', fontSize: 13 }}>•</span>
                                                <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{effect}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.55 }}>
                                        This is not a complete list. Contact your healthcare provider if you experience any concerning symptoms.
                                    </p>
                                </section>
                            )}

                            {/* What to expect */}
                            <section className="card col gap-4" style={{ padding: 28 }}>
                                <div className="row gap-3 ai-baseline">
                                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 05</span>
                                    <h2 className="display" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                        What to expect
                                    </h2>
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                        gap: 0,
                                        border: '1px solid var(--rule)',
                                        borderRadius: 'var(--r-3)',
                                        background: 'var(--paper-2)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {[
                                        { l: 'Duration', v: treatmentData?.type === 'surgical' ? '1–4 hours' : treatmentData?.type === 'therapy' ? 'Multiple sessions' : 'Varies' },
                                        { l: 'Setting', v: treatmentData?.type === 'surgical' ? 'Hospital / clinic' : treatmentData?.type === 'home_remedy' ? 'Home' : 'Outpatient' },
                                        { l: 'Recovery', v: treatmentData?.type === 'surgical' ? 'Days to weeks' : treatmentData?.type === 'therapy' ? 'Progressive' : 'Varies' },
                                    ].map((s, i, arr) => (
                                        <div
                                            key={s.l}
                                            className="col gap-1"
                                            style={{
                                                padding: '16px 18px',
                                                borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
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
                                                {s.l}
                                            </span>
                                            <span style={{ fontSize: 14, fontWeight: 500 }}>{s.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Considerations */}
                            <section
                                className="col gap-3"
                                style={{
                                    padding: 28,
                                    background: 'var(--lemon-50)',
                                    border: '1px solid rgba(230, 185, 40, .35)',
                                    borderRadius: 'var(--r-4)',
                                }}
                            >
                                <div className="row gap-3 ai-baseline">
                                    <span className="num" style={{ fontSize: 14, color: '#8C6A00', fontWeight: 500, letterSpacing: '0.06em' }}>§ 06</span>
                                    <h2 className="display" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                        Important considerations
                                    </h2>
                                </div>
                                <ul className="clean col gap-2">
                                    {[
                                        'Always consult with a qualified healthcare provider before starting any treatment.',
                                        'Inform your doctor about all current medications and health conditions.',
                                        'Individual results may vary based on health status and other factors.',
                                        ...(treatmentData?.requiresPrescription ? ['This treatment requires a valid prescription from a licensed healthcare provider.'] : []),
                                    ].map((item, i) => (
                                        <li key={i} className="row gap-2 ai-baseline">
                                            <span style={{ color: '#8C6A00', fontSize: 13 }}>•</span>
                                            <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <aside className="col gap-3 v4-sticky-md" style={{ position: 'sticky', top: 96 }}>
                            <div className="card-ink col gap-3" style={{ padding: 22 }}>
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
                                    ● find specialists
                                </span>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', margin: 0, lineHeight: 1.5 }}>
                                    Connect with qualified {treatmentData?.specialty || 'healthcare'} specialists who provide this treatment.
                                </p>
                                <Link
                                    href={`/doctors?specialty=${encodeURIComponent(treatmentData?.specialty || '')}`}
                                    className="btn btn-cobalt"
                                    style={{ width: '100%' }}
                                >
                                    Find doctors near you →
                                </Link>
                            </div>

                            <div className="card col gap-3" style={{ padding: 22 }}>
                                <div className="kicker"><span className="dot" />medical travel</div>
                                <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5 }}>
                                    Save up to 70% on {treatmentName} by traveling to India, Thailand, or Turkey.
                                </p>
                                <Link
                                    href="/medical-travel/bot"
                                    className="btn btn-paper"
                                    style={{ width: '100%' }}
                                >
                                    Get free quote →
                                </Link>
                            </div>

                            {relatedTreatments.length > 0 && (
                                <div className="card col gap-3" style={{ padding: 22 }}>
                                    <div className="kicker"><span className="dot" />related treatments</div>
                                    <ul className="clean col gap-2">
                                        {relatedTreatments.map((t, i) => {
                                            const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                            return (
                                                <li key={i}>
                                                    <Link
                                                        href={`/${country}/${lang}/treatments/${slug}`}
                                                        className="row between ai-center"
                                                        style={{ padding: '4px 0' }}
                                                    >
                                                        <span style={{ fontSize: 13, color: 'var(--ink)' }}>{t.name}</span>
                                                        <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)' }}>→</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            <div className="card col gap-3" style={{ padding: 22 }}>
                                <div className="kicker"><span className="dot" />AI health analysis</div>
                                <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5 }}>
                                    Upload your medical reports for instant AI-powered insights.
                                </p>
                                <Link href="/analyze" className="btn btn-paper" style={{ width: '100%' }}>
                                    Analyze your reports →
                                </Link>
                            </div>

                            {treatmentData?.references && treatmentData.references.length > 0 && (
                                <div className="card col gap-3" style={{ padding: 22 }}>
                                    <div className="kicker"><span className="dot" />medical references</div>
                                    <ul className="clean col gap-2">
                                        {treatmentData.references.map((ref, i) => (
                                            <li key={i}>
                                                <a
                                                    href={ref.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ fontSize: 12, color: 'var(--cobalt)', lineHeight: 1.55 }}
                                                >
                                                    {ref.title} ↗
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="muted" style={{ fontSize: 11, margin: 0 }}>
                                        Sources verified by medical professionals.
                                    </p>
                                </div>
                            )}
                        </aside>
                    </div>

                    {/* FAQ */}
                    <section className="col gap-4">
                        <div className="row gap-3 ai-baseline">
                            <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 07</span>
                            <h2 className="display" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                Common questions
                            </h2>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                                gap: 16,
                            }}
                        >
                            {[
                                {
                                    q: `How much does ${treatmentName} cost?`,
                                    a: `Costs vary by country. In the USA, expect $${treatmentData?.costs?.usa?.range?.[0] || 'N/A'}–$${treatmentData?.costs?.usa?.range?.[1] || 'N/A'} USD. India offers significant savings at ${treatmentData?.costs?.india?.range?.[0] || 'N/A'}–${treatmentData?.costs?.india?.range?.[1] || 'N/A'} INR.`,
                                },
                                {
                                    q: `Is ${treatmentName} covered by insurance?`,
                                    a: 'Coverage depends on your insurance plan and medical necessity. Check with your provider for specific coverage details.',
                                },
                                {
                                    q: 'What is the recovery time?',
                                    a: 'Recovery varies based on individual factors and treatment type. Consult your healthcare provider for personalized estimates.',
                                },
                                {
                                    q: `Are there alternatives to ${treatmentName}?`,
                                    a: 'Yes, there may be alternative treatments available. Discuss all options with your doctor to find the best approach for your condition.',
                                },
                            ].map((faq) => (
                                <article key={faq.q} className="card" style={{ padding: 24 }}>
                                    <h3
                                        className="display"
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            margin: 0,
                                            letterSpacing: '-0.015em',
                                            marginBottom: 8,
                                        }}
                                    >
                                        {faq.q}
                                    </h3>
                                    <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                                        {faq.a}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <div className="row center">
                        <Link
                            href={`/${country}/${lang}/treatments`}
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: 500,
                            }}
                        >
                            ← {ui.browseAllTreatments}
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
