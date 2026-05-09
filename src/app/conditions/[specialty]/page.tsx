import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

type PageParams = Promise<{ specialty: string }>;

type ConditionRow = { id: number; commonName: string; slug: string; description: string | null; icdCode: string | null };

/**
 * Deduplicate near-identical conditions that differ only by laterality,
 * specificity, or ICD sub-codes (e.g., left/right/bilateral/unspecified variants).
 * Keeps the most general or first version of each condition family.
 */
function deduplicateConditions(conditions: ConditionRow[]): ConditionRow[] {
    const seen = new Map<string, ConditionRow>();

    for (const c of conditions) {
        const baseKey = c.commonName
            .toLowerCase()
            .replace(/\b(left|right|bilateral|unspecified|unsp)\b/gi, '')
            .replace(/\b(proximal|distal|prox|dist)\b/gi, '')
            .replace(/\b(of r |of l |, bi|, l |, r )\b/gi, ' ')
            .replace(/\b(upper|lower|up|low)\s*(extremity|extrm|extrem)\b/gi, 'extremity')
            .replace(/\b(femoral|popliteal|tibial|iliac|axillary|subclavian|jugular)\s*(vein)?\b/gi, '')
            .replace(/[,()]/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();

        if (!seen.has(baseKey)) {
            seen.set(baseKey, c);
        }
    }

    return [...seen.values()].sort((a, b) => a.commonName.localeCompare(b.commonName));
}

const SPECIALTY_INFO: Record<string, { description: string; specialist: string; bodySystem: string }> = {
    cardiology: { description: 'heart and cardiovascular system disorders including heart disease, arrhythmias, and vascular conditions', specialist: 'Cardiologist', bodySystem: 'Heart & Blood Vessels' },
    neurology: { description: 'brain, spinal cord, and nervous system conditions including stroke, epilepsy, and neurological disorders', specialist: 'Neurologist', bodySystem: 'Brain & Nervous System' },
    orthopedics: { description: 'bone, joint, muscle, and skeletal system conditions including fractures, arthritis, and sports injuries', specialist: 'Orthopedic Surgeon', bodySystem: 'Bones & Joints' },
    dermatology: { description: 'skin, hair, and nail conditions including eczema, psoriasis, and skin infections', specialist: 'Dermatologist', bodySystem: 'Skin & Hair' },
    gastroenterology: { description: 'digestive system disorders including GERD, IBD, liver disease, and gastrointestinal conditions', specialist: 'Gastroenterologist', bodySystem: 'Digestive System' },
    oncology: { description: 'cancer and tumor conditions across all body systems including diagnosis and treatment', specialist: 'Oncologist', bodySystem: 'Various' },
    pulmonology: { description: 'lung and respiratory system conditions including asthma, COPD, and pulmonary diseases', specialist: 'Pulmonologist', bodySystem: 'Lungs & Airways' },
    endocrinology: { description: 'hormone and metabolic disorders including diabetes, thyroid conditions, and hormonal imbalances', specialist: 'Endocrinologist', bodySystem: 'Hormones & Metabolism' },
    psychiatry: { description: 'mental health conditions including depression, anxiety, bipolar disorder, and psychiatric disorders', specialist: 'Psychiatrist', bodySystem: 'Mental Health' },
    ophthalmology: { description: 'eye and vision conditions including cataracts, glaucoma, and eye diseases', specialist: 'Ophthalmologist', bodySystem: 'Eyes & Vision' },
    urology: { description: 'urinary tract and male reproductive system conditions including kidney stones and prostate issues', specialist: 'Urologist', bodySystem: 'Urinary System' },
    gynecology: { description: 'female reproductive system conditions including PCOS, endometriosis, and gynecological disorders', specialist: 'Gynecologist', bodySystem: 'Female Reproductive System' },
    rheumatology: { description: 'autoimmune and joint conditions including rheumatoid arthritis, lupus, and inflammatory diseases', specialist: 'Rheumatologist', bodySystem: 'Joints & Immune System' },
    nephrology: { description: 'kidney and renal system conditions including chronic kidney disease and dialysis care', specialist: 'Nephrologist', bodySystem: 'Kidneys' },
    hematology: { description: 'blood disorders including anemia, leukemia, and blood clotting conditions', specialist: 'Hematologist', bodySystem: 'Blood & Lymph' },
    ent: { description: 'ear, nose, and throat conditions including hearing loss, sinusitis, and ENT disorders', specialist: 'ENT Specialist', bodySystem: 'Ear, Nose & Throat' },
    infectious: { description: 'infectious diseases including viral, bacterial, and parasitic infections', specialist: 'Infectious Disease Specialist', bodySystem: 'Immune System' },
    pediatrics: { description: 'childhood conditions and pediatric diseases affecting infants, children, and adolescents', specialist: 'Pediatrician', bodySystem: 'Child Health' },
    geriatrics: { description: 'age-related conditions and elderly care including dementia and geriatric syndromes', specialist: 'Geriatrician', bodySystem: 'Elderly Health' },
};

const RELATED_SPECIALTIES: Record<string, string[]> = {
    cardiology: ['pulmonology', 'endocrinology', 'nephrology'],
    neurology: ['psychiatry', 'orthopedics', 'ophthalmology'],
    orthopedics: ['rheumatology', 'neurology', 'sports-medicine'],
    dermatology: ['rheumatology', 'infectious', 'oncology'],
    gastroenterology: ['hepatology', 'oncology', 'infectious'],
    oncology: ['hematology', 'radiology', 'surgery'],
    pulmonology: ['cardiology', 'infectious', 'oncology'],
    endocrinology: ['cardiology', 'nephrology', 'gynecology'],
    psychiatry: ['neurology', 'psychology', 'geriatrics'],
    ophthalmology: ['neurology', 'endocrinology', 'rheumatology'],
};

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
    const { specialty } = await params;
    const rawSpec = decodeURIComponent(specialty).replace(/-/g, ' ');
    const specKey = specialty.toLowerCase().replace(/-/g, '');
    const info = SPECIALTY_INFO[specKey];

    const title = `${rawSpec.charAt(0).toUpperCase() + rawSpec.slice(1)} Conditions A-Z | Medical Conditions Directory`;
    const description = info
        ? `Complete list of ${rawSpec} conditions covering ${info.description}. Find symptoms, causes, treatments, and ${info.specialist}s near you.`
        : `Comprehensive A-Z directory of ${rawSpec} medical conditions. Find detailed information about symptoms, treatments, and specialists.`;

    return {
        title,
        description,
        keywords: `${rawSpec} conditions, ${rawSpec} diseases, ${rawSpec} symptoms, ${info?.specialist || rawSpec + ' doctor'}, ${rawSpec} treatment, ${info?.bodySystem || ''} conditions`,
        openGraph: {
            title,
            description,
            url: `https://aihealz.com/conditions/${specialty}`,
            siteName: 'aihealz',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: `https://aihealz.com/conditions/${specialty}`,
        },
    };
}

