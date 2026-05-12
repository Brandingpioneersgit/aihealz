'use client';

import { useState } from 'react';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function formatSpecialistTitle(specialty: string): string {
    if (!specialty) return 'Specialists';
    const lower = specialty.toLowerCase().trim();

    if (lower.endsWith('ists') || lower.endsWith('ians')) {
        return specialty.charAt(0).toUpperCase() + specialty.slice(1);
    }

    const mappings: Record<string, string> = {
        hematology: 'Hematologists',
        cardiology: 'Cardiologists',
        neurology: 'Neurologists',
        oncology: 'Oncologists',
        gastroenterology: 'Gastroenterologists',
        dermatology: 'Dermatologists',
        endocrinology: 'Endocrinologists',
        nephrology: 'Nephrologists',
        pulmonology: 'Pulmonologists',
        rheumatology: 'Rheumatologists',
        urology: 'Urologists',
        ophthalmology: 'Ophthalmologists',
        orthopedics: 'Orthopedic Surgeons',
        psychiatry: 'Psychiatrists',
        radiology: 'Radiologists',
        pathology: 'Pathologists',
        'general medicine': 'General Physicians',
        'internal medicine': 'Internists',
        pediatrics: 'Pediatricians',
    };

    if (mappings[lower]) return mappings[lower];
    if (lower.endsWith('ology')) return specialty.slice(0, -5) + 'ologists';
    if (lower.endsWith('ist')) return specialty + 's';
    return specialty + ' Specialists';
}

function severityToken(sev: string): { color: string; pillClass: string; label: string } {
    const s = sev?.toLowerCase() || 'routine';
    if (s === 'critical' || s === 'emergency') {
        return { color: 'var(--sev-critical)', pillClass: 'pill pill-orange', label: 'critical' };
    }
    if (s === 'high' || s === 'urgent') {
        return { color: 'var(--orange)', pillClass: 'pill pill-orange', label: 'urgent' };
    }
    if (s === 'borderline' || s === 'medium') {
        return { color: 'var(--lemon-2)', pillClass: 'pill pill-lemon', label: 'borderline' };
    }
    return { color: 'var(--mint-2)', pillClass: 'pill pill-mint', label: 'routine' };
}

/* ─── Types ────────────────────────────────────────────────────────────── */

type Stage = 'upload' | 'processing' | 'dossier';

interface Indicator {
    name: string;
    value: string;
    normalRange: string;
    severity: string;
    explanation: string;
}

interface Doctor {
    id: number;
    name: string;
    slug: string;
    qualifications: string[];
    rating: number | null;
    reviewCount: number;
    consultationFee: number | null;
    feeCurrency: string;
    profileImage: string | null;
    subscriptionTier: string;
    matchRank: number;
    matchReason: string;
    avgWaitMinutes: number | null;
}

interface DossierData {
    analysisId: string;
    dossier: {
        title: string;
        plainEnglish: string;
        indicators: Indicator[];
        questionsToAsk: string[];
        lifestyleFactors: string[];
        urgency: { level: string; message: string };
        disclaimer: string;
    };
    doctors: {
        doctors: Doctor[];
        totalMatches: number;
        specialtySearched: string;
    };
    meta: {
        confidenceScore: number;
        urgencyLevel: string;
        processingTimeMs: number;
        piiRedacted: number;
    };
}

const PROCESSING_STEPS: { label: string; duration: number }[] = [
    { label: 'Parsing clinical data', duration: 800 },
    { label: 'Securing patient privacy', duration: 600 },
    { label: 'Extracting medical indicators', duration: 2000 },
    { label: 'Mapping regional specialists', duration: 1000 },
    { label: 'Ranking qualified doctors', duration: 800 },
    { label: 'Finalizing your dossier', duration: 500 },
];

