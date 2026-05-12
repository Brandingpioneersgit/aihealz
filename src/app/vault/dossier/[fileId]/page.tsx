import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

/**
 * Vault File Dossier Page
 *
 * Displays full analysis of a medical report with:
 * - AI summary in plain English
 * - Key findings
 * - Recommendations
 * - Urgency level
 * - Option to share with doctor
 */

export const metadata: Metadata = {
    title: 'Medical Report Dossier | Health Vault | aihealz',
    description: 'View detailed AI analysis of your medical report in plain English.',
};

type UrgencyKey = 'routine' | 'urgent' | 'emergency';

const URGENCY: Record<
    UrgencyKey,
    {
        pillClass: string;
        stripeColor: string;
        label: string;
        description: string;
    }
> = {
    routine: {
        pillClass: 'pill pill-mint',
        stripeColor: 'var(--mint)',
        label: 'Routine',
        description: 'No immediate action required.',
    },
    urgent: {
        pillClass: 'pill pill-lemon',
        stripeColor: 'var(--lemon-2)',
        label: 'Urgent',
        description: 'Follow up with your doctor soon.',
    },
    emergency: {
        pillClass: 'pill pill-orange',
        stripeColor: 'var(--orange)',
        label: 'Emergency',
        description: 'Seek immediate medical attention.',
    },
};

const FILE_TYPE_LABELS: Record<string, string> = {
    blood_work: 'Blood Work',
    imaging: 'Imaging / Scan',
    pathology: 'Pathology Report',
    prescription: 'Prescription',
    other: 'Medical Document',
};

