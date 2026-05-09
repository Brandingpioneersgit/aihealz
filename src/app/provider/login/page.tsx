'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProviderSession {
    doctorId: string;
    doctorName: string;
    email: string;
    token: string;
    expiresAt: number;
}

export default function ProviderLoginPage() {
    const router = useRouter();
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        try {
            const sessionData = localStorage.getItem('provider_session');
            if (sessionData) {
                const session: ProviderSession = JSON.parse(sessionData);
                if (session.expiresAt > Date.now()) {
                    router.replace('/provider/dashboard');
                    return;
                } else {
                    localStorage.removeItem('provider_session');
                    localStorage.removeItem('provider_doctor_id');
                }
            }
        } catch {
            localStorage.removeItem('provider_session');
            localStorage.removeItem('provider_doctor_id');
        }
        setIsCheckingSession(false);
    }, [router]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginError(null);
        setIsLoggingIn(true);

        try {
            const res = await fetch('/api/provider/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setLoginError(data.error || 'Invalid credentials');
                setIsLoggingIn(false);
                return;
            }

            const session: ProviderSession = {
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                email: data.email,
                token: data.token,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };
            localStorage.setItem('provider_session', JSON.stringify(session));
            localStorage.setItem('provider_doctor_id', data.doctorId);
            router.replace('/provider/dashboard');
        } catch {
            setLoginError('Failed to connect. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    }

    if (isCheckingSession) {
        return (
            <main
                style={{
                    background: 'var(--bg)',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                }}
            >
                <div className="col ai-center gap-4">
                    <div
                        aria-hidden="true"
                        style={{
                            width: 32,
                            height: 32,
                            border: '2px solid var(--rule)',
                            borderTopColor: 'var(--cobalt)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                    <p
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        Checking session…
                    </p>
                </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
                        <span className="section-mark">provider sign in</span>
                        <h1
                            className="display"
                            style={{
                                fontSize: 28,
                                margin: 0,
                                fontWeight: 600,
                                letterSpacing: '-0.025em',
                            }}
                        >
                            Welcome back
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                            Sign in to access your doctor dashboard.
                        </p>
                    </div>

                    {loginError && (
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
                            ⚠ {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="col gap-3">
                        <div className="form-group">
                            <label className="form-label" htmlFor="prov-email">
                                Email
                            </label>
                            <input
                                id="prov-email"
                                type="email"
                                required
                                placeholder="doctor@clinic.com"
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="prov-password">
                                Password
                            </label>
                            <input
                                id="prov-password"
                                type="password"
                                required
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="btn btn-cobalt btn-lg"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {isLoggingIn ? 'Signing in…' : 'Sign in →'}
                        </button>
                    </form>

                    <div
                        className="hairline-t col gap-2"
                        style={{ paddingTop: 16, alignItems: 'center' }}
                    >
                        <a
                            href="/for-doctors#join-form"
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: 500,
                            }}
                        >
                            Not a provider yet? Join as doctor →
                        </a>
                        <a
                            href="/provider/forgot-password"
                            className="muted"
                            style={{ fontSize: 12 }}
                        >
                            Forgot password?
                        </a>
                    </div>
                </div>

                <div
                    className="card-quiet"
                    style={{ padding: 16, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}
                >
                    The provider dashboard is for verified healthcare professionals only. Credentials were sent when your profile was approved.
                </div>
            </div>
        </main>
    );
}