const REPORT_TYPES: { value: string; label: string }[] = [
    { value: 'blood_work', label: 'Blood work' },
    { value: 'imaging', label: 'MRI / X-Ray' },
    { value: 'pathology', label: 'Pathology' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'other', label: 'Other' },
];

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function AnalyzePage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [reportText, setReportText] = useState('');
    const [reportType, setReportType] = useState('blood_work');
    const [driveLink, setDriveLink] = useState('');
    const [processingStep, setProcessingStep] = useState(0);
    const [dossierData, setDossierData] = useState<DossierData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadMode, setUploadMode] = useState<'paste' | 'drive'>('paste');

    async function handleAnalyze() {
        if (uploadMode === 'paste' && (!reportText.trim() || reportText.trim().length < 20)) {
            setError('Please enter at least 20 characters of report text.');
            return;
        }
        if (uploadMode === 'drive' && !driveLink.trim()) {
            setError('Please provide a Google Drive link.');
            return;
        }

        setError(null);
        setStage('processing');
        setProcessingStep(0);

        for (let i = 0; i < PROCESSING_STEPS.length; i++) {
            setProcessingStep(i);
            await new Promise(r => setTimeout(r, PROCESSING_STEPS[i].duration));
        }

        try {
            const body =
                uploadMode === 'paste'
                    ? { text: reportText, reportType }
                    : { driveLink, reportType };

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Analysis failed');
            const data = await response.json();
            setDossierData(data);
            setStage('dossier');
        } catch {
            setError('Failed to process your report. Please try again.');
            setStage('upload');
        }
    }

    return (
        <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            {stage === 'upload' && (
                <UploadView
                    reportText={reportText}
                    setReportText={setReportText}
                    reportType={reportType}
                    setReportType={setReportType}
                    driveLink={driveLink}
                    setDriveLink={setDriveLink}
                    uploadMode={uploadMode}
                    setUploadMode={setUploadMode}
                    onAnalyze={handleAnalyze}
                    error={error}
                />
            )}
            {stage === 'processing' && <ProcessingView step={processingStep} />}
            {stage === 'dossier' && dossierData && (
                <DossierView
                    data={dossierData}
                    onNewAnalysis={() => {
                        setStage('upload');
                        setReportText('');
                        setDriveLink('');
                        setDossierData(null);
                    }}
                />
            )}
        </div>
    );
}

/* ─── Upload View ──────────────────────────────────────────────────────── */

