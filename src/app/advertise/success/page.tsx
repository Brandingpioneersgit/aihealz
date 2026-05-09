import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Thank you | aihealz advertising',
    description: 'Your advertising enquiry has been submitted successfully.',
    robots: 'noindex, nofollow',
};

const STEPS = [
    {
        n: '01',
        title: 'Review',
        body: 'Our team reviews your requirements and matches you with the right advertising solutions.',
    },
    {
        n: '02',
        title: 'Discovery call',
        body: "We'll schedule a brief call to understand your goals and recommend the best approach.",
    },
    {
        n: '03',
        title: 'Campaign setup',
        body: "Once approved, we'll help you set up your first campaign and start reaching patients.",
    },
];

export default function AdvertiseSuccessPage() {
    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }} className="col gap-6">
                {/* Breadcrumb */}
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        flexWrap: 'wrap',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/advertise" style={{ color: 'var(--ink-3)' }}>Advertise</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>Submitted</span>
                </nav>

                <div className="card col gap-5 ai-center" style={{ padding: 48, textAlign: 'center' }}>
                    {/* Mint check mark */}
                    <div
                        className="row ai-center center"
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 'var(--r-2)',
                            background: 'var(--mint-50)',
                            border: '1px solid rgba(40, 212, 168, .30)',
                        }}
                        aria-hidden="true"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mint-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <span className="pill pill-mint">
                        <span className="pill-dot" style={{ background: 'var(--mint)' }} aria-hidden="true" />
                        Submitted
                    </span>

                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(32px, 5vw, 48px)',
                            margin: 0,
                            fontWeight: 600,
                            letterSpacing: '-0.035em',
                            lineHeight: 1.05,
                        }}
                    >
                        Thank you<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>

                    <p className="lede" style={{ fontSize: 17, margin: 0, maxWidth: 520 }}>
                        Your advertising enquiry has been received. Our team will review your submission and reach out within{' '}
                        <span style={{ color: 'var(--cobalt)', fontWeight: 500 }}>24 hours</span>.
                    </p>
                </div>

                {/* What's next */}
                <section className="card col" style={{ padding: 0 }} aria-labelledby="next-heading">
                    <div className="hairline-b" style={{ padding: '20px 24px' }}>
                        <span className="section-mark">what happens next</span>
                        <h2
                            id="next-heading"
                            className="display"
                            style={{ fontSize: 20, fontWeight: 600, margin: '8px 0 0', letterSpacing: '-0.02em' }}
                        >
                            Three steps from here.
                        </h2>
                    </div>
                    <ol className="clean col">
                        {STEPS.map((s, i) => (
                            <li
                                key={s.n}
                                className={`row gap-4 ai-start ${i < STEPS.length - 1 ? 'hairline-b' : ''}`}
                                style={{ padding: '20px 24px' }}
                            >
                                <span
                                    className="num"
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--cobalt)',
                                        minWidth: 28,
                                        fontWeight: 500,
                                    }}
                                >
                                    {s.n}
                                </span>
                                <div className="col gap-1">
                                    <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{s.title}</span>
                                    <span className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>{s.body}</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Contact */}
                <p className="muted" style={{ fontSize: 14, margin: 0, textAlign: 'center' }}>
                    Questions in the meantime? Email{' '}
                    <a href="mailto:ads@aihealz.com" style={{ color: 'var(--cobalt)' }}>
                        ads@aihealz.com
                    </a>
                </p>

                {/* CTAs */}
                <div className="row gap-3 center" style={{ flexWrap: 'wrap' }}>
                    <Link href="/" className="btn btn-cobalt btn-lg">
                        Explore aihealz →
                    </Link>
                    <Link href="/advertise" className="btn btn-paper btn-lg">
                        Back to advertising
                    </Link>
                </div>
            </div>
        </main>
    );
}
