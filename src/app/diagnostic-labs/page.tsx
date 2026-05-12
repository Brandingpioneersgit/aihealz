import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Metadata } from 'next';
import { getGeoContext } from '@/lib/geo-context';
import AIKioskFinder from '@/components/diagnostic/AIKioskFinder';
import { HERO_IMAGES } from '@/lib/stock-images';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Diagnostic Labs & Imaging Centers Near You | aihealz',
  description: 'Find certified diagnostic labs and imaging centers near you. Compare prices, read reviews, and book lab tests with home sample collection available.',
  keywords: 'diagnostic labs, pathology labs, imaging centers, MRI scan, CT scan, blood test, lab test near me, home collection',
  alternates: { canonical: '/diagnostic-labs' },
  openGraph: {
    type: 'website',
    siteName: 'aihealz',
    url: 'https://aihealz.com/diagnostic-labs',
    title: 'Diagnostic Labs & Imaging Centers | aihealz',
    description: 'Find certified diagnostic labs and imaging centers with best prices.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diagnostic Labs & Imaging Centers | aihealz',
    description: 'Find certified diagnostic labs and imaging centers with best prices.',
  },
};

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  lab: 'Pathology Lab',
  imaging_center: 'Imaging Center',
  hospital: 'Hospital Diagnostics',
  clinic: 'Clinic',
  home_collection: 'Home Collection',
  full_service: 'Full Service',
};

