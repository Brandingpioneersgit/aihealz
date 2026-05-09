import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';
import { getGeoContext } from '@/lib/geo-context';

type PageParams = Promise<{ specialty: string }>;

function formatDoctorName(name: string): string {
    const trimmed = name.trim();
    if (/^dr\.?\s+/i.test(trimmed)) {
        return trimmed;
    }
    return `Dr. ${trimmed}`;
}

const CATEGORY_PILL: Record<string, string> = {
    'Primary Care': 'pill-mint',
    'Specialist': 'pill-cobalt',
    'Surgeon': 'pill-orange',
    'Pediatric': 'pill-magenta',
    "Women's Health": 'pill-magenta',
    'Dental': 'pill-cobalt',
    'Mental Health': 'pill-magenta',
    'Eye Care': 'pill-lemon',
    'ENT': 'pill-mint',
};

function getCategoryPill(label: string | null): { label: string; cls: string } {
    if (!label) return { label: 'Specialist', cls: 'pill' };
    return { label, cls: `pill ${CATEGORY_PILL[label] || ''}`.trim() };
}

function formatSpecialtyTitle(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getSpecialtyVariants(title: string): string[] {
    const variants: string[] = [title];
    const lower = title.toLowerCase();

    if (lower.endsWith('ist')) {
        variants.push(title.slice(0, -3) + 'ogy');
        variants.push(title.slice(0, -3) + 'y');
    }
    if (lower.endsWith('ology')) {
        variants.push(title.slice(0, -5) + 'ologist');
    }
    if (lower.endsWith('ogy')) {
        variants.push(title.slice(0, -3) + 'ogist');
    }
    if (lower.endsWith('logist')) {
        variants.push(title.slice(0, -5) + 'ogy');
    }
    if (lower.includes('physician')) {
        variants.push('General Practice', 'Internal Medicine', 'Family Medicine');
    }
    if (lower.includes('orthop')) {
        variants.push('Orthopedics', 'Orthopedic Surgery', 'Orthopedist', 'Orthopaedics');
    }
    if (lower.includes('ent') || lower.includes('otolaryngology')) {
        variants.push('ENT', 'Otolaryngology', 'ENT Specialist', 'Ear Nose Throat');
    }
    if (lower.includes('dent')) {
        variants.push('Dentist', 'Dentistry', 'Dental', 'Dental Surgeon');
    }

    return [...new Set(variants)];
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
    const { specialty } = await params;
    const title = formatSpecialtyTitle(specialty);

    return {
        title: `Top ${title}s Near You | Best ${title} Doctors | aihealz`,
        description: `Find the best ${title.toLowerCase()}s near you. Compare ratings, read reviews, and book appointments with top-rated ${title.toLowerCase()} doctors. Verified specialists with years of experience.`,
        keywords: `best ${title.toLowerCase()}, top ${title.toLowerCase()}, ${title.toLowerCase()} near me, ${title.toLowerCase()} doctor, find ${title.toLowerCase()}, ${title.toLowerCase()} specialist`,
        openGraph: {
            title: `Top ${title}s — Find Best ${title} Doctors Near You`,
            description: `Browse verified ${title.toLowerCase()}s. Compare ratings, experience, and book consultations.`,
            url: `https://aihealz.com/doctors/specialty/${specialty}`,
        },
    };
}

export default async function SpecialtyDoctorsPage({ params }: { params: PageParams }) {
    const { specialty } = await params;

    if (!/^[a-z][a-z0-9-]{1,59}$/.test(specialty)) {
        notFound();
    }

    const specialtyTitle = formatSpecialtyTitle(specialty);

    const geo = await getGeoContext();

    let geoIds: number[] = [];
    if (geo.countrySlug) {
        const userGeos = await prisma.geography.findMany({
            where: {
                OR: [
                    { slug: geo.countrySlug, level: 'country' },
                    { slug: geo.citySlug || '', level: 'city' },
                ],
                isActive: true,
            },
            select: { id: true },
        });

        if (userGeos.length > 0) {
            const countryId = userGeos.find(g => g.id)?.id;
            if (countryId) {
                const descendants = await prisma.geography.findMany({
                    where: {
                        OR: [
                            { id: countryId },
                            { parentId: countryId },
                        ],
                        isActive: true,
                    },
                    select: { id: true },
                });
                geoIds = descendants.map(g => g.id);

                if (geoIds.length > 0) {
                    const cities = await prisma.geography.findMany({
                        where: { parentId: { in: geoIds }, isActive: true },
                        select: { id: true },
                    });
                    geoIds.push(...cities.map(g => g.id));
                }
            }
        }
    }

    const specialtyVariants = getSpecialtyVariants(specialtyTitle);

    const doctors = await prisma.doctorProvider.findMany({
        where: {
            isVerified: true,
            specialties: {
                some: {
                    condition: {
                        OR: [
                            ...specialtyVariants.map(variant => ({
                                specialistType: { contains: variant, mode: 'insensitive' as const }
                            })),
                            ...specialtyVariants.map(variant => ({
                                commonName: { contains: variant, mode: 'insensitive' as const }
                            })),
                        ],
                    },
                },
            },
            ...(geoIds.length > 0 ? { geographyId: { in: geoIds } } : {}),
        },
        orderBy: [
            { subscriptionTier: 'desc' },
            { badgeScore: 'desc' },
            { rating: 'desc' },
        ],
        take: 50,
        include: {
            specialties: { include: { condition: { select: { commonName: true, specialistType: true } } } },
            geography: {
                include: {
                    parent: { select: { name: true, slug: true } },
                },
            },
        },
    });

    if (doctors.length === 0) {
        return (
            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 28px 80px' }} className="col gap-7">
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
                        <Link href="/doctors" style={{ color: 'var(--ink-3)' }}>Doctors</Link>
                        <span aria-hidden="true">/</span>
                        <span style={{ color: 'var(--ink)' }}>{specialtyTitle}</span>
                    </nav>

                    <div className="card col gap-4 ai-center" style={{ padding: 64, textAlign: 'center' }}>
                        <span className="pill">no results</span>
                        <h1
                            className="display"
                            style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}
                        >
                            No {specialtyTitle}s found yet
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 420 }}>
                            We&apos;re currently expanding our network of {specialtyTitle.toLowerCase()}s.
                            Check back soon or browse our other specialties.
                        </p>
                        <Link href="/doctors" className="btn btn-cobalt">
                            Browse all doctors →
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const relatedSpecialties = [
        'cardiologist', 'dermatologist', 'neurologist', 'orthopedist',
        'gastroenterologist', 'pediatrician', 'gynecologist', 'dentist',
        'psychiatrist', 'ophthalmologist', 'ent-specialist', 'general-physician'
    ].filter(s => s !== specialty);

    const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
        'uae': 'UAE', 'usa': 'USA', 'uk': 'UK',
        'india': 'India', 'nigeria': 'Nigeria', 'kenya': 'Kenya',
        'germany': 'Germany', 'france': 'France', 'spain': 'Spain',
        'australia': 'Australia', 'canada': 'Canada', 'brazil': 'Brazil',
        'saudi-arabia': 'Saudi Arabia', 'south-africa': 'South Africa',
    };

    const locationDisplay = geo.citySlug
        ? doctors[0]?.geography?.name
        : (geo.countrySlug ? COUNTRY_DISPLAY_NAMES[geo.countrySlug.toLowerCase()] || geo.countrySlug.charAt(0).toUpperCase() + geo.countrySlug.slice(1) : '');

    return (
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
                    <Link href="/doctors" style={{ color: 'var(--ink-3)' }}>Doctors</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>{specialtyTitle}</span>
                </nav>

                {/* Hero */}
                <header className="col gap-4">
                    <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                        <span className="section-mark">specialty / {specialty}</span>
                        <span className="pill pill-mint">
                            <span className="pill-dot" style={{ background: 'var(--mint)' }} aria-hidden="true" />
                            {doctors.length} verified
                        </span>
                    </div>
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
                        Top <span style={{ color: 'var(--cobalt)' }}>{specialtyTitle}s</span>
                        {locationDisplay && (
                            <>
                                {' '}<span className="muted" style={{ fontWeight: 500 }}>in {locationDisplay}</span>
                            </>
                        )}
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', maxWidth: 720, margin: 0 }}>
                        Find and compare the best {specialtyTitle.toLowerCase()}s. All doctors are verified with credentials checked.
                    </p>

                    {/* Keyword pills */}
                    <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                        {[
                            `Best ${specialtyTitle}`,
                            `Top 10 ${specialtyTitle}s`,
                            `${specialtyTitle} near me`,
                            `Affordable ${specialtyTitle}`,
                            `Experienced ${specialtyTitle}`,
                        ].map((keyword) => (
                            <span key={keyword} className="pill">{keyword}</span>
                        ))}
                    </div>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 1fr)',
                        gap: 32,
                    }}
                >
                    {/* Doctors grid */}
                    <section aria-labelledby="doctors-heading" className="col gap-4">
                        <h2 id="doctors-heading" className="sr-only">Doctors</h2>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: 16,
                            }}
                        >
                            {doctors.map((doc, index) => {
                                const category = getCategoryPill(doc.badgeLabel);
                                const isTop = index < 3;

                                return (
                                    <Link
                                        key={doc.id}
                                        href={`/doctor/${doc.slug}`}
                                        className="card col"
                                        style={{ padding: 0, overflow: 'hidden' }}
                                    >
                                        {isTop && (
                                            <div
                                                className="row gap-2 ai-center mono"
                                                style={{
                                                    padding: '8px 14px',
                                                    background: 'var(--ink)',
                                                    color: 'var(--paper)',
                                                    fontSize: 11,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                <span className="num" style={{ color: 'var(--cobalt-3)' }}>#{index + 1}</span>
                                                top rated
                                            </div>
                                        )}

                                        {/* Image / portrait */}
                                        <div
                                            style={{
                                                position: 'relative',
                                                aspectRatio: '4 / 3',
                                                background: 'var(--bg-2)',
                                                borderBottom: '1px solid var(--rule)',
                                            }}
                                        >
                                            {doc.profileImage ? (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                    }}
                                                >
                                                    <AvatarWithFallback
                                                        src={doc.profileImage}
                                                        alt={doc.name}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="placeholder"
                                                    style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        borderRadius: 0,
                                                        border: 'none',
                                                    }}
                                                >
                                                    {doc.name.charAt(0)}
                                                </div>
                                            )}
                                            <div style={{ position: 'absolute', top: 10, left: 10 }}>
                                                <span className={category.cls}>{category.label}</span>
                                            </div>
                                            {doc.subscriptionTier === 'premium' && (
                                                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                                                    <span className="pill pill-cobalt">premium</span>
                                                </div>
                                            )}
                                            <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                                                <span className="pill" style={{ background: 'var(--paper)' }}>
                                                    <svg width="10" height="10" viewBox="0 0 20 20" fill="var(--lemon-2)" aria-hidden="true">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {doc.rating ? Number(doc.rating).toFixed(1) : '5.0'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col gap-2" style={{ padding: 16, flex: 1 }}>
                                            <div className="col gap-1">
                                                <h3
                                                    className="display"
                                                    style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}
                                                >
                                                    {formatDoctorName(doc.name)}
                                                </h3>
                                                {doc.specialties.length > 0 && (
                                                    <p
                                                        className="mono"
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'var(--cobalt)',
                                                            margin: 0,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.06em',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {doc.specialties[0].condition?.specialistType || doc.specialties[0].condition?.commonName || specialtyTitle}
                                                    </p>
                                                )}
                                            </div>

                                            <ul className="clean col gap-1" style={{ marginTop: 4 }}>
                                                {doc.geography && (
                                                    <li className="row gap-2 ai-center muted" style={{ fontSize: 12 }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {doc.geography.name}{doc.geography.parent ? `, ${doc.geography.parent.name}` : ''}
                                                        </span>
                                                    </li>
                                                )}
                                                {doc.experienceYears && (
                                                    <li className="row gap-2 ai-center muted" style={{ fontSize: 12 }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{doc.experienceYears}+ years</span>
                                                    </li>
                                                )}
                                                {doc.consultationFee && (
                                                    <li className="row gap-2 ai-center muted num" style={{ fontSize: 12 }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{doc.feeCurrency} {Number(doc.consultationFee).toLocaleString()}</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Sidebar */}
                    <aside className="col gap-4">
                        {/* Other specialties */}
                        <div className="card col" style={{ padding: 0 }}>
                            <div className="hairline-b" style={{ padding: '16px 20px' }}>
                                <h3
                                    className="display"
                                    style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}
                                >
                                    Other specialties
                                </h3>
                            </div>
                            <ul className="clean col" style={{ margin: 0 }}>
                                {relatedSpecialties.slice(0, 10).map((spec, i, arr) => (
                                    <li key={spec}>
                                        <Link
                                            href={`/doctors/specialty/${spec}`}
                                            className="row between ai-center"
                                            style={{
                                                padding: '10px 20px',
                                                fontSize: 13,
                                                color: 'var(--ink-2)',
                                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule-2)' : 'none',
                                            }}
                                        >
                                            <span>{formatSpecialtyTitle(spec)}s</span>
                                            <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)' }}>→</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* AI helper */}
                        <div className="card-ink col gap-3" style={{ padding: 20 }}>
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
                                need help finding?
                            </span>
                            <h3
                                className="display"
                                style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--paper)', letterSpacing: '-0.015em' }}
                            >
                                Ask AI to match you.
                            </h3>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', margin: 0, lineHeight: 1.5 }}>
                                We&apos;ll suggest the right {specialtyTitle.toLowerCase()} based on your situation.
                            </p>
                            <Link
                                href="/healz-ai"
                                className="btn btn-cobalt btn-sm"
                                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                            >
                                Ask AI →
                            </Link>
                        </div>

                        {/* Browse by location */}
                        <div className="card col gap-2" style={{ padding: 20 }}>
                            <h3
                                className="display"
                                style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}
                            >
                                Browse by location
                            </h3>
                            <Link
                                href="/doctors"
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    fontWeight: 500,
                                }}
                            >
                                View all locations →
                            </Link>
                        </div>
                    </aside>
                </div>

                {/* SEO content */}
                <section className="card col gap-4" style={{ padding: 32 }}>
                    <h2
                        className="display"
                        style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}
                    >
                        About {specialtyTitle}s
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>
                        A {specialtyTitle.toLowerCase()} is a medical professional specializing in diagnosing and treating
                        conditions related to their area of expertise. On aihealz, all {specialtyTitle.toLowerCase()}s are
                        verified with credential checks and patient reviews.
                    </p>

                    <div className="hairline" />

                    <h3
                        className="display"
                        style={{ fontSize: 16, margin: 0, fontWeight: 600, letterSpacing: '-0.015em' }}
                    >
                        When to see a {specialtyTitle}?
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>
                        Consider consulting a {specialtyTitle.toLowerCase()} when you experience symptoms related to their
                        specialty, need a second opinion, or require specialized treatment that your primary care physician
                        cannot provide.
                    </p>

                    <div className="hairline" />

                    <h3
                        className="display"
                        style={{ fontSize: 16, margin: 0, fontWeight: 600, letterSpacing: '-0.015em' }}
                    >
                        How to choose the best {specialtyTitle}?
                    </h3>
                    <ul className="clean col gap-2">
                        {[
                            'Check their qualifications and credentials',
                            'Read patient reviews and ratings',
                            'Consider their experience treating your specific condition',
                            'Look for doctors affiliated with reputable hospitals',
                            'Compare consultation fees and availability',
                        ].map((item) => (
                            <li key={item} className="row gap-2 ai-baseline">
                                <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 14 }}>—</span>
                                <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </main>
    );
}
