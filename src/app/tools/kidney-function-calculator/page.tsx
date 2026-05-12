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

export default function KidneyFunctionCalculatorPage() {
    const [creatinine, setCreatinine] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [result, setResult] = useState<{ egfr: number; stage: string; severity: Severity } | null>(null);

    function calculate() {
        const cr = parseFloat(creatinine);
        const a = parseFloat(age);
        if (cr > 0 && a > 0) {
            const isFemale = gender === 'Female';
            const k = isFemale ? 0.7 : 0.9;
            const alpha = isFemale ? -0.329 : -0.411;
            const eGFR = 141 * Math.pow(Math.min(cr / k, 1), alpha) * Math.pow(Math.max(cr / k, 1), -1.209) * Math.pow(0.993, a) * (isFemale ? 1.018 : 1);

            const stage = eGFR >= 90 ? 'Normal (Stage 1)' : eGFR >= 60 ? 'Mild decrease (Stage 2)' : eGFR >= 30 ? 'Moderate (Stage 3)' : eGFR >= 15 ? 'Severe (Stage 4)' : 'Kidney failure (Stage 5)';
            const severity: Severity = eGFR >= 90 ? 'routine' : eGFR >= 60 ? 'borderline' : eGFR >= 30 ? 'urgent' : 'critical';
            setResult({ egfr: Math.round(eGFR), stage, severity });
        }
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
                    <span style={{ color: 'var(--ink)' }}>eGFR Calculator</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / kidney function</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>eGFR</span> · kidney function
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Estimated Glomerular Filtration Rate using the CKD-EPI 2009 equation. The standard screen for chronic kidney disease.
                    </p>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 16,
                    }}
                    className="kd-grid"
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
                                Calculate eGFR
                            </h2>
                        </div>

                        <Field label="Serum creatinine (mg/dL)">
                            <input
                                type="number"
                                step="0.1"
                                inputMode="decimal"
                                value={creatinine}
                                onChange={e => setCreatinine(e.target.value)}
                                placeholder="e.g. 1.0"
                                className="input"
                            />
                        </Field>
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
                        </div>

                        <button type="submit" className="btn btn-cobalt btn-lg">
                            Calculate eGFR →
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
                                        Estimated GFR
                                    </span>
                                    <div
                                        className="bignum"
                                        style={{
                                            fontSize: 'clamp(56px, 8vw, 96px)',
                                            color: SEVERITY_COLOR[result.severity],
                                        }}
                                    >
                                        {result.egfr}
                                    </div>
                                    <span className="num muted" style={{ fontSize: 13 }}>mL/min/1.73m²</span>
                                    <div
                                        className="display"
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 600,
                                            color: SEVERITY_COLOR[result.severity],
                                            letterSpacing: '-0.02em',
                                            marginTop: 6,
                                        }}
                                    >
                                        {result.stage}
                                    </div>
                                </div>
                                <div className="hairline" />
                                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                                    {result.egfr >= 90 && 'Kidney function appears normal. Continue routine check-ups; recheck creatinine annually.'}
                                    {result.egfr >= 60 && result.egfr < 90 && 'Mild decrease — common with age. Monitor with regular tests, control BP, and stay hydrated.'}
                                    {result.egfr >= 30 && result.egfr < 60 && 'Moderate reduction. Consult a nephrologist for evaluation, medication review, and CKD-stage-appropriate management.'}
                                    {result.egfr < 30 && 'Significant reduction. See a nephrologist promptly — discuss preparation for renal replacement therapy planning.'}
                                </p>
                                {result.egfr < 60 && (
                                    <Link href="/doctors/specialty/nephrologist" className="btn btn-cobalt">
                                        Find a nephrologist →
                                    </Link>
                                )}
                            </>
                        ) : (
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Enter your serum creatinine, age, and gender. Result appears here, colored by CKD stage.
                            </p>
                        )}
                    </div>
                </div>

                {/* CKD stages */}
                <section className="col gap-4" aria-labelledby="stages-heading">
                    <h2
                        id="stages-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        Chronic kidney disease stages
                    </h2>
                    <div
                        style={{
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {[
                            { stage: 'Stage 1', gfr: '≥ 90', desc: 'Normal kidney function', sev: 'routine' as Severity },
                            { stage: 'Stage 2', gfr: '60 – 89', desc: 'Mild loss of function', sev: 'borderline' as Severity },
                            { stage: 'Stage 3a', gfr: '45 – 59', desc: 'Mild to moderate loss', sev: 'borderline' as Severity },
                            { stage: 'Stage 3b', gfr: '30 – 44', desc: 'Moderate to severe loss', sev: 'urgent' as Severity },
                            { stage: 'Stage 4', gfr: '15 – 29', desc: 'Severe loss', sev: 'urgent' as Severity },
                            { stage: 'Stage 5', gfr: '< 15', desc: 'Kidney failure', sev: 'critical' as Severity },
                        ].map((item, i, arr) => (
                            <div
                                key={item.stage}
                                className="row ai-center between"
                                style={{
                                    padding: '14px 22px',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                }}
                            >
                                <div className="row gap-3 ai-center" style={{ minWidth: 0 }}>
                                    <span
                                        className="pill-dot"
                                        style={{
                                            display: 'inline-block',
                                            background: SEVERITY_COLOR[item.sev],
                                        }}
                                    />
                                    <div className="col">
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{item.stage}</span>
                                        <span className="muted" style={{ fontSize: 12 }}>{item.desc}</span>
                                    </div>
                                </div>
                                <span
                                    className="num"
                                    style={{ fontSize: 13, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}
                                >
                                    eGFR {item.gfr}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="card col gap-4" style={{ padding: 32 }} aria-labelledby="about-heading">
                    <h2
                        id="about-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        About this calculator
                    </h2>
                    <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0, lineHeight: 1.7 }}>
                        eGFR estimates how well your kidneys filter waste from blood, in mL/min per 1.73m² body surface area. This calculator uses the CKD-EPI 2009 equation — the current standard for adults.
                    </p>
                    <h3 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 600 }}>
                        Why eGFR matters
                    </h3>
                    <ul
                        style={{
                            margin: 0,
                            padding: 0,
                            listStyle: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        {[
                            'Earliest practical screen for chronic kidney disease.',
                            'Tracks function over time — trend matters more than a single reading.',
                            'Determines safe dosing for many medications (especially metformin, NSAIDs, contrast).',
                            'Triggers referral to nephrology and planning for advanced therapy.',
                        ].map(item => (
                            <li
                                key={item}
                                className="row gap-3 ai-start"
                                style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}
                            >
                                <span
                                    style={{
                                        flexShrink: 0,
                                        marginTop: 7,
                                        width: 6,
                                        height: 6,
                                        background: 'var(--cobalt)',
                                        borderRadius: 999,
                                    }}
                                />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> Estimate using the CKD-EPI 2009 equation. Lab-reported eGFR may use a newer race-free 2021 variant. For clinical decisions, use your lab’s value and consult a clinician.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 880px) {
                    .kd-grid {
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
