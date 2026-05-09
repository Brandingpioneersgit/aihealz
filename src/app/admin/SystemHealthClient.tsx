'use client';

import { useState, useEffect } from 'react';

interface HealthCheck {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    latency?: number;
}

interface HealthData {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    totalCheckTime: number;
    checks: HealthCheck[];
}

const STATUS_PALETTE: Record<
    HealthData['status'],
    {
        dot: string;
        textColor: string;
        pillClass: string;
        accent: string;
        label: string;
    }
> = {
    healthy: {
        dot: 'var(--mint)',
        textColor: 'var(--mint-3)',
        pillClass: 'pill pill-mint',
        accent: 'var(--mint)',
        label: 'operational',
    },
    degraded: {
        dot: 'var(--lemon-2)',
        textColor: '#8C6A00',
        pillClass: 'pill pill-lemon',
        accent: 'var(--lemon-2)',
        label: 'degraded',
    },
    unhealthy: {
        dot: 'var(--orange)',
        textColor: 'var(--orange-2)',
        pillClass: 'pill pill-orange',
        accent: 'var(--orange)',
        label: 'incident',
    },
};

export function SystemHealthClient() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/health');
            if (res.ok) {
                const data = await res.json();
                setHealth(data);
                setLastChecked(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch health:', error);
            setHealth({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                totalCheckTime: 0,
                checks: [
                    {
                        service: 'Health Check',
                        status: 'unhealthy',
                        message: 'Failed to connect',
                    },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card col gap-5" style={{ padding: 24 }}>
            <div className="row between ai-center">
                <div className="col gap-1">
                    <span className="section-mark">infra / system status</span>
                    <h2 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>
                        Live health probes.
                    </h2>
                </div>
                <div className="row gap-3 ai-center">
                    {lastChecked && (
                        <span className="kicker">
                            checked · {lastChecked.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={fetchHealth}
                        disabled={loading}
                        className="btn btn-paper btn-sm"
                        style={{ minHeight: 32 }}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                animation: loading ? 'spin 1s linear infinite' : 'none',
                            }}
                        >
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {loading && !health ? (
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
                    {[1, 2, 3, 4].map((i, idx, arr) => (
                        <div
                            key={i}
                            className="col gap-2"
                            style={{
                                padding: 18,
                                borderRight: idx < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                animation: 'pulse-subtle 2s ease-in-out infinite',
                            }}
                        >
                            <div
                                style={{
                                    height: 10,
                                    width: '60%',
                                    background: 'var(--bg-3)',
                                    borderRadius: 2,
                                }}
                            />
                            <div
                                style={{
                                    height: 8,
                                    width: '40%',
                                    background: 'var(--bg-3)',
                                    borderRadius: 2,
                                }}
                            />
                        </div>
                    ))}
                </div>
            ) : health ? (
                <>
                    {/* Overall status banner */}
                    {(() => {
                        const palette = STATUS_PALETTE[health.status];
                        return (
                            <div
                                className="row between ai-center"
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: 'var(--r-3)',
                                    background: 'var(--paper-2)',
                                    border: '1px solid var(--rule)',
                                    borderLeft: `3px solid ${palette.accent}`,
                                }}
                            >
                                <div className="row gap-3 ai-center">
                                    <span
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 999,
                                            background: palette.dot,
                                            animation: health.status === 'healthy' ? 'pulse-subtle 3s infinite' : 'none',
                                        }}
                                    />
                                    <span
                                        className="display"
                                        style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}
                                    >
                                        System is{' '}
                                        <span style={{ color: palette.textColor }}>
                                            {palette.label}
                                        </span>
                                    </span>
                                </div>
                                <span className="kicker">
                                    probe · {health.totalCheckTime}ms
                                </span>
                            </div>
                        );
                    })()}

                    {/* Individual services */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: 0,
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {health.checks.map((check, i) => {
                            const palette = STATUS_PALETTE[check.status];
                            const cols = 4;
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= health.checks.length - (health.checks.length % cols || cols);
                            return (
                                <div
                                    key={check.service}
                                    className="col gap-2"
                                    style={{
                                        padding: 16,
                                        borderRight: !isLastCol ? '1px solid var(--rule)' : 'none',
                                        borderBottom: !isLastRow ? '1px solid var(--rule)' : 'none',
                                    }}
                                >
                                    <div className="row between ai-center">
                                        <div className="row gap-2 ai-center">
                                            <span
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 999,
                                                    background: palette.dot,
                                                }}
                                            />
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                                                {check.service}
                                            </span>
                                        </div>
                                        <span className={palette.pillClass} style={{ fontSize: 10, padding: '2px 6px' }}>
                                            {palette.label}
                                        </span>
                                    </div>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: 12,
                                            color: 'var(--ink-3)',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {check.message}
                                    </p>
                                    {check.latency !== undefined && (
                                        <span className="kicker">
                                            <span className="num">{check.latency}</span>ms
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : null}

            <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
        </div>
    );
}
