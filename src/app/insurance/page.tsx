import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateFAQSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Health Insurance Providers - Compare Plans & TPAs | AIHealz',
  description: 'Compare health insurance providers, plans, TPAs, and claim settlement ratios. Find the best insurance for your needs with cashless hospital networks.',
  keywords: 'health insurance, insurance providers, TPA, claim settlement, cashless hospitals, medical insurance',
  alternates: { canonical: '/insurance' },
  openGraph: {
    type: 'website',
    siteName: 'aihealz',
    title: 'Compare Health Insurance Plans | AIHealz',
    description: 'Compare insurance providers by claim settlement ratio, network hospitals, and plan options.',
    url: 'https://aihealz.com/insurance',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Health Insurance Plans | AIHealz',
    description: 'Compare insurance providers by claim settlement ratio, network hospitals, and plan options.',
  },
};

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  private: 'Private Insurer',
  public: 'Public Sector',
  government: 'Government Scheme',
  cooperative: 'Cooperative',
};

const PLAN_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  family_floater: 'Family Floater',
  senior_citizen: 'Senior Citizen',
  group: 'Group/Corporate',
  critical_illness: 'Critical Illness',
  top_up: 'Top-Up',
  super_top_up: 'Super Top-Up',
  personal_accident: 'Personal Accident',
};

