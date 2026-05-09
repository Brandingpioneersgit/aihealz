import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import TreatmentsExplorer, { type TreatmentType } from '@/components/ui/treatments-explorer';
import { normalizeSpecialty } from '@/lib/normalize-specialty';
import LanguageSwitcher from '@/components/ui/language-switcher';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { AIDiagnosisCTA, FindDoctorCTA, BookTestCTA } from '@/components/ui/cta-sections';

export const metadata: Metadata = {
    title: 'Medical Treatments, Drugs & Procedures Directory | Compare Costs Globally',
    description: 'Explore 10,000+ medical treatments with cost estimates across USA, UK, India, Thailand, Mexico, Turkey & UAE. Compare prescription drugs, surgical procedures, injections, home remedies, and therapy protocols. Find generic alternatives and save up to 90%.',
    keywords: 'medical treatments, prescription drugs, surgical procedures, treatment costs, home remedies, medical management, drug prices, injection therapy, generic drugs, brand name medications, OTC medications, therapy protocols, medical travel, surgery abroad, treatment comparison',
    openGraph: {
        title: 'Medical Treatments, Drugs & Procedures Directory',
        description: 'Explore 10,000+ medical treatments with cost estimates across 7 countries. Compare drug prices, find generics, and discover affordable treatment options worldwide.',
        url: 'https://aihealz.com/treatments',
        siteName: 'aihealz',
        type: 'website',
        images: [
            {
                url: 'https://aihealz.com/og/treatments-directory.jpg',
                width: 1200,
                height: 630,
                alt: 'aihealz Medical Treatments Directory - Compare costs across 7 countries',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Medical Treatments Directory | Compare Global Costs | aihealz',
        description: 'Browse 10,000+ treatments with cost comparisons across USA, UK, India, Thailand, Mexico, Turkey & UAE.',
        images: ['https://aihealz.com/og/treatments-directory.jpg'],
    },
    alternates: {
        canonical: 'https://aihealz.com/treatments',
        languages: {
            'en': 'https://aihealz.com/treatments',
            'es': 'https://aihealz.com/es/treatments',
            'hi': 'https://aihealz.com/hi/treatments',
            'ar': 'https://aihealz.com/ar/treatments',
        },
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

interface TreatmentCost {
    usd: number;
    currency: string;
    range?: [number, number];
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

const VALID_TYPES = new Set(['medical', 'surgical', 'otc', 'home_remedy', 'therapy', 'drug', 'injection', 'prescription']);

// Treatment type tiles — Bureau monogram style
const TREATMENT_TYPES: { type: string; label: string; abbr: string; description: string }[] = [
    { type: 'prescription', label: 'Prescription Drugs', abbr: 'RX', description: 'FDA-approved medications requiring a prescription' },
    { type: 'injection', label: 'Injectable Therapies', abbr: 'IN', description: 'Biologics, vaccines, and injectable medications' },
    { type: 'surgical', label: 'Surgical Procedures', abbr: 'SU', description: 'Minimally invasive and major surgical operations' },
    { type: 'therapy', label: 'Therapy & Rehabilitation', abbr: 'TH', description: 'Physical therapy, occupational therapy, rehabilitation' },
    { type: 'otc', label: 'OTC Medications', abbr: 'OT', description: 'Over-the-counter drugs available without prescription' },
    { type: 'home_remedy', label: 'Home Remedies', abbr: 'HR', description: 'Natural and traditional remedies for common ailments' },
];

// FAQs for both schema and visible display
const FAQS = [
    {
        question: 'What types of medical treatments are available?',
        answer: 'AIHealz covers prescription drugs, injectable medications, medical management, surgical procedures, over-the-counter (OTC) medications, home remedies, and therapy protocols including physical therapy and rehabilitation. Each treatment includes detailed information about what to expect, brand names, generic availability, and cost estimates.',
    },
    {
        question: 'How do I find treatment options for my condition?',
        answer: 'Use our search bar or browse by medical specialty. You can filter by treatment type (drugs, surgery, therapy) and compare costs across 7 countries. Each treatment page includes comprehensive information including brand names, generic options, and typical costs.',
    },
    {
        question: 'Can I compare treatment costs across different countries?',
        answer: 'Yes, AIHealz provides transparent cost estimates for treatments across USA, UK, India, Thailand, Mexico, Turkey, and UAE. Many surgical procedures can cost 50-90% less abroad while maintaining high quality standards. Use the country selector to view prices in your preferred currency.',
    },
    {
        question: 'What is the difference between brand name and generic drugs?',
        answer: 'Generic drugs contain the same active ingredients as brand-name medications and work the same way in your body. The main difference is price—generics are typically 80-85% cheaper because manufacturers don\'t have to repeat costly clinical trials. Look for the "Generic Available" badge on treatments to find cost-effective options.',
    },
    {
        question: 'How accurate are the treatment cost estimates?',
        answer: 'Our cost estimates are based on aggregated data from hospitals, pharmacies, and healthcare providers across each country. Prices are updated regularly and show typical ranges. Actual costs may vary based on your specific situation, insurance coverage, and chosen provider. For surgery abroad, our concierge service can provide exact quotes.',
    },
    {
        question: 'Is it safe to get medical treatment abroad?',
        answer: 'Many countries have world-class healthcare facilities with internationally trained doctors. India, Thailand, Turkey, and Mexico are popular medical tourism destinations with JCI-accredited hospitals. Our medical travel concierge helps verify credentials, arrange consultations, and coordinate your entire trip safely.',
    },
];

export default async function TreatmentsDirectory() {
    // Load treatments.json (10,000+ treatments with costs)
    const filePath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    let raw: TreatmentEntry[] = [];
    try {
        raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.error('Failed to load treatments.json:', e);
    }

    // Group by specialty, preserving all treatment data
    const specialtyMap: Record<string, Map<string, TreatmentEntry>> = {};

    raw.forEach(t => {
        const specialty = normalizeSpecialty(t.specialty);
        if (!specialtyMap[specialty]) specialtyMap[specialty] = new Map();
        const type = VALID_TYPES.has(t.type) ? t.type as TreatmentType : 'medical';
        const key = `${t.name.trim()}-${type}`;

        // Keep first occurrence with full data
        if (!specialtyMap[specialty].has(key)) {
            specialtyMap[specialty].set(key, {
                ...t,
                type,
                specialty,
            });
        }
    });

    const categories = Object.keys(specialtyMap)
        .sort()
        .map(specialty => ({
            specialty,
            treatments: Array.from(specialtyMap[specialty].values())
                .map(t => ({
                    name: t.name,
                    type: t.type as TreatmentType,
                    brandNames: t.brandNames,
                    genericAvailable: t.genericAvailable,
                    requiresPrescription: t.requiresPrescription,
                    description: t.description,
                    costs: t.costs,
                }))
                .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter(c => c.treatments.length > 0);

    const totalTreatments = categories.reduce((sum, c) => sum + c.treatments.length, 0);

    // Count by type
    const typeCounts = raw.reduce((acc, t) => {
        const type = VALID_TYPES.has(t.type) ? t.type : 'medical';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Read geo context from middleware headers
    const hdrs = await headers();
    const country = hdrs.get('x-aihealz-country');
    const city = hdrs.get('x-aihealz-city');
    const lang = hdrs.get('x-aihealz-lang') || 'en';
    const regionalLang = hdrs.get('x-aihealz-regional-lang');
    const regionalDisplay = hdrs.get('x-aihealz-regional-display');

    // ─── STRUCTURED DATA SCHEMAS ────────────────────────────────

    // 1. Breadcrumb Schema
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://aihealz.com',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Medical Treatments Directory',
                item: 'https://aihealz.com/treatments',
            },
        ],
    };

    // 2. Medical Web Page Schema with Speakable
    const treatmentsSchema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: 'Medical Treatments, Drugs & Procedures Directory',
        headline: 'Compare Medical Treatment Costs Across 7 Countries',
        description: `Explore ${totalTreatments.toLocaleString()}+ medical treatments with cost estimates across USA, UK, India, Thailand, Mexico, Turkey & UAE. Compare prescription drugs, surgical procedures, and find generic alternatives.`,
        url: 'https://aihealz.com/treatments',
        datePublished: '2024-01-01T00:00:00Z',
        dateModified: new Date().toISOString(),
        inLanguage: 'en',
        isPartOf: {
            '@type': 'WebSite',
            '@id': 'https://aihealz.com/#website',
            name: 'aihealz',
            url: 'https://aihealz.com',
        },
        about: {
            '@type': 'MedicalEntity',
            name: 'Medical Treatments',
            description: 'Comprehensive directory of medical treatments including drugs, surgeries, therapies, and home remedies',
        },
        audience: {
            '@type': 'MedicalAudience',
            audienceType: 'Patient',
            healthCondition: {
                '@type': 'MedicalCondition',
                name: 'Various medical conditions',
            },
        },
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', 'article p', '.treatment-description', '.faq-answer'],
        },
        mainEntity: {
            '@type': 'ItemList',
            name: 'Medical Treatment Categories by Specialty',
            numberOfItems: categories.length,
            itemListElement: categories.slice(0, 20).map((cat, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'MedicalSpecialty',
                    name: cat.specialty,
                    description: `${cat.treatments.length} treatments in ${cat.specialty}`,
                    url: `https://aihealz.com/treatments?specialty=${encodeURIComponent(cat.specialty)}`,
                },
            })),
        },
    };

    // 3. FAQ Schema
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    // 4. Organization Schema
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://aihealz.com/#organization',
        name: 'aihealz',
        url: 'https://aihealz.com',
        logo: 'https://aihealz.com/logo.png',
        description: 'World\'s first and biggest multilingual healthcare content platform with 70,000+ conditions and treatments across 18+ countries.',
        sameAs: [
            'https://twitter.com/aihealz',
            'https://linkedin.com/company/aihealz',
            'https://facebook.com/aihealz',
        ],
    };

    // 5. Treatment Types as ItemList
    const treatmentTypesSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Types of Medical Treatments',
        description: 'Categories of medical treatments available on aihealz',
        numberOfItems: TREATMENT_TYPES.length,
        itemListElement: TREATMENT_TYPES.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'MedicalTherapy',
                name: t.label,
                description: t.description,
                url: `https://aihealz.com/treatments?type=${t.type}`,
            },
        })),
    };

    return (
        <>
            <Script
                id="breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <Script
                id="treatments-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(treatmentsSchema) }}
            />
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <Script
                id="treatment-types-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(treatmentTypesSchema) }}
            />

            <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
                {/* Language Switcher Banner */}
                <LanguageSwitcher
                    country={country}
                    city={city}
                    lang={lang}
                    regionalLang={regionalLang}
                    regionalDisplay={regionalDisplay}
                />

                <div
                    style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 28px 80px' }}
                    className="col gap-7"
                >
                    {/* ── Hero ──────────────────────────────── */}
                    <header className="col gap-4">
                        <div
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
                            <span style={{ color: 'var(--ink)' }}>Treatments Directory</span>
                        </div>

                        <span className="section-mark">the index / by treatment</span>

                        <h1
                            className="display"
                            style={{
                                fontSize: 'clamp(40px, 7vw, 88px)',
                                lineHeight: 0.95,
                                letterSpacing: '-0.045em',
                                margin: 0,
                                fontWeight: 600,
                            }}
                        >
                            <span className="num" style={{ color: 'var(--cobalt)', fontWeight: 600 }}>
                                {totalTreatments.toLocaleString()}
                            </span>{' '}
                            treatments
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>

                        <p
                            className="lede treatment-description"
                            style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 680 }}
                        >
                            Drugs, surgeries, injections, therapies, home remedies — cost compared across seven countries. Find generic alternatives and save up to 90% on procedures abroad.
                        </p>

                        <div style={{ maxWidth: 720 }}>
                            <SearchAutocomplete
                                variant="bureau"
                                placeholder="Search treatments, drugs, procedures…"
                                typeFilter="treatment"
                            />
                        </div>
                    </header>

                    {/* ── Stats strip ──────────────────────────── */}
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
                            { v: totalTreatments.toLocaleString(), l: 'treatments indexed' },
                            { v: categories.length.toLocaleString(), l: 'specialties' },
                            { v: '7', l: 'countries · cost mapped' },
                            { v: '90%', l: 'potential savings' },
                        ].map((s, i, arr) => (
                            <div
                                key={s.l}
                                className="col gap-1"
                                style={{
                                    padding: '20px 24px',
                                    borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                }}
                            >
                                <div
                                    className="display num"
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 500,
                                        letterSpacing: '-0.025em',
                                        lineHeight: 1,
                                        color: 'var(--ink)',
                                    }}
                                >
                                    {s.v}
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
                                    {s.l}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── AI Diagnosis CTA ─────────────────────── */}
                    <AIDiagnosisCTA
                        variant="inline"
                        title="Not sure which treatment you need?"
                        subtitle="Drop your symptoms or lab report — we'll narrow this list to the treatments most likely to help."
                    />

                    {/* ── Browse by Treatment Type ─────────────── */}
                    <section className="col gap-4" aria-labelledby="treatment-types-heading">
                        <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <h2
                                id="treatment-types-heading"
                                className="display"
                                style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                            >
                                Browse by treatment type
                            </h2>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {TREATMENT_TYPES.length} categories
                            </span>
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
                            {TREATMENT_TYPES.map((t, i) => {
                                const cols = 3;
                                const isLastCol = (i + 1) % cols === 0;
                                const isLastRow = i >= TREATMENT_TYPES.length - cols;
                                return (
                                    <Link
                                        key={t.type}
                                        href={`/treatments?type=${t.type}`}
                                        className="col gap-3"
                                        style={{
                                            padding: '20px 22px',
                                            borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                            borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="row between ai-center">
                                            <div className="spec-icon">{t.abbr}</div>
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--ink-3)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                {(typeCounts[t.type] || 0).toLocaleString()} options
                                            </span>
                                        </div>
                                        <div>
                                            <div
                                                className="display"
                                                style={{
                                                    fontSize: 18,
                                                    letterSpacing: '-0.02em',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {t.label}
                                            </div>
                                            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                                                {t.description}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* ── Browse by Specialty ──────────────────── */}
                    <section className="col gap-4" aria-labelledby="specialties-heading">
                        <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <h2
                                id="specialties-heading"
                                className="display"
                                style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                            >
                                Browse by specialty
                            </h2>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {categories.length} specialties
                            </span>
                        </div>

                        <div
                            className="row gap-2"
                            style={{ flexWrap: 'wrap' }}
                        >
                            {categories.slice(0, 18).map(cat => (
                                <Link
                                    key={cat.specialty}
                                    href={`/treatments?specialty=${encodeURIComponent(cat.specialty)}`}
                                    className="pill"
                                    style={{ textTransform: 'none', cursor: 'pointer' }}
                                >
                                    {cat.specialty}
                                    <span className="mono muted" style={{ marginLeft: 6 }}>
                                        {cat.treatments.length}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* ── Interactive Explorer ─────────────────── */}
                    <article aria-labelledby="explorer-heading">
                        <h2 id="explorer-heading" className="sr-only">Browse all treatments</h2>
                        <TreatmentsExplorer categories={categories} defaultCountry={country} />
                    </article>

                    {/* ── Medical Travel CTA — dark ink card ──── */}
                    <section
                        className="card-ink"
                        style={{ padding: 'clamp(28px, 4vw, 48px)' }}
                        aria-labelledby="medical-travel-heading"
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
                                    concierge medical travel
                                </span>
                                <h3
                                    id="medical-travel-heading"
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
                                    Same surgery, <span style={{ color: 'var(--cobalt-3)' }}>a fraction of the bill</span><span style={{ color: 'var(--orange)' }}>.</span>
                                </h3>
                                <p
                                    style={{
                                        fontSize: 16,
                                        color: 'rgba(255,255,255,.7)',
                                        lineHeight: 1.55,
                                        maxWidth: 540,
                                        margin: 0,
                                    }}
                                >
                                    Save 50–90% on surgeries abroad. Our concierge matches you with JCI-accredited hospitals, negotiates exact costs, and handles your entire itinerary end-to-end.
                                </p>
                            </div>
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                <Link href="/medical-travel/bot" className="btn btn-cobalt btn-lg">
                                    Build your estimate →
                                </Link>
                                <Link
                                    href="/medical-travel"
                                    className="btn btn-lg"
                                    style={{
                                        background: 'rgba(255,255,255,.08)',
                                        color: 'var(--paper)',
                                        borderColor: 'rgba(255,255,255,.15)',
                                    }}
                                >
                                    Learn more
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* ── Feature info cards ───────────────────── */}
                    <section
                        aria-labelledby="features-heading"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}
                    >
                        <h2 id="features-heading" className="sr-only">Treatment directory features</h2>

                        <article className="card col gap-3" style={{ padding: 24 }}>
                            <div className="kicker">
                                <span className="dot" />
                                cost transparency
                            </div>
                            <h3
                                className="display"
                                style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                            >
                                Compare costs globally
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
                                Treatment costs across USA, UK, India, Thailand, Mexico, Turkey, and UAE. Find savings of up to 90% on procedures abroad with transparent pricing.
                            </p>
                        </article>

                        <article className="card col gap-3" style={{ padding: 24 }}>
                            <div className="kicker">
                                <span className="dot" style={{ background: 'var(--mint)' }} />
                                savings
                            </div>
                            <h3
                                className="display"
                                style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                            >
                                Generic alternatives
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
                                Find FDA-approved generic drugs that cost 80–85% less than brand names. Look for the &ldquo;Generic Available&rdquo; badge on medications.
                            </p>
                        </article>

                        <article className="card col gap-3" style={{ padding: 24 }}>
                            <div className="kicker">
                                <span className="dot" style={{ background: 'var(--lemon-2)' }} />
                                verified
                            </div>
                            <h3
                                className="display"
                                style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                            >
                                Verified information
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
                                All drug information includes brand names, prescription requirements, and is regularly updated from trusted medical databases and sources.
                            </p>
                        </article>
                    </section>

                    {/* ── FAQ ──────────────────────────────────── */}
                    <section className="col gap-4" aria-labelledby="faq-heading">
                        <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <h2
                                id="faq-heading"
                                className="display"
                                style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                            >
                                Common questions
                            </h2>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {FAQS.length} answered
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: 16,
                            }}
                        >
                            {FAQS.map(faq => (
                                <article key={faq.question} className="card" style={{ padding: 24 }}>
                                    <h3
                                        className="display"
                                        style={{
                                            fontSize: 17,
                                            fontWeight: 600,
                                            margin: 0,
                                            letterSpacing: '-0.015em',
                                            marginBottom: 8,
                                        }}
                                    >
                                        {faq.question}
                                    </h3>
                                    <p
                                        className="faq-answer"
                                        style={{
                                            fontSize: 14,
                                            color: 'var(--ink-2)',
                                            lineHeight: 1.6,
                                            margin: 0,
                                        }}
                                    >
                                        {faq.answer}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* ── Find Doctor / Book Test CTAs ─────────── */}
                    <FindDoctorCTA variant="banner" />
                    <BookTestCTA variant="card" />

                    {/* ── Related directories ──────────────────── */}
                    <section
                        aria-labelledby="related-heading"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 16,
                        }}
                    >
                        <h2 id="related-heading" className="sr-only">Explore more health resources</h2>
                        {[
                            {
                                href: '/conditions',
                                kicker: 'conditions',
                                title: 'Medical conditions',
                                blurb: '70,000+ conditions A–Z with plain-English explainers.',
                            },
                            {
                                href: '/symptoms',
                                kicker: 'symptoms',
                                title: 'AI symptom checker',
                                blurb: 'Get AI-powered insights on what your symptoms mean.',
                            },
                            {
                                href: '/reference/drugs',
                                kicker: 'drugs',
                                title: 'Drug reference',
                                blurb: 'Dosages, interactions, and pharmacology details.',
                            },
                            {
                                href: '/doctors',
                                kicker: 'doctors',
                                title: 'Find a specialist',
                                blurb: 'Verified doctors across 50+ countries.',
                            },
                        ].map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="card col gap-3"
                                style={{ padding: 24 }}
                            >
                                <div className="kicker">
                                    <span className="dot" />
                                    {item.kicker}
                                </div>
                                <h3
                                    className="display"
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 600,
                                        margin: 0,
                                        letterSpacing: '-0.025em',
                                    }}
                                >
                                    {item.title}
                                </h3>
                                <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.55 }}>
                                    {item.blurb}
                                </p>
                                <span
                                    className="mono"
                                    style={{
                                        marginTop: 'auto',
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                    }}
                                >
                                    Browse →
                                </span>
                            </Link>
                        ))}
                    </section>

                    {/* ── Bottom SEO note ──────────────────────── */}
                    <p
                        className="muted"
                        style={{
                            fontSize: 13,
                            lineHeight: 1.65,
                            margin: 0,
                            maxWidth: 880,
                        }}
                    >
                        The aihealz Medical Treatments Directory is the world&apos;s most comprehensive resource for comparing healthcare costs globally. Whether you&apos;re looking for prescription medications, surgical procedures, injectable therapies, or natural home remedies, our database covers {totalTreatments.toLocaleString()}+ treatment options across {categories.length} medical specialties. Compare costs across USA, UK, India, Thailand, Mexico, Turkey, and UAE to make informed healthcare decisions. All information is regularly updated and verified from trusted medical sources.
                    </p>
                </div>
            </main>
        </>
    );
}
