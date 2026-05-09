'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface InsuranceProvider {
    id: number;
    slug: string;
    name: string;
    shortName?: string;
    providerType: string;
    description?: string;
    logo?: string;
    headquartersCountry?: string;
    headquartersCity?: string;
    website?: string;
    customerCarePhone?: string;
    claimPhone?: string;
    email?: string;
    operatingCountries: string[];
    operatingStates: string[];
    licenseNumber?: string;
    regulatoryBody?: string;
    establishedYear?: number;
    claimSettlementRatio?: number;
    rating?: number;
    reviewCount: number;
    isActive: boolean;
    stats: {
        totalClaims: number;
        totalClaimAmount: number;
        totalApprovedAmount: number;
        networkHospitals: number;
        activePlans: number;
    };
    plans: Array<{
        id: number;
        name: string;
        planType: string;
        basePremium?: number;
        sumInsured?: number;
        isActive: boolean;
    }>;
    hospitalTies: Array<{
        hospital: { id: number; name: string; city?: string; logo?: string };
        isCashless: boolean;
    }>;
    tpaAssociations: Array<{
        tpa: { id: number; name: string; logo?: string };
    }>;
}

const providerTypeLabels: Record<string, string> = {
    private: 'Private',
    public: 'Public Sector',
    general: 'General',
    health: 'Health Only',
    standalone_health: 'Standalone Health',
};

