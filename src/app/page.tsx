import { Metadata } from 'next';
import prisma from '@/lib/db';
import Link from 'next/link';
import Script from 'next/script';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import HomepageSpecialties from '@/components/ui/homepage-specialties';
import Reveal from '@/components/v4/Reveal';
import MediaTile from '@/components/v4/MediaTile';
import { normalizeSpecialty, SPECIALTY_ICON_MAP } from '@/lib/normalize-specialty';
import { getGeoContext } from '@/lib/geo-context';
import { HERO_IMAGES } from '@/lib/stock-images';

export const revalidate = 86400;

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
// Numbers are deliberately rounded; pinned links point to real treatment pages
// (/treatments/<slug>) which carry per-country cost data. The earlier
// /[country]/[lang]/<condition>/cost links pointed at slugs that did not exist
// in medical_conditions and rendered an empty body in production.
const COST_PROCEDURES: { proc: string; costs: string[]; pinnedHref?: string }[] = [
  {
    proc: 'Knee replacement',
    costs: ['$38,000', '£14,200', '$3,400', '$8,500', '$6,200', '$7,800', '$11,000'],
    pinnedHref: '/treatments/total-knee-replacement',
  },
  {
    proc: 'Hair transplant',
    costs: ['$15,000', '£6,400', '$1,200', '$3,200', '$2,800', '$2,400', '$4,200'],
    pinnedHref: '/treatments/hair-transplant',
  },
  {
    proc: 'IVF cycle',
    costs: ['$23,500', '£8,200', '$2,400', '$5,200', '$4,800', '$3,900', '$6,800'],
    pinnedHref: '/treatments/ivf-cycle',
  },
  {
    proc: 'Bariatric surgery',
    costs: ['$22,000', '£11,000', '$5,500', '$9,800', '$7,200', '$8,400', '$13,200'],
    pinnedHref: '/treatments/bariatric-surgery',
  },
];
const COST_COUNTRIES = ['USA', 'UK', 'India', 'Thailand', 'Mexico', 'Turkey', 'UAE'] as const;
const PINNED_COL = COST_COUNTRIES.indexOf('India');

