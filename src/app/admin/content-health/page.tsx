"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StaleContent {
    url: string;
    pageType: string;
    freshnessScore: number | null;
    lastModified: string;
    refreshReason: string | null;
    countryCode: string;
}

interface KeywordGap {
    keyword: string;
    searchVolume: number;
    currentRank: number | null;
    competitor: string | null;
    competitorRank: number | null;
    countryCode: string;
    opportunityScore: number | null;
    suggestedAction: string | null;
}

interface IndexSubmission {
    url: string;
    indexApi: string;
    status: string;
    responseCode: number | null;
    submittedAt: string;
    pageType: string;
}

interface SEOData {
    indexing: {
        totalSubmitted: number;
        statusBreakdown: Record<string, number>;
        apiBreakdown: Record<string, number>;
        recentSubmissions: IndexSubmission[];
    };
    freshness: {
        averageScore: number;
        totalTracked: number;
        staleContent: StaleContent[];
    };
    keywordGaps: KeywordGap[];
    countries: Array<{ countryCode: string; indexedPages: number }>;
    sitemaps: Array<{
        sitemapName: string;
        urlCount: number;
        generationMs: number;
        generatedAt: string;
        isIndex: boolean;
    }>;
}

export default function ContentHealthPage() {
    const [data, setData] = useState<SEOData | null>(null);
    const [loading, setLoading] = useState(true);
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'freshness' | 'indexing' | 'keywords'>('freshness');
    const [auditing, setAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [countryFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = countryFilter
                ? `/api/admin/seo-monitor?country=${countryFilter}`
                : '/api/admin/seo-monitor';
            const res = await fetch(url);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch SEO data:', error);
        } finally {
            setLoading(false);
        }
    };

    const runFullAudit = async () => {
        setAuditing(true);
        setAuditResult(null);
        try {
            const res = await fetch('/api/admin/content-health/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryFilter || 'all' }),
            });
            const json = await res.json();
            if (res.ok) {
                setAuditResult({
                    type: 'success',
                    message: `Audit complete: ${json.pagesChecked} pages analyzed, ${json.issuesFound} issues found.`,
                });
                await fetchData();
            } else {
                setAuditResult({
                    type: 'error',
                    message: json.error || 'Failed to run audit',
                });
            }
        } catch (error) {
            console.error('Audit failed:', error);
            setAuditResult({
                type: 'error',
                message: 'Failed to run audit. Please try again.',
            });
        } finally {
            setAuditing(false);
            setTimeout(() => setAuditResult(null), 5000);
        }
    };

    const getPriorityPill = (score: number | null) => {
        if (!score) return 'pill';
        if (score < 0.5) return 'pill pill-orange';
        if (score < 0.8) return 'pill pill-lemon';
        return 'pill pill-mint';
    };

    const getStatusPill = (status: string) => {
        switch (status) {
            case 'submitted':
            case 'success':
                return 'pill pill-mint';
            case 'pending':
                return 'pill pill-lemon';
            case 'failed':
            case 'error':
                return 'pill pill-orange';
            default:
                return 'pill';
        }
    };

    if (loading) {
        return (
            <div className="row center ai-center" style={{ minHeight: 400 }}>
                <div className="col ai-center gap-3">
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
                    <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Loading SEO health data…
                    </p>
                </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="col ai-center gap-3" style={{ padding: '64px 0' }}>
                <p className="muted" style={{ fontSize: 14 }}>Failed to load data. Please try again.</p>
                <button onClick={fetchData} className="btn btn-cobalt">Retry</button>
            </div>
        );
    }

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / content health</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Content health<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        Monitor SEO performance, content freshness, and indexing status.
                    </p>
                </div>
                <div className="row ai-center gap-3" style={{ flexWrap: 'wrap' }}>
                    <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="select"
                        style={{ minWidth: 200 }}
                    >
                        <option value="">All countries</option>
                        {data.countries.map((c) => (
                            <option key={c.countryCode} value={c.countryCode}>
                                {c.countryCode} ({c.indexedPages.toLocaleString()} pages)
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={runFullAudit}
                        disabled={auditing}
                        className="btn btn-cobalt"
                    >
                        {auditing ? 'Running audit…' : 'Run full audit →'}
                    </button>
                </div>
            </div>

            {auditResult && (
                <div
                    role="status"
                    className="card-flat"
                    style={{
                        padding: '12px 16px',
                        borderColor: auditResult.type === 'success' ? 'rgba(40, 212, 168, .35)' : 'rgba(255, 90, 46, .35)',
                        background: auditResult.type === 'success' ? 'var(--mint-50)' : 'var(--orange-50)',
                        color: auditResult.type === 'success' ? 'var(--mint-3)' : 'var(--orange-2)',
                        fontSize: 13,
                    }}
                >
                    {auditResult.message}
                </div>
            )}

            {/* Overview metrics */}
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
                    { label: 'Total indexed', value: data.indexing.totalSubmitted.toLocaleString(), sub: 'Pages submitted', subTone: 'cobalt' },
                    {
                        label: 'Avg. freshness',
                        value: `${Math.round(data.freshness.averageScore * 100)}/100`,
                        sub: data.freshness.averageScore >= 0.8 ? 'Excellent health' : data.freshness.averageScore >= 0.6 ? 'Needs attention' : 'Critical',
                        subTone: data.freshness.averageScore >= 0.8 ? 'mint' : data.freshness.averageScore >= 0.6 ? 'lemon' : 'orange',
                    },
                    {
                        label: 'Needs refresh',
                        value: data.freshness.staleContent.length.toLocaleString(),
                        sub: 'Stale pages',
                        subTone: data.freshness.staleContent.length > 50 ? 'orange' : 'muted',
                    },
                    { label: 'Keyword opportunities', value: data.keywordGaps.length.toLocaleString(), sub: 'Gaps to address', subTone: 'cobalt' },
                ].map((m, i) => (
                    <div
                        key={m.label}
                        className="col gap-2"
                        style={{
                            padding: 20,
                            borderRight: '1px solid var(--rule)',
                            borderBottom: '1px solid var(--rule)',
                        }}
                    >
                        <span className="kicker">{m.label}</span>
                        <span className="num bignum" style={{ fontSize: 32, color: 'var(--ink)' }}>{m.value}</span>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: m.subTone === 'mint' ? 'var(--mint-3)'
                                    : m.subTone === 'lemon' ? 'var(--lemon-2)'
                                    : m.subTone === 'orange' ? 'var(--orange-2)'
                                    : m.subTone === 'cobalt' ? 'var(--cobalt)'
                                    : 'var(--ink-3)',
                            }}
                        >
                            {m.sub}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="row hairline-b" style={{ gap: 8 }}>
                {[
                    { id: 'freshness', label: 'Content freshness', count: data.freshness.staleContent.length },
                    { id: 'indexing', label: 'Index submissions', count: data.indexing.recentSubmissions.length },
                    { id: 'keywords', label: 'Keyword gaps', count: data.keywordGaps.length },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            fontWeight: 500,
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--cobalt)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--cobalt)' : 'var(--ink-3)',
                            marginBottom: -1,
                        }}
                    >
                        {tab.label}
                        <span className="pill" style={{ marginLeft: 8 }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Freshness tab */}
            {activeTab === 'freshness' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="row ai-center hairline-b" style={{ padding: '16px 24px' }}>
                        <span className="section-mark">pages needing attention</span>
                    </div>
                    {data.freshness.staleContent.length === 0 ? (
                        <div className="col ai-center gap-3" style={{ padding: 48 }}>
                            <span className="spec-icon" style={{ background: 'var(--mint)', width: 48, height: 48, fontSize: 22 }}>✓</span>
                            <h3 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600 }}>All content is fresh</h3>
                            <p className="muted" style={{ fontSize: 13, margin: 0 }}>No pages need refreshing at this time.</p>
                        </div>
                    ) : (
                        <div className="col">
                            {data.freshness.staleContent.map((item, i, arr) => (
                                <div
                                    key={i}
                                    className="row between ai-center"
                                    style={{
                                        padding: '14px 24px',
                                        borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                        gap: 16,
                                    }}
                                >
                                    <div className="col gap-1" style={{ minWidth: 0, flex: 1 }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{item.pageType}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            Last modified: {new Date(item.lastModified).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="row ai-center gap-3" style={{ flexShrink: 0 }}>
                                        <span className={getPriorityPill(item.freshnessScore)}>
                                            {item.refreshReason || 'Needs refresh'}
                                        </span>
                                        <span className="num" style={{ fontSize: 14, fontWeight: 600 }}>
                                            {item.freshnessScore ? Math.round(item.freshnessScore * 100) : 0}%
                                        </span>
                                        <button className="btn btn-paper btn-sm">Refresh</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Indexing tab */}
            {activeTab === 'indexing' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="row between ai-center hairline-b" style={{ padding: '16px 24px', flexWrap: 'wrap', gap: 12 }}>
                        <span className="section-mark">recent index submissions</span>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            {Object.entries(data.indexing.statusBreakdown).map(([status, count]) => (
                                <span key={status} className={getStatusPill(status)}>
                                    {status}: {count}
                                </span>
                            ))}
                        </div>
                    </div>
                    {data.indexing.recentSubmissions.length === 0 ? (
                        <div className="col ai-center" style={{ padding: 48 }}>
                            <p className="muted" style={{ fontSize: 13 }}>No recent submissions</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', minWidth: 560, fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-2)' }}>
                                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                    <th scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>URL</th>
                                    <th scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>API</th>
                                    <th scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Status</th>
                                    <th scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Response</th>
                                    <th scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.indexing.recentSubmissions.map((sub, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--rule-2)' }}>
                                        <td className="mono" style={{ padding: 14, fontSize: 12, color: 'var(--ink-3)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.url}</td>
                                        <td style={{ padding: 14, color: 'var(--ink-2)' }}>{sub.indexApi}</td>
                                        <td style={{ padding: 14 }}>
                                            <span className={getStatusPill(sub.status)}>{sub.status}</span>
                                        </td>
                                        <td className="num" style={{ padding: 14, color: 'var(--ink-2)' }}>{sub.responseCode || '—'}</td>
                                        <td className="mono" style={{ padding: 14, fontSize: 12, color: 'var(--ink-4)' }}>{new Date(sub.submittedAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>
            )}

            {/* Keywords tab */}
            {activeTab === 'keywords' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="col gap-1 hairline-b" style={{ padding: '16px 24px' }}>
                        <span className="section-mark">keyword opportunities</span>
                        <span className="muted" style={{ fontSize: 13 }}>Keywords where competitors outrank you</span>
                    </div>
                    {data.keywordGaps.length === 0 ? (
                        <div className="col ai-center" style={{ padding: 48 }}>
                            <p className="muted" style={{ fontSize: 13 }}>No keyword gaps identified</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', minWidth: 680, fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-2)' }}>
                                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                    {['Keyword', 'Volume', 'Your rank', 'Competitor', 'Opportunity', 'Action'].map(h => (
                                        <th key={h} scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.keywordGaps.map((gap, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--rule-2)' }}>
                                        <td style={{ padding: 14, fontWeight: 500 }}>{gap.keyword}</td>
                                        <td className="num" style={{ padding: 14, color: 'var(--ink-2)' }}>{gap.searchVolume?.toLocaleString() || '—'}</td>
                                        <td style={{ padding: 14 }}>
                                            <span
                                                className="num"
                                                style={{
                                                    fontWeight: 600,
                                                    color: gap.currentRank && gap.currentRank <= 10 ? 'var(--mint-3)'
                                                        : gap.currentRank && gap.currentRank <= 30 ? 'var(--lemon-2)'
                                                        : 'var(--ink-4)',
                                                }}
                                            >
                                                #{gap.currentRank || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ padding: 14, color: 'var(--ink-2)' }}>
                                            {gap.competitor && (
                                                <span>
                                                    {gap.competitor} <span className="num" style={{ color: 'var(--mint-3)', fontWeight: 600 }}>#{gap.competitorRank}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            <div style={{ width: 80, height: 6, background: 'var(--bg-2)', borderRadius: 999, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${(gap.opportunityScore || 0) * 100}%`, background: 'var(--cobalt)' }} />
                                            </div>
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            <span className="pill pill-cobalt">{gap.suggestedAction || 'Create content'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>
            )}

            {/* Sitemap overview */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="row between ai-center hairline-b" style={{ padding: '16px 24px' }}>
                    <span className="section-mark">recent sitemaps</span>
                    <Link
                        href="/admin/sitemap"
                        className="mono"
                        style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                    >
                        View all sitemaps →
                    </Link>
                </div>
                <div className="col">
                    {data.sitemaps.slice(0, 5).map((sitemap, i, arr) => (
                        <div
                            key={i}
                            className="row between ai-center"
                            style={{
                                padding: '12px 24px',
                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                gap: 12,
                                flexWrap: 'wrap',
                            }}
                        >
                            <div className="row ai-center gap-3">
                                <span className="mono" style={{ fontSize: 13, color: 'var(--cobalt)' }}>{sitemap.sitemapName}</span>
                                {sitemap.isIndex && <span className="pill pill-cobalt">Index</span>}
                            </div>
                            <div className="row ai-center gap-5 mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                                <span>{sitemap.urlCount?.toLocaleString() || '—'} URLs</span>
                                <span>{sitemap.generationMs}ms</span>
                                <span>{new Date(sitemap.generatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
