import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';
import {
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateFAQSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Top Hospitals - Rankings, Reviews & Specialties | AIHealz',
  description: 'Find the best hospitals with patient reviews, specialties, bed availability, accreditations, and detailed information for both domestic and international patients.',
  keywords: 'best hospitals, top hospitals, hospital rankings, medical tourism hospitals, NABH hospitals, JCI accredited',
  alternates: { canonical: '/hospitals' },
  openGraph: {
    type: 'website',
    siteName: 'aihealz',
    title: 'Find Top Hospitals Worldwide | AIHealz',
    description: 'Compare hospital rankings, specialties, accreditations, and patient reviews.',
    url: 'https://aihealz.com/hospitals',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Top Hospitals Worldwide | AIHealz',
    description: 'Compare hospital rankings, specialties, accreditations, and patient reviews.',
  },
};

const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  government: 'Government',
  private: 'Private',
  public_private_partnership: 'PPP',
  charitable: 'Charitable',
  trust: 'Trust',
  corporate_chain: 'Corporate Chain',
  standalone: 'Standalone',
  teaching: 'Teaching',
  research: 'Research',
  military: 'Military',
  railway: 'Railway',
  municipal: 'Municipal',
};

async function getGeoFromCookie() {
  const cookieStore = await cookies();
  const geoCookie = cookieStore.get('aihealz-geo')?.value;
  if (!geoCookie) return null;

  const parts = geoCookie.split(':');
  return {
    countrySlug: parts[0] || null,
    citySlug: parts[1] || null,
  };
}

