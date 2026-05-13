import prisma from '@/lib/db';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MediaGallery from '@/components/ui/media-gallery';

type PageParams = Promise<{ slug: string }>;

// Helper function to format doctor name without double "Dr." prefix
function formatDoctorName(name: string): string {
    const trimmed = name.trim();
    // Check for various "Dr." patterns at the start
    if (/^dr\.?\s+/i.test(trimmed)) {
        return trimmed; // Already has Dr. prefix
    }
    return `Dr. ${trimmed}`;
}

// Detect obvious placeholder phone numbers that shouldn't be displayed
function isPlaceholderPhone(phone: string): boolean {
    if (!phone) return true;
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    // Common placeholder patterns
    const placeholderPatterns = [
        /^555\d{7}$/,           // 555 numbers (US fake)
        /1234567890$/,          // Obvious sequential
        /9876543210$/,          // Reverse sequential
        /0000000000$/,          // All zeros
        /1111111111$/,          // All ones
        /^0{7,}$/,              // Multiple zeros
    ];
    return placeholderPatterns.some(pattern => pattern.test(cleaned));
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
    const { slug } = await params;

    const doctor = await prisma.doctorProvider.findUnique({
        where: { slug },
        select: {
            name: true,
            qualifications: true,
            experienceYears: true,
            bio: true,
            specialties: { select: { condition: { select: { commonName: true, specialistType: true } } } },
            geography: { select: { name: true, parent: { select: { name: true } } } },
        },
    });

    if (!doctor) {
        return { title: 'Doctor Not Found | aihealz' };
    }

    const specialty = doctor.specialties[0]?.condition?.specialistType || doctor.specialties[0]?.condition?.commonName || 'Medical';
    const location = doctor.geography?.name || '';
    const quals = doctor.qualifications?.slice(0, 3).join(', ') || '';

    const displayName = formatDoctorName(doctor.name);
    const title = `${displayName} - ${specialty} | ${location} | aihealz`;
    const description = doctor.bio?.slice(0, 155) ||
        `${formatDoctorName(doctor.name)} is a ${specialty} specialist${location ? ` in ${location}` : ''}${doctor.experienceYears ? ` with ${doctor.experienceYears}+ years of experience` : ''}. ${quals}. Book appointment online.`;

    return {
        title,
        description,
        keywords: `Dr ${doctor.name}, ${specialty} ${location}, ${specialty} doctor, best ${specialty.toLowerCase()}, ${location} doctors`,
        openGraph: {
            title,
            description,
            url: `https://aihealz.com/doctor/${slug}`,
            siteName: 'aihealz',
            type: 'profile',
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
        alternates: {
            canonical: `https://aihealz.com/doctor/${slug}`,
        },
    };
}

export const revalidate = 3600;

export default async function DoctorProfilePage({ params }: { params: PageParams }) {
    const { slug } = await params;

    // Static defaults — page is ISR-cached. The single doctor's own location
    // (doctor.geography) is the authoritative geo on this page.
    const country = 'india';
    const lang = 'en';

    const doctor = await prisma.doctorProvider.findUnique({
        where: { slug },
        include: {
            specialties: { select: { condition: { select: { commonName: true, specialistType: true, slug: true } } } },
            geography: {
                select: {
                    name: true,
                    slug: true,
                    level: true,
                    parent: {
                        select: {
                            name: true,
                            slug: true,
                            parent: { select: { name: true, slug: true } }
                        }
                    }
                }
            },
            hospitalDoctors: {
                include: {
                    hospital: {
                        select: { name: true, slug: true, address: true }
                    }
                }
            },
            providerSubscription: {
                select: { planId: true, status: true }
            },
        },
    });

    // Type assertion for media fields (they may not exist yet in DB)
    const doctorMedia = doctor as typeof doctor & {
        coverImage?: string | null;
        images?: string[];
        videoUrl?: string | null;
        videoThumbnail?: string | null;
    };

    // Determine if this is a premium profile
    const isPremium = doctor?.subscriptionTier === 'premium' || doctor?.subscriptionTier === 'enterprise';
    const isEnterprise = doctor?.subscriptionTier === 'enterprise';

    // Extract contact info for premium features
    const contactInfo = doctor?.contactInfo as {
        email?: string;
        phone?: string;
        websiteUrl?: string;
        clinicAddress?: string;
        clinicName?: string;
    } | null;

    if (!doctor) {
        notFound();
    }

    // Get the primary specialty name
    const primarySpecialty = doctor.specialties[0]?.condition?.specialistType || doctor.specialties[0]?.condition?.commonName || '';

    // Get related doctors in same specialty/location
    const relatedDoctors = await prisma.doctorProvider.findMany({
        where: {
            id: { not: doctor.id },
            isVerified: true,
            specialties: {
                some: { conditionId: doctor.specialties[0]?.condition ? undefined : undefined }
            },
            geographyId: doctor.geographyId,
        },
        select: { name: true, slug: true, profileImage: true, rating: true, experienceYears: true },
        take: 4,
    });

    // Get conditions treated by this specialty
    const treatedConditions = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            specialistType: {
                contains: primarySpecialty.split(' ')[0] || '',
                mode: 'insensitive'
            }
        },
        select: { commonName: true, slug: true },
        take: 12,
    });

    // Build location chain for breadcrumb
    const city = doctor.geography;
    const state = city?.parent;
    const countryGeo = state?.parent;

    // Schema markup
    const physicianSchema = {
        '@context': 'https://schema.org',
        '@type': 'Physician',
        name: formatDoctorName(doctor.name),
        url: `https://aihealz.com/doctor/${slug}`,
        image: doctor.profileImage || undefined,
        description: doctor.bio || undefined,
        medicalSpecialty: doctor.specialties.map(s => s.condition?.specialistType || s.condition?.commonName),
        knowsAbout: treatedConditions.slice(0, 10).map(c => c.commonName),
        ...(doctor.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(doctor.rating), reviewCount: doctor.reviewCount } }),
        ...(city && {
            address: {
                '@type': 'PostalAddress',
                addressLocality: city.name,
                addressRegion: state?.name,
                addressCountry: countryGeo?.name,
            }
        }),
        ...(doctor.consultationFee && {
            priceRange: `${doctor.feeCurrency} ${doctor.consultationFee}`,
        }),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: 'Doctors', item: 'https://aihealz.com/doctors' },
            ...(city ? [{ '@type': 'ListItem', position: 3, name: city.name, item: `https://aihealz.com/doctors/${city.slug}` }] : []),
            { '@type': 'ListItem', position: city ? 4 : 3, name: formatDoctorName(doctor.name), item: `https://aihealz.com/doctor/${slug}` },
        ],
    };

    const specialty = primarySpecialty || 'Medical';
    const doctorInitials = doctor.name.trim().split(/\s+/).slice(-2).map((p) => p.charAt(0).toUpperCase()).join('') || 'DR';

    return (
        <>
            <Script id="physician-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianSchema) }} />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)' }} className="col gap-6">

                    {/* ── Breadcrumb (mono kicker style) ─────────────── */}
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
                        {city && (
                            <>
                                <span aria-hidden="true">/</span>
                                <Link href={`/doctors/${city.slug}`} style={{ color: 'var(--ink-3)' }}>{city.name}</Link>
                            </>
                        )}
                        <span aria-hidden="true">/</span>
                        <span style={{ color: 'var(--ink)' }}>{formatDoctorName(doctor.name)}</span>
                    </nav>

                    {/* ── Hero / profile header ─────────────────────── */}
                    <div className="card" style={{ padding: 28 }}>
                        <div className="row gap-6 ai-start" style={{ flexWrap: 'wrap' }}>
                            {/* Avatar */}
                            <div className="col gap-2 ai-center" style={{ flexShrink: 0 }}>
                                <div
                                    style={{
                                        width: 144,
                                        height: 144,
                                        borderRadius: 'var(--r-3)',
                                        overflow: 'hidden',
                                        border: '1px solid var(--rule)',
                                        background: 'var(--bg-2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {doctor.profileImage ? (
                                        <Image
                                            src={doctor.profileImage}
                                            alt={formatDoctorName(doctor.name)}
                                            width={160}
                                            height={160}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="placeholder"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                fontSize: 18,
                                                fontFamily: 'var(--display)',
                                                fontWeight: 600,
                                                color: 'var(--ink-3)',
                                                letterSpacing: '0.02em',
                                            }}
                                            aria-hidden="true"
                                        >
                                            {doctorInitials}
                                        </div>
                                    )}
                                </div>
                                <div className="row gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {doctor.isVerified && (
                                        <span className="pill pill-mint">
                                            <span className="pill-dot" style={{ background: 'var(--mint)' }} aria-hidden="true" />
                                            Verified
                                        </span>
                                    )}
                                    {isPremium && (
                                        <span className={isEnterprise ? 'pill pill-orange' : 'pill pill-cobalt'}>
                                            ★ {isEnterprise ? 'Top Doctor' : 'Premium'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Profile info */}
                            <div className="col gap-3" style={{ flex: 1, minWidth: 280 }}>
                                <div className="col gap-2">
                                    <span className="section-mark">verified profile</span>
                                    <h1
                                        className="display"
                                        style={{
                                            fontSize: 'clamp(32px, 5vw, 56px)',
                                            lineHeight: 1,
                                            letterSpacing: '-0.04em',
                                            margin: 0,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {formatDoctorName(doctor.name)}
                                        <span style={{ color: 'var(--orange)' }}>.</span>
                                    </h1>
                                </div>

                                {/* Specialties */}
                                {doctor.specialties.length > 0 && (
                                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                        {doctor.specialties.map((s, i) => (
                                            <span key={i} className="pill pill-cobalt">
                                                {s.condition?.specialistType || s.condition?.commonName}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Qualifications */}
                                {doctor.qualifications && doctor.qualifications.length > 0 && (
                                    <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                        {doctor.qualifications.join(' · ')}
                                    </p>
                                )}

                                {/* Stats row */}
                                <div
                                    className="row gap-5 mono"
                                    style={{
                                        fontSize: 11,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        color: 'var(--ink-3)',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {doctor.experienceYears && (
                                        <span>
                                            Experience{' '}
                                            <span className="num" style={{ color: 'var(--ink)', fontSize: 13, marginLeft: 4 }}>
                                                {doctor.experienceYears}+ yrs
                                            </span>
                                        </span>
                                    )}
                                    {doctor.rating && (
                                        <span>
                                            ★{' '}
                                            <span className="num" style={{ color: 'var(--ink)', fontSize: 13, marginLeft: 4 }}>
                                                {Number(doctor.rating).toFixed(1)}
                                            </span>
                                            <span style={{ marginLeft: 6 }}>({doctor.reviewCount} reviews)</span>
                                        </span>
                                    )}
                                    {doctor.consultationFee && (
                                        <span>
                                            Fee{' '}
                                            <span className="num" style={{ color: 'var(--cobalt)', fontSize: 13, marginLeft: 4, fontWeight: 500 }}>
                                                {doctor.feeCurrency} {Number(doctor.consultationFee).toLocaleString()}
                                            </span>
                                        </span>
                                    )}
                                </div>

                                {/* Location */}
                                {city && (
                                    <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                        ◆ {city.name}{state ? `, ${state.name}` : ''}{countryGeo ? `, ${countryGeo.name}` : ''}
                                    </p>
                                )}

                                {/* CTAs */}
                                <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                                    <a href="#contact" className="btn btn-cobalt btn-lg">
                                        Book appointment →
                                    </a>
                                    {doctor.availableOnline && (
                                        <button type="button" className="btn btn-paper btn-lg">
                                            Video consult
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Body grid ─────────────────────────────────── */}
                    <div className="row gap-6 ai-start" style={{ flexWrap: 'wrap' }}>
                        {/* Main column */}
                        <div className="col gap-6" style={{ flex: '2 1 560px', minWidth: 0 }}>
                            {/* About */}
                            {doctor.bio && (
                                <section className="col gap-3">
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
                                                fontSize: 'clamp(24px, 3vw, 32px)',
                                                margin: 0,
                                                letterSpacing: '-0.03em',
                                                fontWeight: 600,
                                            }}
                                        >
                                            About {formatDoctorName(doctor.name)}
                                        </h2>
                                    </div>
                                    <p
                                        style={{
                                            fontSize: 16,
                                            lineHeight: 1.65,
                                            color: 'var(--ink-2)',
                                            maxWidth: 680,
                                            margin: 0,
                                        }}
                                    >
                                        {doctor.bio}
                                    </p>
                                </section>
                            )}

                            {/* Media gallery — preserved as-is, wrapped in card */}
                            {(doctorMedia.coverImage || (doctorMedia.images && doctorMedia.images.length > 0) || doctorMedia.videoUrl) && (
                                <section className="card col gap-3" style={{ padding: 24 }}>
                                    <div className="row between ai-center">
                                        <span className="section-mark">photos &amp; videos</span>
                                    </div>
                                    <MediaGallery
                                        coverImage={doctorMedia.coverImage}
                                        images={doctorMedia.images}
                                        videoUrl={doctorMedia.videoUrl}
                                        videoThumbnail={doctorMedia.videoThumbnail}
                                        alt={formatDoctorName(doctor.name)}
                                    />
                                </section>
                            )}

                            {/* Hospitals */}
                            {doctor.hospitalDoctors.length > 0 && (
                                <section className="col gap-3">
                                    <div className="row gap-3 ai-baseline">
                                        <span
                                            className="num"
                                            style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}
                                        >
                                            § 02
                                        </span>
                                        <h2
                                            className="display"
                                            style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}
                                        >
                                            Hospital affiliations
                                        </h2>
                                    </div>
                                    <div
                                        className="card"
                                        style={{ padding: 0, overflow: 'hidden' }}
                                    >
                                        {doctor.hospitalDoctors.map((hd, i, arr) => (
                                            <Link
                                                key={i}
                                                href={`/hospitals/${hd.hospital.slug}`}
                                                className="row ai-center between"
                                                style={{
                                                    padding: '16px 22px',
                                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                    gap: 12,
                                                }}
                                            >
                                                <div className="col" style={{ minWidth: 0 }}>
                                                    <span
                                                        className="display"
                                                        style={{
                                                            fontSize: 16,
                                                            fontWeight: 500,
                                                            letterSpacing: '-0.015em',
                                                            color: 'var(--ink)',
                                                        }}
                                                    >
                                                        {hd.hospital.name}
                                                    </span>
                                                    {hd.hospital.address && (
                                                        <span className="muted" style={{ fontSize: 13 }}>
                                                            {hd.hospital.address}
                                                        </span>
                                                    )}
                                                </div>
                                                <span
                                                    className="mono"
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--cobalt)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.06em',
                                                    }}
                                                >
                                                    view →
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Conditions treated */}
                            {treatedConditions.length > 0 && (
                                <section className="col gap-3">
                                    <div className="row gap-3 ai-baseline">
                                        <span
                                            className="num"
                                            style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}
                                        >
                                            § 03
                                        </span>
                                        <h2
                                            className="display"
                                            style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}
                                        >
                                            Conditions treated
                                        </h2>
                                    </div>
                                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                        {treatedConditions.map((c, i) => (
                                            <Link key={i} href={`/${country}/${lang}/${c.slug}`} className="pill">
                                                {c.commonName}
                                            </Link>
                                        ))}
                                    </div>
                                    <Link
                                        href={`/conditions?specialty=${encodeURIComponent(specialty)}`}
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--cobalt)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            marginTop: 4,
                                        }}
                                    >
                                        View all {specialty} conditions →
                                    </Link>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="col gap-3 v4-sticky-md" style={{ flex: '1 1 300px', minWidth: 0, position: 'sticky', top: 96 }}>
                            {/* Contact card */}
                            <div id="contact" className="card-ink" style={{ padding: 24 }}>
                                <div className="row between ai-center" style={{ marginBottom: 12 }}>
                                    <span
                                        className="kicker"
                                        style={{ color: 'var(--cobalt-3)' }}
                                    >
                                        <span className="dot" style={{ background: 'var(--cobalt-3)' }} />
                                        contact
                                    </span>
                                    {isPremium && (
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 10,
                                                padding: '2px 8px',
                                                border: '1px solid rgba(255,255,255,.2)',
                                                borderRadius: 'var(--r-1)',
                                                color: 'var(--paper)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            {isEnterprise ? 'Elite' : 'Pro'}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="display"
                                    style={{
                                        fontSize: 22,
                                        lineHeight: 1.2,
                                        fontWeight: 500,
                                        letterSpacing: '-0.02em',
                                        marginBottom: 16,
                                    }}
                                >
                                    Book a consultation with {formatDoctorName(doctor.name).split(' ').slice(0, 2).join(' ')}
                                    <span style={{ color: 'var(--orange)' }}>.</span>
                                </div>

                                <div className="col gap-2" style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>
                                    {/* Clinic — premium */}
                                    {isPremium && contactInfo?.clinicName && (
                                        <div className="col gap-1">
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 10,
                                                    color: 'rgba(255,255,255,.45)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                clinic
                                            </span>
                                            <span style={{ color: 'var(--paper)' }}>{contactInfo.clinicName}</span>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {city && (
                                        <div className="col gap-1">
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 10,
                                                    color: 'rgba(255,255,255,.45)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                location
                                            </span>
                                            <span style={{ color: 'var(--paper)' }}>
                                                {city.name}{state ? `, ${state.name}` : ''}
                                            </span>
                                        </div>
                                    )}

                                    {/* Address — premium */}
                                    {isPremium && contactInfo?.clinicAddress && (
                                        <div className="col gap-1">
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 10,
                                                    color: 'rgba(255,255,255,.45)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                address
                                            </span>
                                            <span style={{ color: 'var(--paper)' }}>{contactInfo.clinicAddress}</span>
                                        </div>
                                    )}

                                    {/* Fee */}
                                    {doctor.consultationFee && (
                                        <div className="col gap-1">
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 10,
                                                    color: 'rgba(255,255,255,.45)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                consultation fee
                                            </span>
                                            <span className="num" style={{ color: 'var(--paper)' }}>
                                                {doctor.feeCurrency} {Number(doctor.consultationFee).toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Website — premium */}
                                    {isPremium && contactInfo?.websiteUrl && (
                                        <a
                                            href={contactInfo.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                marginTop: 4,
                                            }}
                                        >
                                            ↗ visit website
                                        </a>
                                    )}

                                    {/* Phone — premium */}
                                    {isPremium && contactInfo?.phone && !isPlaceholderPhone(contactInfo.phone) && (
                                        <a
                                            href={`tel:${contactInfo.phone}`}
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            ↗ {contactInfo.phone}
                                        </a>
                                    )}
                                </div>

                                <Link
                                    href={`/book/doctor?doctor=${doctor.slug}&name=${encodeURIComponent(formatDoctorName(doctor.name))}`}
                                    className="btn btn-cobalt"
                                    style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
                                >
                                    Request appointment →
                                </Link>
                            </div>

                            {/* Related doctors */}
                            {relatedDoctors.length > 0 && (
                                <div className="card col gap-3" style={{ padding: 18 }}>
                                    <span className="kicker">
                                        <span className="dot" />
                                        similar doctors
                                    </span>
                                    <div className="col">
                                        {relatedDoctors.map((rd, i, arr) => (
                                            <Link
                                                key={i}
                                                href={`/doctor/${rd.slug}`}
                                                className="row ai-center gap-3"
                                                style={{
                                                    padding: '10px 0',
                                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                }}
                                            >
                                                <span className="spec-icon" aria-hidden="true">
                                                    {rd.name.trim().charAt(0).toUpperCase()}
                                                </span>
                                                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                                                    <span
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            color: 'var(--ink)',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {formatDoctorName(rd.name)}
                                                    </span>
                                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                                        {rd.experienceYears ? `${rd.experienceYears}+ yrs` : ''}
                                                        {rd.rating ? ` · ★ ${Number(rd.rating).toFixed(1)}` : ''}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link
                                        href={city ? `/doctors/${city.slug}` : '/doctors'}
                                        className="btn btn-paper btn-sm"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        View more {specialty} doctors →
                                    </Link>
                                </div>
                            )}
                        </aside>
                    </div>

                    {/* ── Internal links ─────────────────────────────── */}
                    <section
                        className="grid grid-cols-1 md:grid-cols-3"
                        style={{ gap: 12, marginTop: 32 }}
                    >
                        <Link href="/doctors" className="card col gap-2" style={{ padding: 20 }}>
                            <span className="kicker">
                                <span className="dot" />
                                doctors
                            </span>
                            <h3
                                className="display"
                                style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}
                            >
                                Find more doctors
                            </h3>
                            <span className="muted" style={{ fontSize: 13 }}>
                                Browse verified specialists across all locations
                            </span>
                        </Link>
                        <Link href="/hospitals" className="card col gap-2" style={{ padding: 20 }}>
                            <span className="kicker">
                                <span className="dot" />
                                hospitals
                            </span>
                            <h3
                                className="display"
                                style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}
                            >
                                Top hospitals
                            </h3>
                            <span className="muted" style={{ fontSize: 13 }}>
                                Find the best hospitals for your treatment
                            </span>
                        </Link>
                        <Link href="/symptoms" className="card col gap-2" style={{ padding: 20 }}>
                            <span className="kicker" style={{ color: 'var(--cobalt-3)' }}>
                                <span className="dot" />
                                healz ai
                            </span>
                            <h3
                                className="display"
                                style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}
                            >
                                AI symptom checker
                            </h3>
                            <span className="muted" style={{ fontSize: 13 }}>
                                Get instant guidance on your symptoms
                            </span>
                        </Link>
                    </section>
                </div>
            </main>
        </>
    );
}
