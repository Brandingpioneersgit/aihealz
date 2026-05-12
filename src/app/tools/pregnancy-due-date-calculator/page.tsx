'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PregnancyDueDateCalculatorPage() {
    const [lmp, setLmp] = useState('');
    const [result, setResult] = useState<{ dueDate: Date; weeks: number; trimester: string; daysLeft: number } | null>(null);

    function calculate() {
        if (lmp) {
            const lmpDate = new Date(lmp);
            const dueDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
            const now = new Date();
            const weeks = Math.floor((now.getTime() - lmpDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            const trimester = weeks <= 12 ? 'First' : weeks <= 27 ? 'Second' : 'Third';
            const daysLeft = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
            setResult({ dueDate, weeks, trimester, daysLeft });
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
                    <span style={{ color: 'var(--ink)' }}>Pregnancy Due Date</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / pregnancy due date</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>Due date</span> calculator
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Naegele’s rule from the first day of your last menstrual period. Estimated date of delivery, current week, trimester.
                    </p>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 16,
                    }}
                    className="pg-grid"
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
                                Calculate due date
                            </h2>
                        </div>

                        <Field label="Last menstrual period (LMP)">
                            <input
                                type="date"
                                value={lmp}
                                onChange={e => setLmp(e.target.value)}
                                className="input"
                            />
                        </Field>

                        <button type="submit" className="btn btn-cobalt btn-lg">
                            Calculate due date →
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
                                        Estimated due date
                                    </span>
                                    <div
                                        className="bignum"
                                        style={{
                                            fontSize: 'clamp(36px, 5vw, 56px)',
                                            color: 'var(--cobalt)',
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {result.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <span className="num muted" style={{ fontSize: 13 }}>
                                        {result.daysLeft} days remaining
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
                                        { label: 'Current week', value: `Week ${result.weeks}` },
                                        { label: 'Trimester', value: result.trimester },
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
                                                className="display"
                                                style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}
                                            >
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div className="col gap-2">
                                    <div className="row between">
                                        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                                            WEEK 0
                                        </span>
                                        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                                            WEEK 40
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            height: 8,
                                            background: 'var(--bg-2)',
                                            border: '1px solid var(--rule)',
                                            borderRadius: 999,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${Math.min(100, (result.weeks / 40) * 100)}%`,
                                                height: '100%',
                                                background: 'var(--cobalt)',
                                            }}
                                        />
                                    </div>
                                </div>

                                <Link href="/doctors/specialty/gynecologist" className="btn btn-cobalt">
                                    Find an OB-GYN →
                                </Link>
                            </>
                        ) : (
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Enter the first day of your last menstrual period. Due date and progress appear here.
                            </p>
                        )}
                    </div>
                </div>

                {/* Pregnancy timeline */}
                <section className="col gap-4" aria-labelledby="timeline-heading">
                    <h2
                        id="timeline-heading"
                        className="display"
                        style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                    >
                        Pregnancy timeline
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
                            { trimester: 'First trimester', weeks: 'Weeks 1 – 12', highlights: 'Morning sickness, fatigue, first ultrasound. Major organs form.' },
                            { trimester: 'Second trimester', weeks: 'Weeks 13 – 27', highlights: 'Quickening (fetal movement), gender reveal possible, energy returns.' },
                            { trimester: 'Third trimester', weeks: 'Weeks 28 – 40', highlights: 'Rapid growth, nesting instinct, prenatal classes, delivery prep.' },
                        ].map((item, i, arr) => (
                            <div
                                key={item.trimester}
                                className="col gap-1"
                                style={{
                                    padding: '18px 22px',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                    borderLeft: '3px solid var(--cobalt)',
                                }}
                            >
                                <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 8 }}>
                                    <span
                                        className="display"
                                        style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}
                                    >
                                        {item.trimester}
                                    </span>
                                    <span className="num" style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                                        {item.weeks}
                                    </span>
                                </div>
                                <span className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>{item.highlights}</span>
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
                        How due dates are calculated
                    </h2>
                    <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0, lineHeight: 1.7 }}>
                        Naegele’s rule: add 280 days (40 weeks) to the first day of your last menstrual period. This is the convention used worldwide as a baseline.
                    </p>
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
                            'Only ~5% of babies arrive on the exact due date.',
                            'Most arrive within two weeks before or after.',
                            'Ultrasound dating in the first trimester is more accurate; clinicians often adjust the estimate accordingly.',
                            'First-time mothers tend to deliver slightly later than the LMP-based estimate.',
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
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> Estimate using LMP. Your provider may revise based on early ultrasound. Always rely on professional dating for prenatal care decisions.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 880px) {
                    .pg-grid {
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
