'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface FieldOption {
    label: string;
    value: number;
}

interface ScoreField {
    key: string;
    label: string;
    type: 'checkbox' | 'select' | 'number';
    points?: number;
    options?: FieldOption[];
    min?: number;
    max?: number;
}

interface Interpretation {
    range: [number, number];
    risk: string;
    probability?: string;
    action: string;
}

interface ClinicalScore {
    id: string;
    name: string;
    category: string;
    description: string;
    reference: string;
    fields: ScoreField[];
    formula?: string;
    interpretation: Interpretation[];
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface ScoresData {
    categories: Category[];
    scores: ClinicalScore[];
}

export default function ClinicalScoresPage() {
    const [data, setData] = useState<ScoresData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedScore, setSelectedScore] = useState<string | null>(null);
    const [values, setValues] = useState<Record<string, number | boolean>>({});
    const [result, setResult] = useState<{ score: number; interpretation: Interpretation } | null>(null);

    useEffect(() => {
        fetch('/data/clinical-scores.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredScores = useMemo(() => {
        if (!data) return [];
        if (selectedCategory === 'all') return data.scores;
        return data.scores.filter(s => s.category === selectedCategory);
    }, [data, selectedCategory]);

    const currentScore = data?.scores.find(s => s.id === selectedScore);

    const calculateScore = () => {
        if (!currentScore) return;

        let total = 0;

        // Special calculations for specific scores - DO NOT alter the math
        if (currentScore.id === 'meld') {
            const cr = Math.max(1, Math.min(4, Number(values.creatinine) || 1));
            const bili = Math.max(1, Number(values.bilirubin) || 1);
            const inr = Math.max(1, Number(values.inr) || 1);
            const dialysis = values.dialysis ? 4 : cr;

            total = Math.round(10 * (
                0.957 * Math.log(dialysis) +
                0.378 * Math.log(bili) +
                1.120 * Math.log(inr) +
                0.643
            ));
            total = Math.max(6, Math.min(40, total));
        } else if (currentScore.id === 'parkland') {
            const weight = Number(values.weight) || 0;
            const tbsa = Number(values.tbsa) || 0;
            total = Math.round(4 * weight * tbsa);
        } else if (currentScore.id === 'egfr') {
            const cr = Number(values.creatinine) || 1;
            const age = Number(values.age) || 40;
            const isFemale = values.female as boolean;
            const k = isFemale ? 0.7 : 0.9;
            const alpha = isFemale ? -0.329 : -0.411;
            total = Math.round(141 * Math.pow(Math.min(cr / k, 1), alpha) * Math.pow(Math.max(cr / k, 1), -1.209) * Math.pow(0.993, age) * (isFemale ? 1.018 : 1));
        } else if (currentScore.id === 'corrected_calcium') {
            const ca = Number(values.calcium) || 9;
            const alb = Number(values.albumin) || 4;
            total = Math.round((ca + 0.8 * (4 - alb)) * 10) / 10;
        } else if (currentScore.id === 'anion_gap') {
            const na = Number(values.sodium) || 140;
            const cl = Number(values.chloride) || 100;
            const hco3 = Number(values.bicarb) || 24;
            const alb = Number(values.albumin) || 4;
            const ag = na - (cl + hco3);
            total = Math.round(ag + 2.5 * (4 - alb));
        } else if (currentScore.id === 'gcs') {
            total = (Number(values.eye) || 1) + (Number(values.verbal) || 1) + (Number(values.motor) || 1);
        } else if (currentScore.id === 'nihss') {
            currentScore.fields.forEach(field => {
                total += Number(values[field.key]) || 0;
            });
        } else {
            currentScore.fields.forEach(field => {
                if (field.type === 'checkbox' && values[field.key]) {
                    total += field.points || 0;
                } else if (field.type === 'select' && values[field.key] !== undefined) {
                    total += Number(values[field.key]) || 0;
                } else if (field.type === 'number' && field.key === 'gcs') {
                    total += Number(values[field.key]) || 0;
                }
            });
        }

        const interp = currentScore.interpretation.find(i => total >= i.range[0] && total <= i.range[1])
            || currentScore.interpretation[currentScore.interpretation.length - 1];

        setResult({ score: total, interpretation: interp });
    };

    const handleSelectScore = (id: string) => {
        setSelectedScore(id);
        setValues({});
        setResult(null);
    };

    const handleReset = () => {
        setValues({});
        setResult(null);
    };

    // Severity classifier for result pill
    const severityPillClass = (risk: string) => {
        if (risk.includes('Low')) return 'pill pill-mint';
        if (risk.includes('High') || risk.includes('Severe') || risk.includes('Critical')) return 'pill pill-orange';
        return 'pill pill-lemon';
    };

    if (loading) {
        return (
            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }}>
                    <div className="row center" style={{ height: 256 }}>
                        <span className="mono muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loading…</span>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }} className="col gap-6">
                {/* Breadcrumb */}
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        flexWrap: 'wrap',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/for-doctors" style={{ color: 'var(--ink-3)' }}>For Doctors</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>Clinical Scores</span>
                </nav>

                {/* Hero */}
                <div className="col gap-3" style={{ maxWidth: 760 }}>
                    <span className="section-mark">for medical professionals</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5vw, 56px)',
                            lineHeight: 1.05,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Clinical <span style={{ color: 'var(--cobalt)' }}>scoring tools</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 18, margin: 0, maxWidth: 640 }}>
                        Evidence-based clinical calculators for risk stratification, prognosis, and treatment decisions.
                        {data && ` ${data.scores.length} validated scoring systems.`}
                    </p>
                </div>

                {/* Category filter */}
                <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
                    <div className="row gap-2" style={{ minWidth: 'max-content' }}>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={selectedCategory === 'all' ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                        >
                            All scores
                        </button>
                        {data?.categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={selectedCategory === cat.id ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                            >
                                <span style={{ marginRight: 6 }}>{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="row gap-6 ai-start" style={{ flexWrap: 'wrap' }}>
                    {/* Score list */}
                    <div className="col gap-2" style={{ flex: '1 1 280px', minWidth: 260, maxHeight: 800, overflowY: 'auto' }}>
                        {filteredScores.map(score => {
                            const cat = data?.categories.find(c => c.id === score.category);
                            const isActive = selectedScore === score.id;
                            return (
                                <button
                                    key={score.id}
                                    type="button"
                                    onClick={() => handleSelectScore(score.id)}
                                    className={isActive ? 'card-flat row gap-3 ai-start' : 'card row gap-3 ai-start'}
                                    style={{
                                        padding: 14,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        borderColor: isActive ? 'var(--cobalt)' : 'var(--rule)',
                                        background: isActive ? 'var(--cobalt-50)' : 'var(--paper)',
                                        width: '100%',
                                    }}
                                >
                                    <span style={{ fontSize: 20, lineHeight: 1 }}>{cat?.icon}</span>
                                    <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                                        <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
                                            {score.name}
                                        </span>
                                        <span className="muted" style={{ fontSize: 12 }}>{score.description}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Calculator panel */}
                    <div className="col gap-4" style={{ flex: '2 1 600px', minWidth: 0 }}>
                        {!currentScore ? (
                            <div className="card col gap-3 ai-center" style={{ padding: 64, textAlign: 'center' }}>
                                <span className="section-mark">select a score</span>
                                <h3 className="display" style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>
                                    Choose a clinical score
                                </h3>
                                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                    Pick a scoring system from the list to begin calculation.
                                </p>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Score header */}
                                <div className="col gap-2" style={{ padding: 24, borderBottom: '1px solid var(--rule)' }}>
                                    <h2 className="display" style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>
                                        {currentScore.name}
                                    </h2>
                                    <p className="muted" style={{ fontSize: 14, margin: 0 }}>{currentScore.description}</p>
                                    <span className="mono muted-2" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Reference: {currentScore.reference}
                                    </span>
                                    {currentScore.formula && (
                                        <div className="card-quiet" style={{ padding: 10, marginTop: 4 }}>
                                            <span className="mono" style={{ fontSize: 12, color: 'var(--cobalt)' }}>{currentScore.formula}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Fields */}
                                <div className="col gap-4" style={{ padding: 24 }}>
                                    {currentScore.fields.map(field => (
                                        <div key={field.key}>
                                            {field.type === 'checkbox' ? (
                                                <label className="card-quiet row gap-3 ai-start" style={{ padding: 12, cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!values[field.key]}
                                                        onChange={e => setValues(v => ({ ...v, [field.key]: e.target.checked }))}
                                                        style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--cobalt)' }}
                                                    />
                                                    <div>
                                                        <span style={{ fontSize: 14, color: 'var(--ink)' }}>{field.label}</span>
                                                        {field.points !== undefined && (
                                                            <span className="mono muted-2" style={{ fontSize: 11, marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                                ({field.points > 0 ? '+' : ''}{field.points} pts)
                                                            </span>
                                                        )}
                                                    </div>
                                                </label>
                                            ) : field.type === 'select' ? (
                                                <div className="form-group">
                                                    <label className="form-label">{field.label}</label>
                                                    <select
                                                        value={values[field.key] as number ?? ''}
                                                        onChange={e => setValues(v => ({ ...v, [field.key]: Number(e.target.value) }))}
                                                        className="select"
                                                    >
                                                        <option value="">Select...</option>
                                                        {field.options?.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label} ({opt.value} pts)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="form-group">
                                                    <label className="form-label">{field.label}</label>
                                                    <input
                                                        type="number"
                                                        value={values[field.key] as number ?? ''}
                                                        onChange={e => setValues(v => ({ ...v, [field.key]: parseFloat(e.target.value) }))}
                                                        min={field.min}
                                                        max={field.max}
                                                        step="any"
                                                        className="input"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="row gap-2" style={{ paddingTop: 8 }}>
                                        <button
                                            type="button"
                                            onClick={calculateScore}
                                            className="btn btn-cobalt btn-lg"
                                            style={{ flex: 1 }}
                                        >
                                            Calculate score →
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="btn btn-paper btn-lg"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                {/* Result */}
                                {result && (
                                    <div className="card-flat col gap-4" style={{ padding: 24, margin: 24, marginTop: 0, borderRadius: 'var(--r-3)' }}>
                                        <div className="col gap-2 ai-center" style={{ textAlign: 'center' }}>
                                            <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                Score result
                                            </span>
                                            <span className="bignum" style={{ fontSize: 64, color: 'var(--cobalt)' }}>
                                                {currentScore.id === 'parkland' ? `${(result.score / 1000).toFixed(1)}L` : result.score}
                                            </span>
                                            {currentScore.id === 'parkland' && (
                                                <span className="muted" style={{ fontSize: 13 }}>
                                                    First 8h: {(result.score / 2 / 1000).toFixed(1)}L · Next 16h: {(result.score / 2 / 1000).toFixed(1)}L
                                                </span>
                                            )}
                                        </div>

                                        <div className="card col gap-2" style={{ padding: 16 }}>
                                            <div className="row between ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                                                <span className={severityPillClass(result.interpretation.risk)}>
                                                    {result.interpretation.risk}
                                                </span>
                                                {result.interpretation.probability && (
                                                    <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                        {result.interpretation.probability}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
                                                {result.interpretation.action}
                                            </p>
                                        </div>

                                        {/* Interpretation table */}
                                        <div className="col gap-2">
                                            <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                Score interpretation
                                            </span>
                                            <div className="col">
                                                {currentScore.interpretation.map((interp, i) => {
                                                    const isCurrent = result.score >= interp.range[0] && result.score <= interp.range[1];
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="row gap-3 ai-center"
                                                            style={{
                                                                padding: '8px 12px',
                                                                background: isCurrent ? 'var(--cobalt-50)' : 'transparent',
                                                                borderLeft: isCurrent ? '2px solid var(--cobalt)' : '2px solid transparent',
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            <span className="num muted" style={{ width: 60, fontSize: 12 }}>
                                                                {interp.range[0]}-{interp.range[1]}
                                                            </span>
                                                            <span style={{ flex: 1, color: 'var(--ink)', fontWeight: isCurrent ? 500 : 400 }}>
                                                                {interp.risk}
                                                            </span>
                                                            {interp.probability && (
                                                                <span className="muted-2" style={{ fontSize: 11 }}>{interp.probability}</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="card col gap-2" style={{ padding: 24, borderColor: 'rgba(230, 185, 40, .40)' }}>
                    <span className="kicker" style={{ color: '#8C6A00' }}>
                        <span className="dot" style={{ background: 'var(--lemon-2)' }} />clinical decision support tool
                    </span>
                    <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                        These calculators are intended for use by medical professionals as clinical decision support tools.
                        They should not replace clinical judgment. Always consider the full clinical context when making
                        treatment decisions. Verify calculations independently for critical decisions.
                    </p>
                </div>
            </div>
        </main>
    );
}
