'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BMRCalculatorPage() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [activity, setActivity] = useState('1.55');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ bmr: number; maintenance: number; weightLoss: number; weightGain: number } | null>(null);

    // Mifflin-St Jeor equation (1990) — clinically preferred over the
    // 1919 Harris-Benedict revision because it tracks measured RMR
    // ~5% closer in modern populations.
    function calculate() {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseFloat(age);
        const mult = parseFloat(activity);
        if (!(w > 0 && h > 0 && a > 0 && mult > 0)) {
            setError('Enter weight, height, and age — all values must be greater than zero.');
            setResult(null);
            return;
        }
        setError(null);
        const bmr = gender === 'Male'
            ? (10 * w) + (6.25 * h) - (5 * a) + 5
            : (10 * w) + (6.25 * h) - (5 * a) - 161;
        const maintenance = bmr * mult;
        setResult({
            bmr: Math.round(bmr),
            maintenance: Math.round(maintenance),
            weightLoss: Math.round(maintenance - 500),
            weightGain: Math.round(maintenance + 500),
        });
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1200, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
                className="col gap-6"
            >
                {/* ── Breadcrumb ───────────────────── */}
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
                    <span style={{ color: 'var(--ink)' }}>BMR Calculator</span>
                </nav>

                {/* ── Hero ─────────────────────────── */}
                <header className="col gap-4">
                    <span className="section-mark">tools / bmr calculator</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>BMR</span> &amp; calorie calculator
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Mifflin-St Jeor equation. Calculates resting metabolic rate plus daily targets for maintenance, deficit, and surplus.
                    </p>
                </header>

                {/* ── Calculator + Result ──────────── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 16,
                    }}
                    className="bmr-grid"
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
                                Calculate your BMR
                            </h2>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                            }}
                        >
                            <Field label="Weight (kg)">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="e.g. 70"
                                    className="input"
                                />
                            </Field>
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
                            <Field label="Age (years)">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    placeholder="e.g. 30"
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

                        <Field label="Activity level">
                            <select
                                value={activity}
                                onChange={e => setActivity(e.target.value)}
                                className="select"
                            >
                                <option value="1.2">Sedentary — desk job, little or no exercise</option>
                                <option value="1.375">Lightly active — light exercise 1–3 days/week</option>
                                <option value="1.55">Moderately active — exercise 3–5 days/week</option>
                                <option value="1.725">Very active — hard exercise 6–7 days/week</option>
                                <option value="1.9">Extra active — physical job + daily training</option>
                            </select>
                        </Field>

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
                            Calculate BMR &amp; calories →
                        </button>
                    </form>

                    {/* Result */}
                    <div className="card-flat col gap-5" style={{ padding: 28 }}>
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
                                        Maintenance calories
                                    </span>
                                    <div
                                        className="bignum"
                                        style={{
                                            fontSize: 'clamp(56px, 8vw, 96px)',
                                            color: 'var(--cobalt)',
                                        }}
                                    >
                                        {result.maintenance.toLocaleString()}
                                    </div>
                                    <span className="muted" style={{ fontSize: 13 }}>kcal/day at chosen activity level</span>
                                </div>

                                <div className="hairline" />

                                <div
                                    className="bmr-result-grid"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                        gap: 0,
                                        border: '1px solid var(--rule)',
                                        borderRadius: 'var(--r-2)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {[
                                        { label: 'BMR (rest)', value: result.bmr, sub: 'kcal/day' },
                                        { label: 'Weight loss', value: result.weightLoss, sub: '~0.5 kg/wk' },
                                        { label: 'Weight gain', value: result.weightGain, sub: '~0.5 kg/wk' },
                                    ].map((item, i) => (
                                        <div
                                            key={item.label}
                                            className="col gap-1 bmr-result-cell"
                                            data-last={i === 2 ? 'true' : undefined}
                                            style={{
                                                padding: '14px 16px',
                                                borderRight: i < 2 ? '1px solid var(--rule)' : 'none',
                                            }}
                                        >
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 10,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    color: 'var(--ink-3)',
                                                }}
                                            >
                                                {item.label}
                                            </span>
                                            <span
                                                className="num display"
                                                style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}
                                            >
                                                {item.value.toLocaleString()}
                                            </span>
                                            <span
                                                className="mono"
                                                style={{ fontSize: 10, color: 'var(--ink-4)' }}
                                            >
                                                {item.sub}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Enter your inputs. Maintenance calories appear here, with deficit/surplus targets in a hairline panel below.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── About ─────────────────────────── */}
                <section className="card col gap-4" style={{ padding: 32 }} aria-labelledby="about-heading">
                    <h2
                        id="about-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        About this calculator
                    </h2>
                    <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0, lineHeight: 1.7 }}>
                        Basal Metabolic Rate (BMR) is the energy your body burns at complete rest — breathing, circulation, cell production. The Mifflin-St Jeor equation (1990) is now the clinically preferred formula because it tracks measured resting metabolic rate roughly 5% closer than the older Harris-Benedict revision.
                    </p>
                    <div className="card-quiet" style={{ padding: 16 }}>
                        <ul
                            className="mono"
                            style={{
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                fontSize: 13,
                                color: 'var(--ink-2)',
                            }}
                        >
                            <li>Men: BMR = (10 × kg) + (6.25 × cm) − (5 × age) + 5</li>
                            <li>Women: BMR = (10 × kg) + (6.25 × cm) − (5 × age) − 161</li>
                            <li>Maintenance = BMR × activity factor (1.2 sedentary → 1.9 extra active).</li>
                        </ul>
                    </div>
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
                            { name: 'BMI calculator', href: '/tools/bmi-calculator', desc: 'Body Mass Index from weight and height.' },
                            { name: 'Body fat calculator', href: '/tools/body-fat-calculator', desc: 'U.S. Navy method estimate.' },
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

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> Estimates only. Individual calorie needs vary with body composition, medications, and health conditions. Consult a dietitian for personalized advice.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 880px) {
                    .bmr-grid {
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
