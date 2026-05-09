"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Verification {
    id: string;
    doctor: {
        id: number;
        name: string;
        slug: string;
        qualifications: string[];
        profileImage: string | null;
    };
    registryType: string;
    licenseNumber: string;
    countryCode: string;
    status: 'pending' | 'verified' | 'rejected' | 'inconclusive';
    verifiedName: string | null;
    verifiedSpecialty: string | null;
    matchConfidence: number | null;
    apiResponse: Record<string, unknown> | null;
    createdAt: string;
}

type StatusFilter = 'pending' | 'inconclusive' | 'verified' | 'rejected';

export default function VerificationPage() {
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchVerifications = useCallback(async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const res = await fetch(`/api/admin/verification-queue?status=${statusFilter}`, {
                signal: controller.signal,
                credentials: 'include',
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                const error = await res.json().catch(() => ({ error: 'Failed to load' }));
                setErrorMessage(error.error || 'Failed to load verifications');
                setVerifications([]);
            } else {
                const data = await res.json();
                setVerifications(data.verifications || []);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                setErrorMessage('Request timed out. Please try again.');
            } else {
                console.error('Failed to fetch verifications:', error);
                setErrorMessage('Failed to load verifications. Please try again.');
            }
            setVerifications([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchVerifications();
    }, [fetchVerifications]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            const res = await fetch('/api/admin/verification-queue', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    action,
                    reviewedBy: 'admin',
                    reviewNotes,
                    rejectionReason: action === 'reject' ? rejectionReason : undefined,
                }),
            });

            if (res.ok) {
                setVerifications((prev) => prev.filter((v) => v.id !== id));
                setShowModal(false);
                setReviewNotes('');
                setRejectionReason('');
                setSelectedId(null);
            } else {
                const error = await res.json();
                setErrorMessage(`Failed: ${error.error}`);
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch (error) {
            console.error('Action failed:', error);
            setErrorMessage('Action failed. Please try again.');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setActionLoading(null);
        }
    };

    const openModal = (id: string, action: 'approve' | 'reject') => {
        setSelectedId(id);
        setModalAction(action);
        setShowModal(true);
    };

    const selectedVerification = verifications.find((v) => v.id === selectedId);

    const confidenceColor = (c: number | null) => {
        if (!c) return 'var(--ink-4)';
        if (c >= 0.9) return 'var(--mint-3)';
        if (c >= 0.7) return 'var(--lemon-2)';
        return 'var(--orange-2)';
    };

    const confidenceLabel = (c: number | null) => {
        if (!c) return 'N/A';
        if (c >= 0.9) return 'High';
        if (c >= 0.7) return 'Medium';
        return 'Low';
    };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {errorMessage && (
                <div
                    role="alert"
                    className="card-flat"
                    style={{
                        padding: '12px 16px',
                        borderColor: 'rgba(255, 90, 46, .35)',
                        background: 'var(--orange-50)',
                        color: 'var(--orange-2)',
                        fontSize: 13,
                    }}
                >
                    {errorMessage}
                </div>
            )}

            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / verification</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Verification queue<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        Review and verify doctor license credentials.
                    </p>
                </div>
                <button onClick={fetchVerifications} className="btn btn-paper">
                    ↻ Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="row hairline-b" style={{ gap: 8 }}>
                {(['pending', 'inconclusive', 'verified', 'rejected'] as StatusFilter[]).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            fontWeight: 500,
                            background: 'transparent',
                            border: 'none',
                            borderBottom: statusFilter === status ? '2px solid var(--cobalt)' : '2px solid transparent',
                            color: statusFilter === status ? 'var(--cobalt)' : 'var(--ink-3)',
                            marginBottom: -1,
                            textTransform: 'capitalize',
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Stats strip */}
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
                    { label: 'Pending', value: verifications.length.toLocaleString(), tone: 'lemon' },
                    { label: 'Auto-verified today', value: '0', tone: 'cobalt' },
                    { label: 'Manual approvals', value: '0', tone: 'mint' },
                    { label: 'Rejected', value: '0', tone: 'orange' },
                ].map((m) => (
                    <div key={m.label} className="col gap-2" style={{ padding: 20, borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                        <span className="kicker">{m.label}</span>
                        <span
                            className="num bignum"
                            style={{
                                fontSize: 28,
                                color: m.tone === 'lemon' ? 'var(--lemon-2)'
                                    : m.tone === 'cobalt' ? 'var(--cobalt)'
                                    : m.tone === 'mint' ? 'var(--mint-3)'
                                    : 'var(--orange-2)',
                            }}
                        >
                            {m.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div className="col ai-center gap-3" style={{ padding: 48 }}>
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
                        <p className="muted" style={{ fontSize: 13 }}>Loading verifications…</p>
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : verifications.length === 0 ? (
                    <div className="col ai-center gap-3" style={{ padding: 48, textAlign: 'center' }}>
                        <span className="spec-icon" style={{ background: 'var(--mint)', width: 48, height: 48, fontSize: 22 }}>✓</span>
                        <h3 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600 }}>All caught up</h3>
                        <p className="muted" style={{ fontSize: 13, margin: 0 }}>No {statusFilter} verifications in the queue.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-2)' }}>
                                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                    {['Doctor', 'License info', 'Registry match', 'Confidence', 'Submitted'].map(h => (
                                        <th key={h} scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                                    ))}
                                    <th scope="col" className="mono" style={{ textAlign: 'right', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {verifications.map((v) => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid var(--rule-2)' }}>
                                        <td style={{ padding: 14 }}>
                                            <div className="row ai-center gap-3">
                                                <span className="spec-icon" aria-hidden="true">{v.doctor.name.charAt(0).toUpperCase()}</span>
                                                <div className="col gap-1">
                                                    <Link href={`/admin/doctors/${v.doctor.id}`} style={{ fontWeight: 500, color: 'var(--ink)' }}>
                                                        {v.doctor.name}
                                                    </Link>
                                                    <span className="muted" style={{ fontSize: 11 }}>
                                                        {v.doctor.qualifications?.join(', ') || 'No qualifications'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            <span className="mono" style={{ fontSize: 12, background: 'var(--bg-2)', padding: '2px 8px', borderRadius: 'var(--r-2)', display: 'inline-block', marginBottom: 4 }}>
                                                {v.licenseNumber}
                                            </span>
                                            <p className="muted" style={{ fontSize: 11, margin: 0 }}>
                                                {v.registryType} ({v.countryCode})
                                            </p>
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            {v.verifiedName ? (
                                                <div className="col gap-1">
                                                    <span style={{ fontWeight: 500 }}>{v.verifiedName}</span>
                                                    <span className="muted" style={{ fontSize: 11 }}>{v.verifiedSpecialty || 'N/A'}</span>
                                                </div>
                                            ) : (
                                                <span className="muted" style={{ fontStyle: 'italic' }}>No match data</span>
                                            )}
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            <div className="col gap-1">
                                                <span className="num" style={{ fontWeight: 600, color: confidenceColor(v.matchConfidence) }}>
                                                    {v.matchConfidence ? `${Math.round(v.matchConfidence * 100)}%` : 'N/A'}
                                                </span>
                                                <span className="muted" style={{ fontSize: 11 }}>{confidenceLabel(v.matchConfidence)}</span>
                                            </div>
                                        </td>
                                        <td className="mono" style={{ padding: 14, fontSize: 12, color: 'var(--ink-3)' }}>
                                            {new Date(v.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: 14, textAlign: 'right' }}>
                                            <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => openModal(v.id, 'approve')}
                                                    disabled={actionLoading === v.id}
                                                    className="btn btn-cobalt btn-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => openModal(v.id, 'reject')}
                                                    disabled={actionLoading === v.id}
                                                    className="btn btn-orange btn-sm"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => setSelectedId(selectedId === v.id ? null : v.id)}
                                                    className="btn btn-paper btn-sm"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && selectedVerification && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(10, 26, 47, .55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 500,
                        padding: 16,
                    }}
                >
                    <div className="card col gap-4" style={{ padding: 24, maxWidth: 460, width: '100%' }}>
                        <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>
                            {modalAction === 'approve' ? 'Approve verification' : 'Reject verification'}
                        </h3>

                        <div className="card-quiet col gap-1" style={{ padding: 12 }}>
                            <span style={{ fontWeight: 500 }}>{selectedVerification.doctor.name}</span>
                            <span className="muted" style={{ fontSize: 12 }}>License: {selectedVerification.licenseNumber}</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Review notes (optional)</label>
                            <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="textarea"
                                rows={2}
                                placeholder="Add any notes about this review…"
                            />
                        </div>

                        {modalAction === 'reject' && (
                            <div className="form-group">
                                <label className="form-label">Rejection reason *</label>
                                <select
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="select"
                                >
                                    <option value="">Select a reason…</option>
                                    <option value="invalid_license">Invalid License Number</option>
                                    <option value="expired_license">Expired License</option>
                                    <option value="name_mismatch">Name Mismatch</option>
                                    <option value="unverifiable">Unable to Verify</option>
                                    <option value="fraudulent">Suspected Fraud</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        )}

                        <div className="row gap-3 hairline-t" style={{ paddingTop: 16, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setReviewNotes('');
                                    setRejectionReason('');
                                }}
                                className="btn btn-paper"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(selectedVerification.id, modalAction)}
                                disabled={modalAction === 'reject' && !rejectionReason}
                                className={modalAction === 'approve' ? 'btn btn-cobalt' : 'btn btn-orange'}
                            >
                                {actionLoading ? 'Processing…' : modalAction === 'approve' ? 'Confirm approval' : 'Confirm rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
