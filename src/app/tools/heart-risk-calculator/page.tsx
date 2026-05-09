'use client';

import { useState } from 'react';
import Link from 'next/link';

type Severity = 'routine' | 'borderline' | 'urgent' | 'critical';

const SEVERITY_COLOR: Record<Severity, string> = {
    routine: 'var(--mint-3)',
    borderline: '#8C6A00',
    urgent: 'var(--orange-2)',
    critical: 'var(--sev-critical)',
};

export default function HeartRiskCalculatorPage() {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [systolic, setSystolic] = useState('');
    const [cholesterol, setCholesterol] = useState('');
    const [smoker, setSmoker] = useState('No');
    const [diabetic, setDiabetic] = useState('No');
    const [result, setResult] = useState<{ score: number; risk: string; severity: Severity } | null>(null);

    function calculate() {
        let score = 0;
        const a = parseFloat(age);
        if (a > 55) score += 3; else if (a > 45) score += 2; else if (a > 35) score += 1;
        if (gender === 'Male') score += 1;
        const bp = parseFloat(systolic);
        if (bp > 140) score += 3; else if (bp > 130) score += 2;
        const chol = parseFloat(cholesterol);
        if (chol > 240) score += 2; else if (chol > 200) score += 1;
        if (smoker === 'Yes') score += 3;
        if (diabetic === 'Yes') score += 2;

        const risk = score <= 3 ? 'Low' : score <= 6 ? 'Moderate' : score <= 9 ? 'High' : 'Very high';
        const severity: Severity = score <= 3 ? 'routine' : score <= 6 ? 'borderline' : score <= 9 ? 'urgent' : 'critical';
        setResult({ score, risk, severity });
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 80px' }}
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
                    <span style={{ color: 'var(--ink)' }}>Heart Risk</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / heart risk</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>10-year</span> heart risk
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Quick estimate of cardiovascular disease risk over the next decade. Six modifiable and non-modifiable inputs.
                    </p>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 16,
                    }}
                    className="hr-grid"
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
                                Assess heart risk
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
                                    placeholder="e.g. 45"
                                    className="input"
                                />
                            </Field>
                            <Field label="Gender">
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    className="select"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </Field>
                            <Field label="Systolic BP (mmHg)">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={systolic}
                                    onChange={e => setSystolic(e.target.value)}
                                    placeholder="e.g. 120"
                                    className="input"
                                />
                            </Field>
                            <Field label="Total cholesterol (mg/dL)">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={cholesterol}
                                    onChange={e => setCholesterol(e.target.value)}
                                    placeholder="e.g. 200"
                                    className="input"
                                />
                            </Field>
                            <Field label="Smoker?">
                                <select
                                    value={smoker}
                                    onChange={e => setSmoker(e.target.value)}
                                    className="select"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                            <Field label="Diabetic?">
                                <select
                                    value={diabetic}
                                    onChange={e => setDiabetic(e.target.value)}
                                    className="select"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                        </div>

                        <button type="submit" className="btn btn-cobalt btn-lg">
                            Calculate heart risk →
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
                                        10-year cardiovascular risk
                                    </span>
                                    <div
                                        className="bignum"
                                        style={{
                                            fontSize: 'clamp(48px, 7vw, 88px)',
                                            color: SEVERITY_COLOR[result.severity],
                                        }}
                                    >
                                        {result.risk}
                                    </div>
                                    <span className="num muted" style={{ fontSize: 13 }}>
                                        score {result.score}/15
                                    </span>
                                </div>
                                <div className="hairline" />
                                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                                    {result.risk === 'Low' && 'Risk appears low. Continue with regular movement, Mediterranean-pattern diet, and routine check-ups.'}
                                    {result.risk === 'Moderate' && 'Moderate risk. Lifestyle changes plus a baseline lipid panel and BP monitoring would be worthwhile.'}
                                    {result.risk === 'High' && 'Elevated risk. Recommend a cardiology consult — discuss statin/BP medication and structured lifestyle intervention.'}
                                    {result.risk === 'Very high' && 'Very high risk. See a cardiologist promptly. Aggressive risk-factor modification typically warranted.'}
                                </p>
                                <Link href="/doctors/specialty/cardiologist" className="btn btn-cobalt">
                                    Find a cardiologist →
                                </Link>
                            </>
                        ) : (
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Enter your inputs. Risk score appears here, colored by severity.
                            </p>
                        )}
                    </div>
                </div>

                <section className="col gap-4" aria-labelledby="rf-heading">
                    <h2
                        id="rf-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        Heart disease risk factors
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
                            { f: 'High blood pressure', d: 'Consistently above 130/80 mmHg' },
                            { f: 'High cholesterol', d: 'Total cholesterol above 200 mg/dL' },
                            { f: 'Smoking', d: 'Current or recent tobacco use' },
                            { f: 'Diabetes', d: 'Type 1 or Type 2' },
                            { f: 'Obesity', d: 'BMI ≥ 30' },
                            { f: 'Family history', d: 'Heart disease in first-degree relatives' },
                        ].map((item, i, arr) => {
                            const cols = 3;
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= arr.length - cols;
                            return (
                                <div
                                    key={item.f}
                                    className="col gap-2"
                                    style={{
                                        padding: 20,
                                        borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                    }}
                                >
                                    <div
                                        className="display"
                                        style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em' }}
                                    >
                                        {item.f}
                                    </div>
                                    <div className="muted" style={{ fontSize: 13 }}>{item.d}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> Simplified risk estimate. Real cardiovascular risk depends on many factors — see a cardiologist for a comprehensive assessment using validated calculators (ASCVD, QRISK3).
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 880px) {
                    .hr-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
        </label>
    );
}