const PLAN_TYPE_DESCRIPTIONS: Record<string, string> = {
  individual: 'Coverage for a single person',
  family_floater: 'Single sum insured for entire family',
  senior_citizen: 'Specialized plans for the 60+ age group',
  group: 'Corporate and group coverage',
  critical_illness: 'Lump sum on diagnosis of listed illnesses',
  top_up: 'Extra coverage above a base policy',
  super_top_up: 'Aggregate-deductible based coverage',
  personal_accident: 'Coverage for accidental injuries',
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

function providerInitials(name: string): string {
  const words = name.replace(/[^A-Za-z\s]/g, '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'IN';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default async function InsurancePage() {
  // Read geo cookie for downstream usage / parity with prior route logic
  await getGeoFromCookie();

  const [insurers, tpas, stats] = await Promise.all([
    prisma.insuranceProvider.findMany({
      where: { isActive: true },
      include: {
        plans: {
          where: { isActive: true },
          take: 3,
          select: { name: true, planType: true, sumInsuredMin: true, sumInsuredMax: true, premiumStartsAt: true },
        },
        _count: {
          select: { plans: true, hospitalTies: true, claims: true },
        },
      },
      orderBy: [
        { claimSettlementRatio: 'desc' },
      ],
    }),
    prisma.tpa.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { insuranceLinks: true, hospitalLinks: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.insuranceProvider.aggregate({
      _count: true,
      _avg: { claimSettlementRatio: true },
      where: { isActive: true },
    }),
  ]);

  const formatRatio = (ratio: number | null) => {
    if (!ratio) return '–';
    return `${Number(ratio).toFixed(1)}%`;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '–';
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(0)} L`;
    return `${amount.toLocaleString('en-IN')}`;
  };

  // Generate structured data
  const insuranceFaqs = [
    { question: 'What is Claim Settlement Ratio (CSR)?', answer: 'CSR indicates the percentage of claims an insurer pays out of total claims received. A higher CSR (above 95%) indicates reliable claim processing and is a key factor in choosing insurance.' },
    { question: 'What is a TPA in health insurance?', answer: 'A Third Party Administrator (TPA) is an organization that processes insurance claims on behalf of insurance companies. They handle cashless hospitalization approvals and claim settlements.' },
    { question: 'What are cashless hospitals?', answer: 'Cashless hospitals are part of an insurer\'s network where you can get treatment without paying upfront. The insurer directly settles the bill with the hospital.' },
    { question: 'How do I compare insurance plans?', answer: 'Compare plans by premium, sum insured, claim settlement ratio, network hospitals, waiting periods, co-pay requirements, and specific coverage inclusions/exclusions.' },
  ];

  const structuredData = [
    generateWebPageSchema(
      'Health Insurance Providers - Compare Plans & TPAs',
      'Compare health insurance providers, plans, TPAs, and claim settlement ratios. Find the best insurance with cashless hospital networks.',
      'https://aihealz.com/insurance'
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Insurance', url: '/insurance' },
    ]),
    generateItemListSchema(
      'Health Insurance Providers',
      'Compare insurance providers by claim settlement ratio and plans',
      insurers.slice(0, 10).map((ins, i) => ({
        name: ins.name,
        url: `/insurance/${ins.slug}`,
        position: i + 1,
      }))
    ),
    generateFAQSchema(insuranceFaqs),
  ];

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
            <span style={{ color: 'var(--ink)' }}>Insurance</span>
          </div>

          <span className="section-mark">the index / insurance & TPAs</span>

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
            insurers
            <span style={{ color: 'var(--orange)' }}>.</span>
          </h1>

          <p
            className="lede"
            style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 680 }}
          >
            Health insurance compared on what actually matters — claim settlement ratio, network hospitals, plan options. Trusted by domestic and international patients.
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
            { v: (stats._count as number).toLocaleString(), l: 'insurers indexed' },
            { v: tpas.length.toLocaleString(), l: 'TPAs tracked' },
            { v: formatRatio(stats._avg.claimSettlementRatio as number | null), l: 'avg claim settlement' },
            { v: Object.keys(PLAN_TYPE_LABELS).length.toString(), l: 'plan types' },
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

        {/* ── Provider type filters ──────────────────── */}
        <section className="col gap-3" aria-labelledby="types-heading">
          <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2
              id="types-heading"
              className="display"
              style={{ fontSize: 22, margin: 0, letterSpacing: '-0.02em', fontWeight: 600 }}
            >
              Browse by provider type
            </h2>
          </div>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <Link
              href="/insurance"
              className="pill pill-cobalt"
              style={{ textTransform: 'none', cursor: 'pointer' }}
            >
              All providers
            </Link>
            {Object.entries(PROVIDER_TYPE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/insurance?type=${key}`}
                className="pill"
                style={{ textTransform: 'none', cursor: 'pointer' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Insurance Providers ─────────────────────── */}
        <section className="col gap-4" aria-labelledby="providers-heading">
          <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2
              id="providers-heading"
              className="display"
              style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
            >
              Insurance providers
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
              {insurers.length} shown · ranked by CSR
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: 16,
            }}
          >
            {insurers.map(insurer => {
              const csr = Number(insurer.claimSettlementRatio || 0);
              const isTopRated = csr >= 95;
              const initials = providerInitials(insurer.name);
              const csrLabel =
                csr >= 95 ? 'excellent' :
                csr >= 90 ? 'very good' :
                csr >= 80 ? 'good' :
                csr > 0 ? 'average' : '—';

              return (
                <Link
                  key={insurer.id}
                  href={`/insurance/${insurer.slug}`}
                  className="card col gap-4"
                  style={{
                    padding: 20,
                    color: 'var(--ink)',
                    borderColor: isTopRated ? 'var(--cobalt)' : 'var(--rule)',
                  }}
                >
                  {/* Header */}
                  <div className="row gap-3 ai-start">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 'var(--r-2)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'var(--bg-2)',
                        border: '1px solid var(--rule)',
                      }}
                    >
                      {insurer.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={insurer.logo}
                          alt={insurer.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }}
                        />
                      ) : (
                        <div
                          className="row ai-center center"
                          style={{
                            width: '100%',
                            height: '100%',
                            fontFamily: 'var(--display)',
                            fontSize: 18,
                            fontWeight: 600,
                            color: 'var(--ink-2)',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                      <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                        <span
                          className="display"
                          style={{
                            fontSize: 17,
                            fontWeight: 600,
                            letterSpacing: '-0.015em',
                            margin: 0,
                          }}
                        >
                          {insurer.name}
                        </span>
                        {isTopRated && (
                          <span className="pill pill-cobalt">top rated</span>
                        )}
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
                        {PROVIDER_TYPE_LABELS[insurer.providerType] || insurer.providerType}
                      </div>
                    </div>
                  </div>

                  {/* CSR strip */}
                  {insurer.claimSettlementRatio && (
                    <div
                      className="row ai-center between hairline-t hairline-b"
                      style={{ padding: '12px 0' }}
                    >
                      <div className="col gap-0">
                        <div
                          className="mono"
                          style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          claim settlement
                        </div>
                        <div className="muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>
                          {csrLabel}
                        </div>
                      </div>
                      <div
                        className="num display"
                        style={{
                          fontSize: 28,
                          fontWeight: 500,
                          letterSpacing: '-0.025em',
                          color: isTopRated ? 'var(--cobalt)' : 'var(--ink)',
                        }}
                      >
                        {csr.toFixed(0)}%
                      </div>
                    </div>
                  )}

                  {/* Quick numerical stats */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 0,
                      borderTop: insurer.claimSettlementRatio ? 'none' : '1px solid var(--rule)',
                    }}
                  >
                    {[
                      { v: insurer._count.plans, l: 'plans' },
                      { v: insurer._count.hospitalTies, l: 'hospitals' },
                      { v: insurer._count.claims || 0, l: 'claims' },
                    ].map((stat, idx) => (
                      <div
                        key={stat.l}
                        className="col gap-0"
                        style={{
                          padding: '4px 8px',
                          borderRight: idx < 2 ? '1px solid var(--rule)' : 'none',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          className="num display"
                          style={{
                            fontSize: 20,
                            fontWeight: 500,
                            color: 'var(--ink)',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {stat.v.toLocaleString()}
                        </div>
                        <div
                          className="mono"
                          style={{
                            fontSize: 10,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {stat.l}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sample plans */}
                  {insurer.plans.length > 0 && (
                    <div className="col gap-2">
                      <div
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        popular plans
                      </div>
                      <div className="col gap-1">
                        {insurer.plans.map((plan, i) => (
                          <div
                            key={i}
                            className="row between ai-center"
                            style={{ fontSize: 13 }}
                          >
                            <span style={{ color: 'var(--ink-2)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {plan.name}
                            </span>
                            {plan.premiumStartsAt && (
                              <span
                                className="num"
                                style={{
                                  fontSize: 12,
                                  color: 'var(--cobalt)',
                                  flexShrink: 0,
                                  marginLeft: 8,
                                }}
                              >
                                from {formatCurrency(Number(plan.premiumStartsAt))}/yr
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── TPAs Section ───────────────────────────── */}
        <section className="col gap-4" aria-labelledby="tpas-heading">
          <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2
              id="tpas-heading"
              className="display"
              style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
            >
              Third-party administrators
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
              {tpas.length} TPAs
            </span>
          </div>

          <div
            className="card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <div
              className="hairline-b"
              style={{ padding: '14px 20px', background: 'var(--bg-2)' }}
            >
              <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
                TPAs handle claim processing and cashless hospitalization on behalf of insurance companies.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-2)' }}>
                    <th
                      scope="col"
                      className="mono"
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 500,
                        borderBottom: '1px solid var(--rule)',
                      }}
                    >
                      TPA
                    </th>
                    <th
                      scope="col"
                      className="mono"
                      style={{
                        padding: '12px 20px',
                        textAlign: 'center',
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 500,
                        borderBottom: '1px solid var(--rule)',
                      }}
                    >
                      Insurance partners
                    </th>
                    <th
                      scope="col"
                      className="mono"
                      style={{
                        padding: '12px 20px',
                        textAlign: 'center',
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 500,
                        borderBottom: '1px solid var(--rule)',
                      }}
                    >
                      Network hospitals
                    </th>
                    <th
                      scope="col"
                      className="mono"
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 500,
                        borderBottom: '1px solid var(--rule)',
                      }}
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="mono"
                      style={{
                        padding: '12px 20px',
                        textAlign: 'right',
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 500,
                        borderBottom: '1px solid var(--rule)',
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {tpas.map((tpa, idx) => (
                    <tr
                      key={tpa.id}
                      style={{
                        borderBottom: idx < tpas.length - 1 ? '1px solid var(--rule)' : 'none',
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div className="row gap-3 ai-center">
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 'var(--r-2)',
                              overflow: 'hidden',
                              flexShrink: 0,
                              background: 'var(--bg-2)',
                              border: '1px solid var(--rule)',
                            }}
                          >
                            {tpa.logo ? (
                              <Image
                                src={tpa.logo}
                                alt={tpa.name}
                                width={40}
                                height={40}
                                unoptimized
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                              />
                            ) : (
                              <div
                                className="row ai-center center"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  fontFamily: 'var(--display)',
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: 'var(--ink-2)',
                                }}
                              >
                                {providerInitials(tpa.name)}
                              </div>
                            )}
                          </div>
                          <div className="col gap-0">
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: 'var(--ink)',
                              }}
                            >
                              {tpa.name}
                            </span>
                            {tpa.licenseNumber && (
                              <span
                                className="mono"
                                style={{
                                  fontSize: 11,
                                  color: 'var(--ink-3)',
                                }}
                              >
                                License: {tpa.licenseNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{ padding: '14px 20px', textAlign: 'center' }}
                        className="num"
                      >
                        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--cobalt)' }}>
                          {tpa._count.insuranceLinks}
                        </span>
                      </td>
                      <td
                        style={{ padding: '14px 20px', textAlign: 'center' }}
                        className="num"
                      >
                        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>
                          {tpa._count.hospitalLinks}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div className="col gap-0" style={{ fontSize: 12 }}>
                          {tpa.customerCarePhone && (
                            <span style={{ color: 'var(--ink-2)' }}>{tpa.customerCarePhone}</span>
                          )}
                          {tpa.email && (
                            <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                              {tpa.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <Link
                          href={`/insurance/tpa/${tpa.slug}`}
                          className="mono"
                          style={{
                            fontSize: 11,
                            color: 'var(--cobalt)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 500,
                          }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Plan Types ─────────────────────────────── */}
        <section className="col gap-4" aria-labelledby="plan-types-heading">
          <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2
              id="plan-types-heading"
              className="display"
              style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
            >
              Health insurance plan types
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
              {Object.keys(PLAN_TYPE_LABELS).length} types
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 0,
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-3)',
              background: 'var(--paper)',
              overflow: 'hidden',
            }}
          >
            {Object.entries(PLAN_TYPE_LABELS).map(([key, label], i, arr) => {
              const cols = 4;
              const isLastCol = (i + 1) % cols === 0;
              const isLastRow = i >= arr.length - cols;
              return (
                <Link
                  key={key}
                  href={`/insurance/plans?type=${key}`}
                  className="col gap-2"
                  style={{
                    padding: '20px 22px',
                    borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                    borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                  }}
                >
                  <div
                    className="display"
                    style={{ fontSize: 17, letterSpacing: '-0.02em', fontWeight: 500 }}
                  >
                    {label}
                  </div>
                  <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
                    {PLAN_TYPE_DESCRIPTIONS[key]}
                  </div>
                  <span
                    className="mono"
                    style={{
                      marginTop: 'auto',
                      fontSize: 11,
                      color: 'var(--cobalt)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 500,
                    }}
                  >
                    Browse →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────── */}
        <section className="col gap-4" aria-labelledby="faq-heading">
          <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2
              id="faq-heading"
              className="display"
              style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
            >
              Common questions
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 16,
            }}
          >
            {insuranceFaqs.map(faq => (
              <article key={faq.question} className="card" style={{ padding: 24 }}>
                <h3
                  className="display"
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: '-0.015em',
                    marginBottom: 8,
                  }}
                >
                  {faq.question}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--ink-2)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
