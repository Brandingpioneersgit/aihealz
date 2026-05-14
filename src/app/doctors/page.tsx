import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';
import { getGeoContext } from '@/lib/geo-context';
import { AIDiagnosisCTA, BookTestCTA, MedicalTravelCTA } from '@/components/ui/cta-sections';
import MediaTile from '@/components/v4/MediaTile';
import { HOSPITAL_IMAGES } from '@/lib/stock-images';
import {
    generateItemListSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
    generateWebPageSchema,
    generateFAQSchema,
} from '@/lib/structured-data';

export const revalidate = 86400;

function formatDoctorName(name: string): string {
    const trimmed = name.trim();
    if (/^dr\.?\s+/i.test(trimmed)) return trimmed;
    return `Dr. ${trimmed}`;
}

export const metadata: Metadata = {
    title: 'Doctors directory — verified specialists worldwide | aihealz',
    description:
        'Credential-checked specialists, filterable by wait time, fee, language, hospital. 8,200+ doctors across 50+ countries — every profile reviewed before it goes live.',
    keywords: 'find doctors, top doctors, medical specialists, verified physicians, doctor directory, healthcare providers',
    alternates: { canonical: '/doctors' },
    openGraph: {
        type: 'website',
        title: 'Doctors directory — verified specialists worldwide',
        description:
            'Credential-checked specialists in 50+ countries. Compare ratings, fees, wait times.',
        url: 'https://aihealz.com/doctors',
        siteName: 'aihealz',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Doctors directory — verified specialists worldwide',
        description: 'Credential-checked specialists in 50+ countries.',
    },
};

interface GeoNode {
    id: number;
    name: string;
    slug: string;
    level: string;
    parentId: number | null;
}

const SPECIALTIES = [
    { name: 'General Physician', slug: 'general-physician', abbr: 'GP', category: 'primary care' },
    { name: 'Cardiologist', slug: 'cardiologist', abbr: 'CD', category: 'specialist' },
    { name: 'Dermatologist', slug: 'dermatologist', abbr: 'DR', category: 'specialist' },
    { name: 'Neurologist', slug: 'neurologist', abbr: 'NR', category: 'specialist' },
    { name: 'Orthopedist', slug: 'orthopedist', abbr: 'OR', category: 'specialist' },
    { name: 'Pediatrician', slug: 'pediatrician', abbr: 'PD', category: 'pediatric' },
    { name: 'Gynecologist', slug: 'gynecologist', abbr: 'GY', category: "women's health" },
    { name: 'Dentist', slug: 'dentist', abbr: 'DN', category: 'dental' },
    { name: 'Psychiatrist', slug: 'psychiatrist', abbr: 'PS', category: 'mental health' },
    { name: 'Ophthalmologist', slug: 'ophthalmologist', abbr: 'OP', category: 'eye care' },
    { name: 'ENT Specialist', slug: 'ent-specialist', abbr: 'EN', category: 'ENT' },
    { name: 'General Surgeon', slug: 'general-surgeon', abbr: 'SU', category: 'surgeon' },
];

const POPULAR_SEARCHES = [
    'Top 10 cardiologists',
    'Best dermatologist near me',
    'Pediatrician for kids',
    'Affordable dentist',
    'Best orthopedic surgeon',
    'Women gynecologist',
];

