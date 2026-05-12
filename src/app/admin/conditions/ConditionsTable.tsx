"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/confirm-modal';

interface Condition {
    id: number;
    slug: string;
    scientificName: string;
    commonName: string;
    description: string | null;
    specialistType: string;
    severityLevel: string | null;
    icdCode: string | null;
    bodySystem: string | null;
    isActive: boolean;
    createdAt: string;
    _count: {
        localizedContent: number;
        doctorSpecialties: number;
    };
}

interface SearchResult {
    conditions: Condition[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export default function ConditionsTable({ specialties }: { specialties: string[] }) {
    const [data, setData] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [sortBy, setSortBy] = useState('commonName');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; conditionId: number | null; conditionName: string }>({
        isOpen: false,
        conditionId: null,
        conditionName: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchData = useCallback(async (params: {
        q: string; page: number; pageSize: number;
        specialty: string; status: string; sortBy: string; sortDir: string;
    }) => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const qs = new URLSearchParams({
                q: params.q,
                page: String(params.page),
                pageSize: String(params.pageSize),
                specialty: params.specialty,
                status: params.status,
                sortBy: params.sortBy,
                sortDir: params.sortDir,
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const res = await fetch(`/api/admin/conditions/search?${qs}`, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const json: SearchResult = await res.json();
                setData(json);
            } else {
                const error = await res.json().catch(() => ({ error: 'Search failed' }));
                setErrorMessage(error.error || 'Failed to load conditions');
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                setErrorMessage('Request timed out. The database may have too many conditions to load quickly.');
            } else {
                console.error('Failed to fetch conditions:', err);
                setErrorMessage('Failed to load conditions. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData({ q: search, page, pageSize, specialty, status, sortBy, sortDir });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, specialty, status, sortBy, sortDir, fetchData]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchData({ q: value, page: 1, pageSize, specialty, status, sortBy, sortDir });
        }, 350);
    };

    const openDeleteModal = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, conditionId: id, conditionName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.conditionId) return;
        const id = deleteModal.conditionId;
        setDeleteModal({ isOpen: false, conditionId: null, conditionName: '' });
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/conditions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData({ q: search, page, pageSize, specialty, status, sortBy, sortDir });
            } else {
                setErrorMessage('Failed to delete condition');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch {
            setErrorMessage('An error occurred');
            setTimeout(() => setErrorMessage(null), 3000);
        }
        setDeleting(null);
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/conditions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                fetchData({ q: search, page, pageSize, specialty, status, sortBy, sortDir });
            }
        } catch {
            setErrorMessage('Failed to update status');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        setPage(1);
    };

    const SortIcon = ({ field }: { field: string }) => (
        <span
            className="col mono"
            style={{
                marginLeft: 4,
                display: 'inline-flex',
                fontSize: 8,
                lineHeight: 1,
                gap: 0,
            }}
        >
            <span
                style={{
                    color: sortBy === field && sortDir === 'asc' ? 'var(--cobalt)' : 'var(--ink-5)',
                }}
            >
                ▲
            </span>
            <span
                style={{
                    color: sortBy === field && sortDir === 'desc' ? 'var(--cobalt)' : 'var(--ink-5)',
                }}
            >
                ▼
            </span>
        </span>
    );

    const conditions = data?.conditions || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 0;

    const thStyle: React.CSSProperties = {
        padding: '12px 16px',
        textAlign: 'left',
        fontFamily: 'var(--mono)',
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--ink-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        cursor: 'pointer',
        userSelect: 'none',
    };

    const thStyleStatic: React.CSSProperties = {
        ...thStyle,
        cursor: 'default',
    };

    const tdStyle: React.CSSProperties = {
        padding: '14px 16px',
        fontSize: 13,
        color: 'var(--ink-2)',
        verticalAlign: 'middle',
    };

    return (
        <>
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Condition"
                message={`Are you sure you want to delete "${deleteModal.conditionName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, conditionId: null, conditionName: '' })}
            />

            {errorMessage && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: 12,
                        background: 'var(--orange-50)',
                        border: '1px solid rgba(255, 90, 46, .28)',
                        color: 'var(--orange-2)',
                        borderRadius: 'var(--r-2)',
                        fontSize: 13,
                    }}
                >
                    {errorMessage}
                </div>
            )}

            <div className="card" style={{ overflow: 'hidden' }}>
                {/* Filters */}
                <div
                    className="hairline-b col gap-4"
                    style={{ padding: 16 }}
                >
                    <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 480 }}>
                            <span
                                aria-hidden="true"
                                className="row ai-center center mono"
                                style={{
                                    position: 'absolute',
                                    left: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 18,
                                    height: 18,
                                    color: 'var(--ink-4)',
                                    fontSize: 14,
                                    pointerEvents: 'none',
                                }}
                            >
                                ⌕
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name, scientific name, or slug…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="input"
                                style={{ paddingLeft: 36 }}
                            />
                        </div>
                        <select
                            value={specialty}
                            onChange={(e) => { setSpecialty(e.target.value); setPage(1); }}
                            className="select"
                            style={{ width: 'auto', minWidth: 200 }}
                        >
                            <option value="">All specialties</option>
                            {specialties.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <div className="row gap-2">
                            {(['all', 'active', 'inactive'] as const).map(s => {
                                const isActive = status === s;
                                let cls = 'btn btn-paper btn-sm';
                                if (isActive) {
                                    if (s === 'active') cls = 'btn btn-sm';
                                    else if (s === 'inactive') cls = 'btn btn-primary btn-sm';
                                    else cls = 'btn btn-cobalt btn-sm';
                                }
                                const overrideStyle: React.CSSProperties =
                                    isActive && s === 'active'
                                        ? {
                                              background: 'var(--mint-3)',
                                              color: '#fff',
                                              borderColor: 'var(--mint-3)',
                                          }
                                        : {};
                                return (
                                    <button
                                        key={s}
                                        onClick={() => { setStatus(s); setPage(1); }}
                                        className={cls}
                                        style={{ textTransform: 'capitalize', ...overrideStyle }}
                                    >
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="row ai-center gap-2">
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Show
                            </span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                                className="select"
                                style={{ width: 80, padding: '6px clamp(16px, 4vw, 28px) 6px 10px', fontSize: 13 }}
                            >
                                {[25, 50, 100].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                per page
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ padding: 32, textAlign: 'center' }}>
                        <div
                            className="row ai-center center gap-3"
                            style={{ display: 'inline-flex', color: 'var(--ink-3)' }}
                        >
                            <span
                                style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: 999,
                                    border: '2px solid var(--rule)',
                                    borderTopColor: 'var(--cobalt)',
                                    animation: 'spin 0.8s linear infinite',
                                    display: 'inline-block',
                                }}
                            />
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Loading conditions…
                            </span>
                        </div>
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                )}

                {/* Table */}
                {!loading && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <caption className="sr-only">
                                Medical conditions list with specialist, body system, content count, doctor count, status, and actions
                            </caption>
                            <thead
                                className="hairline-b"
                                style={{ background: 'var(--bg-2)' }}
                            >
                                <tr>
                                    <th
                                        scope="col"
                                        style={thStyle}
                                        onClick={() => toggleSort('commonName')}
                                    >
                                        Condition <SortIcon field="commonName" />
                                    </th>
                                    <th
                                        scope="col"
                                        style={thStyle}
                                        onClick={() => toggleSort('specialistType')}
                                    >
                                        Specialist <SortIcon field="specialistType" />
                                    </th>
                                    <th scope="col" style={thStyleStatic}>Body system</th>
                                    <th scope="col" style={{ ...thStyleStatic, textAlign: 'center' }}>Content</th>
                                    <th scope="col" style={{ ...thStyleStatic, textAlign: 'center' }}>Doctors</th>
                                    <th scope="col" style={{ ...thStyleStatic, textAlign: 'center' }}>Status</th>
                                    <th scope="col" style={{ ...thStyleStatic, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conditions.map((condition) => (
                                    <tr
                                        key={condition.id}
                                        style={{
                                            borderTop: '1px solid var(--rule-2)',
                                            transition: 'background var(--transition-fast)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <td style={tdStyle}>
                                            <div className="col" style={{ gap: 2 }}>
                                                <p
                                                    style={{
                                                        fontWeight: 600,
                                                        color: 'var(--ink)',
                                                        margin: 0,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {condition.commonName}
                                                </p>
                                                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>
                                                    {condition.scientificName}
                                                </p>
                                                <p
                                                    className="mono"
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--ink-4)',
                                                        margin: 0,
                                                        letterSpacing: '0.02em',
                                                    }}
                                                >
                                                    /{condition.slug}
                                                </p>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>{condition.specialistType}</td>
                                        <td style={{ ...tdStyle, color: 'var(--ink-3)' }}>
                                            {condition.bodySystem || '—'}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <span className="pill pill-cobalt">
                                                {condition._count.localizedContent}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <span className="pill pill-magenta">
                                                {condition._count.doctorSpecialties}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleToggleActive(condition.id, condition.isActive)}
                                                className={condition.isActive ? 'pill pill-mint' : 'pill'}
                                                style={{
                                                    cursor: 'pointer',
                                                    border: 'none',
                                                    fontFamily: 'var(--mono)',
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    padding: '4px 10px',
                                                    borderRadius: 'var(--r-2)',
                                                    background: condition.isActive ? 'var(--mint-50)' : 'var(--bg-2)',
                                                    color: condition.isActive ? 'var(--mint-3)' : 'var(--ink-4)',
                                                    borderWidth: 1,
                                                    borderStyle: 'solid',
                                                    borderColor: condition.isActive ? 'rgba(40, 212, 168, .30)' : 'var(--rule)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.04em',
                                                }}
                                            >
                                                {condition.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <div
                                                className="row ai-center gap-1"
                                                style={{ justifyContent: 'flex-end' }}
                                            >
                                                <Link
                                                    href={`/admin/conditions/${condition.id}`}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--cobalt)' }}
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/in/en/${condition.slug}`}
                                                    target="_blank"
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    View ↗
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(condition.id, condition.commonName)}
                                                    disabled={deleting === condition.id}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--orange-2)' }}
                                                >
                                                    {deleting === condition.id ? '…' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {conditions.length === 0 && (
                            <div
                                className="mono"
                                style={{
                                    padding: 48,
                                    textAlign: 'center',
                                    color: 'var(--ink-4)',
                                    fontSize: 12,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                No conditions found matching your criteria
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                <div
                    className="hairline-t row between ai-center"
                    style={{
                        padding: '12px 16px',
                        flexWrap: 'wrap',
                        gap: 12,
                    }}
                >
                    <div
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            letterSpacing: '0.04em',
                        }}
                    >
                        Showing {conditions.length > 0 ? ((page - 1) * pageSize + 1).toLocaleString() : 0}–{Math.min(page * pageSize, total).toLocaleString()} of {total.toLocaleString()} conditions
                    </div>

                    {totalPages > 1 && (
                        <div className="row ai-center gap-1">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="btn btn-ghost btn-sm mono"
                                style={{ minWidth: 32 }}
                            >
                                ««
                            </button>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-ghost btn-sm"
                            >
                                ‹ Prev
                            </button>

                            {(() => {
                                const pages: number[] = [];
                                const maxVisible = 5;
                                let start = Math.max(1, page - Math.floor(maxVisible / 2));
                                const end = Math.min(totalPages, start + maxVisible - 1);
                                start = Math.max(1, end - maxVisible + 1);

                                for (let i = start; i <= end; i++) pages.push(i);
                                return pages.map(p => {
                                    const isCurrent = p === page;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={isCurrent ? 'btn btn-cobalt btn-sm' : 'btn btn-ghost btn-sm'}
                                            style={{ minWidth: 32 }}
                                        >
                                            {p}
                                        </button>
                                    );
                                });
                            })()}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-ghost btn-sm"
                            >
                                Next ›
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                className="btn btn-ghost btn-sm mono"
                                style={{ minWidth: 32 }}
                            >
                                »»
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
