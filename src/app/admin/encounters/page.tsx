"use client";

import { useState, useEffect } from 'react';

interface EnquiryData {
    period: string;
    responseTime: {
        average: number | null;
        fastest: number | null;
        slowest: number | null;
        totalEnquiries: number;
    };
    aiConfidence: {
        average: number | null;
    };
    outcomes: Record<string, number>;
    geoHeatmap: Array<{
        city: string;
        citySlug: string | null;
        enquiries: number;
    }>;
    supplyVsDemand: Array<{
        city: string;
        enquiries: number;
        doctors: number;
        premiumDoctors: number;
        isHighOpportunity: boolean;
    }>;
    topConditions: Array<{
        condition: string;
        count: number;
    }>;
}

export default function EncountersPage() {
    const [data, setData] = useState<EnquiryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/enquiry-monitor');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch enquiry data:', error);
        } finally {
            setLoading(false);
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
                    <p className="muted" style={{ fontSize: 13 }}>Loading encounter data…</p>
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

    const totalOutcomes = Object.values(data.outcomes).reduce((a, b) => a + b, 0);
    const hasNoData = data.responseTime.totalEnquiries === 0 && data.geoHeatmap.length === 0 && data.topConditions.length === 0;

    if (hasNoData) {
        return (
            <div className="col gap-6" style={{ color: 'var(--ink)' }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / encounters</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Encounters &amp; enquiries<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        Monitor patient enquiries, response times, and geographic demand.
                    </p>
                </div>

                <div className="card col ai-center gap-3" style={{ padding: 64, textAlign: 'center' }}>
                    <span className="spec-icon" style={{ width: 56, height: 56, fontSize: 22 }}>EN</span>
                    <h2 className="display" style={{ fontSize: 22, margin: 0, fontWeight: 600 }}>No encounters yet</h2>
                    <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 480 }}>
                        Patient enquiries and encounters will appear here once users start interacting with the AI symptom checker and doctor recommendations.
                    </p>
                    <button onClick={fetchData} className="btn btn-paper" style={{ marginTop: 8 }}>↻ Refresh data</button>
                </div>

                <section className="card-flat col gap-4" style={{ padding: 24, borderColor: 'rgba(28, 91, 255, .25)', background: 'var(--cobalt-50)' }}>
                    <span className="section-mark" style={{ color: 'var(--cobalt)' }}>what gets tracked here?</span>
                    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                        {[
                            { label: 'Patient enquiries', desc: 'Questions submitted through the symptom checker' },
                            { label: 'Response times', desc: 'How quickly doctors respond to leads' },
                            { label: 'Geographic demand', desc: 'Which cities have the most enquiries' },
                        ].map((b) => (
                            <div key={b.label} className="card-quiet col gap-1" style={{ padding: 14 }}>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{b.label}</span>
                                <span className="muted" style={{ fontSize: 12 }}>{b.desc}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    const outcomePill = (outcome: string) => {
        switch (outcome) {
            case 'completed': return 'pill pill-mint';
            case 'pending': return 'pill pill-lemon';
            case 'cancelled': return 'pill pill-orange';
            case 'rescheduled': return 'pill pill-cobalt';
            default: return 'pill';
        }
    };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / encounters</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Encounters &amp; enquiries<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        Monitor patient enquiries, response times, and geographic demand.
                    </p>
                </div>
                <div className="row ai-center gap-3">
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Period: {data.period}
                    </span>
                    <button onClick={fetchData} className="btn btn-paper">↻ Refresh</button>
                </div>
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
                    { label: 'Total enquiries', value: data.responseTime.totalEnquiries.toLocaleString(), sub: 'Last 30 days' },
                    { label: 'Avg response time', value: data.responseTime.average ? `${data.responseTime.average} min` : 'N/A', sub: data.responseTime.fastest ? `Best: ${data.responseTime.fastest} min` : '', subTone: 'mint' },
                    { label: 'AI confidence', value: data.aiConfidence.average ? `${Math.round(data.aiConfidence.average * 100)}%` : 'N/A', sub: 'Average score', subTone: 'cobalt' },
                    { label: 'High-opportunity cities', value: data.supplyVsDemand.filter(s => s.isHighOpportunity).length.toLocaleString(), sub: 'Need more doctors', subTone: 'magenta' },
                ].map((m) => (
                    <div key={m.label} className="col gap-2" style={{ padding: 20, borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                        <span className="kicker">{m.label}</span>
                        <span className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>{m.value}</span>
                        {m.sub && (
                            <span className="mono" style={{
                                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
                                color: m.subTone === 'mint' ? 'var(--mint-3)' : m.subTone === 'cobalt' ? 'var(--cobalt)' : m.subTone === 'magenta' ? 'var(--magenta)' : 'var(--ink-3)',
                            }}>{m.sub}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Outcome distribution */}
            <section className="card col gap-4" style={{ padding: 24 }}>
                <span className="section-mark">outcome distribution</span>
                <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                    {Object.entries(data.outcomes).map(([outcome, count]) => (
                        <div key={outcome} className={outcomePill(outcome)} style={{ padding: '8px 14px', textTransform: 'none', fontSize: 12 }}>
                            <span className="num" style={{ fontWeight: 600 }}>{count}</span>
                            <span style={{ marginLeft: 6, textTransform: 'capitalize' }}>{outcome.replace(/_/g, ' ')}</span>
                            <span style={{ marginLeft: 6, opacity: 0.7 }}>
                                ({totalOutcomes > 0 ? Math.round((count / totalOutcomes) * 100) : 0}%)
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                {/* Geo heatmap */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="col gap-1 hairline-b" style={{ padding: '16px 24px' }}>
                        <span className="section-mark">enquiries by city</span>
                        <span className="muted" style={{ fontSize: 13 }}>Top cities by enquiry volume</span>
                    </div>
                    {data.geoHeatmap.length === 0 ? (
                        <div className="col ai-center" style={{ padding: 48 }}>
                            <p className="muted" style={{ fontSize: 13 }}>No geographic data available</p>
                        </div>
                    ) : (
                        <div className="col">
                            {data.geoHeatmap.slice(0, 10).map((geo, i, arr) => (
                                <div
                                    key={i}
                                    className="row between ai-center"
                                    style={{
                                        padding: '12px 24px',
                                        borderBottom: i < arr.length - 1 ? '1px solid var(--rule-2)' : 'none',
                                    }}
                                >
                                    <div className="row ai-center gap-3">
                                        <span className="spec-icon" style={{ width: 24, height: 24, fontSize: 11 }}>{i + 1}</span>
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>{geo.city}</span>
                                    </div>
                                    <div className="row ai-center gap-3">
                                        <div style={{ width: 120, height: 6, background: 'var(--bg-2)', borderRadius: 999, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${(geo.enquiries / (data.geoHeatmap[0]?.enquiries || 1)) * 100}%`, background: 'var(--cobalt)' }} />
                                        </div>
                                        <span className="num" style={{ fontWeight: 600, width: 40, textAlign: 'right', fontSize: 13 }}>{geo.enquiries}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top conditions */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="col gap-1 hairline-b" style={{ padding: '16px 24px' }}>
                        <span className="section-mark">top conditions</span>
                        <span className="muted" style={{ fontSize: 13 }}>Most enquired conditions</span>
                    </div>
                    {data.topConditions.length === 0 ? (
                        <div className="col ai-center" style={{ padding: 48 }}>
                            <p className="muted" style={{ fontSize: 13 }}>No condition data available</p>
                        </div>
                    ) : (
                        <div className="col">
                            {data.topConditions.slice(0, 10).map((cond, i, arr) => (
                                <div
                                    key={i}
                                    className="row between ai-center"
                                    style={{
                                        padding: '12px 24px',
                                        borderBottom: i < arr.length - 1 ? '1px solid var(--rule-2)' : 'none',
                                    }}
                                >
                                    <div className="row ai-center gap-3">
                                        <span className="spec-icon" style={{ width: 24, height: 24, fontSize: 11 }}>{i + 1}</span>
                                        <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>
                                            {cond.condition?.replace(/-/g, ' ') || 'Unknown'}
                                        </span>
                                    </div>
                                    <span className="num" style={{ fontWeight: 600, fontSize: 13 }}>{cond.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Supply vs demand */}
            <section className="card" style={{ overflow: 'hidden' }}>
                <div className="col gap-1 hairline-b" style={{ padding: '16px 24px' }}>
                    <span className="section-mark">supply vs demand analysis</span>
                    <span className="muted" style={{ fontSize: 13 }}>Identify cities where demand exceeds doctor supply</span>
                </div>
                {data.supplyVsDemand.length === 0 ? (
                    <div className="col ai-center" style={{ padding: 48 }}>
                        <p className="muted" style={{ fontSize: 13 }}>No supply/demand data available</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-2)' }}>
                                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                    {['City', 'Enquiries', 'Verified doctors', 'Premium doctors', 'Ratio', 'Status'].map(h => (
                                        <th key={h} scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.supplyVsDemand.map((city, i) => {
                                    const ratio = city.doctors > 0 ? (city.enquiries / city.doctors).toFixed(1) : 'N/A';
                                    const ratioNum = ratio === 'N/A' ? null : parseFloat(ratio);
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--rule-2)', background: city.isHighOpportunity ? 'var(--lemon-50)' : 'transparent' }}>
                                            <td style={{ padding: 14, fontWeight: 500 }}>{city.city}</td>
                                            <td className="num" style={{ padding: 14, color: 'var(--ink-2)' }}>{city.enquiries}</td>
                                            <td className="num" style={{ padding: 14, color: 'var(--ink-2)' }}>{city.doctors}</td>
                                            <td className="num" style={{ padding: 14, color: 'var(--ink-2)' }}>{city.premiumDoctors}</td>
                                            <td style={{ padding: 14 }}>
                                                <span
                                                    className="num"
                                                    style={{
                                                        fontWeight: 600,
                                                        color: ratioNum === null || ratioNum > 10 ? 'var(--orange-2)'
                                                            : ratioNum > 5 ? 'var(--lemon-2)'
                                                            : 'var(--mint-3)',
                                                    }}
                                                >
                                                    {ratio}{ratio !== 'N/A' && 'x'}
                                                </span>
                                            </td>
                                            <td style={{ padding: 14 }}>
                                                {city.isHighOpportunity ? (
                                                    <span className="pill pill-lemon">High opportunity</span>
                                                ) : (
                                                    <span className="pill pill-mint">Balanced</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Insights */}
            <section className="card-flat col gap-4" style={{ padding: 24, borderColor: 'rgba(28, 91, 255, .25)', background: 'var(--cobalt-50)' }}>
                <span className="section-mark" style={{ color: 'var(--cobalt)' }}>key insights</span>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                    <div className="card col gap-2" style={{ padding: 16 }}>
                        <span className="kicker">Response performance</span>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
                            {data.responseTime.average && data.responseTime.average < 30
                                ? 'Excellent response times. Keep it up!'
                                : data.responseTime.average && data.responseTime.average < 60
                                ? 'Good response times. Room for improvement.'
                                : 'Response times need attention.'}
                        </p>
                    </div>
                    <div className="card col gap-2" style={{ padding: 16 }}>
                        <span className="kicker">Market gaps</span>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
                            {data.supplyVsDemand.filter(s => s.isHighOpportunity).length > 0
                                ? `${data.supplyVsDemand.filter(s => s.isHighOpportunity).length} cities need more premium doctors.`
                                : 'Doctor supply meets demand in all cities.'}
                        </p>
                    </div>
                    <div className="card col gap-2" style={{ padding: 16 }}>
                        <span className="kicker">Top demand</span>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
                            {data.topConditions[0]
                                ? `"${data.topConditions[0].condition?.replace(/-/g, ' ')}" is the most searched condition.`
                                : 'No condition data available yet.'}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