export default async function DoctorsDirectory() {
    const geo = await getGeoContext();

    let userCountryGeoId: number | null = null;
    let userCityGeoId: number | null = null;

    if (geo.countrySlug) {
        const userGeos = await prisma.geography.findMany({
            where: {
                slug: { in: [geo.countrySlug, geo.citySlug].filter(Boolean) as string[] },
                isActive: true,
            },
            select: { id: true, slug: true, level: true },
        });
        for (const g of userGeos) {
            if (g.level === 'country') userCountryGeoId = g.id;
            if (g.level === 'city' || g.level === 'state') userCityGeoId = g.id;
        }
    }
    void userCityGeoId;

    const doctorWhere: { isVerified?: boolean; geographyId?: { in: number[] } } = {};
    let geoIds: number[] = [];

    if (userCountryGeoId) {
        const countryGeoIds = await prisma.geography.findMany({
            where: {
                OR: [{ id: userCountryGeoId }, { parentId: userCountryGeoId }],
                isActive: true,
            },
            select: { id: true },
        });
        geoIds = countryGeoIds.map(g => g.id);

        if (geoIds.length > 0) {
            const citiesUnderStates = await prisma.geography.findMany({
                where: { parentId: { in: geoIds }, isActive: true },
                select: { id: true },
            });
            geoIds.push(...citiesUnderStates.map(g => g.id));

            const localitiesUnderCities = await prisma.geography.findMany({
                where: { parentId: { in: geoIds }, isActive: true },
                select: { id: true },
            });
            geoIds.push(...localitiesUnderCities.map(g => g.id));
        }

        if (geoIds.length > 0) doctorWhere.geographyId = { in: geoIds };
    }

    const [doctors, allGeos] = await Promise.all([
        prisma.doctorProvider.findMany({
            where: doctorWhere,
            orderBy: { badgeScore: 'desc' },
            take: 24,
            include: {
                specialties: { include: { condition: true } },
                geography: { select: { name: true } },
            },
        }),
        prisma.geography.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, level: true, parentId: true },
        }),
    ]);

    const countries = allGeos.filter(g => g.level === 'country');
    const statesByParent = new Map<number, GeoNode[]>();
    const citiesByParent = new Map<number, GeoNode[]>();

    for (const g of allGeos) {
        if (g.level === 'state' && g.parentId) {
            if (!statesByParent.has(g.parentId)) statesByParent.set(g.parentId, []);
            statesByParent.get(g.parentId)!.push(g);
        }
        if (g.level === 'city' && g.parentId) {
            if (!citiesByParent.has(g.parentId)) citiesByParent.set(g.parentId, []);
            citiesByParent.get(g.parentId)!.push(g);
        }
    }

    const totalStates = allGeos.filter(g => g.level === 'state').length;
    const totalCities = allGeos.filter(g => g.level === 'city').length;
    const totalDoctors = doctors.length;

    const userCountry = geo.countrySlug
        ? allGeos.find(g => g.slug === geo.countrySlug && g.level === 'country')
        : null;
    const userCity = geo.citySlug
        ? allGeos.find(g => g.slug === geo.citySlug)
        : null;

    const locationDisplay =
        userCity && userCountry
            ? `${userCity.name}, ${userCountry.name}`
            : userCountry?.name || null;

    const doctorFaqs = [
        {
            question: 'How do I find a specialist near me?',
            answer:
                'Use the location-aware search. We pre-filter by your detected city or country and rank doctors by credentials, wait time, and patient reviews.',
        },
        {
            question: 'Are doctors verified on aihealz?',
            answer:
                'Every "verified" badge means we\'ve checked the medical license, hospital affiliation, and at least three years of practice history. We re-check yearly.',
        },
        {
            question: 'Can I book online?',
            answer:
                'Many doctors on aihealz offer online booking, video consults, or callback requests. Look for the booking pill on their profile.',
        },
        {
            question: 'How are doctor ratings calculated?',
            answer:
                'Ratings come from verified post-visit reviews and aggregated outcome data. We weight recent reviews higher and exclude unverified comments.',
        },
    ];

    const structuredData = [
        generateWebPageSchema(
            'Doctors directory — verified specialists worldwide',
            'Credential-checked specialists across 50+ countries. Compare ratings, fees, wait times, languages.',
            'https://aihealz.com/doctors'
        ),
        generateOrganizationSchema(),
        generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Doctors', url: '/doctors' },
        ]),
        generateItemListSchema(
            'Top rated doctors',
            'Verified specialists worldwide',
            doctors.slice(0, 10).map((doc, i) => ({
                name: doc.name,
                url: `/doctor/${doc.slug}`,
                position: i + 1,
            }))
        ),
        generateFAQSchema(doctorFaqs),
    ];

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px clamp(16px, 4vw, 28px) 64px' }} className="col gap-7">
                {/* ── Hero banner image ─────────────────── */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '32 / 9',
                        maxHeight: 340,
                        overflow: 'hidden',
                        borderRadius: 'var(--r-3, 8px)',
                        border: '1px solid var(--rule)',
                    }}
                >
                    <MediaTile
                        alt={HOSPITAL_IMAGES.consultation.alt}
                        icon={HOSPITAL_IMAGES.consultation.icon}
                        tone="cobalt"
                        aspect="32 / 9"
                        iconSize={88}
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
                        ● the index / verified doctors
                    </span>
                </div>

                {/* ── Hero ────────────────────────────────── */}
                <div className="col gap-4">
                    <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <span className="section-mark">the index / verified doctors</span>
                        {locationDisplay && (
                            <span className="pill pill-cobalt" style={{ textTransform: 'none' }}>
                                Showing {locationDisplay} ·{' '}
                                <Link href="/doctors" style={{ color: 'inherit', opacity: 0.7 }}>
                                    view all
                                </Link>
                            </span>
                        )}
                    </div>
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
                            {totalDoctors.toLocaleString()}
                        </span>{' '}
                        doctors
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 640 }}>
                        Credential-checked. Patient-rated. Filterable by what actually matters — wait time, fee, language, hospital.
                        {userCountry
                            ? ` Showing ${userCountry.name} first; ${countries.length} countries indexed.`
                            : ` ${countries.length} countries · ${totalStates} states · ${totalCities} cities indexed.`}
                    </p>
                    <div style={{ maxWidth: 720 }}>
                        <SearchAutocomplete variant="bureau" placeholder="Search by name, condition, or specialty" />
                    </div>
                </div>

                {/* ── Browse by Specialty ─────────────────── */}
                <section className="col gap-4">
                    <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <h2 className="display" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
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
                            {SPECIALTIES.length} categories
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
                        {SPECIALTIES.map((spec, i) => {
                            const cols = 4; // approximate columns at desktop width
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= SPECIALTIES.length - cols;
                            return (
                                <Link
                                    key={spec.slug}
                                    href={`/doctors/specialty/${spec.slug}`}
                                    className="col gap-3"
                                    style={{
                                        padding: '20px 22px',
                                        borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div className="row between ai-center">
                                        <div className="spec-icon">{spec.abbr}</div>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            {spec.category}
                                        </span>
                                    </div>
                                    <div>
                                        <div
                                            className="display"
                                            style={{ fontSize: 18, letterSpacing: '-0.02em', fontWeight: 500 }}
                                        >
                                            {spec.name}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Popular searches */}
                    <div
                        className="row gap-2 ai-center"
                        style={{ flexWrap: 'wrap', marginTop: 4 }}
                    >
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                marginRight: 4,
                            }}
                        >
                            popular
                        </span>
                        {POPULAR_SEARCHES.map(k => (
                            <span key={k} className="pill" style={{ textTransform: 'none' }}>
                                {k}
                            </span>
                        ))}
                    </div>

                    <AIDiagnosisCTA
                        variant="inline"
                        title="Not sure which specialist you need?"
                        subtitle="Drop your lab report — we'll narrow this list to the four doctors most likely to help."
                    />
                </section>

                {/* ── Browse by Location ──────────────────── */}
                <section className="col gap-4">
                    <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <h2 className="display" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                            Browse by location
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
                            {countries.length} countries
                        </span>
                    </div>

                    <div className="col gap-3">
                        {countries.map(country => {
                            const states = statesByParent.get(country.id) || [];
                            return (
                                <div
                                    key={country.id}
                                    className="card"
                                    style={{ padding: 0, overflow: 'hidden' }}
                                >
                                    <Link
                                        href={`/doctors/${country.slug}`}
                                        className="row ai-center between hairline-b"
                                        style={{ padding: '16px 20px' }}
                                    >
                                        <div className="row gap-3 ai-center">
                                            <div className="spec-icon">
                                                {country.slug.toUpperCase().slice(0, 2)}
                                            </div>
                                            <div className="col">
                                                <h3
                                                    className="display"
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: 500,
                                                        margin: 0,
                                                        letterSpacing: '-0.015em',
                                                    }}
                                                >
                                                    {country.name}
                                                </h3>
                                                <div className="muted" style={{ fontSize: 12 }}>
                                                    {states.length}{' '}
                                                    {states.length === 1 ? 'state/province' : 'states/provinces'}
                                                </div>
                                            </div>
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
                                            View →
                                        </span>
                                    </Link>

                                    {states.length > 0 && (
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                    'repeat(auto-fill, minmax(220px, 1fr))',
                                                gap: 0,
                                            }}
                                        >
                                            {states.map((state, sIdx) => {
                                                const cities = citiesByParent.get(state.id) || [];
                                                const cols = 3;
                                                const isLastCol = (sIdx + 1) % cols === 0;
                                                const isLastRow = sIdx >= states.length - cols;
                                                return (
                                                    <div
                                                        key={state.id}
                                                        style={{
                                                            padding: '16px 20px',
                                                            borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                                            borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                                        }}
                                                    >
                                                        <Link
                                                            href={`/doctors/${state.slug}`}
                                                            style={{
                                                                fontSize: 14,
                                                                fontWeight: 500,
                                                                color: 'var(--ink)',
                                                            }}
                                                        >
                                                            {state.name}
                                                        </Link>
                                                        {cities.length > 0 && (
                                                            <div
                                                                className="row gap-1"
                                                                style={{ flexWrap: 'wrap', marginTop: 6 }}
                                                            >
                                                                {cities.slice(0, 12).map(city => (
                                                                    <Link
                                                                        key={city.id}
                                                                        href={`/doctors/${city.slug}`}
                                                                        className="mono"
                                                                        style={{
                                                                            fontSize: 11,
                                                                            color: 'var(--ink-3)',
                                                                            padding: '2px 6px',
                                                                            borderRadius: 'var(--r-1)',
                                                                            border: '1px solid var(--rule)',
                                                                        }}
                                                                    >
                                                                        {city.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Top Specialists Grid ────────────────── */}
                {doctors.length > 0 && (
                    <section className="col gap-4">
                        <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <h2 className="display" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                                Top specialists
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
                                {doctors.length} shown
                            </span>
                        </div>

                        <div className="col gap-3">
                            {doctors.map(doc => {
                                const score = Number(doc.badgeScore || 0);
                                const isTop = score > 90;
                                const specialty =
                                    doc.specialties[0]?.condition?.specialistType ||
                                    doc.specialties[0]?.condition?.commonName ||
                                    doc.badgeLabel ||
                                    'Specialist';
                                const initials = doc.name
                                    .split(' ')
                                    .filter(Boolean)
                                    .slice(-1)[0]
                                    ?.slice(0, 2)
                                    .toUpperCase() || 'DR';

                                return (
                                    <Link
                                        key={doc.id}
                                        href={`/doctor/${doc.slug}`}
                                        className="card"
                                        style={{
                                            padding: 20,
                                            display: 'block',
                                            borderColor: isTop ? 'var(--cobalt)' : 'var(--rule)',
                                            position: 'relative',
                                            color: 'var(--ink)',
                                        }}
                                    >
                                        <div className="row gap-4 ai-start" style={{ flexWrap: 'wrap' }}>
                                            <div
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: 'var(--r-2)',
                                                    overflow: 'hidden',
                                                    flexShrink: 0,
                                                    background: 'var(--bg-2)',
                                                    border: '1px solid var(--rule)',
                                                }}
                                            >
                                                {doc.profileImage ? (
                                                    <AvatarWithFallback
                                                        src={doc.profileImage}
                                                        alt={doc.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="row ai-center center"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            fontFamily: 'var(--display)',
                                                            fontSize: 18,
                                                            fontWeight: 600,
                                                            color: 'var(--ink-2)',
                                                        }}
                                                    >
                                                        {initials}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col" style={{ flex: 1, minWidth: 0 }}>
                                                <div className="row between ai-start" style={{ gap: 12, flexWrap: 'wrap' }}>
                                                    <div className="col gap-1" style={{ minWidth: 0 }}>
                                                        <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                                                            <span
                                                                className="display"
                                                                style={{
                                                                    fontSize: 20,
                                                                    fontWeight: 500,
                                                                    letterSpacing: '-0.02em',
                                                                }}
                                                            >
                                                                {formatDoctorName(doc.name)}
                                                            </span>
                                                            {isTop && (
                                                                <span className="pill pill-cobalt">top match</span>
                                                            )}
                                                        </div>
                                                        <div className="muted" style={{ fontSize: 13 }}>
                                                            {specialty}
                                                            {doc.experienceYears
                                                                ? ` · ${doc.experienceYears} yrs`
                                                                : ''}
                                                        </div>
                                                        {doc.geography?.name && (
                                                            <div className="muted" style={{ fontSize: 13 }}>
                                                                {doc.geography.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col ai-end gap-1">
                                                        <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>
                                                            ★ {doc.rating ? Number(doc.rating).toFixed(1) : '5.0'}
                                                        </div>
                                                        {doc.consultationFee != null && (
                                                            <div className="num" style={{ fontSize: 13 }}>
                                                                {doc.feeCurrency} {Number(doc.consultationFee)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="row gap-2" style={{ marginTop: 12, flexWrap: 'wrap' }}>
                                                    {doc.isVerified && (
                                                        <span className="pill pill-mint">verified</span>
                                                    )}
                                                    <span className="pill">{doc.availableOnline ? 'in-person · tele' : 'in-person'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {doctors.length === 0 && (
                    <div
                        className="card"
                        style={{
                            padding: 48,
                            textAlign: 'center',
                            borderStyle: 'dashed',
                        }}
                    >
                        <h3 className="display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                            Network syncing
                        </h3>
                        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                            The provider database is currently populating. Please check back shortly.
                        </p>
                    </div>
                )}

                {/* ── CTAs ────────────────────────────────── */}
                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                        gap: 16,
                    }}
                >
                    <BookTestCTA variant="card" />
                    <div className="card-ink" style={{ padding: 24 }}>
                        <div className="kicker" style={{ color: 'var(--cobalt-3)', marginBottom: 8 }}>
                            <span className="dot" style={{ background: 'var(--cobalt-3)' }} />treatment abroad
                        </div>
                        <h3
                            className="display"
                            style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2, color: 'var(--paper)', margin: 0 }}
                        >
                            Same surgery, a fifth of the bill<span style={{ color: 'var(--orange)' }}>.</span>
                        </h3>
                        <p
                            style={{
                                fontSize: 14,
                                color: 'rgba(255,255,255,.7)',
                                lineHeight: 1.55,
                                marginTop: 10,
                            }}
                        >
                            Compare treatment costs across seven countries — visa, flight, recovery suite handled.
                        </p>
                        <div style={{ marginTop: 14 }}>
                            <MedicalTravelCTA variant="mini" />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
