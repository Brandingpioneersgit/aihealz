import { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';
import SymptomChecker from '@/components/ui/symptom-checker';
import { FindDoctorCTA, BookTestCTA } from '@/components/ui/cta-sections';

const symptomsSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'MedicalWebPage',
            '@id': 'https://aihealz.com/symptoms#page',
            url: 'https://aihealz.com/symptoms',
            name: 'AI Diagnosis & Care — Analyze Your Symptoms',
            description:
                'Describe your symptoms and our clinical-grade AI will analyze possible conditions, recommend diagnostic tests, and suggest OTC and home-care options.',
            inLanguage: 'en',
            audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
            specialty: { '@type': 'MedicalSpecialty', name: 'PrimaryCare' },
            isPartOf: { '@id': 'https://aihealz.com/#website' },
            lastReviewed: new Date().toISOString().slice(0, 10),
        },
        {
            '@type': 'WebApplication',
            name: 'AIHealz Symptom Checker',
            url: 'https://aihealz.com/symptoms',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
            publisher: { '@id': 'https://aihealz.com/#organization' },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
                { '@type': 'ListItem', position: 2, name: 'Symptom Checker', item: 'https://aihealz.com/symptoms' },
            ],
        },
    ],
};

export const metadata: Metadata = {
    title: 'AI Diagnosis & Care — Analyze Your Symptoms',
    description: 'Describe your symptoms and let our AI engine analyze possible conditions, recommend diagnostic tests, and provide safe OTC and home care remedies.',
    keywords: ['symptom checker', 'AI diagnosis', 'medical symptoms', 'health check', 'aihealz', 'home remedies', 'OTC'],
    openGraph: {
        title: 'AI Diagnosis & Care | aihealz',
        description: 'Analyze your symptoms with our AI Care Bot.',
        url: 'https://aihealz.com/symptoms',
        siteName: 'aihealz',
    }
};

const TRUST_BADGES: Array<{ label: string; sub: string }> = [
    { label: 'Encrypted', sub: 'End-to-end' },
    { label: '24h purge', sub: 'Auto-deleted' },
    { label: 'HIPAA + GDPR', sub: 'Compliant' },
];

const RELATED: Array<{ href: string; label: string }> = [
    { href: '/conditions', label: 'Conditions A–Z' },
    { href: '/treatments', label: 'Treatment options' },
    { href: '/analyze', label: 'Upload medical report' },
    { href: '/remedies', label: 'Home remedies' },
];

