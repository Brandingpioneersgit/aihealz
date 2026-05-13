import React, { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stitchPageData, PageData } from '@/lib/content-engine';
import { getConditionPageTranslations } from '@/lib/i18n-db';
import { generateHreflangTags } from '@/lib/hreflang';
import { generatePageSchemas, generateBreadcrumbSchema } from '@/lib/schema-markup';
import Link from 'next/link';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { TableOfContents } from '@/components/ui/table-of-contents';
import { TranslateTrigger } from '@/components/translate-trigger';

// Deduplicate stitchPageData calls within the same request
const getCachedPageData = cache(
    (lang: string, condition: string, geoSlugs: string[]) =>
        stitchPageData(lang, condition, geoSlugs)
);

const getCachedTranslations = cache(
    (lang: string) => getConditionPageTranslations(lang)
);

/**
 * Convert specialty name to plural specialist title.
 * e.g., "Endocrinology" → "Endocrinologists", "Cardiologist" → "Cardiologists"
 */
function pluralizeSpecialist(specialistType: string | null | undefined): string {
    if (!specialistType) return 'Specialists';
    const type = specialistType.trim();
    if (type.toLowerCase().endsWith('ology')) {
        return type.slice(0, -5) + 'ologists';
    }
    if (type.toLowerCase().endsWith('ist')) {
        return type + 's';
    }
    if (type.toLowerCase().endsWith('ian')) {
        return type + 's';
    }
    return type + 's';
}

/**
 * Get the correct article ("a" or "an").
 */
function getArticle(word: string | null | undefined): string {
    if (!word) return 'a';
    const firstChar = word.trim().toLowerCase().charAt(0);
    if (['a', 'e', 'i', 'o', 'u'].includes(firstChar)) {
        return 'an';
    }
    if (word.toLowerCase().startsWith('hour')) {
        return 'an';
    }
    return 'a';
}

/**
 * Expand common ICD abbreviations to user-friendly text.
 */
