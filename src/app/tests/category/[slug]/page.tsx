import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGeoContext } from '@/lib/geo-context';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.diagnosticCategory.findUnique({
    where: { slug },
    select: { name: true, description: true, metaTitle: true, metaDescription: true },
  });

  if (!category) {
    return { title: 'Category Not Found | aihealz' };
  }

  return {
    title: category.metaTitle || `${category.name} Tests - Book Online at Best Price | aihealz`,
    description: category.metaDescription || category.description || `Find and compare ${category.name.toLowerCase()} from certified diagnostic centers. Book online with home collection available.`,
    openGraph: {
      title: `${category.name} | Diagnostic Tests`,
      description: category.description || `Browse all ${category.name.toLowerCase()} tests available at aihealz.`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.diagnosticCategory.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return categories.map((cat) => ({ slug: cat.slug }));
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const geo = await getGeoContext();
  const page = parseInt(pageStr || '1', 10);
  const pageSize = 24;

  const category = await prisma.diagnosticCategory.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        include: {
          _count: { select: { tests: true } },
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const [tests, totalCount] = await Promise.all([
    prisma.diagnosticTest.findMany({
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
      },
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { prices: true } },
      },
      orderBy: [{ searchVolume: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.diagnosticTest.count({
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatPrice = (priceInr: number | null, priceUsd: number | null) => {
    if (geo.countrySlug === 'in' || geo.countrySlug === 'india') {
      return priceInr ? `₹${priceInr.toLocaleString('en-IN')}` : null;
    }
    return priceUsd ? `$${priceUsd.toLocaleString('en-US')}` : null;
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    numberOfItems: totalCount,
    itemListElement: tests.map((test, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * pageSize + index + 1,
      item: {
        '@type': 'MedicalTest',
        name: test.name,
        url: `https://aihealz.com/tests/${test.slug}`,
      },
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
            {category.parent && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={`/tests/category/${category.parent.slug}`} style={{ color: 'var(--ink-3)' }}>
                  {category.parent.name}
                </Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span style={{ color: 'var(--ink)' }}>{category.name}</span>
          </nav>

          {/* Hero */}
          <header className="col gap-4">
            <span className="section-mark">tests / {category.name.toLowerCase()}</span>
            <div className="row gap-4 ai-center" style={{ flexWrap: 'wrap' }}>
              {category.icon && (
                <span
                  className="display"
                  style={{ fontSize: 40, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {category.icon}
                </span>
              )}
              <h1
                className="display"
                style={{
                  fontSize: 'clamp(36px, 6vw, 72px)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.045em',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: 'var(--cobalt)' }}>{category.name}</span>
                <span style={{ color: 'var(--orange)' }}>.</span>
              </h1>
            </div>
            {category.description && (
              <p className="lede" style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', maxWidth: 760, margin: 0 }}>
                {category.description}
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
              {totalCount.toLocaleString()} tests available
            </span>
          </header>

          {/* Subcategories */}
          {category.children.length > 0 && (
            <section className="col gap-3" aria-labelledby="subcat-heading">
              <h2
                id="subcat-heading"
                className="display"
                style={{ fontSize: 16, margin: 0, fontWeight: 600, letterSpacing: '-0.015em' }}
              >
                Subcategories
              </h2>
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/tests/category/${child.slug}`}
                    className="btn btn-sm btn-paper"
                  >
                    {child.name}
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                      ({child._count.tests})
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tests grid */}
          {tests.length > 0 ? (
            <section className="col gap-4" aria-labelledby="tests-heading">
              <h2 id="tests-heading" className="sr-only">All tests</h2>
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
                {tests.map((test, i, arr) => {
                  const cols = 4;
                  const isLastCol = (i + 1) % cols === 0;
                  const isLastRow = i >= arr.length - cols;
                  const price = formatPrice(Number(test.avgPriceInr), Number(test.avgPriceUsd));
                  return (
                    <Link
                      key={test.id}
                      href={`/tests/${test.slug}`}
                      className="col gap-3"
                      style={{
                        padding: '20px 22px',
                        borderRight: isLastCol ? 'none' : '1px solid var(--rule-2)',
                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule-2)',
                      }}
                    >
                      <div className="row between ai-center">
                        <div className="spec-icon" style={{ background: 'var(--cobalt)' }} aria-hidden="true">
                          T
                        </div>
                        {test.homeCollectionPossible && (
                          <span className="pill pill-mint">home</span>
                        )}
                      </div>
                      <div className="col gap-1">
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
                          {test.shortName || test.name}
                        </h3>
                        {test.shortName && test.shortName !== test.name && (
                          <p className="muted" style={{ fontSize: 12, margin: 0 }}>{test.name}</p>
                        )}
                      </div>
                      <div className="row between ai-center hairline-t" style={{ paddingTop: 12, marginTop: 'auto' }}>
                        {price ? (
                          <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500 }}>
                            {price}
                          </span>
                        ) : (
                          <span className="muted" style={{ fontSize: 12 }}>Price on request</span>
                        )}
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                          {test._count.prices > 0
                            ? `${test._count.prices} provider${test._count.prices > 1 ? 's' : ''}`
                            : 'Coming soon'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="row gap-2 center ai-center" style={{ marginTop: 16, flexWrap: 'wrap' }}>
                  {page > 1 && (
                    <Link
                      href={`/tests/category/${slug}?page=${page - 1}`}
                      className="btn btn-paper btn-sm"
                    >
                      ← Previous
                    </Link>
                  )}
                  <div className="row gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;

                      const active = page === pageNum;
                      return (
                        <Link
                          key={pageNum}
                          href={`/tests/category/${slug}?page=${pageNum}`}
                          className={active ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                          style={{ minWidth: 36, justifyContent: 'center' }}
                          aria-current={active ? 'page' : undefined}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>
                  {page < totalPages && (
                    <Link
                      href={`/tests/category/${slug}?page=${page + 1}`}
                      className="btn btn-paper btn-sm"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </section>
          ) : (
            <div className="card col gap-4 ai-center" style={{ padding: 48, textAlign: 'center' }}>
              <span className="pill">no results</span>
              <h3
                className="display"
                style={{ fontSize: 20, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
              >
                No tests yet in this category
                <span style={{ color: 'var(--orange)' }}>.</span>
              </h3>
              <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 360 }}>
                We&apos;re adding tests to this category soon.
              </p>
              <Link href="/tests" className="btn btn-cobalt">
                Browse all tests →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
