"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Admin session interface
interface AdminSession {
    email: string;
    token: string;
    expiresAt: number;
}

/* ── SVG Icon helper ────────────────────────────────────────── */
function Icon({ d, className = '' }: { d: string; className?: string }) {
    return (
        <svg className={`w-4 h-4 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    );
}

/* ── Sidebar nav config ─────────────────────────────────────── */
const navItems = [
    {
        section: 'Overview',
        items: [
            { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { name: 'Geography', href: '/admin/geography', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ]
    },
    {
        section: 'Content Management',
        items: [
            { name: 'Conditions', href: '/admin/conditions', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { name: 'Treatments', href: '/admin/treatments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { name: 'Locations', href: '/admin/locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
            { name: 'Languages', href: '/admin/languages', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
            { name: 'Localized Content', href: '/admin/content', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        ]
    },
    {
        section: 'Provider Network',
        items: [
            { name: 'Doctors', href: '/admin/doctors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { name: 'Hospitals', href: '/admin/hospitals', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { name: 'Verification Queue', href: '/admin/verification', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Subscriptions', href: '/admin/subscriptions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        ]
    },
    {
        section: 'Insurance & TPAs',
        items: [
            { name: 'Insurance Providers', href: '/admin/insurance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { name: 'Insurance Plans', href: '/admin/insurance/plans', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { name: 'TPAs', href: '/admin/tpas', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        ]
    },
    {
        section: 'Diagnostics',
        items: [
            { name: 'Tests & Scans', href: '/admin/diagnostics/tests', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
            { name: 'Diagnostic Labs', href: '/admin/diagnostics/providers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { name: 'Test Bookings', href: '/admin/diagnostics/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { name: 'Health Packages', href: '/admin/diagnostics/packages', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        ]
    },
    {
        section: 'Leads & Enquiries',
        items: [
            { name: 'All Leads', href: '/admin/leads', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { name: 'Encounters', href: '/admin/encounters', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            { name: 'Analysis Reports', href: '/admin/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        ]
    },
    {
        section: 'SEO & Growth',
        items: [
            { name: 'Content Health', href: '/admin/content-health', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { name: 'Sitemap Monitor', href: '/admin/sitemap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
            { name: 'Keyword Gaps', href: '/admin/keywords', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
            { name: 'Batch Generator', href: '/admin/trigger-batch', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { name: 'Translation Queue', href: '/admin/translation-queue', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
        ]
    },
    {
        section: 'Advertising',
        items: [
            { name: 'Ad Dashboard', href: '/admin/advertising', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
            { name: 'Campaigns', href: '/admin/advertising/campaigns', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { name: 'Advertisers', href: '/admin/advertising/advertisers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { name: 'Creatives', href: '/admin/advertising/creatives', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { name: 'Ad Enquiries', href: '/admin/advertising/enquiries', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { name: 'Pricing', href: '/admin/advertising/pricing', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Reports', href: '/admin/advertising/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        ]
    },
    {
        section: 'Site Configuration',
        items: [
            { name: 'Navigation', href: '/admin/navigation', icon: 'M4 6h16M4 12h16M4 18h16' },
            { name: 'SEO Settings', href: '/admin/seo-settings', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
            { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
        ]
    },
];

// Admin Login Form Component
function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Authentication failed');
                setLoading(false);
                return;
            }

            const session: AdminSession = {
                email: data.email,
                token: data.token,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000),
            };
            localStorage.setItem('admin_session', JSON.stringify(session));
            onSuccess();
        } catch {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                background: 'var(--bg)',
            }}
        >
            <div style={{ width: '100%', maxWidth: 420 }}>
                <div className="card" style={{ padding: 36 }}>
                    <div className="col gap-2" style={{ marginBottom: 28 }}>
                        <span className="section-mark">admin / sign in</span>
                        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                            <span style={{ color: 'var(--cobalt)' }}>aihealz</span> admin
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                            Sign in to access the admin panel.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="col gap-4">
                        {error && (
                            <div className="card-quiet" style={{ padding: 12, borderLeft: '3px solid var(--orange)' }}>
                                <span style={{ fontSize: 13, color: 'var(--orange-2)' }}>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="admin-email">Email</label>
                            <input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="admin@aihealz.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="admin-password">Password</label>
                            <input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-cobalt btn-lg"
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <div className="hairline" style={{ margin: '24px 0 16px' }} />
                    <p className="kicker" style={{ textAlign: 'center', margin: 0 }}>
                        protected area · unauthorized access prohibited
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const sessionStr = localStorage.getItem('admin_session');
                if (!sessionStr) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                const session: AdminSession = JSON.parse(sessionStr);

                if (session.expiresAt < Date.now()) {
                    localStorage.removeItem('admin_session');
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                if (!session.token || !session.email) {
                    localStorage.removeItem('admin_session');
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                setIsAuthenticated(true);
                setIsLoading(false);
            } catch {
                localStorage.removeItem('admin_session');
                setIsAuthenticated(false);
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [pathname]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="col ai-center gap-3">
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            border: '2px solid var(--rule)',
                            borderTopColor: 'var(--cobalt)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }}
                    />
                    <span className="kicker">loading admin console</span>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLoginForm onSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(10, 26, 47, 0.5)',
                        zIndex: 40,
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                style={{
                    width: 280,
                    background: 'var(--ink)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: '100%',
                    zIndex: 50,
                    transition: 'transform 300ms ease',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {/* Brand */}
                <div
                    className="row between ai-center"
                    style={{
                        height: 64,
                        padding: '0 22px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0,
                    }}
                >
                    <Link href="/admin" className="row gap-2 ai-center">
                        <span
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 'var(--r-2)',
                                background: 'var(--cobalt)',
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--display)',
                                fontWeight: 600,
                                fontSize: 13,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            AH
                        </span>
                        <span style={{ color: 'var(--paper)', fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>
                            aihealz<span style={{ color: 'var(--ink-4)', fontWeight: 400, marginLeft: 4 }}>cms</span>
                        </span>
                    </Link>
                    <button
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.6)',
                            padding: 4,
                        }}
                        aria-label="Close sidebar"
                    >
                        <Icon d="M6 18L18 6M6 6l12 12" />
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }} className="col gap-5">
                    {navItems.map((section) => (
                        <div key={section.section} className="col gap-1">
                            <div
                                className="mono"
                                style={{
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,0.4)',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    fontWeight: 500,
                                    padding: '6px 10px 4px',
                                }}
                            >
                                {section.section}
                            </div>
                            <div className="col" style={{ gap: 1 }}>
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="row gap-3 ai-center"
                                            style={{
                                                padding: '8px 10px',
                                                borderRadius: 'var(--r-2)',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: active ? 'var(--cobalt-3)' : 'rgba(255,255,255,0.72)',
                                                background: active ? 'rgba(77, 125, 255, 0.12)' : 'transparent',
                                                border: active ? '1px solid rgba(77, 125, 255, 0.25)' : '1px solid transparent',
                                                transition: 'background var(--transition-fast), color var(--transition-fast)',
                                            }}
                                        >
                                            <Icon d={item.icon} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User footer */}
                <div
                    style={{
                        padding: 16,
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0,
                    }}
                >
                    <div className="row gap-3 ai-center" style={{ padding: '0 4px' }}>
                        <span
                            className="spec-icon"
                            aria-hidden="true"
                            style={{ background: 'var(--cobalt)' }}
                        >
                            SA
                        </span>
                        <div className="col" style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Super Admin
                            </span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                                admin@aihealz.com
                            </span>
                        </div>
                        <Link
                            href="/admin/settings"
                            style={{ color: 'rgba(255,255,255,0.6)' }}
                            aria-label="Settings"
                        >
                            <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="lg:pl-[280px]" style={{ flex: 1, minWidth: 0 }}>
                {/* Top header */}
                <div
                    className="row between ai-center"
                    style={{
                        height: 64,
                        background: 'var(--paper)',
                        borderBottom: '1px solid var(--rule)',
                        padding: '0 24px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 30,
                    }}
                >
                    <div className="row gap-3 ai-center">
                        <button
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--ink-2)',
                                padding: 8,
                            }}
                            aria-label="Open sidebar"
                        >
                            <Icon d="M4 6h16M4 12h16M4 18h16" className="w-6 h-6" />
                        </button>
                        <span className="kicker hidden sm:inline-flex">admin panel · console</span>
                    </div>
                    <div className="row gap-3 ai-center">
                        <span className="pill pill-mint">
                            <span className="pill-dot" style={{ background: 'var(--mint)' }} />
                            live
                        </span>
                        <Link
                            href="/"
                            target="_blank"
                            className="btn btn-paper btn-sm"
                        >
                            View site →
                        </Link>
                    </div>
                </div>

                {/* Page content */}
                <div style={{ padding: '24px' }} className="lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
