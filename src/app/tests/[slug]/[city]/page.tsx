import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string; city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, city } = await params;
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const test = await prisma.diagnosticTest.findUnique({
    where: { slug },
    select: { name: true, shortName: true, description: true, avgPriceInr: true },
  });

  if (!test) {
    return { title: 'Test Not Found | aihealz' };
  }

  const priceText = test.avgPriceInr ? ` starting at ₹${Number(test.avgPriceInr).toLocaleString('en-IN')}` : '';

  return {
    title: `${test.name} in ${cityName} - Price, Labs & Home Collection | aihealz`,
    description: `Book ${test.name} in ${cityName}${priceText}. Compare prices from certified labs, get home sample collection, and receive reports online.`,
    keywords: [
      `${test.name} in ${cityName}`,
      `${test.shortName || test.name} ${cityName}`,
      `${test.name} price ${cityName}`,
      `${test.name} home collection ${cityName}`,
      'lab test near me',
    ],
    openGraph: {
      title: `${test.name} in ${cityName} | Compare Prices & Book`,
      description: `Find the best prices for ${test.name} in ${cityName}. Home sample collection available.`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  try {
    const tests = await prisma.diagnosticTest.findMany({
      where: { isActive: true },
      select: { slug: true },
      orderBy: { searchVolume: 'desc' },
      take: 20,
    });

    const cities = await prisma.geography.findMany({
      where: {
        level: 'city',
        isActive: true,
      },
      select: { slug: true },
      take: 50,
    });

    const params: { slug: string; city: string }[] = [];
    for (const test of tests) {
      for (const city of cities) {
        params.push({ slug: test.slug, city: city.slug });
      }
    }

    return params.slice(0, 200);
  } catch {
    return [];
  }
}

export default async function TestCityPage({ params }: PageProps) {
  const { slug, city } = await params;
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const test = await prisma.diagnosticTest.findUnique({
    where: { slug },
    include: {
      category: {
        include: { parent: true },
      },
    },
  });

  if (!test || !test.isActive) {
    notFound();
  }

  const cityGeo = await prisma.geography.findFirst({
    where: {
      slug: city,
      level: 'city',
      isActive: true,
    },
    select: { id: true },
  });

  const providers = cityGeo
    ? await prisma.diagnosticProvider.findMany({
        where: {
          isActive: true,
          geographyId: cityGeo.id,
          testPrices: {
            some: {
              testId: test.id,
              isActive: true,
            },
          },
        },
        include: {
          testPrices: {
            where: {
              testId: test.id,
              isActive: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
        take: 10,
      })
    : [];

  const generalProviders =
    providers.length === 0
      ? await prisma.diagnosticProvider.findMany({
          where: {
            isActive: true,
            testPrices: {
              some: {
                testId: test.id,
                isActive: true,
              },
            },
          },
          include: {
            testPrices: {
              where: {
                testId: test.id,
                isActive: true,
              },
            },
            geography: { select: { name: true } },
          },
          orderBy: { rating: 'desc' },
          take: 8,
        })
      : [];

  const allProviders = providers.length > 0 ? providers : generalProviders;

  const relatedTests = await prisma.diagnosticTest.findMany({
    where: {
      categoryId: test.categoryId,
      isActive: true,
      id: { not: test.id },
    },
    select: { slug: true, name: true, shortName: true },
    take: 6,
  });

  const otherCities = await prisma.geography.findMany({
    where: {
      level: 'city',
      isActive: true,
      slug: { not: city },
    },
    select: { slug: true, name: true },
    take: 8,
  });

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalTest',
    name: test.name,
    alternateName: test.shortName,
    description: test.description,
    areaServed: {
      '@type': 'City',
      name: cityName,
    },
    provider: allProviders.map((p) => ({
      '@type': 'DiagnosticLab',
      name: p.name,
      ...(p.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(p.rating), reviewCount: p.reviewCount } }),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px clamp(16px, 4vw, 28px) 80px' }} className="col gap-7">
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
            <Link href="/tests" style={{ color: 'var(--ink-3)' }}>Tests</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/tests/${test.slug}`} style={{ color: 'var(--ink-3)' }}>
              {test.shortName || test.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span style={{ color: 'var(--ink)' }}>{cityName}</span>
          </nav>

          {/* Hero */}
          <header className="col gap-4">
            <div className="row gap-2 ai-center">
              <span className="section-mark">test in city</span>
              <span className="pill pill-cobalt">
                <span className="pill-dot" style={{ background: 'var(--cobalt)' }} aria-hidden="true" />
                {cityName}
              </span>
            </div>
            <h1
              className="display"
              style={{
                fontSize: 'clamp(36px, 5.5vw, 64px)',
                lineHeight: 0.95,
                letterSpacing: '-0.04em',
                margin: 0,
                fontWeight: 600,
              }}
            >
              {test.name} in <span style={{ color: 'var(--cobalt)' }}>{cityName}</span>
              <span style={{ color: 'var(--orange)' }}>.</span>
            </h1>
            <p className="lede" style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', maxWidth: 760, margin: 0 }}>
              Compare prices and book {test.name} from certified diagnostic labs in {cityName}. Home sample collection at select centers.
            </p>

            {/* Quick stats strip */}
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
              {test.avgPriceInr && (
                <div className="col gap-1" style={{ padding: '20px 22px', borderRight: '1px solid var(--rule)' }}>
                  <div className="display num" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.025em', color: 'var(--cobalt)' }}>
                    {formatPrice(Number(test.avgPriceInr))}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    starting price
                  </div>
                </div>
              )}
              {allProviders.length > 0 && (
                <div className="col gap-1" style={{ padding: '20px 22px', borderRight: test.homeCollectionPossible ? '1px solid var(--rule)' : 'none' }}>
                  <div className="display num" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.025em' }}>
                    {allProviders.length}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    labs available
                  </div>
                </div>
              )}
              {test.homeCollectionPossible && (
                <div className="col gap-1" style={{ padding: '20px 22px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--mint-3)' }}>Available</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    home collection
                  </div>
                </div>
              )}
            </div>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
              gap: 32,
            }}
            className="lg-grid"
          >
            {/* Providers */}
            <section className="col gap-4" aria-labelledby="providers-heading">
              <h2
                id="providers-heading"
                className="display"
                style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}
              >
                Labs offering {test.shortName || test.name} in {cityName}
              </h2>

              {allProviders.length > 0 ? (
                <div className="col gap-3">
                  {allProviders.map((provider) => {
                    const price = provider.testPrices[0];
                    return (
                      <article key={provider.id} className="card col gap-4" style={{ padding: 24 }}>
                        <div className="row between ai-start gap-3" style={{ flexWrap: 'wrap' }}>
                          <div className="row gap-3 ai-center">
                            {provider.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={provider.logo}
                                alt={provider.name}
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 'var(--r-2)',
                                  objectFit: 'cover',
                                  border: '1px solid var(--rule)',
                                }}
                              />
                            ) : (
                              <div className="spec-icon" style={{ width: 48, height: 48, fontSize: 18 }}>
                                {provider.name.charAt(0)}
                              </div>
                            )}
                            <div className="col gap-1">
                              <h3
                                className="display"
                                style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                              >
                                {provider.name}
                              </h3>
                              <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                                {provider.rating && (
                                  <span className="row gap-1 ai-center mono" style={{ fontSize: 12 }}>
                                    <svg width="12" height="12" viewBox="0 0 20 20" fill="var(--lemon-2)" aria-hidden="true">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
                                      {Number(provider.rating).toFixed(1)}
                                    </span>
                                    <span className="muted">({provider.reviewCount})</span>
                                  </span>
                                )}
                                {(() => {
                                  const geo = 'geography' in provider ? provider.geography : null;
                                  if (geo && typeof geo === 'object' && 'name' in geo) {
                                    return <span className="muted" style={{ fontSize: 12 }}>{String(geo.name)}</span>;
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>

                          {provider.isPartner && provider.partnerDiscount && (
                            <span className="pill pill-orange">
                              {Number(provider.partnerDiscount)}% off via aihealz
                            </span>
                          )}
                        </div>

                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                          {provider.homeCollectionAvailable && (
                            <span className="pill pill-mint">home collection</span>
                          )}
                          {provider.accreditations && provider.accreditations.length > 0 && (
                            <span className="pill">{provider.accreditations.join(', ')}</span>
                          )}
                        </div>

                        <div className="hairline" />

                        <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                          <div className="row ai-baseline gap-2">
                            {price && (
                              <>
                                <span
                                  className="display num"
                                  style={{ fontSize: 24, fontWeight: 500, color: 'var(--cobalt)', letterSpacing: '-0.02em' }}
                                >
                                  {formatPrice(Number(price.price))}
                                </span>
                                {price.mrpPrice && Number(price.mrpPrice) > Number(price.price) && (
                                  <span className="muted num" style={{ fontSize: 13, textDecoration: 'line-through' }}>
                                    {formatPrice(Number(price.mrpPrice))}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <Link
                            href={`/book/test/${test.slug}?provider=${provider.slug}&city=${city}`}
                            className="btn btn-cobalt"
                          >
                            Book now →
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="card col gap-3 ai-center" style={{ padding: 40, textAlign: 'center' }}>
                  <span className="pill">no labs yet</span>
                  <h3
                    className="display"
                    style={{ fontSize: 18, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                  >
                    No labs listed in {cityName} yet
                    <span style={{ color: 'var(--orange)' }}>.</span>
                  </h3>
                  <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 360 }}>
                    We&apos;re adding diagnostic centers in your area. Check back soon.
                  </p>
                  <Link href={`/tests/${test.slug}`} className="btn btn-paper">
                    View all providers →
                  </Link>
                </div>
              )}
            </section>

            {/* Sidebar */}
            <aside className="col gap-4">
              {/* Test info */}
              <div className="card col" style={{ padding: 0 }}>
                <div className="hairline-b" style={{ padding: '16px 20px' }}>
                  <h3
                    className="display"
                    style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}
                  >
                    About this test
                  </h3>
                </div>
                <dl className="col" style={{ margin: 0 }}>
                  {test.sampleType && (
                    <div className="row between ai-center hairline-b" style={{ padding: '12px 20px' }}>
                      <dt className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sample</dt>
                      <dd style={{ fontSize: 13, color: 'var(--ink)', margin: 0 }}>{test.sampleType}</dd>
                    </div>
                  )}
                  <div className="row between ai-center hairline-b" style={{ padding: '12px 20px' }}>
                    <dt className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fasting</dt>
                    <dd style={{ fontSize: 13, color: 'var(--ink)', margin: 0 }}>
                      {test.fastingRequired ? `${test.fastingHours || 8}–12 hours` : 'Not required'}
                    </dd>
                  </div>
                  {test.reportTimeHours && (
                    <div className="row between ai-center" style={{ padding: '12px 20px' }}>
                      <dt className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Report</dt>
                      <dd style={{ fontSize: 13, color: 'var(--ink)', margin: 0 }}>
                        {test.reportTimeHours < 24 ? `${test.reportTimeHours} hours` : `${Math.round(test.reportTimeHours / 24)} days`}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="hairline-t" style={{ padding: '12px 20px' }}>
                  <Link
                    href={`/tests/${test.slug}`}
                    className="btn btn-paper btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    View full details →
                  </Link>
                </div>
              </div>

              {/* Other cities */}
              {otherCities.length > 0 && (
                <div className="card col" style={{ padding: 0 }}>
                  <div className="hairline-b" style={{ padding: '16px 20px' }}>
                    <h3
                      className="display"
                      style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}
                    >
                      In other cities
                    </h3>
                  </div>
                  <div className="row gap-2" style={{ padding: 16, flexWrap: 'wrap' }}>
                    {otherCities.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/tests/${test.slug}/${c.slug}`}
                        className="btn btn-sm btn-paper"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related tests */}
              {relatedTests.length > 0 && (
                <div className="card col" style={{ padding: 0 }}>
                  <div className="hairline-b" style={{ padding: '16px 20px' }}>
                    <h3
                      className="display"
                      style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}
                    >
                      Related tests in {cityName}
                    </h3>
                  </div>
                  <ul className="clean col" style={{ margin: 0 }}>
                    {relatedTests.map((rt, i, arr) => (
                      <li key={rt.slug}>
                        <Link
                          href={`/tests/${rt.slug}/${city}`}
                          className="row between ai-center"
                          style={{
                            padding: '12px 20px',
                            borderBottom: i < arr.length - 1 ? '1px solid var(--rule-2)' : 'none',
                          }}
                        >
                          <span style={{ fontSize: 13, color: 'var(--ink)' }}>{rt.shortName || rt.name}</span>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)' }}>→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
