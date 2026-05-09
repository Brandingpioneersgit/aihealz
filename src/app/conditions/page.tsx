import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import ConditionsExplorer, { type SeverityLevel, type SpecialtyGroup } from '@/components/ui/conditions-explorer';
import { normalizeSpecialty } from '@/lib/normalize-specialty';
import LanguageSwitcher from '@/components/ui/language-switcher';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import {
    isNonCondition,
    cleanConditionName,
    getSeverityOverride,
    isPoorlyFormatted,
} from '@/lib/condition-cleaner';
import { QuickActionsBar, FindDoctorCTA, BookTestCTA } from '@/components/ui/cta-sections';

function formatConditionCount(count: number): string {
    if (count >= 1000) {
        const rounded = Math.floor(count / 1000);
        return `${rounded},000+`;
    }
    return `${count}+`;
}

export async function generateMetadata(): Promise<Metadata> {
    const count = await prisma.medicalCondition.count({ where: { isActive: true } });
    const displayCount = formatConditionCount(count);

    return {
        title: `Medical conditions A–Z — ${displayCount} diseases & health conditions | aihealz`,
        description: `Browseable A–Z directory of ${displayCount} conditions across 25+ specialties. Plain-English explainers, severity ranges, treatment options, cost compared across seven countries.`,
        keywords:
            'medical conditions list, diseases directory, health conditions A-Z, symptom checker, disease symptoms, find condition, medical specialty, cardiology conditions, neurology diseases, orthopedic conditions, dermatology, gastroenterology, oncology, aihealz',
        openGraph: {
            title: `Medical conditions A–Z — ${displayCount} conditions`,
            description:
                'Comprehensive database of medical conditions organized by 25+ specialties. Symptoms, treatments, costs, and specialists.',
            url: 'https://aihealz.com/conditions',
            siteName: 'aihealz',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Medical conditions A–Z directory | aihealz',
            description: `Browse ${displayCount} medical conditions. Symptoms, treatments, specialists.`,
        },
        alternates: { canonical: 'https://aihealz.com/conditions' },
    };
}

const FEATURED_SPECIALTIES = [
    { name: 'Cardiology', abbr: 'CD', description: 'Heart & cardiovascular' },
    { name: 'Neurology', abbr: 'NR', description: 'Brain & nervous system' },
    { name: 'Orthopedics', abbr: 'OR', description: 'Bone, joint, muscle' },
    { name: 'Dermatology', abbr: 'DR', description: 'Skin, hair, nails' },
    { name: 'Gastroenterology', abbr: 'GA', description: 'Digestive system' },
    { name: 'Oncology', abbr: 'ON', description: 'Cancer & tumors' },
    { name: 'Pulmonology', abbr: 'PU', description: 'Lung & respiratory' },
    { name: 'Endocrinology', abbr: 'EN', description: 'Hormones & metabolism' },
];

const normalizeSeverity = (sev: string | null, conditionName: string): SeverityLevel => {
    const override = getSeverityOverride(conditionName);
    if (override) return override;
    const s = sev?.toLowerCase()?.trim() || 'moderate';
    if (s === 'mild' || s === 'low') return 'mild';
    if (s === 'moderate' || s === 'medium') return 'moderate';
    if (s === 'severe' || s === 'high') return 'severe';
    if (s === 'critical' || s === 'life_threatening' || s === 'life-threatening') return 'critical';
    return 'variable';
};

function getBaseConditionName(name: string): string {
    let s = name.toLowerCase().trim();
    s = s.replace(/,?\s*(initial encounter|subsequent encounter|sequela)$/i, '');
    s = s.replace(/\b(left|right|bilateral|unspecified|other specified|unsp)\b/gi, '');
    s = s.replace(/\bdue to\b.*$/i, '');
    s = s.replace(/[,\-]+\s*$/, '').replace(/\s{2,}/g, ' ').trim();
    s = s.replace(/of\s+of/g, 'of').replace(/\s{2,}/g, ' ').trim();
    return s;
}

