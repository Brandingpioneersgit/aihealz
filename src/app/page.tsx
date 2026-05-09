import { Metadata } from 'next';
import prisma from '@/lib/db';
import Link from 'next/link';
import Script from 'next/script';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import HomepageSpecialties from '@/components/ui/homepage-specialties';
import { normalizeSpecialty, SPECIALTY_ICON_MAP } from '@/lib/normalize-specialty';
import { getGeoContext } from '@/lib/geo-context';

export const metadata: Metadata = {
  title: 'aihealz — the medical directory that reads back',
  description:
    'Drop a lab report. Get a plain-English brief, severity-ranked findings, and the four specialists most likely to help. 70,000+ conditions, 8,200+ verified doctors, cost mapped across seven countries.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'aihealz — the medical directory that reads back',
    description:
      'Verified doctors, plain-English condition explainers, lab-report analysis, and cost compared across seven countries.',
    url: 'https://aihealz.com/',
    siteName: 'aihealz',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'aihealz — the medical directory that reads back',
    description:
      'Verified doctors, plain-English condition explainers, lab-report analysis, and cost compared across seven countries.',
    images: ['/og-default.jpg'],
  },
};

const COUNTRY_NAMES: Record<string, string> = {
  india: 'India',
  usa: 'United States',
  uk: 'United Kingdom',
  nigeria: 'Nigeria',
  germany: 'Germany',
  france: 'France',
  brazil: 'Brazil',
  spain: 'Spain',
  kenya: 'Kenya',
  'south-africa': 'South Africa',
  australia: 'Australia',
  canada: 'Canada',
  mexico: 'Mexico',
  uae: 'UAE',
  'saudi-arabia': 'Saudi Arabia',
};

// Cost-mapped section — illustrative averages across the procedures we support.
// Numbers are deliberately rounded; the real cost-compare lives on individual
// /<country>/<lang>/<treatment>/cost pages.
const COST_PROCEDURES: { proc: string; costs: string[]; pinnedHref?: string }[] = [
  {
    proc: 'Knee replacement',
    costs: ['$38,000', '£14,200', '$3,400', '$8,500', '$6,200', '$7,800', '$11,000'],
    pinnedHref: '/india/en/knee-osteoarthritis/cost',
  },
  {
    proc: 'Hair transplant',
    costs: ['$15,000', '£6,400', '$1,200', '$3,200', '$2,800', '$2,400', '$4,200'],
    pinnedHref: '/india/en/hair-loss/cost',
  },
  {
    proc: 'IVF cycle',
    costs: ['$23,500', '£8,200', '$2,400', '$5,200', '$4,800', '$3,900', '$6,800'],
    pinnedHref: '/india/en/infertility/cost',
  },
  {
    proc: 'Bariatric surgery',
    costs: ['$22,000', '£11,000', '$5,500', '$9,800', '$7,200', '$8,400', '$13,200'],
    pinnedHref: '/india/en/obesity/cost',
  },
];
const COST_COUNTRIES = ['USA', 'UK', 'India', 'Thailand', 'Mexico', 'Turkey', 'UAE'] as const;
const PINNED_COL = COST_COUNTRIES.indexOf('India');

const TRENDING_SEARCHES: { label: string; href: string }[] = [
  { label: 'Hair transplant cost', href: '/india/en/hair-loss/cost' },
  { label: 'Knee replacement', href: '/india/en/knee-osteoarthritis/cost' },
  { label: 'IVF success rate', href: '/india/en/infertility' },
  { label: 'TSH 6.8 meaning', href: '/conditions/hypothyroidism' },
  { label: 'Statin alternatives', href: '/conditions/high-cholesterol' },
];

