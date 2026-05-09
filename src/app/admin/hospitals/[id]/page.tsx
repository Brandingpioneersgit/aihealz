'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Hospital {
    id: number;
    slug: string;
    name: string;
    hospitalType: string;
    description?: string;
    tagline?: string;
    logo?: string;
    coverImage?: string;
    images: string[];
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    phone?: string;
    emergencyPhone?: string;
    email?: string;
    website?: string;
    bedCount?: number;
    icuBeds?: number;
    operationTheaters?: number;
    emergencyBeds?: number;
    accreditations: string[];
    isVerified: boolean;
    isActive: boolean;
    rating?: number;
    stats: {
        avgRating: string;
        reviewCount: number;
        pendingEnquiries: number;
        activeDoctors: number;
    };
    specialties: Array<{ id: number; specialty: string; isCenter: boolean }>;
    departments: Array<{ id: number; name: string }>;
    doctors: Array<{ id: number; name: string; designation?: string; specialty?: string; isTopDoctor: boolean }>;
    reviews: Array<{ id: number; reviewerName: string; rating: number; title?: string; review?: string; createdAt: string }>;
    enquiries: Array<{ id: string; patientName: string; patientPhone: string; status: string; createdAt: string }>;
    insuranceTies: Array<{ insurer: { id: number; name: string; logo?: string }; isCashless: boolean }>;
}

const hospitalTypeLabels: Record<string, string> = {
    government: 'Government',
    private: 'Private',
    public_private_partnership: 'PPP',
    charitable: 'Charitable',
    trust: 'Trust',
    corporate_chain: 'Corporate Chain',
};