export default async function ConditionsDirectory() {
    const rawConditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: {
            slug: true,
            commonName: true,
            specialistType: true,
            severityLevel: true,
            bodySystem: true,
        },
        orderBy: { commonName: 'asc' },
    });

    const conditions = rawConditions.filter(c => !isNonCondition(c.commonName));
    const totalCount = conditions.length;

    const specialtyMap: Record<
        string,
        Map<string, { slug: string; name: string; severity: SeverityLevel; bodySystem: string | null; isClean: boolean }>
    > = {};

    conditions.forEach(c => {
        const specialty = normalizeSpecialty(c.specialistType);
        if (!specialtyMap[specialty]) specialtyMap[specialty] = new Map();

        const baseName = getBaseConditionName(c.commonName);
        const isClean = !isPoorlyFormatted(c.commonName);
        const cleanedName = cleanConditionName(c.commonName);

        if (!specialtyMap[specialty].has(baseName)) {
            specialtyMap[specialty].set(baseName, {
                slug: c.slug,
                name: cleanedName,
                severity: normalizeSeverity(c.severityLevel, c.commonName),
                bodySystem: c.bodySystem,
                isClean,
            });
        } else {
            const existing = specialtyMap[specialty].get(baseName)!;
            if (!existing.isClean && isClean) {
                specialtyMap[specialty].set(baseName, {
                    slug: c.slug,
                    name: cleanedName,
                    severity: normalizeSeverity(c.severityLevel, c.commonName),
                    bodySystem: c.bodySystem,
                    isClean,
                });
            }
        }
    });

    const categories: SpecialtyGroup[] = Object.keys(specialtyMap)
        .sort()
        .map(specialty => ({
            specialty,
            conditions: Array.from(specialtyMap[specialty].values())
                .sort((a, b) => {
                    if (a.isClean && !b.isClean) return -1;
                    if (!a.isClean && b.isClean) return 1;
                    return a.name.localeCompare(b.name);
                })
                .map(({ slug, name, severity, bodySystem }) => ({ slug, name, severity, bodySystem })),
        }))
        .filter(c => c.conditions.length > 0);

    const specialtyCount = categories.length;

    const hdrs = await headers();
    const country = hdrs.get('x-aihealz-country');
    const city = hdrs.get('x-aihealz-city');
    const lang = hdrs.get('x-aihealz-lang') || 'en';
    const regionalLang = hdrs.get('x-aihealz-regional-lang');
    const regionalDisplay = hdrs.get('x-aihealz-regional-display');

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: 'Medical Conditions', item: 'https://aihealz.com/conditions' },
        ],
    };

    const conditionsSchema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: 'Medical Conditions A-Z Directory',
        headline: `Complete Medical Conditions Database — ${totalCount.toLocaleString()}+ Diseases & Health Conditions`,
        description: `Comprehensive directory of ${totalCount.toLocaleString()}+ medical conditions organized by ${specialtyCount} medical specialties. Each condition includes symptoms, causes, treatments, specialist recommendations, and global cost comparisons.`,
        url: 'https://aihealz.com/conditions',
        datePublished: '2024-01-01',
        dateModified: new Date().toISOString().split('T')[0],
        inLanguage: 'en-US',
        isPartOf: { '@id': 'https://aihealz.com/#website' },
        about: { '@type': 'MedicalCondition', name: 'Medical Conditions Database' },
        mainEntity: {
            '@type': 'ItemList',
            name: 'Medical Specialties',
            numberOfItems: categories.length,
            itemListElement: categories.slice(0, 20).map((cat, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'MedicalSpecialty',
                    name: cat.specialty,
                    url: `https://aihealz.com/conditions/${cat.specialty.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                    description: `${cat.conditions.length} medical conditions in ${cat.specialty}`,
                },
            })),
        },
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', 'article p', '.condition-description'],
        },
        audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'How many medical conditions are listed on aihealz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `aihealz indexes over ${totalCount.toLocaleString()} medical conditions across ${specialtyCount} major specialties — Cardiology, Neurology, Oncology, Orthopedics, Dermatology, Gastroenterology, Pulmonology, Endocrinology, and more.`,
                },
            },
            {
                '@type': 'Question',
                name: 'How do I find information about a specific medical condition?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Search by name or symptom, or browse by specialty. Each condition page covers symptoms, causes, diagnosis, treatment options, and cost estimates across seven countries.',
                },
            },
            {
                '@type': 'Question',
                name: 'Can I find doctors for my condition on aihealz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes — every condition page lists verified specialists nearby with their qualifications, patient reviews, and booking options.',
                },
            },
            {
                '@type': 'Question',
                name: 'What medical specialties are covered on aihealz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `aihealz covers ${specialtyCount} specialties including Cardiology, Neurology, Orthopedics, Dermatology, Gastroenterology, Oncology, Pulmonology, Endocrinology, Rheumatology, Nephrology, Urology, Ophthalmology, ENT, Psychiatry, and more.`,
                },
            },
            {
                '@type': 'Question',
                name: 'How accurate is the medical information on aihealz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Every condition page is reviewed by a board-certified physician in that specialty before publication. We cite ranges, ICD-10 codes, and update yearly. Information is educational and does not replace clinical advice.',
                },
            },
            {
                '@type': 'Question',
                name: 'Can I compare treatment costs for my condition across countries?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes — costs are compared across USA, UK, India, Thailand, Mexico, Turkey, and UAE. Estimates show typical all-in package pricing in local currency.',
                },
            },
        ],
    };

    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://aihealz.com/#organization',
        name: 'aihealz',
        url: 'https://aihealz.com',
        logo: 'https://aihealz.com/logo.png',
        description:
            'Editorial medical directory — plain-English condition explainers, verified doctors, AI report analysis, and cost compared across seven countries.',
        sameAs: [
            'https://twitter.com/aihealz',
            'https://linkedin.com/company/aihealz',
            'https://facebook.com/aihealz',
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(conditionsSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

            <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
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
                    {/* ── Hero ─────────────────────────────────── */}
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
                            <span style={{ color: 'var(--ink)' }}>Medical Conditions</span>
                        </div>

                        <span className="section-mark">the index / by condition</span>

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
                                {totalCount.toLocaleString()}
                            </span>{' '}
                            conditions
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>

                        <p
                            className="lede conditions-description"
                            style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 680 }}
                        >
                            Plain-English explainers across {specialtyCount} specialties. Symptoms, causes, treatment options, and cost compared across seven countries — every page reviewed by a board-certified physician before it goes live.
                        </p>

                        <div style={{ maxWidth: 720 }}>
                            <SearchAutocomplete
                                variant="bureau"
                                placeholder="Search a condition, symptom, or treatment"
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
                            { v: totalCount.toLocaleString(), l: 'conditions indexed' },
                            { v: specialtyCount.toLocaleString(), l: 'specialties' },
                            { v: '7', l: 'countries · cost mapped' },
                            { v: '15+', l: 'languages' },
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

                    {/* ── Quick actions ─────────────────────────── */}
                    <QuickActionsBar actions={['diagnosis', 'doctors', 'tests', 'travel']} />

                    {/* ── Featured specialties ──────────────────── */}
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
                                {FEATURED_SPECIALTIES.length} featured
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
                            {FEATURED_SPECIALTIES.map((spec, i) => {
                                const cat = categories.find(c => c.specialty === spec.name);
                                const count = cat?.conditions.length || 0;
                                const cols = 4;
                                const isLastCol = (i + 1) % cols === 0;
                                const isLastRow = i >= FEATURED_SPECIALTIES.length - cols;
                                return (
                                    <Link
                                        key={spec.name}
                                        href={`/conditions/${spec.name.toLowerCase()}`}
                                        className="col gap-3"
                                        style={{
                                            padding: '20px 22px',
                                            borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                            borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                        }}
                                    >
                                        <div className="row between ai-center">
                                            <div className="spec-icon">{spec.abbr}</div>
                                            <span
                                                className="mono"
                                                style={{ fontSize: 11, color: 'var(--ink-3)' }}
                                            >
                                                {count.toLocaleString()}
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
                                                {spec.name}
                                            </div>
                                            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                                                {spec.description}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* ── Interactive Explorer ──────────────────── */}
                    <section aria-labelledby="all-conditions-heading">
                        <h2 id="all-conditions-heading" className="sr-only">
                            All medical conditions
                        </h2>
                        <ConditionsExplorer
                            categories={categories}
                            totalCount={totalCount}
                            country={country}
                            lang={lang}
                        />
                    </section>

                    {/* ── Find Doctor / Book Test CTAs ──────────── */}
                    <FindDoctorCTA variant="banner" location={city || undefined} />
                    <BookTestCTA variant="card" />

                    {/* ── FAQ ────────────────────────────────────── */}
                    <section className="col gap-4" aria-labelledby="faq-heading">
                        <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <h2
                                id="faq-heading"
                                className="display"
                                style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                            >
                                Common questions
                            </h2>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: 16,
                            }}
                        >
                            {[
                                {
                                    q: 'How do I find a medical condition?',
                                    a: 'Search by symptom or condition name, or browse by specialty (Cardiology, Neurology, etc.). Each condition page covers symptoms, causes, and treatment options.',
                                },
                                {
                                    q: 'What information is on each condition page?',
                                    a: 'Plain-English overview, common symptoms, causes & risk factors, diagnosis methods, treatment options with costs across seven countries, and matched specialists.',
                                },
                                {
                                    q: 'Are the treatment costs accurate?',
                                    a: 'Costs are estimates from aggregated hospital and clinic data across USA, UK, India, Thailand, Mexico, Turkey, and UAE. Real bills vary by facility and case complexity.',
                                },
                                {
                                    q: 'Can I book a doctor through aihealz?',
                                    a: 'Yes — many doctors offer online booking, video consults, or callback requests directly through the platform.',
                                },
                            ].map(item => (
                                <article key={item.q} className="card" style={{ padding: 24 }}>
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
                                        {item.q}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: 14,
                                            color: 'var(--ink-2)',
                                            lineHeight: 1.6,
                                            margin: 0,
                                        }}
                                    >
                                        {item.a}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* ── AI CTA ─────────────────────────────────── */}
                    <section className="card-ink" style={{ padding: 'clamp(28px, 4vw, 48px)' }}>
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
                                    not sure what to look for?
                                </span>
                                <h3
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
                                    Describe symptoms. <span style={{ color: 'var(--cobalt-3)' }}>Get pointed at the right specialist</span><span style={{ color: 'var(--orange)' }}>.</span>
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
                                    Ask Healz AI in plain language. We&rsquo;ll suggest likely conditions, OTC options where appropriate, and the four specialists most likely to help.
                                </p>
                            </div>
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                <Link href="/symptoms" className="btn btn-cobalt btn-lg">
                                    Consult AI →
                                </Link>
                                <Link
                                    href="/analyze"
                                    className="btn btn-lg"
                                    style={{
                                        background: 'rgba(255,255,255,.08)',
                                        color: 'var(--paper)',
                                        borderColor: 'rgba(255,255,255,.15)',
                                    }}
                                >
                                    Upload report
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* ── Related directories ────────────────────── */}
                    <section
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {[
                            {
                                href: '/treatments',
                                kicker: 'treatments',
                                title: 'Treatments directory',
                                blurb: '10,000+ treatments with global cost comparisons across seven countries.',
                            },
                            {
                                href: '/doctors',
                                kicker: 'doctors',
                                title: 'Find a specialist',
                                blurb: 'Verified doctors filterable by wait time, fee, language, hospital.',
                            },
                            {
                                href: '/medical-travel',
                                kicker: 'travel',
                                title: 'Medical travel',
                                blurb: 'Surgeon match-making, pre-negotiated package pricing, end-to-end concierge.',
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
                                        fontSize: 22,
                                        fontWeight: 600,
                                        margin: 0,
                                        letterSpacing: '-0.025em',
                                    }}
                                >
                                    {item.title}
                                </h3>
                                <p
                                    className="muted"
                                    style={{ fontSize: 14, margin: 0, lineHeight: 1.55 }}
                                >
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
                </div>
            </main>
        </>
    );
}
