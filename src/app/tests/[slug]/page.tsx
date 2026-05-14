import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGeoContext } from '@/lib/geo-context';
import { getTestTypeStyle } from '@/lib/test-type-colors';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const test = await prisma.diagnosticTest.findUnique({
    where: { slug },
    select: { name: true, shortName: true, description: true, metaTitle: true, metaDescription: true, keywords: true },
  });

  if (!test) {
    return { title: 'Test Not Found | aihealz' };
  }

  return {
    title: {
      absolute: (test.metaTitle || `${test.name} - Cost, Preparation, Normal Range | aihealz`)
        .replace(/\s*\|\s*aihealz\s*$/i, '') + ' | aihealz',
    },
    description: test.metaDescription || test.description || `Get ${test.name} done at certified labs near you. Compare prices, read preparation instructions, and book online with home collection available.`,
    keywords: test.keywords || [test.name, test.shortName || '', 'lab test', 'diagnostic', 'price', 'near me'].filter(Boolean),
    openGraph: {
      title: `${test.name} | Lab Test Details`,
      description: test.description || `Complete guide to ${test.name} including preparation, normal ranges, and pricing.`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  try {
    const tests = await prisma.diagnosticTest.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 100,
    });
    return tests.map((test) => ({ slug: test.slug }));
  } catch {
    return [];
  }
}

