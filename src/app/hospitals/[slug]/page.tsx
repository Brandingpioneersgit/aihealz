import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReactElement } from 'react';
import Script from 'next/script';
import MediaGallery from '@/components/ui/media-gallery';

interface Props {
  params: Promise<{ slug: string }>;
}

// Equipment commonly found in hospitals - used as fallback
const COMMON_EQUIPMENT = [
  'MRI Scanner', 'CT Scanner', 'X-Ray', 'Ultrasound', 'ECG',
  'Ventilators', 'Defibrillators', 'Patient Monitors', 'Infusion Pumps'
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hospital = await prisma.hospital.findUnique({
    where: { slug },
    select: { name: true, city: true, tagline: true, metaTitle: true, metaDescription: true },
  });

  if (!hospital) return { title: 'Hospital Not Found' };

  return {
    title: hospital.metaTitle || `${hospital.name} - Reviews, Doctors & Specialties | AIHealz`,
    description: hospital.metaDescription || hospital.tagline || `Find detailed information about ${hospital.name} in ${hospital.city}. Patient reviews, top doctors, specialties, and more.`,
  };
}

const PATIENT_TYPE_LABELS: Record<string, string> = {
  domestic: 'Domestic Patient',
  international: 'International Patient',
  medical_tourist: 'Medical Tourist',
};

