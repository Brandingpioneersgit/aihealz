'use client';

import Link from 'next/link';

/**
 * Reusable CTA components — Bureau (v4) edition.
 *
 * Public API preserved: every component name + prop signature matches the
 * pre-conversion file so existing callers continue to compile.
 */

// ──────────────────────────────────────────────────────────────────────────────
// AI DIAGNOSIS CTA — promotes the symptom checker / report analyzer
// ──────────────────────────────────────────────────────────────────────────────

export function AIDiagnosisCTA({
  title = "Not sure what's going on?",
  subtitle = 'Describe symptoms or upload a report. We narrow it to likely conditions in under a minute.',
  variant = 'default',
}: {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'inline';
}) {
  if (variant === 'inline') {
    return (
      <div
        className="row ai-center between gap-4"
        style={{
          padding: 16,
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-3)',
        }}
      >
        <div className="row ai-center gap-3" style={{ minWidth: 0 }}>
          <span
            className="mono"
            aria-hidden="true"
            style={{ color: 'var(--cobalt)', fontSize: 16, lineHeight: 1 }}
          >
            ◆
          </span>
          <div className="col" style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)', margin: 0 }}>
              {title}
            </p>
            <p
              className="muted"
              style={{ fontSize: 12, margin: 0, lineHeight: 1.45 }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <Link href="/symptoms" className="btn btn-cobalt btn-sm" style={{ whiteSpace: 'nowrap' }}>
          Try diagnosis
        </Link>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href="/symptoms"
        className="row ai-center between gap-3"
        style={{
          padding: '10px 12px',
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-2)',
          transition: 'border-color var(--transition-fast), background var(--transition-fast)',
        }}
      >
        <span className="row ai-center gap-2">
          <span
            className="mono"
            aria-hidden="true"
            style={{ color: 'var(--cobalt)', fontSize: 13 }}
          >
            ◆
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
            Get an AI diagnosis
          </span>
        </span>
        <span
          aria-hidden="true"
          className="mono"
          style={{ color: 'var(--ink-3)', fontSize: 13 }}
        >
          →
        </span>
      </Link>
    );
  }

  return (
    <div className="card-ink" style={{ padding: 28 }}>
      <div className="col gap-4">
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: 'var(--cobalt-3)',
            textTransform: 'uppercase',
            letterSpacing: '.10em',
            fontWeight: 500,
          }}
        >
          ● ai diagnosis
        </span>
        <h3
          className="display"
          style={{
            fontSize: 28,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            fontWeight: 500,
            margin: 0,
            color: 'var(--paper)',
          }}
        >
          {title}
          <span style={{ color: 'var(--orange)' }}>.</span>
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.72)', margin: 0 }}>
          {subtitle}
        </p>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <Link href="/symptoms" className="btn btn-cobalt">
            Start diagnosis
          </Link>
          <Link
            href="/analyze"
            className="btn"
            style={{
              background: 'rgba(255,255,255,.08)',
              color: 'var(--paper)',
              borderColor: 'rgba(255,255,255,.18)',
            }}
          >
            Upload report
          </Link>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BOOK APPOINTMENT CTA — for doctor / hospital pages
// ──────────────────────────────────────────────────────────────────────────────

