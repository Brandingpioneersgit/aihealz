'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface LabSession {
    labId: number;
    name?: string;
    email?: string;
    subscriptionTier?: string;
    token?: string;
    expiresAt?: string;
    impersonated?: boolean;
}

function LabDashboardContent() {
    const searchParams = useSearchParams();
    const isWelcome = searchParams.get('welcome') === 'true';

    const [session, setSession] = useState<LabSession | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showImpersonationBanner, setShowImpersonationBanner] = useState(false);
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(isWelcome);

    useEffect(() => {
        const sessionData = localStorage.getItem('provider_session');
        if (sessionData) {
            try {
                const parsed = JSON.parse(sessionData);
                if (parsed.labId) {
                    setSession(parsed);
                    setShowImpersonationBanner(parsed.impersonated === true);
                }
            } catch {
                // Invalid session data
            }
        }
    }, []);

    const handleExitImpersonation = () => {
        localStorage.removeItem('provider_session');
        localStorage.removeItem('provider_lab_id');
        localStorage.removeItem('admin_impersonating');
        window.close();
    };

    const sidebarItems = [
        { id: 'overview', label: 'Overview', code: 'OV' },
        { id: 'tests', label: 'Tests & pricing', code: 'TS' },
        { id: 'packages', label: 'Health packages', code: 'PK' },
        { id: 'bookings', label: 'Bookings', code: 'BK' },
        { id: 'reports', label: 'Reports', code: 'RP' },
        { id: 'reviews', label: 'Reviews', code: 'RV' },
        { id: 'settings', label: 'Settings', code: 'ST' },
    ];

    const stats = {
        todayBookings: 12,
        pendingReports: 8,
        completedToday: 18,
        averageRating: 4.6,
        monthlyRevenue: 245000,
        homeCollections: 5,
    };

    const recentBookings = [
        { id: 1, patient: 'Rahul Sharma', test: 'Complete Blood Count', time: '10:30 AM', status: 'completed' },
        { id: 2, patient: 'Priya Patel', test: 'Lipid Profile', time: '11:00 AM', status: 'in_progress' },
        { id: 3, patient: 'Amit Kumar', test: 'Full Body Checkup', time: '11:30 AM', status: 'pending' },
        { id: 4, patient: 'Sneha Reddy', test: 'Thyroid Profile', time: '12:00 PM', status: 'pending' },
        { id: 5, patient: 'Vikram Singh', test: 'HbA1c', time: '12:30 PM', status: 'pending' },
    ];

    const statusPill = (status: string) =>
        status === 'completed' ? 'pill pill-mint'
            : status === 'in_progress' ? 'pill pill-cobalt'
            : 'pill pill-lemon';

    const bannerOffset = (showImpersonationBanner || showWelcomeBanner) ? 48 : 0;

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', color: 'var(--ink)' }}>
            {showImpersonationBanner && (
                <div
                    role="alert"
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0,
                        background: 'var(--magenta)',
                        color: '#fff',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 50,
                        fontSize: 13,
                    }}
                >
                    <span style={{ fontWeight: 500 }}>
                        ⚠ Admin mode: viewing as Lab #{session?.labId}
                    </span>
                    <button
                        onClick={handleExitImpersonation}
                        style={{
                            padding: '4px 10px',
                            background: 'rgba(255,255,255,.18)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 'var(--r-2)',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Exit impersonation
                    </button>
                </div>
            )}

            {showWelcomeBanner && !showImpersonationBanner && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0,
                        background: 'var(--cobalt)',
                        color: '#fff',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 50,
                        fontSize: 13,
                    }}
                >
                    <span style={{ fontWeight: 500, flex: 1, textAlign: 'center' }}>
                        ✦ Welcome to AIHealz! Your lab profile is now live.
                    </span>
                    <button
                        onClick={() => setShowWelcomeBanner(false)}
                        aria-label="Dismiss"
                        style={{ padding: 4, background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Sidebar */}
            <aside
                style={{
                    width: 240,
                    position: 'fixed',
                    top: bannerOffset,
                    bottom: 0,
                    left: 0,
                    background: 'var(--ink)',
                    color: 'var(--paper)',
                    borderRight: '1px solid #1A3052',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #1A3052' }}>
                    <Link href="/provider/lab/dashboard" className="row ai-center gap-2" style={{ color: '#fff' }}>
                        <span className="spec-icon" style={{ background: 'var(--cobalt)', width: 28, height: 28, fontSize: 12 }}>LB</span>
                        <span className="display" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>Lab portal</span>
                    </Link>
                </div>

                <nav className="col gap-1" style={{ padding: 16 }}>
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="row ai-center gap-3"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: 13,
                                fontWeight: 500,
                                background: activeTab === item.id ? 'rgba(28, 91, 255, .14)' : 'transparent',
                                color: activeTab === item.id ? 'var(--cobalt-3)' : 'rgba(255,255,255,.65)',
                                border: '1px solid',
                                borderColor: activeTab === item.id ? 'rgba(28, 91, 255, .35)' : 'transparent',
                                borderRadius: 'var(--r-2)',
                                cursor: 'pointer',
                                textAlign: 'left',
                            }}
                        >
                            <span className="mono" style={{ fontSize: 10, opacity: 0.7, width: 20 }}>{item.code}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid #1A3052' }}>
                    <div className="row ai-center gap-3">
                        <span className="spec-icon" style={{ background: 'var(--cobalt)' }}>
                            {session?.name ? session.name.charAt(0).toUpperCase() : 'L'}
                        </span>
                        <div className="col gap-1" style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: 13, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {session?.name || 'Your Lab'}
                            </span>
                            <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {session?.subscriptionTier || 'Free'} plan
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, marginLeft: 240, paddingTop: bannerOffset }}>
                <div
                    style={{
                        height: 64,
                        background: 'var(--paper)',
                        borderBottom: '1px solid var(--rule)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 24px',
                        position: 'sticky',
                        top: bannerOffset,
                        zIndex: 30,
                    }}
                >
                    <div className="col gap-1">
                        <span className="kicker">lab portal</span>
                        <span className="display" style={{ fontSize: 16, fontWeight: 600 }}>
                            {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
                        </span>
                    </div>
                    <div className="row ai-center gap-3">
                        <button className="btn btn-ghost btn-sm" aria-label="Notifications" style={{ position: 'relative' }}>
                            🔔
                            <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 999, background: 'var(--orange)' }} />
                        </button>
                        <Link
                            href="/diagnostic-labs"
                            target="_blank"
                            className="mono"
                            style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}
                        >
                            View public page →
                        </Link>
                    </div>
                </div>

                <div style={{ padding: 24 }}>
                    {activeTab === 'overview' && (
                        <div className="col gap-5">
                            {/* Stats */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: 0,
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-3)',
                                    background: 'var(--paper)',
                                    overflow: 'hidden',
                                }}
                            >
                                {[
                                    { label: "Today's bookings", value: stats.todayBookings, code: 'BK' },
                                    { label: 'Pending reports', value: stats.pendingReports, code: 'PR' },
                                    { label: 'Completed today', value: stats.completedToday, code: 'CT' },
                                    { label: 'Average rating', value: stats.averageRating, code: '★' },
                                    { label: 'Monthly revenue', value: `₹${(stats.monthlyRevenue / 1000).toFixed(0)}K`, code: '₹' },
                                    { label: 'Home collections', value: stats.homeCollections, code: 'HM' },
                                ].map((s) => (
                                    <div key={s.label} className="col gap-2" style={{ padding: 18, borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                                        <div className="row ai-center gap-3">
                                            <span className="spec-icon" style={{ width: 32, height: 32, fontSize: 12 }}>{s.code}</span>
                                            <span className="kicker">{s.label}</span>
                                        </div>
                                        <span className="num bignum" style={{ fontSize: 24, color: 'var(--ink)' }}>{s.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Schedule */}
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <div className="row between ai-center hairline-b" style={{ padding: '16px 24px' }}>
                                    <span className="section-mark">today&apos;s schedule</span>
                                    <button className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                        View all →
                                    </button>
                                </div>
                                <div className="col">
                                    {recentBookings.map((booking, i, arr) => (
                                        <div
                                            key={booking.id}
                                            className="row between ai-center"
                                            style={{
                                                padding: '14px 24px',
                                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule-2)' : 'none',
                                            }}
                                        >
                                            <div className="row ai-center gap-3">
                                                <span className="spec-icon" aria-hidden="true">{booking.patient.charAt(0)}</span>
                                                <div className="col gap-1">
                                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{booking.patient}</span>
                                                    <span className="muted" style={{ fontSize: 12 }}>{booking.test}</span>
                                                </div>
                                            </div>
                                            <div className="row ai-center gap-3">
                                                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{booking.time}</span>
                                                <span className={statusPill(booking.status)} style={{ textTransform: 'capitalize' }}>
                                                    {booking.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
                                {[
                                    { label: 'Add new test', desc: 'Configure pricing for a new test', code: '+TS' },
                                    { label: 'Create package', desc: 'Bundle tests into a health package', code: '+PK' },
                                    { label: 'Upload reports', desc: 'Upload patient test reports', code: '↑RP' },
                                ].map((a) => (
                                    <button
                                        key={a.label}
                                        className="card row ai-start gap-3 text-left"
                                        style={{ padding: 18, cursor: 'pointer', background: 'var(--paper)' }}
                                    >
                                        <span className="spec-icon" style={{ background: 'var(--cobalt)' }}>{a.code}</span>
                                        <div className="col gap-1">
                                            <span style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</span>
                                            <span className="muted" style={{ fontSize: 12 }}>{a.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab !== 'overview' && (
                        <div className="card col ai-center" style={{ padding: 48, textAlign: 'center' }}>
                            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', margin: 0 }}>
                                {sidebarItems.find(s => s.id === activeTab)?.label || activeTab} — coming soon.
                            </p>
                            <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                                This module is not yet wired up in the lab portal.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function LabDashboardPage() {
    return (
        <Suspense
            fallback={
                <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div
                        aria-hidden="true"
                        style={{
                            width: 32, height: 32,
                            border: '2px solid var(--rule)',
                            borderTopColor: 'var(--cobalt)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            }
        >
            <LabDashboardContent />
        </Suspense>
    );
}
