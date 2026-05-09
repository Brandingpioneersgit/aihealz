import Link from 'next/link';
import V4Page from '@/components/v4/Shell';
import ContactForm from './ContactForm';

export default function ContactPage() {
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
                    <span style={{ color: 'var(--ink)' }}>Contact</span>
                </nav>

                {/* Hero */}
                <section className="col gap-4" style={{ marginBottom: 56, maxWidth: 880 }}>
                    <span className="section-mark">Get in touch</span>
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
                        Talk to{' '}
                        <span style={{ color: 'var(--cobalt)' }}>a human</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 20, color: 'var(--ink-2)', maxWidth: 640, marginTop: 4 }}
                    >
                        Patient support, doctor verification, partnership inquiries — we read every message
                        and reply within one working day.
                    </p>
                </section>

                {/* Trust strip */}
                <div
                    className="hairline-t hairline-b"
                    style={{
                        padding: '14px 0',
                        marginBottom: 40,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 28,
                    }}
                >
                    {[
                        '24h response',
                        'Real human replies',
                        'No marketing emails',
                        'Privacy first',
                    ].map((item) => (
                        <span
                            key={item}
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                letterSpacing: '.08em',
                                textTransform: 'uppercase',
                            }}
                        >
                            <span style={{ color: 'var(--cobalt)', marginRight: 8 }}>◆</span>
                            {item}
                        </span>
                    ))}
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 24,
                    }}
                >
                    {/* Contact info column */}
                    <div className="col gap-4">
                        <div className="card" style={{ padding: 28 }}>
                            <div
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '.10em',
                                    marginBottom: 12,
                                    fontWeight: 500,
                                }}
                            >
                                Email
                            </div>
                            <h2
                                className="display"
                                style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 600, margin: '0 0 6px' }}
                            >
                                Support &amp; inquiries
                            </h2>
                            <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 16px' }}>
                                We aim to reply within 24 hours.
                            </p>
                            <a
                                href="mailto:support@aihealz.com"
                                className="mono"
                                style={{ color: 'var(--cobalt)', fontSize: 14, fontWeight: 500 }}
                            >
                                support@aihealz.com →
                            </a>
                        </div>

                        <div className="card" style={{ padding: 28 }}>
                            <div
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '.10em',
                                    marginBottom: 12,
                                    fontWeight: 500,
                                }}
                            >
                                Office
                            </div>
                            <h2
                                className="display"
                                style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 600, margin: '0 0 6px' }}
                            >
                                Headquarters
                            </h2>
                            <address
                                style={{
                                    fontStyle: 'normal',
                                    fontSize: 14,
                                    color: 'var(--ink-2)',
                                    lineHeight: 1.6,
                                }}
                            >
                                ATZ Medappz Pvt Ltd.<br />
                                84, Supreme Coworks, Sector 32<br />
                                Gurgaon, Haryana, India
                            </address>
                        </div>
                    </div>

                    {/* Form column */}
                    <div className="card" style={{ padding: 32 }}>
                        <div
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '.10em',
                                marginBottom: 12,
                                fontWeight: 500,
                            }}
                        >
                            Send a message
                        </div>
                        <h2
                            className="display"
                            style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 600, margin: '0 0 24px' }}
                        >
                            What can we help with?
                        </h2>
                        <ContactForm />
                    </div>
                </div>
            </div>
        </V4Page>
    );
}
