'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Enquiry {
    id: number;
    companyName: string;
    companyType: string;
    contactName: string;
    email: string;
    phone: string | null;
    website: string | null;
    adBudget: string | null;
    targetRegions: string[];
    targetConditions: string[];
    message: string | null;
    status: string;
    assignedTo: string | null;
    notes: string | null;
    createdAt: string;
    contactedAt: string | null;
    advertiser: {
        id: number;
        companyName: string;
        slug: string;
    } | null;
}

const STATUS_OPTIONS = [
    { value: 'new', label: 'New', pill: 'pill pill-cobalt' },
    { value: 'contacted', label: 'Contacted', pill: 'pill pill-lemon' },
    { value: 'qualified', label: 'Qualified', pill: 'pill pill-magenta' },
    { value: 'converted', label: 'Converted', pill: 'pill pill-mint' },
    { value: 'closed', label: 'Closed', pill: 'pill' },
];

const COMPANY_TYPES: Record<string, string> = {
    clinic: 'Clinic',
    hospital: 'Hospital',
    diagnostic: 'Diagnostic Lab',
    pharmacy: 'Pharmacy',
    pharma: 'Pharmaceutical',
    medtech: 'MedTech',
    insurance: 'Insurance',
    wellness: 'Wellness',
    other: 'Other',
};

