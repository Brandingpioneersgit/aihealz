import Link from 'next/link';
import V4Page from '@/components/v4/Shell';

export const metadata = {
    title: 'Create an account',
    description: 'Join AIHealz to save symptom checks, manage bookings, and keep your medical records in one secure vault.',
    alternates: { canonical: '/register' },
    robots: { index: false, follow: false },
};

export default function RegisterPage() {
    return (
        <V4Page>
            <div
                style={{
                    minHeight: 'calc(100vh - 120px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '64px 24px',
                }}
            >
                <div style={{ width: '100%', maxWidth: 440 }}>
                    <div className="col gap-3" style={{ marginBottom: 24, textAlign: 'center' }}>
                        <span className="section-mark" style={{ justifyContent: 'center' }}>
                            Create account
                        </span>
                    </div>

                    <div className="card" style={{ padding: 36 }}>
                        <h1
                            className="display"
                            style={{
                                fontSize: 'clamp(28px, 4vw, 40px)',
                                lineHeight: 1.0,
                                letterSpacing: '-0.035em',
                                fontWeight: 600,
                                margin: '0 0 12px',
                            }}
                        >
                            Join{' '}
                            <span style={{ color: 'var(--cobalt)' }}>aihealz</span>
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 28px' }}>
                            Patient registration is launching soon. Until then, every public tool on the
                            site works without an account.
                        </p>

                        <div className="col gap-2">
                            <Link
                                href="/healz-ai"
                                className="btn btn-cobalt btn-lg"
                                style={{ width: '100%' }}
                            >
                                Use Healz AI now →
                            </Link>
                            <Link
                                href="/contact"
                                className="btn btn-paper btn-lg"
                                style={{ width: '100%' }}
                            >
                                Request early access
                            </Link>
                        </div>

                        <div
                            className="row ai-center gap-3"
                            style={{ margin: '28px 0 20px' }}
                        >
                            <div className="hairline" style={{ flex: 1 }} />
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    letterSpacing: '.10em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Or
                            </span>
                            <div className="hairline" style={{ flex: 1 }} />
                        </div>

                        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 8px' }}>
                            Healthcare provider?{' '}
                            <Link
                                href="/provider/login"
                                style={{ color: 'var(--cobalt)', fontWeight: 500 }}
                            >
                                Provider sign-in →
                            </Link>
                        </p>
                        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
                            Already have access?{' '}
                            <Link
                                href="/login"
                                style={{ color: 'var(--cobalt)', fontWeight: 500 }}
                            >
                                Sign in →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </V4Page>
    );
}