function formatCount(n: number): string {
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

export default async function Home() {
  const geo = await getGeoContext();
  const countryName = geo.countrySlug
    ? COUNTRY_NAMES[geo.countrySlug] || geo.countrySlug
    : null;
  const cityDisplay = geo.citySlug
    ? geo.citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null;

  const specCountMap: Record<string, number> = {};
  let specialties: string[] = [];
  const grouped: Record<string, { slug: string; commonName: string; specialistType: string | null; description: string | null }[]> = {};
  let totalConditions = 0;

  try {
    const rawSpecialties = await prisma.medicalCondition.groupBy({
      by: ['specialistType'],
      where: { isActive: true },
      _count: { _all: true },
    });

    rawSpecialties.forEach(r => {
      const canon = normalizeSpecialty(r.specialistType);
      specCountMap[canon] = (specCountMap[canon] || 0) + r._count._all;
      totalConditions += r._count._all;
    });

    specialties = Object.keys(specCountMap).sort();

    const rawSpecMap: Record<string, string[]> = {};
    rawSpecialties.forEach(r => {
      const canon = normalizeSpecialty(r.specialistType);
      if (!rawSpecMap[canon]) rawSpecMap[canon] = [];
      rawSpecMap[canon].push(r.specialistType);
    });

    const seenNames = new Set<string>();

    await Promise.all(
      specialties.map(async (specName) => {
        const rawTypes = rawSpecMap[specName] || [];
        const conditions = await prisma.medicalCondition.findMany({
          where: {
            isActive: true,
            specialistType: { in: rawTypes },
          },
          select: { slug: true, commonName: true, specialistType: true, description: true },
          orderBy: [{ description: 'asc' }, { commonName: 'asc' }],
          take: 30,
        });

        const deduped = conditions.filter(c => {
          const key = c.commonName.toLowerCase().trim();
          if (seenNames.has(key)) return false;
          seenNames.add(key);
          return true;
        });

        const curated = deduped.filter(c => c.description && c.description.length > 0);
        const others = deduped.filter(c => !c.description || c.description.length === 0);
        grouped[specName] = [...curated, ...others].slice(0, 12);
      })
    );
  } catch (err) {
    console.warn('[page.tsx] Database unavailable, rendering without specialties:', (err as Error).message);
  }

  // Pull a few headline counts for the hero meta strip — best-effort.
  let doctorCount = 0;
  let treatmentCount = 0;
  try {
    [doctorCount, treatmentCount] = await Promise.all([
      prisma.doctor.count({ where: { isActive: true } }).catch(() => 0),
      prisma.treatment.count({ where: { isActive: true } }).catch(() => 0),
    ]);
  } catch {
    // best-effort, leave at 0
  }

  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://aihealz.com/#webpage',
    url: 'https://aihealz.com',
    name: 'aihealz — the medical directory that reads back',
    description:
      'Plain-English condition explainers, verified doctors, lab-report analysis, and cost compared across seven countries.',
    isPartOf: { '@id': 'https://aihealz.com/#website' },
    about: {
      '@type': 'MedicalBusiness',
      name: 'aihealz Healthcare Platform',
      description: `${formatCount(totalConditions || 70000)}+ conditions, ${formatCount(treatmentCount || 8200)}+ treatments, AI report analysis, and a verified doctor index across seven countries.`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-description', '.feature-cards'],
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Medical Specialties',
      numberOfItems: specialties.length,
      itemListElement: specialties.slice(0, 10).map((spec, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'MedicalSpecialty',
          name: spec,
          url: `https://aihealz.com/conditions?specialty=${encodeURIComponent(spec)}`,
        },
      })),
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is aihealz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'aihealz is a medical directory that reads your lab reports back to you. Plain-English condition explainers, verified doctors, AI-powered report analysis, and cost compared across seven countries.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many medical conditions does aihealz cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'aihealz covers over 70,000 conditions across 20+ specialties. Every condition page is reviewed by a board-certified physician in that specialty.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I get an AI second opinion on aihealz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — drop a lab report, scan, or imaging study and you get a plain-English brief, severity-ranked findings, and matched specialists in under sixty seconds.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find a specialist on aihealz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Search by condition, symptom, or specialty. Each doctor profile shows credentials, fees, wait times, languages, and patient reviews — all credential-checked before they go live.',
        },
      },
    ],
  };

  const conditionsLabel = formatCount(totalConditions || 70000);
  const doctorsLabel = formatCount(doctorCount || 8200);
  const treatmentsLabel = formatCount(treatmentCount || 12400);

  return (
    <>
      <Script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <Script
        id="homepage-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
        {/* ── HERO ────────────────────────────────────────── */}
        <section style={{ padding: '56px 28px 32px', maxWidth: 1280, margin: '0 auto' }}>
          {/* hero meta strip */}
          <div
            className="row between ai-center"
            style={{ paddingBottom: 18, borderBottom: '1px solid var(--rule)', flexWrap: 'wrap', gap: 12 }}
          >
            <span className="kicker">
              <span className="dot" />aihealz / vol. 04 / live index
              {countryName && (
                <>
                  {' · '}
                  <Link href="/settings/location" style={{ color: 'var(--ink)', textTransform: 'none', letterSpacing: 0 }}>
                    {cityDisplay ? `${cityDisplay}, ${countryName}` : countryName}
                  </Link>
                </>
              )}
            </span>
            <div className="row gap-5 mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', flexWrap: 'wrap' }}>
              <span>{conditionsLabel} conditions</span>
              <span>{doctorsLabel} doctors</span>
              <span>{treatmentsLabel} treatments</span>
              <span style={{ color: 'var(--cobalt)' }}>● live</span>
            </div>
          </div>

          <div
            className="row gap-7 ai-start"
            style={{ paddingTop: 48, flexWrap: 'wrap' }}
          >
            <div className="col gap-6" style={{ flex: '1 1 580px', minWidth: 0 }}>
              <h1
                className="display hero-description"
                style={{
                  fontSize: 'clamp(48px, 7vw, 112px)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.045em',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                The medical
                <br />
                directory
                <br />
                <span style={{ color: 'var(--cobalt)' }}>that reads</span>
                <br />
                <span style={{ color: 'var(--cobalt)' }}>back</span>
                <span style={{ color: 'var(--orange)' }}>.</span>
              </h1>

              <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 22px)', maxWidth: 560 }}>
                Drop a lab report. Get a plain-English brief, severity-ranked findings, and the four specialists most likely to help — in under sixty seconds.
              </p>

              <div style={{ maxWidth: 580 }}>
                <SearchAutocomplete
                  variant="bureau"
                  placeholder="Search a condition, treatment, or symptom"
                />
              </div>

              <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginRight: 4,
                  }}
                >
                  trending
                </span>
                {TRENDING_SEARCHES.map(t => (
                  <Link key={t.label} href={t.href} className="pill" style={{ textTransform: 'none' }}>
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* HERO RIGHT — case dossier */}
            <div className="col gap-3" style={{ flex: '0 1 380px', minWidth: 280 }}>
              <div className="card-ink" style={{ padding: 24 }}>
                <div className="row between ai-center" style={{ marginBottom: 16 }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--cobalt-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.10em',
                    }}
                  >
                    ● case 04,217
                  </span>
                  <span
                    className="pill"
                    style={{
                      background: 'rgba(255,255,255,.08)',
                      color: 'rgba(255,255,255,.85)',
                      borderColor: 'rgba(255,255,255,.15)',
                    }}
                  >
                    routine
                  </span>
                </div>
                <div
                  className="display"
                  style={{
                    fontSize: 28,
                    lineHeight: 1.1,
                    fontWeight: 500,
                    letterSpacing: '-0.025em',
                  }}
                >
                  &ldquo;My TSH came back at <span style={{ color: 'var(--cobalt-3)' }}>6.8</span> — should I be worried?&rdquo;
                </div>
                <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, marginTop: 14, lineHeight: 1.55 }}>
                  Borderline subclinical hypothyroidism. Common, monitor-able. We found 14 endocrinologists nearby — here&rsquo;s what to ask them.
                </div>
                <div className="row gap-2" style={{ marginTop: 18, flexWrap: 'wrap' }}>
                  <span
                    className="pill"
                    style={{ background: 'var(--cobalt)', color: 'white', borderColor: 'var(--cobalt)' }}
                  >
                    Endocrinology
                  </span>
                  <span
                    className="pill"
                    style={{
                      background: 'rgba(255,255,255,.08)',
                      color: 'rgba(255,255,255,.85)',
                      borderColor: 'rgba(255,255,255,.15)',
                    }}
                  >
                    14 specialists
                  </span>
                </div>
                <div
                  className="row between ai-center"
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: '1px solid rgba(255,255,255,.12)',
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                    analyzed in 38s
                  </span>
                  <Link
                    href="/conditions/hypothyroidism"
                    className="mono"
                    style={{
                      fontSize: 12,
                      color: 'var(--cobalt-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 500,
                    }}
                  >
                    Read dossier →
                  </Link>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  className="row between hairline-b"
                  style={{ padding: '14px 18px' }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    now reading
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--mint-3)' }}>
                    ● weekly editorial
                  </span>
                </div>
                <div className="col gap-2" style={{ padding: '14px 18px' }}>
                  {[
                    { n: '01', t: 'Hypothyroidism — the 5% nobody talks about', r: '5 min', href: '/conditions/hypothyroidism' },
                    { n: '02', t: 'Statins at 40 — the new threshold', r: '7 min', href: '/conditions/high-cholesterol' },
                    { n: '03', t: 'When ferritin lies', r: '4 min', href: '/conditions/iron-deficiency' },
                  ].map(({ n, t, r, href }) => (
                    <Link key={n} href={href} className="row gap-3 ai-baseline">
                      <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', minWidth: 18 }}>
                        {n}
                      </span>
                      <span style={{ fontSize: 14, flex: 1 }}>{t}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                        {r}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE CARDS ─────────────────────────────── */}
        <section style={{ padding: '32px 28px 16px', maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {[
              {
                href: '/analyze',
                kicker: 'analyze',
                title: 'AI report analysis',
                blurb: 'Upload scans or blood work for an instant plain-English breakdown.',
                cta: 'Upload report',
              },
              {
                href: '/doctors',
                kicker: 'directory',
                title: 'Find a specialist',
                blurb: 'Credential-checked doctors filterable by wait time, fee, language, hospital.',
                cta: 'Browse doctors',
              },
              {
                href: '/treatments',
                kicker: 'compare',
                title: 'Treatment costs',
                blurb: 'Same surgery, seven countries — see real numbers before you decide.',
                cta: 'Compare costs',
              },
            ].map(c => (
              <Link
                key={c.href}
                href={c.href}
                className="card col gap-3 feature-cards"
                style={{
                  padding: 24,
                  transition: 'border-color 120ms, background 120ms',
                }}
              >
                <div className="kicker">
                  <span className="dot" />
                  {c.kicker}
                </div>
                <div
                  className="display"
                  style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.025em' }}
                >
                  {c.title}
                </div>
                <div className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>{c.blurb}</div>
                <div
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
                  {c.cta} →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SPECIALTY INDEX ───────────────────────────── */}
        {specialties.length > 0 && (
          <section style={{ padding: '64px 28px 48px', maxWidth: 1280, margin: '0 auto' }}>
            <div
              className="row between ai-end"
              style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
            >
              <div className="col gap-2">
                <span className="section-mark">II / by specialty</span>
                <h2
                  className="display"
                  style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', margin: 0, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                  The whole index, browsable.
                </h2>
              </div>
              <Link href="/conditions" className="btn btn-paper btn-sm">
                View all {specialties.length} →
              </Link>
            </div>

            <HomepageSpecialties
              specialties={specialties}
              grouped={grouped}
              counts={specCountMap}
              icons={SPECIALTY_ICON_MAP}
              country={geo.countrySlug || 'india'}
              lang={geo.lang}
            />
          </section>
        )}

        {/* ── COST COMPARE (ink) ────────────────────────── */}
        <section style={{ padding: '72px 28px', background: 'var(--ink)', color: 'var(--paper)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }} className="col gap-6">
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
              <div className="col gap-2">
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
                  III / cost, mapped
                </span>
                <h2
                  className="display"
                  style={{
                    fontSize: 'clamp(36px, 5vw, 64px)',
                    margin: 0,
                    letterSpacing: '-0.04em',
                    fontWeight: 600,
                    color: 'var(--paper)',
                  }}
                >
                  Same surgery.
                  <br />
                  <span style={{ color: 'var(--cobalt-3)' }}>Seven countries.</span>
                </h2>
              </div>
              <Link
                href="/medical-travel"
                className="btn"
                style={{
                  background: 'rgba(255,255,255,.08)',
                  color: 'var(--paper)',
                  borderColor: 'rgba(255,255,255,.15)',
                }}
              >
                Compare any procedure →
              </Link>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.10)',
                borderRadius: 'var(--r-3)',
                overflow: 'hidden',
              }}
            >
              <div
                className="row"
                style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,.10)' }}
              >
                <span
                  className="mono"
                  style={{
                    flex: 2,
                    fontSize: 11,
                    color: 'rgba(255,255,255,.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Procedure
                </span>
                {COST_COUNTRIES.map(c => (
                  <span
                    key={c}
                    className="mono"
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: c === 'India' ? 'var(--cobalt-3)' : 'rgba(255,255,255,.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {c}{c === 'India' ? ' ★' : ''}
                  </span>
                ))}
              </div>
              {COST_PROCEDURES.map((row, i, arr) => (
                <div
                  key={row.proc}
                  className="row ai-center"
                  style={{
                    padding: '18px 24px',
                    borderBottom:
                      i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
                  }}
                >
                  <span
                    className="display"
                    style={{ flex: 2, fontSize: 18, color: 'var(--paper)', fontWeight: 500 }}
                  >
                    {row.pinnedHref ? (
                      <Link href={row.pinnedHref} style={{ color: 'inherit' }}>
                        {row.proc}
                      </Link>
                    ) : (
                      row.proc
                    )}
                  </span>
                  {row.costs.map((c, j) => (
                    <span
                      key={j}
                      className="num"
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: j === PINNED_COL ? 'var(--cobalt-3)' : 'rgba(255,255,255,.7)',
                        fontWeight: j === PINNED_COL ? 500 : 400,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EDITORIAL BOARD STRIP ──────────────────────── */}
        <section style={{ padding: '80px 28px' }}>
          <div className="row gap-7" style={{ maxWidth: 1280, margin: '0 auto', flexWrap: 'wrap' }}>
            <div className="col gap-5" style={{ flex: '1 1 380px', minWidth: 0 }}>
              <span className="section-mark">IV / our editorial board</span>
              <div
                className="display"
                style={{
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  fontWeight: 600,
                }}
              >
                Written like
                <br />
                you&rsquo;d want it
                <br />
                <span style={{ color: 'var(--cobalt)' }}>for your parents</span>
                <span style={{ color: 'var(--orange)' }}>.</span>
              </div>
              <p className="lede" style={{ fontSize: 18, maxWidth: 520 }}>
                Every condition page reviewed by a board-certified physician in that specialty before it goes live. We cite sources. We update yearly. We don&rsquo;t push miracle cures.
              </p>
              <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                <div className="row" aria-hidden="true">
                  {['MP', 'AR', 'JO', 'KE'].map((n, i) => (
                    <div
                      key={n}
                      className="placeholder"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 99,
                        fontSize: 11,
                        marginLeft: i ? -12 : 0,
                        background: 'var(--paper)',
                        color: 'var(--ink-3)',
                        borderColor: 'var(--rule)',
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <div className="col">
                  <div className="num" style={{ fontSize: 16, fontWeight: 500 }}>47 reviewers</div>
                  <div className="muted" style={{ fontSize: 12 }}>19 specialties · 6 continents</div>
                </div>
                <Link
                  href="/editorial-board"
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--cobalt)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 500,
                    marginLeft: 'auto',
                  }}
                >
                  Meet the board →
                </Link>
              </div>
            </div>

            <div className="col gap-5" style={{ flex: '1 1 280px', minWidth: 0 }}>
              <div className="card" style={{ padding: 24 }}>
                <div className="kicker" style={{ marginBottom: 10 }}>
                  <span className="dot" />the rules we keep
                </div>
                <ol className="clean col gap-3">
                  {[
                    'Cite ranges, never adjectives. "TSH 6.8 (ref 0.4–4.0)" beats "elevated TSH".',
                    'Lead with reassurance when warranted. Borderline ≠ broken.',
                    'Talk to a smart, scared, hurried adult — not a journal, not a child.',
                    'Never push a miracle cure. We say "common", "monitor-able", "treatable".',
                  ].map((q, i) => (
                    <li key={i} className="row gap-3 ai-baseline">
                      <span
                        className="num"
                        style={{
                          fontSize: 18,
                          color: 'var(--cobalt)',
                          minWidth: 30,
                          fontWeight: 500,
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ── MEDICAL TRAVEL CTA ─────────────────────────── */}
        <section style={{ padding: '0 28px 96px' }}>
          <div
            className="card-ink"
            style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 36px' }}
          >
            <div
              className="row ai-center between"
              style={{ flexWrap: 'wrap', gap: 24 }}
            >
              <div className="col gap-2" style={{ flex: '1 1 480px', minWidth: 0 }}>
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
                  V / the concierge
                </span>
                <h2
                  className="display"
                  style={{
                    fontSize: 'clamp(28px, 3.5vw, 40px)',
                    lineHeight: 1.05,
                    margin: 0,
                    letterSpacing: '-0.03em',
                    fontWeight: 600,
                    color: 'var(--paper)',
                  }}
                >
                  Planning surgery abroad? <span style={{ color: 'var(--cobalt-3)' }}>End-to-end, handled</span><span style={{ color: 'var(--orange)' }}>.</span>
                </h2>
                <p
                  style={{
                    color: 'rgba(255,255,255,.7)',
                    fontSize: 16,
                    lineHeight: 1.55,
                    maxWidth: 560,
                    margin: 0,
                  }}
                >
                  Surgeon match-making. Pre-negotiated package pricing. Visa, flight, recovery suite, native-speaking translator. Twelve cities, one number.
                </p>
              </div>
              <Link href="/medical-travel/bot" className="btn btn-cobalt btn-lg">
                Build my estimate →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