function expandIcdAbbreviations(text: string | null | undefined): string {
    if (!text) return '';

    return text
        .replace(/\bw\b/gi, 'with')
        .replace(/\bw\/o\b/gi, 'without')
        .replace(/\bw\/\b/gi, 'with')
        .replace(/\bhyprosm\b/gi, 'hyperosmolarity')
        .replace(/\bhypergl\b/gi, 'hyperglycemia')
        .replace(/\bhypogl\b/gi, 'hypoglycemia')
        .replace(/\bketoacid\b/gi, 'ketoacidosis')
        .replace(/\bunsp\b/gi, 'unspecified')
        .replace(/\bNEC\b/g, '')
        .replace(/\bNOS\b/g, '')
        .replace(/\bOTH\b/gi, 'other')
        .replace(/\bspec\b/gi, 'specific')
        .replace(/\bdz\b/gi, 'disease')
        .replace(/\bcond\b/gi, 'condition')
        .replace(/\bmanif\b/gi, 'manifestation')
        .replace(/\bcomp\b/gi, 'complication')
        .replace(/\bprim\b/gi, 'primary')
        .replace(/\bsec\b/gi, 'secondary')
        .replace(/\bmult\b/gi, 'multiple')
        .replace(/\bperiphrl\b/gi, 'peripheral')
        .replace(/\bneuro\b/gi, 'neurological')
        .replace(/\bophthal\b/gi, 'ophthalmic')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/**
 * Filter treatments that are clearly mismatched for a condition.
 */
function filterMismatchedTreatments(
    treatments: string[],
    specialistType: string | null,
    conditionName?: string | null
): string[] {
    if (!treatments || treatments.length === 0) return [];

    const specialtyLower = (specialistType || '').toLowerCase();
    const conditionLower = (conditionName || '').toLowerCase();

    const thyroidTreatments = [
        'thyroidectomy', 'parathyroidectomy', 'thyroid hormone', 'levothyroxine',
        'methimazole', 'antithyroid', 'radioactive iodine', 'propylthiouracil'
    ];

    const isThyroidCondition =
        conditionLower.includes('thyroid') ||
        conditionLower.includes('goiter') ||
        conditionLower.includes('graves') ||
        conditionLower.includes('hashimoto');

    const isDiabetesCondition =
        conditionLower.includes('diabetes') ||
        conditionLower.includes('diabetic') ||
        conditionLower.includes('hyperglycemia') ||
        conditionLower.includes('insulin');

    let exclusionList: string[] = [];

    if (isDiabetesCondition && !isThyroidCondition) {
        exclusionList = [...exclusionList, ...thyroidTreatments];
    }

    if (!specialtyLower.includes('endocrin') && !isThyroidCondition) {
        exclusionList = [...exclusionList, ...thyroidTreatments];
    }

    if (specialtyLower.includes('cardio') || conditionLower.includes('heart')) {
        exclusionList = [...exclusionList, 'thyroidectomy', 'parathyroidectomy', 'gastrectomy'];
    }

    if (specialtyLower.includes('orthop') || conditionLower.includes('bone') || conditionLower.includes('joint')) {
        exclusionList = [...exclusionList, 'thyroidectomy', 'parathyroidectomy', 'chemotherapy', 'dialysis'];
    }

    if (exclusionList.length === 0) return treatments;

    return treatments.filter(treatment => {
        const treatmentLower = treatment.toLowerCase();
        return !exclusionList.some(exclusion =>
            treatmentLower.includes(exclusion.toLowerCase())
        );
    });
}

/**
 * Filter automated medical treatments that don't belong to this condition.
 */
function filterAutomatedTreatments<T extends { name: string }>(
    treatments: T[] | null,
    specialistType: string | null,
    conditionName?: string | null
): T[] {
    if (!treatments || treatments.length === 0) return [];

    const treatmentNames = treatments.map(t => t.name);
    const filteredNames = filterMismatchedTreatments(treatmentNames, specialistType, conditionName);

    return treatments.filter(t => filteredNames.includes(t.name));
}

interface PageProps {
    params: Promise<{
        country: string;
        lang: string;
        condition: string;
        geo?: string[];
    }>;
}

export const revalidate = 3600;

// ─── Dynamic Metadata ───────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country, lang, condition, geo } = await params;
    const geoSlugs = [country, ...(geo || [])];
    const data = await getCachedPageData(lang, condition, geoSlugs);

    if (!data) return { title: 'Not Found' };

    const deepestGeo = data.geoChain.locality || data.geoChain.city || data.geoChain.state || data.geoChain.country;
    const locationName = deepestGeo?.name || '';
    const conditionName = data.condition.commonName;

    const metaTitle = data.automatedContent?.metaTitle || data.automatedContent?.h1Title || data.localContent?.metaTitle ||
        `${conditionName} Treatment in ${locationName} | aihealz`;

    const metaDescription = data.automatedContent?.metaDescription ||
        (data.automatedContent?.heroOverview ? data.automatedContent.heroOverview.substring(0, 155) + '...' : null) ||
        data.localContent?.metaDescription ||
        `Find the best ${pluralizeSpecialist(data.condition.specialistType)} for ${conditionName} treatment in ${locationName}. Verified specialists, patient reviews, and appointment booking.`;

    const hreflangTags = generateHreflangTags(condition, data.geoChain, lang, data.availableLanguages);
    const urlPath = `/${country}/${lang}/${condition}${geo ? '/' + geo.join('/') : ''}`;

    // When this slug is a variant being served via canonical fallback, the
    // canonical URL points at the canonical slug — Google consolidates SEO
    // signal there. The user-facing URL stays intact.
    const canonicalPath = data.isVariantFallback && data.canonicalSlug
        ? `/${country}/${lang}/${data.canonicalSlug}${geo ? '/' + geo.join('/') : ''}`
        : urlPath;
    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${canonicalPath}`;

    const symptomsSnippet = (data.automatedContent?.primarySymptoms || data.condition.symptoms || []).slice(0, 5).join(', ');
    const treatmentsSnippet = (data.condition.treatments || []).slice(0, 4).join(', ');
    const prevalenceSnippet = data.automatedContent?.keyStats?.prevalence || '';
    const specialistSnippet = data.condition.specialistType || 'Specialist';

    const llmSummary = [
        `${conditionName}${data.condition.icdCode ? ` (ICD-10: ${data.condition.icdCode})` : ''} is ${data.automatedContent?.definition?.split('. ').slice(0, 1).join('') || `a medical condition treated by a ${specialistSnippet}`}.`,
        prevalenceSnippet ? `Prevalence: ${prevalenceSnippet}.` : '',
        symptomsSnippet ? `Key symptoms include ${symptomsSnippet}.` : '',
        treatmentsSnippet ? `Treatment options: ${treatmentsSnippet}.` : '',
        `Specialist: ${specialistSnippet}.`,
        locationName ? `This page covers ${conditionName} care in ${locationName}.` : '',
    ].filter(Boolean).join(' ');

    const aeoDescription = data.automatedContent?.metaDescription || metaDescription;

    return {
        title: metaTitle,
        description: aeoDescription,
        other: {
            'llm-summary': llmSummary,
            ...(data.reviewer?.name ? { 'reviewed-by': data.reviewer.name } : {}),
            ...(data.reviewer?.reviewDate ? { 'last-reviewed': new Date(data.reviewer.reviewDate).toISOString() } : {}),
            'medical-condition': conditionName,
            ...(data.condition.icdCode ? { 'icd-10-code': data.condition.icdCode } : {}),
            'specialist-type': specialistSnippet,
            ...(prevalenceSnippet ? { 'condition-prevalence': prevalenceSnippet } : {}),
            ...(data.automatedContent?.lastReviewed ? { 'content-last-verified': new Date(data.automatedContent.lastReviewed).toISOString() } : {}),
            ...(data.automatedContent?.sources?.length ? { 'citation-count': String(data.automatedContent.sources.length) } : {}),
        },
        openGraph: {
            title: metaTitle,
            description: aeoDescription,
            url: canonicalUrl,
            siteName: 'aihealz',
            type: 'article',
            locale: lang,
            images: data.featureImage ? [{
                url: data.featureImage,
                width: 1200,
                height: 630,
                alt: `Medical illustration of ${conditionName}`,
            }] : undefined,
        },
        alternates: {
            canonical: canonicalUrl,
            languages: Object.fromEntries(hreflangTags.map(tag => [tag.hreflang, tag.href])),
        },
        robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' as const, 'max-video-preview': -1 },
    };
}

// Severity → Bureau pill class
function severityPillClass(severity: string | null | undefined): string {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'pill-orange';
    if (s === 'severe' || s === 'high') return 'pill-orange';
    if (s === 'moderate' || s === 'medium') return 'pill-lemon';
    if (s === 'mild' || s === 'low') return 'pill-mint';
    return 'pill';
}

// ─── Page Component ─────────────────────────────────────────

export default async function ConditionPage({ params }: PageProps) {
    const { country, lang, condition, geo } = await params;
    const geoSlugs = [country, ...(geo || [])];
    const rawData = await getCachedPageData(lang, condition, geoSlugs);

    if (!rawData) notFound();

    const data = rawData as PageData;

    const heroOverviewText: string | null = expandIcdAbbreviations(data.automatedContent?.heroOverview) || null;
    const definitionText: string | null = expandIcdAbbreviations(data.automatedContent?.definition) || null;
    const cleanConditionName = expandIcdAbbreviations(data.condition.commonName);

    const t = await getCachedTranslations(lang);
    const urlPath = `/${country}/${lang}/${condition}${geo ? '/' + geo.join('/') : ''}`;
    const allDoctors = [...data.doctors.premium, ...data.doctors.free];

    // Schema - use pre-generated or generate dynamically
    const faqsForSchema = (data.automatedContent?.faqs?.map(faq => ({
        question: faq.question,
        answer: faq.answer
    })) || []).slice(0, 5);

    let schemas: string;
    if (data.automatedContent?.schemaMedicalCondition && data.automatedContent?.schemaFaqPage) {
        const allSchemas = [
            data.automatedContent.schemaMedicalCondition,
            data.automatedContent.schemaFaqPage,
            generateBreadcrumbSchema(lang, data.condition.commonName, condition, data.geoChain),
        ];
        schemas = JSON.stringify(allSchemas);
    } else {
        schemas = generatePageSchemas(
            {
                scientificName: data.condition.scientificName,
                commonName: data.condition.commonName,
                description: data.automatedContent?.definition || data.condition.description || '',
                symptoms: data.automatedContent?.primarySymptoms || data.condition.symptoms || [],
                treatments: data.condition.treatments || [],
                specialistType: data.condition.specialistType,
                icdCode: data.condition.icdCode || undefined,
            },
            data.reviewer,
            allDoctors.map(d => ({
                name: d.name,
                slug: d.slug,
                qualifications: d.qualifications,
                rating: d.rating || undefined,
                reviewCount: d.reviewCount,
                consultationFee: d.consultationFee || undefined,
                feeCurrency: d.feeCurrency,
                profileImage: d.profileImage || undefined,
            })),
            data.geoChain,
            lang,
            urlPath,
            {
                faqs: faqsForSchema.length > 0 ? faqsForSchema : undefined,
                featureImage: data.featureImage || undefined,
                prevalence: data.automatedContent?.keyStats?.prevalence || undefined,
                demographics: data.automatedContent?.keyStats?.demographics || undefined,
                causes: data.automatedContent?.causes || undefined,
                riskFactors: data.automatedContent?.riskFactors || undefined,
                diagnosticTests: data.automatedContent?.diagnosticTests || undefined,
                prognosis: data.automatedContent?.prognosis || undefined,
                sources: data.automatedContent?.sources || undefined,
            }
        );
    }

    const hreflangTags = generateHreflangTags(condition, data.geoChain, lang, data.availableLanguages);
    const deepestGeo = data.geoChain.locality || data.geoChain.city || data.geoChain.state || data.geoChain.country;
    const locationName = deepestGeo?.name || 'your area';

    // TOC
    const tocItems: { id: string; label: string }[] = [];
    if (definitionText) tocItems.push({ id: 'overview', label: t['cond.overview'] || 'What it is' });
    if (data.automatedContent?.primarySymptoms?.length || data.condition.symptoms?.length)
        tocItems.push({ id: 'symptoms', label: t['cond.symptoms'] || 'Symptoms' });
    if (data.automatedContent?.diagnosisOverview || data.automatedContent?.prognosis)
        tocItems.push({ id: 'diagnosis', label: t['cond.diagnosis'] || 'Diagnosis' });
    if (data.condition.treatments?.length) tocItems.push({ id: 'treatments', label: t['cond.treatments'] || 'Treatment & cost' });
    if (data.automatedContent?.causes?.length || data.automatedContent?.riskFactors?.length)
        tocItems.push({ id: 'causes', label: 'Causes & risk factors' });
    if (data.automatedContent?.preventionStrategies?.length)
        tocItems.push({ id: 'lifestyle', label: t['cond.lifestyle'] || 'Living with it' });
    if (data.automatedContent?.complications?.length || data.automatedContent?.whySeeSpecialist)
        tocItems.push({ id: 'complications', label: t['cond.complications'] || 'When to seek help' });
    if (data.automatedContent?.faqs?.length || (data.condition.faqs && Array.isArray(data.condition.faqs) && data.condition.faqs.length > 0))
        tocItems.push({ id: 'faqs', label: t['cond.faqs'] || 'FAQs' });
    if (data.automatedContent?.sources?.length)
        tocItems.push({ id: 'sources', label: 'Sources' });
    tocItems.push({ id: 'local-doctors', label: t['cond.findDoctors'] || 'Find doctors' });

    const allFaqs: { question: string; answer: string }[] = [
        ...(data.automatedContent?.faqs || []),
        ...((data.condition.faqs as { q?: string; a?: string; question?: string; answer?: string }[]) || []).map((faq) => ({
            question: faq.q || faq.question || '',
            answer: faq.a || faq.answer || '',
        })),
    ];

    const filteredTreatments = filterMismatchedTreatments(
        data.condition.treatments || [],
        data.condition.specialistType,
        data.condition.commonName
    );

    const reviewerInitials = data.reviewer?.name
        ? data.reviewer.name.split(' ').filter(Boolean).slice(-2).map(p => p[0]).join('').toUpperCase()
        : 'MB';

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemas }} />
            {hreflangTags.map((tag) => (
                <link key={tag.hreflang} rel="alternate" hrefLang={tag.hreflang} href={tag.href} />
            ))}
            {data.needsTranslation && data.conditionId && (
                <TranslateTrigger conditionId={data.conditionId} targetLang={lang} />
            )}

            <main
                className="condition-page"
                style={{ background: 'var(--bg)', color: 'var(--ink)' }}
            >
                <div
                    style={{ maxWidth: 1280, margin: '0 auto', padding: '40px clamp(16px, 4vw, 28px) 80px' }}
                    className="col gap-7"
                >
                    {/* ─── Breadcrumb ─────────────────────── */}
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
                        <Link href="/">{t['cond.home'] || 'Home'}</Link>
                        <span>/</span>
                        <Link href={`/${country}/${lang}`}>{t['nav.conditions'] || 'Conditions'}</Link>
                        <span>/</span>
                        {data.condition.specialistType && (
                            <>
                                <span>{data.condition.specialistType}</span>
                                <span>/</span>
                            </>
                        )}
                        <span style={{ color: 'var(--ink)' }}>{data.condition.commonName}</span>
                    </nav>

                    {/* ─── Variant-fallback banner ────────── */}
                    {data.isVariantFallback && data.canonicalSlug && data.canonicalCommonName && (
                        <div
                            className="card-quiet row gap-3 ai-baseline"
                            style={{ padding: '14px 18px', borderLeft: '3px solid var(--cobalt)' }}
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
                                ICD variant
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                                {data.condition.commonName} is a specific ICD-10 coded subtype of{' '}
                                <Link
                                    href={`/${country}/${lang}/${data.canonicalSlug}`}
                                    style={{ color: 'var(--cobalt)', fontWeight: 500 }}
                                >
                                    {data.canonicalCommonName}
                                </Link>
                                . The clinical content below covers {data.canonicalCommonName} in general.
                            </span>
                        </div>
                    )}

                    {/* ─── Two-column body ────────────────── */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
                            gap: 40,
                            alignItems: 'flex-start',
                        }}
                    >
                        {/* ─── LEFT COLUMN ─── */}
                        <div className="col gap-6" style={{ minWidth: 0 }}>
                            {/* Hero header */}
                            <header className="col gap-4">
                                <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                                    {data.condition.specialistType && (
                                        <span className="pill pill-magenta">{data.condition.specialistType}</span>
                                    )}
                                    {data.condition.severityLevel && (
                                        <span className={`pill ${severityPillClass(data.condition.severityLevel)}`}>
                                            {data.condition.severityLevel}
                                        </span>
                                    )}
                                    {data.condition.icdCode && (
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            ICD-10 · {data.condition.icdCode}
                                        </span>
                                    )}
                                </div>
                                <h1
                                    data-speakable="title"
                                    className="display"
                                    style={{
                                        fontSize: 'clamp(40px, 7vw, 88px)',
                                        lineHeight: 0.95,
                                        letterSpacing: '-0.045em',
                                        margin: 0,
                                        fontWeight: 600,
                                    }}
                                >
                                    {cleanConditionName}
                                    <span style={{ color: 'var(--orange)' }}>.</span>
                                </h1>
                                {heroOverviewText && (
                                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.7vw, 22px)', maxWidth: 720, margin: 0 }}>
                                        {heroOverviewText.split('. ').slice(0, 2).join('. ')}.
                                    </p>
                                )}
                                {(() => {
                                    const heroImg = data.images?.find(i => i.assetType === 'feature' || i.section === 'hero') || data.images?.[0];
                                    if (!heroImg) return null;
                                    return (
                                        <figure className="col gap-2" style={{ margin: 0 }}>
                                            <img
                                                src={heroImg.url}
                                                alt={heroImg.altText}
                                                width={heroImg.width || undefined}
                                                height={heroImg.height || undefined}
                                                loading="eager"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: 720,
                                                    height: 'auto',
                                                    borderRadius: 'var(--r-3)',
                                                    border: '1px solid var(--rule)',
                                                }}
                                            />
                                            {(heroImg.caption || heroImg.credit) && (
                                                <figcaption
                                                    className="mono"
                                                    style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', maxWidth: 720 }}
                                                >
                                                    {heroImg.caption}
                                                    {heroImg.caption && heroImg.credit ? ' · ' : ''}
                                                    {heroImg.credit && <span>Credit: {heroImg.credit}</span>}
                                                    {heroImg.license && <span> · {heroImg.license}</span>}
                                                </figcaption>
                                            )}
                                        </figure>
                                    );
                                })()}
                                {data.automatedContent?.simpleName && data.automatedContent.simpleName !== data.condition.commonName && (
                                    <div
                                        className="row gap-3 mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <span>aliases · {data.automatedContent.simpleName}</span>
                                        {data.automatedContent?.regionalNames && data.automatedContent.regionalNames.length > 0 && (
                                            <>
                                                {data.automatedContent.regionalNames.slice(0, 3).map((regional, idx) => (
                                                    <span key={idx}>· {regional.name}</span>
                                                ))}
                                            </>
                                        )}
                                        {data.automatedContent?.lastReviewed && (
                                            <span>
                                                · reviewed{' '}
                                                {new Date(data.automatedContent.lastReviewed).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Reviewer eyebrow */}
                                {data.reviewer?.name && (
                                    <div
                                        className="card-quiet row gap-3 ai-center"
                                        style={{ padding: 14 }}
                                    >
                                        <div
                                            className="placeholder"
                                            style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 'var(--r-2)',
                                                fontSize: 11,
                                                background: 'var(--paper)',
                                                color: 'var(--ink-3)',
                                            }}
                                            aria-hidden="true"
                                        >
                                            {reviewerInitials}
                                        </div>
                                        <div className="col" style={{ flex: 1 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>
                                                Reviewed by {data.reviewer.name}
                                                {data.condition.specialistType ? ` · ${data.condition.specialistType}` : ''}
                                            </span>
                                            {data.reviewer.reviewDate && (
                                                <span className="muted" style={{ fontSize: 12 }}>
                                                    Last reviewed{' '}
                                                    {new Date(data.reviewer.reviewDate).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            href="/editorial-board"
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                fontWeight: 500,
                                            }}
                                        >
                                            About our board →
                                        </Link>
                                    </div>
                                )}
                            </header>

                            {/* § 01 What it is */}
                            {definitionText && (
                                <section
                                    id="overview"
                                    className="col gap-3"
                                    style={{ scrollMarginTop: 96 }}
                                    itemScope
                                    itemType="https://schema.org/MedicalCondition"
                                >
                                    <meta itemProp="name" content={cleanConditionName} />
                                    {data.condition.icdCode && <meta itemProp="code" content={data.condition.icdCode} />}
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 01</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                            What it is
                                        </h2>
                                    </div>
                                    <p
                                        data-speakable="definition"
                                        itemProp="description"
                                        style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 720, margin: 0 }}
                                    >
                                        {definitionText.split('. ').slice(0, 4).join('. ')}.
                                    </p>

                                    {/* Key facts */}
                                    {data.automatedContent?.keyStats && (
                                        <div
                                            data-speakable="key-facts"
                                            className="card col gap-3"
                                            style={{ padding: 22, marginTop: 6 }}
                                            role="region"
                                            aria-label="Key facts"
                                        >
                                            <div className="kicker"><span className="dot" />key facts</div>
                                            <dl
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                    gap: 12,
                                                    margin: 0,
                                                }}
                                            >
                                                {data.automatedContent.keyStats.prevalence && (
                                                    <div className="col gap-1">
                                                        <dt
                                                            className="mono"
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--ink-3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.08em',
                                                            }}
                                                        >
                                                            Prevalence
                                                        </dt>
                                                        <dd style={{ fontSize: 14, fontWeight: 500, margin: 0 }} itemProp="epidemiology">
                                                            {data.automatedContent.keyStats.prevalence}
                                                        </dd>
                                                    </div>
                                                )}
                                                {data.automatedContent.keyStats.demographics && (
                                                    <div className="col gap-1">
                                                        <dt
                                                            className="mono"
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--ink-3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.08em',
                                                            }}
                                                        >
                                                            Demographics
                                                        </dt>
                                                        <dd style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                                                            {data.automatedContent.keyStats.demographics}
                                                        </dd>
                                                    </div>
                                                )}
                                                {data.automatedContent.keyStats.avgAge && (
                                                    <div className="col gap-1">
                                                        <dt
                                                            className="mono"
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--ink-3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.08em',
                                                            }}
                                                        >
                                                            Avg. age
                                                        </dt>
                                                        <dd style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                                                            {data.automatedContent.keyStats.avgAge}
                                                        </dd>
                                                    </div>
                                                )}
                                                {data.automatedContent.keyStats.globalCases && (
                                                    <div className="col gap-1">
                                                        <dt
                                                            className="mono"
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--ink-3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.08em',
                                                            }}
                                                        >
                                                            Global cases
                                                        </dt>
                                                        <dd style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                                                            {data.automatedContent.keyStats.globalCases}
                                                        </dd>
                                                    </div>
                                                )}
                                                {data.condition.specialistType && (
                                                    <div className="col gap-1">
                                                        <dt
                                                            className="mono"
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--ink-3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.08em',
                                                            }}
                                                        >
                                                            Specialist
                                                        </dt>
                                                        <dd style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                                                            {data.condition.specialistType}
                                                        </dd>
                                                    </div>
                                                )}
                                                {data.condition.icdCode && (
                                                    <div className="col gap-1">
                                                        <dt
                                                            className="mono"
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--ink-3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.08em',
                                                            }}
                                                        >
                                                            ICD-10
                                                        </dt>
                                                        <dd className="num mono" style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>
                                                            {data.condition.icdCode}
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* § 02 Symptoms */}
                            {((data.automatedContent?.primarySymptoms && data.automatedContent.primarySymptoms.length > 0) ||
                              (data.condition.symptoms && data.condition.symptoms.length > 0)) && (
                                <section id="symptoms" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 02</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                            How you might notice it
                                        </h2>
                                    </div>
                                    {(() => {
                                        const img = data.images?.find(i => i.section === 'symptoms' || i.assetType === 'clinical-photo');
                                        if (!img || img.section === 'hero' || img.assetType === 'feature') return null;
                                        return (
                                            <figure className="col gap-2" style={{ margin: 0 }}>
                                                <img
                                                    src={img.url}
                                                    alt={img.altText}
                                                    width={img.width || undefined}
                                                    height={img.height || undefined}
                                                    loading="lazy"
                                                    style={{ width: '100%', maxWidth: 640, height: 'auto', borderRadius: 'var(--r-3)', border: '1px solid var(--rule)' }}
                                                />
                                                {(img.caption || img.credit) && (
                                                    <figcaption className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', maxWidth: 640 }}>
                                                        {img.caption}
                                                        {img.caption && img.credit ? ' · ' : ''}
                                                        {img.credit && <span>Credit: {img.credit}</span>}
                                                        {img.license && <span> · {img.license}</span>}
                                                    </figcaption>
                                                )}
                                            </figure>
                                        );
                                    })()}
                                    <p data-speakable="symptoms" className="sr-only">
                                        The key symptoms of {cleanConditionName} are: {(data.automatedContent?.primarySymptoms || data.condition.symptoms || []).slice(0, 7).join(', ')}.
                                    </p>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                            gap: 0,
                                            border: '1px solid var(--rule)',
                                            borderRadius: 'var(--r-3)',
                                            background: 'var(--paper)',
                                            overflow: 'hidden',
                                        }}
                                        role="list"
                                        aria-label={`Symptoms of ${cleanConditionName}`}
                                    >
                                        {(data.automatedContent?.primarySymptoms || data.condition.symptoms || []).map((symptom, i, arr) => {
                                            const cols = 2;
                                            const isLastCol = (i + 1) % cols === 0;
                                            const isLastRow = i >= arr.length - cols;
                                            return (
                                                <div
                                                    key={i}
                                                    role="listitem"
                                                    className="row gap-3 ai-center"
                                                    style={{
                                                        padding: '14px 18px',
                                                        borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                                    }}
                                                >
                                                    <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 22 }}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span style={{ fontSize: 14, color: 'var(--ink)' }}>{symptom}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Early & Emergency signs */}
                                    {((data.automatedContent?.earlyWarningSigns && data.automatedContent.earlyWarningSigns.length > 0) ||
                                       (data.automatedContent?.emergencySigns && data.automatedContent.emergencySigns.length > 0)) && (
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                                gap: 16,
                                            }}
                                        >
                                            {data.automatedContent?.earlyWarningSigns && data.automatedContent.earlyWarningSigns.length > 0 && (
                                                <div className="card col gap-3" style={{ padding: 22 }}>
                                                    <div className="kicker">
                                                        <span className="dot" />early warning signs
                                                    </div>
                                                    <ul className="clean col gap-2">
                                                        {data.automatedContent.earlyWarningSigns.map((sign, i) => (
                                                            <li key={i} className="row gap-2 ai-baseline">
                                                                <span style={{ color: 'var(--cobalt)', fontSize: 13 }}>•</span>
                                                                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{sign}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {data.automatedContent?.emergencySigns && data.automatedContent.emergencySigns.length > 0 && (
                                                <div
                                                    className="col gap-3"
                                                    style={{
                                                        padding: 22,
                                                        background: 'var(--orange-50)',
                                                        border: '1px solid rgba(255, 90, 46, .22)',
                                                        borderRadius: 'var(--r-4)',
                                                    }}
                                                >
                                                    <div
                                                        className="mono"
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'var(--orange-2)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.08em',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        ● emergency signs
                                                    </div>
                                                    <ul className="clean col gap-2">
                                                        {data.automatedContent.emergencySigns.map((sign, i) => (
                                                            <li key={i} className="row gap-2 ai-baseline">
                                                                <span style={{ color: 'var(--orange-2)', fontSize: 13 }}>•</span>
                                                                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, fontWeight: 500 }}>{sign}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* § 03 Diagnosis */}
                            {((data.automatedContent?.diagnosisOverview) || (data.automatedContent?.prognosis)) && (
                                <section id="diagnosis" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 03</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                            How it&rsquo;s diagnosed
                                        </h2>
                                    </div>
                                    {(() => {
                                        const img = data.images?.find(i => i.section === 'diagnosis' || i.assetType === 'diagnostic');
                                        if (!img || img.section === 'hero' || img.assetType === 'feature') return null;
                                        return (
                                            <figure className="col gap-2" style={{ margin: 0 }}>
                                                <img
                                                    src={img.url}
                                                    alt={img.altText}
                                                    width={img.width || undefined}
                                                    height={img.height || undefined}
                                                    loading="lazy"
                                                    style={{ width: '100%', maxWidth: 640, height: 'auto', borderRadius: 'var(--r-3)', border: '1px solid var(--rule)' }}
                                                />
                                                {(img.caption || img.credit) && (
                                                    <figcaption className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', maxWidth: 640 }}>
                                                        {img.caption}
                                                        {img.caption && img.credit ? ' · ' : ''}
                                                        {img.credit && <span>Credit: {img.credit}</span>}
                                                        {img.license && <span> · {img.license}</span>}
                                                    </figcaption>
                                                )}
                                            </figure>
                                        );
                                    })()}
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                            gap: 16,
                                        }}
                                    >
                                        {data.automatedContent?.diagnosisOverview && (
                                            <div className="card col gap-3" style={{ padding: 24 }}>
                                                <div className="kicker"><span className="dot" />diagnosis</div>
                                                <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>
                                                    {data.automatedContent.diagnosisOverview.replace(/\n/g, ' ')}
                                                </p>
                                                {data.automatedContent?.diagnosticTests && data.automatedContent.diagnosticTests.length > 0 && (
                                                    <>
                                                        <div className="hairline" />
                                                        <div className="col gap-2">
                                                            <span
                                                                className="mono"
                                                                style={{
                                                                    fontSize: 11,
                                                                    color: 'var(--ink-3)',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.08em',
                                                                }}
                                                            >
                                                                {t['cond.keyTests'] || 'Key tests'}
                                                            </span>
                                                            {data.automatedContent.diagnosticTests.map((test, i) => (
                                                                <div key={i} className="row gap-2 ai-baseline">
                                                                    <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 22 }}>
                                                                        {String(i + 1).padStart(2, '0')}
                                                                    </span>
                                                                    <div className="col">
                                                                        <span style={{ fontSize: 13, fontWeight: 500 }}>{test.test}</span>
                                                                        <span className="muted" style={{ fontSize: 12 }}>{test.purpose}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {data.automatedContent?.prognosis && (
                                            <div className="card-quiet col gap-3" style={{ padding: 24 }}>
                                                <div className="kicker"><span className="dot" style={{ background: 'var(--mint)' }} />{t['cond.prognosisOutlook'] || 'Outlook'}</div>
                                                <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
                                                    {data.automatedContent.prognosis}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* § 04 Treatment & cost */}
                            {(filteredTreatments.length > 0 || (data.automatedContent?.medicalTreatments && data.automatedContent.medicalTreatments.length > 0) || data.treatmentCost) && (
                                <section id="treatments" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 04</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                            Treatment &amp; cost
                                        </h2>
                                    </div>

                                    {filteredTreatments.length > 0 && (
                                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                            {filteredTreatments.map((tr, i, arr) => (
                                                <Link
                                                    key={i}
                                                    href={`/${country}/${lang}/treatments/${tr.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                                    className="row ai-center between"
                                                    style={{
                                                        padding: '16px 22px',
                                                        borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                    }}
                                                >
                                                    <div className="row gap-3 ai-baseline" style={{ flex: 1, minWidth: 0 }}>
                                                        <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 22 }}>
                                                            {String(i + 1).padStart(2, '0')}
                                                        </span>
                                                        <span
                                                            className="display"
                                                            style={{
                                                                fontSize: 16,
                                                                fontWeight: 500,
                                                                letterSpacing: '-0.015em',
                                                            }}
                                                        >
                                                            {tr}
                                                        </span>
                                                    </div>
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
                                                        Learn more →
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Medical + Surgical breakdown */}
                                    {data.automatedContent?.treatmentOverview && (
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                                gap: 16,
                                            }}
                                        >
                                            {(() => {
                                                const medical = filterAutomatedTreatments(data.automatedContent.medicalTreatments, data.condition.specialistType, data.condition.commonName);
                                                if (!medical.length) return null;
                                                return (
                                                    <div className="card col gap-3" style={{ padding: 24 }}>
                                                        <div className="kicker"><span className="dot" />medical treatments</div>
                                                        <ul className="clean col gap-2">
                                                            {medical.slice(0, 4).map((m, i) => (
                                                                <li key={i} className="row gap-2 ai-baseline">
                                                                    <span style={{ color: 'var(--mint-3)', fontSize: 13 }}>✓</span>
                                                                    <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{m.name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            })()}
                                            {(() => {
                                                const surgical = filterAutomatedTreatments(data.automatedContent.surgicalOptions, data.condition.specialistType, data.condition.commonName);
                                                if (!surgical.length) return null;
                                                return (
                                                    <div className="card col gap-3" style={{ padding: 24 }}>
                                                        <div className="kicker"><span className="dot" style={{ background: 'var(--magenta)' }} />surgical options</div>
                                                        <div className="col gap-2">
                                                            {surgical.slice(0, 4).map((s, i) => (
                                                                <div key={i} className="card-quiet col gap-1" style={{ padding: 12 }}>
                                                                    <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                                                                    <span className="muted mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                                        {s.successRate || 'consult specialist'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* § 05 Causes & risk factors */}
                            {((data.automatedContent?.causes && data.automatedContent.causes.length > 0) ||
                              (data.automatedContent?.riskFactors && data.automatedContent.riskFactors.length > 0)) && (
                                <section id="causes" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 05</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                            Causes &amp; risk factors
                                        </h2>
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                            gap: 16,
                                        }}
                                    >
                                        {data.automatedContent?.causes && data.automatedContent.causes.length > 0 && (
                                            <div className="card col gap-3" style={{ padding: 24 }}>
                                                <div className="kicker"><span className="dot" />known causes</div>
                                                <dl className="col gap-3" style={{ margin: 0 }}>
                                                    {data.automatedContent.causes.map((c, i) => (
                                                        <div key={i} className="col gap-1">
                                                            <dt style={{ fontSize: 14, fontWeight: 500 }}>{c.cause}</dt>
                                                            <dd className="muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.6 }}>{c.description}</dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                            </div>
                                        )}
                                        {data.automatedContent?.riskFactors && data.automatedContent.riskFactors.length > 0 && (
                                            <div className="card col gap-3" style={{ padding: 24 }}>
                                                <div className="kicker"><span className="dot" style={{ background: 'var(--lemon-2)' }} />risk factors</div>
                                                <dl className="col gap-3" style={{ margin: 0 }}>
                                                    {data.automatedContent.riskFactors.map((rf, i) => (
                                                        <div key={i} className="col gap-1">
                                                            <dt className="row gap-2 ai-baseline" style={{ fontSize: 14, fontWeight: 500 }}>
                                                                {rf.factor}
                                                                <span
                                                                    className="mono"
                                                                    style={{
                                                                        fontSize: 10,
                                                                        color: '#8C6A00',
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.08em',
                                                                        background: 'var(--lemon-50)',
                                                                        padding: '2px 6px',
                                                                        borderRadius: 'var(--r-1)',
                                                                    }}
                                                                >
                                                                    {rf.category}
                                                                </span>
                                                            </dt>
                                                            <dd className="muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.6 }}>{rf.description}</dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* § 06 Living with it */}
                            {(data.automatedContent?.preventionStrategies && data.automatedContent.preventionStrategies.length > 0) && (
                                <section id="lifestyle" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 06</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                            Living with it
                                        </h2>
                                    </div>
                                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                        {data.automatedContent.preventionStrategies.map((tip, i, arr) => (
                                            <div
                                                key={i}
                                                className="row gap-3 ai-baseline"
                                                style={{
                                                    padding: '14px 22px',
                                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                }}
                                            >
                                                <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 22 }}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{tip}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Diet recommendations */}
                                    {(data.automatedContent.dietRecommendations?.recommended?.length || data.automatedContent.dietRecommendations?.avoid?.length) && (
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                                gap: 16,
                                            }}
                                        >
                                            {data.automatedContent.dietRecommendations?.recommended && data.automatedContent.dietRecommendations.recommended.length > 0 && (
                                                <div className="card col gap-2" style={{ padding: 18 }}>
                                                    <div className="kicker"><span className="dot" style={{ background: 'var(--mint)' }} />recommended foods</div>
                                                    <ul className="clean col gap-1">
                                                        {data.automatedContent.dietRecommendations.recommended.map((food, i) => (
                                                            <li key={i} className="row gap-2 ai-baseline">
                                                                <span style={{ color: 'var(--mint-3)', fontSize: 12 }}>•</span>
                                                                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{food}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {data.automatedContent.dietRecommendations?.avoid && data.automatedContent.dietRecommendations.avoid.length > 0 && (
                                                <div className="card col gap-2" style={{ padding: 18 }}>
                                                    <div className="kicker"><span className="dot" style={{ background: 'var(--orange)' }} />foods to avoid</div>
                                                    <ul className="clean col gap-1">
                                                        {data.automatedContent.dietRecommendations.avoid.map((food, i) => (
                                                            <li key={i} className="row gap-2 ai-baseline">
                                                                <span style={{ color: 'var(--orange-2)', fontSize: 12 }}>•</span>
                                                                <span style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'line-through' }}>{food}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* § 07 When to seek help / Complications */}
                            {(data.automatedContent?.complications && data.automatedContent.complications.length > 0) || data.automatedContent?.whySeeSpecialist ? (
                                <section id="complications" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 07</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                            When to seek help
                                        </h2>
                                    </div>

                                    {data.automatedContent?.whySeeSpecialist && (
                                        <div className="card-ink col gap-3" style={{ padding: 24 }}>
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
                                                why see {getArticle(data.condition.specialistType)} {data.condition.specialistType?.toLowerCase()}
                                            </span>
                                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.6, margin: 0 }}>
                                                {data.automatedContent.whySeeSpecialist}
                                            </p>
                                            <a href="#local-doctors" className="btn btn-cobalt btn-sm" style={{ alignSelf: 'flex-start' }}>
                                                {t['cond.findSpecialists'] || 'Find specialists'} →
                                            </a>
                                        </div>
                                    )}

                                    {data.automatedContent?.complications && data.automatedContent.complications.length > 0 && (
                                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                            {data.automatedContent.complications.map((comp, i, arr) => (
                                                <div
                                                    key={i}
                                                    className="row gap-3 ai-baseline"
                                                    style={{
                                                        padding: '14px 22px',
                                                        borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                    }}
                                                >
                                                    <span className="num mono" style={{ fontSize: 11, color: 'var(--orange-2)', minWidth: 22, fontWeight: 500 }}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{comp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hospital criteria */}
                                    {data.automatedContent?.hospitalCriteria && data.automatedContent.hospitalCriteria.length > 0 && (
                                        <div className="card col gap-3" style={{ padding: 24 }}>
                                            <div className="kicker"><span className="dot" />{t['cond.choosingHospital'] || 'choosing the right hospital'}</div>
                                            <ul
                                                className="clean"
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                    gap: 8,
                                                }}
                                            >
                                                {data.automatedContent.hospitalCriteria.map((criterion, i) => (
                                                    <li key={i} className="row gap-2 ai-baseline">
                                                        <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 22 }}>
                                                            {String(i + 1).padStart(2, '0')}
                                                        </span>
                                                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{criterion}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {data.automatedContent.keyFacilities && data.automatedContent.keyFacilities.length > 0 && (
                                                <>
                                                    <div className="hairline" />
                                                    <div className="col gap-2">
                                                        <span
                                                            className="mono"
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--ink-3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.08em',
                                                            }}
                                                        >
                                                            {t['cond.essentialFacilities'] || 'Essential facilities'}
                                                        </span>
                                                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                                            {data.automatedContent.keyFacilities.map((facility, i) => (
                                                                <span key={i} className="pill" style={{ textTransform: 'none' }}>
                                                                    {facility}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </section>
                            ) : null}

                            {/* Related conditions */}
                            {data.automatedContent?.relatedConditions && data.automatedContent.relatedConditions.length > 0 && (
                                <section className="col gap-4">
                                    <h2 className="display" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                        {t['cond.relatedConditions'] || 'Related conditions'}
                                    </h2>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                            gap: 12,
                                        }}
                                    >
                                        {data.automatedContent.relatedConditions.map((related, i) => (
                                            <Link
                                                key={i}
                                                href={`/${country}/${lang}/${related.slug}`}
                                                className="card col gap-1"
                                                style={{ padding: 18 }}
                                            >
                                                <span style={{ fontSize: 14, fontWeight: 500 }}>{related.name}</span>
                                                {related.relevance && <span className="muted" style={{ fontSize: 12 }}>{related.relevance}</span>}
                                                <span
                                                    className="mono"
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--cobalt)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                        fontWeight: 500,
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    Read →
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Confused-with (X vs Y intent) */}
                            {data.automatedContent?.confusedWithConditions && data.automatedContent.confusedWithConditions.length > 0 && (
                                <section id="confused-with" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <h2 className="display" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                        Easily confused with
                                    </h2>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                            gap: 12,
                                        }}
                                    >
                                        {data.automatedContent.confusedWithConditions.map((cw, i) => (
                                            <Link
                                                key={i}
                                                href={`/${country}/${lang}/${cw.slug}`}
                                                className="card col gap-2"
                                                style={{ padding: 20 }}
                                            >
                                                <div className="kicker">
                                                    <span className="dot" style={{ background: 'var(--lemon)' }} />
                                                    vs. {data.condition.commonName}
                                                </div>
                                                <span className="display" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em' }}>{cw.name}</span>
                                                {cw.keyDifference && (
                                                    <span className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{cw.keyDifference}</span>
                                                )}
                                                <span
                                                    className="mono"
                                                    style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginTop: 4 }}
                                                >
                                                    Compare →
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Co-occurring conditions */}
                            {data.automatedContent?.coOccurringConditions && data.automatedContent.coOccurringConditions.length > 0 && (
                                <section className="col gap-3">
                                    <h2 className="display" style={{ fontSize: 'clamp(18px, 2vw, 22px)', margin: 0, letterSpacing: '-0.02em', fontWeight: 600 }}>
                                        Often appears alongside
                                    </h2>
                                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                        {data.automatedContent.coOccurringConditions.map((co, i) => (
                                            <Link
                                                key={i}
                                                href={`/${country}/${lang}/${co.slug}`}
                                                className="pill pill-cobalt"
                                                style={{ fontSize: 13 }}
                                            >
                                                {co.name} →
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Types / sub-classification */}
                            {data.automatedContent?.typesClassification && data.automatedContent.typesClassification.length > 0 && (
                                <section className="col gap-4">
                                    <h2 className="display" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                        Types and stages
                                    </h2>
                                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                        {data.automatedContent.typesClassification.map((tc, i, arr) => (
                                            <div
                                                key={i}
                                                className="col gap-1"
                                                style={{
                                                    padding: '16px 22px',
                                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                }}
                                            >
                                                <span style={{ fontSize: 14, fontWeight: 600 }}>{tc.type}</span>
                                                <span className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>{tc.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Living with: lifestyle, recovery, daily management */}
                            {(data.automatedContent?.lifestyleModifications?.length ||
                              data.automatedContent?.recoveryTimeline ||
                              data.automatedContent?.dailyManagement?.length ||
                              data.automatedContent?.exerciseGuidelines) && (
                                <section id="living-with" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <h2 className="display" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                        Living with {data.condition.commonName}
                                    </h2>
                                    {data.automatedContent?.recoveryTimeline && (
                                        <div className="card-quiet col gap-2" style={{ padding: 20 }}>
                                            <div className="kicker"><span className="dot" style={{ background: 'var(--mint)' }} />Timeline</div>
                                            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                                                {data.automatedContent.recoveryTimeline}
                                            </p>
                                        </div>
                                    )}
                                    {data.automatedContent?.lifestyleModifications && data.automatedContent.lifestyleModifications.length > 0 && (
                                        <div className="card col gap-2" style={{ padding: 22 }}>
                                            <div className="kicker"><span className="dot" />Lifestyle</div>
                                            <ul className="clean col gap-2" style={{ margin: 0, paddingLeft: 0 }}>
                                                {data.automatedContent.lifestyleModifications.map((tip, i) => (
                                                    <li key={i} className="row gap-2 ai-baseline">
                                                        <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 22 }}>
                                                            {String(i + 1).padStart(2, '0')}
                                                        </span>
                                                        <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {data.automatedContent?.dailyManagement && data.automatedContent.dailyManagement.length > 0 && (
                                        <div className="card col gap-2" style={{ padding: 22 }}>
                                            <div className="kicker"><span className="dot" style={{ background: 'var(--cobalt)' }} />Daily management</div>
                                            <ul className="clean col gap-2" style={{ margin: 0, paddingLeft: 0 }}>
                                                {data.automatedContent.dailyManagement.map((d, i) => (
                                                    <li key={i} className="row gap-2 ai-baseline">
                                                        <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 22 }}>
                                                            {String(i + 1).padStart(2, '0')}
                                                        </span>
                                                        <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{d}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {data.automatedContent?.exerciseGuidelines && (
                                        <div className="card-quiet col gap-2" style={{ padding: 20 }}>
                                            <div className="kicker"><span className="dot" style={{ background: 'var(--mint)' }} />Exercise</div>
                                            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                                                {data.automatedContent.exerciseGuidelines}
                                            </p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Alternative treatments */}
                            {data.automatedContent?.alternativeTreatments && data.automatedContent.alternativeTreatments.length > 0 && (
                                <section className="col gap-3">
                                    <h2 className="display" style={{ fontSize: 'clamp(18px, 2vw, 22px)', margin: 0, letterSpacing: '-0.02em', fontWeight: 600 }}>
                                        Complementary approaches
                                    </h2>
                                    <div className="card col gap-3" style={{ padding: 22 }}>
                                        {data.automatedContent.alternativeTreatments.map((alt, i) => (
                                            <div key={i} className="col gap-1">
                                                <span style={{ fontSize: 14, fontWeight: 600 }}>{alt.name}</span>
                                                <span className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>{alt.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Doctor selection guide */}
                            {data.automatedContent?.doctorSelectionGuide && (
                                <section className="card-quiet col gap-2" style={{ padding: 20 }}>
                                    <div className="kicker"><span className="dot" />Choosing a doctor</div>
                                    <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                                        {data.automatedContent.doctorSelectionGuide}
                                    </p>
                                </section>
                            )}

                            {/* Support resources */}
                            {data.automatedContent?.supportResources && data.automatedContent.supportResources.length > 0 && (
                                <section className="col gap-3">
                                    <h2 className="display" style={{ fontSize: 'clamp(18px, 2vw, 22px)', margin: 0, letterSpacing: '-0.02em', fontWeight: 600 }}>
                                        Patient support resources
                                    </h2>
                                    <div className="card col gap-3" style={{ padding: 22 }}>
                                        {data.automatedContent.supportResources.map((res, i) => (
                                            <div key={i} className="col gap-1">
                                                {res.url ? (
                                                    <a href={res.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 14, fontWeight: 600, color: 'var(--cobalt)' }}>
                                                        {res.name} →
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{res.name}</span>
                                                )}
                                                {res.description && <span className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{res.description}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* FAQs */}
                            {allFaqs.length > 0 && (
                                <section id="faqs" className="col gap-4" style={{ scrollMarginTop: 96 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 08</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                            {t['cond.frequentlyAsked'] || 'Frequently asked'}
                                        </h2>
                                    </div>
                                    <div data-speakable="answer">
                                        <FaqAccordion faqs={allFaqs} />
                                    </div>
                                </section>
                            )}

                            {/* Sources */}
                            {data.automatedContent?.sources && data.automatedContent.sources.length > 0 && (
                                <section id="sources" className="col gap-3" style={{ scrollMarginTop: 96 }}>
                                    <div className="row gap-3 ai-baseline">
                                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 09</span>
                                        <h2 className="display" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                            Sources &amp; references
                                        </h2>
                                    </div>
                                    <div className="card-flat col gap-2" style={{ padding: 22 }}>
                                        <ol className="clean col gap-2" style={{ counterReset: 'srcs' }}>
                                            {data.automatedContent.sources.map((src, i) => (
                                                <li key={i} className="row gap-2 ai-baseline">
                                                    <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 22 }}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                                                        {src.url ? (
                                                            <a href={src.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--cobalt)' }}>
                                                                {src.title}
                                                            </a>
                                                        ) : (
                                                            <span>{src.title}</span>
                                                        )}
                                                        {src.accessedDate && (
                                                            <span className="muted mono" style={{ fontSize: 11, marginLeft: 8 }}>
                                                                accessed {src.accessedDate}
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                        {data.reviewer && (
                                            <>
                                                <div className="hairline" />
                                                <p
                                                    className="muted mono"
                                                    style={{
                                                        fontSize: 11,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.06em',
                                                        margin: 0,
                                                    }}
                                                >
                                                    Medically reviewed by {data.reviewer.name}
                                                    {data.reviewer.reviewDate &&
                                                        ` · ${new Date(data.reviewer.reviewDate).toLocaleDateString('en-US', {
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}`}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* ─── RIGHT COLUMN — Sidebar ─── */}
                        <aside className="col gap-3 v4-sticky-md" style={{ position: 'sticky', top: 96 }}>
                            {/* On this page */}
                            <div className="card col gap-3" style={{ padding: 22 }}>
                                <div className="kicker"><span className="dot" />on this page</div>
                                <TableOfContents items={tocItems} />
                            </div>

                            {/* Have lab results CTA — card-ink */}
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
                                    ● have lab results?
                                </span>
                                <div
                                    className="display"
                                    style={{
                                        fontSize: 22,
                                        lineHeight: 1.2,
                                        fontWeight: 500,
                                        letterSpacing: '-0.02em',
                                        color: 'var(--paper)',
                                    }}
                                >
                                    Drop your report — we&rsquo;ll tell you where you sit<span style={{ color: 'var(--orange)' }}>.</span>
                                </div>
                                <Link href="/analyze" className="btn btn-cobalt btn-sm" style={{ alignSelf: 'flex-start' }}>
                                    Analyze →
                                </Link>
                            </div>

                            {/* Cost card */}
                            {data.treatmentCost ? (
                                <div className="card col gap-3" style={{ padding: 22 }}>
                                    <div className="row between ai-center">
                                        <div className="kicker"><span className="dot" />cost estimate</div>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 10,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.10em',
                                                fontWeight: 500,
                                                background: 'var(--cobalt-50)',
                                                padding: '2px 6px',
                                                borderRadius: 'var(--r-1)',
                                            }}
                                        >
                                            AI
                                        </span>
                                    </div>
                                    <div className="col gap-1">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            {t['cond.procedure'] || 'Procedure'}
                                        </span>
                                        <span style={{ fontSize: 13, fontWeight: 500 }} className="truncate-2">
                                            {data.treatmentCost.treatmentName}
                                        </span>
                                    </div>
                                    <div className="card-quiet col gap-1" style={{ padding: 14 }}>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            {t['cond.averageCost'] || 'Average cost'}
                                        </span>
                                        <span
                                            className="display num"
                                            style={{
                                                fontSize: 24,
                                                fontWeight: 500,
                                                color: 'var(--cobalt)',
                                                letterSpacing: '-0.025em',
                                            }}
                                        >
                                            {data.treatmentCost.currency} {data.treatmentCost.avg.toLocaleString()}
                                        </span>
                                        <span className="muted" style={{ fontSize: 12 }}>
                                            {data.treatmentCost.currency} {data.treatmentCost.min.toLocaleString()} – {data.treatmentCost.max.toLocaleString()}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/${country}/${lang}/${condition}/cost`}
                                        className="btn btn-paper"
                                        style={{ width: '100%' }}
                                    >
                                        Full cost analysis →
                                    </Link>
                                </div>
                            ) : (
                                <div className="card col gap-3" style={{ padding: 22 }}>
                                    <div className="kicker"><span className="dot" />cost analysis</div>
                                    <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
                                        Get hospital cost breakdowns for {data.condition.commonName} in {locationName}.
                                    </p>
                                    <Link
                                        href={`/${country}/${lang}/${condition}/cost`}
                                        className="btn btn-paper"
                                        style={{ width: '100%' }}
                                    >
                                        Unlock cost data →
                                    </Link>
                                </div>
                            )}

                            {/* Specialists nearby preview */}
                            {allDoctors.length > 0 && (
                                <div className="card col gap-3" style={{ padding: 22 }}>
                                    <div className="kicker"><span className="dot" />specialists nearby</div>
                                    <div className="col gap-3">
                                        {allDoctors.slice(0, 3).map((doc) => (
                                            <Link
                                                key={doc.id}
                                                href={`/doctor/${doc.slug}`}
                                                className="row between ai-center"
                                            >
                                                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 500 }} className="truncate-2">{doc.name}</span>
                                                    <span className="muted" style={{ fontSize: 12 }}>
                                                        {doc.qualifications.slice(0, 2).join(', ')}
                                                    </span>
                                                </div>
                                                <span
                                                    className="mono"
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--cobalt)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.06em',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    book →
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                    <a
                                        href="#local-doctors"
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--cobalt)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            fontWeight: 500,
                                            marginTop: 4,
                                        }}
                                    >
                                        View all {allDoctors.length} →
                                    </a>
                                </div>
                            )}
                        </aside>
                    </div>

                    {/* ─── DOCTORS SECTION ─── */}
                    <section
                        id="local-doctors"
                        className="col gap-5 hairline-t"
                        style={{ scrollMarginTop: 96, paddingTop: 64 }}
                    >
                        <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                            <div className="col gap-2">
                                <span className="section-mark">verified specialists</span>
                                <h2
                                    className="display"
                                    style={{
                                        fontSize: 'clamp(28px, 4vw, 48px)',
                                        margin: 0,
                                        letterSpacing: '-0.035em',
                                        fontWeight: 600,
                                    }}
                                >
                                    Top {pluralizeSpecialist(data.condition.specialistType)} in {locationName}<span style={{ color: 'var(--orange)' }}>.</span>
                                </h2>
                                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                    Ranked by patient outcomes and specialized experience.
                                </p>
                            </div>
                            <Link
                                href={`/doctors/${data.condition.slug}`}
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    fontWeight: 500,
                                }}
                            >
                                View all specialists →
                            </Link>
                        </div>

                        {allDoctors.length > 0 ? (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                    gap: 16,
                                }}
                            >
                                {data.doctors.premium.map((doc) => (
                                    <DoctorCardComponent key={doc.id} doctor={doc} />
                                ))}
                                {data.doctors.free.map((doc) => (
                                    <DoctorCardComponent key={doc.id} doctor={doc} />
                                ))}
                            </div>
                        ) : (
                            <div className="card-quiet col gap-2 ai-center" style={{ padding: 32, textAlign: 'center' }}>
                                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                    Verifying top specialists in {locationName}.
                                </p>
                                <Link href="/for-doctors" className="btn btn-paper btn-sm">
                                    Apply as specialist →
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* ─── Final CTA ─── */}
                    <section className="card-ink" style={{ padding: 'clamp(36px, 5vw, 56px)' }}>
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
                                    take control
                                </span>
                                <h2
                                    className="display"
                                    style={{
                                        fontSize: 'clamp(28px, 3.5vw, 44px)',
                                        margin: 0,
                                        fontWeight: 600,
                                        letterSpacing: '-0.035em',
                                        color: 'var(--paper)',
                                        lineHeight: 1.05,
                                    }}
                                >
                                    Connect with top {pluralizeSpecialist(data.condition.specialistType)} in {locationName}<span style={{ color: 'var(--orange)' }}>.</span>
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
                                    Specialists who treat {data.condition.commonName}. Get expert guidance and personalized care.
                                </p>
                            </div>
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                <a href="#local-doctors" className="btn btn-cobalt btn-lg">
                                    {t['cond.findSpecialist'] || 'Find a specialist'} →
                                </a>
                                <Link
                                    href="/medical-travel/bot"
                                    className="btn btn-lg"
                                    style={{
                                        background: 'rgba(255,255,255,.08)',
                                        color: 'var(--paper)',
                                        borderColor: 'rgba(255,255,255,.15)',
                                    }}
                                >
                                    Free estimate
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

interface DoctorCardDoctor {
    id: string | number;
    name: string;
    slug: string;
    qualifications: string[];
    rating: number | { toNumber?: () => number } | null;
    reviewCount: number;
    consultationFee: number | { toNumber?: () => number } | null;
    feeCurrency: string | null;
    profileImage: string | null;
    experienceYears?: number | null;
    isVerified?: boolean;
    subscriptionTier?: string | null;
}

function DoctorCardComponent({ doctor }: { doctor: DoctorCardDoctor }) {
    const isPremium = doctor.subscriptionTier && doctor.subscriptionTier !== 'free';
    return (
        <Link href={`/doctor/${doctor.slug}`} className="card col gap-3" style={{ padding: 20, position: 'relative' }}>
            {isPremium && (
                <span
                    className="pill pill-cobalt"
                    style={{ position: 'absolute', top: 12, right: 12 }}
                >
                    featured
                </span>
            )}
            <div className="col ai-center gap-2" style={{ paddingTop: isPremium ? 14 : 0 }}>
                <div style={{ position: 'relative', width: 72, height: 72 }}>
                    {doctor.profileImage ? (
                        <AvatarWithFallback
                            src={doctor.profileImage}
                            alt={doctor.name}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <div
                            className="spec-icon"
                            style={{ width: 72, height: 72, borderRadius: 99, fontSize: 24 }}
                        >
                            {doctor.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="col ai-center gap-1" style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }} className="truncate-2">{doctor.name}</span>
                    <span className="muted truncate-2" style={{ fontSize: 11 }}>{doctor.qualifications.join(', ')}</span>
                </div>
            </div>
            <div className="hairline" />
            <div className="row between ai-center">
                <div className="row gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {doctor.experienceYears && <span>{doctor.experienceYears}y</span>}
                    {doctor.rating != null && (
                        <span style={{ color: 'var(--cobalt)' }}>
                            {(typeof doctor.rating === 'number' ? doctor.rating : (doctor.rating as { toNumber?: () => number })?.toNumber?.() ?? 0).toFixed(1)} ★
                        </span>
                    )}
                </div>
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
                    book →
                </span>
            </div>
        </Link>
    );
}
