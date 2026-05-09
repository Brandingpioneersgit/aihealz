'use client';

import { useState, useEffect } from 'react';
import { ProviderAuthGate, providerLogout } from '@/components/provider/AuthGate';

/**
 * Doctor Portal Dashboard
 *
 * Bureau-styled dashboard. Shows: leads, analytics, profile, subscription status.
 * Protected by ProviderAuthGate.
 */

interface Lead {
    id: string;
    intentLevel: string;
    intentScore: number | null;
    conditionSlug: string;
    specialtyMatched: string;
    geography: string | null;
    summary: string | null;
    urgency: string | null;
    isViewed: boolean;
    contactRevealed: boolean;
    createdAt: string;
}

interface DashboardData {
    leads: {
        leads: Lead[];
        pagination: { total: number; totalPages: number };
        unviewedCount: number;
    };
    analytics: {
        profileViews: number;
        searchAppearances: number;
        totalLeads: number;
        contactReveals: number;
        teleconsults: number;
    };
    badge: { score: number; rank: number | null; label: string | null } | null;
    doctor: { name: string; tier: string } | null;
}

interface ProfileData {
    profile: {
        id: number;
        slug: string;
        name: string;
        bio: string | null;
        experienceYears: number | null;
        qualifications: string[];
        email: string;
        phone: string;
        city: string;
        specialty: string;
        clinicName: string;
        clinicAddress: string | null;
        websiteUrl: string | null;
        consultationFee: number | null;
        teleconsultFee: number | null;
        availableHours: string;
        languages: string[];
        education: Array<{ degree: string; institution: string; year?: number }>;
        certifications: string[];
    };
    subscription: {
        tier: string;
        isPremium: boolean;
        plan: string;
        status: string;
        conditionsUsed: number;
        leadCreditsUsed: number;
        leadCreditsTotal: number;
        periodEnd: string | null;
    };
    features: {
        maxConditions: number;
        leadCreditsPerMonth: number;
        canShowWebsite: boolean;
        canShowClinicAddress: boolean;
        canShowPhone: boolean;
        canEditBio: boolean;
        hasAnalytics: boolean;
        hasTelelink: boolean;
        priorityListing: boolean;
        aiPoweredBio: boolean;
        leadScoring: boolean;
    };
    meta: {
        isVerified: boolean;
        badgeScore: number;
        badgeLabel: string | null;
        profileCompletion: number;
        createdAt: string;
    };
}

type TabType = 'leads' | 'analytics' | 'profile' | 'subscription';

export default function ProviderDashboard() {
    return (
        <ProviderAuthGate>
            {({ doctorId, doctorName }) => (
                <DashboardContent initialDoctorId={doctorId} initialDoctorName={doctorName} />
            )}
        </ProviderAuthGate>
    );
}

interface DashboardContentProps {
    initialDoctorId: string;
    initialDoctorName: string;
}

function getAuthToken(): string | null {
    try {
        const sessionData = localStorage.getItem('provider_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            if (session.expiresAt > Date.now()) {
                return session.token;
            }
        }
    } catch {
        // Invalid session
    }
    return null;
}

