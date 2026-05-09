'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Provider Forgot Password Page
 *
 * Allows providers to request a password reset link via email.
 */
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/provider/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to send reset link');
                setLoading(false);
                return;
            }

            setSuccess(true);
        } catch {
            setError('Failed to connect. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <main
                style={{
                    background: 'var(--bg)',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '64px 24px',
                }}
            >
                <div style={{ width: '100%', maxWidth: 420 }} className="col gap-4">
                    <div className="card col gap-5" style={{ padding: 32 }}>
                        <div className="col ai-center gap-3 text-center">
                            <span className="spec-icon" style={{ background: 'var(--mint)', width: 56, height: 56, fontSize: 24 }}>✓</span>
                            <h1 className="display" style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                                Check your email
                            </h1>
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                If an account exists with <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{email}</span>, you will receive a password reset link within a few minutes.
                            </p>
                        </div>

                        <div className="col gap-3 ai-center">
                            <p className="muted" style={{ fontSize: 12, textAlign: 'center', margin: 0 }}>
                                Did not receive the email? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail('');
                                }}
                                className="btn btn-ghost btn-sm"
                            >
                                Try a different email
                            </button>
                        </div>

                        <div className="hairline-t" style={{ paddingTop: 16, textAlign: 'center' }}>
                            <Link
                                href="/provider/login"
                                className="mono"
                                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}
                            >
                                ← Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main
            style={{
                background: 'var(--bg)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px',
            }}
        >
            <div style={{ width: '100%', maxWidth: 420 }} className="col gap-4">
                <div className="card col gap-5" style={{ padding: 32 }}>
                    <div className="col gap-2 ai-start">
                        <span className="section-mark">provider / reset password</span>
                        <h1
                            className="display"
                            style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}
                        >
                            Reset password<span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                            Enter your email address and we will send you a link to reset your password.
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="card-flat"
                            style={{
                                padding: 12,
                                borderColor: 'rgba(255, 90, 46, .35)',
                                background: 'var(--orange-50)',
                                color: 'var(--orange-2)',
                                fontSize: 13,
                            }}
                        >
                            ⚠ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="col gap-3">
                        <div className="form-group">
                            <label className="form-label" htmlFor="prov-email">Email address</label>
                            <input
                                id="prov-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="doctor@clinic.com"
                                autoComplete="email"
                                className="input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-cobalt btn-lg"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {loading ? 'Sending…' : 'Send reset link →'}
                        </button>
                    </form>

                    <div className="hairline-t" style={{ paddingTop: 16, textAlign: 'center' }}>
                        <Link
                            href="/provider/login"
                            className="mono"
                            style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}
                        >
                            ← Back to login
                        </Link>
                    </div>
                </div>

                <div className="card-quiet" style={{ padding: 16, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
                    For security, the reset link will expire in 1 hour. If you continue to have issues, please contact support.
                </div>
            </div>
        </main>
    );
}
