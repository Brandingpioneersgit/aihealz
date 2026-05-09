import Link from 'next/link';
import V4Page from '@/components/v4/Shell';

export const metadata = {
    title: 'Help Center',
    description: 'Find answers, reach support, and get the most out of AIHealz — symptom checking, vault, bookings, and provider tools.',
    alternates: { canonical: '/help' },
    openGraph: {
        title: 'AIHealz Help Center',
        description: 'Help articles and support for AIHealz patients and providers.',
        url: '/help',
        type: 'website',
    },
};

const TOPICS = [
    {
        heading: 'Getting started',
        items: [
            { label: 'How AIHealz works', href: '/about' },
            { label: 'Try the symptom checker', href: '/healz-ai' },
            { label: 'Browse conditions', href: '/conditions' },
        ],
    },
    {
        heading: 'For patients',
        items: [
            { label: 'Patient vault & records', href: '/vault' },
            { label: 'Find a doctor', href: '/doctors' },
            { label: 'Book a diagnostic test', href: '/tests' },
            { label: 'Compare hospitals', href: '/hospitals' },
        ],
    },
    {
        heading: 'For providers',
        items: [
            { label: 'Join as a doctor', href: '/for-doctors' },
            { label: 'Provider sign-in', href: '/provider/login' },
            { label: 'Pricing for providers', href: '/for-doctors/pricing' },
        ],
    },
    {
        heading: 'Account & policies',
        items: [
            { label: 'Frequently asked questions', href: '/faq' },
            { label: 'Privacy policy', href: '/privacy' },
            { label: 'Terms of service', href: '/terms' },
            { label: 'Contact support', href: '/contact' },
        ],
    },
];

export default function HelpPage() {
    return (
        <V4Page>
            <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 28px 80px' }}>
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="row gap-2 mono"
                    style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 32 }}
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>Help</span>
                </nav>

                {/* Hero */}
                <section className="col gap-4" style={{ marginBottom: 56, maxWidth: 880 }}>
                    <span className="section-mark">Help center</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 6vw, 88px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            fontWeight: 600,
                            margin: 0,
                        }}
                    >
                        Quick answers<span style={{ color: 'var(--cobalt)' }}>,</span> direct{' '}
                        <span style={{ color: 'var(--cobalt)' }}>links</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 20, color: 'var(--ink-2)', maxWidth: 640, marginTop: 4 }}
                    >
                        Everything on aihealz, indexed by what you came here for. Can&apos;t find what you
                        need?{' '}
                        <Link
                            href="/contact"
                            style={{ color: 'var(--cobalt)', fontWeight: 500 }}
                        >
                            Talk to our team →
                        </Link>
                    </p>
                </section>

                {/* Topic grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16,
                    }}
                >
                    {TOPICS.map(({ heading, items }) => (
                        <section key={heading} className="card" style={{ padding: 28 }}>
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
                                {heading}
                            </div>
                            <ul className="clean col">
                                {items.map(({ label, href }, i) => (
                                    <li
                                        key={href}
                                        style={{
                                            borderTop: i === 0 ? 'none' : '1px solid var(--rule)',
                                        }}
                                    >
                                        <Link
                                            href={href}
                                            className="row between ai-center"
                                            style={{
                                                padding: '14px 0',
                                                fontSize: 15,
                                                color: 'var(--ink)',
                                                fontWeight: 500,
                                            }}
                                        >
                                            <span>{label}</span>
                                            <span style={{ color: 'var(--cobalt)', fontSize: 14 }}>→</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                {/* Footer CTA */}
                <div
                    className="card-flat"
                    style={{
                        marginTop: 32,
                        padding: 24,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                    }}
                >
                    <div>
                        <div
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '.10em',
                                marginBottom: 6,
                            }}
                        >
                            Still stuck?
                        </div>
                        <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
                            We answer real emails within one working day.
                        </p>
                    </div>
                    <Link href="/contact" className="btn btn-cobalt">
                        Contact support →
                    </Link>
                </div>
            </div>
        </V4Page>
    );
}