export default async function TestDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const geo = await getGeoContext();

  const test = await prisma.diagnosticTest.findUnique({
    where: { slug },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      prices: {
        where: {
          isActive: true,
          provider: { isActive: true },
        },
        include: {
          provider: {
            select: {
              id: true,
              slug: true,
              name: true,
              providerType: true,
              rating: true,
              reviewCount: true,
              homeCollectionAvailable: true,
              partnerDiscount: true,
              isPartner: true,
              logo: true,
            },
          },
        },
        orderBy: { price: 'asc' },
        take: 10,
      },
    },
  });

  if (!test || !test.isActive) {
    notFound();
  }

  // Related tests
  const relatedTests = await prisma.diagnosticTest.findMany({
    where: {
      categoryId: test.categoryId,
      isActive: true,
      id: { not: test.id },
    },
    select: { id: true, slug: true, name: true, shortName: true, avgPriceInr: true },
    take: 6,
  });

  const formatPrice = (price: number) => {
    if (geo.countrySlug === 'in' || geo.countrySlug === 'india') {
      return `₹${price.toLocaleString('en-IN')}`;
    }
    return `$${Math.round(price / 83).toLocaleString('en-US')}`;
  };

  const normalRanges = test.normalRanges as Record<string, unknown> | null;
  const typeStyle = getTestTypeStyle(test.testType);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalTest',
    name: test.name,
    alternateName: test.shortName,
    description: test.description,
    usedToDiagnose: test.relatedConditions,
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: test.specialistType,
    },
  };

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
          {/* ── Breadcrumb ─────────────────────────── */}
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
            <Link href="/tests">Tests</Link>
            <span>/</span>
            {test.category.parent && (
              <>
                <Link href={`/tests/category/${test.category.parent.slug}`}>{test.category.parent.name}</Link>
                <span>/</span>
              </>
            )}
            <Link href={`/tests/category/${test.category.slug}`}>{test.category.name}</Link>
            <span>/</span>
            <span style={{ color: 'var(--ink)' }}>{test.shortName || test.name}</span>
          </nav>

          {/* ── Main grid ──────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
              gap: 32,
              alignItems: 'flex-start',
            }}
          >
            {/* Left: Main Content */}
            <div className="col gap-6" style={{ minWidth: 0 }}>
              {/* Test header */}
              <header className="col gap-4">
                <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                  <span className="pill pill-cobalt">{typeStyle.label}</span>
                  {test.bodySystem && <span className="pill">{test.bodySystem}</span>}
                  {test.homeCollectionPossible && <span className="pill pill-mint">home collection</span>}
                </div>
                <h1
                  className="display"
                  style={{
                    fontSize: 'clamp(32px, 5vw, 56px)',
                    margin: 0,
                    letterSpacing: '-0.04em',
                    fontWeight: 600,
                    lineHeight: 1.05,
                  }}
                >
                  {test.name}
                  <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                {test.shortName && (
                  <p
                    className="mono"
                    style={{
                      fontSize: 13,
                      color: 'var(--cobalt)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      margin: 0,
                    }}
                  >
                    aka {test.shortName}
                    {test.aliases && test.aliases.length > 0 && ` · ${test.aliases.join(' · ')}`}
                  </p>
                )}
                {test.description && (
                  <p className="lede" style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', maxWidth: 720, margin: 0 }}>
                    {test.description}
                  </p>
                )}
              </header>

              {/* Quick info strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 0,
                  border: '1px solid var(--rule)',
                  borderRadius: 'var(--r-3)',
                  background: 'var(--paper)',
                  overflow: 'hidden',
                }}
              >
                {[
                  { l: 'Sample type', v: test.sampleType || '—' },
                  { l: 'Report time', v: test.reportTimeHours ? (test.reportTimeHours < 24 ? `${test.reportTimeHours}h` : `${Math.round(test.reportTimeHours / 24)}d`) : '—' },
                  { l: 'Fasting', v: test.fastingRequired ? `Yes · ${test.fastingHours || 8}h` : 'No' },
                  ...(test.avgPriceInr ? [{ l: 'Starting at', v: formatPrice(Number(test.avgPriceInr)), highlight: true }] : []),
                ].map((s, i, arr) => (
                  <div
                    key={s.l}
                    className="col gap-1"
                    style={{
                      padding: '18px 22px',
                      borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                      background: (s as { highlight?: boolean }).highlight ? 'var(--cobalt-50)' : 'var(--paper)',
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: (s as { highlight?: boolean }).highlight ? 'var(--cobalt)' : 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {s.l}
                    </span>
                    <span
                      className="display num"
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                        color: (s as { highlight?: boolean }).highlight ? 'var(--cobalt)' : 'var(--ink)',
                      }}
                    >
                      {s.v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Preparation */}
              {test.preparationInstructions && (
                <section className="card col gap-3" style={{ padding: 28 }}>
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>
                      § 01
                    </span>
                    <h2 className="display" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                      Preparation
                    </h2>
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, whiteSpace: 'pre-line', margin: 0 }}>
                    {test.preparationInstructions}
                  </p>
                </section>
              )}

              {/* Normal ranges */}
              {normalRanges && Object.keys(normalRanges).length > 0 && (
                <section className="card col gap-4" style={{ padding: 28 }}>
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>
                      § 02
                    </span>
                    <h2 className="display" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                      Normal reference ranges
                    </h2>
                  </div>
                  <div className="card-flat" style={{ padding: 0, overflow: 'hidden' }}>
                    {Object.entries(normalRanges).map(([key, value], i, arr) => (
                      <div
                        key={key}
                        className="row between ai-center"
                        style={{
                          padding: '14px 18px',
                          borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{key}</span>
                        <span className="num" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="muted" style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                    Normal ranges may vary between labs. Always consult your doctor for interpretation.
                  </p>
                </section>
              )}

              {/* Related conditions */}
              {test.relatedConditions && test.relatedConditions.length > 0 && (
                <section className="card col gap-3" style={{ padding: 28 }}>
                  <div className="row gap-3 ai-baseline">
                    <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>
                      § 03
                    </span>
                    <h2 className="display" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}>
                      Commonly used for
                    </h2>
                  </div>
                  <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    {test.relatedConditions.map((condition, index) => (
                      <Link
                        key={index}
                        href={`/conditions?q=${encodeURIComponent(condition)}`}
                        className="pill"
                        style={{ textTransform: 'none' }}
                      >
                        {condition}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right: Booking sidebar */}
            <aside className="col gap-3 v4-sticky-md" style={{ position: 'sticky', top: 96 }}>
              <div className="card col gap-4" style={{ padding: 22 }}>
                <div className="kicker"><span className="dot" />book this test</div>
                {test.prices.length > 0 ? (
                  <div className="col gap-2">
                    {test.prices.slice(0, 5).map((priceInfo) => (
                      <div
                        key={priceInfo.id}
                        className="card-flat col gap-2"
                        style={{ padding: 14 }}
                      >
                        <div className="row between ai-center">
                          <div className="row gap-2 ai-center">
                            {priceInfo.provider.logo ? (
                              <img
                                src={priceInfo.provider.logo}
                                alt={priceInfo.provider.name}
                                style={{ width: 32, height: 32, borderRadius: 'var(--r-1)', objectFit: 'cover', border: '1px solid var(--rule)' }}
                              />
                            ) : (
                              <div className="spec-icon" style={{ width: 32, height: 32, fontSize: 13 }}>
                                {priceInfo.provider.name.charAt(0)}
                              </div>
                            )}
                            <div className="col">
                              <span style={{ fontSize: 13, fontWeight: 500 }}>{priceInfo.provider.name}</span>
                              {priceInfo.provider.rating && (
                                <span
                                  className="mono"
                                  style={{ fontSize: 11, color: 'var(--ink-3)' }}
                                >
                                  {Number(priceInfo.provider.rating).toFixed(1)} ★ · {priceInfo.provider.reviewCount}
                                </span>
                              )}
                            </div>
                          </div>
                          {priceInfo.provider.isPartner && priceInfo.provider.partnerDiscount && (
                            <span className="pill pill-orange">{Number(priceInfo.provider.partnerDiscount)}% off</span>
                          )}
                        </div>
                        <div className="row between ai-center hairline-t" style={{ paddingTop: 8 }}>
                          <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500 }}>
                            {formatPrice(Number(priceInfo.price))}
                            {priceInfo.provider.homeCollectionAvailable && (
                              <span className="muted mono" style={{ fontSize: 11, marginLeft: 6 }}>+ home</span>
                            )}
                          </span>
                          <Link
                            href={`/book/test/${test.slug}?provider=${priceInfo.provider.slug}`}
                            className="mono"
                            style={{
                              fontSize: 11,
                              color: 'var(--cobalt)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              fontWeight: 500,
                            }}
                          >
                            Book →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="col gap-2" style={{ textAlign: 'center', padding: '12px 0' }}>
                    <p className="muted" style={{ fontSize: 13, margin: 0 }}>No providers listed yet.</p>
                    <p className="muted-2" style={{ fontSize: 12, margin: 0 }}>We&rsquo;re adding diagnostic centers in your area.</p>
                  </div>
                )}

                <Link
                  href={`/chat/diagnostic?test=${test.slug}`}
                  className="btn btn-cobalt"
                  style={{ width: '100%' }}
                >
                  Ask about this test →
                </Link>
              </div>

              {relatedTests.length > 0 && (
                <div className="card col gap-3" style={{ padding: 22 }}>
                  <div className="kicker"><span className="dot" />related tests</div>
                  <div className="col gap-2">
                    {relatedTests.map((related) => (
                      <Link
                        key={related.id}
                        href={`/tests/${related.slug}`}
                        className="row between ai-center"
                        style={{ padding: '6px 0' }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{related.shortName || related.name}</span>
                        {related.avgPriceInr && (
                          <span className="num mono" style={{ fontSize: 11, color: 'var(--cobalt)' }}>
                            {formatPrice(Number(related.avgPriceInr))}
                          </span>
                        )}
                      </Link>
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