function DashboardContent({ initialDoctorId }: DashboardContentProps) {
    const [doctorId] = useState<string>(initialDoctorId);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('upgraded') === 'true') {
            setSuccessMessage('Successfully upgraded! Your new features are now active.');
            setTimeout(() => setSuccessMessage(null), 5000);
            window.history.replaceState({}, '', '/provider/dashboard');
        }
    }, []);

    const [tab, setTab] = useState<TabType>('leads');
    const [data, setData] = useState<DashboardData | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [intentFilter, setIntentFilter] = useState<string>('');
    const [revealingLead, setRevealingLead] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Record<string, unknown>>({});
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        fetchDashboard();
        fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intentFilter, doctorId]);

    async function fetchDashboard() {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/provider/login';
                return;
            }

            const params = new URLSearchParams({ doctorId });
            if (intentFilter) params.set('intent', intentFilter);
            const res = await fetch(`/api/provider/leads?${params}`, {
                headers: { 'X-Provider-Token': token },
            });

            if (res.status === 401) {
                localStorage.removeItem('provider_session');
                localStorage.removeItem('provider_doctor_id');
                window.location.href = '/provider/login';
                return;
            }

            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchProfile() {
        setProfileLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/provider/login';
                return;
            }

            const res = await fetch(`/api/provider/profile?doctorId=${doctorId}`, {
                headers: { 'X-Provider-Token': token },
            });

            if (res.status === 401) {
                localStorage.removeItem('provider_session');
                localStorage.removeItem('provider_doctor_id');
                window.location.href = '/provider/login';
                return;
            }

            const json = await res.json();
            setProfileData(json);
            setProfileForm({
                name: json.profile?.name || '',
                phone: json.profile?.phone || '',
                city: json.profile?.city || '',
                specialty: json.profile?.specialty || '',
                clinicName: json.profile?.clinicName || '',
                experienceYears: json.profile?.experienceYears || '',
                bio: json.profile?.bio || '',
                websiteUrl: json.profile?.websiteUrl || '',
                clinicAddress: json.profile?.clinicAddress || '',
                consultationFee: json.profile?.consultationFee || '',
                teleconsultFee: json.profile?.teleconsultFee || '',
                availableHours: json.profile?.availableHours || '',
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setProfileLoading(false);
        }
    }

    async function saveProfile() {
        setSavingProfile(true);
        try {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/provider/login';
                return;
            }

            const res = await fetch('/api/provider/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Provider-Token': token },
                body: JSON.stringify({
                    doctorId: parseInt(doctorId, 10),
                    ...profileForm,
                    experienceYears: profileForm.experienceYears ? parseInt(String(profileForm.experienceYears), 10) : undefined,
                    consultationFee: profileForm.consultationFee ? parseInt(String(profileForm.consultationFee), 10) : undefined,
                    teleconsultFee: profileForm.teleconsultFee ? parseInt(String(profileForm.teleconsultFee), 10) : undefined,
                }),
            });
            const json = await res.json();
            if (res.ok) {
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
                setEditingProfile(false);
                await fetchProfile();
                await fetchDashboard();
            } else {
                setErrorMessage(json.error || 'Failed to update profile');
                setTimeout(() => setErrorMessage(null), 5000);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            setErrorMessage('Failed to save profile. Please try again.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleRevealContact(leadId: string) {
        setRevealingLead(leadId);
        try {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/provider/login';
                return;
            }

            const res = await fetch('/api/provider/leads/reveal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Provider-Token': token },
                body: JSON.stringify({ leadId, doctorId }),
            });
            if (res.ok) {
                await fetchDashboard();
            } else {
                const error = await res.json();
                setErrorMessage(error.message || 'Failed to reveal contact. You may not have enough credits.');
                setTimeout(() => setErrorMessage(null), 5000);
            }
        } catch (error) {
            console.error('Failed to reveal contact:', error);
            setErrorMessage('Failed to reveal contact. Please try again.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setRevealingLead(null);
        }
    }

    function handleTeleLink(leadId: string) {
        window.open(`/provider/telelink?leadId=${leadId}`, '_blank');
    }

    function handleUpgrade(plan: string) {
        if (plan === 'Enterprise' || plan === 'Contact Sales') {
            window.location.href = '/contact?subject=Enterprise%20Plan%20Inquiry';
        } else {
            window.location.href = `/provider/subscribe?plan=${plan.toLowerCase()}`;
        }
    }

    const intentPill = (lvl: string) =>
        lvl === 'high' ? 'pill pill-mint' : lvl === 'medium' ? 'pill pill-lemon' : 'pill';

    const navItems: { id: TabType; label: string; code: string; badge?: number }[] = [
        { id: 'leads', label: 'Active leads', code: 'LD', badge: data?.leads.unviewedCount },
        { id: 'profile', label: 'My profile', code: 'PR' },
        { id: 'analytics', label: 'Performance', code: 'AN' },
        { id: 'subscription', label: 'Subscription', code: 'SB' },
    ];

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', color: 'var(--ink)' }}>
            {/* Toasts */}
            {errorMessage && (
                <div
                    role="alert"
                    className="card-flat row ai-center gap-2"
                    style={{
                        position: 'fixed',
                        top: 16, right: 16,
                        zIndex: 50,
                        padding: '12px 16px',
                        borderColor: 'rgba(255, 90, 46, .35)',
                        background: 'var(--orange-50)',
                        color: 'var(--orange-2)',
                        fontSize: 13,
                        maxWidth: 420,
                    }}
                >
                    ⚠ {errorMessage}
                </div>
            )}
            {successMessage && (
                <div
                    role="status"
                    className="card-flat row ai-center gap-2"
                    style={{
                        position: 'fixed',
                        top: 16, right: 16,
                        zIndex: 50,
                        padding: '12px 16px',
                        borderColor: 'rgba(40, 212, 168, .35)',
                        background: 'var(--mint-50)',
                        color: 'var(--mint-3)',
                        fontSize: 13,
                        maxWidth: 420,
                    }}
                >
                    ✓ {successMessage}
                </div>
            )}

            {/* Sidebar */}
            <aside style={{ width: 240, flexShrink: 0, background: 'var(--paper)', borderRight: '1px solid var(--rule)', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="row ai-center gap-3">
                    <span className="spec-icon" style={{ background: 'var(--cobalt)' }}>DR</span>
                    <div className="col gap-1" style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data?.doctor?.name || 'Doctor portal'}</span>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {data?.doctor?.tier || 'Free'} plan
                        </span>
                    </div>
                </div>

                {data?.badge?.label && (
                    <div className="card-flat row ai-center gap-2" style={{ padding: '8px 12px', borderColor: 'rgba(40, 212, 168, .35)', background: 'var(--mint-50)' }}>
                        <span style={{ color: 'var(--mint-3)', fontSize: 12 }}>★</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--mint-3)' }}>{data.badge.label} in your city</span>
                    </div>
                )}

                <nav className="col gap-1" style={{ flex: 1 }}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className="row ai-center gap-3"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: 13,
                                fontWeight: 500,
                                background: tab === item.id ? 'var(--cobalt-50)' : 'transparent',
                                color: tab === item.id ? 'var(--cobalt)' : 'var(--ink-2)',
                                border: 'none',
                                borderRadius: 'var(--r-2)',
                                cursor: 'pointer',
                                textAlign: 'left',
                            }}
                        >
                            <span className="mono" style={{ fontSize: 10, opacity: 0.7, width: 22 }}>{item.code}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.badge && item.badge > 0 && <span className="pill pill-cobalt">{item.badge}</span>}
                        </button>
                    ))}
                </nav>

                <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                    📹 Tele-Link settings
                </button>
                <button
                    onClick={providerLogout}
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: 'flex-start', color: 'var(--orange-2)' }}
                >
                    ↗ Sign out
                </button>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: 32, overflow: 'auto' }} className="col gap-6">
                {loading ? (
                    <div className="row center ai-center" style={{ height: 256 }}>
                        <div
                            aria-hidden="true"
                            style={{ width: 32, height: 32, border: '2px solid var(--rule)', borderTopColor: 'var(--cobalt)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}
                        />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : (
                    <>
                        {/* Stats strip */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: 0,
                                border: '1px solid var(--rule)',
                                borderRadius: 'var(--r-3)',
                                background: 'var(--paper)',
                                overflow: 'hidden',
                            }}
                        >
                            {[
                                { label: 'Profile views', value: data?.analytics.profileViews || 0, code: 'PV' },
                                { label: 'Search hits', value: data?.analytics.searchAppearances || 0, code: 'SH' },
                                { label: 'Total leads', value: data?.analytics.totalLeads || 0, code: 'LD' },
                                { label: 'Contacts', value: data?.analytics.contactReveals || 0, code: 'CT' },
                                { label: 'Teleconsults', value: data?.analytics.teleconsults || 0, code: 'TC' },
                            ].map((s) => (
                                <div key={s.label} className="col gap-2" style={{ padding: 16, borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                                    <div className="row ai-center gap-2">
                                        <span className="spec-icon" style={{ width: 28, height: 28, fontSize: 11 }}>{s.code}</span>
                                        <span className="kicker">{s.label}</span>
                                    </div>
                                    <span className="num bignum" style={{ fontSize: 22, color: 'var(--ink)' }}>{s.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Leads */}
                        {tab === 'leads' && (
                            <div className="col gap-4">
                                <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                                    <h2 className="display row ai-center gap-2" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>
                                        Active leads
                                    </h2>
                                    <div className="row gap-2">
                                        {['', 'high', 'medium', 'low'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setIntentFilter(f)}
                                                className={intentFilter === f ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                                style={{ textTransform: 'capitalize' }}
                                            >
                                                {f || 'All'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col gap-3">
                                    {data?.leads.leads.map((lead) => (
                                        <div
                                            key={lead.id}
                                            className="card"
                                            style={{
                                                padding: 20,
                                                borderLeft: !lead.isViewed ? '2px solid var(--cobalt)' : '1px solid var(--rule)',
                                            }}
                                        >
                                            <div className="row between ai-start" style={{ gap: 16, flexWrap: 'wrap' }}>
                                                <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                                                        <span className={intentPill(lead.intentLevel)}>
                                                            {lead.intentLevel} intent
                                                        </span>
                                                        {lead.urgency && lead.urgency !== 'routine' && (
                                                            <span className="pill pill-orange">⚠ {lead.urgency}</span>
                                                        )}
                                                        {!lead.isViewed && <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>● New</span>}
                                                    </div>
                                                    <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>
                                                        {lead.summary || `Patient seeking ${lead.specialtyMatched} for ${lead.conditionSlug}`}
                                                    </p>
                                                    <div className="row ai-center gap-4 mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                                        {lead.geography && <span>📍 {lead.geography}</span>}
                                                        <span>⏱ {new Date(lead.createdAt).toLocaleDateString()}</span>
                                                        {lead.intentScore && <span>Score: {(lead.intentScore * 100).toFixed(0)}%</span>}
                                                    </div>
                                                </div>

                                                <div className="col ai-end gap-2">
                                                    {lead.contactRevealed ? (
                                                        <button
                                                            onClick={() => window.open(`tel:+${lead.id}`, '_self')}
                                                            className="btn btn-sm"
                                                            style={{ background: 'var(--mint-50)', color: 'var(--mint-3)', borderColor: 'rgba(40, 212, 168, .35)' }}
                                                        >
                                                            ☎ Contact
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRevealContact(lead.id)}
                                                            disabled={revealingLead === lead.id}
                                                            className="btn btn-cobalt btn-sm"
                                                        >
                                                            {revealingLead === lead.id ? 'Revealing…' : '◉ Reveal (1 credit)'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleTeleLink(lead.id)}
                                                        className="btn btn-paper btn-sm"
                                                    >
                                                        📹 Tele-Link
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {(!data?.leads.leads || data.leads.leads.length === 0) && (
                                        <div className="card col ai-center gap-3" style={{ padding: 64, textAlign: 'center' }}>
                                            <span className="spec-icon" style={{ width: 48, height: 48, fontSize: 18 }}>LD</span>
                                            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                                                No leads yet. As patients search for your specialty in your area, leads will appear here.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Analytics */}
                        {tab === 'analytics' && (
                            <div className="col gap-5">
                                <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Search performance</h2>
                                <div className="card col ai-center gap-2" style={{ padding: 32, textAlign: 'center' }}>
                                    <p className="muted" style={{ fontSize: 14, margin: 0 }}>Performance charts will be populated once you have 7+ days of data.</p>
                                    <p className="muted" style={{ fontSize: 12, margin: 0 }}>Profile views, search appearances, and lead conversion rate over time.</p>
                                </div>

                                {data?.badge && (
                                    <div className="card col gap-3" style={{ padding: 24 }}>
                                        <span className="section-mark">specialist ranking</span>
                                        <div className="row ai-center gap-4">
                                            <div style={{ position: 'relative', width: 80, height: 80 }}>
                                                <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--rule)" strokeWidth="2" />
                                                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--mint)" strokeWidth="2"
                                                        strokeDasharray={`${data.badge.score} ${100 - data.badge.score}`} strokeLinecap="round" />
                                                </svg>
                                                <span className="num" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
                                                    {data.badge.score.toFixed(0)}
                                                </span>
                                            </div>
                                            <div className="col gap-1">
                                                <span style={{ fontWeight: 500 }}>{data.badge.label || 'Unranked'}</span>
                                                <span className="muted" style={{ fontSize: 12 }}>
                                                    Based on profile completeness, ratings, reviews, and lead outcomes.
                                                </span>
                                                <span className="muted" style={{ fontSize: 12 }}>
                                                    ★ Complete your profile to improve your score.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile */}
                        {tab === 'profile' && (
                            <div className="col gap-5">
                                <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                                    <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>My profile</h2>
                                    {!editingProfile ? (
                                        <button onClick={() => setEditingProfile(true)} className="btn btn-cobalt btn-sm">✎ Edit profile</button>
                                    ) : (
                                        <div className="row gap-2">
                                            <button onClick={() => setEditingProfile(false)} className="btn btn-paper btn-sm">× Cancel</button>
                                            <button
                                                onClick={saveProfile}
                                                disabled={savingProfile}
                                                className="btn btn-cobalt btn-sm"
                                            >
                                                {savingProfile ? 'Saving…' : '✓ Save changes'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {profileLoading ? (
                                    <div className="row center ai-center" style={{ height: 256 }}>
                                        <div
                                            aria-hidden="true"
                                            style={{ width: 32, height: 32, border: '2px solid var(--rule)', borderTopColor: 'var(--cobalt)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}
                                        />
                                    </div>
                                ) : profileData && (
                                    <>
                                        {/* Completion + preview */}
                                        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                            <div className="card col gap-3" style={{ padding: 20 }}>
                                                <div className="row between ai-center">
                                                    <span className="kicker">Profile completion</span>
                                                    <span className="num bignum" style={{ fontSize: 24, color: 'var(--cobalt)' }}>{profileData.meta.profileCompletion}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: 6, background: 'var(--bg-2)', borderRadius: 999, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${profileData.meta.profileCompletion}%`, background: 'var(--cobalt)' }} />
                                                </div>
                                                <p className="muted" style={{ fontSize: 12, margin: 0 }}>
                                                    Complete your profile to improve visibility in search results.
                                                </p>
                                            </div>
                                            <div className="card row between ai-center" style={{ padding: 20 }}>
                                                <div className="col gap-1">
                                                    <span className="kicker">Your public profile</span>
                                                    <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                                                        healz.ai/doctor/{profileData.profile.slug}
                                                    </span>
                                                </div>
                                                <a href={`/doctor/${profileData.profile.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-paper btn-sm">
                                                    ◉ Preview
                                                </a>
                                            </div>
                                        </div>

                                        {/* Feature status */}
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                                gap: 0,
                                                border: '1px solid var(--rule)',
                                                borderRadius: 'var(--r-3)',
                                                background: 'var(--paper)',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {[
                                                { label: 'Conditions', used: profileData.subscription.conditionsUsed, max: profileData.features.maxConditions, code: 'CO' },
                                                { label: 'Lead credits', used: profileData.subscription.leadCreditsUsed, max: profileData.subscription.leadCreditsTotal, code: 'LD' },
                                                { label: 'Analytics', enabled: profileData.features.hasAnalytics, code: 'AN' },
                                                { label: 'Tele-Link', enabled: profileData.features.hasTelelink, code: 'TL' },
                                            ].map((feat) => (
                                                <div key={feat.label} className="col gap-2" style={{ padding: 16, borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                                                    <div className="row ai-center gap-2">
                                                        <span className="spec-icon" style={{ width: 24, height: 24, fontSize: 10 }}>{feat.code}</span>
                                                        <span className="kicker">{feat.label}</span>
                                                    </div>
                                                    {'max' in feat ? (
                                                        <span className="num" style={{ fontSize: 14, fontWeight: 600 }}>{feat.used} / {feat.max}</span>
                                                    ) : (
                                                        <span className={feat.enabled ? 'pill pill-mint' : 'pill'}>
                                                            {feat.enabled ? '✓ Enabled' : '🔒 Premium'}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Basic info */}
                                        <div className="card col gap-4" style={{ padding: 24 }}>
                                            <span className="section-mark">basic information</span>
                                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                                <div className="form-group">
                                                    <label className="form-label">Full name</label>
                                                    {editingProfile ? (
                                                        <input type="text" value={String(profileForm.name || '')} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>{profileData.profile.name}</p>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Email</label>
                                                    <p className="muted" style={{ fontSize: 14, margin: 0 }}>{profileData.profile.email}</p>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label row ai-center gap-1">
                                                        Phone {!profileData.features.canShowPhone && <span style={{ color: 'var(--lemon-2)' }}>🔒</span>}
                                                    </label>
                                                    {editingProfile ? (
                                                        <input type="tel" value={String(profileForm.phone || '')} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>
                                                            {profileData.profile.phone || <span className="muted">Not set</span>}
                                                            {!profileData.features.canShowPhone && profileData.profile.phone && (
                                                                <span style={{ fontSize: 12, color: 'var(--lemon-2)', marginLeft: 8 }}>(Hidden on profile)</span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Years of experience</label>
                                                    {editingProfile ? (
                                                        <input type="number" min="0" max="80" value={String(profileForm.experienceYears || '')} onChange={(e) => setProfileForm({ ...profileForm, experienceYears: e.target.value })} className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>{profileData.profile.experienceYears || <span className="muted">Not set</span>} years</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Practice details */}
                                        <div className="card col gap-4" style={{ padding: 24 }}>
                                            <span className="section-mark">practice details</span>
                                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                                <div className="form-group">
                                                    <label className="form-label">Specialty</label>
                                                    {editingProfile ? (
                                                        <input type="text" value={String(profileForm.specialty || '')} onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })} className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>{profileData.profile.specialty || <span className="muted">Not set</span>}</p>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">City</label>
                                                    {editingProfile ? (
                                                        <input type="text" value={String(profileForm.city || '')} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>{profileData.profile.city || <span className="muted">Not set</span>}</p>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Clinic / hospital name</label>
                                                    {editingProfile ? (
                                                        <input type="text" value={String(profileForm.clinicName || '')} onChange={(e) => setProfileForm({ ...profileForm, clinicName: e.target.value })} className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>{profileData.profile.clinicName || <span className="muted">Not set</span>}</p>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Consultation fee (₹)</label>
                                                    {editingProfile ? (
                                                        <input type="number" min="0" value={String(profileForm.consultationFee || '')} onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })} className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>
                                                            {profileData.profile.consultationFee ? `₹${profileData.profile.consultationFee.toLocaleString()}` : <span className="muted">Not set</span>}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Premium features */}
                                        <div className="card col gap-4" style={{ padding: 24, borderColor: !profileData.subscription.isPremium ? 'rgba(230, 185, 40, .40)' : 'var(--rule)' }}>
                                            <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                                                <span className="section-mark">premium features</span>
                                                {!profileData.subscription.isPremium && (
                                                    <button onClick={() => handleUpgrade('premium')} className="btn btn-sm" style={{ background: 'var(--lemon-50)', color: '#8C6A00', borderColor: 'rgba(230, 185, 40, .40)' }}>
                                                        ★ Upgrade to unlock
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                                <div className="form-group">
                                                    <label className="form-label row ai-center gap-1">
                                                        🌐 Website URL {!profileData.features.canShowWebsite && <span style={{ color: 'var(--lemon-2)' }}>🔒</span>}
                                                    </label>
                                                    {editingProfile && profileData.features.canShowWebsite ? (
                                                        <input type="url" value={String(profileForm.websiteUrl || '')} onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })} placeholder="https://your-website.com" className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>
                                                            {profileData.features.canShowWebsite
                                                                ? (profileData.profile.websiteUrl || <span className="muted">Not set</span>)
                                                                : <span className="muted">Upgrade to Premium to add website</span>}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label row ai-center gap-1">
                                                        📍 Clinic address {!profileData.features.canShowClinicAddress && <span style={{ color: 'var(--lemon-2)' }}>🔒</span>}
                                                    </label>
                                                    {editingProfile && profileData.features.canShowClinicAddress ? (
                                                        <input type="text" value={String(profileForm.clinicAddress || '')} onChange={(e) => setProfileForm({ ...profileForm, clinicAddress: e.target.value })} placeholder="Full clinic address" className="input" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>
                                                            {profileData.features.canShowClinicAddress
                                                                ? (profileData.profile.clinicAddress || <span className="muted">Not set</span>)
                                                                : <span className="muted">Upgrade to show full address</span>}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                                    <label className="form-label row ai-center gap-1">
                                                        Bio / about {!profileData.features.canEditBio && <span style={{ color: 'var(--lemon-2)' }}>🔒</span>}
                                                    </label>
                                                    {editingProfile && profileData.features.canEditBio ? (
                                                        <textarea value={String(profileForm.bio || '')} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={4} maxLength={2000} placeholder="Tell patients about your experience, approach to care, and specializations…" className="textarea" />
                                                    ) : (
                                                        <p style={{ fontSize: 14, margin: 0 }}>
                                                            {profileData.features.canEditBio
                                                                ? (profileData.profile.bio || <span className="muted">Not set</span>)
                                                                : <span className="muted">Upgrade to Premium to add a detailed bio</span>}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {!profileData.subscription.isPremium && (
                                                <div
                                                    className="card-flat col gap-2"
                                                    style={{ padding: 16, marginTop: 8, borderColor: 'rgba(230, 185, 40, .40)', background: 'var(--lemon-50)' }}
                                                >
                                                    <p style={{ fontSize: 13, color: '#8C6A00', margin: 0, fontWeight: 500 }}>Upgrade to Premium to unlock:</p>
                                                    <div className="grid grid-cols-2" style={{ gap: 8, fontSize: 12, color: '#8C6A00' }}>
                                                        {[
                                                            'Display website URL on profile',
                                                            'Show full clinic address',
                                                            'Add detailed bio',
                                                            'Display phone number',
                                                            'Priority search listing',
                                                            '50 lead credits/month',
                                                            '15 condition specialties',
                                                            'Full analytics dashboard',
                                                            'Tele-Link video consults',
                                                            'AI-powered profile optimization',
                                                        ].map((feat) => (
                                                            <div key={feat} className="row ai-center gap-2">
                                                                <span>✓</span> {feat}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Subscription */}
                        {tab === 'subscription' && (
                            <div className="col gap-5">
                                <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Subscription &amp; billing</h2>

                                {profileData?.subscription && (
                                    <div className="card row between ai-center" style={{ padding: 20, flexWrap: 'wrap', gap: 16 }}>
                                        <div className="row ai-center gap-4">
                                            <span className="spec-icon" style={{ background: profileData.subscription.isPremium ? 'var(--lemon-2)' : 'var(--ink-4)', width: 44, height: 44 }}>★</span>
                                            <div className="col gap-1">
                                                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{profileData.subscription.tier} plan</span>
                                                <span className="muted" style={{ fontSize: 12 }}>
                                                    {profileData.subscription.periodEnd ? `Renews ${new Date(profileData.subscription.periodEnd).toLocaleDateString()}` : 'No expiration'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col ai-end gap-1">
                                            <span className="kicker">Lead credits</span>
                                            <span className="num bignum" style={{ fontSize: 22 }}>
                                                {profileData.subscription.leadCreditsUsed} / {profileData.subscription.leadCreditsTotal}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Plan comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                                    {[
                                        {
                                            name: 'Free',
                                            price: '₹0',
                                            priceNote: 'forever',
                                            features: [
                                                { text: 'Basic profile listing', included: true },
                                                { text: '2 condition specialties', included: true },
                                                { text: '5 lead credits/month', included: true },
                                                { text: 'Community search listing', included: true },
                                                { text: 'Website URL on profile', included: false },
                                                { text: 'Full clinic address', included: false },
                                                { text: 'Phone number display', included: false },
                                                { text: 'Custom bio', included: false },
                                                { text: 'Analytics dashboard', included: false },
                                                { text: 'Tele-Link video consults', included: false },
                                            ],
                                            cta: 'Current Plan',
                                            isActive: data?.doctor?.tier === 'free',
                                        },
                                        {
                                            name: 'Premium',
                                            price: '₹4,999',
                                            priceNote: '/month',
                                            features: [
                                                { text: 'Priority profile listing', included: true },
                                                { text: '15 condition specialties', included: true },
                                                { text: '50 lead credits/month', included: true },
                                                { text: 'Top of search results', included: true },
                                                { text: 'Website URL on profile', included: true },
                                                { text: 'Full clinic address', included: true },
                                                { text: 'Phone number display', included: true },
                                                { text: 'Custom bio with AI assist', included: true },
                                                { text: 'Full analytics dashboard', included: true },
                                                { text: 'Tele-Link video consults', included: true },
                                            ],
                                            cta: 'Upgrade Now',
                                            isActive: data?.doctor?.tier === 'premium',
                                            highlighted: true,
                                        },
                                        {
                                            name: 'Enterprise',
                                            price: '₹19,999',
                                            priceNote: '/month',
                                            features: [
                                                { text: 'Featured "Top Doctor" badge', included: true },
                                                { text: 'Unlimited condition specialties', included: true },
                                                { text: '500 lead credits/month', included: true },
                                                { text: 'Guaranteed top 3 in search', included: true },
                                                { text: 'All Premium features', included: true },
                                                { text: 'Dedicated account manager', included: true },
                                                { text: 'Custom branding options', included: true },
                                                { text: 'Multi-location support', included: true },
                                                { text: 'API access & integrations', included: true },
                                                { text: 'Priority support (24/7)', included: true },
                                            ],
                                            cta: 'Contact Sales',
                                            isActive: data?.doctor?.tier === 'enterprise',
                                        },
                                    ].map((plan) => (
                                        <div
                                            key={plan.name}
                                            className="card col gap-3"
                                            style={{
                                                padding: 24,
                                                position: 'relative',
                                                borderColor: plan.isActive ? 'var(--mint)' : plan.highlighted ? 'var(--cobalt)' : 'var(--rule)',
                                                borderWidth: plan.isActive || plan.highlighted ? 2 : 1,
                                            }}
                                        >
                                            {plan.highlighted && (
                                                <span
                                                    className="pill pill-cobalt"
                                                    style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}
                                                >
                                                    Most popular
                                                </span>
                                            )}
                                            <div className="col gap-1">
                                                <span className="display" style={{ fontSize: 18, fontWeight: 600 }}>{plan.name}</span>
                                                <span className="num bignum" style={{ fontSize: 28 }}>
                                                    {plan.price}
                                                    <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-4)', letterSpacing: 'normal' }}> {plan.priceNote}</span>
                                                </span>
                                            </div>
                                            <ul className="clean col gap-2">
                                                {plan.features.map((f) => (
                                                    <li key={f.text} className="row ai-center gap-2" style={{ fontSize: 13, color: f.included ? 'var(--ink-2)' : 'var(--ink-4)' }}>
                                                        <span style={{ color: f.included ? 'var(--mint-3)' : 'var(--ink-5)' }}>{f.included ? '✓' : '×'}</span>
                                                        {f.text}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                onClick={() => !plan.isActive && handleUpgrade(plan.name)}
                                                disabled={plan.isActive}
                                                className={plan.isActive ? 'btn btn-sm' : plan.highlighted ? 'btn btn-cobalt' : 'btn btn-paper'}
                                                style={{
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    background: plan.isActive ? 'var(--mint-50)' : undefined,
                                                    color: plan.isActive ? 'var(--mint-3)' : undefined,
                                                    borderColor: plan.isActive ? 'rgba(40, 212, 168, .35)' : undefined,
                                                }}
                                            >
                                                {plan.isActive ? '✓ Current plan' : plan.cta}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* FAQ */}
                                <div className="card col gap-4" style={{ padding: 24 }}>
                                    <span className="section-mark">frequently asked questions</span>
                                    <div className="col gap-3">
                                        <div className="col gap-1">
                                            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>What are lead credits?</p>
                                            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                                                Lead credits let you reveal contact information for patients who are searching for specialists in your area. Each reveal costs 1 credit.
                                            </p>
                                        </div>
                                        <div className="col gap-1">
                                            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Can I change plans anytime?</p>
                                            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                                                Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing cycle.
                                            </p>
                                        </div>
                                        <div className="col gap-1">
                                            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>What payment methods do you accept?</p>
                                            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                                                We accept all major credit/debit cards, UPI, and net banking through our secure payment partner Razorpay.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
