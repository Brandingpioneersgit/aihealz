'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function LoadingState({ label }: { label: string }) {
    return (
        <main
            style={{
                background: 'var(--bg)',
                color: 'var(--ink)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div className="col gap-2 ai-center" style={{ textAlign: 'center' }}>
                <span
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--cobalt)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    ● working
                </span>
                <p
                    className="display"
                    style={{
                        fontSize: 24,
                        fontWeight: 500,
                        letterSpacing: '-0.025em',
                        color: 'var(--ink-3)',
                        margin: 0,
                    }}
                >
                    {label}
                    <span style={{ color: 'var(--cobalt)' }}>…</span>
                </p>
            </div>
        </main>
    );
}

function DoctorsJoinSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const plan = searchParams.get('plan');
    const [, setVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If no session_id, redirect to for-doctors registration page
        if (!sessionId) {
            window.location.href = '/for-doctors#join-form';
            return;
        }

        // Verify the session with our backend
        async function verifySession() {
            try {
                const res = await fetch(`/api/verify-checkout?session_id=${sessionId}`);
                if (res.ok) {
                    setVerified(true);
                } else {
                    setError('Unable to verify payment. Please contact support.');
                }
            } catch {
                setError('Unable to verify payment. Please contact support.');
            } finally {
                setLoading(false);
            }
        }

        verifySession();
    }, [sessionId]);

    // Don't show loading spinner if there's no session_id - we're redirecting
    if (!sessionId) {
        return <LoadingState label="Redirecting to registration" />;
    }

    if (loading) {
        return <LoadingState label="Verifying your payment" />;
    }

    if (error) {
        return (
            <main
                style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}
            >
                <div
                    style={{ maxWidth: 540, margin: '0 auto', padding: '64px 28px 96px' }}
                    className="col gap-5"
                >
                    <span className="section-mark">verification issue</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(32px, 5vw, 48px)',
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Something didn&rsquo;t line up
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 17, maxWidth: 480 }}
                    >
                        {error}
                    </p>
                    <div className="row">
                        <Link
                            href="/contact?subject=Payment%20Verification%20Issue"
                            className="btn btn-cobalt"
                        >
                            Contact support →
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const planName = plan === 'enterprise' ? 'Enterprise' : 'Premium';

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
            <div
                style={{ maxWidth: 720, margin: '0 auto', padding: '64px 28px 96px' }}
                className="col gap-6"
            >
                {/* Hero */}
                <header className="col gap-4">
                    <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                        <span className="pill pill-mint">
                            <span className="pill-dot" style={{ background: 'var(--mint)' }} />
                            subscription active
                        </span>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            plan · {planName.toLowerCase()}
                        </span>
                    </div>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 6vw, 72px)',
                            lineHeight: 0.98,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Welcome to{' '}
                        <span style={{ color: 'var(--cobalt)' }}>{planName}</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', maxWidth: 560 }}
                    >
                        Your subscription is now live. You have access to enhanced visibility,
                        priority ranking, and lead credits across the {planName} tier.
                    </p>
                </header>

                {/* Next steps */}
                <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="hairline-b" style={{ padding: '16px 24px' }}>
                        <span className="kicker">
                            <span className="dot" />
                            next steps
                        </span>
                    </div>
                    <ol className="clean col">
                        {[
                            'Complete your doctor profile with qualifications and specialties',
                            'Add your clinic address and contact information',
                            'Upload your license documents for verification',
                            'Start receiving patient leads and inquiries',
                        ].map((step, i, arr) => (
                            <li
                                key={i}
                                className="row gap-3 ai-baseline"
                                style={{
                                    padding: '16px 24px',
                                    borderBottom:
                                        i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                }}
                            >
                                <span
                                    className="num"
                                    style={{
                                        fontSize: 16,
                                        color: 'var(--cobalt)',
                                        fontWeight: 500,
                                        minWidth: 26,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span
                                    style={{
                                        fontSize: 14,
                                        color: 'var(--ink-2)',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {step}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Actions */}
                <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                    <Link
                        href="/provider/dashboard"
                        className="btn btn-cobalt btn-lg"
                        style={{ flex: '1 1 220px', justifyContent: 'center' }}
                    >
                        Go to dashboard →
                    </Link>
                    <Link
                        href="/for-doctors"
                        className="btn btn-paper btn-lg"
                        style={{ flex: '1 1 180px', justifyContent: 'center' }}
                    >
                        Learn more
                    </Link>
                </div>

                <p
                    className="muted"
                    style={{ fontSize: 13, textAlign: 'center', margin: 0 }}
                >
                    A confirmation email has been sent to your registered address.
                </p>
            </div>
        </main>
    );
}

export default function DoctorsJoinSuccessPage() {
    return (
        <Suspense fallback={<LoadingState label="Loading" />}>
            <DoctorsJoinSuccessContent />
        </Suspense>
    );
}
