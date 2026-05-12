'use client';

import { useState } from 'react';
import Link from 'next/link';

type Severity = 'routine' | 'borderline' | 'urgent';

const SEVERITY_COLOR: Record<Severity, string> = {
    routine: 'var(--mint-3)',
    borderline: '#8C6A00',
    urgent: 'var(--orange-2)',
};

export default function DiabetesRiskCalculatorPage() {
    const [age, setAge] = useState('');
    const [bmi, setBmi] = useState('');
    const [familyHistory, setFamilyHistory] = useState('No');
    const [exercise, setExercise] = useState('Moderate');
    const [waist, setWaist] = useState('');
    const [result, setResult] = useState<{ score: number; risk: string; severity: Severity } | null>(null);

    function calculate() {
        let score = 0;
        const a = parseFloat(age);
        if (a > 55) score += 3; else if (a > 45) score += 2; else if (a > 35) score += 1;

        const b = parseFloat(bmi);
        if (b > 30) score += 3; else if (b > 25) score += 2;

        if (familyHistory === 'Yes') score += 3;

        if (exercise === 'None') score += 2; else if (exercise === '1-2 days') score += 1;

        const w = parseFloat(waist);
        if (w > 102) score += 2; else if (w > 88) score += 1;

        const risk = score <= 3 ? 'Low' : score <= 7 ? 'Moderate' : 'High';
        const severity: Severity = score <= 3 ? 'routine' : score <= 7 ? 'borderline' : 'urgent';
        setResult({ score, risk, severity });
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1200, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
                className="col gap-6"
            >
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/tools">Tools</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>Diabetes Risk</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / diabetes risk</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5vw, 72px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        <span style={{ color: 'var(--cobalt)' }}>Type 2 diabetes</span> risk
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Five validated risk factors. Early detection plus lifestyle change can prevent or delay onset by years.
                    </p>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 16,
                    }}
                    className="dr-grid"
                >
                    <form
                        className="card col gap-5"
                        style={{ padding: 28 }}
                        onSubmit={e => {
                            e.preventDefault();
                            calculate();
                        }}
                    >
                        <div className="col gap-1">
                            <div className="kicker"><span className="dot" />inputs</div>
                            <h2
                                className="display"
                                style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                            >
                                Assess your risk
                            </h2>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                            }}
                        >
                            <Field label="Age">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    placeholder="e.g. 40"
                                    className="input"
                                />
                            </Field>
                            <Field label="BMI">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={bmi}
                                    onChange={e => setBmi(e.target.value)}
                                    placeholder="e.g. 25"
                                    className="input"
                                />
                            </Field>
                            <Field label="Family history">
                                <select
                                    value={familyHistory}
                                    onChange={e => setFamilyHistory(e.target.value)}
                                    className="select"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes (parent or sibling)</option>
                                </select>
                            </Field>
                            <Field label="Weekly exercise">
                                <select
                                    value={exercise}
                                    onChange={e => setExercise(e.target.value)}
                                    className="select"
                                >
                                    <option value="None">None</option>
                                    <option value="1-2 days">1–2 days/wk</option>
                                    <option value="3-5 days">3–5 days/wk</option>
                                    <option value="Daily">Daily</option>
                                </select>
                            </Field>
                        </div>
                        <Field label="Waist circumference (cm)" hint="Around belly button while standing">
                            <input
                                type="number"
                                inputMode="decimal"
                                value={waist}
                                onChange={e => setWaist(e.target.value)}
                                placeholder="e.g. 85"
                                className="input"
                            />
                        </Field>
                        <div>
                            <Link
                                href="/tools/bmi-calculator"
                                className="mono"
                                style={{ fontSize: 12, color: 'var(--cobalt)' }}
                            >
                                Don’t know your BMI? Calculate here →
                            </Link>
                        </div>

                        <button type="submit" className="btn btn-cobalt btn-lg">
                            Calculate diabetes risk →
                        </button>
                    </form>

                    <div className="card-flat col gap-4" style={{ padding: 28 }}>
                        <div className="kicker"><span className="dot" />result</div>
                        {result ? (
                            <>
                                <div className="col gap-2">
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: 'var(--ink-3)',
                                        }}
                                    >
                                        Type 2 diabetes risk
                                    </span>
                                    <div
                                        className="bignum"
                                        style={{
                                            fontSize: 'clamp(56px, 8vw, 96px)',
                                            color: SEVERITY_COLOR[result.severity],
                                        }}
                                    >
                                        {result.risk}
                                    </div>
                                    <span className="num muted" style={{ fontSize: 13 }}>
                                        score {result.score}/13
                                    </span>
                                </div>
                                <div className="hairline" />
                                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                                    {result.risk === 'Low' && 'Risk appears low. Maintain regular movement and balanced nutrition. Standard screening intervals apply.'}
                                    {result.risk === 'Moderate' && 'Some elevated factors. Consider an HbA1c or fasting glucose test, and target the modifiable factors first — weight, waist, activity.'}
                                    {result.risk === 'High' && 'Elevated risk profile. Recommend an endocrinology consult and blood-sugar testing (HbA1c + fasting glucose). Many factors are modifiable with structured intervention.'}
                                </p>
                                {result.risk !== 'Low' && (
                                    <Link
                                        href="/doctors/specialty/endocrinologist"
                                        className="btn btn-cobalt"
                                    >
                                        Find an endocrinologist →
                                    </Link>
                                )}
                            </>
                        ) : (
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Answer the questions on the left. Risk score and recommendation appear here.
                            </p>
                        )}
                    </div>
                </div>

                {/* Risk factors */}
                <section className="col gap-4" aria-labelledby="rf-heading">
                    <h2
                        id="rf-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        Diabetes risk factors
                    </h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 0,
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {[
                            { factor: 'Overweight / obesity', desc: 'BMI ≥ 25', mod: true },
                            { factor: 'Family history', desc: 'Parent or sibling with T2D', mod: false },
                            { factor: 'Sedentary lifestyle', desc: 'Little or no physical activity', mod: true },
                            { factor: 'Age', desc: 'Risk increases after 45', mod: false },
                            { factor: 'High blood pressure', desc: 'BP > 140/90 mmHg', mod: true },
                            { factor: 'Abdominal fat', desc: 'Large waist circumference', mod: true },
                        ].map((item, i, arr) => {
                            const cols = 3;
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= arr.length - cols;
                            return (
                                <div
                                    key={item.factor}
                                    className="col gap-2"
                                    style={{
                                        padding: 20,
                                        borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                    }}
                                >
                                    <div className="row between ai-center">
                                        <div
                                            className="display"
                                            style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em' }}
                                        >
                                            {item.factor}
                                        </div>
                                        {item.mod && (
                                            <span className="pill pill-mint">modifiable</span>
                                        )}
                                    </div>
                                    <div className="muted" style={{ fontSize: 13 }}>{item.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> Risk estimate based on known factors — not a diagnosis. Only blood tests can confirm diabetes. Consult a clinician for proper evaluation.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 880px) {
                    .dr-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="col gap-2">
            <span
                className="mono"
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--ink-3)',
                }}
            >
                {label}
            </span>
            {children}
            {hint && (
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{hint}</span>
            )}
        </label>
    );
}
