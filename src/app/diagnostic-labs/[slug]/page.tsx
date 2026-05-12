import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await prisma.diagnosticProvider.findUnique({
    where: { slug },
    select: { name: true, description: true, providerType: true },
  });

  if (!provider) {
    return { title: 'Lab Not Found | aihealz' };
  }

  return {
    title: `${provider.name} - Tests, Prices & Reviews | aihealz`,
    description: provider.description || `Book lab tests at ${provider.name}. Compare prices, read reviews, and book with home collection available.`,
    openGraph: {
      title: `${provider.name} | Diagnostic Lab`,
      description: `View tests, packages, and prices at ${provider.name}.`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  try {
    const providers = await prisma.diagnosticProvider.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 50,
    });
    return providers.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

export default async function ProviderDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const provider = await prisma.diagnosticProvider.findUnique({
    where: { slug },
    include: {
      geography: {
        include: { parent: { include: { parent: true } } },
      },
      testPrices: {
        where: { isActive: true },
        include: {
          test: {
            select: {
              id: true,
              slug: true,
              name: true,
              shortName: true,
              sampleType: true,
              reportTimeHours: true,
              homeCollectionPossible: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { test: { searchVolume: 'desc' } },
        take: 50,
      },
      packages: {
        where: { isActive: true },
        include: {
          tests: {
            include: {
              test: { select: { name: true, shortName: true } },
            },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
        take: 10,
      },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!provider || !provider.isActive) {
    notFound();
  }

  // Group tests by category
  const testsByCategory = provider.testPrices.reduce(
    (acc, tp) => {
      const catName = tp.test.category.name;
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(tp);
      return acc;
    },
    {} as Record<string, typeof provider.testPrices>
  );

  const avgRating = provider.rating ? Number(provider.rating).toFixed(1) : null;

  // Structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'DiagnosticLab',
    name: provider.name,
    description: provider.description,
    address: provider.address,
    telephone: provider.phone,
    email: provider.email,
    url: provider.website,
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: provider.reviewCount,
      },
    }),
  };

  const locationLine = provider.geography
    ? [provider.geography.name, provider.geography.parent?.name, provider.geography.parent?.parent?.name]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
          className="col gap-7"
        >
          {/* ── Breadcrumb ─────────────────────────────── */}
          <nav
            className="row gap-2 mono"
            style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
            aria-label="Breadcrumb"
          >
            <Link href="/diagnostic-labs">Labs</Link>
            <span>/</span>
            <span style={{ color: 'var(--ink)' }}>{provider.name}</span>
          </nav>

          {/* ── Hero card ──────────────────────────────── */}
          <header
            className="card col gap-5"
            style={{ padding: 'clamp(24px, 3vw, 36px)' }}
          >
            <div className="row gap-5 ai-start" style={{ flexWrap: 'wrap' }}>
              {provider.logo ? (
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  width={88}
                  height={88}
                  unoptimized
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 'var(--r-2)',
                    objectFit: 'cover',
                    border: '1px solid var(--rule)',
                  }}
                />
              ) : (
                <div className="spec-icon" style={{ width: 88, height: 88, fontSize: 36, borderRadius: 'var(--r-3)' }}>
                  {provider.name.charAt(0)}
                </div>
              )}

              <div className="col gap-3" style={{ flex: '1 1 320px', minWidth: 0 }}>
                <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                  {provider.isPartner && <span className="pill pill-orange">partner lab</span>}
                  {provider.providerType && <span className="pill">{provider.providerType}</span>}
                  {provider.homeCollectionAvailable && <span className="pill pill-mint">home collection</span>}
                </div>
                <h1
                  className="display"
                  style={{
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    margin: 0,
                    letterSpacing: '-0.035em',
                    fontWeight: 600,
                    lineHeight: 1.05,
                  }}
                >
                  {provider.name}
                  <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                {locationLine && (
                  <p className="muted" style={{ fontSize: 14, margin: 0 }}>{locationLine}</p>
                )}

                {avgRating && (
                  <div className="row gap-2 ai-center">
                    <span className="num" style={{ fontSize: 16, fontWeight: 500 }}>{avgRating}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                      ★ · {provider.reviewCount} reviews
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div
                className="row"
                style={{
                  gap: 0,
                  border: '1px solid var(--rule)',
                  borderRadius: 'var(--r-3)',
                  overflow: 'hidden',
                  alignSelf: 'flex-start',
                  flex: '0 0 auto',
                }}
              >
                {[
                  { v: provider.testPrices.length, l: 'tests' },
                  { v: provider.packages.length, l: 'packages' },
                  ...(provider.partnerDiscount ? [{ v: `${Number(provider.partnerDiscount)}%`, l: 'discount' }] : []),
                ].map((s, i, arr) => (
                  <div
                    key={s.l}
                    className="col gap-1"
                    style={{
                      padding: '14px 22px',
                      borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                      textAlign: 'center',
                    }}
                  >
                    <span className="num" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.025em' }}>
                      {s.v}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {s.l}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditations */}
            {(provider.accreditations.length > 0 || provider.onlineReportsAvailable) && (
              <>
                <div className="hairline" />
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {provider.accreditations.map((acc, i) => (
                    <span key={i} className="pill pill-mint">{acc}</span>
                  ))}
                  {provider.onlineReportsAvailable && <span className="pill">online reports</span>}
                </div>
              </>
            )}

            {provider.description && (
              <>
                <div className="hairline" />
                <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                  {provider.description}
                </p>
              </>
            )}
          </header>

          {/* ── Main grid ──────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
              gap: 32,
              alignItems: 'flex-start',
            }}
          >
            {/* Left: Tests & Packages */}
            <div className="col gap-7" style={{ minWidth: 0 }}>
              {/* Health Packages */}
              {provider.packages.length > 0 && (
                <section className="col gap-4">
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
                      style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                    >
                      Health packages
                    </h2>
                  </div>
                  <div className="col gap-3">
                    {provider.packages.map((pkg) => (
                      <div key={pkg.id} className="card col gap-4" style={{ padding: 24 }}>
                        <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 16 }}>
                          <div className="col gap-2" style={{ flex: '1 1 320px', minWidth: 0 }}>
                            <h3
                              className="display"
                              style={{
                                fontSize: 18,
                                fontWeight: 600,
                                margin: 0,
                                letterSpacing: '-0.02em',
                              }}
                            >
                              {pkg.name}
                            </h3>
                            {pkg.description && (
                              <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                                {pkg.description}
                              </p>
                            )}
                            <span
                              className="mono"
                              style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                              }}
                            >
                              {pkg.tests.length} tests included
                            </span>
                          </div>
                          <div className="col ai-end gap-1">
                            <span
                              className="display num"
                              style={{ fontSize: 24, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '-0.025em' }}
                            >
                              {formatPrice(Number(pkg.price))}
                            </span>
                            {pkg.mrpPrice && Number(pkg.mrpPrice) > Number(pkg.price) && (
                              <span
                                className="muted num"
                                style={{ fontSize: 13, textDecoration: 'line-through' }}
                              >
                                {formatPrice(Number(pkg.mrpPrice))}
                              </span>
                            )}
                          </div>
                        </div>

                        {pkg.tests.length > 0 && (
                          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            {pkg.tests.slice(0, 5).map((pt) => (
                              <span key={pt.id} className="pill" style={{ textTransform: 'none' }}>
                                {pt.test.shortName || pt.test.name}
                              </span>
                            ))}
                            {pkg.tests.length > 5 && (
                              <span className="muted mono" style={{ fontSize: 11, alignSelf: 'center' }}>
                                +{pkg.tests.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="hairline" />
                        <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 12 }}>
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
                            {pkg.homeCollection && <span>home collection</span>}
                            {pkg.reportTimeHours && (
                              <span>
                                report ·{' '}
                                {pkg.reportTimeHours < 24
                                  ? `${pkg.reportTimeHours}h`
                                  : `${Math.round(pkg.reportTimeHours / 24)}d`}
                              </span>
                            )}
                            {pkg.fastingRequired && <span>fasting</span>}
                          </div>
                          <Link
                            href={`/book/package/${pkg.slug}?provider=${provider.slug}`}
                            className="btn btn-cobalt btn-sm"
                          >
                            Book package →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Individual Tests */}
              <section className="col gap-4">
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
                    § {provider.packages.length > 0 ? '02' : '01'}
                  </span>
                  <h2
                    className="display"
                    style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                  >
                    Available tests
                  </h2>
                </div>

                {Object.entries(testsByCategory).map(([category, tests]) => (
                  <div key={category} className="col gap-3">
                    <h3
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: 'var(--cobalt)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        margin: 0,
                      }}
                    >
                      {category}
                    </h3>
                    <div
                      className="card-flat"
                      style={{ padding: 0, overflow: 'hidden' }}
                    >
                      {tests.map((tp, index) => (
                        <div
                          key={tp.id}
                          className="row between ai-center"
                          style={{
                            padding: '14px 18px',
                            borderBottom: index < tests.length - 1 ? '1px solid var(--rule)' : 'none',
                            flexWrap: 'wrap',
                            gap: 12,
                          }}
                        >
                          <div className="col gap-1" style={{ flex: '1 1 220px', minWidth: 0 }}>
                            <Link
                              href={`/tests/${tp.test.slug}`}
                              style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}
                            >
                              {tp.test.shortName || tp.test.name}
                            </Link>
                            <div
                              className="row gap-3 mono"
                              style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                flexWrap: 'wrap',
                              }}
                            >
                              {tp.test.sampleType && <span>{tp.test.sampleType}</span>}
                              {tp.reportTimeHours && (
                                <span>
                                  {tp.reportTimeHours < 24
                                    ? `${tp.reportTimeHours}h`
                                    : `${Math.round(tp.reportTimeHours / 24)}d`}
                                </span>
                              )}
                              {tp.homeCollection && <span style={{ color: 'var(--mint-3)' }}>home</span>}
                            </div>
                          </div>
                          <div className="row gap-3 ai-center">
                            <div className="col ai-end">
                              <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500 }}>
                                {formatPrice(Number(tp.price))}
                              </span>
                              {tp.mrpPrice && Number(tp.mrpPrice) > Number(tp.price) && (
                                <span className="muted num" style={{ fontSize: 11, textDecoration: 'line-through' }}>
                                  {formatPrice(Number(tp.mrpPrice))}
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/book/test/${tp.test.slug}?provider=${provider.slug}`}
                              className="btn btn-paper btn-sm"
                            >
                              Book →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            </div>

            {/* Right: Sidebar */}
            <aside className="col gap-3" style={{ position: 'sticky', top: 96 }}>
              {/* Contact */}
              <div className="card col gap-4" style={{ padding: 22 }}>
                <div className="kicker"><span className="dot" />contact</div>
                <ul className="clean col gap-3">
                  {provider.address && (
                    <li className="col gap-1">
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Address
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>
                        {provider.address}
                      </span>
                    </li>
                  )}
                  {provider.phone && (
                    <li className="col gap-1">
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Phone
                      </span>
                      <a href={`tel:${provider.phone}`} style={{ fontSize: 13, color: 'var(--cobalt)' }}>
                        {provider.phone}
                      </a>
                    </li>
                  )}
                  {provider.email && (
                    <li className="col gap-1">
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Email
                      </span>
                      <a href={`mailto:${provider.email}`} style={{ fontSize: 13, color: 'var(--cobalt)', wordBreak: 'break-all' }}>
                        {provider.email}
                      </a>
                    </li>
                  )}
                  {provider.website && (
                    <li className="col gap-1">
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Website
                      </span>
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 13, color: 'var(--cobalt)', wordBreak: 'break-all' }}
                      >
                        {provider.website.replace(/^https?:\/\//, '')}
                      </a>
                    </li>
                  )}
                </ul>

                {provider.homeCollectionAvailable && provider.homeCollectionFee && (
                  <div
                    className="card-quiet"
                    style={{ padding: 12 }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: 'var(--mint-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Home collection · {formatPrice(Number(provider.homeCollectionFee))}
                    </span>
                  </div>
                )}

                <Link
                  href={`/chat/diagnostic?provider=${provider.slug}`}
                  className="btn btn-cobalt"
                  style={{ width: '100%' }}
                >
                  Ask about tests →
                </Link>
              </div>

              {/* Reviews */}
              {provider.reviews.length > 0 && (
                <div className="card col gap-4" style={{ padding: 22 }}>
                  <div className="kicker"><span className="dot" />recent reviews</div>
                  <div className="col gap-4">
                    {provider.reviews.slice(0, 3).map((review, i, arr) => (
                      <div key={review.id} className="col gap-2">
                        <div className="row gap-2 ai-center">
                          <span className="num" style={{ fontSize: 13, fontWeight: 500 }}>{review.rating}</span>
                          <span
                            className="mono"
                            style={{
                              fontSize: 11,
                              color: 'var(--ink-3)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}
                          >
                            ★ · {review.reviewerName}
                          </span>
                        </div>
                        {review.review && (
                          <p
                            style={{
                              fontSize: 13,
                              color: 'var(--ink-2)',
                              margin: 0,
                              lineHeight: 1.55,
                            }}
                          >
                            {review.review}
                          </p>
                        )}
                        {i < Math.min(arr.length, 3) - 1 && <div className="hairline" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
