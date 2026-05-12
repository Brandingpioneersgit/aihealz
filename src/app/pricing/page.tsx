'use client';

import Link from 'next/link';
import { useState } from 'react';

type ProviderType = 'doctors' | 'hospitals' | 'labs';

interface PlanFeature {
  label: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  slug: string;
  price: string;
  priceSuffix: string;
  description: string;
  badge?: string;
  highlighted?: boolean;
  metrics: { label: string; value: string }[];
  features: PlanFeature[];
  cta: string;
  ctaLink: string;
}

const DOCTOR_PLANS: Plan[] = [
  {
    name: 'Free',
    slug: 'doctor-free',
    price: '$0',
    priceSuffix: 'forever',
    description: 'Get started and claim your profile. Perfect for individual practitioners.',
    metrics: [
      { label: 'Specialties', value: '2' },
      { label: 'Leads/mo', value: '5' },
    ],
    features: [
      { label: 'Basic profile listing', included: true },
      { label: 'Patient lead credits (5/month)', included: true },
      { label: 'Standard search ranking', included: true },
      { label: 'AI-generated bio', included: false },
      { label: 'Lead scoring & quality filters', included: false },
      { label: 'Telelink booking integration', included: false },
      { label: 'Priority listing on condition pages', included: false },
      { label: 'Analytics dashboard', included: false },
      { label: 'Dedicated account manager', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/for-doctors#join-form',
  },
  {
    name: 'Premium',
    slug: 'doctor-premium',
    price: '$19',
    priceSuffix: '/month',
    description: 'For growing practices that want more visibility and patient flow.',
    badge: 'Most Popular',
    highlighted: true,
    metrics: [
      { label: 'Specialties', value: '15' },
      { label: 'Leads/mo', value: '50' },
    ],
    features: [
      { label: 'Enhanced profile with AI bio', included: true },
      { label: 'Patient lead credits (50/month)', included: true, highlight: true },
      { label: 'Priority search ranking', included: true, highlight: true },
      { label: 'AI-generated bio', included: true },
      { label: 'Lead scoring & quality filters', included: true },
      { label: 'Telelink booking integration', included: true },
      { label: 'Priority listing on condition pages', included: true },
      { label: 'Analytics dashboard', included: false },
      { label: 'Dedicated account manager', included: false },
    ],
    cta: 'Start 14-Day Trial',
    ctaLink: '/for-doctors/checkout?plan=premium',
  },
  {
    name: 'Enterprise',
    slug: 'doctor-enterprise',
    price: '$59',
    priceSuffix: '/month',
    description: 'For multi-specialty clinics and practice groups.',
    badge: 'Best for Clinics',
    metrics: [
      { label: 'Specialties', value: 'Unlimited' },
      { label: 'Leads/mo', value: '500' },
    ],
    features: [
      { label: 'Premium profile with full customization', included: true },
      { label: 'Patient lead credits (500/month)', included: true, highlight: true },
      { label: 'Top-tier search ranking', included: true, highlight: true },
      { label: 'AI-generated bio', included: true },
      { label: 'Lead scoring & quality filters', included: true },
      { label: 'Telelink booking integration', included: true },
      { label: 'Priority listing on condition pages', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?subject=Enterprise%20Doctor%20Plan',
  },
];

const HOSPITAL_PLANS: Plan[] = [
  {
    name: 'Basic',
    slug: 'hospital-basic',
    price: '$99',
    priceSuffix: '/month',
    description: 'Essential listing for small hospitals and nursing homes.',
    metrics: [
      { label: 'Departments', value: '5' },
      { label: 'Doctor Profiles', value: '10' },
    ],
    features: [
      { label: 'Hospital profile page', included: true },
      { label: 'Location on maps', included: true },
      { label: 'Department listings (5)', included: true },
      { label: 'Doctor profile links (10)', included: true },
      { label: 'Insurance empanelment display', included: true },
      { label: 'Enquiry lead management', included: false },
      { label: 'Equipment & facilities showcase', included: false },
      { label: 'International patient portal', included: false },
      { label: 'Analytics & reporting', included: false },
      { label: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/provider/hospital/register?plan=basic',
  },
  {
    name: 'Professional',
    slug: 'hospital-professional',
    price: '$299',
    priceSuffix: '/month',
    description: 'Full-featured listing for multi-specialty hospitals.',
    badge: 'Recommended',
    highlighted: true,
    metrics: [
      { label: 'Departments', value: 'Unlimited' },
      { label: 'Doctor Profiles', value: '100' },
    ],
    features: [
      { label: 'Enhanced hospital profile', included: true },
      { label: 'Location on maps + street view', included: true },
      { label: 'Unlimited department listings', included: true, highlight: true },
      { label: 'Doctor profile links (100)', included: true, highlight: true },
      { label: 'Insurance empanelment display', included: true },
      { label: 'Enquiry lead management', included: true },
      { label: 'Equipment & facilities showcase', included: true },
      { label: 'International patient portal', included: false },
      { label: 'Analytics & reporting', included: true },
      { label: 'Priority support', included: false },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/provider/hospital/register?plan=professional',
  },
  {
    name: 'Enterprise',
    slug: 'hospital-enterprise',
    price: 'Custom',
    priceSuffix: 'pricing',
    description: 'For hospital chains, corporate groups, and medical tourism hubs.',
    badge: 'For Chains',
    metrics: [
      { label: 'Locations', value: 'Unlimited' },
      { label: 'Doctor Profiles', value: 'Unlimited' },
    ],
    features: [
      { label: 'Multi-location management', included: true, highlight: true },
      { label: 'Centralized dashboard', included: true },
      { label: 'Unlimited departments & doctors', included: true, highlight: true },
      { label: 'White-label patient portal', included: true },
      { label: 'Insurance empanelment display', included: true },
      { label: 'Enquiry lead management', included: true },
      { label: 'Equipment & facilities showcase', included: true },
      { label: 'International patient portal', included: true },
      { label: 'Custom analytics & API access', included: true },
      { label: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?subject=Enterprise%20Hospital%20Plan',
  },
];

const LAB_PLANS: Plan[] = [
  {
    name: 'Starter',
    slug: 'lab-starter',
    price: '$49',
    priceSuffix: '/month',
    description: 'For single-location pathology labs and collection centers.',
    metrics: [
      { label: 'Test Listings', value: '100' },
      { label: 'Bookings/mo', value: '50' },
    ],
    features: [
      { label: 'Lab profile page', included: true },
      { label: 'Test catalog (100 tests)', included: true },
      { label: 'Online booking widget', included: true },
      { label: 'Home collection scheduling', included: true },
      { label: 'Price comparison visibility', included: true },
      { label: 'Partner discounts display', included: false },
      { label: 'Report delivery portal', included: false },
      { label: 'Multi-branch management', included: false },
      { label: 'Analytics dashboard', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/provider/lab/register?plan=starter',
  },
  {
    name: 'Growth',
    slug: 'lab-growth',
    price: '$149',
    priceSuffix: '/month',
    description: 'For growing labs with multiple collection points.',
    badge: 'Most Popular',
    highlighted: true,
    metrics: [
      { label: 'Test Listings', value: '500' },
      { label: 'Bookings/mo', value: '300' },
    ],
    features: [
      { label: 'Enhanced lab profile', included: true },
      { label: 'Test catalog (500 tests)', included: true, highlight: true },
      { label: 'Online booking widget', included: true },
      { label: 'Home collection scheduling', included: true },
      { label: 'Price comparison visibility', included: true },
      { label: 'Partner discounts display', included: true },
      { label: 'Report delivery portal', included: true },
      { label: 'Multi-branch (3 locations)', included: true, highlight: true },
      { label: 'Analytics dashboard', included: true },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/provider/lab/register?plan=growth',
  },
  {
    name: 'Chain',
    slug: 'lab-chain',
    price: '$399',
    priceSuffix: '/month',
    description: 'For diagnostic chains and franchise networks.',
    badge: 'For Networks',
    metrics: [
      { label: 'Test Listings', value: 'Unlimited' },
      { label: 'Bookings/mo', value: 'Unlimited' },
    ],
    features: [
      { label: 'Premium network profile', included: true },
      { label: 'Unlimited test catalog', included: true, highlight: true },
      { label: 'Online booking widget', included: true },
      { label: 'Home collection scheduling', included: true },
      { label: 'Price comparison visibility', included: true },
      { label: 'Featured partner placement', included: true, highlight: true },
      { label: 'Report delivery portal', included: true },
      { label: 'Unlimited locations', included: true, highlight: true },
      { label: 'Custom analytics & API', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?subject=Lab%20Chain%20Plan',
  },
];

const PROVIDER_TABS: { id: ProviderType; label: string; abbr: string }[] = [
  { id: 'doctors', label: 'Doctors', abbr: 'DR' },
  { id: 'hospitals', label: 'Hospitals', abbr: 'HS' },
  { id: 'labs', label: 'Diagnostic Labs', abbr: 'LB' },
];

export default function PricingPage() {
  const [providerType, setProviderType] = useState<ProviderType>('doctors');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = {
    doctors: DOCTOR_PLANS,
    hospitals: HOSPITAL_PLANS,
    labs: LAB_PLANS,
  }[providerType];

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 96px' }}
        className="col gap-7"
      >
        {/* ── Hero ──────────────────────────────────────── */}
        <header className="col gap-3" style={{ maxWidth: 760 }}>
          <span className="section-mark">provider plans / pricing</span>
          <h1
            className="display"
            style={{
              fontSize: 'clamp(40px, 6vw, 88px)',
              lineHeight: 0.95,
              letterSpacing: '-0.045em',
              margin: 0,
              fontWeight: 600,
            }}
          >
            Grow your practice <span style={{ color: 'var(--cobalt)' }}>without the noise</span>
            <span style={{ color: 'var(--orange)' }}>.</span>
          </h1>
          <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 560 }}>
            Pick the plan that matches your practice size. Start free, scale as patient volume grows. No surprise fees.
          </p>
        </header>

        {/* ── Provider Type Tabs + Billing Toggle ─────── */}
        <div
          className="row between ai-center"
          style={{ flexWrap: 'wrap', gap: 16 }}
        >
          <div
            className="row"
            role="tablist"
            aria-label="Provider type"
            style={{
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-2)',
              background: 'var(--paper)',
              overflow: 'hidden',
            }}
          >
            {PROVIDER_TABS.map((tab, i) => {
              const isActive = providerType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProviderType(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className="row ai-center gap-2"
                  style={{
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--paper)' : 'var(--ink-2)',
                    background: isActive ? 'var(--ink)' : 'transparent',
                    borderRight: i < PROVIDER_TABS.length - 1 ? '1px solid var(--rule)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 120ms, color 120ms',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      opacity: 0.7,
                    }}
                  >
                    {tab.abbr}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="row ai-center gap-3">
            <span
              className="mono"
              style={{
                fontSize: 11,
                color: billingCycle === 'monthly' ? 'var(--ink)' : 'var(--ink-4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: billingCycle === 'monthly' ? 500 : 400,
              }}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')
              }
              role="switch"
              aria-checked={billingCycle === 'annual'}
              aria-label="Toggle billing cycle"
              style={{
                position: 'relative',
                width: 44,
                height: 24,
                borderRadius: 999,
                background: billingCycle === 'annual' ? 'var(--cobalt)' : 'var(--rule)',
                border: 'none',
                transition: 'background 120ms',
                cursor: 'pointer',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 3,
                  left: 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--paper)',
                  transform: billingCycle === 'annual' ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform 160ms ease',
                  boxShadow: '0 1px 3px rgba(10, 26, 47, .15)',
                }}
              />
            </button>
            <span
              className="mono"
              style={{
                fontSize: 11,
                color: billingCycle === 'annual' ? 'var(--ink)' : 'var(--ink-4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: billingCycle === 'annual' ? 500 : 400,
              }}
            >
              Annual
              <span
                className="pill pill-mint"
                style={{ marginLeft: 8, textTransform: 'none' }}
              >
                save 20%
              </span>
            </span>
          </div>
        </div>

        {/* ── Plans Grid ─────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {plans.map(plan => {
            const isCustom = plan.price === 'Custom';
            const isAnnual = billingCycle === 'annual' && !isCustom;
            const displayPrice = isAnnual
              ? `$${Math.floor(parseInt(plan.price.replace('$', '')) * 0.8)}`
              : plan.price;
            const displaySuffix = isCustom
              ? plan.priceSuffix
              : isAnnual
              ? '/month, billed annually'
              : plan.priceSuffix;

            return (
              <div
                key={plan.slug}
                className={plan.highlighted ? 'card' : 'card-flat'}
                style={{
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  borderColor: plan.highlighted ? 'var(--ink)' : 'var(--rule)',
                  borderWidth: plan.highlighted ? 2 : 1,
                  position: 'relative',
                }}
              >
                {plan.badge && (
                  <div
                    className="mono"
                    style={{
                      padding: '8px 16px',
                      background: plan.highlighted ? 'var(--ink)' : 'var(--bg-2)',
                      color: plan.highlighted ? 'var(--paper)' : 'var(--ink-3)',
                      fontSize: 11,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      borderBottom: '1px solid var(--rule)',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="col gap-2 hairline-b" style={{ padding: '24px 24px 20px' }}>
                  <div className="row between ai-center">
                    <h2
                      className="display"
                      style={{
                        fontSize: 22,
                        margin: 0,
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {plan.name}
                    </h2>
                  </div>
                  <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    {plan.description}
                  </p>
                  <div className="row ai-baseline gap-1" style={{ marginTop: 6 }}>
                    <span
                      className="display num"
                      style={{
                        fontSize: 40,
                        fontWeight: 600,
                        letterSpacing: '-0.04em',
                        color: 'var(--ink)',
                        lineHeight: 1,
                      }}
                    >
                      {displayPrice}
                    </span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                      {displaySuffix}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div
                  className="row hairline-b"
                  style={{ background: 'var(--bg-2)' }}
                >
                  {plan.metrics.map((metric, mIdx, arr) => (
                    <div
                      key={metric.label}
                      className="col gap-1"
                      style={{
                        flex: 1,
                        padding: '14px 18px',
                        borderRight:
                          mIdx < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                      }}
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
                        {metric.label}
                      </span>
                      <span
                        className="num"
                        style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}
                      >
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul
                  className="clean col gap-2"
                  style={{ padding: '20px 24px', flex: 1 }}
                >
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="row gap-2 ai-baseline"
                      style={{
                        fontSize: 13,
                        color: feature.included
                          ? feature.highlight
                            ? 'var(--ink)'
                            : 'var(--ink-2)'
                          : 'var(--ink-4)',
                        fontWeight: feature.highlight ? 500 : 400,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="mono"
                        style={{
                          color: feature.included
                            ? feature.highlight
                              ? 'var(--cobalt)'
                              : 'var(--mint-3)'
                            : 'var(--ink-4)',
                          fontSize: 12,
                          minWidth: 14,
                          fontWeight: 500,
                        }}
                      >
                        {feature.included ? '✓' : '×'}
                      </span>
                      <span style={{ flex: 1 }}>{feature.label}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div style={{ padding: '0 24px 24px' }}>
                  <Link
                    href={plan.ctaLink}
                    className={plan.highlighted ? 'btn btn-cobalt' : 'btn btn-paper'}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {plan.cta} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Why Providers Choose Us ────────────────── */}
        <section className="col gap-4">
          <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2
              className="display"
              style={{
                fontSize: 28,
                margin: 0,
                letterSpacing: '-0.025em',
                fontWeight: 600,
              }}
            >
              Why providers choose aihealz
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 0,
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-3)',
              background: 'var(--paper)',
              overflow: 'hidden',
            }}
          >
            {[
              {
                kicker: '01',
                title: 'Patient reach',
                desc: 'Millions of patients search aihealz monthly for verified care.',
              },
              {
                kicker: '02',
                title: 'Lead quality',
                desc: 'AI-scored leads filtered by intent, condition match, and location.',
              },
              {
                kicker: '03',
                title: 'Verified profiles',
                desc: 'Credential checks and patient reviews build trust automatically.',
              },
              {
                kicker: '04',
                title: 'Analytics',
                desc: 'Track conversions, lead-source ROI, and patient outcomes in real time.',
              },
            ].map((feature, i, arr) => {
              const cols = 4;
              const isLastCol = (i + 1) % cols === 0;
              const isLastRow = i >= arr.length - cols;
              return (
                <div
                  key={feature.title}
                  className="col gap-3"
                  style={{
                    padding: '24px 22px',
                    borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                    borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--cobalt)',
                      letterSpacing: '0.10em',
                      fontWeight: 500,
                    }}
                  >
                    § {feature.kicker}
                  </span>
                  <div
                    className="display"
                    style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}
                  >
                    {feature.title}
                  </div>
                  <div className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
                    {feature.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────── */}
        <section className="col gap-4" style={{ maxWidth: 880 }}>
          <h2
            className="display"
            style={{
              fontSize: 28,
              margin: 0,
              letterSpacing: '-0.025em',
              fontWeight: 600,
            }}
          >
            Common questions
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: 16,
            }}
          >
            {[
              {
                q: 'Can I try before committing?',
                a: 'Yes — every paid plan ships with a 14-day free trial. No credit card required to start.',
              },
              {
                q: 'How do lead credits work?',
                a: 'Each credit reveals one patient contact. Unused credits roll over for up to three months.',
              },
              {
                q: 'Can I upgrade or downgrade?',
                a: 'Upgrade anytime with prorated billing. Downgrade takes effect at the end of your billing cycle.',
              },
              {
                q: 'Do you offer custom enterprise plans?',
                a: 'Yes — for hospital chains, diagnostic networks, or special requirements. Contact sales for custom pricing.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'All major credit and debit cards, UPI and net banking (India), and wire transfers for enterprise accounts.',
              },
            ].map(faq => (
              <article key={faq.q} className="card" style={{ padding: 22 }}>
                <h3
                  className="display"
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: '-0.015em',
                    marginBottom: 8,
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--ink-2)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {faq.a}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────── */}
        <section
          className="card-ink"
          style={{ padding: 'clamp(28px, 4vw, 40px)' }}
        >
          <div
            className="row between ai-center"
            style={{ flexWrap: 'wrap', gap: 24 }}
          >
            <div className="col gap-2" style={{ flex: '1 1 360px', minWidth: 0 }}>
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
                still deciding?
              </span>
              <h3
                className="display"
                style={{
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  margin: 0,
                  letterSpacing: '-0.025em',
                  fontWeight: 600,
                  color: 'var(--paper)',
                  lineHeight: 1.15,
                }}
              >
                Talk to our practice team<span style={{ color: 'var(--orange)' }}>.</span>
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,.7)',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                We&rsquo;ll match you to the right plan, set up onboarding, and get your first profile live within 48 hours.
              </p>
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              <Link
                href="/contact"
                className="btn btn-lg"
                style={{
                  background: 'rgba(255,255,255,.08)',
                  color: 'var(--paper)',
                  borderColor: 'rgba(255,255,255,.15)',
                }}
              >
                Talk to sales
              </Link>
              <Link href="/for-doctors" className="btn btn-cobalt btn-lg">
                Get started →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
