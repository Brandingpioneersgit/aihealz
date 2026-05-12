'use client';

import { useEffect, useState } from 'react';

const STAGES = [
    'Reading your question',
    'Cross-checking 70k+ conditions',
    'Drafting plain-English answer',
    'Reviewing dosage safety',
    'Polishing the response',
];

/**
 * Build context-aware follow-up suggestions from the user's last message.
 * No AI call — just keyword routing. Three chips max so the dock stays light.
 */
function buildSuggestions(lastUserMessage: string): string[] {
    const m = (lastUserMessage || '').toLowerCase();
    const has = (...needles: string[]) => needles.some(n => m.includes(n));

    if (has('headache', 'migraine', 'head pain'))
        return [
            'How long has it been going on?',
            'On a scale of 1-10, how bad?',
            'Any aura, vision changes, or nausea?',
        ];
    if (has('fever', 'temperature'))
        return [
            'What temperature are you at?',
            'How long has the fever lasted?',
            'Any cough, rash, or chills?',
        ];
    if (has('cough', 'cold', 'flu', 'sore throat'))
        return [
            'Dry cough or with phlegm?',
            'How many days?',
            'Any fever or shortness of breath?',
        ];
    if (has('stomach', 'nausea', 'vomit', 'diarrhea', 'gut'))
        return [
            'How many episodes today?',
            'Any blood in stool / vomit?',
            'When did you last eat?',
        ];
    if (has('rash', 'skin', 'itch', 'allergy'))
        return [
            'Where on the body?',
            'Started after any new food, soap, or med?',
            'Any swelling or breathing trouble?',
        ];
    if (has('chest', 'heart', 'palpit', 'pressure'))
        return [
            'Sharp or pressure-like?',
            'Spreading to arm, jaw, or back?',
            'How old are you?',
        ];
    if (has('sleep', 'insomnia', 'tired', 'fatigue'))
        return [
            'Trouble falling asleep, or staying asleep?',
            'Any caffeine, alcohol, screen time before bed?',
            'How many hours on average?',
        ];
    if (has('lab', 'tsh', 'cholesterol', 'glucose', 'creatinine', 'hemoglobin', 'a1c'))
        return [
            'Share the exact value + the reference range',
            'Are you on any medication?',
            'Any symptoms alongside the result?',
        ];
    if (has('diabet', 'sugar'))
        return [
            'Type 1 or Type 2?',
            'On insulin or oral meds?',
            'Last A1c or fasting glucose?',
        ];
    if (has('pregnan'))
        return [
            'Which trimester?',
            'Any complications so far?',
            'Are you on prenatal vitamins?',
        ];
    if (has('child', 'baby', 'kid', 'toddler', 'infant'))
        return [
            'How old?',
            'Any fever or off-feeding?',
            'How long has it been?',
        ];
    return [
        'How long has it been going on?',
        'Are you on any medication?',
        'Has it changed today vs yesterday?',
    ];
}

export default function ThinkingDock({
    lastUserMessage,
    onAddDetail,
    streamPreview,
}: {
    lastUserMessage: string;
    onAddDetail: (text: string) => void;
    streamPreview?: string;
}) {
    const [stageIdx, setStageIdx] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setStageIdx(i => (i + 1) % STAGES.length), 2200);
        return () => clearInterval(id);
    }, []);

    const suggestions = buildSuggestions(lastUserMessage);
    const showStream = !!(streamPreview && streamPreview.trim().length);

    return (
        <div className="row ai-start gap-3">
            <div className="spec-icon" style={{ background: 'var(--cobalt)', flexShrink: 0 }}>
                AI
            </div>
            <div className="col gap-3" style={{ flex: 1, maxWidth: 680, minWidth: 0 }}>
                <div
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--cobalt)',
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                    }}
                >
                    Healz AI
                </div>

                {/* If streaming has started, show the partial reply; otherwise show
                    a cycling status. Either way the user has something to read. */}
                {showStream ? (
                    <div
                        style={{
                            fontSize: 14.5,
                            lineHeight: 1.55,
                            color: 'var(--ink-2)',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {streamPreview}
                        <span
                            aria-hidden="true"
                            style={{
                                display: 'inline-block',
                                width: 7,
                                height: 14,
                                marginLeft: 2,
                                background: 'var(--cobalt)',
                                verticalAlign: 'text-bottom',
                                animation: 'pulse-subtle 1.2s ease-in-out infinite',
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className="row ai-center gap-2"
                        style={{ fontSize: 14, color: 'var(--ink-3)' }}
                    >
                        <span
                            className="dot"
                            style={{
                                background: 'var(--cobalt)',
                                animation: 'pulse-subtle 1.2s ease-in-out infinite',
                            }}
                        />
                        <span style={{ minWidth: 0 }}>{STAGES[stageIdx]}…</span>
                    </div>
                )}

                {/* Engagement chips — answer 'while you wait' */}
                <div
                    className="card"
                    style={{
                        padding: 14,
                        background: 'var(--bg-2)',
                        borderColor: 'var(--rule)',
                    }}
                >
                    <div
                        className="mono"
                        style={{
                            fontSize: 10,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '.10em',
                            marginBottom: 8,
                        }}
                    >
                        While I work — sharing more helps
                    </div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                        {suggestions.map(s => (
                            <button
                                key={s}
                                type="button"
                                className="pill"
                                onClick={() => onAddDetail(s)}
                                style={{
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    textTransform: 'none',
                                    background: 'var(--paper)',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