export default function HospitalDetailPage() {
    const params = useParams();
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'reviews' | 'enquiries' | 'insurance'>('overview');

    const fetchHospital = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/hospitals/${params.id}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setHospital(data);
            }
        } catch (error) {
            console.error('Failed to fetch hospital:', error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchHospital();
    }, [fetchHospital]);

    const togglePatch = async (field: 'isVerified' | 'isActive') => {
        if (!hospital) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/hospitals/${hospital.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: !hospital[field] }),
                credentials: 'include',
            });
            if (res.ok) {
                setHospital({ ...hospital, [field]: !hospital[field] });
            }
        } catch (error) {
            console.error('Failed to update hospital:', error);
        } finally {
            setSaving(false);
        }
    };

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

    if (!hospital) {
        return (
            <div className="col ai-center gap-3" style={{ padding: 48, textAlign: 'center' }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Hospital not found
                </span>
                <Link href="/admin/hospitals" className="btn btn-paper">← Back to Hospitals</Link>
            </div>
        );
    }

    const statCards: Array<{ label: string; value: string; sub?: string; code: string }> = [
        { label: 'Rating', value: hospital.stats.avgRating, sub: `${hospital.stats.reviewCount} reviews`, code: '★' },
        { label: 'Active Doctors', value: hospital.stats.activeDoctors.toLocaleString(), code: 'DR' },
        { label: 'Pending Enquiries', value: hospital.stats.pendingEnquiries.toLocaleString(), code: 'EN' },
        { label: 'Bed Count', value: hospital.bedCount?.toLocaleString() || 'N/A', code: 'BD' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <Link
                href="/admin/hospitals"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to hospitals
            </Link>

            {/* Header */}
            <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="row ai-center gap-4">
                    {hospital.logo ? (
                        <img src={hospital.logo} alt={hospital.name} style={{ width: 64, height: 64, borderRadius: 'var(--r-3)', objectFit: 'cover', border: '1px solid var(--rule)' }} />
                    ) : (
                        <div className="spec-icon" style={{ width: 64, height: 64, fontSize: 28 }}>{hospital.name.charAt(0)}</div>
                    )}
                    <div className="col gap-2">
                        <span className="section-mark">admin / hospitals / {hospital.name}</span>
                        <h1
                            className="display"
                            style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                        >
                            {hospital.name}<span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                            <span className="pill">{hospitalTypeLabels[hospital.hospitalType] || hospital.hospitalType}</span>
                            {hospital.isVerified && <span className="pill pill-mint">✓ Verified</span>}
                            {!hospital.isActive && <span className="pill pill-orange">Inactive</span>}
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                            {hospital.city}{hospital.state && `, ${hospital.state}`}{hospital.country && `, ${hospital.country}`}
                        </span>
                    </div>
                </div>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    <button
                        onClick={() => {
                            localStorage.setItem('admin_impersonating', 'true');
                            localStorage.setItem('admin_original_session', localStorage.getItem('admin_session') || '');
                            localStorage.setItem('provider_hospital_id', hospital.id.toString());
                            localStorage.setItem('provider_session', JSON.stringify({ hospitalId: hospital.id, impersonated: true }));
                            window.open('/provider/hospital/dashboard', '_blank');
                        }}
                        className="btn btn-paper"
                        style={{ color: 'var(--magenta)' }}
                    >
                        Impersonate
                    </button>
                    <button
                        onClick={() => togglePatch('isVerified')}
                        disabled={saving}
                        className={hospital.isVerified ? 'btn btn-paper' : 'btn btn-cobalt'}
                    >
                        {hospital.isVerified ? 'Remove Verification' : 'Verify Hospital'}
                    </button>
                    <button
                        onClick={() => togglePatch('isActive')}
                        disabled={saving}
                        className={hospital.isActive ? 'btn btn-orange' : 'btn btn-cobalt'}
                    >
                        {hospital.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link href={`/hospitals/${hospital.slug}`} target="_blank" className="btn btn-paper">
                        View ↗
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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
                        {s.sub && (
                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {s.sub}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="row gap-1 hairline-b">
                {[
                    { key: 'overview' as const, label: 'Overview' },
                    { key: 'doctors' as const, label: `Doctors (${hospital.doctors.length})` },
                    { key: 'reviews' as const, label: `Reviews (${hospital.reviews.length})` },
                    { key: 'enquiries' as const, label: `Enquiries (${hospital.enquiries.length})` },
                    { key: 'insurance' as const, label: `Insurance (${hospital.insuranceTies.length})` },
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

            {/* Overview tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                    <div className="card col gap-3" style={{ padding: 24 }}>
                        <span className="section-mark">hospital details</span>
                        {hospital.description && (
                            <div className="col gap-1">
                                <span className="kicker">Description</span>
                                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{hospital.description}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2" style={{ gap: 12 }}>
                            {[
                                { label: 'Address', value: hospital.address },
                                { label: 'Pincode', value: hospital.pincode },
                                { label: 'Phone', value: hospital.phone },
                                { label: 'Emergency', value: hospital.emergencyPhone },
                                { label: 'Email', value: hospital.email },
                            ].map((row) => (
                                <div key={row.label} className="col gap-1">
                                    <span className="kicker">{row.label}</span>
                                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>{row.value || '—'}</span>
                                </div>
                            ))}
                            <div className="col gap-1">
                                <span className="kicker">Website</span>
                                {hospital.website ? (
                                    <a href={hospital.website} target="_blank" rel="noopener" style={{ fontSize: 13, color: 'var(--cobalt)' }}>
                                        {hospital.website}
                                    </a>
                                ) : (
                                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>—</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card col gap-3" style={{ padding: 24 }}>
                        <span className="section-mark">infrastructure</span>
                        <div className="grid grid-cols-2" style={{ gap: 12 }}>
                            {[
                                { label: 'Total Beds', value: hospital.bedCount },
                                { label: 'ICU Beds', value: hospital.icuBeds },
                                { label: 'Operation Theaters', value: hospital.operationTheaters },
                                { label: 'Emergency Beds', value: hospital.emergencyBeds },
                            ].map((it) => (
                                <div key={it.label} className="card-flat col gap-1" style={{ padding: 12, background: 'var(--bg-2)' }}>
                                    <span className="kicker">{it.label}</span>
                                    <span className="num bignum" style={{ fontSize: 22, color: 'var(--ink)' }}>{it.value || '—'}</span>
                                </div>
                            ))}
                        </div>
                        {hospital.accreditations.length > 0 && (
                            <div className="col gap-2 hairline-t" style={{ paddingTop: 16 }}>
                                <span className="kicker">Accreditations</span>
                                <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                    {hospital.accreditations.map((acc) => (
                                        <span key={acc} className="pill pill-cobalt">{acc}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card col gap-3" style={{ padding: 24 }}>
                        <span className="section-mark">specialties</span>
                        {hospital.specialties.length > 0 ? (
                            <div className="col">
                                {hospital.specialties.map((spec) => (
                                    <div key={spec.id} className="row between ai-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--rule-2)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--ink)' }}>{spec.specialty}</span>
                                        {spec.isCenter && <span className="pill pill-orange">Center of Excellence</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                No specialties added
                            </span>
                        )}
                    </div>

                    <div className="card col gap-3" style={{ padding: 24 }}>
                        <span className="section-mark">departments</span>
                        {hospital.departments.length > 0 ? (
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                {hospital.departments.map((dept) => (
                                    <span key={dept.id} className="pill">{dept.name}</span>
                                ))}
                            </div>
                        ) : (
                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                No departments added
                            </span>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'doctors' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {hospital.doctors.length > 0 ? (
                        <div className="col">
                            {hospital.doctors.map((doctor) => (
                                <div key={doctor.id} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    <div className="row ai-center gap-3">
                                        <span className="spec-icon" aria-hidden="true">{doctor.name.charAt(0)}</span>
                                        <div className="col" style={{ gap: 2 }}>
                                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{doctor.name}</span>
                                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                                {doctor.designation || doctor.specialty || 'No designation'}
                                            </span>
                                        </div>
                                    </div>
                                    {doctor.isTopDoctor && <span className="pill pill-orange">Top Doctor</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No doctors added to this hospital
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="col gap-3">
                    {hospital.reviews.length > 0 ? (
                        hospital.reviews.map((review) => (
                            <div key={review.id} className="card col gap-2" style={{ padding: 16 }}>
                                <div className="row between ai-start">
                                    <div className="col gap-1">
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{review.reviewerName}</span>
                                        <div className="row ai-center" style={{ gap: 2 }}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} style={{ color: i < review.rating ? 'var(--lemon-2)' : 'var(--ink-5)' }}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {review.title && <span style={{ fontWeight: 500, color: 'var(--ink-2)' }}>{review.title}</span>}
                                {review.review && <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{review.review}</span>}
                            </div>
                        ))
                    ) : (
                        <div className="card mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No reviews yet
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'enquiries' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {hospital.enquiries.length > 0 ? (
                        <div className="col">
                            {hospital.enquiries.map((enquiry) => (
                                <div key={enquiry.id} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    <div className="col" style={{ gap: 2 }}>
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{enquiry.patientName}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{enquiry.patientPhone}</span>
                                    </div>
                                    <div className="row ai-center gap-3">
                                        <span
                                            className={
                                                enquiry.status === 'new' ? 'pill pill-cobalt'
                                                : enquiry.status === 'contacted' ? 'pill pill-lemon'
                                                : enquiry.status === 'converted' ? 'pill pill-mint'
                                                : 'pill'
                                            }
                                        >
                                            {enquiry.status}
                                        </span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            {new Date(enquiry.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No enquiries received
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'insurance' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {hospital.insuranceTies.length > 0 ? (
                        <div className="col">
                            {hospital.insuranceTies.map((tie, i) => (
                                <div key={i} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                    <div className="row ai-center gap-3">
                                        {tie.insurer.logo ? (
                                            <img src={tie.insurer.logo} alt={tie.insurer.name} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'contain', border: '1px solid var(--rule)' }} />
                                        ) : (
                                            <span className="spec-icon" aria-hidden="true">{tie.insurer.name.charAt(0)}</span>
                                        )}
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{tie.insurer.name}</span>
                                    </div>
                                    {tie.isCashless && <span className="pill pill-mint">Cashless</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No insurance tie-ups
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
