'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WaterIntakeCalculatorPage() {
    const [weight, setWeight] = useState('');
    const [activity, setActivity] = useState('Moderate');
    const [climate, setClimate] = useState('Moderate');
    const [result, setResult] = useState<{ ml: number; liters: number; glasses: number; bottles: number } | null>(null);

    function calculate() {
        const w = parseFloat(weight);
        if (w > 0) {
            const base = w * 35; // ml per kg baseline
            const activityMultiplier: Record<string, number> = {
                'Sedentary': 1,
                'Light': 1.1,
                'Moderate': 1.2,
                'Active': 1.35,
                'Very Active': 1.5
            };
            const climateMultiplier: Record<string, number> = {
                'Cool': 1,
                'Moderate': 1.1,
                'Hot & Humid': 1.3
            };
            const ml = Math.round(base * (activityMultiplier[activity] || 1.2) * (climateMultiplier[climate] || 1.1));
            setResult({
                ml,
                liters: ml / 1000,
                glasses: Math.round(ml / 250),
                bottles: Math.round(ml / 500),
            });
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
                    <span style={{ color: 'var(--ink)' }}>Water Intake</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / water intake</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>Daily water</span> intake
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Personal hydration target adjusted for body weight, activity level, and climate. Useful baseline — not a hard rule.
                    </p>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 16,
                    }}
                    className="wt-grid"
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
                                Calculate hydration target
                            </h2>
                        </div>

                        <Field label="Body weight (kg)">
                            <input
                                type="number"
                                inputMode="decimal"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                placeholder="e.g. 70"
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
                            <Field label="Activity level">
                                <select
                                    value={activity}
                                    onChange={e => setActivity(e.target.value)}
                                    className="select"
                                >
                                    <option value="Sedentary">Sedentary (desk job)</option>
                                    <option value="Light">Light (1–2/wk)</option>
                                    <option value="Moderate">Moderate (3–5/wk)</option>
                                    <option value="Active">Active (daily)</option>
                                    <option value="Very Active">Very active (athlete)</option>
                                </select>
                            </Field>
                            <Field label="Climate">
                                <select
                                    value={climate}
                                    onChange={e => setClimate(e.target.value)}
                                    className="select"
                                >
                                    <option value="Cool">Cool / cold</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Hot & Humid">Hot &amp; humid</option>
                                </select>
                            </Field>
                        </div>

                        <button type="submit" className="btn btn-cobalt btn-lg">
                            Calculate water intake →
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
                                        Daily water target
                                    </span>
                                    <div
                                        className="bignum"
                                        style={{
                                            fontSize: 'clamp(56px, 8vw, 96px)',
                                            color: 'var(--cobalt)',
                                        }}
                                    >
                                        {result.liters.toFixed(1)} L
                                    </div>
                                    <span className="num muted" style={{ fontSize: 13 }}>
                                        {result.ml.toLocaleString()} ml
                                    </span>
                                </div>

                                <div className="hairline" />

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 0,
                                        border: '1px solid var(--rule)',
                                        borderRadius: 'var(--r-2)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {[
                                        { label: '250 ml glasses', value: result.glasses },
                                        { label: '500 ml bottles', value: result.bottles },
                                    ].map((item, i) => (
                                        <div
                                            key={item.label}
                                            className="col gap-1"
                                            style={{
                                                padding: '14px 16px',
                                                borderRight: i === 0 ? '1px solid var(--rule)' : 'none',
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
                                                style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}
                                            >
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>
                                    Spread intake through the day. A glass on waking, before meals, and after exercise. Increase further if you drink coffee or alcohol.
                                </p>
                            </>
                        ) : (
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Enter your inputs. Daily target appears here in liters, with glass and bottle conversions.
                            </p>
                        )}
                    </div>
                </div>

                {/* Tips */}
                <section className="col gap-4" aria-labelledby="tips-heading">
                    <h2
                        id="tips-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        Hydration tips
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
                            { tip: 'Start the day with water', desc: 'A full glass first thing on waking — before coffee.' },
                            { tip: 'Drink before meals', desc: 'A glass 30 minutes before eating aids digestion and satiety.' },
                            { tip: 'During exercise', desc: 'Sip every 15–20 minutes; more in the heat.' },
                            { tip: 'Read your urine', desc: 'Pale yellow = good. Dark yellow = drink more.' },
                            { tip: 'Set reminders', desc: 'Use an app or alarm if you forget — most adults underdrink.' },
                            { tip: 'Eat water-rich foods', desc: 'Fruits and vegetables count toward total fluid.' },
                        ].map((item, i, arr) => {
                            const cols = 3;
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= arr.length - cols;
                            return (
                                <div
                                    key={item.tip}
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
                                        {item.tip}
                                    </div>
                                    <div className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>{item.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> General guidelines. People with kidney disease, heart failure, or on diuretics should follow their clinician’s fluid recommendations — overhydration carries its own risks.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 880px) {
                    .wt-grid {
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