export default async function SpecialtyConditionsPage({ params }: { params: PageParams }) {
    const { specialty } = await params;
    const rawSpecialty = decodeURIComponent(specialty).replace(/-/g, ' ');
    const specKey = specialty.toLowerCase().replace(/-/g, '');

    const hdrs = await headers();
    const country = hdrs.get('x-aihealz-country') || 'india';
    const lang = hdrs.get('x-aihealz-lang') || 'en';

    const rawConditions = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            specialistType: {
                contains: rawSpecialty.split(' ')[0],
                mode: 'insensitive'
            }
        },
        select: { id: true, commonName: true, slug: true, description: true, icdCode: true },
        orderBy: { commonName: 'asc' },
    });

    if (rawConditions.length === 0) {
        notFound();
    }

    const conditions = deduplicateConditions(rawConditions);

    const info = SPECIALTY_INFO[specKey];
    const relatedSpecs = RELATED_SPECIALTIES[specKey] || [];

    const topCities = await prisma.geography.findMany({
        where: {
            level: 'city',
            isActive: true,
            parent: {
                parent: {
                    slug: country
                }
            }
        },
        select: { name: true, slug: true, parent: { select: { slug: true } } },
        take: 12,
    });

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: 'Medical Conditions', item: 'https://aihealz.com/conditions' },
            { '@type': 'ListItem', position: 3, name: `${rawSpecialty} Conditions`, item: `https://aihealz.com/conditions/${specialty}` },
        ],
    };

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${rawSpecialty} Medical Conditions`,
        description: info?.description || `Medical conditions related to ${rawSpecialty}`,
        numberOfItems: conditions.length,
        itemListElement: conditions.slice(0, 50).map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'MedicalCondition',
                name: c.commonName,
                url: `https://aihealz.com/${country}/${lang}/${c.slug}`,
                code: c.icdCode ? { '@type': 'MedicalCode', codeValue: c.icdCode, codingSystem: 'ICD-10' } : undefined,
            },
        })),
    };

    const specialtySchema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalSpecialty',
        name: rawSpecialty,
        relevantSpecialty: info?.specialist,
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(specialtySchema) }} />

            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 28px 80px' }} className="col gap-7">
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
                        <Link href="/conditions" style={{ color: 'var(--ink-3)' }}>Conditions</Link>
                        <span aria-hidden="true">/</span>
                        <span style={{ color: 'var(--ink)', textTransform: 'capitalize' }}>{rawSpecialty}</span>
                    </nav>

                    {/* Hero */}
                    <header className="col gap-4">
                        <span className="section-mark">specialty / {rawSpecialty.toLowerCase()}</span>
                        <h1
                            className="display"
                            style={{
                                fontSize: 'clamp(40px, 6.5vw, 80px)',
                                lineHeight: 0.95,
                                letterSpacing: '-0.045em',
                                margin: 0,
                                fontWeight: 600,
                                textTransform: 'capitalize',
                            }}
                        >
                            {rawSpecialty}{' '}
                            <span className="num" style={{ color: 'var(--cobalt)', fontWeight: 600 }}>
                                {conditions.length.toLocaleString()}
                            </span>{' '}
                            <span style={{ textTransform: 'lowercase' }}>conditions</span>
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>

                        <p className="lede" style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', maxWidth: 760, margin: 0 }}>
                            {info
                                ? `Complete A–Z directory of ${conditions.length.toLocaleString()} ${rawSpecialty} conditions covering ${info.description}. Symptoms, treatment options, and ${info.specialist}s in your area.`
                                : `A complete A–Z directory of ${conditions.length.toLocaleString()} indexed medical conditions specific to ${rawSpecialty}.`}
                        </p>

                        {/* Stats strip */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: 0,
                                border: '1px solid var(--rule)',
                                borderRadius: 'var(--r-3)',
                                background: 'var(--paper)',
                                overflow: 'hidden',
                                marginTop: 8,
                            }}
                        >
                            <div className="col gap-1" style={{ padding: '20px 22px', borderRight: '1px solid var(--rule)' }}>
                                <div className="display num" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.025em' }}>
                                    {conditions.length.toLocaleString()}
                                </div>
                                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    conditions
                                </div>
                            </div>
                            {info && (
                                <>
                                    <div className="col gap-1" style={{ padding: '20px 22px', borderRight: '1px solid var(--rule)' }}>
                                        <div style={{ fontSize: 15, color: 'var(--cobalt)', fontWeight: 500 }}>
                                            {info.specialist}
                                        </div>
                                        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            specialist
                                        </div>
                                    </div>
                                    <div className="col gap-1" style={{ padding: '20px 22px' }}>
                                        <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>
                                            {info.bodySystem}
                                        </div>
                                        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            body system
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                            <Link
                                href={`/doctors?specialty=${encodeURIComponent(info?.specialist || rawSpecialty)}`}
                                className="btn btn-cobalt"
                            >
                                Find {info?.specialist || rawSpecialty} doctors →
                            </Link>
                            <Link href="/symptoms" className="btn btn-paper">
                                Check symptoms
                            </Link>
                        </div>
                    </header>

                    {/* Cities */}
                    {topCities.length > 0 && (
                        <section className="col gap-3" aria-labelledby="cities-heading">
                            <h2
                                id="cities-heading"
                                className="display"
                                style={{ fontSize: 16, margin: 0, fontWeight: 600, letterSpacing: '-0.015em' }}
                            >
                                <span className="muted" style={{ fontWeight: 400, textTransform: 'capitalize' }}>{rawSpecialty}</span> treatment by city
                            </h2>
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                {topCities.slice(0, 8).map((c) => (
                                    <Link
                                        key={c.slug}
                                        href={`/${country}/${lang}/${conditions[0]?.slug}/${c.parent?.slug}/${c.slug}`}
                                        className="btn btn-sm btn-paper"
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* All conditions */}
                    <section aria-labelledby="conditions-heading" className="col gap-4">
                        <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <h2
                                id="conditions-heading"
                                className="display"
                                style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.025em', textTransform: 'capitalize' }}
                            >
                                All {rawSpecialty} conditions
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
                                {conditions.length.toLocaleString()} indexed
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
                            {conditions.map((cond, i, arr) => {
                                const cols = 4;
                                const isLastCol = (i + 1) % cols === 0;
                                const isLastRow = i >= arr.length - cols;
                                return (
                                    <Link
                                        key={cond.id}
                                        href={`/${country}/${lang}/${cond.slug}`}
                                        className="col gap-2"
                                        style={{
                                            padding: '18px 20px',
                                            borderRight: isLastCol ? 'none' : '1px solid var(--rule-2)',
                                            borderBottom: isLastRow ? 'none' : '1px solid var(--rule-2)',
                                        }}
                                    >
                                        <div className="row between ai-start gap-3">
                                            <h3
                                                className="display truncate-2"
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 500,
                                                    margin: 0,
                                                    letterSpacing: '-0.015em',
                                                    color: 'var(--ink)',
                                                }}
                                            >
                                                {cond.commonName}
                                            </h3>
                                            {cond.icdCode && (
                                                <span
                                                    className="mono"
                                                    style={{
                                                        fontSize: 10,
                                                        color: 'var(--ink-4)',
                                                        flexShrink: 0,
                                                        letterSpacing: '0.04em',
                                                    }}
                                                >
                                                    {cond.icdCode}
                                                </span>
                                            )}
                                        </div>
                                        {cond.description ? (
                                            <p className="muted truncate-2" style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                                                {cond.description}
                                            </p>
                                        ) : (
                                            <p className="muted-2" style={{ fontSize: 12, margin: 0, fontStyle: 'italic' }}>
                                                Symptoms and treatments for {cond.commonName}.
                                            </p>
                                        )}
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                fontWeight: 500,
                                                marginTop: 'auto',
                                            }}
                                        >
                                            View guide →
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Related specialties */}
                    {relatedSpecs.length > 0 && (
                        <section className="col gap-4" aria-labelledby="related-heading">
                            <h2
                                id="related-heading"
                                className="display"
                                style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}
                            >
                                Related specialties
                            </h2>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: 12,
                                }}
                            >
                                {relatedSpecs.map((spec) => (
                                    <Link
                                        key={spec}
                                        href={`/conditions/${spec}`}
                                        className="card-flat col gap-1"
                                        style={{ padding: 18 }}
                                    >
                                        <h3
                                            className="display"
                                            style={{
                                                fontSize: 15,
                                                fontWeight: 500,
                                                margin: 0,
                                                letterSpacing: '-0.015em',
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {spec.replace(/-/g, ' ')}
                                        </h3>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Browse →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Internal links */}
                    <section
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {[
                            {
                                href: '/doctors',
                                kicker: 'doctors',
                                title: `Find ${info?.specialist || 'specialist'}`,
                                blurb: `Connect with verified ${rawSpecialty} specialists.`,
                            },
                            {
                                href: '/treatments',
                                kicker: 'treatments',
                                title: 'Treatment options',
                                blurb: `Browse ${rawSpecialty} treatment procedures and costs.`,
                            },
                            {
                                href: '/hospitals',
                                kicker: 'hospitals',
                                title: 'Top hospitals',
                                blurb: `Best hospitals for ${rawSpecialty} treatment.`,
                            },
                        ].map((item) => (
                            <Link key={item.href} href={item.href} className="card col gap-3" style={{ padding: 24 }}>
                                <div className="kicker">
                                    <span className="dot" />
                                    {item.kicker}
                                </div>
                                <h3
                                    className="display"
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 600,
                                        margin: 0,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {item.title}
                                </h3>
                                <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
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

                    {/* Back to all */}
                    <div className="row center">
                        <Link
                            href="/conditions"
                            className="btn btn-ghost"
                        >
                            ← Browse all medical conditions
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
