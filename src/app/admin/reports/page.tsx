'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalysisReport {
    id: string;
    reportType: string;
    urgencyLevel: string;
    confidenceScore: number;
    piiRedacted: number;
    processingTimeMs: number;
    doctorsMatched: number;
    specialtySearched: string | null;
    createdAt: string;
}

interface ReportsData {
    reports: AnalysisReport[];
    stats: {
        totalReports: number;
        avgConfidence: number;
        avgProcessingTime: number;
        byUrgency: Record<string, number>;
        byType: Record<string, number>;
    };
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'routine' | 'urgent' | 'emergency'>('all');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetchReports();
    }, [filter, typeFilter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.set('urgency', filter);
            if (typeFilter) params.set('type', typeFilter);

            const res = await fetch(`/api/admin/reports?${params}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                setData({
                    reports: [],
                    stats: {
                        totalReports: 0,
                        avgConfidence: 0,
                        avgProcessingTime: 0,
                        byUrgency: { routine: 0, urgent: 0, emergency: 0 },
                        byType: { blood_work: 0, imaging: 0, pathology: 0, prescription: 0, other: 0 },
                    },
                });
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setData({
                reports: [],
                stats: {
                    totalReports: 0,
                    avgConfidence: 0,
                    avgProcessingTime: 0,
                    byUrgency: { routine: 0, urgent: 0, emergency: 0 },
                    byType: {},
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const urgencyPill = (lvl: string) => {
        if (lvl === 'emergency') return 'pill pill-orange';
        if (lvl === 'urgent') return 'pill pill-lemon';
        return 'pill pill-mint';
    };

    const typeLabels: Record<string, string> = {
        blood_work: 'Blood work',
        imaging: 'MRI / X-Ray',
        pathology: 'Pathology',
        prescription: 'Prescription',
        other: 'Other',
    };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / reports</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        AI analysis reports<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        View all AI-generated medical report analyses.
                    </p>
                </div>
                <button onClick={fetchReports} className="btn btn-paper">↻ Refresh</button>
            </div>

            {/* Stats strip */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 0,
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--r-3)',
                    background: 'var(--paper)',
                    overflow: 'hidden',
                }}
            >
                {[
                    { label: 'Total reports', value: (data?.stats.totalReports || 0).toLocaleString(), sub: 'All time', subTone: 'mint' },
                    { label: 'Avg confidence', value: data?.stats.avgConfidence ? `${(data.stats.avgConfidence * 100).toFixed(0)}%` : '—' },
                    { label: 'Avg processing', value: data?.stats.avgProcessingTime ? `${(data.stats.avgProcessingTime / 1000).toFixed(1)}s` : '—' },
                    { label: 'Emergency flagged', value: (data?.stats.byUrgency?.emergency || 0).toLocaleString(), subTone: 'orange', sub: 'Urgent triage' },
                ].map((m) => (
                    <div key={m.label} className="col gap-2" style={{ padding: 20, borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                        <span className="kicker">{m.label}</span>
                        <span className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>{m.value}</span>
                        {m.sub && (
                            <span className="mono" style={{
                                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
                                color: m.subTone === 'mint' ? 'var(--mint-3)' : m.subTone === 'orange' ? 'var(--orange-2)' : 'var(--ink-3)',
                            }}>{m.sub}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Urgency distribution */}
            {data?.stats.byUrgency && (
                <section className="card col gap-4" style={{ padding: 24 }}>
                    <span className="section-mark">urgency distribution</span>
                    <div className="row gap-4" style={{ flexWrap: 'wrap' }}>
                        {Object.entries(data.stats.byUrgency).map(([level, count]) => (
                            <div key={level} className="col gap-2" style={{ flex: 1, minWidth: 160 }}>
                                <div className="row between ai-center">
                                    <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{level}</span>
                                    <span className="num muted" style={{ fontSize: 12 }}>{count}</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--bg-2)', borderRadius: 999, overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${data.stats.totalReports ? (count / data.stats.totalReports) * 100 : 0}%`,
                                            background: level === 'emergency' ? 'var(--orange)' : level === 'urgent' ? 'var(--lemon-2)' : 'var(--mint)',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Filters */}
            <div className="row ai-center gap-3" style={{ flexWrap: 'wrap' }}>
                <div className="row gap-2">
                    {(['all', 'routine', 'urgent', 'emergency'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-paper btn-sm'}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="select"
                    style={{ width: 'auto', minWidth: 200 }}
                >
                    <option value="">All report types</option>
                    {Object.entries(typeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div className="col ai-center gap-3" style={{ padding: 48 }}>
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
                        <p className="muted" style={{ fontSize: 13 }}>Loading reports…</p>
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : !data?.reports || data.reports.length === 0 ? (
                    <div className="col ai-center gap-3" style={{ padding: 48, textAlign: 'center' }}>
                        <span className="spec-icon" style={{ width: 48, height: 48, fontSize: 18 }}>RP</span>
                        <h3 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600 }}>No reports yet</h3>
                        <p className="muted" style={{ fontSize: 13, margin: 0, maxWidth: 360 }}>
                            AI analysis reports will appear here when users submit medical reports for analysis.
                        </p>
                        <Link href="/analyze" className="btn btn-cobalt">Try report analysis →</Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-2)' }}>
                                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                    {['Report ID', 'Type', 'Urgency', 'Confidence', 'PII removed', 'Processing', 'Specialty', 'Date'].map(h => (
                                        <th key={h} scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.reports.map((report) => (
                                    <tr key={report.id} style={{ borderBottom: '1px solid var(--rule-2)' }}>
                                        <td style={{ padding: 14 }}>
                                            <code className="mono" style={{ fontSize: 12, background: 'var(--bg-2)', padding: '2px 8px', borderRadius: 'var(--r-2)' }}>
                                                {report.id.slice(0, 8)}…
                                            </code>
                                        </td>
                                        <td style={{ padding: 14, color: 'var(--ink-2)' }}>{typeLabels[report.reportType] || report.reportType}</td>
                                        <td style={{ padding: 14 }}>
                                            <span className={urgencyPill(report.urgencyLevel)}>{report.urgencyLevel}</span>
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            <div className="row ai-center gap-2">
                                                <div style={{ width: 64, height: 4, background: 'var(--bg-2)', borderRadius: 999, overflow: 'hidden' }}>
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            width: `${report.confidenceScore * 100}%`,
                                                            background: report.confidenceScore >= 0.8 ? 'var(--mint)' : report.confidenceScore >= 0.6 ? 'var(--lemon-2)' : 'var(--orange)',
                                                        }}
                                                    />
                                                </div>
                                                <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                                                    {(report.confidenceScore * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 14, color: 'var(--ink-2)' }}>
                                            {report.piiRedacted > 0 ? (
                                                <span className="num" style={{ color: 'var(--mint-3)', fontWeight: 500 }}>{report.piiRedacted} items</span>
                                            ) : (
                                                <span className="muted">None</span>
                                            )}
                                        </td>
                                        <td className="num" style={{ padding: 14, color: 'var(--ink-2)' }}>
                                            {(report.processingTimeMs / 1000).toFixed(1)}s
                                        </td>
                                        <td style={{ padding: 14, color: 'var(--ink-2)' }}>{report.specialtySearched || '—'}</td>
                                        <td className="mono" style={{ padding: 14, fontSize: 12, color: 'var(--ink-3)' }}>
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info card */}
            <section className="card-flat" style={{ padding: 24, borderColor: 'rgba(28, 91, 255, .25)', background: 'var(--cobalt-50)' }}>
                <div className="row gap-4 ai-start">
                    <span className="spec-icon" style={{ background: 'var(--cobalt)' }}>i</span>
                    <div className="col gap-2">
                        <span className="section-mark" style={{ color: 'var(--cobalt)' }}>about AI analysis reports</span>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
                            This dashboard tracks all AI-generated medical report analyses. Each analysis automatically strips personal identifiable information (PII), assigns an urgency level, and matches patients with relevant specialists. Reports are stored for 24 hours then permanently deleted for HIPAA compliance.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