export default async function DiagnosticLabsPage() {
  const geo = await getGeoContext();

  // Get user's geography for filtering
  let geoFilter = {};
  if (geo.countrySlug) {
    const userGeo = await prisma.geography.findFirst({
      where: { slug: geo.countrySlug, isActive: true },
      select: { id: true },
    });
    if (userGeo) {
      const childGeos = await prisma.geography.findMany({
        where: {
          OR: [
            { id: userGeo.id },
            { parentId: userGeo.id },
            { parent: { parentId: userGeo.id } },
          ],
          isActive: true,
        },
        select: { id: true },
      });
      geoFilter = { geographyId: { in: childGeos.map((g) => g.id) } };
    }
  }

  // Featured partners
  const featuredProviders = await prisma.diagnosticProvider.findMany({
    where: {
      isActive: true,
      isPartner: true,
      ...geoFilter,
    },
    include: {
      geography: { select: { name: true } },
      _count: { select: { testPrices: true, packages: true, reviews: true } },
    },
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: 6,
  });

  // All providers
  const providers = await prisma.diagnosticProvider.findMany({
    where: {
      isActive: true,
      id: { notIn: featuredProviders.map((p) => p.id) },
      ...geoFilter,
    },
    include: {
      geography: { select: { name: true } },
      _count: { select: { testPrices: true, packages: true, reviews: true } },
    },
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: 24,
  });

  const allProviders = [...featuredProviders, ...providers];

  // Type counts
  const typeCounts = await prisma.diagnosticProvider.groupBy({
    by: ['providerType'],
    where: { isActive: true, ...geoFilter },
    _count: true,
  });

  const labsSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://aihealz.com/diagnostic-labs#page',
        url: 'https://aihealz.com/diagnostic-labs',
        name: 'Diagnostic Labs & Imaging Centers',
        description:
          'Certified diagnostic labs and imaging centers with prices, accreditations, and home sample collection.',
        isPartOf: { '@id': 'https://aihealz.com/#website' },
      },
      {
        '@type': 'ItemList',
        '@id': 'https://aihealz.com/diagnostic-labs#labs',
        name: 'Diagnostic providers',
        numberOfItems: allProviders.length,
        itemListElement: allProviders.slice(0, 30).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'MedicalBusiness',
            name: p.name,
            url: `https://aihealz.com/diagnostic-labs/${p.slug}`,
            ...(p.geography?.name ? { areaServed: p.geography.name } : {}),
            ...(p.rating
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: p.rating,
                    reviewCount: p.reviewCount || 1,
                  },
                }
              : {}),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
          { '@type': 'ListItem', position: 2, name: 'Diagnostic Labs', item: 'https://aihealz.com/diagnostic-labs' },
        ],
      },
    ],
  };

  const totalTypeCount = typeCounts.reduce((sum, t) => sum + t._count, 0);

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
      <Script
        id="diagnostic-labs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(labsSchema) }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)' }} className="col gap-7">

        {/* Hero banner */}
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
          <Image
            src={HERO_IMAGES.lab.src}
            alt={HERO_IMAGES.lab.alt}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
            style={{ objectFit: 'cover' }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(10,26,47,0.55) 0%, rgba(10,26,47,0.20) 50%, rgba(10,26,47,0) 90%)',
            }}
          />
          <span
            className="mono"
            style={{
              position: 'absolute',
              left: 'clamp(16px, 3vw, 28px)',
              bottom: 18,
              color: 'rgba(255,255,255,0.9)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 500,
            }}
          >
            ● the index / diagnostic providers
          </span>
        </div>

        {/* Breadcrumb */}
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
          <span style={{ color: 'var(--ink)' }}>Diagnostic Labs</span>
        </div>

        {/* Hero */}
        <header className="col gap-4">
          <span className="section-mark">the index / diagnostic providers</span>
          <h1
            className="display"
            style={{
              fontSize: 'clamp(40px, 7vw, 84px)',
              lineHeight: 0.95,
              letterSpacing: '-0.045em',
              margin: 0,
              fontWeight: 600,
              maxWidth: 920,
            }}
          >
            Diagnostic labs &{' '}
            <span style={{ color: 'var(--cobalt)' }}>imaging centers</span>
            <span style={{ color: 'var(--orange)' }}>.</span>
          </h1>
          <p className="lede" style={{ fontSize: 'clamp(16px, 1.55vw, 19px)', maxWidth: 680 }}>
            Certified diagnostic centers near you — compare prices, read reviews, and book lab tests with home sample collection where available.
          </p>
          <div className="row gap-3 ai-center" style={{ marginTop: 4, flexWrap: 'wrap' }}>
            <span className="pill pill-cobalt">{totalTypeCount.toLocaleString()} verified providers</span>
            <span className="pill pill-mint">{featuredProviders.length} partner labs</span>
            <span className="kicker">prices · accreditations · ratings</span>
          </div>
        </header>

        {/* Filter Pills */}
        <div className="col gap-3" style={{ marginTop: 8 }}>
          <span className="kicker">filter by type</span>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <Link href="/diagnostic-labs" className="pill pill-ink">
              all centers · {totalTypeCount}
            </Link>
            {typeCounts.map((tc) => (
              <Link
                key={tc.providerType}
                href={`/diagnostic-labs?type=${tc.providerType}`}
                className="pill"
              >
                {PROVIDER_TYPE_LABELS[tc.providerType] || tc.providerType} · {tc._count}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Partners */}
        {featuredProviders.length > 0 && (
          <section className="col gap-5" style={{ marginTop: 24 }}>
            <div className="row between ai-end">
              <div className="col gap-2">
                <span className="section-mark">I / partner labs</span>
                <h2 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                  Verified partners.
                </h2>
              </div>
              <span className="pill pill-orange">exclusive discounts</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: 16,
              }}
            >
              {featuredProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/diagnostic-labs/${provider.slug}`}
                  className="card col gap-4"
                  style={{ padding: 22 }}
                >
                  <div className="row gap-3 ai-start">
                    {provider.logo ? (
                      <Image
                        src={provider.logo}
                        alt={provider.name}
                        width={56}
                        height={56}
                        unoptimized
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 'var(--r-2)',
                          objectFit: 'cover',
                          border: '1px solid var(--rule)',
                        }}
                      />
                    ) : (
                      <span
                        className="spec-icon"
                        aria-hidden="true"
                        style={{ width: 56, height: 56, fontSize: 22 }}
                      >
                        {provider.name.charAt(0)}
                      </span>
                    )}
                    <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                      <span className="kicker">{PROVIDER_TYPE_LABELS[provider.providerType] || provider.providerType}</span>
                      <h3 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 600, letterSpacing: '-0.015em' }}>
                        {provider.name}
                      </h3>
                      {provider.geography && (
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                          {provider.geography.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                    {provider.rating && (
                      <div className="row gap-1 ai-center">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--lemon-2)" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="num" style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>
                          {Number(provider.rating).toFixed(1)}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                          ({provider.reviewCount})
                        </span>
                      </div>
                    )}
                    {provider.partnerDiscount && (
                      <span className="pill pill-orange">
                        {Number(provider.partnerDiscount)}% off
                      </span>
                    )}
                  </div>

                  <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    {provider.homeCollectionAvailable && (
                      <span className="pill pill-mint">home collection</span>
                    )}
                    {provider.accreditations.slice(0, 2).map((acc, i) => (
                      <span key={i} className="pill">
                        {acc}
                      </span>
                    ))}
                  </div>

                  <div className="row between ai-center hairline-t" style={{ paddingTop: 14 }}>
                    <div className="row gap-4">
                      <div className="col">
                        <span className="num" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                          {provider._count.testPrices}
                        </span>
                        <span className="kicker">tests</span>
                      </div>
                      <div className="col">
                        <span className="num" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                          {provider._count.packages}
                        </span>
                        <span className="kicker">packages</span>
                      </div>
                    </div>
                    <span className="kicker" style={{ color: 'var(--cobalt)' }}>view lab →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Providers */}
        <section className="col gap-5" style={{ marginTop: 32 }}>
          <div className="row between ai-end">
            <div className="col gap-2">
              <span className="section-mark">II / all providers</span>
              <h2 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                Diagnostic centers.
              </h2>
            </div>
            <span className="kicker">{providers.length} listed</span>
          </div>

          {providers.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 0,
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-3)',
                background: 'var(--paper)',
                overflow: 'hidden',
              }}
            >
              {providers.map((provider, i) => {
                const cols = 4;
                const isLastRow = i >= providers.length - (providers.length % cols || cols);
                const isLastCol = (i + 1) % cols === 0;
                return (
                  <Link
                    key={provider.id}
                    href={`/diagnostic-labs/${provider.slug}`}
                    className="col gap-3"
                    style={{
                      padding: 18,
                      borderRight: !isLastCol ? '1px solid var(--rule)' : 'none',
                      borderBottom: !isLastRow ? '1px solid var(--rule)' : 'none',
                    }}
                  >
                    <div className="row gap-3 ai-start">
                      {provider.logo ? (
                        <Image
                          src={provider.logo}
                          alt={provider.name}
                          width={40}
                          height={40}
                          unoptimized
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--r-2)',
                            objectFit: 'cover',
                            border: '1px solid var(--rule)',
                          }}
                        />
                      ) : (
                        <span className="spec-icon" aria-hidden="true">
                          {provider.name.charAt(0)}
                        </span>
                      )}
                      <div className="col" style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          className="display"
                          style={{
                            fontSize: 14,
                            margin: 0,
                            fontWeight: 600,
                            letterSpacing: '-0.015em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {provider.name}
                        </h3>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {provider.geography?.name || PROVIDER_TYPE_LABELS[provider.providerType]}
                        </span>
                      </div>
                    </div>

                    <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                      {provider.rating && (
                        <div className="row gap-1 ai-center">
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="var(--lemon-2)" aria-hidden="true">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="num" style={{ fontSize: 12, fontWeight: 600 }}>
                            {Number(provider.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                      {provider.homeCollectionAvailable && (
                        <span className="kicker" style={{ color: 'var(--mint-3)' }}>home collection</span>
                      )}
                    </div>

                    <div className="row between ai-center hairline-t" style={{ paddingTop: 10 }}>
                      <span className="kicker">{provider._count.testPrices} tests</span>
                      <span className="kicker" style={{ color: 'var(--cobalt)' }}>view →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {allProviders.length === 0 && (
            <div className="card col ai-center" style={{ padding: 56, textAlign: 'center' }}>
              <span className="spec-icon" aria-hidden="true" style={{ width: 48, height: 48, fontSize: 18, marginBottom: 16 }}>
                ?
              </span>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px', fontWeight: 600 }}>
                No labs found in your area.
              </h3>
              <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>
                We&apos;re adding diagnostic centers near you soon.
              </p>
              <Link href="/tests" className="btn btn-cobalt">
                Browse all tests
              </Link>
            </div>
          )}
        </section>

        {/* AI Health Kiosks Section */}
        <section style={{ marginTop: 32 }}>
          <AIKioskFinder />
        </section>

        {/* Partner CTA */}
        <section style={{ marginTop: 32 }}>
          <div className="card-ink col gap-5" style={{ padding: 40 }}>
            <span
              className="section-mark"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              IV / for partners
            </span>
            <div className="col gap-3">
              <h2
                className="display"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  margin: 0,
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  color: 'var(--paper)',
                  maxWidth: 720,
                }}
              >
                Own a diagnostic lab? Reach more patients
                <span style={{ color: 'var(--cobalt-3)' }}>.</span>
              </h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', maxWidth: 600 }}>
                Partner with aihealz to run online bookings, manage home collection, and surface real-time analytics — all from one console.
              </p>
            </div>
            <div className="row gap-3" style={{ flexWrap: 'wrap', marginTop: 8 }}>
              <Link href="/provider/lab/register" className="btn btn-cobalt">
                Register your lab
              </Link>
              <Link
                href="/pricing"
                className="btn"
                style={{
                  background: 'transparent',
                  color: 'var(--paper)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