export default async function DossierPage({ params }: { params: Promise<{ fileId: string }> }) {
    const { fileId } = await params;

    const vaultFile = await prisma.vaultFile.findUnique({
        where: { id: fileId },
        include: {
            analysis: true,
            vault: true,
        },
    });

    if (!vaultFile) {
        notFound();
    }

    const analysis = vaultFile.analysis;
    const urgencyKey: UrgencyKey =
        (analysis?.urgencyLevel as UrgencyKey) && URGENCY[analysis?.urgencyLevel as UrgencyKey]
            ? (analysis?.urgencyLevel as UrgencyKey)
            : 'routine';
    const urgency = URGENCY[urgencyKey];

    // Parse fullDossier JSON for additional data
    const dossier = analysis?.fullDossier as {
        keyFindings?: string[];
        recommendations?: string[];
        analyzedAt?: string;
    } | null;

    const fileTypeLabel =
        FILE_TYPE_LABELS[vaultFile.fileType] || 'Document';

    const uploadedDateLabel = new Date(vaultFile.uploadDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
            <div
                style={{ maxWidth: 1080, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 96px' }}
                className="col gap-6"
            >
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="row gap-2 ai-center mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        flexWrap: 'wrap',
                    }}
                >
                    <Link href="/" style={{ color: 'var(--ink-3)' }}>
                        Home
                    </Link>
                    <span aria-hidden="true" style={{ color: 'var(--ink-4)' }}>/</span>
                    <Link href="/vault" style={{ color: 'var(--ink-3)' }}>
                        Vault
                    </Link>
                    <span aria-hidden="true" style={{ color: 'var(--ink-4)' }}>/</span>
                    <span style={{ color: 'var(--ink)' }}>Dossier</span>
                </nav>

                {/* Hero */}
                <header className="col gap-4">
                    <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                        <span className="pill pill-cobalt">{fileTypeLabel}</span>
                        {analysis?.urgencyLevel && (
                            <span className={urgency.pillClass}>{urgency.label}</span>
                        )}
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            uploaded {uploadedDateLabel}
                            {vaultFile.fileSizeBytes && ` · ${(vaultFile.fileSizeBytes / 1024).toFixed(0)} KB`}
                        </span>
                    </div>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(32px, 5vw, 56px)',
                            lineHeight: 0.98,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                            wordBreak: 'break-word',
                        }}
                    >
                        {vaultFile.fileName}
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                </header>

                {/* Urgency banner — only when not routine */}
                {analysis?.urgencyLevel && urgencyKey !== 'routine' && (
                    <div
                        className="card row gap-3 ai-center"
                        style={{
                            padding: '16px 20px',
                            borderLeft: `3px solid ${urgency.stripeColor}`,
                            flexWrap: 'wrap',
                        }}
                        role="alert"
                    >
                        <span className={urgency.pillClass}>{urgency.label}</span>
                        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
                            {urgency.description}
                        </p>
                    </div>
                )}

                {/* Two-column: indicators left, summary right */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                        gap: 16,
                    }}
                >
                    {/* Key Findings (parsed indicators) */}
                    <section className="col gap-3">
                        <span className="section-mark">I / key findings</span>
                        {dossier?.keyFindings && dossier.keyFindings.length > 0 ? (
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {dossier.keyFindings.map((finding, i, arr) => (
                                    <div
                                        key={i}
                                        className="row gap-3 ai-start"
                                        style={{
                                            padding: '16px 20px',
                                            borderLeft: `2px solid ${urgency.stripeColor}`,
                                            borderBottom:
                                                i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                        }}
                                    >
                                        <span
                                            className="num"
                                            style={{
                                                fontSize: 14,
                                                color: 'var(--cobalt)',
                                                fontWeight: 500,
                                                minWidth: 22,
                                            }}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p
                                            style={{
                                                fontSize: 14,
                                                lineHeight: 1.6,
                                                color: 'var(--ink-2)',
                                                margin: 0,
                                                flex: 1,
                                            }}
                                        >
                                            {finding}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card-quiet" style={{ padding: 24 }}>
                                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                    No specific findings were extracted yet.
                                </p>
                            </div>
                        )}

                        {/* Recommendations */}
                        {dossier?.recommendations && dossier.recommendations.length > 0 && (
                            <>
                                <span className="section-mark" style={{ marginTop: 16 }}>
                                    II / recommendations
                                </span>
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    {dossier.recommendations.map((rec, i, arr) => (
                                        <div
                                            key={i}
                                            className="row gap-3 ai-start"
                                            style={{
                                                padding: '16px 20px',
                                                borderLeft: '2px solid var(--mint)',
                                                borderBottom:
                                                    i < arr.length - 1
                                                        ? '1px solid var(--rule)'
                                                        : 'none',
                                            }}
                                        >
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 14,
                                                    color: 'var(--mint-3)',
                                                    fontWeight: 500,
                                                    minWidth: 16,
                                                }}
                                                aria-hidden="true"
                                            >
                                                ✓
                                            </span>
                                            <p
                                                style={{
                                                    fontSize: 14,
                                                    lineHeight: 1.6,
                                                    color: 'var(--ink-2)',
                                                    margin: 0,
                                                    flex: 1,
                                                }}
                                            >
                                                {rec}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>

                    {/* AI Summary */}
                    <section className="col gap-3">
                        <span className="section-mark">III / what it means</span>
                        <div className="card col gap-4" style={{ padding: 24 }}>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                ● ai brief
                            </span>
                            <p
                                style={{
                                    fontSize: 16,
                                    lineHeight: 1.65,
                                    color: 'var(--ink-2)',
                                    margin: 0,
                                }}
                            >
                                {analysis?.plainEnglish ||
                                    vaultFile.aiSummary ||
                                    'Analysis pending. Click "Generate Brief" in your vault to analyze this document.'}
                            </p>
                            {analysis?.confidenceScore !== undefined && analysis.confidenceScore !== null && (
                                <div
                                    className="row gap-2 ai-center hairline-t"
                                    style={{ paddingTop: 14, flexWrap: 'wrap' }}
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
                                            fontSize: 14,
                                            color: 'var(--ink)',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {(Number(analysis.confidenceScore) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Disclaimer */}
                        <div className="card-quiet" style={{ padding: 18 }}>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    display: 'block',
                                    marginBottom: 6,
                                }}
                            >
                                disclaimer
                            </span>
                            <p
                                className="muted"
                                style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}
                            >
                                This AI-generated summary is for informational purposes only and is not a
                                substitute for professional medical advice. Always consult a qualified
                                healthcare provider for diagnosis and treatment.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Actions */}
                <div className="row gap-3 hairline-t" style={{ paddingTop: 24, flexWrap: 'wrap' }}>
                    <Link href="/vault" className="btn btn-paper">
                        ← Back to vault
                    </Link>
                    <Link href="/doctors" className="btn btn-cobalt">
                        Find a specialist →
                    </Link>
                </div>
            </div>
        </main>
    );
}