export default function InsuranceDetailPage() {
    const params = useParams();
    const [provider, setProvider] = useState<InsuranceProvider | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'hospitals' | 'tpas'>('overview');

    const fetchProvider = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/insurance/${params.id}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setProvider(data);
            }
        } catch (error) {
            console.error('Failed to fetch provider:', error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchProvider();
    }, [fetchProvider]);

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

    if (!provider) {
        return (
            <div className="col ai-center gap-3" style={{ padding: 48, textAlign: 'center' }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Insurance provider not found
                </span>
                <Link href="/admin/insurance" className="btn btn-paper">← Back to Providers</Link>
            </div>
        );
    }

    const csr = provider.claimSettlementRatio ? Number(provider.claimSettlementRatio) : null;

    const statCards: Array<{ label: string; value: string; code: string }> = [
        { label: 'CSR', value: csr !== null ? `${csr.toFixed(1)}%` : 'N/A', code: 'CSR' },
        { label: 'Rating', value: provider.rating ? Number(provider.rating).toFixed(1) : 'N/A', code: '★' },
        { label: 'Active Plans', value: provider.stats.activePlans.toLocaleString(), code: 'PL' },
        { label: 'Network Hospitals', value: provider.stats.networkHospitals.toLocaleString(), code: 'HO' },
        { label: 'Total Claims', value: provider.stats.totalClaims.toLocaleString(), code: 'CL' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <Link
                href="/admin/insurance"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to insurance
            </Link>

            <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="row ai-center gap-4">
                    {provider.logo ? (
                        <img src={provider.logo} alt={provider.name} style={{ width: 64, height: 64, borderRadius: 'var(--r-3)', objectFit: 'contain', border: '1px solid var(--rule)', background: 'var(--paper)', padding: 4 }} />
                    ) : (
                        <div className="spec-icon" style={{ width: 64, height: 64, fontSize: 28 }}>{provider.name.charAt(0)}</div>
                    )}
                    <div className="col gap-2">
                        <span className="section-mark">admin / insurance / {provider.name}</span>
                        <h1
                            className="display"
                            style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                        >
                            {provider.name}<span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                            <span className="pill">{providerTypeLabels[provider.providerType] || provider.providerType}</span>
                            <span className={provider.isActive ? 'pill pill-mint' : 'pill pill-orange'}>
                                {provider.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                            {provider.headquartersCity}{provider.headquartersCountry && `, ${provider.headquartersCountry}`}
                            {provider.establishedYear && ` · Est. ${provider.establishedYear}`}
                        </span>
                    </div>
                </div>
                <Link href={`/insurance/${provider.slug}`} target="_blank" className="btn btn-paper">
                    View ↗
                </Link>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
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
                    { key: 'plans' as const, label: `Plans (${provider.plans.length})` },
                    { key: 'hospitals' as const, label: `Hospitals (${provider.hospitalTies.length})` },
                    { key: 'tpas' as const, label: `TPAs (${provider.tpaAssociations.length})` },
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
                        <span className="section-mark">provider details</span>
                        {provider.description && (
                            <div className="col gap-1">
                                <span className="kicker">Description</span>
                                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{provider.description}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2" style={{ gap: 12 }}>
                            {[
                                { label: 'License Number', value: provider.licenseNumber },
                                { label: 'Regulatory Body', value: provider.regulatoryBody },
                                { label: 'Customer Care', value: provider.customerCarePhone },
                                { label: 'Claim Helpline', value: provider.claimPhone },
                                { label: 'Email', value: provider.email },
                            ].map((row) => (
                                <div key={row.label} className="col gap-1">
                                    <span className="kicker">{row.label}</span>
                                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>{row.value || '—'}</span>
                                </div>
                            ))}
                            <div className="col gap-1">
                                <span className="kicker">Website</span>
                                {provider.website ? (
                                    <a href={provider.website} target="_blank" rel="noopener" style={{ fontSize: 13, color: 'var(--cobalt)' }}>
                                        Visit
                                    </a>
                                ) : (
                                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>—</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card col gap-3" style={{ padding: 24 }}>
                        <span className="section-mark">coverage areas</span>
                        {provider.operatingCountries.length > 0 && (
                            <div className="col gap-2">
                                <span className="kicker">Countries</span>
                                <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                    {provider.operatingCountries.map((country) => (
                                        <span key={country} className="pill pill-cobalt">{country}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {provider.operatingStates.length > 0 && (
                            <div className="col gap-2">
                                <span className="kicker">States</span>
                                <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                    {provider.operatingStates.slice(0, 10).map((state) => (
                                        <span key={state} className="pill">{state}</span>
                                    ))}
                                    {provider.operatingStates.length > 10 && (
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            +{provider.operatingStates.length - 10} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card col gap-3 lg:col-span-2" style={{ padding: 24 }}>
                        <span className="section-mark">claims summary</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
                            <div className="card-flat col gap-1" style={{ padding: 16, background: 'var(--bg-2)' }}>
                                <span className="kicker">Total Claims</span>
                                <span className="num bignum" style={{ fontSize: 24, color: 'var(--ink)' }}>
                                    {provider.stats.totalClaims.toLocaleString()}
                                </span>
                            </div>
                            <div className="card-flat col gap-1" style={{ padding: 16, background: 'var(--bg-2)' }}>
                                <span className="kicker">Total Claim Amount</span>
                                <span className="num bignum" style={{ fontSize: 24, color: 'var(--ink)' }}>
                                    ₹{(provider.stats.totalClaimAmount / 100000).toFixed(1)}L
                                </span>
                            </div>
                            <div className="card-flat col gap-1" style={{ padding: 16, background: 'var(--mint-50)', borderColor: 'rgba(40, 212, 168, .30)' }}>
                                <span className="kicker">Approved Amount</span>
                                <span className="num bignum" style={{ fontSize: 24, color: 'var(--mint-3)' }}>
                                    ₹{(provider.stats.totalApprovedAmount / 100000).toFixed(1)}L
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'plans' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {provider.plans.length > 0 ? (
                        <div className="col">
                            {provider.plans.map((plan) => (
                                <div key={plan.id} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    <div className="col" style={{ gap: 2 }}>
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{plan.name}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            {plan.planType} · Sum Insured: ₹{plan.sumInsured ? (plan.sumInsured / 100000).toFixed(0) + 'L' : '—'}
                                        </span>
                                    </div>
                                    <div className="row ai-center gap-2">
                                        {plan.basePremium && (
                                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>
                                                ₹{plan.basePremium.toLocaleString()}/yr
                                            </span>
                                        )}
                                        <span className={plan.isActive ? 'pill pill-mint' : 'pill'}>
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No plans added
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'hospitals' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {provider.hospitalTies.length > 0 ? (
                        <div className="col">
                            {provider.hospitalTies.map((tie, i) => (
                                <div key={i} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    <div className="row ai-center gap-3">
                                        {tie.hospital.logo ? (
                                            <img src={tie.hospital.logo} alt={tie.hospital.name} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'contain', border: '1px solid var(--rule)' }} />
                                        ) : (
                                            <span className="spec-icon" aria-hidden="true">{tie.hospital.name.charAt(0)}</span>
                                        )}
                                        <div className="col" style={{ gap: 2 }}>
                                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{tie.hospital.name}</span>
                                            {tie.hospital.city && (
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{tie.hospital.city}</span>
                                            )}
                                        </div>
                                    </div>
                                    {tie.isCashless && <span className="pill pill-mint">Cashless</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No hospital tie-ups
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'tpas' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {provider.tpaAssociations.length > 0 ? (
                        <div className="col">
                            {provider.tpaAssociations.map((assoc, i) => (
                                <div key={i} className="row ai-center gap-3" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    {assoc.tpa.logo ? (
                                        <img src={assoc.tpa.logo} alt={assoc.tpa.name} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'contain', border: '1px solid var(--rule)' }} />
                                    ) : (
                                        <span className="spec-icon" aria-hidden="true">{assoc.tpa.name.charAt(0)}</span>
                                    )}
                                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{assoc.tpa.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No TPA associations
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
