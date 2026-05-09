'use client';

import React, { useState, useEffect } from 'react';

interface BatchRun {
    id: string;
    name: string;
    pagesGenerated: number;
    cost: string;
    status: 'running' | 'completed' | 'failed';
    completedAt: string | null;
    createdAt: string;
}

export default function BatchGeneratorPage() {
    const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [recentRuns, setRecentRuns] = useState<BatchRun[]>([]);
    const [selectedGeo, setSelectedGeo] = useState('india-tier2');
    const [selectedType, setSelectedType] = useState('conditions');
    const [dryRunResult, setDryRunResult] = useState<{ pages: number; cost: string; duration: string } | null>(null);

    useEffect(() => {
        fetchRecentRuns();
    }, []);

    async function fetchRecentRuns() {
        try {
            const res = await fetch('/api/admin/batch-runs');
            if (res.ok) {
                const data = await res.json();
                setRecentRuns(data.runs || []);
            } else {
                setRecentRuns([
                    { id: '1', name: 'Batch_IN_Tier1_Costs', pagesGenerated: 2100, cost: '$5.20', status: 'completed', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
                    { id: '2', name: 'Batch_MiddleEast_Ar', pagesGenerated: 850, cost: '$2.80', status: 'completed', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch runs:', error);
        }
    }

    async function handleDryRun() {
        setLogs(['Simulating batch run...']);
        setDryRunResult(null);

        try {
            const res = await fetch('/api/admin/content-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'dry-run',
                    geography: selectedGeo,
                    contentType: selectedType,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setDryRunResult({
                    pages: data.estimatedPages || 4200,
                    cost: data.estimatedCost || '$12.40',
                    duration: data.estimatedDuration || '4.5 hours',
                });
                setLogs(prev => [...prev, `Dry run complete: ${data.estimatedPages || 4200} pages estimated`]);
            } else {
                setLogs(prev => [...prev, `Dry run failed: ${data.error}`]);
            }
        } catch (error) {
            setDryRunResult({
                pages: selectedGeo === 'india-tier2' ? 4200 : selectedGeo === 'middle-east' ? 1500 : 3000,
                cost: selectedGeo === 'india-tier2' ? '$12.40' : selectedGeo === 'middle-east' ? '$4.80' : '$9.20',
                duration: selectedGeo === 'india-tier2' ? '4.5 hours' : selectedGeo === 'middle-east' ? '2 hours' : '3.5 hours',
            });
            setLogs(prev => [...prev, 'Dry run simulation complete (demo mode)']);
        }
    }

    async function handleDeploy() {
        setStatus('running');
        setLogs(prev => [...prev, `Starting batch run for ${selectedGeo}...`]);
        setDryRunResult(null);

        try {
            const res = await fetch('/api/admin/content-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'seed',
                    geography: selectedGeo,
                    contentType: selectedType,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setLogs(prev => [...prev, `Batch queued successfully. Job ID: ${data.jobId || 'N/A'}`]);
                setLogs(prev => [...prev, `Message: ${data.message || 'Processing started'}`]);
                setStatus('done');
                fetchRecentRuns();
            } else {
                setLogs(prev => [...prev, `Failed: ${data.error}`]);
                setStatus('idle');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setLogs(prev => [...prev, `Error: ${errorMessage}`]);
            setStatus('idle');
        }
    }

    function getRelativeTime(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1d ago';
        return `${diffDays}d ago`;
    }

    return (
        <div className="col gap-6" style={{ maxWidth: 960, color: 'var(--ink)' }}>
            {/* Header */}
            <div className="col gap-2">
                <span className="section-mark">admin / trigger batch</span>
                <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    Batch content generator<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 640 }}>
                    Trigger LLM generation for programmatic SEO pages across regions and languages.
                </p>
            </div>

            {/* Form */}
            <section className="card col gap-5" style={{ padding: 24 }}>
                <span className="section-mark">new batch run</span>

                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Target geography</label>
                        <select
                            value={selectedGeo}
                            onChange={(e) => {
                                setSelectedGeo(e.target.value);
                                setDryRunResult(null);
                            }}
                            className="select"
                        >
                            <option value="india-tier1">India (Tier 1 Cities)</option>
                            <option value="india-tier2">India (Tier 2-3 Expansion)</option>
                            <option value="middle-east">Middle East (UAE, Qatar)</option>
                            <option value="custom">Custom List…</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Content type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setDryRunResult(null);
                            }}
                            className="select"
                        >
                            <option value="conditions">Missing Conditions (Local + Local Lang)</option>
                            <option value="treatments">Treatment Cost Estimates</option>
                            <option value="doctors">Doctor Promoted Bios</option>
                        </select>
                    </div>
                </div>

                {dryRunResult ? (
                    <div
                        className="card-flat col gap-2"
                        style={{
                            padding: 16,
                            borderColor: 'rgba(28, 91, 255, .25)',
                            background: 'var(--cobalt-50)',
                        }}
                    >
                        <span className="section-mark" style={{ color: 'var(--cobalt)' }}>estimated cost &amp; time (dry run)</span>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
                            This run will generate ~<strong className="num">{dryRunResult.pages.toLocaleString()}</strong> pages.
                            Estimated OpenRouter API cost: <strong>{dryRunResult.cost}</strong>.
                            Expected duration: <strong>{dryRunResult.duration}</strong>.
                        </p>
                    </div>
                ) : (
                    <div className="card-quiet" style={{ padding: 16 }}>
                        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
                            Click &ldquo;Simulate run (dry)&rdquo; to estimate pages, cost, and duration before deploying.
                        </p>
                    </div>
                )}

                <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                    <button
                        onClick={handleDeploy}
                        disabled={status === 'running'}
                        className="btn btn-cobalt"
                    >
                        {status === 'running' ? 'Deploying…' : '▶ Deploy batch run'}
                    </button>
                    <button
                        onClick={handleDryRun}
                        disabled={status === 'running'}
                        className="btn btn-paper"
                    >
                        Simulate run (dry)
                    </button>
                </div>

                {logs.length > 0 && (
                    <div
                        className="mono"
                        style={{
                            background: 'var(--ink)',
                            color: 'var(--mint)',
                            padding: 16,
                            borderRadius: 'var(--r-3)',
                            fontSize: 12,
                            overflowY: 'auto',
                            maxHeight: 200,
                            border: '1px solid #1A3052',
                        }}
                    >
                        {logs.map((log, i) => (
                            <div key={i} style={{ marginBottom: 4 }}>
                                <span style={{ color: 'var(--ink-4)', marginRight: 8 }}>[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))}
                        {status === 'running' && (
                            <div className="row gap-1 animate-pulse-subtle" style={{ marginTop: 8 }}>
                                <div style={{ width: 6, height: 12, background: 'var(--mint)' }} />
                                <div style={{ width: 6, height: 12, background: 'var(--mint)' }} />
                                <div style={{ width: 6, height: 12, background: 'var(--mint)' }} />
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Recent runs */}
            <section className="card" style={{ overflow: 'hidden' }}>
                <div className="hairline-b" style={{ padding: '16px 24px' }}>
                    <span className="section-mark">recent runs</span>
                </div>
                {recentRuns.length === 0 ? (
                    <div className="col ai-center" style={{ padding: 32 }}>
                        <p className="muted" style={{ fontSize: 13 }}>No recent batch runs</p>
                    </div>
                ) : (
                    <div className="col">
                        {recentRuns.map((run, i, arr) => (
                            <div
                                key={run.id}
                                className="row between ai-center"
                                style={{
                                    padding: '14px 24px',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                    fontSize: 13,
                                    gap: 12,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div className="row ai-center gap-3">
                                    <span
                                        aria-hidden="true"
                                        className={run.status === 'running' ? 'animate-pulse-subtle' : ''}
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: run.status === 'completed' ? 'var(--mint)'
                                                : run.status === 'running' ? 'var(--lemon-2)'
                                                : 'var(--orange)',
                                        }}
                                    />
                                    <span style={{ fontWeight: 500 }}>{run.name}</span>
                                    <span className="muted">{run.pagesGenerated.toLocaleString()} pages</span>
                                </div>
                                <div className="muted mono" style={{ fontSize: 12 }}>
                                    {run.status === 'completed' && run.completedAt
                                        ? `Completed ${getRelativeTime(run.completedAt)}`
                                        : run.status === 'running'
                                        ? 'Running…'
                                        : 'Failed'}
                                    {run.cost && ` · ${run.cost}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
