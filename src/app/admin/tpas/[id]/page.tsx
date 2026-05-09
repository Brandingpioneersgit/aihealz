'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Tpa {
    id: number;
    slug: string;
    name: string;
    shortName?: string;
    tpaType: string;
    description?: string;
    logo?: string;
    website?: string;
    customerCarePhone?: string;
    claimHelpline?: string;
    email?: string;
    headquartersCity?: string;
    operatingCountries: string[];
    operatingStates: string[];
    operatingCities: string[];
    licenseNumber?: string;
    regulatoryBody?: string;
    establishedYear?: number;
    networkHospitalsCount?: number;
    livesManaged?: number;
    rating?: number;
    reviewCount: number;
    isActive: boolean;
    insuranceLinks: Array<{
        insurer: { id: number; name: string; logo?: string };
        isExclusive: boolean;
    }>;
    hospitalLinks: Array<{ id: number; isCashless: boolean }>;
    geographyPresence: Array<{
        geography: { id: number; name: string };
        isMainOffice: boolean;
    }>;
}

const tpaTypeLabels: Record<string, string> = {
    private: 'Private',
    public: 'Public',
    government: 'Government',
};

export default function TpaDetailPage() {
    const params = useParams();
    const [tpa, setTpa] = useState<Tpa | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'insurers' | 'presence'>('overview');

    const fetchTpa = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/tpas/${params.id}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setTpa(data);
            }
        } catch (error) {
            console.error('Failed to fetch TPA:', error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchTpa();
    }, [fetchTpa]);

    if (loading) {
        return (
            <div className="row ai-center center" style={{ height: 256 }}>
                <span
                    style={{
                        width: 24, height: 24, borderRadius: 999,
                        border: '3px solid var(--rule)', borderTopColor: 'var(--cobalt)',
                        animation: 'spin 0.8s linear infinite', display: 'inline-block',
                    }}
                />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (!tpa) {
        return (
            <div className="col ai-center gap-3" style={{ padding: 48, textAlign: 'center' }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    TPA not found
                </span>
                <Link href="/admin/tpas" className="btn btn-paper">← Back to TPAs</Link>
            </div>
        );
    }

    const statCards: Array<{ label: string; value: string; code: string }> = [
        { label: 'Rating', value: tpa.rating ? Number(tpa.rating).toFixed(1) : 'N/A', code: '★' },
        { label: 'Insurance Partners', value: (tpa.insuranceLinks?.length || 0).toLocaleString(), code: 'IN' },
        { label: 'Network Hospitals', value: tpa.networkHospitalsCount?.toLocaleString() || 'N/A', code: 'HO' },
        { label: 'Lives Managed', value: tpa.livesManaged ? `${(tpa.livesManaged / 100000).toFixed(1)}L` : 'N/A', code: 'LM' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <Link
                href="/admin/tpas"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to TPAs
            </Link>

            <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="row ai-center gap-4">
                    {tpa.logo ? (
                        <img src={tpa.logo} alt={tpa.name} style={{ width: 64, height: 64, borderRadius: 'var(--r-3)', objectFit: 'contain', border: '1px solid var(--rule)', background: 'var(--paper)', padding: 4 }} />
                    ) : (
                        <div className="spec-icon" style={{ width: 64, height: 64, fontSize: 28 }}>{tpa.name.charAt(0)}</div>
                    )}
                    <div className="col gap-2">
                        <span className="section-mark">admin / tpas / {tpa.name}</span>
                        <h1
                            className="display"
                            style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                        >
                            {tpa.name}<span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                            <span className="pill">{tpaTypeLabels[tpa.tpaType] || tpa.tpaType}</span>
                            <span className={tpa.isActive ? 'pill pill-mint' : 'pill pill-orange'}>
                                {tpa.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                            {tpa.headquartersCity}
                            {tpa.establishedYear && ` · Est. ${tpa.establishedYear}`}
                        </span>
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 0,
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--r-3)',
                    background: 'var(--paper)',
                    overflow: 'hidden',
                }}
            >
                {statCards.map((s) => (
                    <div
                        key={s.label}
                        className="col gap-2"
                        style={{
                            padding: 20,
                            borderRight: '1px solid var(--rule)',
                            borderBottom: '1px solid var(--rule)',
                            background: 'var(--paper)',
                        }}
                    >
                        <div className="row ai-center gap-3">
                            <span className="spec-icon" aria-hidden="true">{s.code}</span>
                            <span className="kicker">{s.label}</span>
                        </div>
                        <div className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="row gap-1 hairline-b">
                {[
                    { key: 'overview' as const, label: 'Overview' },
                    { key: 'insurers' as const, label: `Insurers (${tpa.insuranceLinks?.length || 0})` },
                    { key: 'presence' as const, label: `Presence (${tpa.geographyPresence?.length || 0})` },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="mono"
                        style={{
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.key ? '2px solid var(--cobalt)' : '2px solid transparent',
                            color: activeTab === tab.key ? 'var(--cobalt)' : 'var(--ink-3)',
                            fontSize: 12,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            cursor: 'pointer',
                            marginBottom: -1,
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                    <div className="card col gap-3" style={{ padding: 24 }}>
                        <span className="section-mark">tpa details</span>
                        {tpa.description && (
                            <div className="col gap-1">
                                <span className="kicker">Description</span>
                                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{tpa.description}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2" style={{ gap: 12 }}>
                            {[
                                { label: 'License Number', value: tpa.licenseNumber },
                                { label: 'Regulatory Body', value: tpa.regulatoryBody },
                                { label: 'Customer Care', value: tpa.customerCarePhone },
                                { label: 'Claim Helpline', value: tpa.claimHelpline },
                                { label: 'Email', value: tpa.email },
                            ].map((row) => (
                                <div key={row.label} className="col gap-1">
                                    <span className="kicker">{row.label}</span>
                                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>{row.value || '—'}</span>
                                </div>
                            ))}
                            <div className="col gap-1">
                                <span className="kicker">Website</span>
                                {tpa.website ? (
                                    <a href={tpa.website} target="_blank" rel="noopener" style={{ fontSize: 13, color: 'var(--cobalt)' }}>
                                        Visit
                                    </a>
                                ) : (
                                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>—</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card col gap-3" style={{ padding: 24 }}>
                        <span className="section-mark">operating areas</span>
                        {tpa.operatingStates && tpa.operatingStates.length > 0 && (
                            <div className="col gap-2">
                                <span className="kicker">States ({tpa.operatingStates.length})</span>
                                <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                    {tpa.operatingStates.slice(0, 8).map((state) => (
                                        <span key={state} className="pill">{state}</span>
                                    ))}
                                    {tpa.operatingStates.length > 8 && (
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            +{tpa.operatingStates.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        {tpa.operatingCities && tpa.operatingCities.length > 0 && (
                            <div className="col gap-2">
                                <span className="kicker">Cities ({tpa.operatingCities.length})</span>
                                <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                    {tpa.operatingCities.slice(0, 8).map((city) => (
                                        <span key={city} className="pill pill-magenta">{city}</span>
                                    ))}
                                    {tpa.operatingCities.length > 8 && (
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            +{tpa.operatingCities.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'insurers' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {tpa.insuranceLinks && tpa.insuranceLinks.length > 0 ? (
                        <div className="col">
                            {tpa.insuranceLinks.map((link, i) => (
                                <div key={i} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    <div className="row ai-center gap-3">
                                        {link.insurer.logo ? (
                                            <img src={link.insurer.logo} alt={link.insurer.name} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'contain', border: '1px solid var(--rule)' }} />
                                        ) : (
                                            <span className="spec-icon" aria-hidden="true">{link.insurer.name.charAt(0)}</span>
                                        )}
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{link.insurer.name}</span>
                                    </div>
                                    {link.isExclusive && <span className="pill pill-orange">Exclusive</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No insurance partnerships
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'presence' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {tpa.geographyPresence && tpa.geographyPresence.length > 0 ? (
                        <div className="col">
                            {tpa.geographyPresence.map((presence, i) => (
                                <div key={i} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{presence.geography.name}</span>
                                    {presence.isMainOffice && <span className="pill pill-magenta">Main Office</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No geographic presence data
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