export default function SymptomsPage() {
    return (
        <V4Page>
            <Script
                id="symptoms-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(symptomsSchema) }}
            />

            <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 28px 80px' }}>
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="row gap-2 mono"
                    style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 32 }}
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>Symptoms</span>
                </nav>

                {/* Hero */}
                <section className="col gap-4" style={{ marginBottom: 48, maxWidth: 880 }}>
                    <span className="section-mark">The symptom checker</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 6vw, 96px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            fontWeight: 600,
                            margin: 0,
                        }}
                    >
                        Tell us what hurts<span style={{ color: 'var(--cobalt)' }}>,</span> we&apos;ll{' '}
                        <span style={{ color: 'var(--cobalt)' }}>narrow it down</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 20, color: 'var(--ink-2)', maxWidth: 640, marginTop: 4 }}
                    >
                        Describe your symptoms and our clinical-grade AI will surface likely conditions,
                        recommend tests, and suggest safe OTC and home-care options. Reviewed by clinicians.
                    </p>

                    {/* CTA pair */}
                    <div className="row gap-2" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                        <Link href="/healz-ai" className="btn btn-cobalt btn-lg">
                            Start with Healz AI →
                        </Link>
                        <Link href="/conditions" className="btn btn-paper btn-lg">
                            Browse conditions A–Z
                        </Link>
                    </div>
                </section>

                {/* Symptom checker — preserved component */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
                    <SymptomChecker />
                </div>

                {/* Healz AI promo card */}
                <Link
                    href="/healz-ai"
                    className="card-ink"
                    style={{
                        display: 'block',
                        padding: 32,
                        marginBottom: 56,
                        textDecoration: 'none',
                    }}
                >
                    <div
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--cobalt-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '.10em',
                            marginBottom: 12,
                            fontWeight: 500,
                        }}
                    >
                        Want a longer conversation?
                    </div>
                    <div
                        className="row between ai-center"
                        style={{ flexWrap: 'wrap', gap: 16 }}
                    >
                        <div style={{ maxWidth: 540 }}>
                            <h2
                                className="display"
                                style={{
                                    fontSize: 32,
                                    lineHeight: 1.0,
                                    letterSpacing: '-0.025em',
                                    fontWeight: 600,
                                    margin: '0 0 8px',
                                    color: 'var(--paper)',
                                }}
                            >
                                Talk to Healz AI.
                            </h2>
                            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.72)', margin: 0, lineHeight: 1.6 }}>
                                Multi-turn medical chat with full context — symptoms, history, follow-ups,
                                and triage in one place.
                            </p>
                        </div>
                        <span
                            className="btn btn-cobalt"
                            style={{ pointerEvents: 'none' }}
                        >
                            Open Healz AI →
                        </span>
                    </div>
                </Link>

                {/* Trust strip */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 12,
                        marginBottom: 56,
                    }}
                >
                    {TRUST_BADGES.map((b) => (
                        <div key={b.label} className="card-flat" style={{ padding: 20 }}>
                            <div
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '.10em',
                                    marginBottom: 6,
                                    fontWeight: 500,
                                }}
                            >
                                {b.sub}
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                                {b.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Next steps */}
                <section style={{ marginBottom: 48 }}>
                    <div className="kicker" style={{ marginBottom: 20 }}>
                        <span className="dot" />
                        Next steps
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: 16,
                        }}
                    >
                        <FindDoctorCTA variant="sidebar" />
                        <BookTestCTA variant="card" />
                        <Link
                            href="/medical-travel/bot"
                            className="card"
                            style={{ display: 'block', padding: 24, textDecoration: 'none' }}
                        >
                            <div
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--orange-2)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '.10em',
                                    marginBottom: 10,
                                    fontWeight: 500,
                                }}
                            >
                                Compare costs
                            </div>
                            <h3
                                className="display"
                                style={{
                                    fontSize: 20,
                                    letterSpacing: '-0.02em',
                                    fontWeight: 600,
                                    margin: '0 0 8px',
                                }}
                            >
                                Treatment abroad.
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
                                Save up to 90% on the same procedure — we handle quotes, visas, and follow-ups.
                            </p>
                            <span
                                className="mono"
                                style={{ color: 'var(--cobalt)', fontSize: 13, fontWeight: 500 }}
                            >
                                Get a free quote →
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Follow-on links */}
                <section style={{ marginBottom: 48 }}>
                    <div className="kicker" style={{ marginBottom: 20 }}>
                        <span className="dot" />
                        Or
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 16,
                        }}
                    >
                        <Link
                            href="/doctors"
                            className="card-flat"
                            style={{ display: 'block', padding: 20, textDecoration: 'none' }}
                        >
                            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.10em', marginBottom: 6 }}>
                                Talk to a person
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                                Find a verified doctor →
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
                                Matched specialists near you, by condition.
                            </p>
                        </Link>
                        <Link
                            href="/conditions"
                            className="card-flat"
                            style={{ display: 'block', padding: 20, textDecoration: 'none' }}
                        >
                            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.10em', marginBottom: 6 }}>
                                Self-serve
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                                Search by condition →
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
                                A–Z library with treatment paths and cost ranges.
                            </p>
                        </Link>
                        <Link
                            href="/blog"
                            className="card-flat"
                            style={{ display: 'block', padding: 20, textDecoration: 'none' }}
                        >
                            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.10em', marginBottom: 6 }}>
                                Read
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                                Patient guides →
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
                                Editorial-reviewed articles, written by clinicians.
                            </p>
                        </Link>
                    </div>
                </section>

                {/* Related pills */}
                <div
                    className="hairline-t"
                    style={{ paddingTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}
                >
                    {RELATED.map((r) => (
                        <Link
                            key={r.href}
                            href={r.href}
                            className="pill"
                            style={{ textDecoration: 'none' }}
                        >
                            {r.label}
                        </Link>
                    ))}
                </div>
            </div>
        </V4Page>
    );
}
