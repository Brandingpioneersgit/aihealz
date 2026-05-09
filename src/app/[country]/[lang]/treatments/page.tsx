import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TreatmentsExplorer, { type TreatmentType } from '@/components/ui/treatments-explorer';
import { normalizeSpecialty } from '@/lib/normalize-specialty';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { isRTL, getLanguageConfig, getUITranslations } from '@/lib/i18n';
import { COUNTRIES, buildAlternateLanguages } from '@/lib/countries';

/**
 * Localized Treatments Directory Page
 * Renders treatments in the user's regional language with RTL support.
 * Route: /[country]/[lang]/treatments
 */

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
    costs?: Record<string, TreatmentCost>;
}

const VALID_TYPES = new Set(['medical', 'surgical', 'otc', 'home_remedy', 'therapy', 'drug', 'injection', 'prescription']);

function validateParams(country: string, lang: string): boolean {
    const validCountry = COUNTRIES.find(c => c.slug === country || c.code.toLowerCase() === country);
    if (!validCountry) return false;

    const countryConfig = getLanguageConfig(lang);
    return !!countryConfig;
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ country: string; lang: string }>
}): Promise<Metadata> {
    const { country, lang } = await params;
    const ui = getUITranslations(lang);
    const dir = isRTL(lang) ? 'rtl' : 'ltr';

    const countryName = COUNTRIES.find(c => c.slug === country)?.name || country;

    const title = lang === 'en'
        ? `Medical Treatments Directory | ${countryName} | AIHealz`
        : `${ui.treatments} | ${countryName} | AIHealz`;

    const description = lang === 'en'
        ? `Explore 10,000+ medical treatments with cost estimates in ${countryName}. Compare prescription drugs, surgical procedures, and find generic alternatives.`
        : `${countryName} में 10,000+ चिकित्सा उपचार खोजें। दवाओं, सर्जरी और जेनेरिक विकल्पों की तुलना करें।`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://aihealz.com/${country}/${lang}/treatments`,
            languages: buildAlternateLanguages(country, '/treatments'),
        },
        openGraph: {
            title,
            description,
            locale: `${lang}_${country.toUpperCase()}`,
            type: 'website',
        },
        other: {
            'content-language': lang,
            dir,
        },
    };
}