export default function EnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchEnquiries = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`/api/ads/enquiry?${params.toString()}`);
            const data = await res.json();
            setEnquiries(data.enquiries || []);
        } catch (error) {
            console.error('Failed to fetch enquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const updateEnquiryStatus = async (id: number, newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/ads/enquiry/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setEnquiries((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
                );
                if (selectedEnquiry?.id === id) {
                    setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusPill = (status: string) =>
        STATUS_OPTIONS.find((s) => s.value === status)?.pill || 'pill';

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <Link
                href="/admin/advertising"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to advertising
            </Link>

            <div className="col gap-2">
                <span className="section-mark">admin / advertising / enquiries</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    Ad Enquiries<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                    Manage incoming advertising enquiries.
                </p>
            </div>

            {/* Filters */}
            <div className="row ai-center gap-4" style={{ flexWrap: 'wrap' }}>
                <div className="row ai-center gap-2">
                    <span className="kicker">Status</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="select"
                        style={{ width: 'auto', minWidth: 160 }}
                    >
                        <option value="">All</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {enquiries.length} enquir{enquiries.length === 1 ? 'y' : 'ies'}
                </span>
            </div>

            {/* Main */}
            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 16 }}>
                <div className="lg:col-span-2 card" style={{ overflow: 'hidden' }}>
                    {loading ? (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Loading…
                        </div>
                    ) : enquiries.length === 0 ? (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No enquiries found
                        </div>
                    ) : (
                        <div className="col">
                            {enquiries.map((enquiry) => {
                                const isSelected = selectedEnquiry?.id === enquiry.id;
                                return (
                                    <div
                                        key={enquiry.id}
                                        onClick={() => setSelectedEnquiry(enquiry)}
                                        className="col gap-1"
                                        style={{
                                            padding: '14px 18px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--rule-2)',
                                            background: isSelected ? 'var(--cobalt-50)' : 'transparent',
                                            borderLeft: isSelected ? '3px solid var(--cobalt)' : '3px solid transparent',
                                        }}
                                    >
                                        <div className="row between ai-center">
                                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{enquiry.companyName}</span>
                                            <span className={getStatusPill(enquiry.status)}>{enquiry.status}</span>
                                        </div>
                                        <div className="row ai-center gap-2 mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            <span>{COMPANY_TYPES[enquiry.companyType] || enquiry.companyType}</span>
                                            <span>·</span>
                                            <span>{enquiry.contactName}</span>
                                        </div>
                                        <div className="row ai-center gap-2" style={{ fontSize: 13 }}>
                                            <span style={{ color: 'var(--ink-4)' }}>{enquiry.email}</span>
                                            {enquiry.adBudget && (
                                                <>
                                                    <span style={{ color: 'var(--ink-5)' }}>·</span>
                                                    <span style={{ color: 'var(--cobalt)', fontWeight: 500 }}>{enquiry.adBudget}</span>
                                                </>
                                            )}
                                        </div>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            {new Date(enquiry.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Detail */}
                <div className="card">
                    {selectedEnquiry ? (
                        <div className="col gap-4" style={{ padding: 24 }}>
                            <div className="row between ai-center">
                                <span className="section-mark">enquiry details</span>
                                <button
                                    onClick={() => setSelectedEnquiry(null)}
                                    className="btn btn-ghost btn-sm"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="col gap-4">
                                <div className="col gap-1">
                                    <span className="kicker">Company</span>
                                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{selectedEnquiry.companyName}</span>
                                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                                        {COMPANY_TYPES[selectedEnquiry.companyType] || selectedEnquiry.companyType}
                                    </span>
                                </div>

                                <div className="col gap-1">
                                    <span className="kicker">Contact</span>
                                    <span style={{ color: 'var(--ink)' }}>{selectedEnquiry.contactName}</span>
                                    <a href={`mailto:${selectedEnquiry.email}`} style={{ fontSize: 13, color: 'var(--cobalt)' }}>
                                        {selectedEnquiry.email}
                                    </a>
                                    {selectedEnquiry.phone && (
                                        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{selectedEnquiry.phone}</span>
                                    )}
                                </div>

                                {selectedEnquiry.website && (
                                    <div className="col gap-1">
                                        <span className="kicker">Website</span>
                                        <a href={selectedEnquiry.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--cobalt)' }}>
                                            {selectedEnquiry.website}
                                        </a>
                                    </div>
                                )}

                                {selectedEnquiry.adBudget && (
                                    <div className="col gap-1">
                                        <span className="kicker">Budget</span>
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{selectedEnquiry.adBudget}</span>
                                    </div>
                                )}

                                {selectedEnquiry.targetRegions.length > 0 && (
                                    <div className="col gap-2">
                                        <span className="kicker">Target Regions</span>
                                        <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                            {selectedEnquiry.targetRegions.map((r) => (
                                                <span key={r} className="pill">{r}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedEnquiry.message && (
                                    <div className="col gap-2">
                                        <span className="kicker">Message</span>
                                        <div className="card-quiet" style={{ padding: 12, fontSize: 13, color: 'var(--ink-2)' }}>
                                            {selectedEnquiry.message}
                                        </div>
                                    </div>
                                )}

                                <div className="col gap-2 hairline-t" style={{ paddingTop: 16 }}>
                                    <span className="kicker">Update Status</span>
                                    <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                        {STATUS_OPTIONS.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => updateEnquiryStatus(selectedEnquiry.id, s.value)}
                                                disabled={updatingStatus || selectedEnquiry.status === s.value}
                                                className={selectedEnquiry.status === s.value ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedEnquiry.status === 'qualified' && !selectedEnquiry.advertiser && (
                                    <Link
                                        href={`/admin/advertising/advertisers/new?from_enquiry=${selectedEnquiry.id}`}
                                        className="btn btn-cobalt"
                                    >
                                        Convert to Advertiser →
                                    </Link>
                                )}

                                {selectedEnquiry.advertiser && (
                                    <div className="card-flat col gap-1" style={{ padding: 12, background: 'var(--mint-50)', borderColor: 'rgba(40, 212, 168, .30)' }}>
                                        <span className="kicker" style={{ color: 'var(--mint-3)' }}>Converted</span>
                                        <Link
                                            href={`/admin/advertising/advertisers/${selectedEnquiry.advertiser.id}`}
                                            style={{ fontSize: 13, color: 'var(--mint-3)', fontWeight: 500 }}
                                        >
                                            View {selectedEnquiry.advertiser.companyName} →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Select an enquiry to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
