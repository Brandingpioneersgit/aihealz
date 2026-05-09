'use client';

import { useState, useEffect } from 'react';

/**
 * Health Vault — Bureau file manager
 *
 * Left: original reports list
 * Right: AI-simplified summary side-by-side
 */

interface VaultFile {
    id: string;
    name: string;
    type: string;
    size: number;
    aiSummary: string | null;
    analysis: { summary: string; urgency: string; confidence: number | null } | null;
    isProcessed: boolean;
    uploadDate: string;
}

interface VaultData {
    id: string;
    storageUsed: number;
    maxStorage: number;
    files: VaultFile[];
}

const URGENCY_PILL_CLASS: Record<string, string> = {
    routine: 'pill pill-mint',
    urgent: 'pill pill-lemon',
    emergency: 'pill pill-orange',
};

export default function HealthVaultPage() {
    const [vault, setVault] = useState<VaultData | null>(null);
    const [selected, setSelected] = useState<VaultFile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchVault();
    }, []);

    async function fetchVault() {
        setLoading(true);
        try {
            // Get or create session hash
            let session = typeof window !== 'undefined' ? localStorage.getItem('aihealz_session') : null;
            if (!session) {
                session = crypto.randomUUID();
                localStorage.setItem('aihealz_session', session);
            }

            const res = await fetch(`/api/vault?session=${session}`);
            const data = await res.json();

            if (!data.vault) {
                const createRes = await fetch('/api/vault', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'create_vault',
                        sessionHash: session,
                        countryCode: detectCountry(),
                    }),
                });

                if (createRes.ok) {
                    const newRes = await fetch(`/api/vault?session=${session}`);
                    const newData = await newRes.json();
                    setVault(newData.vault);
                } else {
                    setVault({
                        id: 'pending',
                        storageUsed: 0,
                        maxStorage: 104857600, // 100MB default
                        files: [],
                    });
                }
            } else {
                setVault(data.vault);
                if (data.vault?.files?.[0]) setSelected(data.vault.files[0]);
            }
        } catch (error) {
            console.error('Failed to load vault:', error);
            setErrorMessage('Failed to load your vault. Please refresh the page.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    }

    function detectCountry(): string {
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(/aihealz-geo=([^;:]+)/);
            if (match) {
                const codes: Record<string, string> = {
                    india: 'IN', usa: 'US', uk: 'GB', uae: 'AE', singapore: 'SG',
                    australia: 'AU', canada: 'CA', germany: 'DE', france: 'FR',
                };
                return codes[match[1]] || 'US';
            }
        }
        return 'US';
    }

    async function handleUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('session', typeof window !== 'undefined' ? localStorage.getItem('aihealz_session') || 'demo-session' : 'demo-session');

                const res = await fetch('/api/vault/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    await fetchVault();
                } else {
                    const error = await res.json();
                    setErrorMessage(error.message || 'Failed to upload file');
                    setTimeout(() => setErrorMessage(null), 5000);
                }
            } catch (error) {
                console.error('Upload failed:', error);
                setErrorMessage('Failed to upload file. Please try again.');
                setTimeout(() => setErrorMessage(null), 5000);
            } finally {
                setUploading(false);
            }
        };
        input.click();
    }

    async function handleViewDossier(fileId: string) {
        window.open(`/vault/dossier/${fileId}`, '_blank');
    }

    async function handleGenerateBrief(fileId: string) {
        setAnalyzing(fileId);
        try {
            const res = await fetch('/api/vault/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId }),
            });

            if (res.ok) {
                await fetchVault();
            } else {
                const error = await res.json();
                setErrorMessage(error.message || 'Failed to generate brief');
                setTimeout(() => setErrorMessage(null), 5000);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            setErrorMessage('Failed to generate brief. Please try again.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setAnalyzing(null);
        }
    }

    const storagePercent = vault
        ? Math.round((Number(vault.storageUsed) / Number(vault.maxStorage)) * 100)
        : 0;
    const storageUsedMB = vault ? (Number(vault.storageUsed) / 1048576).toFixed(1) : '0.0';
    const storageMaxMB = vault ? (Number(vault.maxStorage) / 1048576).toFixed(0) : '100';

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
            <div
                style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 28px 96px' }}
                className="col gap-6"
            >
                {/* Error Message */}
                {errorMessage && (
                    <div
                        className="row gap-2 ai-center"
                        style={{
                            padding: '12px 16px',
                            background: 'var(--orange-50)',
                            border: '1px solid rgba(255, 90, 46, .28)',
                            borderRadius: 'var(--r-2)',
                            color: 'var(--orange-2)',
                            fontSize: 13,
                        }}
                        role="alert"
                    >
                        <span
                            aria-hidden="true"
                            className="mono"
                            style={{ fontSize: 11, fontWeight: 500 }}
                        >
                            ● error
                        </span>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Hero */}
                <header className="col gap-3" style={{ maxWidth: 760 }}>
                    <span className="section-mark">the vault</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 6vw, 80px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Your medical <span style={{ color: 'var(--cobalt)' }}>records</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', maxWidth: 620 }}>
                        Securely store reports, scans, and prescriptions. Get plain-English summaries when you need them.
                    </p>
                    <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                        <span className="pill pill-mint">
                            <span className="pill-dot" style={{ background: 'var(--mint)' }} />
                            secure
                        </span>
                        <span className="pill">end-to-end encrypted</span>
                        <span className="pill">HIPAA compliant</span>
                    </div>
                </header>

                {/* Storage strip */}
                {vault && (
                    <div
                        className="card-flat row ai-center between gap-4"
                        style={{ padding: '18px 22px', flexWrap: 'wrap' }}
                    >
                        <div className="col gap-1" style={{ minWidth: 160 }}>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                storage used
                            </span>
                            <div className="row ai-baseline gap-2">
                                <span
                                    className="bignum"
                                    style={{ fontSize: 32, color: 'var(--ink)' }}
                                >
                                    {storageUsedMB}
                                </span>
                                <span className="num muted" style={{ fontSize: 13 }}>
                                    / {storageMaxMB} MB
                                </span>
                            </div>
                        </div>
                        <div style={{ flex: '1 1 240px', minWidth: 160 }}>
                            <div
                                style={{
                                    height: 4,
                                    background: 'var(--bg-2)',
                                    border: '1px solid var(--rule)',
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${storagePercent}%`,
                                        background: 'var(--cobalt)',
                                        transition: 'width 320ms ease',
                                    }}
                                />
                            </div>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    marginTop: 6,
                                    display: 'inline-block',
                                }}
                            >
                                {storagePercent}% utilised
                            </span>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="btn btn-cobalt"
                        >
                            {uploading ? 'Uploading…' : '↑ Upload report'}
                        </button>
                    </div>
                )}

                {/* Split view */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 16,
                    }}
                >
                    {/* File List */}
                    <section className="col gap-3">
                        <div
                            className="row between ai-end"
                            style={{ flexWrap: 'wrap', gap: 8 }}
                        >
                            <span className="section-mark">I / original reports</span>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {vault?.files.length || 0} file{vault?.files.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="col gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="card-flat" style={{ padding: 16 }}>
                                        <div
                                            style={{
                                                height: 12,
                                                background: 'var(--bg-2)',
                                                width: '60%',
                                                marginBottom: 8,
                                                borderRadius: 'var(--r-1)',
                                            }}
                                        />
                                        <div
                                            style={{
                                                height: 10,
                                                background: 'var(--bg-2)',
                                                width: '30%',
                                                borderRadius: 'var(--r-1)',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : vault?.files.length ? (
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {vault.files.map((file, i, arr) => {
                                    const isActive = selected?.id === file.id;
                                    return (
                                        <button
                                            key={file.id}
                                            onClick={() => setSelected(file)}
                                            className="row between ai-center gap-3"
                                            style={{
                                                width: '100%',
                                                padding: '16px 20px',
                                                textAlign: 'left',
                                                background: isActive ? 'var(--cobalt-50)' : 'transparent',
                                                borderBottom:
                                                    i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                borderLeft: isActive
                                                    ? '2px solid var(--cobalt)'
                                                    : '2px solid transparent',
                                                cursor: 'pointer',
                                                transition: 'background 120ms',
                                            }}
                                        >
                                            <div className="col gap-1" style={{ minWidth: 0, flex: 1 }}>
                                                <span
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        color: isActive ? 'var(--cobalt)' : 'var(--ink)',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {file.name}
                                                </span>
                                                <div
                                                    className="row gap-2 mono"
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--ink-3)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    <span>{file.type.replace('_', ' ')}</span>
                                                    <span>·</span>
                                                    <span>{(file.size / 1024).toFixed(0)} KB</span>
                                                </div>
                                            </div>
                                            <div className="row gap-2 ai-center" style={{ flexShrink: 0 }}>
                                                {file.isProcessed && (
                                                    <span
                                                        className="pill pill-cobalt"
                                                        style={{ textTransform: 'uppercase' }}
                                                    >
                                                        AI
                                                    </span>
                                                )}
                                                <span
                                                    className="mono"
                                                    style={{
                                                        fontSize: 12,
                                                        color: isActive ? 'var(--cobalt)' : 'var(--ink-4)',
                                                    }}
                                                >
                                                    →
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="card col gap-4" style={{ padding: 28 }}>
                                <span className="kicker">
                                    <span className="dot" />
                                    welcome
                                </span>
                                <div
                                    className="display"
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 500,
                                        letterSpacing: '-0.025em',
                                        margin: 0,
                                    }}
                                >
                                    Your vault is empty.
                                </div>
                                <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                                    Securely store medical reports and get AI-powered summaries in plain English.
                                </p>
                                <div className="col gap-2">
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        what fits here
                                    </span>
                                    <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                        {['Blood tests', 'X-rays & scans', 'Prescriptions', 'Lab reports', 'Records'].map(
                                            (t) => (
                                                <span key={t} className="pill" style={{ textTransform: 'none' }}>
                                                    {t}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="btn btn-cobalt btn-lg"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {uploading ? 'Uploading…' : '↑ Upload your first report'}
                                </button>
                            </div>
                        )}
                    </section>

                    {/* AI Summary Panel */}
                    <section className="col gap-3">
                        <span className="section-mark">II / ai summary</span>
                        {selected ? (
                            <div className="card col gap-4" style={{ padding: 24 }}>
                                <div
                                    className="row between ai-start gap-3"
                                    style={{ flexWrap: 'wrap' }}
                                >
                                    <div className="col gap-1" style={{ minWidth: 0, flex: 1 }}>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            now reading
                                        </span>
                                        <h3
                                            className="display"
                                            style={{
                                                fontSize: 20,
                                                fontWeight: 500,
                                                letterSpacing: '-0.02em',
                                                margin: 0,
                                            }}
                                        >
                                            {selected.name}
                                        </h3>
                                    </div>
                                    {selected.analysis?.urgency && (
                                        <span
                                            className={
                                                URGENCY_PILL_CLASS[selected.analysis.urgency] || 'pill'
                                            }
                                        >
                                            {selected.analysis.urgency}
                                        </span>
                                    )}
                                </div>

                                {selected.analysis ? (
                                    <>
                                        <div className="col gap-3">
                                            <div className="col gap-1">
                                                <span
                                                    className="mono"
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--cobalt)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    what your report shows
                                                </span>
                                                <p
                                                    style={{
                                                        fontSize: 15,
                                                        lineHeight: 1.6,
                                                        color: 'var(--ink-2)',
                                                        margin: 0,
                                                    }}
                                                >
                                                    {selected.analysis.summary}
                                                </p>
                                            </div>

                                            {selected.analysis.confidence !== null && (
                                                <div
                                                    className="row gap-2 ai-center"
                                                    style={{ flexWrap: 'wrap' }}
                                                >
                                                    <span
                                                        className="mono"
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'var(--ink-3)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.08em',
                                                        }}
                                                    >
                                                        confidence
                                                    </span>
                                                    <span
                                                        className="num"
                                                        style={{
                                                            fontSize: 13,
                                                            color: 'var(--ink)',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {(selected.analysis.confidence * 100).toFixed(0)}%
                                                    </span>
                                                    {selected.analysis.confidence < 0.8 && (
                                                        <span className="pill pill-lemon">
                                                            flagged for review
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className="row gap-2 hairline-t"
                                            style={{ paddingTop: 16, flexWrap: 'wrap' }}
                                        >
                                            <button
                                                onClick={() => handleViewDossier(selected.id)}
                                                className="btn btn-cobalt btn-sm"
                                            >
                                                View full dossier →
                                            </button>
                                            <button
                                                onClick={() => handleGenerateBrief(selected.id)}
                                                disabled={analyzing === selected.id}
                                                className="btn btn-paper btn-sm"
                                            >
                                                {analyzing === selected.id ? 'Generating…' : '↻ Regenerate brief'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="col gap-2 ai-center center"
                                        style={{ padding: 24, textAlign: 'center' }}
                                    >
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            ● analysis in progress
                                        </span>
                                        <p
                                            className="muted"
                                            style={{ fontSize: 14, margin: 0 }}
                                        >
                                            We&rsquo;re reading this report.
                                        </p>
                                        <button
                                            onClick={() => handleGenerateBrief(selected.id)}
                                            disabled={analyzing === selected.id}
                                            className="btn btn-cobalt btn-sm"
                                            style={{ marginTop: 8 }}
                                        >
                                            {analyzing === selected.id ? 'Generating…' : 'Generate brief'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                className="card-quiet col gap-2 ai-center center"
                                style={{ padding: 32, textAlign: 'center' }}
                            >
                                <span className="kicker">
                                    <span className="dot" />
                                    select a report
                                </span>
                                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                    Pick a file on the left to view its AI summary.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
