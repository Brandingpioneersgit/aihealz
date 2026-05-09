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

export default function BodyFatCalculatorPage() {
    const [gender, setGender] = useState('Male');
    const [waist, setWaist] = useState('');
    const [neck, setNeck] = useState('');
    const [height, setHeight] = useState('');
    const [hip, setHip] = useState('');
    const [result, setResult] = useState<{ bodyFat: number; category: string; severity: Severity } | null>(null);
    const [error, setError] = useState<string | null>(null);

    function calculate() {
        const w = parseFloat(waist);
        const n = parseFloat(neck);
        const h = parseFloat(height);
        const hp = parseFloat(hip);

        setError(null);

        if (gender === 'Male' && w > 0 && n > 0 && h > 0) {
            const bf = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
            const category = bf < 14 ? 'Athletic' : bf < 18 ? 'Fit' : bf < 25 ? 'Average' : 'Above average';
            const severity: Severity = bf < 18 ? 'routine' : bf < 25 ? 'borderline' : 'urgent';
            setResult({ bodyFat: bf, category, severity });
        } else if (gender === 'Female' && w > 0 && n > 0 && h > 0 && hp > 0) {
            const bf = 163.205 * Math.log10(w + hp - n) - 97.684 * Math.log10(h) - 78.387;
            const category = bf < 21 ? 'Athletic' : bf < 25 ? 'Fit' : bf < 32 ? 'Average' : 'Above average';
            const severity: Severity = bf < 25 ? 'routine' : bf < 32 ? 'borderline' : 'urgent';
            setResult({ bodyFat: bf, category, severity });
        } else {
            setError('Enter all measurements (height, neck, waist' + (gender === 'Female' ? ', hip' : '') + ').');
            setResult(null);
        }
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
                    <span style={{ color: 'var(--ink)' }}>Body Fat Calculator</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / body fat calculator</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>Body fat</span> percentage
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        U.S. Navy circumference method. More telling than BMI for body composition — distinguishes muscle from fat without expensive equipment.
                    </p>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 16,
                    }}
                    className="bf-grid"
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
                                Calculate body fat
                            </h2>
                        </div>

                        <Field label="Gender">
                            <div className="row gap-2">
                                {['Male', 'Female'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setGender(g)}
                                        className={gender === g ? 'btn btn-primary' : 'btn btn-paper'}
                                        style={{ flex: 1 }}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                            }}
                        >
                            <Field label="Height (cm)">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                    placeholder="e.g. 170"
                                    className="input"
                                />
                            </Field>
                            <Field label="Neck (cm)" hint="Below the Adam’s apple">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={neck}
                                    onChange={e => setNeck(e.target.value)}
                                    placeholder="e.g. 38"
                                    className="input"
                                />
                            </Field>
                            <Field label="Waist (cm)" hint="At belly-button level">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={waist}
                                    onChange={e => setWaist(e.target.value)}
                                    placeholder="e.g. 85"
                                    className="input"
                                />
                            </Field>
                            {gender === 'Female' && (
                                <Field label="Hip (cm)" hint="At widest point of hips">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        value={hip}
                                        onChange={e => setHip(e.target.value)}
                                        placeholder="e.g. 95"
                                        className="input"
                                    />
                                </Field>
                            )}
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
                            Calculate body fat →
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
                                        Estimated body fat
                                    </span>
                                    <div
                                        className="bignum"
                                        style={{
                                            fontSize: 'clamp(56px, 8vw, 96px)',
                                            color: SEVERITY_COLOR[result.severity],
                                        }}
                                    >
                                        {result.bodyFat.toFixed(1)}%
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
                                    {result.category === 'Athletic' && 'Excellent. Your body fat is in the athletic range — typical for competitive athletes.'}
                                    {result.category === 'Fit' && 'Healthy fit range. Ideal for general health and athletic performance.'}
                                    {result.category === 'Average' && 'Average range. Consider more regular movement and balanced nutrition.'}
                                    {result.category === 'Above average' && 'Above the recommended range. Consider consulting a clinician or dietitian for a tailored plan.'}
                                </p>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    <Link href="/tools/bmi-calculator" className="btn btn-paper">Check BMI</Link>
                                    <Link href="/tools/bmr-calculator" className="btn btn-ghost">Calorie needs</Link>
                                </div>
                            </>
                        ) : (
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Pick gender and enter circumferences. Estimate appears here, colored by category.
                            </p>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <section className="col gap-4" aria-labelledby="ranges-heading">
                    <h2
                        id="ranges-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        Body fat ranges
                    </h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {[
                            {
                                label: 'Men',
                                rows: [
                                    { c: 'Essential fat', r: '2 – 5%', sev: 'routine' as Severity },
                                    { c: 'Athletic', r: '6 – 13%', sev: 'routine' as Severity },
                                    { c: 'Fit', r: '14 – 17%', sev: 'routine' as Severity },
                                    { c: 'Average', r: '18 – 24%', sev: 'borderline' as Severity },
                                    { c: 'Above average', r: '25%+', sev: 'urgent' as Severity },
                                ],
                            },
                            {
                                label: 'Women',
                                rows: [
                                    { c: 'Essential fat', r: '10 – 13%', sev: 'routine' as Severity },
                                    { c: 'Athletic', r: '14 – 20%', sev: 'routine' as Severity },
                                    { c: 'Fit', r: '21 – 24%', sev: 'routine' as Severity },
                                    { c: 'Average', r: '25 – 31%', sev: 'borderline' as Severity },
                                    { c: 'Above average', r: '32%+', sev: 'urgent' as Severity },
                                ],
                            },
                        ].map(group => (
                            <div key={group.label} className="card" style={{ padding: 0 }}>
                                <div
                                    className="kicker"
                                    style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)' }}
                                >
                                    <span className="dot" />
                                    {group.label}
                                </div>
                                {group.rows.map((row, i, arr) => (
                                    <div
                                        key={row.c}
                                        className="row ai-center between"
                                        style={{
                                            padding: '12px 22px',
                                            borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                        }}
                                    >
                                        <div className="row gap-3 ai-center">
                                            <span
                                                className="pill-dot"
                                                style={{
                                                    display: 'inline-block',
                                                    background: SEVERITY_COLOR[row.sev],
                                                }}
                                            />
                                            <span style={{ fontSize: 14 }}>{row.c}</span>
                                        </div>
                                        <span className="num" style={{ fontSize: 13, color: 'var(--ink-3)' }}>{row.r}</span>
                                    </div>
                                ))}
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
                        The U.S. Navy formula uses circumference measurements to estimate body fat. Developed for fast field assessment without DEXA or hydrostatic equipment, it’s a useful screen — typically within 3–4% of gold-standard methods for most people.
                    </p>
                    <h3 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 600 }}>
                        Why body fat % beats BMI
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
                            'BMI doesn’t distinguish muscle from fat — bodybuilders read “obese.”',
                            'Visceral fat percentage predicts cardiometabolic risk better.',
                            'Tracks fitness progress more honestly than the scale.',
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
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> The Navy method provides an estimate only. For research-grade accuracy, see DEXA or hydrostatic weighing. Not suitable for very lean trained athletes — formula can underestimate.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 880px) {
                    .bf-grid {
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
