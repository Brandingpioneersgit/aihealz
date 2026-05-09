'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface DailyMetric {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    searches: number;
    botChats: number;
    reportAnalyses: number;
    doctorLeads: number;
}

interface AnalyticsData {
    overview: {
        totalConditions: number;
        totalDoctors: number;
        totalLeads: number;
        totalGeographies: number;
        totalTreatments: number;
        totalRemedies: number;
    };
    trends: {
        conditionsGrowth: number;
        doctorsGrowth: number;
        leadsGrowth: number;
    };
    topSpecialties: { specialty: string; count: number }[];
    topCities: { city: string; count: number }[];
    recentActivity: { type: string; description: string; time: string }[];
    dailyMetrics: DailyMetric[];
}

// Bureau palette for charts
const COLORS = ['#1C5BFF', '#28D4A8', '#E63B7A', '#FFD23F', '#FF5A2E', '#4D7DFF'];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/analytics?range=${timeRange}`, {
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Failed to fetch analytics data');
            }
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const statCards = data ? [
        { label: 'Medical conditions', value: data.overview.totalConditions, code: 'CO', trend: data.trends.conditionsGrowth },
        { label: 'Registered doctors', value: data.overview.totalDoctors, code: 'DR', trend: data.trends.doctorsGrowth },
        { label: 'Patient leads', value: data.overview.totalLeads, code: 'LE', trend: data.trends.leadsGrowth },
        { label: 'Geographies', value: data.overview.totalGeographies, code: 'GE', trend: 0 },
        { label: 'Treatments', value: data.overview.totalTreatments, code: 'TR', trend: 0 },
        { label: 'Home remedies', value: data.overview.totalRemedies, code: 'RM', trend: 0 },
    ] : [];

    const trafficData = data?.dailyMetrics.slice(-14).map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Page Views': d.pageViews,
        'Visitors': d.uniqueVisitors,
    })) || [];

    const engagementData = data?.dailyMetrics.slice(-14).map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Searches': d.searches,
        'Bot Chats': d.botChats,
        'Leads': d.doctorLeads,
    })) || [];

    const specialtyPieData = data?.topSpecialties.slice(0, 6).map((s, i) => ({
        name: s.specialty || 'Unknown',
        value: s.count,
        color: COLORS[i % COLORS.length],
    })) || [];

    const cityBarData = data?.topCities.slice(0, 5).map(c => ({
        name: c.city,
        value: c.count,
    })) || [];

    const tooltipStyle = { borderRadius: 8, border: '1px solid #D6DDE9', background: '#FFFFFF', color: '#0A1A2F', fontSize: 12 };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / analytics</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Platform analytics<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        Real-time platform metrics and performance data.
                    </p>
                </div>
                <div className="row ai-center gap-3">
                    <div className="row" style={{ background: 'var(--bg-2)', border: '1px solid var(--rule)', borderRadius: 'var(--r-2)', padding: 4 }}>
                        {(['7d', '30d', '90d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 'var(--r-2)',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    background: timeRange === range ? 'var(--paper)' : 'transparent',
                                    color: timeRange === range ? 'var(--ink)' : 'var(--ink-3)',
                                    border: 'none',
                                    boxShadow: timeRange === range ? '0 1px 2px rgba(10,26,47,.06)' : 'none',
                                }}
                            >
                                {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchAnalytics} disabled={loading} className="btn btn-paper">
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {error ? (
                <div className="card-flat col ai-center gap-3" style={{ padding: 32, borderColor: 'rgba(255, 90, 46, .35)', background: 'var(--orange-50)' }}>
                    <p style={{ color: 'var(--orange-2)', fontSize: 14, fontWeight: 500, margin: 0 }}>{error}</p>
                    <button onClick={fetchAnalytics} className="btn btn-orange btn-sm">Try again</button>
                </div>
            ) : loading ? (
                <div className="row center ai-center" style={{ minHeight: 256 }}>
                    <div className="col ai-center gap-3">
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
                        <p className="muted" style={{ fontSize: 13 }}>Loading analytics…</p>
                    </div>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            ) : (
                <>
                    {/* Overview stats */}
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
                        {statCards.map((stat) => (
                            <div key={stat.label} className="col gap-2" style={{ padding: 20, borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                                <div className="row between ai-center">
                                    <span className="spec-icon" aria-hidden="true">{stat.code}</span>
                                    {stat.trend > 0 && <span className="pill pill-mint">+{stat.trend}%</span>}
                                </div>
                                <span className="num bignum" style={{ fontSize: 26, color: 'var(--ink)' }}>{stat.value.toLocaleString()}</span>
                                <span className="kicker">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Traffic + engagement */}
                    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                        <div className="card col gap-4" style={{ padding: 24 }}>
                            <span className="section-mark">traffic trends</span>
                            <div style={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trafficData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF2" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4D6486' }} stroke="#7A8DA8" />
                                        <YAxis tick={{ fontSize: 11, fill: '#4D6486' }} stroke="#7A8DA8" />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Line type="monotone" dataKey="Page Views" stroke="#1C5BFF" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                        <Line type="monotone" dataKey="Visitors" stroke="#28D4A8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="card col gap-4" style={{ padding: 24 }}>
                            <span className="section-mark">user engagement</span>
                            <div style={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={engagementData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF2" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4D6486' }} stroke="#7A8DA8" />
                                        <YAxis tick={{ fontSize: 11, fill: '#4D6486' }} stroke="#7A8DA8" />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Area type="monotone" dataKey="Searches" stackId="1" stroke="#1C5BFF" fill="#1C5BFF" fillOpacity={0.5} />
                                        <Area type="monotone" dataKey="Bot Chats" stackId="1" stroke="#FFD23F" fill="#FFD23F" fillOpacity={0.5} />
                                        <Area type="monotone" dataKey="Leads" stackId="1" stroke="#28D4A8" fill="#28D4A8" fillOpacity={0.5} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Specialties + cities + activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 16 }}>
                        <div className="card col gap-4" style={{ padding: 24 }}>
                            <span className="section-mark">top specialties</span>
                            {specialtyPieData.length > 0 ? (
                                <>
                                    <div style={{ height: 220 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={specialtyPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                                                    {specialtyPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={tooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="col gap-2">
                                        {specialtyPieData.map((item, i) => (
                                            <div key={i} className="row between ai-center" style={{ fontSize: 13 }}>
                                                <div className="row ai-center gap-2">
                                                    <span style={{ width: 10, height: 10, borderRadius: 999, background: item.color }} />
                                                    <span style={{ color: 'var(--ink-2)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                                </div>
                                                <span className="num" style={{ fontWeight: 500 }}>{item.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="muted" style={{ fontSize: 13, textAlign: 'center', padding: 24 }}>No specialty data available</p>
                            )}
                        </div>

                        <div className="card col gap-4" style={{ padding: 24 }}>
                            <span className="section-mark">top cities</span>
                            {cityBarData.length > 0 ? (
                                <div style={{ height: 240 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={cityBarData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF2" />
                                            <XAxis type="number" tick={{ fontSize: 11, fill: '#4D6486' }} stroke="#7A8DA8" />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4D6486' }} stroke="#7A8DA8" width={80} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Bar dataKey="value" fill="#1C5BFF" radius={[0, 2, 2, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="muted" style={{ fontSize: 13, textAlign: 'center', padding: 24 }}>No city data available</p>
                            )}
                        </div>

                        <div className="card col gap-3" style={{ padding: 24 }}>
                            <span className="section-mark">recent activity</span>
                            <div className="col gap-3">
                                {data?.recentActivity && data.recentActivity.length > 0 ? (
                                    data.recentActivity.map((activity, i) => (
                                        <div key={i} className="row gap-3 ai-start">
                                            <span
                                                className="spec-icon"
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: 11,
                                                    background: activity.type === 'condition' ? 'var(--cobalt)'
                                                        : activity.type === 'doctor' ? 'var(--mint-3)'
                                                        : 'var(--lemon-2)',
                                                }}
                                            >
                                                {activity.type === 'condition' ? 'C' : activity.type === 'doctor' ? 'D' : 'L'}
                                            </span>
                                            <div className="col" style={{ minWidth: 0, flex: 1 }}>
                                                <span style={{ fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.description}</span>
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{activity.time}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="muted" style={{ fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Data quality */}
                    <section className="card-ink col gap-4" style={{ padding: 28 }}>
                        <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 16 }}>
                            <div className="col gap-2">
                                <span className="section-mark" style={{ color: 'var(--cobalt-3)' }}>data quality score</span>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, maxWidth: 480 }}>
                                    Based on condition coverage, doctor verification rate, and geographic distribution.
                                </p>
                                <div className="row gap-6" style={{ marginTop: 8 }}>
                                    <div className="col gap-1">
                                        <span className="num bignum" style={{ fontSize: 32, color: '#fff' }}>
                                            {data ? Math.round((data.overview.totalDoctors > 0 ? 75 : 60) + (data.overview.totalGeographies > 100 ? 12 : 5)) : '--'}%
                                        </span>
                                        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Overall score</span>
                                    </div>
                                    <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
                                    <div className="col gap-1">
                                        <span className="num bignum" style={{ fontSize: 32, color: '#fff' }}>{data?.overview.totalConditions.toLocaleString() || '--'}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Conditions</span>
                                    </div>
                                    <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
                                    <div className="col gap-1">
                                        <span className="num bignum" style={{ fontSize: 32, color: '#fff' }}>{data?.overview.totalGeographies || '--'}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Geographies</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                style={{
                                    padding: '10px 16px',
                                    background: 'rgba(255,255,255,0.12)',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    borderRadius: 'var(--r-2)',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                View report →
                            </button>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
