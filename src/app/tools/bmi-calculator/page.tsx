'use client';

import { useState } from 'react';
import Link from 'next/link';
import { categorizeBmi } from './lib';

type Severity = 'routine' | 'borderline' | 'urgent' | 'critical';

const SEVERITY_COLOR: Record<Severity, string> = {
    routine: 'var(--mint-3)',
    borderline: '#8C6A00',
    urgent: 'var(--orange-2)',
    critical: 'var(--sev-critical)',
};

function severityForCategory(category: string): Severity {
    switch (category) {
        case 'Normal weight':
            return 'routine';
        case 'Mild thinness':
        case 'Overweight (pre-obese)':
            return 'borderline';
        case 'Moderate thinness':
        case 'Obesity class I':
            return 'urgent';
        case 'Severe thinness':
        case 'Obesity class II':
        case 'Obesity class III':
            return 'critical';
        default:
            return 'borderline';
    }
}

export default function BMICalculatorPage() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState<{ bmi: number; category: string; severity: Severity } | null>(null);
    const [error, setError] = useState<string | null>(null);

    function calculate() {
        setError(null);
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (isNaN(w) || w <= 0) {
            setError('Please enter a valid weight (must be greater than 0).');
            setResult(null);
            return;
        }
        if (w > 500) {
            setError('Weight must be less than 500 kg.');
            setResult(null);
            return;
        }
        if (isNaN(h) || h <= 0) {
            setError('Please enter a valid height (must be greater than 0).');
            setResult(null);
            return;
        }
        if (h < 50 || h > 300) {
            setError('Height must be between 50 and 300 cm.');
            setResult(null);
            return;
        }

        const heightInMeters = h / 100;
        const bmi = w / (heightInMeters * heightInMeters);
        const category = categorizeBmi(bmi);
        setResult({ bmi, category, severity: severityForCategory(category) });
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1200, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
                className="col gap-6"
            >
                {/* ── Breadcrumb ───────────────────────── */}
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
                    <span style={{ color: 'var(--ink)' }}>BMI Calculator</span>
                </nav>

                {/* ── Hero ─────────────────────────────── */}
                <header className="col gap-4">
                    <span className="section-mark">tools / bmi calculator</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>BMI</span> calculator
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Body Mass Index from weight and height — WHO classification with obesity classes I, II, III. Useful as a screen, not a diagnosis.
                    </p>
                </header>

                {/* ── Calculator + Result ──────────────── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 16,
                    }}
                    className="bmi-grid"
                >
                    {/* Form */}
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
                                Calculate your BMI
                            </h2>
                        </div>

                        <div className="col gap-3">
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
                                    Weight (kg)
                                </span>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="e.g. 70"
                                    className="input"
                                />
                            </label>
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
                                    Height (cm)
                                </span>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                    placeholder="e.g. 170"
                                    className="input"
                                />
                            </label>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: 'var(--r-2)',
                                    background: 'var(--orange-50)',
                                    border: '1px solid rgba(255, 90, 46, .28)',
                                    color: 'var(--orange-2)',
                                    fontSize: 13,
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-cobalt btn-lg">
                            Calculate BMI →
                        </button>
                    </form>

                    {/* Result */}
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
                                        Your BMI
                                    </span>
                                    <div
                                        className="bignum"
                                        style={{
                                            fontSize: 'clamp(56px, 8vw, 96px)',
                                            color: SEVERITY_COLOR[result.severity],
                                        }}
                                    >
                                        {result.bmi.toFixed(1)}
                                    </div>
                                    <div
                                        className="display"
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 600,
                                            color: SEVERITY_COLOR[result.severity],
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {result.category}
                                    </div>
                                </div>
                                <div className="hairline" />
                                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                                    {result.category === 'Normal weight'
                                        ? 'Your BMI is within the WHO healthy range. Maintain your current habits — regular movement and a balanced diet.'
                                        : result.severity === 'borderline'
                                            ? 'Your BMI sits at the edge of the healthy range. Small lifestyle changes — diet quality, daily movement — can shift it back.'
                                            : 'Your BMI is outside the healthy range. Consider talking to a clinician about a personalized plan; BMI alone can mislead for athletes and older adults.'}
                                </p>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    <Link
                                        href="/doctors/specialty/general-physician"
                                        className="btn btn-paper"
                                    >
                                        Consult a doctor
                                    </Link>
                                    <Link href="/tools" className="btn btn-ghost">
                                        Other calculators
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Enter your weight and height. Result appears here in tabular display numerals, colored by category.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── BMI Categories Table ────────────── */}
                <section className="col gap-4" aria-labelledby="bmi-cats-heading">
                    <h2
                        id="bmi-cats-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        BMI categories
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
                            { range: '< 18.5', category: 'Underweight', sev: 'borderline' as Severity },
                            { range: '18.5 – 24.9', category: 'Normal weight', sev: 'routine' as Severity },
                            { range: '25.0 – 29.9', category: 'Overweight', sev: 'borderline' as Severity },
                            { range: '30.0 – 34.9', category: 'Obesity class I', sev: 'urgent' as Severity },
                            { range: '35.0 – 39.9', category: 'Obesity class II', sev: 'critical' as Severity },
                            { range: '≥ 40.0', category: 'Obesity class III', sev: 'critical' as Severity },
                        ].map((item, i, arr) => (
                            <div
                                key={item.category}
                                className="row ai-center between"
                                style={{
                                    padding: '14px 22px',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                }}
                            >
                                <div className="row gap-3 ai-center">
                                    <span
                                        className="pill-dot"
                                        style={{
                                            display: 'inline-block',
                                            background: SEVERITY_COLOR[item.sev],
                                        }}
                                    />
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.category}</span>
                                </div>
                                <span
                                    className="num"
                                    style={{ fontSize: 13, color: 'var(--ink-3)' }}
                                >
                                    BMI {item.range}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── About ──────────────────────────── */}
                <section className="card col gap-4" style={{ padding: 32 }} aria-labelledby="about-heading">
                    <h2
                        id="about-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        About this calculator
                    </h2>
                    <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0, lineHeight: 1.7 }}>
                        Body Mass Index is your weight in kilograms divided by the square of your height in meters (kg/m²). It is a screening tool, not a diagnosis: a high BMI doesn’t guarantee disease, and a normal BMI doesn’t guarantee health.
                    </p>
                    <h3 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 600 }}>
                        Where BMI falls short
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
                            'Doesn’t distinguish muscle mass from fat mass.',
                            'Can mislead for athletes and very lean trained individuals.',
                            'Doesn’t account for age, sex, or ethnic differences in body composition.',
                            'Best read alongside waist circumference, blood pressure, and lipid panel.',
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

                {/* ── Related ───────────────────────── */}
                <section className="col gap-4" aria-labelledby="related-heading">
                    <h2
                        id="related-heading"
                        className="display"
                        style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        Related tools
                    </h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {[
                            { name: 'Body fat calculator', href: '/tools/body-fat-calculator', desc: 'U.S. Navy method estimate.' },
                            { name: 'BMR calculator', href: '/tools/bmr-calculator', desc: 'Daily calorie needs.' },
                            { name: 'Water intake', href: '/tools/water-intake-calculator', desc: 'Daily hydration target.' },
                        ].map(tool => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="card col gap-2"
                                style={{ padding: 20 }}
                            >
                                <div
                                    className="display"
                                    style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em' }}
                                >
                                    {tool.name}
                                </div>
                                <div className="muted" style={{ fontSize: 13 }}>{tool.desc}</div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── Disclaimer ────────────────────── */}
                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> This BMI calculator provides estimates for informational purposes only and should not replace professional medical advice. Consult a healthcare provider for personalized guidance.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 880px) {
                    .bmi-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}
