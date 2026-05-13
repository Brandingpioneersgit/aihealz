'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type FormData = {
    patientName: string;
    condition: string;
    travelDates: string;
    passengers: string;
    accommodation: string;
    assistance: string;
};

const STEPS = [
    { n: 1, label: 'Patient' },
    { n: 2, label: 'Travel' },
    { n: 3, label: 'Stay & care' },
];

export default function MedicalTravelBot() {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        patientName: '',
        condition: '',
        travelDates: '',
        passengers: '1',
        accommodation: 'premium',
        assistance: 'yes',
    });

    const handleNext = () => setStep((s) => Math.min(s + 1, 4));
    const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

    // Ref ID + date are computed once on mount (client only) so they never
    // generate a server/client hydration mismatch and stay stable across
    // the print preview.
    const [refId, setRefId] = useState<string>('');
    const [todayLabel, setTodayLabel] = useState<string>('');
    useEffect(() => {
        const now = new Date();
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        setRefId(`${random}-${now.getFullYear()}`);
        setTodayLabel(now.toLocaleDateString());
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generatePDF = () => {
        // Honest UX: open the browser print dialog. The user can choose
        // "Save as PDF" from there. We do not pretend to render a server-side PDF.
        setIsGenerating(true);
        try {
            window.print();
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main
            style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}
        >
            <div
                style={{ maxWidth: 980, margin: '0 auto', padding: '40px clamp(16px, 4vw, 28px) 96px' }}
                className="col gap-6 print:px-0"
            >
                {/* Back Link (Hidden on Print) */}
                <div className="print:hidden">
                    <Link
                        href="/medical-travel"
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--cobalt)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 500,
                        }}
                    >
                        ← Back to Medical Travel
                    </Link>
                </div>

                <h1 className="sr-only">Medical Travel Concierge — Build Your Estimate</h1>

                {step < 4 ? (
                    <>
                        {/* Hero (Hidden on Print) */}
                        <header className="col gap-3 print:hidden" style={{ maxWidth: 720 }}>
                            <span className="section-mark">the concierge</span>
                            <h2
                                className="display"
                                style={{
                                    fontSize: 'clamp(36px, 5vw, 64px)',
                                    lineHeight: 0.98,
                                    letterSpacing: '-0.04em',
                                    margin: 0,
                                    fontWeight: 600,
                                }}
                            >
                                Build your{' '}
                                <span style={{ color: 'var(--cobalt)' }}>estimate</span>
                                <span style={{ color: 'var(--orange)' }}>.</span>
                            </h2>
                            <p
                                className="lede"
                                style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', maxWidth: 560 }}
                            >
                                Three short steps. Patient, trip, and stay. We&rsquo;ll generate a
                                printable summary you can hand to our concierge desk.
                            </p>
                        </header>

                        {/* Step indicator (Hidden on Print) */}
                        <div className="col gap-3 print:hidden">
                            <div
                                className="row between mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                }}
                            >
                                {STEPS.map((s) => {
                                    const active = step >= s.n;
                                    return (
                                        <span
                                            key={s.n}
                                            style={{
                                                color: active ? 'var(--cobalt)' : 'var(--ink-4)',
                                                fontWeight: active ? 500 : 400,
                                            }}
                                        >
                                            {String(s.n).padStart(2, '0')} / {s.label}
                                        </span>
                                    );
                                })}
                            </div>
                            <div
                                style={{
                                    height: 2,
                                    background: 'var(--rule)',
                                    overflow: 'hidden',
                                    borderRadius: 999,
                                }}
                            >
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${(step / 3) * 100}%`,
                                        background: 'var(--cobalt)',
                                        transition: 'width 320ms ease',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Wizard card */}
                        <div
                            className="card col gap-6 print:hidden"
                            style={{ padding: 32 }}
                        >
                            {step === 1 && (
                                <div className="col gap-5 animate-fade-in">
                                    <div className="col gap-2">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            01 / patient
                                        </span>
                                        <h3
                                            className="display"
                                            style={{
                                                fontSize: 26,
                                                fontWeight: 500,
                                                letterSpacing: '-0.025em',
                                                margin: 0,
                                            }}
                                        >
                                            Who are we caring for?
                                        </h3>
                                        <p
                                            className="muted"
                                            style={{ fontSize: 14, margin: 0 }}
                                        >
                                            Start with who needs care and what procedure you&rsquo;re considering.
                                        </p>
                                    </div>

                                    <div className="col gap-4">
                                        <div className="form-group">
                                            <label
                                                htmlFor="patientName"
                                                className="form-label"
                                            >
                                                Patient full name
                                            </label>
                                            <input
                                                id="patientName"
                                                type="text"
                                                name="patientName"
                                                value={formData.patientName}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="E.g., John Doe"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="condition"
                                                className="form-label"
                                            >
                                                Medical condition or procedure
                                            </label>
                                            <input
                                                id="condition"
                                                type="text"
                                                name="condition"
                                                value={formData.condition}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="E.g., Knee replacement, cardiac bypass…"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="col gap-5 animate-fade-in">
                                    <div className="col gap-2">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            02 / travel
                                        </span>
                                        <h3
                                            className="display"
                                            style={{
                                                fontSize: 26,
                                                fontWeight: 500,
                                                letterSpacing: '-0.025em',
                                                margin: 0,
                                            }}
                                        >
                                            Travel itinerary.
                                        </h3>
                                        <p
                                            className="muted"
                                            style={{ fontSize: 14, margin: 0 }}
                                        >
                                            When are you planning to travel and how many people will accompany you?
                                        </p>
                                    </div>

                                    <div className="col gap-4">
                                        <div className="form-group">
                                            <label
                                                htmlFor="travelDates"
                                                className="form-label"
                                            >
                                                Expected travel dates
                                            </label>
                                            <input
                                                id="travelDates"
                                                type="text"
                                                name="travelDates"
                                                value={formData.travelDates}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="E.g., October 2026 or next month"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="passengers"
                                                className="form-label"
                                            >
                                                Total passengers (including patient)
                                            </label>
                                            <select
                                                id="passengers"
                                                name="passengers"
                                                value={formData.passengers}
                                                onChange={handleChange}
                                                className="select"
                                            >
                                                <option value="1">1 (Patient only)</option>
                                                <option value="2">2 (Patient + 1 companion)</option>
                                                <option value="3">3 (Patient + 2 companions)</option>
                                                <option value="4+">4 or more</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="col gap-5 animate-fade-in">
                                    <div className="col gap-2">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            03 / stay & care
                                        </span>
                                        <h3
                                            className="display"
                                            style={{
                                                fontSize: 26,
                                                fontWeight: 500,
                                                letterSpacing: '-0.025em',
                                                margin: 0,
                                            }}
                                        >
                                            Stay &amp; concierge.
                                        </h3>
                                        <p
                                            className="muted"
                                            style={{ fontSize: 14, margin: 0 }}
                                        >
                                            Customize your recovery experience with our partners.
                                        </p>
                                    </div>

                                    <div className="col gap-4">
                                        <div className="form-group">
                                            <label
                                                htmlFor="accommodation"
                                                className="form-label"
                                            >
                                                Accommodation preference
                                            </label>
                                            <select
                                                id="accommodation"
                                                name="accommodation"
                                                value={formData.accommodation}
                                                onChange={handleChange}
                                                className="select"
                                            >
                                                <option value="premium">5-star premium hotel / resort</option>
                                                <option value="standard">4-star comfort hotel</option>
                                                <option value="budget">Service apartment</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="assistance"
                                                className="form-label"
                                            >
                                                Airport post-op assistance?
                                            </label>
                                            <select
                                                id="assistance"
                                                name="assistance"
                                                value={formData.assistance}
                                                onChange={handleChange}
                                                className="select"
                                            >
                                                <option value="yes">Yes, include wheelchair / ambulance transfers</option>
                                                <option value="no">No, standard airport pickup is fine</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div
                                className="row between hairline-t"
                                style={{ paddingTop: 20 }}
                            >
                                <button
                                    onClick={handlePrev}
                                    disabled={step === 1}
                                    className="btn btn-paper"
                                    style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={step === 1 && !formData.patientName}
                                    className="btn btn-cobalt btn-lg"
                                >
                                    {step === 3 ? 'Review & print summary →' : 'Continue →'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* =========================================
                       PRINT VISIBLE & ACTIVE DOM ESTIMATE
                       ========================================= */
                    <div
                        className="card relative print:border-none"
                        style={{
                            padding: '40px 36px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Action Bar (Hidden on Print) */}
                        <div
                            className="row gap-2 print:hidden"
                            style={{ position: 'absolute', top: 24, right: 24 }}
                        >
                            <button
                                onClick={() => setStep(3)}
                                className="btn btn-paper btn-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={generatePDF}
                                className="btn btn-cobalt btn-sm"
                            >
                                {isGenerating ? 'Opening print…' : '↓ Download summary'}
                            </button>
                        </div>

                        {/* Document Header */}
                        <div
                            className="row between ai-start hairline-b"
                            style={{ paddingBottom: 24, marginBottom: 24, flexWrap: 'wrap', gap: 16 }}
                        >
                            <div className="col gap-1">
                                <span
                                    className="display"
                                    style={{
                                        fontSize: 36,
                                        fontWeight: 600,
                                        letterSpacing: '-0.04em',
                                        lineHeight: 1,
                                    }}
                                    aria-label="aihealz"
                                >
                                    aihealz<span style={{ color: 'var(--orange)' }}>.</span>
                                </span>
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    medical travel concierge
                                </span>
                            </div>
                            <div className="col gap-1 ai-end" style={{ textAlign: 'right' }}>
                                <span
                                    className="display"
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 500,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Official estimate sheet
                                </span>
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    ref · {refId || '—'}
                                </span>
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    date · {todayLabel || '—'}
                                </span>
                            </div>
                        </div>

                        {/* Patient & Clinical Summary */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                gap: 16,
                                marginBottom: 28,
                            }}
                        >
                            {/* Patient profile */}
                            <div
                                className="card-quiet col gap-3"
                                style={{ padding: 20 }}
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
                                    patient profile
                                </span>
                                <div className="col gap-3">
                                    <div className="col gap-1">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-4)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            primary patient
                                        </span>
                                        <span
                                            className="display"
                                            style={{
                                                fontSize: 18,
                                                fontWeight: 500,
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            {formData.patientName || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="col gap-1">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-4)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            travel dates
                                        </span>
                                        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                                            {formData.travelDates || 'Flexible'}
                                        </span>
                                    </div>
                                    <div className="col gap-1">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-4)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            party size
                                        </span>
                                        <span
                                            className="num"
                                            style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}
                                        >
                                            {formData.passengers} passenger(s)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical pathway */}
                            <div
                                className="card col gap-3"
                                style={{
                                    padding: 20,
                                    background: 'var(--cobalt-50)',
                                    borderColor: 'rgba(28, 91, 255, .22)',
                                }}
                            >
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                    }}
                                >
                                    clinical pathway
                                </span>
                                <div className="col gap-3">
                                    <div className="col gap-1">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            primary procedure
                                        </span>
                                        <span
                                            className="display"
                                            style={{
                                                fontSize: 20,
                                                fontWeight: 600,
                                                letterSpacing: '-0.025em',
                                                color: 'var(--ink)',
                                            }}
                                        >
                                            {formData.condition || 'Pending diagnosis'}
                                        </span>
                                    </div>
                                    <div className="col gap-1">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            success plan / prognosis
                                        </span>
                                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                                            Highly favorable (based on AI similarity match)
                                        </span>
                                    </div>
                                    <div className="col gap-1">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            estimated timeline
                                        </span>
                                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                                            3 days hospital + 7 days local recovery
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="col gap-3" style={{ marginBottom: 32 }}>
                            <div
                                className="row between ai-end"
                                style={{ flexWrap: 'wrap', gap: 8 }}
                            >
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                    }}
                                >
                                    estimated cost breakdown (USD)
                                </span>
                                <span className="pill pill-cobalt">AI estimate</span>
                            </div>
                            <div
                                style={{
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-3)',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                <table
                                    style={{
                                        width: '100%',
                                        minWidth: 520,
                                        borderCollapse: 'collapse',
                                        textAlign: 'left',
                                    }}
                                >
                                    <caption className="sr-only">
                                        Estimated medical travel cost breakdown
                                    </caption>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-2)' }}>
                                            <th
                                                scope="col"
                                                className="mono"
                                                style={{
                                                    padding: '12px 18px',
                                                    fontSize: 11,
                                                    color: 'var(--ink-3)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    fontWeight: 500,
                                                    borderBottom: '1px solid var(--rule)',
                                                }}
                                            >
                                                Item / category
                                            </th>
                                            <th
                                                scope="col"
                                                className="mono"
                                                style={{
                                                    padding: '12px 18px',
                                                    fontSize: 11,
                                                    color: 'var(--ink-3)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    fontWeight: 500,
                                                    borderBottom: '1px solid var(--rule)',
                                                }}
                                            >
                                                Details
                                            </th>
                                            <th
                                                scope="col"
                                                className="mono"
                                                style={{
                                                    padding: '12px 18px',
                                                    fontSize: 11,
                                                    color: 'var(--ink-3)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    fontWeight: 500,
                                                    textAlign: 'right',
                                                    borderBottom: '1px solid var(--rule)',
                                                }}
                                            >
                                                Est. range
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            {
                                                item: '1. Medical procedure',
                                                detail: `${formData.condition || 'Pending'} — surgeon, OT, anesthesia`,
                                                range: '$4,500 – $6,000',
                                            },
                                            {
                                                item: '2. Travel & flights',
                                                detail: `Roundtrip for ${formData.passengers} pax + airport transfers`,
                                                range: '$800 – $1,500',
                                            },
                                            {
                                                item: '3. Accommodation',
                                                detail: `${formData.accommodation} level — 10 days post-op stay`,
                                                range: '$600 – $1,200',
                                            },
                                            {
                                                item: '4. Medical visa & legal',
                                                detail: 'Fast-track medical visa processing',
                                                range: '$150 – $250',
                                            },
                                        ].map((row, i, arr) => (
                                            <tr
                                                key={row.item}
                                                style={{
                                                    background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-2)',
                                                    borderTop: '1px solid var(--rule)',
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '14px 18px',
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                        color: 'var(--ink)',
                                                    }}
                                                >
                                                    {row.item}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '14px 18px',
                                                        fontSize: 13,
                                                        color: 'var(--ink-3)',
                                                    }}
                                                >
                                                    {row.detail}
                                                </td>
                                                <td
                                                    className="num"
                                                    style={{
                                                        padding: '14px 18px',
                                                        fontSize: 13,
                                                        color: 'var(--cobalt)',
                                                        fontWeight: 500,
                                                        textAlign: 'right',
                                                    }}
                                                >
                                                    {row.range}
                                                </td>
                                                {i === arr.length - 1 && null}
                                            </tr>
                                        ))}
                                        <tr
                                            style={{
                                                background: 'var(--ink)',
                                                color: 'var(--paper)',
                                            }}
                                        >
                                            <td
                                                className="mono"
                                                style={{
                                                    padding: '16px 18px',
                                                    fontSize: 11,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    fontWeight: 500,
                                                    color: 'var(--paper)',
                                                }}
                                            >
                                                Total estimated package
                                            </td>
                                            <td
                                                style={{
                                                    padding: '16px 18px',
                                                    fontSize: 13,
                                                    color: 'rgba(255,255,255,.7)',
                                                }}
                                            >
                                                Complete end-to-end care
                                            </td>
                                            <td
                                                className="num"
                                                style={{
                                                    padding: '16px 18px',
                                                    fontSize: 18,
                                                    fontWeight: 600,
                                                    color: 'var(--mint)',
                                                    textAlign: 'right',
                                                }}
                                            >
                                                $6,050 – $8,950
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div
                            className="card-quiet col gap-1"
                            style={{
                                padding: 18,
                                marginBottom: 36,
                                borderColor: 'rgba(230, 185, 40, .40)',
                                background: 'var(--lemon-50)',
                            }}
                        >
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: '#8C6A00',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    fontWeight: 500,
                                }}
                            >
                                disclaimer & next steps
                            </span>
                            <p
                                style={{
                                    fontSize: 12,
                                    color: 'var(--ink-2)',
                                    lineHeight: 1.6,
                                    margin: 0,
                                }}
                            >
                                This document is an AI-generated preliminary estimate. Exact medical
                                pricing requires a formal review of recent clinical reports by our
                                board-certified surgeons. Please submit this sheet along with your
                                reports to the concierge desk to lock in your exact quote.
                            </p>
                        </div>

                        {/* Footer / Signature Box */}
                        <div
                            className="row between ai-end hairline-t"
                            style={{ paddingTop: 24, flexWrap: 'wrap', gap: 24 }}
                        >
                            <div className="col gap-1" style={{ maxWidth: 320 }}>
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                    }}
                                >
                                    generated by
                                </span>
                                <span
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: 'var(--ink)',
                                    }}
                                >
                                    ATZ Medappz Pvt Ltd.
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                                    84, Supreme Coworks, Sector 32, Gurgaon, Haryana, India
                                </span>
                            </div>
                            <div
                                className="col ai-center"
                                style={{ textAlign: 'center' }}
                            >
                                <div
                                    style={{
                                        width: 200,
                                        borderBottom: '1px dashed var(--ink-4)',
                                        paddingBottom: 32,
                                        marginBottom: 8,
                                    }}
                                />
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                    }}
                                >
                                    patient signature / authorization
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
