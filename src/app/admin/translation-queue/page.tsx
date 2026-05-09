'use client';

import React, { useState } from 'react';

export default function TranslationQueuePage() {
    const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('hi');

    const handleTranslate = async () => {
        setStatus('running');
        setLogs((prev) => [...prev, `Starting batch translation from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}…`]);

        try {
            const res = await fetch('/api/admin/translation-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: sourceLang,
                    target: targetLang,
                    limit: 50,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setLogs((prev) => [...prev, `Translation queued successfully. Jobs added: ${data.queued || 50}`]);
                setStatus('done');
            } else {
                setLogs((prev) => [...prev, `Failed: ${data.error}`]);
                setStatus('idle');
            }
        } catch (error: unknown) {
            setLogs((prev) => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown'}`]);
            setStatus('idle');
        }
    };

    return (
        <div className="col gap-6" style={{ maxWidth: 960, color: 'var(--ink)' }}>
            <div className="col gap-2">
                <span className="section-mark">admin / translation queue</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    Translation Queue<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                    Manage AI-driven semantic translations for global markets.
                </p>
            </div>

            <div className="card col gap-5" style={{ padding: 24 }}>
                <span className="section-mark">new translation batch</span>

                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Source Language</label>
                        <select
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                            className="select"
                        >
                            <option value="en">English (EN)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Target Language</label>
                        <select
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="select"
                        >
                            <option value="hi">Hindi (IN)</option>
                            <option value="ar">Arabic (UAE)</option>
                            <option value="es">Spanish (MX)</option>
                            <option value="pt">Portuguese (BR)</option>
                        </select>
                    </div>
                </div>

                <div
                    className="card-flat row ai-start gap-3"
                    style={{
                        padding: 16,
                        background: 'var(--cobalt-50)',
                        borderColor: 'rgba(28, 91, 255, .22)',
                    }}
                >
                    <span className="kicker" style={{ color: 'var(--cobalt)', flexShrink: 0 }}>i</span>
                    <div className="col gap-1">
                        <span style={{ fontWeight: 500, color: 'var(--cobalt-2)' }}>Translation metrics</span>
                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                            Found <strong>3,402</strong> missing translations for {targetLang.toUpperCase()}.
                            Estimated LLM token cost: <strong style={{ color: 'var(--cobalt-2)' }}>$8.50</strong>.
                        </span>
                    </div>
                </div>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button
                        onClick={handleTranslate}
                        disabled={status === 'running'}
                        className="btn btn-cobalt"
                    >
                        {status === 'running' ? 'Processing…' : 'Run Translation Batch →'}
                    </button>
                </div>

                {logs.length > 0 && (
                    <div
                        className="mono card-ink"
                        style={{
                            padding: 16,
                            fontSize: 12,
                            color: 'var(--mint)',
                            overflowY: 'auto',
                            maxHeight: 192,
                        }}
                    >
                        {logs.map((log, i) => (
                            <div key={i} className="row gap-2" style={{ marginBottom: 6 }}>
                                <span style={{ color: 'var(--ink-5)', flexShrink: 0 }}>[{new Date().toLocaleTimeString()}]</span>
                                <span>{log}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                <div className="card col gap-2" style={{ padding: 24 }}>
                    <span className="kicker">Queue Status</span>
                    <div className="num bignum" style={{ fontSize: 32, color: 'var(--ink)' }}>4,209</div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--mint-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        ↑ Pending Items
                    </span>
                </div>
                <div className="card col gap-2" style={{ padding: 24 }}>
                    <span className="kicker">Success Rate</span>
                    <div className="num bignum" style={{ fontSize: 32, color: 'var(--ink)' }}>99.8%</div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Last 30 days
                    </span>
                </div>
                <div className="card col gap-2" style={{ padding: 24 }}>
                    <span className="kicker">Cost / Page</span>
                    <div className="num bignum" style={{ fontSize: 32, color: 'var(--ink)' }}>$0.002</div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        via DeepSeek-chat
                    </span>
                </div>
            </div>
        </div>
    );
}