export default async function LocalizedTreatmentsDirectory({
    params
}: {
    params: Promise<{ country: string; lang: string }>
}) {
    const { country, lang } = await params;

    if (!validateParams(country, lang)) {
        notFound();
    }

    const ui = getUITranslations(lang);
    const langConfig = getLanguageConfig(lang);
    const dir = isRTL(lang) ? 'rtl' : 'ltr';

    // Load treatments.json
    const filePath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    let raw: TreatmentEntry[] = [];
    try {
        raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.error('Failed to load treatments.json:', e);
    }

    // Group by specialty
    const specialtyMap: Record<string, Map<string, TreatmentEntry>> = {};

    raw.forEach(t => {
        const specialty = normalizeSpecialty(t.specialty);
        if (!specialtyMap[specialty]) specialtyMap[specialty] = new Map();
        const type = VALID_TYPES.has(t.type) ? t.type as TreatmentType : 'medical';
        const key = `${t.name.trim()}-${type}`;

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
                    costs: t.costs as {
                        usa: TreatmentCost;
                        uk: TreatmentCost;
                        india: TreatmentCost;
                        thailand: TreatmentCost;
                        mexico: TreatmentCost;
                        turkey: TreatmentCost;
                        uae: TreatmentCost;
                    } | undefined,
                }))
                .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter(c => c.treatments.length > 0);

    const totalTreatments = categories.reduce((sum, c) => sum + c.treatments.length, 0);

    const TREATMENT_TYPES = [
        { type: 'prescription', abbr: 'RX', label: ui.prescriptionDrug },
        { type: 'injection', abbr: 'IN', label: ui.injectableTreatment },
        { type: 'surgical', abbr: 'SU', label: ui.surgicalProcedure },
        { type: 'therapy', abbr: 'TH', label: ui.therapy },
        { type: 'otc', abbr: 'OT', label: ui.otcMedication },
        { type: 'home_remedy', abbr: 'HR', label: ui.homeRemedy },
    ];

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: ui.home, item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: ui.treatments, item: `https://aihealz.com/${country}/${lang}/treatments` },
        ],
    };

    const countryName = COUNTRIES.find(c => c.slug === country)?.name || country;

    return (
        <>
            <Script
                id="breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <main
                dir={dir}
                lang={lang}
                style={{ background: 'var(--bg)', color: 'var(--ink)' }}
            >
                <div
                    style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 28px 80px' }}
                    className="col gap-7"
                >
                    {/* Language indicator */}
                    {lang !== 'en' && (
                        <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                            <span className="pill pill-cobalt" style={{ textTransform: 'none' }}>
                                {langConfig.nativeName}
                            </span>
                            <Link
                                href={`/${country}/en/treatments`}
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
                        }}
                        aria-label="Breadcrumb"
                    >
                        <Link href="/">{ui.home}</Link>
                        <span>/</span>
                        <span style={{ color: 'var(--ink)' }}>{ui.treatments}</span>
                    </nav>

                    {/* Hero */}
                    <header className="col gap-4">
                        <span className="section-mark">treatments · {countryName}</span>
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
                            {ui.treatments.toLowerCase()}
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 680 }}>
                            {lang === 'en'
                                ? `Browse ${totalTreatments.toLocaleString()}+ treatments with cost estimates across 7 countries.`
                                : lang === 'hi'
                                    ? `7 देशों में ${totalTreatments.toLocaleString()}+ उपचार की लागत के साथ ब्राउज़ करें।`
                                    : lang === 'ar'
                                        ? `تصفح ${totalTreatments.toLocaleString()}+ علاج مع تقديرات التكلفة في 7 دول.`
                                        : lang === 'ta'
                                            ? `7 நாடுகளில் ${totalTreatments.toLocaleString()}+ சிகிச்சைகளை செலவு மதிப்பீடுகளுடன் உலாவுங்கள்.`
                                            : `${totalTreatments.toLocaleString()}+ ${ui.treatments}`}
                        </p>
                        <div style={{ maxWidth: 720 }}>
                            <SearchAutocomplete
                                variant="bureau"
                                placeholder={ui.searchPlaceholder}
                            />
                        </div>
                    </header>

                    {/* Stats */}
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
                            { v: totalTreatments.toLocaleString(), l: ui.treatments },
                            { v: categories.length.toLocaleString(), l: lang === 'hi' ? 'विशेषताएं' : lang === 'ar' ? 'التخصصات' : 'Specialties' },
                            { v: '7', l: lang === 'hi' ? 'देश' : lang === 'ar' ? 'الدول' : 'Countries' },
                            { v: '90%', l: ui.potentialSavings },
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
                                        fontSize: 28,
                                        fontWeight: 500,
                                        letterSpacing: '-0.025em',
                                        lineHeight: 1,
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

                    {/* Treatment types */}
                    <section className="col gap-4">
                        <h2
                            className="display"
                            style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                        >
                            {lang === 'en' ? 'Browse by treatment type' : lang === 'hi' ? 'उपचार प्रकार के अनुसार ब्राउज़ करें' : lang === 'ar' ? 'تصفح حسب نوع العلاج' : 'Browse by type'}
                        </h2>
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
                                        href={`/${country}/${lang}/treatments?type=${t.type}`}
                                        className="col gap-3"
                                        style={{
                                            padding: '20px 22px',
                                            borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                            borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                        }}
                                    >
                                        <div className="spec-icon">{t.abbr}</div>
                                        <div
                                            className="display"
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 500,
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            {t.label}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Interactive Explorer */}
                    <article>
                        <h2 className="sr-only">{ui.browseAllTreatments}</h2>
                        <TreatmentsExplorer
                            categories={categories}
                            defaultCountry={country}
                            lang={lang}
                            baseUrl={`/${country}/${lang}/treatments`}
                        />
                    </article>

                    {/* Back to global treatments */}
                    <div className="row center">
                        <Link
                            href="/treatments"
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