const TRENDING_SEARCHES: { label: string; href: string }[] = [
  { label: 'Hair transplant cost', href: '/treatments/hair-transplant' },
  { label: 'Knee replacement', href: '/treatments/total-knee-replacement' },
  { label: 'IVF success rate', href: '/treatments/ivf-cycle' },
  { label: 'TSH 6.8 meaning', href: '/india/en/hypothyroidism' },
  { label: 'Statin alternatives', href: '/india/en/hyperlipidemia-family' },
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
  const rawTypesBySpecialty: Record<string, string[]> = {};
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
      if (!rawTypesBySpecialty[canon]) rawTypesBySpecialty[canon] = [];
      rawTypesBySpecialty[canon].push(r.specialistType);
    });

    specialties = Object.keys(specCountMap).sort();

    // Only preload the first specialty's conditions so the homepage doesn't
    // block on a 37-way fan-out for tabs nobody clicks. Other specialties
    // lazy-fetch via /api/specialty-conditions on click.
    const firstSpec = specialties[0];
    const firstRawTypes = firstSpec ? rawTypesBySpecialty[firstSpec] || [] : [];
    if (firstSpec && firstRawTypes.length) {
      const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true, specialistType: { in: firstRawTypes } },
        select: { slug: true, commonName: true, specialistType: true, description: true },
        orderBy: [{ description: 'asc' }, { commonName: 'asc' }],
        take: 30,
      });
      const seen = new Set<string>();
      const deduped = conditions.filter(c => {
        const key = c.commonName.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const curated = deduped.filter(c => c.description && c.description.length > 0);
      const others = deduped.filter(c => !c.description || c.description.length === 0);
      grouped[firstSpec] = [...curated, ...others].slice(0, 12);
    }
  } catch (err) {
    console.warn('[page.tsx] Database unavailable, rendering without specialties:', (err as Error).message);
  }

  // Pull a few headline counts for the hero meta strip — best-effort.
  // Treatments live in public/data/treatments.json (not Prisma); use a static
  // floor so we never block the homepage on a 37 MB JSON read.
  let doctorCount = 0;
  const treatmentCount = 10000;
  try {
    doctorCount = await prisma.doctorProvider
      .count({ where: { isVerified: true } })
      .catch(() => 0);
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
        <section style={{ padding: '40px clamp(16px, 4vw, 28px) 24px', maxWidth: 1280, margin: '0 auto' }}>
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
                  {cityDisplay ? `${cityDisplay}, ${countryName}` : countryName}
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
            <Reveal className="col gap-6" style={{ flex: '1 1 580px', minWidth: 0 }} delay={40}>
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
                Talk to it. Drop a report. Triage a symptom. Match a specialist. Compare a cost. One AI front door for medicine — built for the patient making sense of a result and the clinician making the call.
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
            </Reveal>

            {/* HERO RIGHT — case dossier */}
            <Reveal className="col gap-3" style={{ flex: '0 1 380px', minWidth: 0 }} delay={180}>
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
                    href="/india/en/hypothyroidism"
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
                    { n: '01', t: 'Hypothyroidism — the 5% nobody talks about', r: '5 min', href: '/india/en/hypothyroidism' },
                    { n: '02', t: 'Statins at 40 — the new threshold', r: '7 min', href: '/india/en/hyperlipidemia-family' },
                    { n: '03', t: 'When ferritin lies', r: '4 min', href: '/india/en/iron-deficiency-e611' },
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
            </Reveal>
          </div>
        </section>

        {/* ── AI TOOLS HUB ──────────────────────────────── */}
        <section style={{ padding: '40px clamp(16px, 4vw, 28px) 20px', maxWidth: 1280, margin: '0 auto' }}>
          <div
            className="row between ai-end"
            style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
          >
            <div className="col gap-2">
              <span className="section-mark">I / the AI</span>
              <h2
                className="display"
                style={{
                  fontSize: 'clamp(32px, 4.5vw, 56px)',
                  margin: 0,
                  letterSpacing: '-0.035em',
                  fontWeight: 600,
                }}
              >
                Every AI tool, <span style={{ color: 'var(--cobalt)' }}>one front door</span>
                <span style={{ color: 'var(--orange)' }}>.</span>
              </h2>
            </div>
            <p className="muted" style={{ fontSize: 14, maxWidth: 340, margin: 0, lineHeight: 1.55 }}>
              Built for two readers — the patient making sense of a result, and the clinician making the call.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 20,
            }}
          >
            {/* Patient column — paper */}
            <Reveal className="card col" style={{ padding: 0, overflow: 'hidden' }} delay={40}>
              <div
                className="row between ai-center hairline-b"
                style={{ padding: '18px 22px' }}
              >
                <div className="col gap-1">
                  <span className="kicker">
                    <span className="dot" />for patients
                  </span>
                  <span
                    className="display"
                    style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}
                  >
                    Make sense of it.
                  </span>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  06 tools
                </span>
              </div>
              {[
                {
                  href: '/healz-ai',
                  title: 'Healz AI — chat',
                  blurb: 'Ask in plain English. Grounded in 70k conditions, your country, your meds.',
                  badge: 'live',
                },
                {
                  href: '/analyze',
                  title: 'AI second opinion',
                  blurb: 'Upload a PDF or screenshot of your report. Severity-ranked findings + specialist match in 60 seconds.',
                },
                {
                  href: '/symptoms',
                  title: 'Symptom checker',
                  blurb: 'Triage with red-flag detection. Specialty match included.',
                },
                {
                  href: '/vault',
                  title: 'Health vault',
                  blurb: 'All your reports in one dossier. Trends across visits, shareable on demand.',
                },
                {
                  href: 'https://medcasts.com',
                  external: true,
                  title: 'Travel concierge — Medcasts',
                  blurb: 'Surgeon match plus all-in cost estimate for surgery abroad. Powered by medcasts.com.',
                },
              ].map((t, i, arr) => {
                const sharedClass = 'row gap-3 ai-start';
                const sharedStyle = {
                  padding: '16px 22px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                  transition: 'background 120ms' as const,
                };
                const body = (
                  <>
                    <span
                      className="num"
                      style={{
                        fontSize: 11,
                        color: 'var(--cobalt)',
                        minWidth: 22,
                        marginTop: 3,
                        fontWeight: 500,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                      <span className="row ai-center gap-2">
                        <span
                          className="display"
                          style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.015em' }}
                        >
                          {t.title}
                        </span>
                        {t.badge && (
                          <span
                            className="mono"
                            style={{
                              fontSize: 9,
                              color: 'var(--mint-3)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.10em',
                              padding: '2px 6px',
                              border: '1px solid var(--mint-3)',
                              borderRadius: 99,
                            }}
                          >
                            ● {t.badge}
                          </span>
                        )}
                      </span>
                      <span className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                        {t.blurb}
                      </span>
                    </span>
                    <span aria-hidden="true" style={{ color: 'var(--ink-3)', marginTop: 3 }}>
                      {t.external ? '↗' : '→'}
                    </span>
                  </>
                );
                return t.external ? (
                  <a
                    key={t.href}
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={sharedClass}
                    style={sharedStyle}
                  >
                    {body}
                  </a>
                ) : (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={sharedClass}
                    style={sharedStyle}
                  >
                    {body}
                  </Link>
                );
              })}
            </Reveal>

            {/* Clinician column — ink */}
            <Reveal
              className="card-ink col"
              style={{ padding: 0, overflow: 'hidden' }}
              delay={140}
            >
              <div
                className="row between ai-center"
                style={{
                  padding: '18px 22px',
                  borderBottom: '1px solid rgba(255,255,255,.10)',
                }}
              >
                <div className="col gap-1">
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
                    ● for clinicians
                  </span>
                  <span
                    className="display"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: 'var(--paper)',
                    }}
                  >
                    Make the call.
                  </span>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  06 tools
                </span>
              </div>
              {[
                {
                  href: '/for-doctors/clinical-scores',
                  title: 'Clinical scores',
                  blurb: 'CHA₂DS₂-VASc, Wells, TIMI, CURB-65 — 200+ validated calculators.',
                },
                {
                  href: '/for-doctors/drug-dosing',
                  title: 'Drug dosing',
                  blurb: 'Renal & hepatic adjustment, pediatric weight-based dosing.',
                },
                {
                  href: '/tools/drug-interactions',
                  title: 'Drug interactions',
                  blurb: 'Multi-drug check with severity flags and managed alternatives.',
                },
                {
                  href: '/for-doctors/surgical-checklist',
                  title: 'Surgical checklist',
                  blurb: 'WHO + procedure-tailored bedside protocol, ready to print.',
                },
                {
                  href: '/for-doctors/quick-reference',
                  title: 'Bedside quick-ref',
                  blurb: 'Point-of-care protocols, citation-ready, specialty filtered.',
                },
                {
                  href: '/clinical-reference',
                  title: 'Clinical reference',
                  blurb: 'Latest guidelines indexed by specialty. We update yearly.',
                },
              ].map((t, i, arr) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="row gap-3 ai-start"
                  style={{
                    padding: '16px 22px',
                    borderBottom:
                      i < arr.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none',
                    transition: 'background 120ms',
                  }}
                >
                  <span
                    className="num"
                    style={{
                      fontSize: 11,
                      color: 'var(--cobalt-3)',
                      minWidth: 22,
                      marginTop: 3,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                    <span
                      className="display"
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        letterSpacing: '-0.015em',
                        color: 'var(--paper)',
                      }}
                    >
                      {t.title}
                    </span>
                    <span
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color: 'rgba(255,255,255,.65)',
                      }}
                    >
                      {t.blurb}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    style={{ color: 'rgba(255,255,255,.5)', marginTop: 3 }}
                  >
                    →
                  </span>
                </Link>
              ))}
              <div
                className="row between ai-center"
                style={{
                  padding: '14px 22px',
                  borderTop: '1px solid rgba(255,255,255,.10)',
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  full clinician suite
                </span>
                <Link
                  href="/for-doctors"
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: 'var(--cobalt-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 500,
                  }}
                >
                  /for-doctors →
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── SPECIALTY INDEX ───────────────────────────── */}
        {specialties.length > 0 && (
          <section style={{ padding: '48px clamp(16px, 4vw, 28px) 36px', maxWidth: 1280, margin: '0 auto' }}>
            <Reveal
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
            </Reveal>

            <HomepageSpecialties
              specialties={specialties}
              grouped={grouped}
              rawTypesBySpecialty={rawTypesBySpecialty}
              counts={specCountMap}
              icons={SPECIALTY_ICON_MAP}
              country={geo.countrySlug || 'india'}
              lang={geo.lang}
            />
          </section>
        )}

        {/* ── COST COMPARE (ink) ────────────────────────── */}
        <section style={{ padding: 'clamp(48px, 8vw, 72px) clamp(16px, 4vw, 28px)', background: 'var(--ink)', color: 'var(--paper)' }}>
          <Reveal style={{ maxWidth: 1280, margin: '0 auto' }} className="col gap-6">
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
              <a
                href="https://medcasts.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  background: 'rgba(255,255,255,.08)',
                  color: 'var(--paper)',
                  borderColor: 'rgba(255,255,255,.15)',
                }}
              >
                Compare any procedure on Medcasts ↗
              </a>
            </div>

            <div
              className="h-scroll"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.10)',
                borderRadius: 'var(--r-3)',
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
          </Reveal>
        </section>

        {/* ── EDITORIAL IMAGERY STRIP ────────────────────── */}
        <section style={{ padding: 'clamp(48px, 7vw, 72px) clamp(16px, 4vw, 28px) 0' }}>
          <Reveal style={{ maxWidth: 1280, margin: '0 auto' }}>
            <figure
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '24 / 9',
                maxHeight: 420,
                overflow: 'hidden',
                borderRadius: 'var(--r-3, 8px)',
                border: '1px solid var(--rule)',
                margin: 0,
              }}
            >
              <MediaTile
                alt={HERO_IMAGES.consult.alt}
                icon={HERO_IMAGES.consult.icon}
                tone="cobalt"
                aspect="24 / 9"
                iconSize={96}
              />
              <figcaption
                className="col gap-2"
                style={{
                  position: 'absolute',
                  left: 'clamp(20px, 4vw, 36px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  maxWidth: 480,
                  color: 'var(--ink)',
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--cobalt)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 500,
                  }}
                >
                  ● dispatch / from the floor
                </span>
                <h3
                  className="display"
                  style={{
                    fontSize: 'clamp(22px, 3vw, 36px)',
                    margin: 0,
                    letterSpacing: '-0.025em',
                    fontWeight: 600,
                    lineHeight: 1.1,
                  }}
                >
                  Verified physicians.
                  <br />
                  <span style={{ color: 'var(--cobalt)' }}>Real consultations.</span>
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--ink-2)',
                    margin: 0,
                    lineHeight: 1.55,
                    maxWidth: 380,
                  }}
                >
                  Every doctor on aihealz is checked against a national medical registry before they appear in your results.
                </p>
              </figcaption>
            </figure>
          </Reveal>
        </section>

        {/* ── EDITORIAL BOARD STRIP ──────────────────────── */}
        <section style={{ padding: 'clamp(56px, 8vw, 80px) clamp(16px, 4vw, 28px)' }}>
          <div className="row gap-7" style={{ maxWidth: 1280, margin: '0 auto', flexWrap: 'wrap' }}>
            <Reveal className="col gap-5" style={{ flex: '1 1 380px', minWidth: 0 }} delay={40}>
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
            </Reveal>

            <Reveal className="col gap-5" style={{ flex: '1 1 280px', minWidth: 0 }} delay={140}>
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

              {/* Doctor ethical-badge CTA */}
              <a
                href="https://mdrpedia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="card-ink col gap-3"
                style={{ padding: 22 }}
              >
                <div className="row between ai-center">
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
                    ● for doctors
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.10em',
                    }}
                  >
                    via mdrpedia
                  </span>
                </div>
                <div
                  className="display"
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: '-0.025em',
                    color: 'var(--paper)',
                    lineHeight: 1.2,
                  }}
                >
                  Top doctors — get your <span style={{ color: 'var(--cobalt-3)' }}>ethical badge</span><span style={{ color: 'var(--orange)' }}>.</span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,.7)',
                    lineHeight: 1.55,
                  }}
                >
                  aihealz only features clinicians who&rsquo;ve passed an ethics review. Apply, get verified, and earn the badge — issued by our partner mdrpedia.com.
                </div>
                <div
                  className="row between ai-center"
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,.10)',
                    marginTop: 4,
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                    free for verified clinicians
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 12,
                      color: 'var(--cobalt-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 500,
                    }}
                  >
                    mdrpedia.com ↗
                  </span>
                </div>
              </a>
            </Reveal>
          </div>
        </section>

        {/* ── COVERAGE MAP ──────────────────────────────── */}
        <section style={{ padding: '20px clamp(16px, 4vw, 28px) 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Reveal
              className="row between ai-end"
              style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
            >
              <div className="col gap-2">
                <span className="section-mark">V / coverage map</span>
                <h2
                  className="display"
                  style={{
                    fontSize: 'clamp(28px, 3.5vw, 40px)',
                    margin: 0,
                    letterSpacing: '-0.03em',
                    fontWeight: 600,
                  }}
                >
                  Everything we cover, indexed.
                </h2>
              </div>
              <p className="muted" style={{ fontSize: 14, maxWidth: 320, margin: 0, lineHeight: 1.55 }}>
                One click to any directory, calculator, or section of the Bureau.
              </p>
            </Reveal>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 32,
                paddingTop: 24,
                borderTop: '1px solid var(--rule)',
              }}
            >
              {[
                {
                  title: 'browse the index',
                  links: [
                    { label: 'Conditions', href: '/conditions', meta: `${conditionsLabel}+` },
                    { label: 'Doctors', href: '/doctors', meta: `${doctorsLabel}+` },
                    { label: 'Hospitals', href: '/hospitals' },
                    { label: 'Treatments', href: '/treatments', meta: `${treatmentsLabel}+` },
                    { label: 'Diagnostic labs', href: '/diagnostic-labs' },
                  ],
                },
                {
                  title: 'compare & decide',
                  links: [
                    { label: 'Cost compare', href: '/treatments' },
                    { label: 'Medical travel — Medcasts ↗', href: 'https://medcasts.com', external: true },
                    { label: 'Insurance', href: '/insurance' },
                    { label: 'Pricing', href: '/pricing' },
                    { label: 'Book a consult', href: '/book' },
                  ],
                },
                {
                  title: 'calculators & tools',
                  links: [
                    { label: 'BMI', href: '/tools/bmi-calculator' },
                    { label: 'Heart risk', href: '/tools/heart-risk-calculator' },
                    { label: 'Diabetes risk', href: '/tools/diabetes-risk-calculator' },
                    { label: 'Pregnancy due date', href: '/tools/pregnancy-due-date-calculator' },
                    { label: 'All calculators', href: '/tools', meta: '14' },
                  ],
                },
                {
                  title: 'for providers',
                  links: [
                    { label: 'For doctors', href: '/for-doctors' },
                    { label: 'Get the ethical badge ↗', href: 'https://mdrpedia.com', external: true, meta: 'mdrpedia' },
                    { label: 'Provider login', href: '/provider/login' },
                    { label: 'Hospital portal', href: '/provider/hospital/dashboard' },
                    { label: 'Lab portal', href: '/provider/lab/dashboard' },
                  ],
                },
                {
                  title: 'the bureau',
                  links: [
                    { label: 'Editorial board', href: '/editorial-board' },
                    { label: 'Blog', href: '/blog' },
                    { label: 'About', href: '/about' },
                    { label: 'Press', href: '/press' },
                    { label: 'Help & FAQ', href: '/help' },
                  ],
                },
              ].map((group, gi) => (
                <Reveal key={group.title} className="col gap-3" delay={gi * 60}>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.10em',
                      fontWeight: 500,
                    }}
                  >
                    {group.title}
                  </span>
                  <div className="col">
                    {group.links.map((l, i) => {
                      const linkClass = 'row between ai-baseline';
                      const linkStyle = {
                        padding: '10px 0',
                        borderBottom:
                          i < group.links.length - 1
                            ? '1px solid var(--rule)'
                            : 'none',
                        fontSize: 14,
                        color: ('external' in l && l.external) ? 'var(--cobalt)' : 'var(--ink-2)',
                        letterSpacing: '-0.005em',
                        transition: 'color 120ms' as const,
                      };
                      const inner = (
                        <>
                          <span>{l.label}</span>
                          {l.meta && (
                            <span
                              className="mono"
                              style={{
                                fontSize: 10,
                                color: 'var(--ink-4)',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {l.meta}
                            </span>
                          )}
                        </>
                      );
                      return ('external' in l && l.external) ? (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                          style={linkStyle}
                        >
                          {inner}
                        </a>
                      ) : (
                        <Link
                          key={l.href}
                          href={l.href}
                          className={linkClass}
                          style={linkStyle}
                        >
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── MEDICAL TRAVEL CTA ─────────────────────────── */}
        <section style={{ padding: '0 clamp(16px, 4vw, 28px) clamp(56px, 10vw, 96px)' }}>
          <Reveal
            className="card-ink"
            style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(28px, 5vw, 40px) clamp(20px, 4vw, 36px)' }}
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
                  VI / the concierge — Medcasts
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
                  Planning surgery abroad? <span style={{ color: 'var(--cobalt-3)' }}>Medcasts handles it end-to-end</span><span style={{ color: 'var(--orange)' }}>.</span>
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
                  Our medical-travel partner. Surgeon match-making, pre-negotiated package pricing, visa, flight, recovery suite, native-speaking translator — all booked at <span style={{ color: 'var(--cobalt-3)' }}>medcasts.com</span>.
                </p>
              </div>
              <a
                href="https://medcasts.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cobalt btn-lg"
              >
                Build my estimate on Medcasts ↗
              </a>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