export function BookAppointmentCTA({
  doctorName,
  href = '/book',
  variant = 'default',
}: {
  doctorName?: string;
  specialty?: string;
  href?: string;
  variant?: 'default' | 'floating' | 'card';
}) {
  if (variant === 'floating') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 'var(--z-fixed)' as unknown as number,
        }}
      >
        <Link href={href} className="btn btn-cobalt btn-lg" style={{ borderRadius: 999 }}>
          Book appointment
        </Link>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="card col gap-3" style={{ padding: 24 }}>
        <span className="kicker">
          <span className="dot" />
          appointments
        </span>
        <h3
          className="display"
          style={{
            fontSize: 22,
            letterSpacing: '-0.02em',
            fontWeight: 500,
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          Ready to book
          <span style={{ color: 'var(--orange)' }}>.</span>
        </h3>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
          {doctorName
            ? `Schedule a consultation with ${doctorName}.`
            : 'Pick an open slot. Confirm in two taps.'}
        </p>
        <Link
          href={href}
          className="btn btn-cobalt"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Book now
        </Link>
      </div>
    );
  }

  return (
    <Link href={href} className="btn btn-cobalt btn-sm">
      Book appointment
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FIND DOCTOR CTA — generic doctor-finding CTA
// ──────────────────────────────────────────────────────────────────────────────

export function FindDoctorCTA({
  specialty,
  condition,
  location,
  variant = 'default',
}: {
  specialty?: string;
  condition?: string;
  location?: string;
  variant?: 'default' | 'banner' | 'sidebar';
}) {
  const href = specialty
    ? `/doctors/specialty/${specialty.toLowerCase().replace(/\s+/g, '-')}`
    : '/doctors';

  const title = specialty
    ? `Find ${specialty} specialists`
    : condition
      ? `Find doctors for ${condition}`
      : 'Find the right doctor';

  if (variant === 'banner') {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div className="row between ai-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="col gap-2" style={{ flex: '1 1 320px', minWidth: 0 }}>
            <span className="section-mark">verified directory</span>
            <h3
              className="display"
              style={{
                fontSize: 26,
                letterSpacing: '-0.025em',
                fontWeight: 500,
                margin: 0,
                color: 'var(--ink)',
              }}
            >
              {title}
              <span style={{ color: 'var(--orange)' }}>.</span>
            </h3>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
              {location
                ? `Top-rated specialists in ${location}, with patient reviews and credentials.`
                : 'Credential-checked. Patient-rated. Filter by fee, language, and wait time.'}
            </p>
          </div>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <Link href={href} className="btn btn-cobalt">
              Find doctors
            </Link>
            <Link href="/symptoms" className="btn btn-paper">
              Get a recommendation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="card-flat col gap-3" style={{ padding: 16 }}>
        <div className="row ai-center gap-3">
          <span
            className="spec-icon"
            aria-hidden="true"
            style={{ background: 'var(--cobalt)', color: 'var(--paper)', fontSize: 14 }}
          >
            DR
          </span>
          <div className="col" style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)', margin: 0 }}>
              {title}
            </p>
            <p className="muted" style={{ fontSize: 12, margin: 0 }}>
              Verified specialists
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="btn btn-cobalt btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Browse doctors
        </Link>
      </div>
    );
  }

  return (
    <Link href={href} className="btn btn-paper btn-sm">
      <span aria-hidden="true" className="mono" style={{ color: 'var(--cobalt)', fontSize: 12 }}>
        ◆
      </span>
      {title}
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MEDICAL TRAVEL CTA — cost compare / medical tourism
// ──────────────────────────────────────────────────────────────────────────────

export function MedicalTravelCTA({
  treatment,
  variant = 'default',
}: {
  treatment?: string;
  variant?: 'default' | 'mini' | 'full';
}) {
  if (variant === 'mini') {
    return (
      <Link
        href="/medical-travel/bot"
        className="row ai-center gap-2"
        style={{
          padding: '6px 10px',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: 'var(--cobalt)',
          background: 'var(--cobalt-50)',
          border: '1px solid rgba(28, 91, 255, .22)',
          borderRadius: 'var(--r-2)',
          fontWeight: 500,
        }}
      >
        compare prices →
      </Link>
    );
  }

  if (variant === 'full') {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div className="row gap-6 ai-start" style={{ flexWrap: 'wrap' }}>
          <div className="col gap-4" style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
              <span className="pill pill-cobalt">save up to 90%</span>
              <span className="pill">JCI-accredited</span>
            </div>
            <h3
              className="display"
              style={{
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                fontWeight: 500,
                margin: 0,
                color: 'var(--ink)',
              }}
            >
              {treatment ? `Get ${treatment} abroad` : 'Same surgery, seven countries'}
              <span style={{ color: 'var(--orange)' }}>.</span>
            </h3>
            <p className="lede" style={{ fontSize: 16, margin: 0 }}>
              Compare treatment cost across top medical-tourism destinations. Free quotes from
              accredited hospitals in 24 hours.
            </p>
            <ul className="clean col gap-2">
              {[
                'Free cost estimates from verified hospitals',
                'Visa assistance and travel planning',
                'Post-treatment follow-up support',
              ].map((item) => (
                <li key={item} className="row ai-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="mono"
                    style={{ color: 'var(--cobalt)', fontSize: 13, minWidth: 14 }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col gap-2" style={{ flex: '0 0 240px' }}>
            <Link
              href="/medical-travel/bot"
              className="btn btn-cobalt btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Get a free quote
            </Link>
            <Link
              href="/medical-travel"
              className="btn btn-paper"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              How it works
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href="/medical-travel/bot" className="btn btn-cobalt btn-sm">
      Compare international prices
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BOOK TEST CTA — diagnostic tests
// ──────────────────────────────────────────────────────────────────────────────

export function BookTestCTA({
  testName,
  testSlug,
  variant = 'default',
}: {
  testName?: string;
  testSlug?: string;
  variant?: 'default' | 'card' | 'inline';
}) {
  const href = testSlug ? `/tests/${testSlug}/book` : '/diagnostic-labs';

  if (variant === 'card') {
    return (
      <div className="card col gap-4" style={{ padding: 24 }}>
        <div className="row between ai-center">
          <span className="kicker">
            <span className="dot" />
            diagnostic labs
          </span>
          <span className="pill pill-mint">
            <span className="pill-dot" style={{ background: 'var(--mint)' }} />
            home collection
          </span>
        </div>
        <h3
          className="display"
          style={{
            fontSize: 22,
            letterSpacing: '-0.02em',
            fontWeight: 500,
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          {testName ? `Book ${testName}` : 'Book a lab test'}
          <span style={{ color: 'var(--orange)' }}>.</span>
        </h3>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
          Sample collected at home. Reports in 24–48 hours.
        </p>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <Link href={href} className="btn btn-cobalt">
            Book now
          </Link>
          <Link href="/diagnostic-labs" className="btn btn-paper">
            Find labs near me
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className="row ai-center between gap-3"
        style={{
          padding: '10px 14px',
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-2)',
        }}
      >
        <div className="row ai-center gap-2">
          <span
            className="pill-dot"
            aria-hidden="true"
            style={{ background: 'var(--mint)' }}
          />
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Home collection available</span>
        </div>
        <Link href={href} className="btn btn-cobalt btn-sm">
          Book test
        </Link>
      </div>
    );
  }

  return (
    <Link href={href} className="btn btn-cobalt btn-sm">
      {testName ? `Book ${testName}` : 'Book a lab test'}
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// QUICK ACTIONS BAR — sticky / inline cluster of common actions
// ──────────────────────────────────────────────────────────────────────────────

type QuickAction = 'diagnosis' | 'doctors' | 'tests' | 'travel' | 'appointment';

const QUICK_ACTION_CONFIG: Record<
  QuickAction,
  { label: string; href: string; glyph: string }
> = {
  diagnosis:   { label: 'AI diagnosis',   href: '/symptoms',          glyph: '◆' },
  doctors:     { label: 'Find doctors',   href: '/doctors',           glyph: '★' },
  tests:       { label: 'Book tests',     href: '/tests',             glyph: '↳' },
  travel:      { label: 'Medical travel', href: '/medical-travel/bot', glyph: '↻' },
  appointment: { label: 'Book now',       href: '/book',              glyph: '→' },
};

export function QuickActionsBar({
  actions = ['diagnosis', 'doctors', 'tests', 'travel'],
  variant = 'default',
}: {
  actions?: QuickAction[];
  variant?: 'default' | 'sticky';
}) {
  const items = (
    <div className="row gap-2 ai-center center" style={{ flexWrap: 'wrap' }}>
      {actions.map((action) => {
        const config = QUICK_ACTION_CONFIG[action];
        return (
          <Link key={action} href={config.href} className="btn btn-paper btn-sm">
            <span
              aria-hidden="true"
              className="mono"
              style={{ color: 'var(--cobalt)', fontSize: 12 }}
            >
              {config.glyph}
            </span>
            {config.label}
          </Link>
        );
      })}
    </div>
  );

  if (variant === 'sticky') {
    return (
      <div
        className="safe-bottom"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 'var(--z-fixed)' as unknown as number,
          background: 'var(--paper)',
          borderTop: '1px solid var(--rule)',
          padding: '12px 16px',
        }}
      >
        {items}
      </div>
    );
  }

  return <div style={{ padding: '16px 0' }}>{items}</div>;
}

// ──────────────────────────────────────────────────────────────────────────────
// NEXT STEPS CTA — numbered checklist after a completed action
// ──────────────────────────────────────────────────────────────────────────────

export function NextStepsCTA({
  steps,
}: {
  currentStep?: string;
  steps: Array<{ label: string; href: string; description: string; icon?: string }>;
}) {
  return (
    <div className="card col gap-4" style={{ padding: 24 }}>
      <div className="row between ai-baseline">
        <span className="section-mark">next steps</span>
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
          }}
        >
          {steps.length.toString().padStart(2, '0')} to go
        </span>
      </div>
      <ol className="clean col gap-2">
        {steps.map((step, index) => (
          <li key={`${step.href}-${index}`}>
            <Link
              href={step.href}
              className="row ai-center gap-4 hairline-b"
              style={{
                padding: '14px 4px',
                transition: 'background var(--transition-fast)',
              }}
            >
              <span
                className="num"
                style={{
                  fontSize: 22,
                  color: 'var(--cobalt)',
                  fontWeight: 500,
                  letterSpacing: '-0.03em',
                  minWidth: 36,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="col" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--ink)' }}>
                  {step.label}
                </span>
                <span className="muted" style={{ fontSize: 13 }}>
                  {step.description}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="mono"
                style={{ color: 'var(--ink-3)', fontSize: 14 }}
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// EMERGENCY CTA — urgent care fallback
// ──────────────────────────────────────────────────────────────────────────────

export function EmergencyCTA() {
  return (
    <div
      role="alert"
      className="row ai-center between gap-3"
      style={{
        padding: 16,
        background: 'var(--orange-50)',
        border: '1px solid rgba(255, 90, 46, .28)',
        borderRadius: 'var(--r-3)',
      }}
    >
      <div className="row ai-center gap-3" style={{ minWidth: 0 }}>
        <span
          aria-hidden="true"
          className="pill-dot"
          style={{ background: 'var(--orange)', width: 8, height: 8 }}
        />
        <div className="col" style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--orange-2)', margin: 0 }}>
            Medical emergency
          </p>
          <p className="muted" style={{ fontSize: 12, margin: 0 }}>
            Call your local emergency number now.
          </p>
        </div>
      </div>
      <a href="tel:112" className="btn btn-orange btn-sm">
        Call 112
      </a>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CONSULTATION CTA — WhatsApp / chat consultation
// ──────────────────────────────────────────────────────────────────────────────

export function ConsultationCTA({
  variant = 'default',
}: {
  variant?: 'default' | 'whatsapp' | 'chat';
}) {
  if (variant === 'whatsapp') {
    return (
      <a
        href="https://wa.me/919876543210?text=Hi,%20I%20need%20medical%20consultation"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-paper btn-sm"
        aria-label="Open WhatsApp consultation"
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: 'var(--mint-3)' }}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp consult
      </a>
    );
  }

  if (variant === 'chat') {
    return (
      <Link href="/chat" className="btn btn-cobalt btn-sm">
        <span aria-hidden="true" className="mono" style={{ fontSize: 12 }}>
          ◆
        </span>
        Chat with a doctor
      </Link>
    );
  }

  return (
    <div className="row gap-2">
      <ConsultationCTA variant="whatsapp" />
      <ConsultationCTA variant="chat" />
    </div>
  );
}
