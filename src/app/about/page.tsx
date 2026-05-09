import { Metadata } from 'next';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';
import {
    generateAboutPageSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
    generateFAQSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
    title: 'About Us | aihealz | The Medical AI Concierge',
    description: 'Learn about aihealz, the AI-powered medical directory and concierge transforming patient-doctor discovery globally. Discover our mission to democratize elite healthcare.',
    keywords: 'about aihealz, medical AI, AI diagnosis, find doctors, medical travel concierge, health technology, AI healthcare startup',
    openGraph: {
        title: 'About Us | aihealz',
        description: 'Organizing the world\'s medical expertise with AI.',
        url: 'https://aihealz.com/about',
        siteName: 'aihealz',
        images: [{ url: '/og-about.jpg', width: 1200, height: 630 }],
    }
};

const aboutFaqs = [
    { question: 'What is AIHealz?', answer: 'AIHealz is an AI-powered healthcare platform that connects patients with verified doctors, hospitals, and medical information worldwide. We use advanced AI to help patients find the right specialists for their conditions.' },
    { question: 'How does AIHealz help patients?', answer: 'AIHealz helps patients by providing AI-assisted symptom analysis, connecting them with verified specialists, comparing treatment costs across countries, and facilitating medical travel for complex procedures.' },
    { question: 'Is AIHealz available globally?', answer: 'Yes, AIHealz operates globally with coverage in the USA, UK, India, Thailand, Turkey, UAE, Mexico, and many other countries. We have over 10,000 verified specialists across 500+ healthcare hubs.' },
    { question: 'How are doctors verified on AIHealz?', answer: 'All doctors on AIHealz undergo a verification process that includes license validation, credential checking, and review of their medical practice history. We partner with medical boards and hospitals to ensure accuracy.' },
];

const structuredData = [
    generateAboutPageSchema(),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
    ]),
    generateFAQSchema(aboutFaqs),
];

const STATS: Array<{ value: string; label: string }> = [
    { value: '70,000+', label: 'Conditions Covered' },
    { value: '36,000+', label: 'Verified Doctors' },
    { value: '7', label: 'Countries' },
];

const FEATURES: Array<{ kicker: string; title: string; copy: string }> = [
    {
        kicker: 'Trust',
        title: 'Verified information.',
        copy: 'Every doctor on aihealz is checked against a national medical registry. Every condition page is reviewed by a clinician before it ships.',
    },
    {
        kicker: 'Reach',
        title: 'Global coverage.',
        copy: 'Compare treatment paths and costs across the USA, UK, India, Thailand, Turkey, UAE, and Mexico — without filling out twelve forms.',
    },
];

export default function AboutPage() {
    return (
        <V4Page>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 28px 80px' }}>
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="row gap-2 mono"
                    style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 32 }}
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>About</span>
                </nav>

                {/* Hero */}
                <section className="col gap-5" style={{ marginBottom: 80, maxWidth: 1080 }}>
                    <span className="section-mark">About / our mission</span>
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
                        Connecting patients with{' '}
                        <span style={{ color: 'var(--cobalt)' }}>expert care</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 22, color: 'var(--ink-2)', maxWidth: 640, marginTop: 8 }}
                    >
                        aihealz helps you find the right specialist, understand treatment options, and
                        compare costs across countries — from initial research to booking care abroad.
                    </p>
                </section>

                {/* Stats */}
                <section style={{ marginBottom: 80 }}>
                    <div className="kicker" style={{ marginBottom: 16 }}>
                        <span className="dot" />
                        By the numbers
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {STATS.map((stat) => (
                            <div key={stat.label} className="card" style={{ padding: 32 }}>
                                <div
                                    className="display"
                                    style={{
                                        fontSize: 56,
                                        lineHeight: 1,
                                        letterSpacing: '-0.04em',
                                        fontWeight: 600,
                                        color: 'var(--ink)',
                                    }}
                                >
                                    {stat.value}
                                </div>
                                <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 12 }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Story */}
                <section className="col gap-5" style={{ marginBottom: 80, maxWidth: 760 }}>
                    <span className="section-mark">Why we built it</span>
                    <h2
                        className="display"
                        style={{
                            fontSize: 'clamp(32px, 4vw, 56px)',
                            lineHeight: 1.0,
                            letterSpacing: '-0.035em',
                            fontWeight: 600,
                            margin: 0,
                        }}
                    >
                        Finding the right doctor shouldn&apos;t take hours.
                    </h2>
                    <div className="col gap-4" style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink-2)' }}>
                        <p>
                            Traditional search engines return generic results that don&apos;t account for a
                            specialist&apos;s actual experience with your condition. Most medical content is
                            written for a crawler — not the person whose hand was shaking when they opened
                            the report.
                        </p>
                        <p>
                            aihealz was built to fix that. We index detailed information about conditions,
                            treatments, and specialists, then use AI to match patients with the right care
                            based on their specific needs and location.
                        </p>
                        <p>
                            For patients considering treatment abroad, we provide transparent cost
                            comparisons and connect them with accredited hospitals worldwide.
                        </p>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Link href="/for-doctors" className="btn btn-paper">
                            Are you a doctor? Join our network →
                        </Link>
                    </div>
                </section>

                {/* Features */}
                <section>
                    <div className="kicker" style={{ marginBottom: 16 }}>
                        <span className="dot" />
                        What we stand for
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {FEATURES.map((f) => (
                            <div key={f.title} className="card" style={{ padding: 32 }}>
                                <div
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '.10em',
                                        marginBottom: 16,
                                        fontWeight: 500,
                                    }}
                                >
                                    {f.kicker}
                                </div>
                                <h3
                                    className="display"
                                    style={{
                                        fontSize: 24,
                                        letterSpacing: '-0.02em',
                                        fontWeight: 600,
                                        margin: '0 0 8px',
                                    }}
                                >
                                    {f.title}
                                </h3>
                                <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                                    {f.copy}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </V4Page>
    );
}
