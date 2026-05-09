"use client";

import { useState, useEffect } from 'react';

interface SitemapEntry {
    sitemapName: string;
    urlCount: number;
    generationMs: number;
    generatedAt: string;
    isIndex: boolean;
}

interface SitemapData {
    indexing: {
        totalSubmitted: number;
        statusBreakdown: Record<string, number>;
    };
    countries: Array<{ countryCode: string; indexedPages: number }>;
    sitemaps: SitemapEntry[];
}

export default function SitemapMonitorPage() {
    const [data, setData] = useState<SitemapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/seo-monitor');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch sitemap data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async (sitemapName: string) => {
        setRegenerating(sitemapName);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            await fetchData();
        } catch (error) {
            console.error('Failed to regenerate:', error);
        } finally {
            setRegenerating(null);
        }
    };

    const handlePingGoogle = async (url: string) => {
        try {
            window.open(`https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`, '_blank');
        } catch (error) {
            console.error('Failed to ping Google:', error);
        }
    };

    const thStyle: React.CSSProperties = {
        padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--mono)',
        fontSize: 10, fontWeight: 600, color: 'var(--ink-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
    };
    const tdStyle: React.CSSProperties = {
        padding: '14px 16px', fontSize: 13, color: 'var(--ink-2)', verticalAlign: 'middle',
    };

    if (loading) {
        return (
            <div className="row ai-center center col gap-3" style={{ minHeight: 400 }}>
                <span
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        border: '3px solid var(--rule)',
                        borderTopColor: 'var(--cobalt)',
                        animation: 'spin 0.8s linear infinite',
                        display: 'inline-block',
                    }}
                />
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Loading sitemap data…
                </span>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    const totalUrls = data?.sitemaps.reduce((acc, s) => acc + (s.urlCount || 0), 0) || 0;
    const indexFiles = data?.sitemaps.filter((s) => s.isIndex).length || 0;
    const sitemapFiles = data?.sitemaps.filter((s) => !s.isIndex).length || 0;

    const statCards: Array<{ label: string; value: string; subtext: string; code: string }> = [
        { label: 'Index Files', value: indexFiles.toLocaleString(), subtext: 'sitemap.xml', code: 'IX' },
        { label: 'Sitemap Files', value: sitemapFiles.toLocaleString(), subtext: 'Individual sitemaps', code: 'SM' },
        { label: 'Total URLs', value: totalUrls.toLocaleString(), subtext: 'Across all sitemaps', code: 'UR' },
        { label: 'Countries Covered', value: (data?.countries.length || 0).toLocaleString(), subtext: 'Active regions', code: 'CO' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / sitemap monitor</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Sitemap Monitor<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage dynamically generated location and condition XML sitemaps.
                    </p>
                </div>
                <button onClick={fetchData} className="btn btn-cobalt">
                    ↻ Regenerate All
                </button>
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
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {s.subtext}
                        </span>
                    </div>
                ))}
            </div>

            {data?.countries && data.countries.length > 0 && (
                <div className="card col gap-3" style={{ padding: 20 }}>
                    <span className="section-mark">pages by country</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6" style={{ gap: 12 }}>
                        {data.countries.slice(0, 12).map((country) => (
                            <div key={country.countryCode} className="card-flat col gap-1" style={{ padding: 12 }}>
                                <span className="num bignum" style={{ fontSize: 18, color: 'var(--ink)' }}>
                                    {country.countryCode}
                                </span>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                    {country.indexedPages.toLocaleString()} pages
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="hairline-b" style={{ padding: 16 }}>
                    <span className="section-mark">sitemap files</span>
                </div>
                {!data?.sitemaps || data.sitemaps.length === 0 ? (
                    <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        No sitemaps generated yet
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                                <tr>
                                    <th scope="col" style={thStyle}>Sitemap File</th>
                                    <th scope="col" style={thStyle}>Type</th>
                                    <th scope="col" style={thStyle}>URLs</th>
                                    <th scope="col" style={thStyle}>Generation Time</th>
                                    <th scope="col" style={thStyle}>Last Generated</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.sitemaps.map((sitemap, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                        <td className="mono" style={{ ...tdStyle, color: 'var(--cobalt)', fontWeight: 500 }}>
                                            {sitemap.sitemapName}
                                        </td>
                                        <td style={tdStyle}>
                                            <span className={sitemap.isIndex ? 'pill pill-cobalt' : 'pill'}>
                                                {sitemap.isIndex ? 'Index' : 'Sitemap'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{sitemap.urlCount?.toLocaleString() || '—'}</td>
                                        <td className="mono" style={{ ...tdStyle, color: sitemap.generationMs > 5000 ? 'var(--lemon-2)' : 'var(--ink-2)' }}>
                                            {sitemap.generationMs}ms
                                        </td>
                                        <td style={tdStyle}>{new Date(sitemap.generatedAt).toLocaleString()}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <div className="row ai-center gap-1" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handlePingGoogle(`https://aihealz.com/${sitemap.sitemapName}`)}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    Ping Google
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerate(sitemap.sitemapName)}
                                                    disabled={regenerating === sitemap.sitemapName}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--cobalt)' }}
                                                >
                                                    {regenerating === sitemap.sitemapName ? 'Rebuilding…' : 'Rebuild'}
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

            {data?.indexing && (
                <div className="card col gap-3" style={{ padding: 20 }}>
                    <span className="section-mark">indexing status overview</span>
                    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
                        {Object.entries(data.indexing.statusBreakdown).map(([status, count]) => {
                            const isPositive = status === 'success' || status === 'submitted';
                            const isWarn = status === 'pending';
                            const isError = status === 'failed' || status === 'error';
                            const cardClass = isPositive ? 'card-flat' : isWarn ? 'card-flat' : isError ? 'card-flat' : 'card-flat';
                            const bg = isPositive ? 'var(--mint-50)' : isWarn ? 'var(--lemon-50)' : isError ? 'var(--orange-50)' : 'var(--bg-2)';
                            const borderColor = isPositive ? 'rgba(40, 212, 168, .30)' : isWarn ? 'rgba(230, 185, 40, .40)' : isError ? 'rgba(255, 90, 46, .28)' : 'var(--rule)';
                            return (
                                <div
                                    key={status}
                                    className={cardClass}
                                    style={{ padding: 16, background: bg, borderColor }}
                                >
                                    <div className="num bignum" style={{ fontSize: 24, color: 'var(--ink)' }}>
                                        {count}
                                    </div>
                                    <span className="kicker" style={{ textTransform: 'capitalize' }}>{status}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="card-quiet col gap-4" style={{ padding: 24 }}>
                <span className="section-mark">quick actions</span>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
                    {[
                        { label: 'Regenerate All', desc: 'Rebuild all sitemap files', code: '↻' },
                        { label: 'Submit to Google', desc: 'Ping Google Search Console', code: 'GS' },
                        { label: 'Download Index', desc: 'Export sitemap index XML', code: 'DL' },
                    ].map((a) => (
                        <button key={a.label} className="card row ai-center gap-3" style={{ padding: 16, textAlign: 'left' }}>
                            <span className="spec-icon" aria-hidden="true">{a.code}</span>
                            <div className="col" style={{ gap: 2 }}>
                                <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{a.label}</span>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {a.desc}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