function UploadView({
    reportText,
    setReportText,
    reportType,
    setReportType,
    driveLink,
    setDriveLink,
    uploadMode,
    setUploadMode,
    onAnalyze,
    error,
}: {
    reportText: string;
    setReportText: (v: string) => void;
    reportType: string;
    setReportType: (v: string) => void;
    driveLink: string;
    setDriveLink: (v: string) => void;
    uploadMode: 'paste' | 'drive';
    setUploadMode: (v: 'paste' | 'drive') => void;
    onAnalyze: () => void;
    error: string | null;
}) {
    const charCount = reportText.length;
    const charLimit = 5000;

    return (
        <div
            style={{ padding: '48px clamp(16px, 4vw, 28px) 80px', maxWidth: 1080, margin: '0 auto' }}
            className="col gap-7"
        >
            {/* Hero */}
            <div className="col gap-3">
                <span className="section-mark">the engine / analyze</span>
                <h1
                    className="display"
                    style={{
                        fontSize: 'clamp(40px, 6vw, 96px)',
                        lineHeight: 0.95,
                        letterSpacing: '-0.045em',
                        margin: 0,
                        fontWeight: 600,
                    }}
                >
                    Hand us a report.
                    <br />
                    <span style={{ color: 'var(--cobalt)' }}>We&rsquo;ll read it back</span>
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 640 }}>
                    Bloodwork, MRI findings, biopsy notes — paste the text or share a Drive link. We strip every identifier, find what matters, and translate it.
                </p>
            </div>

            {/* Steps ribbon */}
            <div
                className="row"
                style={{
                    borderTop: '1px solid var(--rule)',
                    borderBottom: '1px solid var(--rule)',
                    flexWrap: 'wrap',
                }}
            >
                {[
                    ['01', 'Paste or share', 'PDF · image · text'],
                    ['02', 'PII redacted', 'before any AI sees it'],
                    ['03', 'Indicators extracted', 'severity-ranked'],
                    ['04', 'Specialists matched', 'in your geography'],
                ].map(([n, t, s], i, arr) => (
                    <div
                        key={n}
                        className="col gap-2"
                        style={{
                            flex: '1 1 240px',
                            padding: '18px 20px',
                            borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                            minWidth: 0,
                        }}
                    >
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                letterSpacing: '0.10em',
                                fontWeight: 500,
                            }}
                        >
                            {n}
                        </span>
                        <div
                            className="display"
                            style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}
                        >
                            {t}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>{s}</div>
                    </div>
                ))}
            </div>

            {/* Upload card */}
            <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
                <div
                    className="row between ai-center"
                    style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}
                >
                    <span className="kicker"><span className="dot" />upload report</span>
                    <div className="row gap-1" role="tablist" aria-label="Upload method">
                        <button
                            className={uploadMode === 'paste' ? 'btn btn-paper btn-sm' : 'btn btn-ghost btn-sm'}
                            style={uploadMode === 'paste' ? { borderColor: 'var(--ink)' } : undefined}
                            role="tab"
                            aria-selected={uploadMode === 'paste'}
                            onClick={() => setUploadMode('paste')}
                        >
                            Paste text
                        </button>
                        <button
                            className={uploadMode === 'drive' ? 'btn btn-paper btn-sm' : 'btn btn-ghost btn-sm'}
                            style={uploadMode === 'drive' ? { borderColor: 'var(--ink)' } : undefined}
                            role="tab"
                            aria-selected={uploadMode === 'drive'}
                            onClick={() => setUploadMode('drive')}
                        >
                            Drive link
                        </button>
                    </div>
                </div>

                {/* Report type chips */}
                <div className="col gap-2" style={{ marginBottom: 18 }}>
                    <div
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        Report type
                    </div>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        {REPORT_TYPES.map(opt => {
                            const isActive = reportType === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setReportType(opt.value)}
                                    className={isActive ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                    aria-pressed={isActive}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Paste mode */}
                {uploadMode === 'paste' && (
                    <div className="col gap-2">
                        <label
                            className="mono"
                            htmlFor="report-text"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Report text
                        </label>
                        <textarea
                            id="report-text"
                            className="textarea mono"
                            rows={10}
                            value={reportText}
                            onChange={e => setReportText(e.target.value.slice(0, charLimit))}
                            placeholder="Paste blood values, imaging findings, pathology notes…"
                            style={{ minHeight: 200, fontSize: 13 }}
                        />
                        <div
                            className="row between mono"
                            style={{ fontSize: 11, color: 'var(--ink-3)', flexWrap: 'wrap', gap: 8 }}
                        >
                            <span>↳ all personal identifiers stripped before analysis</span>
                            <span>{charCount.toLocaleString()} / {charLimit.toLocaleString()} chars</span>
                        </div>
                    </div>
                )}

                {/* Drive mode */}
                {uploadMode === 'drive' && (
                    <div className="col gap-2">
                        <label
                            className="mono"
                            htmlFor="drive-link"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Google Drive link <span className="muted-2">(for files over 5 MB)</span>
                        </label>
                        <input
                            id="drive-link"
                            type="url"
                            className="input"
                            value={driveLink}
                            onChange={e => setDriveLink(e.target.value)}
                            placeholder="https://drive.google.com/file/d/..."
                        />
                        <div className="card-quiet" style={{ padding: 14 }}>
                            <div
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    fontWeight: 500,
                                }}
                            >
                                How to share from Google Drive
                            </div>
                            <ol style={{ margin: '8px 0 4px', paddingLeft: 22, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                                <li>Upload your report (PDF or image) to Google Drive.</li>
                                <li>Right-click → <strong>Share</strong> → <strong>Anyone with the link</strong>.</li>
                                <li>Copy the link and paste it above.</li>
                            </ol>
                            <div className="muted" style={{ fontSize: 12 }}>
                                Supports PDF, JPEG, PNG, DICOM. Max 100 MB.
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div
                        className="card-flat"
                        role="alert"
                        style={{
                            marginTop: 14,
                            padding: 14,
                            borderColor: 'rgba(255, 90, 46, .35)',
                            background: 'var(--orange-50)',
                            color: 'var(--orange-2)',
                            fontSize: 13,
                        }}
                    >
                        ⚠ {error}
                    </div>
                )}

                <div className="hairline" style={{ margin: '24px -32px' }} />

                <div
                    className="row between ai-center"
                    style={{ flexWrap: 'wrap', gap: 16 }}
                >
                    <div
                        className="row gap-4 mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            flexWrap: 'wrap',
                        }}
                    >
                        <span>◆ end-to-end encrypted</span>
                        <span>◆ deleted after 24h</span>
                        <span>◆ HIPAA · GDPR</span>
                    </div>
                    <button
                        onClick={onAnalyze}
                        disabled={uploadMode === 'paste' ? !reportText.trim() : !driveLink.trim()}
                        className="btn btn-cobalt btn-lg"
                    >
                        Analyze report →
                    </button>
                </div>
            </div>

            {/* What we read well */}
            <div>
                <div className="section-mark" style={{ marginBottom: 14 }}>
                    what we read well
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 12,
                    }}
                >
                    {[
                        { t: 'CBC, lipid, thyroid', k: 'BL' },
                        { t: 'MRI · CT · X-Ray', k: 'IM' },
                        { t: 'Histopathology', k: 'HP' },
                        { t: 'Prescription review', k: 'RX' },
                        { t: 'Genomic panels', k: 'GN' },
                        { t: 'Allergy & immunology', k: 'AL' },
                    ].map(item => (
                        <div
                            key={item.t}
                            className="card-flat row ai-center gap-3"
                            style={{ padding: '14px 16px' }}
                        >
                            <div className="spec-icon">{item.k}</div>
                            <div className="col">
                                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.t}</div>
                                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>auto-detect</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Processing View ──────────────────────────────────────────────────── */

function ProcessingView({ step }: { step: number }) {
    return (
        <div
            className="col ai-center center gap-7"
            style={{ minHeight: '60vh', padding: '48px clamp(16px, 4vw, 28px)' }}
        >
            <div
                aria-hidden="true"
                style={{
                    width: 56,
                    height: 56,
                    border: '2px solid var(--rule)',
                    borderTopColor: 'var(--cobalt)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
            <div className="col gap-2" style={{ width: '100%', maxWidth: 480 }} aria-live="polite">
                {PROCESSING_STEPS.map((s, i) => {
                    const isActive = i === step;
                    const isDone = i < step;
                    return (
                        <div
                            key={i}
                            className="row ai-center gap-3"
                            style={{
                                padding: '12px 16px',
                                border: '1px solid',
                                borderColor: isActive ? 'var(--cobalt)' : isDone ? 'var(--rule)' : 'transparent',
                                background: isActive ? 'var(--cobalt-50)' : isDone ? 'var(--bg-2)' : 'transparent',
                                borderRadius: 'var(--r-2)',
                                transition: 'all 200ms',
                                opacity: isActive ? 1 : isDone ? 0.7 : 0.35,
                            }}
                        >
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    fontWeight: 500,
                                    minWidth: 24,
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <span
                                style={{
                                    fontSize: 14,
                                    color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                                    fontWeight: isActive ? 500 : 400,
                                    flex: 1,
                                }}
                            >
                                {s.label}
                            </span>
                            {isDone && (
                                <span className="mono" aria-hidden="true" style={{ color: 'var(--mint-3)', fontSize: 13 }}>✓</span>
                            )}
                        </div>
                    );
                })}
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

/* ─── Dossier View ─────────────────────────────────────────────────────── */

function DossierView({ data, onNewAnalysis }: { data: DossierData; onNewAnalysis: () => void }) {
    const { dossier, doctors, meta } = data;
    const urgency = severityToken(meta.urgencyLevel);

    return (
        <div
            style={{ padding: '40px clamp(16px, 4vw, 28px) 80px', maxWidth: 1280, margin: '0 auto' }}
            className="col gap-6"
        >
            {/* Header */}
            <div
                className="row between ai-end"
                style={{ flexWrap: 'wrap', gap: 16 }}
            >
                <div className="col gap-3" style={{ flex: '1 1 480px', minWidth: 0 }}>
                    <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.10em',
                            }}
                        >
                            dossier · {data.analysisId.slice(0, 8)} / processed in {(meta.processingTimeMs / 1000).toFixed(1)}s
                        </span>
                        <span className={urgency.pillClass}>
                            <span className="pill-dot" style={{ background: urgency.color }} />
                            {urgency.label} · {dossier.urgency.message}
                        </span>
                    </div>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(32px, 5vw, 64px)',
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                            maxWidth: 920,
                        }}
                    >
                        {dossier.title}
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <div className="muted" style={{ fontSize: 13 }}>
                        {meta.piiRedacted > 0 ? `${meta.piiRedacted} personal items removed` : 'No personal items detected'}
                        {meta.confidenceScore != null && ` · confidence ${Math.round(meta.confidenceScore * 100)}%`}
                    </div>
                </div>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    <a
                        href={`/api/analysis/${data.analysisId}/pdf`}
                        target="_blank"
                        rel="noopener"
                        className="btn btn-paper btn-sm"
                    >
                        ↓ PDF
                    </a>
                    <button onClick={onNewAnalysis} className="btn btn-cobalt btn-sm">
                        + New analysis
                    </button>
                </div>
            </div>

            <div
                className="row gap-5 ai-start"
                style={{ flexWrap: 'wrap' }}
            >
                {/* Main column */}
                <div className="col gap-4" style={{ flex: '2 1 580px', minWidth: 0 }}>
                    {/* A · plain english */}
                    <div className="card" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
                        <div className="kicker" style={{ marginBottom: 14 }}>
                            <span className="dot" />section A · plain english
                        </div>
                        <div
                            className="display"
                            style={{
                                fontSize: 'clamp(18px, 2vw, 24px)',
                                lineHeight: 1.4,
                                color: 'var(--ink)',
                                fontWeight: 400,
                                letterSpacing: '-0.015em',
                            }}
                        >
                            {dossier.plainEnglish}
                        </div>
                        {dossier.disclaimer && (
                            <div className="muted" style={{ fontSize: 13, marginTop: 14, fontStyle: 'italic' }}>
                                {dossier.disclaimer}
                            </div>
                        )}
                    </div>

                    {/* B · indicators ranked */}
                    {dossier.indicators.length > 0 && (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div
                                className="row between ai-center hairline-b"
                                style={{ padding: '18px 24px' }}
                            >
                                <span className="kicker">
                                    <span className="dot" />section B · indicators ranked
                                </span>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                    {dossier.indicators.length} {dossier.indicators.length === 1 ? 'finding' : 'findings'}
                                </span>
                            </div>
                            {dossier.indicators.map((ind, i, arr) => {
                                const sev = severityToken(ind.severity);
                                return (
                                    <div
                                        key={i}
                                        className="row ai-stretch"
                                        style={{
                                            borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                        }}
                                    >
                                        <div style={{ width: 4, background: sev.color, flexShrink: 0 }} />
                                        <div
                                            className="row ai-start gap-4"
                                            style={{ padding: '20px 24px', flex: 1, flexWrap: 'wrap' }}
                                        >
                                            <div className="col" style={{ flex: '2 1 240px', minWidth: 0 }}>
                                                <div className="row ai-baseline gap-2" style={{ flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 500, fontSize: 15 }}>{ind.name}</span>
                                                    <span className={sev.pillClass}>{sev.label}</span>
                                                </div>
                                                {ind.explanation && (
                                                    <div
                                                        className="muted"
                                                        style={{ fontSize: 13, marginTop: 4, maxWidth: 480 }}
                                                    >
                                                        {ind.explanation}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col" style={{ flex: '1 1 140px', minWidth: 0 }}>
                                                <div className="row ai-baseline gap-2">
                                                    <span
                                                        className="num"
                                                        style={{
                                                            fontSize: 28,
                                                            color: sev.color,
                                                            fontWeight: 500,
                                                            letterSpacing: '-0.02em',
                                                        }}
                                                    >
                                                        {ind.value}
                                                    </span>
                                                </div>
                                                {ind.normalRange && (
                                                    <div
                                                        className="mono"
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'var(--ink-4)',
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        ref · {ind.normalRange}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* C · questions */}
                    {dossier.questionsToAsk.length > 0 && (
                        <div className="card" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
                            <div className="kicker" style={{ marginBottom: 18 }}>
                                <span className="dot" />section C · bring these to your doctor
                            </div>
                            <ol className="clean col gap-4">
                                {dossier.questionsToAsk.map((q, i) => (
                                    <li key={i} className="row gap-4 ai-baseline">
                                        <span
                                            className="num"
                                            style={{
                                                fontSize: 28,
                                                color: 'var(--cobalt)',
                                                minWidth: 40,
                                                lineHeight: 1,
                                                fontWeight: 500,
                                                letterSpacing: '-0.04em',
                                            }}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                                            {q}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Lifestyle */}
                    {dossier.lifestyleFactors.length > 0 && (
                        <div className="card" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
                            <div className="kicker" style={{ marginBottom: 14 }}>
                                <span className="dot" />lifestyle
                            </div>
                            <ul className="clean col gap-2">
                                {dossier.lifestyleFactors.map((f, i) => (
                                    <li
                                        key={i}
                                        className="row gap-3 ai-baseline"
                                        style={{ fontSize: 14, color: 'var(--ink-2)' }}
                                    >
                                        <span className="mono" style={{ color: 'var(--cobalt)', fontSize: 11 }}>↳</span>
                                        <span style={{ flex: 1 }}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="muted" style={{ fontSize: 12, padding: '12px 0' }}>
                        This dossier is informational, not diagnostic. Always pair it with a licensed clinician&rsquo;s judgment.
                    </div>
                </div>

                {/* Sidebar — matched specialists */}
                <div
                    className="col gap-3"
                    style={{ flex: '1 1 320px', minWidth: 0 }}
                >
                    <div className="col gap-1" style={{ marginBottom: 4 }}>
                        <span className="section-mark">section D / matched specialists</span>
                        <div
                            className="display"
                            style={{
                                fontSize: 26,
                                letterSpacing: '-0.025em',
                                fontWeight: 600,
                                marginTop: 8,
                            }}
                        >
                            {doctors.totalMatches} {doctors.totalMatches === 1 ? 'match' : 'matches'}
                        </div>
                        <div className="muted" style={{ fontSize: 13 }}>
                            {formatSpecialistTitle(doctors.specialtySearched)} matched to your findings
                        </div>
                    </div>

                    {doctors.doctors.map(doc => {
                        const isTop = doc.matchRank === 1;
                        return (
                            <a
                                key={doc.id}
                                href={`/doctor/${doc.slug}`}
                                className="card-flat"
                                style={{
                                    padding: 16,
                                    display: 'block',
                                    borderColor: isTop ? 'var(--cobalt)' : 'var(--rule)',
                                    background: isTop ? 'var(--cobalt-50)' : 'var(--paper)',
                                    position: 'relative',
                                    color: 'var(--ink)',
                                }}
                            >
                                {isTop && (
                                    <span
                                        className="pill pill-cobalt"
                                        style={{ position: 'absolute', top: -10, right: 14 }}
                                    >
                                        top match
                                    </span>
                                )}
                                <div className="row gap-3 ai-start">
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 'var(--r-2)',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            background: 'var(--bg-2)',
                                            border: '1px solid var(--rule)',
                                        }}
                                    >
                                        {doc.profileImage ? (
                                            <AvatarWithFallback
                                                src={doc.profileImage}
                                                alt={doc.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="row ai-center center"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    fontFamily: 'var(--display)',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: 'var(--ink-2)',
                                                }}
                                            >
                                                {doc.name
                                                    .split(' ')
                                                    .filter(Boolean)
                                                    .slice(-1)[0]
                                                    ?.slice(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col" style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            className="row between"
                                            style={{ gap: 8 }}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: 500,
                                                    fontSize: 14,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {doc.name}
                                            </span>
                                            {doc.rating != null && (
                                                <span className="num" style={{ fontSize: 13 }}>★ {doc.rating}</span>
                                            )}
                                        </div>
                                        {doc.qualifications.length > 0 && (
                                            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                                                {doc.qualifications.slice(0, 2).join(' / ')}
                                            </div>
                                        )}
                                        {doc.avgWaitMinutes != null && (
                                            <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>
                                                ↻ {doc.avgWaitMinutes} min wait
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="hairline" style={{ margin: '12px -16px' }} />
                                <div
                                    className="row between ai-center"
                                    style={{ gap: 8 }}
                                >
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: isTop ? 'var(--cobalt)' : 'var(--ink-3)',
                                        }}
                                    >
                                        ↳ {doc.matchReason}
                                    </span>
                                    {doc.consultationFee != null && (
                                        <span className="num" style={{ fontSize: 13 }}>
                                            {doc.feeCurrency} {doc.consultationFee}
                                        </span>
                                    )}
                                </div>
                            </a>
                        );
                    })}

                    {doctors.totalMatches === 0 && (
                        <div
                            className="card-quiet"
                            style={{
                                padding: 24,
                                textAlign: 'center',
                                fontSize: 13,
                                color: 'var(--ink-3)',
                            }}
                        >
                            No specialists found in your area yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
