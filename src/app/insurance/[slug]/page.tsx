import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const insurer = await prisma.insuranceProvider.findUnique({
    where: { slug },
    select: { name: true, description: true, metaTitle: true, metaDescription: true },
  });

  if (!insurer) return { title: 'Insurance Provider Not Found' };

  const description = insurer.metaDescription || `Compare ${insurer.name} health insurance plans, network hospitals, TPAs, and claim settlement ratio.`;
  const title = insurer.metaTitle || `${insurer.name} - Health Insurance Plans, Network Hospitals & Claim Settlement | AIHealz`;

  return {
    title,
    description,
    alternates: { canonical: `/insurance/${slug}` },
    openGraph: {
      type: 'website',
      siteName: 'aihealz',
      url: `https://aihealz.com/insurance/${slug}`,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const PLAN_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  family_floater: 'Family Floater',
  senior_citizen: 'Senior Citizen',
  group: 'Group',
  critical_illness: 'Critical Illness',
  top_up: 'Top-Up',
  super_top_up: 'Super Top-Up',
  personal_accident: 'Personal Accident',
};

export default async function InsuranceDetailPage({ params }: Props) {
  const { slug } = await params;

  const insurer = await prisma.insuranceProvider.findUnique({
    where: { slug },
    include: {
      plans: {
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { premiumStartsAt: 'asc' }],
      },
      tpaAssociations: {
        include: {
          tpa: { select: { name: true, slug: true, logo: true, customerCarePhone: true } },
        },
      },
      hospitalTies: {
        include: {
          hospital: { select: { name: true, slug: true, city: true, logo: true } },
        },
        take: 20,
      },
      _count: {
        select: { plans: true, hospitalTies: true, claims: true },
      },
    },
  });

  if (!insurer) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
  const insurerUrl = `${siteUrl}/insurance/${insurer.slug}`;
  const insuranceAgencySchema = {
    '@context': 'https://schema.org',
    '@type': 'InsuranceAgency',
    name: insurer.name,
    url: insurerUrl,
    ...(insurer.logo ? { logo: insurer.logo } : {}),
    ...(insurer.website ? { sameAs: [insurer.website] } : {}),
    ...(insurer.description
      ? { description: insurer.description.replace(/<[^>]*>/g, '').slice(0, 500) }
      : {}),
    ...(insurer.headquartersCity
      ? { address: { '@type': 'PostalAddress', addressLocality: insurer.headquartersCity } }
      : {}),
    ...(insurer.customerCarePhone || insurer.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            ...(insurer.customerCarePhone ? { telephone: insurer.customerCarePhone } : {}),
            ...(insurer.email ? { email: insurer.email } : {}),
          },
        }
      : {}),
    ...(insurer.establishedYear ? { foundingDate: String(insurer.establishedYear) } : {}),
    ...(insurer._count.plans > 0
      ? {
          makesOffer: insurer.plans.slice(0, 10).map((plan) => ({
            '@type': 'Offer',
            name: plan.name,
            url: `${siteUrl}/insurance/${insurer.slug}/plans/${plan.slug}`,
            ...(plan.premiumStartsAt
              ? {
                  price: Number(plan.premiumStartsAt),
                  priceCurrency: 'INR',
                }
              : {}),
            category: plan.planType,
          })),
        }
      : {}),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Insurance', item: `${siteUrl}/insurance` },
      { '@type': 'ListItem', position: 3, name: insurer.name, item: insurerUrl },
    ],
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(0)} L`;
    return `${amount.toLocaleString('en-IN')}`;
  };

  const formatRatio = (ratio: number | null | undefined) => {
    if (!ratio) return '-';
    return `${Number(ratio).toFixed(1)}%`;
  };

  const insurerInitial = insurer.name.charAt(0).toUpperCase();

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(insuranceAgencySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }} className="col gap-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="row gap-2 mono"
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/insurance" style={{ color: 'var(--ink-3)' }}>Insurance</Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: 'var(--ink)' }}>{insurer.name}</span>
        </nav>

        {/* Hero */}
        <section className="card" style={{ padding: 28 }}>
          <div className="row gap-6 ai-start" style={{ flexWrap: 'wrap' }}>
            {/* Logo */}
            <div style={{ flexShrink: 0, width: 168 }}>
              <div
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 'var(--r-3)',
                  overflow: 'hidden',
                  border: '1px solid var(--rule)',
                  background: 'var(--bg-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: insurer.logo ? 12 : 0,
                }}
              >
                {insurer.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={insurer.logo} alt={insurer.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span className="display" style={{ fontSize: 48, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '-0.04em' }}>
                    {insurerInitial}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="col gap-3" style={{ flex: 1, minWidth: 280 }}>
              <div className="col gap-2">
                <span className="section-mark">insurance provider</span>
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
                    {insurer.name}
                    <span style={{ color: 'var(--orange)' }}>.</span>
                  </h1>
                  {Number(insurer.claimSettlementRatio) >= 95 && (
                    <span className="pill pill-orange">Top Rated</span>
                  )}
                </div>
              </div>

              {insurer.description && (
                <p
                  className="lede truncate-2"
                  style={{ fontSize: 16, margin: 0, maxWidth: 640 }}
                  dangerouslySetInnerHTML={{ __html: insurer.description.slice(0, 200) }}
                />
              )}

              <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                <span className="pill">
                  {insurer.providerType === 'private' ? 'Private Insurer' :
                   insurer.providerType === 'public' ? 'Public Sector' :
                   insurer.providerType === 'government' ? 'Government Scheme' : insurer.providerType}
                </span>
                {insurer.licenseNumber && (
                  <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {insurer.regulatoryBody || 'License'}: {insurer.licenseNumber}
                  </span>
                )}
                {insurer.establishedYear && (
                  <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Est. {insurer.establishedYear}
                  </span>
                )}
              </div>

              {/* Key metrics */}
              <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                {insurer.claimSettlementRatio && (
                  <div className="card-flat row gap-3 ai-center" style={{ padding: '10px 16px' }}>
                    <span className="bignum" style={{ fontSize: 28, color: 'var(--mint-3)' }}>
                      {Number(insurer.claimSettlementRatio).toFixed(0)}%
                    </span>
                    <div className="col">
                      <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>Claim Settlement</span>
                      <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Industry avg: ~90%
                      </span>
                    </div>
                  </div>
                )}
                <div className="card-flat row gap-2 ai-center" style={{ padding: '10px 16px' }}>
                  <span className="bignum" style={{ fontSize: 28, color: 'var(--cobalt)' }}>{insurer._count.hospitalTies}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>Network hospitals</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ flexShrink: 0, width: 280 }}>
              <div className="card-quiet col gap-2" style={{ padding: 20 }}>
                <span className="kicker"><span className="dot" />get a quote</span>
                <Link
                  href={`/insurance/${insurer.slug}/quote`}
                  className="btn btn-cobalt"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Compare plans →
                </Link>
                {insurer.website && (
                  <a
                    href={insurer.website}
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
                {insurer.customerCarePhone && (
                  <p style={{ fontSize: 13, textAlign: 'center', margin: 0, color: 'var(--ink-2)' }}>
                    Call:{' '}
                    <a href={`tel:${insurer.customerCarePhone}`} style={{ color: 'var(--cobalt)', fontWeight: 500 }}>
                      {insurer.customerCarePhone}
                    </a>
                  </p>
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
            {insurer.description && (
              <section className="col gap-3">
                <div className="row gap-3 ai-baseline">
                  <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 01</span>
                  <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                    About {insurer.name}
                  </h2>
                </div>
                <div
                  style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-2)', maxWidth: 720 }}
                  dangerouslySetInnerHTML={{ __html: insurer.description }}
                />
              </section>
            )}

            {/* Plans */}
            <section className="col gap-3">
              <div className="row gap-3 ai-baseline">
                <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 02</span>
                <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                  Health insurance plans
                  <span className="muted" style={{ fontSize: 16, fontWeight: 400, marginLeft: 8 }}>
                    ({insurer._count.plans})
                  </span>
                </h2>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {insurer.plans.map((plan, i, arr) => (
                  <div
                    key={plan.id}
                    className="col gap-3"
                    style={{
                      padding: 20,
                      borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                    }}
                  >
                    <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 16 }}>
                      <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
                        <div className="row ai-baseline gap-2" style={{ flexWrap: 'wrap' }}>
                          <span className="display" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                            {plan.name}
                          </span>
                          <span className="pill pill-cobalt">
                            {PLAN_TYPE_LABELS[plan.planType] || plan.planType}
                          </span>
                          {plan.isFeatured && <span className="pill pill-orange">Popular</span>}
                        </div>
                        {plan.description && (
                          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>{plan.description}</p>
                        )}
                        <div className="row gap-4 mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', flexWrap: 'wrap' }}>
                          <span>
                            Sum Insured{' '}
                            <span className="num" style={{ color: 'var(--ink)', fontSize: 13, marginLeft: 4 }}>
                              {formatCurrency(Number(plan.sumInsuredMin))} - {formatCurrency(Number(plan.sumInsuredMax))}
                            </span>
                          </span>
                          {plan.entryAgeMin !== null && plan.entryAgeMax !== null && (
                            <span>
                              Age{' '}
                              <span className="num" style={{ color: 'var(--ink)', fontSize: 13, marginLeft: 4 }}>
                                {plan.entryAgeMin}-{plan.entryAgeMax} yrs
                              </span>
                            </span>
                          )}
                        </div>
                        {plan.coverageHighlights && plan.coverageHighlights.length > 0 && (
                          <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                            {plan.coverageHighlights.slice(0, 4).map((feature, idx) => (
                              <span key={idx} className="pill pill-mint">{feature}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col gap-2 ai-end" style={{ flexShrink: 0 }}>
                        {plan.premiumStartsAt && (
                          <div className="col ai-end">
                            <span className="bignum" style={{ fontSize: 24, color: 'var(--cobalt)' }}>
                              {formatCurrency(Number(plan.premiumStartsAt))}
                            </span>
                            <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              per year starting
                            </span>
                          </div>
                        )}
                        <Link
                          href={`/insurance/${insurer.slug}/plans/${plan.slug}`}
                          className="btn btn-cobalt btn-sm"
                        >
                          View details →
                        </Link>
                      </div>
                    </div>
                    {(plan.preExistingWaitYears || plan.specificDiseaseWait) && (
                      <div className="col gap-2" style={{ paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Waiting periods
                        </span>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                          {plan.preExistingWaitYears && (
                            <span className="pill">Pre-existing: {plan.preExistingWaitYears} years</span>
                          )}
                          {plan.specificDiseaseWait && (
                            <span className="pill">Specific diseases: {plan.specificDiseaseWait} days</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Network hospitals */}
            {insurer.hospitalTies.length > 0 && (
              <section className="col gap-3">
                <div className="row gap-3 ai-baseline">
                  <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 03</span>
                  <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                    Cashless network hospitals
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 0 }}>
                  {insurer.hospitalTies.map((tie, i) => (
                    <Link
                      key={tie.id}
                      href={`/hospitals/${tie.hospital.slug}`}
                      className="row ai-center gap-3"
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--rule)',
                        background: 'var(--paper)',
                        borderLeft: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
                        borderRight: '1px solid var(--rule)',
                        borderTop: i < 2 ? '1px solid var(--rule)' : 'none',
                      }}
                    >
                      {tie.hospital.logo ? (
                        <Image
                          src={tie.hospital.logo}
                          alt={tie.hospital.name}
                          width={32}
                          height={32}
                          unoptimized
                          style={{ width: 32, height: 32, borderRadius: 'var(--r-2)', objectFit: 'contain', border: '1px solid var(--rule)', background: 'var(--paper)' }}
                        />
                      ) : (
                        <span className="spec-icon" style={{ width: 32, height: 32, fontSize: 14 }} aria-hidden="true">
                          {tie.hospital.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="col" style={{ flex: 1, minWidth: 0 }}>
                        <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tie.hospital.name}
                        </span>
                        <span className="muted-2" style={{ fontSize: 11 }}>{tie.hospital.city}</span>
                      </div>
                      {tie.isCashless && <span className="pill pill-mint">Cashless</span>}
                    </Link>
                  ))}
                </div>
                {insurer._count.hospitalTies > 20 && (
                  <Link
                    href={`/insurance/${insurer.slug}/hospitals`}
                    className="mono"
                    style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-start' }}
                  >
                    View all {insurer._count.hospitalTies} network hospitals →
                  </Link>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="col gap-4" style={{ flex: '1 1 300px', minWidth: 280 }}>
            {/* TPAs */}
            {insurer.tpaAssociations.length > 0 && (
              <div className="card col gap-3" style={{ padding: 20 }}>
                <span className="kicker"><span className="dot" />tpas (claim processing)</span>
                <div className="col">
                  {insurer.tpaAssociations.map((link, i, arr) => (
                    <Link
                      key={link.id}
                      href={`/insurance/tpa/${link.tpa.slug}`}
                      className="row ai-center gap-3"
                      style={{
                        padding: '10px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                      }}
                    >
                      {link.tpa.logo ? (
                        <Image
                          src={link.tpa.logo}
                          alt={link.tpa.name}
                          width={32}
                          height={32}
                          unoptimized
                          style={{ width: 32, height: 32, borderRadius: 'var(--r-2)', objectFit: 'contain', border: '1px solid var(--rule)', background: 'var(--paper)' }}
                        />
                      ) : (
                        <span className="spec-icon" style={{ width: 32, height: 32, fontSize: 14 }} aria-hidden="true">
                          {link.tpa.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="col" style={{ flex: 1, minWidth: 0 }}>
                        <span className="display" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {link.tpa.name}
                        </span>
                        {link.tpa.customerCarePhone && (
                          <span className="muted-2" style={{ fontSize: 11 }}>{link.tpa.customerCarePhone}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Key info */}
            <div className="card col gap-3" style={{ padding: 20 }}>
              <span className="kicker"><span className="dot" />key information</span>
              <dl className="col gap-2" style={{ fontSize: 13, margin: 0 }}>
                {insurer.claimSettlementRatio && (
                  <div className="row between gap-2">
                    <dt className="muted">Claim Settlement</dt>
                    <dd className="num" style={{ fontWeight: 500, color: 'var(--mint-3)', margin: 0 }}>
                      {formatRatio(Number(insurer.claimSettlementRatio))}
                    </dd>
                  </div>
                )}
                <div className="row between gap-2">
                  <dt className="muted">Total plans</dt>
                  <dd className="num" style={{ fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{insurer._count.plans}</dd>
                </div>
                <div className="row between gap-2">
                  <dt className="muted">Network hospitals</dt>
                  <dd className="num" style={{ fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{insurer._count.hospitalTies}</dd>
                </div>
              </dl>
            </div>

            {/* Contact */}
            <div className="card col gap-3" style={{ padding: 20 }}>
              <span className="kicker"><span className="dot" />contact</span>
              <div className="col gap-2" style={{ fontSize: 13 }}>
                {insurer.customerCarePhone && (
                  <div className="col gap-1">
                    <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Toll free</span>
                    <a href={`tel:${insurer.customerCarePhone}`} style={{ color: 'var(--cobalt)', fontWeight: 500 }}>
                      {insurer.customerCarePhone}
                    </a>
                  </div>
                )}
                {insurer.email && (
                  <div className="col gap-1">
                    <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</span>
                    <a href={`mailto:${insurer.email}`} style={{ color: 'var(--cobalt)' }}>{insurer.email}</a>
                  </div>
                )}
                {insurer.headquartersCity && (
                  <div className="col gap-1">
                    <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Headquarters</span>
                    <span style={{ color: 'var(--ink-2)' }}>{insurer.headquartersCity}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="card col gap-2" style={{ padding: 20, borderColor: 'rgba(230, 185, 40, .40)' }}>
              <span className="kicker" style={{ color: '#8C6A00' }}>
                <span className="dot" style={{ background: 'var(--lemon-2)' }} />important
              </span>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
                Always read the policy document carefully for exclusions, waiting periods, and claim procedures before purchasing.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
