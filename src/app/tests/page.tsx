import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { getGeoContext } from '@/lib/geo-context';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { getTestTypeStyle, getCategoryStyle } from '@/lib/test-type-colors';
import {
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateFAQSchema,
} from '@/lib/structured-data';
import { AIDiagnosisCTA, FindDoctorCTA, MedicalTravelCTA } from '@/components/ui/cta-sections';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Lab Tests & Diagnostic Services | Compare Prices & Book Online | AIHealz',
  description: 'Find lab tests, blood tests, imaging scans, and health checkups near you. Compare prices from certified diagnostic centers, read reviews, and book appointments online.',
  keywords: ['lab tests', 'blood tests', 'diagnostic tests', 'health checkup', 'MRI', 'CT scan', 'X-ray', 'ultrasound', 'pathology'],
  openGraph: {
    title: 'Lab Tests & Diagnostic Services | AIHealz',
    description: 'Compare prices and book lab tests, imaging scans, and health checkups from certified diagnostic centers.',
    url: 'https://aihealz.com/tests',
    type: 'website',
  },
};

export default async function TestsPage() {
  const geo = await getGeoContext();

  // Fetch all parent categories with test counts
  const categories = await prisma.diagnosticCategory.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    include: {
      children: {
        where: { isActive: true },
        include: {
          _count: { select: { tests: true } },
        },
      },
      _count: { select: { tests: true } },
    },
    orderBy: { displayOrder: 'asc' },
  });

  // Fetch popular tests
  const popularTests = await prisma.diagnosticTest.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
    },
    orderBy: { searchVolume: 'desc' },
    take: 12,
  });

  // Currency mapping by country
  const CURRENCY_MAP: Record<string, { symbol: string; locale: string; rate: number }> = {
    'india': { symbol: '₹', locale: 'en-IN', rate: 1 },
    'in': { symbol: '₹', locale: 'en-IN', rate: 1 },
    'usa': { symbol: '$', locale: 'en-US', rate: 0.012 },
    'us': { symbol: '$', locale: 'en-US', rate: 0.012 },
    'uae': { symbol: 'AED', locale: 'en-AE', rate: 0.044 },
    'uk': { symbol: '£', locale: 'en-GB', rate: 0.0095 },
    'nigeria': { symbol: '₦', locale: 'en-NG', rate: 18.5 },
    'kenya': { symbol: 'KSh', locale: 'en-KE', rate: 1.54 },
    'saudi-arabia': { symbol: 'SAR', locale: 'ar-SA', rate: 0.045 },
    'germany': { symbol: '€', locale: 'de-DE', rate: 0.011 },
    'france': { symbol: '€', locale: 'fr-FR', rate: 0.011 },
    'spain': { symbol: '€', locale: 'es-ES', rate: 0.011 },
    'australia': { symbol: 'A$', locale: 'en-AU', rate: 0.018 },
    'canada': { symbol: 'C$', locale: 'en-CA', rate: 0.016 },
  };

  const formatPrice = (priceInr: number | null, priceUsd: number | null) => {
    if (!priceInr && !priceUsd) return null;
    const countryKey = geo.countrySlug?.toLowerCase() || 'india';
    const currency = CURRENCY_MAP[countryKey] || CURRENCY_MAP['india'];

    if (priceInr) {
      if (countryKey === 'india' || countryKey === 'in') {
        return `${currency.symbol}${priceInr.toLocaleString(currency.locale)}`;
      }
      const converted = Math.round(priceInr * currency.rate);
      return `${currency.symbol}${converted.toLocaleString(currency.locale)}`;
    }

    return priceUsd ? `$${priceUsd.toLocaleString('en-US')}` : null;
  };

  const testFaqs = [
    { question: 'How do I book a lab test online?', answer: 'Search for your required test, compare prices from multiple labs, and book online. You can opt for home sample collection or visit a nearby diagnostic center.' },
    { question: 'Is home sample collection available?', answer: 'Yes, many tests offer home sample collection at no extra cost. Look for the "Home Collection" badge on tests. A trained phlebotomist will visit your location.' },
    { question: 'How long does it take to get test results?', answer: 'Report timing varies by test type. Most blood tests are available within 24-48 hours. Imaging scans may take 24 hours. Genetic tests can take 2-3 weeks.' },
    { question: 'Are lab tests covered by insurance?', answer: 'Yes, most health insurance plans cover diagnostic tests when prescribed by a doctor. Check with your insurer for coverage details and pre-authorization requirements.' },
  ];

  const structuredData = [
    generateWebPageSchema(
      'Lab Tests & Diagnostic Services',
      'Find lab tests, blood tests, imaging scans, and health checkups. Compare prices from certified diagnostic centers and book online.',
      'https://aihealz.com/tests'
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Tests', url: '/tests' },
    ]),
    generateItemListSchema(
      'Popular Lab Tests',
      'Compare prices and book diagnostic tests online',
      popularTests.slice(0, 10).map((test, i) => ({
        name: test.name,
        url: `/tests/${test.slug}`,
        position: i + 1,
      }))
    ),
    generateFAQSchema(testFaqs),
  ];

  const totalTests = popularTests.length;

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
        className="col gap-7"
      >
        {/* ── Hero ─────────────────────────────────── */}
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
            <span style={{ color: 'var(--ink)' }}>Tests &amp; Diagnostics</span>
          </div>
          <span className="section-mark">the index / by test</span>
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
            Lab tests <span style={{ color: 'var(--cobalt)' }}>compared</span>
            <span style={{ color: 'var(--orange)' }}>.</span>
          </h1>
          <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 680 }}>
            Compare prices from certified diagnostic centers. Book blood tests, imaging scans, and health checkups — home sample collection where available.
          </p>
          <div style={{ maxWidth: 720 }}>
            <SearchAutocomplete
              variant="bureau"
              placeholder="Search for tests, scans, or health packages…"
              typeFilter="test"
            />
          </div>
        </header>

        {/* ── Stats strip ─────────────────────────── */}
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
            { v: totalTests.toLocaleString() + '+', l: 'tests indexed' },
            { v: categories.length.toLocaleString(), l: 'categories' },
            { v: 'Home', l: 'collection available' },
            { v: '24h', l: 'typical turnaround' },
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
                  fontSize: 28,
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

        {/* ── Popular Tests ──────────────────────── */}
        <section className="col gap-4">
          <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2
              className="display"
              style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
            >
              Popular tests
            </h2>
            <Link
              href="/tests/all"
              className="mono"
              style={{
                fontSize: 11,
                color: 'var(--cobalt)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
              }}
            >
              View all tests →
            </Link>
          </div>

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
            {popularTests.map((test, i) => {
              const typeStyle = getTestTypeStyle(test.testType);
              const cols = 4;
              const isLastCol = (i + 1) % cols === 0;
              const isLastRow = i >= popularTests.length - cols;
              return (
                <Link
                  key={test.id}
                  href={`/tests/${test.slug}`}
                  className="col gap-3"
                  style={{
                    padding: '20px 22px',
                    borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                    borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                    minHeight: 168,
                  }}
                >
                  <div className="row between ai-center">
                    <span className="pill" style={{ textTransform: 'none' }}>
                      {typeStyle.label}
                    </span>
                    {test.homeCollectionPossible && (
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--mint-3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        ● home
                      </span>
                    )}
                  </div>
                  <div className="col gap-1" style={{ flex: 1 }}>
                    <div
                      className="display"
                      style={{
                        fontSize: 16,
                        letterSpacing: '-0.015em',
                        fontWeight: 500,
                        lineHeight: 1.3,
                      }}
                    >
                      {test.name}
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>{test.category.name}</div>
                  </div>
                  <div className="row between ai-center hairline-t" style={{ paddingTop: 12 }}>
                    {test.avgPriceInr ? (
                      <span className="num" style={{ fontSize: 13, color: 'var(--cobalt)', fontWeight: 500 }}>
                        {formatPrice(Number(test.avgPriceInr), Number(test.avgPriceUsd))}
                      </span>
                    ) : (
                      <span className="muted mono" style={{ fontSize: 11 }}>—</span>
                    )}
                    {test.reportTimeHours && (
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {test.reportTimeHours < 24 ? `${test.reportTimeHours}h` : `${Math.round(test.reportTimeHours / 24)}d`}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Categories Grid ────────────────────── */}
        <section className="col gap-4">
          <h2
            className="display"
            style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
          >
            Browse by category
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {categories.map((category) => {
              const totalTestsInCat = category._count.tests + category.children.reduce((sum, child) => sum + child._count.tests, 0);
              const catStyle = getCategoryStyle(category.slug);

              return (
                <div
                  key={category.id}
                  className="card col gap-4"
                  style={{ padding: 24 }}
                >
                  <div className="row between ai-start">
                    <div className="spec-icon">{catStyle.icon || category.name.charAt(0)}</div>
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {totalTestsInCat} tests
                    </span>
                  </div>

                  <div className="col gap-1">
                    <h3
                      className="display"
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        margin: 0,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                        {category.description}
                      </p>
                    )}
                  </div>

                  {category.children.length > 0 && (
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                      {category.children.slice(0, 4).map((child) => (
                        <Link
                          key={child.id}
                          href={`/tests/category/${child.slug}`}
                          className="pill"
                          style={{ textTransform: 'none' }}
                        >
                          {child.name}
                        </Link>
                      ))}
                      {category.children.length > 4 && (
                        <span className="muted mono" style={{ fontSize: 11, alignSelf: 'center' }}>
                          +{category.children.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/tests/category/${category.slug}`}
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--cobalt)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 500,
                      marginTop: 'auto',
                    }}
                  >
                    Explore {category.name} →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Health Packages CTA ────────────────── */}
        <section className="card-ink" style={{ padding: 'clamp(28px, 4vw, 48px)' }}>
          <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 24 }}>
            <div className="col gap-3" style={{ flex: '1 1 480px', minWidth: 0 }}>
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
                bundled · discounted
              </span>
              <h3
                className="display"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  lineHeight: 1.1,
                  margin: 0,
                  fontWeight: 600,
                  color: 'var(--paper)',
                  letterSpacing: '-0.03em',
                }}
              >
                Comprehensive health checkup packages<span style={{ color: 'var(--orange)' }}>.</span>
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,.7)',
                  lineHeight: 1.55,
                  maxWidth: 540,
                  margin: 0,
                }}
              >
                Bundled tests at discounted prices. Choose from basic to executive packages tailored for your age and health goals.
              </p>
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              <Link href="/tests/category/health-checkup-packages" className="btn btn-cobalt btn-lg">
                View packages →
              </Link>
              <Link
                href="/chat/diagnostic"
                className="btn btn-lg"
                style={{
                  background: 'rgba(255,255,255,.08)',
                  color: 'var(--paper)',
                  borderColor: 'rgba(255,255,255,.15)',
                }}
              >
                Ask about tests
              </Link>
            </div>
          </div>
        </section>

        {/* ── AI Diagnosis CTA ────────────────────── */}
        <AIDiagnosisCTA
          variant="inline"
          title="Not sure which test you need?"
          subtitle="Describe your symptoms and our AI will recommend the right diagnostic tests."
        />

        {/* ── Find Doctor CTA ─────────────────────── */}
        <FindDoctorCTA variant="banner" />

        {/* ── Medical Travel CTA ──────────────────── */}
        <MedicalTravelCTA variant="mini" />
      </div>
    </main>
  );
}