export default async function HospitalDetailPage({ params }: Props) {
  const { slug } = await params;

  const hospital = await prisma.hospital.findUnique({
    where: { slug },
    include: {
      geography: { select: { name: true, slug: true } },
      specialties: {
        orderBy: { displayOrder: 'asc' },
      },
      departments: {
        orderBy: { name: 'asc' },
      },
      doctors: {
        where: { isTopDoctor: true },
        include: {
          doctor: {
            select: { name: true, slug: true, profileImage: true, qualifications: true },
          },
        },
        take: 12,
      },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      insuranceTies: {
        where: { isActive: true },
        include: {
          insurer: { select: { name: true, slug: true, logo: true, providerType: true, shortName: true } },
        },
        orderBy: [{ isPreferred: 'desc' }, { isCashless: 'desc' }],
        take: 30,
      },
      _count: {
        select: { reviews: true, doctors: true, enquiries: true },
      },
    },
  });

  if (!hospital) notFound();

  // Get sibling hospitals (same parent organization)
  const siblingHospitals = hospital.parentOrganization
    ? await prisma.hospital.findMany({
        where: {
          parentOrganization: hospital.parentOrganization,
          slug: { not: hospital.slug },
          isActive: true,
        },
        select: {
          name: true,
          slug: true,
          city: true,
          state: true,
          bedCount: true,
        },
        take: 10,
      })
    : [];

  // Get review stats
  const reviewStats = await prisma.hospitalReview.groupBy({
    by: ['reviewerType'],
    where: { hospitalId: hospital.id, isVisible: true },
    _count: true,
    _avg: { rating: true },
  });

  // Structured Data for SEO
  const hospitalSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: hospital.name,
    description: hospital.description || hospital.tagline,
    url: `https://aihealz.com/hospitals/${hospital.slug}`,
    telephone: hospital.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hospital.address,
      addressLocality: hospital.city,
      addressRegion: hospital.state,
      addressCountry: hospital.country,
      postalCode: hospital.pincode,
    },
    ...(hospital.latitude && hospital.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: Number(hospital.latitude),
        longitude: Number(hospital.longitude),
      },
    }),
    ...(hospital.overallRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(hospital.overallRating),
        reviewCount: hospital._count.reviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    medicalSpecialty: hospital.specialties.map(s => ({
      '@type': 'MedicalSpecialty',
      name: s.specialty,
    })),
    availableService: hospital.departments.map(d => ({
      '@type': 'MedicalProcedure',
      name: d.name,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
      { '@type': 'ListItem', position: 2, name: 'Hospitals', item: 'https://aihealz.com/hospitals' },
      { '@type': 'ListItem', position: 3, name: hospital.name, item: `https://aihealz.com/hospitals/${hospital.slug}` },
    ],
  };

  const formatRating = (rating: number | null | undefined) => {
    if (!rating) return '-';
    return Number(rating).toFixed(1);
  };

  const renderStars = (rating: number) => {
    const stars: ReactElement[] = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      stars.push(
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill={filled ? 'var(--orange)' : 'var(--rule)'}
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return <div className="row gap-1">{stars}</div>;
  };

  const hospitalInitial = hospital.name.charAt(0).toUpperCase();

  return (
    <>
      <Script
        id="hospital-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hospitalSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }} className="col gap-6">

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
            <Link href="/hospitals" style={{ color: 'var(--ink-3)' }}>Hospitals</Link>
            <span aria-hidden="true">/</span>
            <span style={{ color: 'var(--ink)' }}>{hospital.name}</span>
          </nav>

          {/* Hero */}
          <section className="card" style={{ padding: 28 }}>
            <div className="row gap-6 ai-start" style={{ flexWrap: 'wrap' }}>
              {/* Logo */}
              <div style={{ flexShrink: 0, width: 192 }}>
                <div
                  style={{
                    width: '100%',
                    height: 144,
                    borderRadius: 'var(--r-3)',
                    overflow: 'hidden',
                    border: '1px solid var(--rule)',
                    background: 'var(--bg-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: hospital.logo ? 12 : 0,
                  }}
                >
                  {hospital.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={hospital.logo} alt={hospital.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span className="display" style={{ fontSize: 56, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '-0.04em' }}>
                      {hospitalInitial}
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="col gap-3" style={{ flex: 1, minWidth: 280 }}>
                <div className="col gap-2">
                  <span className="section-mark">hospital profile</span>
                  <div className="row gap-3 ai-baseline" style={{ flexWrap: 'wrap' }}>
                    <h1
                      className="display"
                      style={{
                        fontSize: 'clamp(28px, 4vw, 44px)',
                        lineHeight: 1.05,
                        letterSpacing: '-0.035em',
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {hospital.name}
                      <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                      {hospital.isFeatured && <span className="pill pill-orange">Featured</span>}
                      {hospital.isVerified && (
                        <span className="pill pill-mint">
                          <span className="pill-dot" style={{ background: 'var(--mint)' }} aria-hidden="true" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {hospital.tagline && (
                  <p className="lede" style={{ fontSize: 17, margin: 0, maxWidth: 640 }}>
                    {hospital.tagline}
                  </p>
                )}

                {/* Location & infra row */}
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
                  <span>
                    Location{' '}
                    <span style={{ color: 'var(--ink)', fontSize: 13, marginLeft: 4 }}>
                      {hospital.city}{hospital.state && hospital.state !== hospital.city ? `, ${hospital.state}` : ''}{hospital.country && hospital.country !== 'India' ? `, ${hospital.country}` : ''}
                    </span>
                  </span>
                  {hospital.bedCount && (
                    <span>
                      Beds{' '}
                      <span className="num" style={{ color: 'var(--ink)', fontSize: 13, marginLeft: 4 }}>
                        {hospital.bedCount}
                      </span>
                    </span>
                  )}
                  {hospital.icuBeds && (
                    <span>
                      ICU{' '}
                      <span className="num" style={{ color: 'var(--orange-2)', fontSize: 13, marginLeft: 4 }}>
                        {hospital.icuBeds}
                      </span>
                    </span>
                  )}
                  {hospital.operationTheaters && (
                    <span>
                      OTs{' '}
                      <span className="num" style={{ color: 'var(--ink)', fontSize: 13, marginLeft: 4 }}>
                        {hospital.operationTheaters}
                      </span>
                    </span>
                  )}
                  {hospital.establishedYear && (
                    <span>
                      Est.{' '}
                      <span className="num" style={{ color: 'var(--ink)', fontSize: 13, marginLeft: 4 }}>
                        {hospital.establishedYear}
                      </span>
                    </span>
                  )}
                </div>

                {/* Accreditations */}
                {hospital.accreditations.length > 0 && (
                  <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    {[...new Set(hospital.accreditations)].map((acc, i) => (
                      <span key={i} className="pill pill-cobalt">{acc}</span>
                    ))}
                  </div>
                )}

                {/* Ratings */}
                {hospital._count.reviews > 0 ? (
                  <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                    <div className="card-flat row ai-center gap-3" style={{ padding: '8px 14px' }}>
                      <span className="bignum" style={{ fontSize: 22, color: 'var(--cobalt)' }}>
                        {formatRating(hospital.overallRating as number | null)}
                      </span>
                      <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Overall · {hospital._count.reviews} reviews
                      </span>
                    </div>
                    {hospital.domesticRating && (
                      <div className="card-flat row ai-center gap-2" style={{ padding: '8px 14px' }}>
                        <span className="num" style={{ color: 'var(--ink)', fontSize: 16, fontWeight: 500 }}>
                          {formatRating(Number(hospital.domesticRating))}
                        </span>
                        <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Domestic
                        </span>
                      </div>
                    )}
                    {hospital.internationalRating && (
                      <div className="card-flat row ai-center gap-2" style={{ padding: '8px 14px' }}>
                        <span className="num" style={{ color: 'var(--ink)', fontSize: 16, fontWeight: 500 }}>
                          {formatRating(Number(hospital.internationalRating))}
                        </span>
                        <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          International
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    No reviews yet
                  </span>
                )}
              </div>

              {/* CTA */}
              <div style={{ flexShrink: 0, width: 280 }}>
                <div className="card-quiet col gap-2" style={{ padding: 20 }}>
                  <span className="kicker"><span className="dot" />get in touch</span>
                  <Link
                    href={`/hospitals/${hospital.slug}/enquire`}
                    className="btn btn-cobalt"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Book appointment →
                  </Link>
                  <Link
                    href={`/hospitals/${hospital.slug}/enquire?type=international`}
                    className="btn btn-paper"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    International enquiry
                  </Link>
                  {hospital.website && (
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: 'var(--cobalt)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        textAlign: 'center',
                        marginTop: 4,
                      }}
                    >
                      ↗ visit official website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Body grid */}
          <div className="row gap-6 ai-start" style={{ flexWrap: 'wrap' }}>
            {/* Main column */}
            <div className="col gap-6" style={{ flex: '2 1 600px', minWidth: 0 }}>

              {/* About */}
              {hospital.description && (
                <section className="col gap-3">
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 01</span>
                    <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                      About {hospital.name}
                    </h2>
                  </div>
                  <div
                    style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-2)', maxWidth: 720 }}
                    dangerouslySetInnerHTML={{ __html: hospital.description }}
                  />
                </section>
              )}

              {/* Media gallery */}
              {(hospital.coverImage || hospital.images.length > 0 || hospital.videoUrl) && (
                <section className="card col gap-3" style={{ padding: 24 }}>
                  <span className="section-mark">photos &amp; videos</span>
                  <MediaGallery
                    coverImage={hospital.coverImage}
                    images={hospital.images}
                    videoUrl={hospital.videoUrl}
                    alt={hospital.name}
                    maxVisible={6}
                  />
                </section>
              )}

              {/* Pros & cons */}
              {(hospital.prosForPatients.length > 0 || hospital.consForPatients.length > 0) && (
                <section className="col gap-3">
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 02</span>
                    <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                      What patients say
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                    {hospital.prosForPatients.length > 0 && (
                      <div className="card col gap-3" style={{ padding: 20 }}>
                        <span className="kicker"><span className="dot" style={{ background: 'var(--mint)' }} />pros</span>
                        <ul className="clean col gap-2">
                          {hospital.prosForPatients.map((pro, i) => (
                            <li key={i} className="row gap-2 ai-start" style={{ fontSize: 14, color: 'var(--ink-2)' }}>
                              <span style={{ color: 'var(--mint-3)', fontWeight: 600, marginTop: 1 }}>+</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {hospital.consForPatients.length > 0 && (
                      <div className="card col gap-3" style={{ padding: 20 }}>
                        <span className="kicker"><span className="dot" style={{ background: 'var(--orange)' }} />cons</span>
                        <ul className="clean col gap-2">
                          {hospital.consForPatients.map((con, i) => (
                            <li key={i} className="row gap-2 ai-start" style={{ fontSize: 14, color: 'var(--ink-2)' }}>
                              <span style={{ color: 'var(--orange-2)', fontWeight: 600, marginTop: 1 }}>−</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Specialties */}
              {hospital.specialties.length > 0 && (
                <section className="col gap-3">
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 03</span>
                    <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                      Specialties &amp; centers of excellence
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
                    {hospital.specialties.map((spec) => {
                      const initial = spec.specialty.trim().charAt(0).toUpperCase();
                      return (
                        <div key={spec.id} className="card row gap-3 ai-start" style={{ padding: 16 }}>
                          <span className="spec-icon" aria-hidden="true">{initial}</span>
                          <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                            <div className="row between ai-start gap-2">
                              <span className="display" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
                                {spec.specialty}
                              </span>
                              {spec.isCenter && <span className="pill pill-orange">CoE</span>}
                            </div>
                            {spec.description && (
                              <p className="muted truncate-2" style={{ fontSize: 13, margin: 0 }}>{spec.description}</p>
                            )}
                            <div className="row gap-3 mono" style={{ fontSize: 11, color: 'var(--ink-4)', flexWrap: 'wrap' }}>
                              {spec.keyProcedures && spec.keyProcedures.length > 0 && (
                                <span>{spec.keyProcedures.slice(0, 3).join(', ')}</span>
                              )}
                              {spec.successRate && (
                                <span style={{ color: 'var(--mint-3)' }}>{Number(spec.successRate)}% success</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Top doctors */}
              {hospital.doctors.length > 0 && (
                <section className="col gap-3">
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 04</span>
                    <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                      Top doctors
                    </h2>
                  </div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {hospital.doctors.map((hd, i, arr) => (
                      <Link
                        key={hd.id}
                        href={hd.doctor?.slug ? `/doctors/${hd.doctor.slug}` : '#'}
                        className="row ai-center gap-3"
                        style={{
                          padding: '14px 20px',
                          borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                        }}
                      >
                        {hd.doctor?.profileImage ? (
                          <Image
                            src={hd.doctor.profileImage}
                            alt={hd.doctor.name}
                            width={44}
                            height={44}
                            unoptimized
                            style={{ width: 44, height: 44, borderRadius: 'var(--r-2)', objectFit: 'cover', border: '1px solid var(--rule)' }}
                          />
                        ) : (
                          <span className="spec-icon" aria-hidden="true">
                            {(hd.doctor?.name?.charAt(0) || hd.name.charAt(0)).toUpperCase()}
                          </span>
                        )}
                        <div className="col" style={{ flex: 1, minWidth: 0 }}>
                          <span className="display" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
                            {hd.doctor?.name || hd.name}
                          </span>
                          <span className="muted" style={{ fontSize: 12 }}>
                            {hd.designation}{hd.specialty ? ` · ${hd.specialty}` : ''}
                          </span>
                        </div>
                        <span
                          className="mono"
                          style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                        >
                          view →
                        </span>
                      </Link>
                    ))}
                  </div>
                  {hospital._count.doctors > 12 && (
                    <Link
                      href={`/hospitals/${hospital.slug}/doctors`}
                      className="mono"
                      style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-start' }}
                    >
                      View all {hospital._count.doctors} doctors →
                    </Link>
                  )}
                </section>
              )}

              {/* Notable patients */}
              {Array.isArray(hospital.notablePatients) && hospital.notablePatients.length > 0 && (
                <section className="col gap-3">
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 05</span>
                    <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                      Notable patients
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
                    {(hospital.notablePatients as Array<{ name: string; category: string; treatment?: string; doctor?: string; year?: number }>).map((np, i) => (
                      <div key={i} className="card col gap-1" style={{ padding: 16 }}>
                        <div className="row between ai-baseline gap-2">
                          <span className="display" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{np.name}</span>
                          <span className="pill pill-lemon">{np.category}</span>
                        </div>
                        {np.treatment && <span className="muted" style={{ fontSize: 13 }}>Treatment: {np.treatment}</span>}
                        {np.doctor && <span className="muted-2" style={{ fontSize: 12 }}>By Dr. {np.doctor}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews */}
              {hospital.reviews.length > 0 && (
                <section className="col gap-3">
                  <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                    <div className="row gap-3 ai-baseline">
                      <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 06</span>
                      <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                        Patient reviews
                      </h2>
                    </div>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                      {reviewStats.map((rs) => (
                        <span key={rs.reviewerType} className="pill">
                          {PATIENT_TYPE_LABELS[rs.reviewerType] || rs.reviewerType}: {formatRating(rs._avg.rating as number | null)} ({rs._count})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {hospital.reviews.map((review, i, arr) => (
                      <div
                        key={review.id}
                        className="col gap-2"
                        style={{
                          padding: 20,
                          borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                        }}
                      >
                        <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 8 }}>
                          <div className="col gap-1">
                            <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                              {review.reviewerName || 'Anonymous'}
                            </span>
                            <div className="row ai-center gap-2">
                              {renderStars(Number(review.rating))}
                              <span className="pill">
                                {PATIENT_TYPE_LABELS[review.reviewerType] || review.reviewerType}
                              </span>
                            </div>
                          </div>
                          <span className="mono muted-2" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        {review.title && (
                          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{review.title}</p>
                        )}
                        {review.review && (
                          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>{review.review}</p>
                        )}
                        {review.treatmentReceived && (
                          <span className="mono muted-2" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Treatment: {review.treatmentReceived}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {hospital._count.reviews > 10 && (
                    <Link
                      href={`/hospitals/${hospital.slug}/reviews`}
                      className="mono"
                      style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-start' }}
                    >
                      Read all {hospital._count.reviews} reviews →
                    </Link>
                  )}
                </section>
              )}

              {/* Map & Location */}
              {hospital.latitude && hospital.longitude && (
                <section className="card col gap-3" style={{ padding: 24 }}>
                  <span className="section-mark">location &amp; directions</span>
                  <div style={{ aspectRatio: '16 / 9', borderRadius: 'var(--r-3)', overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--bg-2)' }}>
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${hospital.latitude},${hospital.longitude}&zoom=15`}
                      width="100%"
                      height="100%"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${hospital.name} Location`}
                    />
                  </div>
                  <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-cobalt btn-sm"
                    >
                      Get directions →
                    </a>
                    {hospital.address && (
                      <span className="muted" style={{ fontSize: 13 }}>
                        {hospital.address}, {hospital.city} {hospital.pincode}
                      </span>
                    )}
                  </div>
                </section>
              )}

              {/* Sibling hospitals */}
              {siblingHospitals.length > 0 && (
                <section className="col gap-3">
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 07</span>
                    <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                      Other {hospital.parentOrganization} locations
                    </h2>
                  </div>
                  <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                    {hospital.parentOrganization} operates {siblingHospitals.length + 1} hospitals across India and other countries.
                  </p>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {siblingHospitals.map((sibling, i, arr) => (
                      <Link
                        key={sibling.slug}
                        href={`/hospitals/${sibling.slug}`}
                        className="row ai-center between gap-3"
                        style={{
                          padding: '14px 20px',
                          borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                        }}
                      >
                        <div className="col" style={{ minWidth: 0 }}>
                          <span className="display" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
                            {sibling.name}
                          </span>
                          <span className="muted" style={{ fontSize: 12 }}>{sibling.city}, {sibling.state}</span>
                        </div>
                        {sibling.bedCount && (
                          <span className="num" style={{ fontSize: 13, color: 'var(--cobalt)', fontWeight: 500 }}>
                            {sibling.bedCount} beds
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="col gap-4" style={{ flex: '1 1 300px', minWidth: 280 }}>

              {/* Awards */}
              {Array.isArray(hospital.awards) && hospital.awards.length > 0 && (
                <div className="card col gap-3" style={{ padding: 20 }}>
                  <span className="kicker"><span className="dot" style={{ background: 'var(--lemon-2)' }} />awards &amp; recognition</span>
                  <ul className="clean col gap-2">
                    {(hospital.awards as Array<{ year?: number; award: string; org?: string }>).map((award, i) => (
                      <li key={i} className="row gap-2 ai-start" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                        <span style={{ color: 'var(--lemon-2)', fontWeight: 600, marginTop: 1 }}>★</span>
                        <span>
                          {award.award}{award.org ? ` · ${award.org}` : ''}{award.year ? ` (${award.year})` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scandals */}
              {Array.isArray(hospital.scandals) && hospital.scandals.length > 0 && (
                <div className="card col gap-3" style={{ padding: 20, borderColor: 'rgba(255, 90, 46, .28)' }}>
                  <span className="kicker" style={{ color: 'var(--orange-2)' }}>
                    <span className="dot" style={{ background: 'var(--orange)' }} />important information
                  </span>
                  <ul className="clean col gap-2">
                    {(hospital.scandals as Array<{ year?: number; title: string; description?: string }>).map((scandal, i) => (
                      <li key={i} className="col gap-1">
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--orange-2)' }}>
                          {scandal.title}{scandal.year ? ` (${scandal.year})` : ''}
                        </span>
                        {scandal.description && (
                          <span className="muted" style={{ fontSize: 12 }}>{scandal.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ownership */}
              <div className="card col gap-3" style={{ padding: 20 }}>
                <span className="kicker"><span className="dot" />ownership &amp; management</span>
                <dl className="col gap-2" style={{ fontSize: 13, margin: 0 }}>
                  {hospital.ownershipType && (
                    <div className="row between gap-2">
                      <dt className="muted">Type</dt>
                      <dd style={{ fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{hospital.ownershipType}</dd>
                    </div>
                  )}
                  {hospital.parentOrganization && (
                    <div className="row between gap-2">
                      <dt className="muted">Parent</dt>
                      <dd style={{ fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{hospital.parentOrganization}</dd>
                    </div>
                  )}
                  {hospital.ownerName && (
                    <div className="col gap-1">
                      <dt className="muted">Key people</dt>
                      <dd style={{ color: 'var(--ink-2)', margin: 0 }}>{hospital.ownerName}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Insurance partners */}
              {hospital.insuranceTies.length > 0 && (
                <div className="card col gap-3" style={{ padding: 20 }}>
                  <div className="col gap-1">
                    <span className="kicker"><span className="dot" />accepted insurance</span>
                    <span className="muted-2" style={{ fontSize: 11 }}>
                      {hospital.insuranceTies.filter(t => t.isCashless).length} cashless partners
                    </span>
                  </div>

                  {/* Government schemes */}
                  {hospital.insuranceTies.filter(t => t.insurer.providerType === 'government').length > 0 && (
                    <div className="col gap-2">
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Government schemes
                      </span>
                      <div className="col">
                        {hospital.insuranceTies
                          .filter(t => t.insurer.providerType === 'government')
                          .map((tie, i, arr) => (
                            <Link
                              key={tie.id}
                              href={`/insurance/${tie.insurer.slug}`}
                              className="row between ai-center gap-2"
                              style={{
                                padding: '10px 0',
                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                fontSize: 13,
                              }}
                            >
                              <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{tie.insurer.name}</span>
                              {tie.isCashless && <span className="pill pill-mint">Cashless</span>}
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Private insurance */}
                  <div className="col">
                    {hospital.insuranceTies
                      .filter(t => t.insurer.providerType !== 'government')
                      .slice(0, 8)
                      .map((tie, i, arr) => (
                        <Link
                          key={tie.id}
                          href={`/insurance/${tie.insurer.slug}`}
                          className="row between ai-center gap-2"
                          style={{
                            padding: '10px 0',
                            borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                            fontSize: 13,
                          }}
                        >
                          <div className="row gap-2 ai-center" style={{ minWidth: 0 }}>
                            {tie.insurer.logo ? (
                              <Image
                                src={tie.insurer.logo}
                                alt={tie.insurer.name}
                                width={20}
                                height={20}
                                unoptimized
                                style={{ width: 20, height: 20, objectFit: 'contain' }}
                              />
                            ) : (
                              <span style={{ width: 20, height: 20, borderRadius: 'var(--r-1)', background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 11, fontWeight: 600 }}>
                                {tie.insurer.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <span style={{ color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tie.insurer.name}
                            </span>
                          </div>
                          <div className="row gap-1" style={{ flexShrink: 0 }}>
                            {tie.isCashless && <span className="pill pill-mint">Cashless</span>}
                            {tie.isPreferred && <span className="pill pill-magenta">Preferred</span>}
                          </div>
                        </Link>
                      ))}
                  </div>

                  {hospital.insuranceTies.filter(t => t.insurer.providerType !== 'government').length > 8 && (
                    <Link
                      href={`/hospitals/${hospital.slug}/insurance`}
                      className="mono"
                      style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}
                    >
                      View all {hospital.insuranceTies.length} insurers →
                    </Link>
                  )}

                  <p className="muted-2" style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--ink-2)' }}>Tip:</strong> Always verify insurance coverage and cashless eligibility with the hospital before admission.
                  </p>
                </div>
              )}

              {/* Infrastructure */}
              <div className="card col gap-3" style={{ padding: 20 }}>
                <span className="kicker"><span className="dot" />infrastructure</span>
                <div className="grid grid-cols-2" style={{ gap: 8 }}>
                  {hospital.bedCount && (
                    <div className="card-quiet col gap-1" style={{ padding: 12, alignItems: 'center' }}>
                      <span className="bignum" style={{ fontSize: 24, color: 'var(--cobalt)' }}>{hospital.bedCount}</span>
                      <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Beds</span>
                    </div>
                  )}
                  {hospital.icuBeds && (
                    <div className="card-quiet col gap-1" style={{ padding: 12, alignItems: 'center' }}>
                      <span className="bignum" style={{ fontSize: 24, color: 'var(--orange-2)' }}>{hospital.icuBeds}</span>
                      <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ICU</span>
                    </div>
                  )}
                  {hospital.operationTheaters && (
                    <div className="card-quiet col gap-1" style={{ padding: 12, alignItems: 'center' }}>
                      <span className="bignum" style={{ fontSize: 24, color: 'var(--ink)' }}>{hospital.operationTheaters}</span>
                      <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>OTs</span>
                    </div>
                  )}
                  {hospital.emergencyBeds && (
                    <div className="card-quiet col gap-1" style={{ padding: 12, alignItems: 'center' }}>
                      <span className="bignum" style={{ fontSize: 24, color: 'var(--magenta)' }}>{hospital.emergencyBeds}</span>
                      <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emergency</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Departments */}
              {hospital.departments.length > 0 && (
                <div className="card col gap-3" style={{ padding: 20 }}>
                  <span className="kicker"><span className="dot" />departments</span>
                  <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                    {hospital.departments.slice(0, 15).map((dept) => (
                      <span key={dept.id} className="pill">{dept.name}</span>
                    ))}
                    {hospital.departments.length > 15 && (
                      <span className="pill muted">+{hospital.departments.length - 15} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Equipment */}
              <div className="card col gap-3" style={{ padding: 20 }}>
                <span className="kicker"><span className="dot" />equipment &amp; technology</span>
                <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                  {COMMON_EQUIPMENT.map((equip, i) => (
                    <span key={i} className="pill pill-cobalt">{equip}</span>
                  ))}
                </div>
                <p className="muted-2" style={{ fontSize: 11, margin: 0 }}>
                  * Contact hospital for complete equipment list
                </p>
              </div>

              {/* Amenities */}
              <div className="card col gap-3" style={{ padding: 20 }}>
                <span className="kicker"><span className="dot" />amenities</span>
                <div className="grid grid-cols-2" style={{ gap: 8, fontSize: 13 }}>
                  {hospital.bloodBank && <AmenityRow label="Blood Bank" />}
                  {hospital.pharmacy24x7 && <AmenityRow label="24/7 Pharmacy" />}
                  {hospital.cafeteria && <AmenityRow label="Cafeteria" />}
                  {hospital.parking && <AmenityRow label="Parking" />}
                  {hospital.wifi && <AmenityRow label="Free WiFi" />}
                  {hospital.airportPickup && <AmenityRow label="Airport Pickup" />}
                  {hospital.translatorServices && <AmenityRow label="Translator" />}
                  {hospital.internationalPatientDesk && <AmenityRow label="Int'l Desk" />}
                </div>
              </div>

              {/* External links */}
              <div className="card col gap-3" style={{ padding: 20 }}>
                <span className="kicker"><span className="dot" />external links</span>
                <div className="col gap-2">
                  {hospital.website && (
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono"
                      style={{ fontSize: 12, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      ↗ official website
                    </a>
                  )}
                  {hospital.latitude && hospital.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${hospital.name}+${hospital.city}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono"
                      style={{ fontSize: 12, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      ↗ google business profile
                    </a>
                  )}
                  {hospital.phone && (
                    <a
                      href={`tel:${hospital.phone}`}
                      className="mono"
                      style={{ fontSize: 12, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      ↗ call hospital
                    </a>
                  )}
                  {hospital.emergencyPhone && (
                    <a
                      href={`tel:${hospital.emergencyPhone}`}
                      className="mono"
                      style={{ fontSize: 12, color: 'var(--orange-2)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}
                    >
                      ↗ emergency: {hospital.emergencyPhone}
                    </a>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function AmenityRow({ label }: { label: string }) {
  return (
    <div className="row gap-2 ai-center" style={{ color: 'var(--ink-2)' }}>
      <span style={{ color: 'var(--mint-3)', fontWeight: 600 }}>✓</span>
      <span>{label}</span>
    </div>
  );
}
