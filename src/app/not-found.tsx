import Link from 'next/link';
import { Metadata } from 'next';
import V4Page from '@/components/v4/Shell';

export const metadata: Metadata = {
    title: 'Page not found (404)',
    description:
        "We couldn't find that page. Browse conditions, doctors, or use Healz AI to get back on track.",
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <V4Page>
            <main
                style={{
                    minHeight: 'calc(100vh - 200px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '96px clamp(16px, 4vw, 28px) 80px',
                }}
            >
                <div
                    className="col gap-6 ai-center"
                    style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}
                >
                    <span className="section-mark" style={{ alignSelf: 'center' }}>
                        Error · 404
                    </span>

                    <div
                        className="display"
                        aria-hidden
                        style={{
                            fontSize: 'clamp(120px, 18vw, 220px)',
                            lineHeight: 0.88,
                            letterSpacing: '-0.055em',
                            fontWeight: 600,
                            color: 'var(--ink)',
                            userSelect: 'none',
                        }}
                    >
                        404<span style={{ color: 'var(--orange)' }}>.</span>
                    </div>

                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(28px, 4vw, 44px)',
                            lineHeight: 1.05,
                            letterSpacing: '-0.035em',
                            fontWeight: 600,
                            margin: 0,
                            color: 'var(--ink)',
                        }}
                    >
                        We couldn&apos;t find{' '}
                        <span style={{ color: 'var(--cobalt)' }}>that page</span>.
                    </h1>

                    <p
                        className="lede"
                        style={{
                            fontSize: 18,
                            color: 'var(--ink-2)',
                            maxWidth: 540,
                            margin: 0,
                            lineHeight: 1.55,
                        }}
                    >
                        The link may be broken or the page may have moved. From here you can head home,
                        browse conditions, or ask Healz AI for help.
                    </p>

                    <div
                        className="row ai-center gap-3"
                        style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}
                    >
                        <Link href="/" className="btn btn-cobalt">
                            Back to home
                        </Link>
                        <Link href="/conditions" className="btn">
                            Browse conditions
                        </Link>
                        <Link href="/healz-ai" className="btn">
                            Ask Healz AI
                        </Link>
                    </div>

                    <div
                        className="col gap-3"
                        style={{
                            marginTop: 40,
                            paddingTop: 28,
                            borderTop: '1px solid var(--rule)',
                            width: '100%',
                            maxWidth: 480,
                        }}
                    >
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                letterSpacing: '.08em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Popular sections
                        </span>
                        <div
                            className="row ai-center gap-2"
                            style={{ flexWrap: 'wrap', justifyContent: 'center', columnGap: 14 }}
                        >
                            {[
                                { href: '/symptoms', label: 'Symptom checker' },
                                { href: '/doctors', label: 'Find doctors' },
                                { href: '/tests', label: 'Lab tests' },
                                { href: '/treatments', label: 'Treatments' },
                                { href: '/analyze', label: 'Report analysis' },
                                { href: '/contact', label: 'Contact' },
                            ].map((item, i, arr) => (
                                <span
                                    key={item.href}
                                    className="row ai-center gap-2"
                                    style={{ fontSize: 14 }}
                                >
                                    <Link
                                        href={item.href}
                                        style={{
                                            color: 'var(--cobalt)',
                                            textDecoration: 'none',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {item.label}
                                    </Link>
                                    {i < arr.length - 1 && (
                                        <span style={{ color: 'var(--ink-4)', opacity: 0.6 }}>·</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </V4Page>
    );
}