function hospitalInitials(name: string): string {
  const words = name.replace(/[^A-Za-z\s]/g, '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'HX';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default async function HospitalsPage() {
  const geo = await getGeoFromCookie();

  // Get geography ID if available - include country, states, and cities
  let geoFilter = {};
  if (geo?.citySlug) {
    const city = await prisma.geography.findFirst({
      where: { slug: geo.citySlug, level: 'city' },
    });
    if (city) geoFilter = { geographyId: city.id };
  } else if (geo?.countrySlug) {
    const country = await prisma.geography.findFirst({
      where: { slug: geo.countrySlug, level: 'country' },
    });
    if (country) {
      const states = await prisma.geography.findMany({
        where: { parentId: country.id },
        select: { id: true },
      });
      const stateIds = states.map(s => s.id);

      const cities = await prisma.geography.findMany({
        where: { parentId: { in: stateIds } },
        select: { id: true },
      });

      const allGeoIds = [country.id, ...stateIds, ...cities.map(c => c.id)];
      geoFilter = { geographyId: { in: allGeoIds } };
    }
  }

  const [hospitals, stats, topCities] = await Promise.all([
    prisma.hospital.findMany({
      where: {
        isActive: true,
        ...geoFilter,
      },
      include: {
        geography: { select: { name: true, slug: true } },
        specialties: {
          take: 5,
          select: { specialty: true },
        },
        _count: {
          select: { reviews: true, doctors: true, departments: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { overallRating: 'desc' },
      ],
      take: 50,
    }),
    prisma.hospital.aggregate({
      _count: true,
      _avg: { overallRating: true, domesticRating: true, internationalRating: true },
      where: { isActive: true, ...geoFilter },
    }),
    prisma.hospital.groupBy({
      by: ['geographyId'],
      _count: true,
      where: { isActive: true },
      orderBy: { _count: { geographyId: 'desc' } },
      take: 10,
    }),
  ]);

  // Get city names for top cities
  const cityIds = topCities.map(c => c.geographyId).filter(Boolean) as number[];
  const cities = await prisma.geography.findMany({
    where: { id: { in: cityIds } },
    select: { id: true, name: true, slug: true },
  });
  const cityMap = new Map(cities.map(c => [c.id, c]));

  const formatRating = (rating: number | null) => {
    if (!rating) return '–';
    return Number(rating).toFixed(1);
  };

  // Generate structured data
  const hospitalFaqs = [
    { question: 'How are hospitals ranked on AIHealz?', answer: 'Hospitals are ranked based on patient reviews, accreditations (JCI, NABH), specialty expertise, bed count, and outcome data. We combine domestic and international patient ratings.' },
    { question: 'What does hospital accreditation mean?', answer: 'Accreditation (JCI, NABH) indicates that a hospital meets international quality and safety standards. It ensures standardized processes, patient safety protocols, and quality of care.' },
    { question: 'Can international patients use AIHealz?', answer: 'Yes, AIHealz serves both domestic and international patients. We provide separate ratings for international patient experience and offer medical travel coordination.' },
    { question: 'How do I compare hospitals?', answer: 'You can compare hospitals by ratings, specialties, accreditations, bed count, and patient reviews. Filter by city or specialty to find the best match for your needs.' },
  ];

  const structuredData = [
    generateWebPageSchema(
      'Top Hospitals - Rankings, Reviews & Specialties',
      'Find the best hospitals with patient reviews, specialties, bed availability, accreditations for domestic and international patients.',
      'https://aihealz.com/hospitals'
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Hospitals', url: '/hospitals' },
    ]),
    generateItemListSchema(
      'Top Hospitals',
      'Compare hospital rankings, specialties, and accreditations',
      hospitals.slice(0, 10).map((h, i) => ({
        name: h.name,
        url: `/hospitals/${h.slug}`,
        position: i + 1,
      }))
    ),
    generateFAQSchema(hospitalFaqs),
  ];

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 28px 80px' }}
        className="col gap-7"
      >
        {/* ── Hero ──────────────────────────────────── */}
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
            <span style={{ color: 'var(--ink)' }}>Hospitals</span>
          </div>

          <span className="section-mark">the index / by hospital</span>

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
              {(stats._count as number).toLocaleString()}
            </span>{' '}
            hospitals
            <span style={{ color: 'var(--orange)' }}>.</span>
          </h1>

          <p
            className="lede"
            style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 680 }}
          >
            Patient-reviewed, accreditation-verified, specialty-indexed. Compare bed count, JCI/NABH credentials, and outcome data — for both domestic and international patients.
          </p>
        </header>

        {/* ── Stats strip ────────────────────────────── */}
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
            { v: (stats._count as number).toLocaleString(), l: 'hospitals indexed' },
            { v: formatRating(stats._avg.overallRating as number | null), l: 'avg overall rating' },
            { v: formatRating(stats._avg.domesticRating as number | null), l: 'avg domestic rating' },
            { v: formatRating(stats._avg.internationalRating as number | null), l: 'avg int’l rating' },
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

        {/* ── City Filters ───────────────────────────── */}
        {topCities.length > 0 && (
          <section className="col gap-3" aria-labelledby="cities-heading">
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
              <h2
                id="cities-heading"
                className="display"
                style={{ fontSize: 22, margin: 0, letterSpacing: '-0.02em', fontWeight: 600 }}
              >
                Browse by city
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
                {topCities.length} cities
              </span>
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              <Link
                href="/hospitals"
                className="pill pill-cobalt"
                style={{ textTransform: 'none', cursor: 'pointer' }}
              >
                All cities
              </Link>
              {topCities.map(tc => {
                const city = cityMap.get(tc.geographyId!);
                if (!city) return null;
                return (
                  <Link
                    key={city.id}
                    href={`/hospitals?city=${city.slug}`}
                    className="pill"
                    style={{ textTransform: 'none', cursor: 'pointer' }}
                  >
                    {city.name}
                    <span className="mono muted" style={{ marginLeft: 6 }}>
                      {tc._count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Hospital list ──────────────────────────── */}
        {hospitals.length > 0 ? (
          <section className="col gap-4" aria-labelledby="hospitals-heading">
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
              <h2
                id="hospitals-heading"
                className="display"
                style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
              >
                Top hospitals
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
                {hospitals.length} shown
              </span>
            </div>

            <div className="col gap-3">
              {hospitals.map(hospital => {
                const isTop = hospital.isFeatured;
                const initials = hospitalInitials(hospital.name);
                const overall = hospital.overallRating as number | null;
                const intl = hospital.internationalRating as number | null;
                const dom = hospital.domesticRating as number | null;

                return (
                  <Link
                    key={hospital.id}
                    href={`/hospitals/${hospital.slug}`}
                    className="card"
                    style={{
                      padding: 20,
                      display: 'block',
                      borderColor: isTop ? 'var(--cobalt)' : 'var(--rule)',
                      color: 'var(--ink)',
                    }}
                  >
                    <div className="row gap-4 ai-start" style={{ flexWrap: 'wrap' }}>
                      {/* Logo / monogram */}
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 'var(--r-2)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: 'var(--bg-2)',
                          border: '1px solid var(--rule)',
                        }}
                      >
                        {hospital.logo ? (
                          <AvatarWithFallback
                            src={hospital.logo}
                            alt={hospital.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div
                            className="row ai-center center"
                            style={{
                              width: '100%',
                              height: '100%',
                              fontFamily: 'var(--display)',
                              fontSize: 22,
                              fontWeight: 600,
                              color: 'var(--ink-2)',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
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
                                {hospital.name}
                              </span>
                              {hospital.isFeatured && (
                                <span className="pill pill-cobalt">featured</span>
                              )}
                              {hospital.isVerified && (
                                <span className="pill pill-mint">verified</span>
                              )}
                            </div>
                            <div className="row gap-3 ai-center muted" style={{ fontSize: 13, flexWrap: 'wrap' }}>
                              <span className="mono" style={{ fontSize: 12 }}>
                                {hospital.geography?.name || hospital.city || '—'}
                              </span>
                              <span style={{ color: 'var(--ink-4)' }}>·</span>
                              <span style={{ fontSize: 13 }}>
                                {HOSPITAL_TYPE_LABELS[hospital.hospitalType] || hospital.hospitalType}
                              </span>
                              {hospital.bedCount && (
                                <>
                                  <span style={{ color: 'var(--ink-4)' }}>·</span>
                                  <span className="mono num" style={{ fontSize: 12 }}>
                                    {hospital.bedCount} beds
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Ratings column */}
                          <div className="col ai-end gap-1">
                            <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>
                              ★ {formatRating(overall)}
                            </div>
                            {dom !== null && (
                              <div
                                className="mono"
                                style={{ fontSize: 11, color: 'var(--ink-3)' }}
                              >
                                dom {formatRating(dom)}
                              </div>
                            )}
                            {intl !== null && (
                              <div
                                className="mono"
                                style={{ fontSize: 11, color: 'var(--cobalt)' }}
                              >
                                int’l {formatRating(intl)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Accreditation pills */}
                        {hospital.accreditations.length > 0 && (
                          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            {[...new Set(hospital.accreditations)].slice(0, 4).map((acc, i) => (
                              <span key={i} className="pill pill-cobalt">
                                {acc}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Specialty pills */}
                        {hospital.specialties.length > 0 && (
                          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            {hospital.specialties.map((spec, idx) => (
                              <span key={idx} className="pill" style={{ textTransform: 'none' }}>
                                {spec.specialty}
                              </span>
                            ))}
                            {hospital._count.departments > 5 && (
                              <span className="pill muted" style={{ textTransform: 'none' }}>
                                +{hospital._count.departments - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Meta row */}
                        <div
                          className="row gap-4 mono"
                          style={{ flexWrap: 'wrap', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                        >
                          <span>
                            <span className="num" style={{ color: 'var(--ink-2)' }}>
                              {hospital._count.doctors}
                            </span>{' '}
                            doctors
                          </span>
                          <span>
                            <span className="num" style={{ color: 'var(--ink-2)' }}>
                              {hospital._count.reviews}
                            </span>{' '}
                            reviews
                          </span>
                        </div>

                        {/* Pros & awards */}
                        {(hospital.prosForPatients.length > 0 ||
                          (Array.isArray(hospital.awards) && hospital.awards.length > 0)) && (
                          <div
                            className="row gap-3 hairline-t"
                            style={{ flexWrap: 'wrap', paddingTop: 10, marginTop: 4 }}
                          >
                            {hospital.prosForPatients.slice(0, 2).map((pro, i) => (
                              <span
                                key={i}
                                className="row gap-1 ai-center"
                                style={{ fontSize: 12, color: 'var(--mint-3)' }}
                              >
                                <span aria-hidden="true">✓</span>
                                {pro}
                              </span>
                            ))}
                            {Array.isArray(hospital.awards) &&
                              (hospital.awards as Array<{ award: string }>)
                                .slice(0, 2)
                                .map((award, i) => (
                                  <span
                                    key={i}
                                    className="row gap-1 ai-center"
                                    style={{ fontSize: 12, color: 'var(--ink-2)' }}
                                  >
                                    <span aria-hidden="true" style={{ color: 'var(--lemon-2)' }}>★</span>
                                    {award.award}
                                  </span>
                                ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div
            className="card"
            style={{
              padding: 48,
              textAlign: 'center',
              borderStyle: 'dashed',
            }}
          >
            <h3
              className="display"
              style={{ fontSize: 22, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em' }}
            >
              Network syncing
            </h3>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              No hospitals match this filter yet — try a different city, or check back shortly.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
