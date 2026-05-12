'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ChatGate, { detectChatGate } from '@/components/chat/ChatGate';

interface ConditionResult {
    name: string;
    likelihood: number;
    explanation: string;
    tests: string[];
    urgency: string;
    slug?: string;
    url?: string;
    otc_remedies?: string[];
    home_care?: string[];
}

interface AnalysisResponse {
    symptoms: string[];
    analysis: ConditionResult[];
    disclaimer: string;
    model: string;
}

interface SymptomSuggestion {
    name: string;
    category: string;
}

const TEST_SLUGS: Record<string, string> = {
    cbc: 'complete-blood-count',
    'complete blood count': 'complete-blood-count',
    'blood glucose': 'blood-glucose-fasting',
    hba1c: 'hba1c-glycated-hemoglobin',
    'lipid profile': 'lipid-profile',
    'thyroid profile': 'thyroid-profile',
    tsh: 'tsh',
    'liver function test': 'liver-function-test',
    'kidney function test': 'kidney-function-test',
    creatinine: 'creatinine',
    urinalysis: 'urinalysis',
    ecg: 'ecg-electrocardiogram',
    mri: 'mri',
    'ct scan': 'ct-scan',
    'x-ray': 'x-ray',
};

function getTestSlug(name: string): string | null {
    const n = name.toLowerCase().trim();
    if (TEST_SLUGS[n]) return TEST_SLUGS[n];
    for (const [key, slug] of Object.entries(TEST_SLUGS)) {
        if (n.includes(key)) return slug;
    }
    return null;
}

const URGENCY_PILL: Record<string, string> = {
    routine: 'pill pill-mint',
    moderate: 'pill pill-lemon',
    urgent: 'pill pill-orange',
    emergency: 'pill pill-orange',
};

const URGENCY_COLOR: Record<string, string> = {
    routine: 'var(--mint-2)',
    moderate: 'var(--lemon-2)',
    urgent: 'var(--orange)',
    emergency: 'var(--sev-critical)',
};

export default function SymptomCheckerV4() {
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState<SymptomSuggestion[]>([]);
    const [showSugg, setShowSugg] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.length < 1) {
            setSuggestions([]);
            setShowSugg(false);
            return;
        }
        try {
            const res = await fetch(
                `/api/symptoms/suggest?q=${encodeURIComponent(q)}`,
            );
            if (!res.ok) return setSuggestions([]);
            const data = await res.json();
            if (!Array.isArray(data)) return setSuggestions([]);
            setSuggestions(data.slice(0, 6));
            setShowSugg(data.length > 0);
        } catch {
            setSuggestions([]);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(input), 200);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [input, fetchSuggestions]);

    function addSymptom(name: string) {
        const t = name.trim();
        if (!t || symptoms.includes(t)) return;
        setSymptoms((prev) => [...prev, t]);
        setInput('');
        setShowSugg(false);
        inputRef.current?.focus();
    }

    function removeSymptom(i: number) {
        setSymptoms((prev) => prev.filter((_, idx) => idx !== i));
    }

    async function analyze() {
        if (symptoms.length === 0) {
            setError('Add at least one symptom to analyze.');
            return;
        }
        setError('');
        setAnalyzing(true);
        setResults(null);
        try {
            const res = await fetch('/api/symptoms/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symptoms,
                    age: age ? Number(age) : undefined,
                    gender: gender || undefined,
                }),
            });
            if (await detectChatGate(res)) { setAnalyzing(false); return; }
            if (!res.ok) throw new Error('Analyze failed');
            const data = await res.json();
            setResults(data);
        } catch {
            setError('Analysis failed. Please try again in a moment.');
        } finally {
            setAnalyzing(false);
        }
    }

    return (
        <ChatGate
            title="Sign in to use the symptom checker"
            subtitle="5 free AI analyses today — register once to continue."
        >
        <div className="col gap-5">
            <div className="card" style={{ padding: 24 }}>
                <div className="kicker" style={{ marginBottom: 14 }}>
                    <span className="dot" /> describe your symptoms
                </div>

                <div className="col gap-2" style={{ marginBottom: 14 }}>
                    <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                        {symptoms.map((s, i) => (
                            <span
                                key={s + i}
                                className="pill pill-cobalt"
                                style={{
                                    cursor: 'pointer',
                                    background: 'var(--cobalt-50)',
                                    borderColor: 'rgba(28,91,255,.22)',
                                    color: 'var(--cobalt)',
                                }}
                                onClick={() => removeSymptom(i)}
                            >
                                {s} ×
                            </span>
                        ))}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            ref={inputRef}
                            className="v4-input"
                            placeholder="e.g. headache, low-grade fever, sore throat…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (input.trim()) addSymptom(input);
                                }
                            }}
                            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                        />
                        {showSugg && suggestions.length > 0 && (
                            <div
                                className="card"
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    right: 0,
                                    zIndex: 30,
                                    padding: 4,
                                    boxShadow: 'var(--shadow-2-v4)',
                                }}
                            >
                                {suggestions.map((s) => (
                                    <button
                                        key={s.name}
                                        type="button"
                                        onClick={() => addSymptom(s.name)}
                                        className="row between"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            borderRadius: 'var(--r-2)',
                                        }}
                                    >
                                        <span style={{ fontSize: 14 }}>{s.name}</span>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '.08em',
                                            }}
                                        >
                                            {s.category}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                    <input
                        className="v4-input"
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        style={{ flex: '1 1 120px' }}
                    />
                    <select
                        className="v4-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={{ flex: '1 1 160px' }}
                    >
                        <option value="">Sex (optional)</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {error && (
                    <div
                        className="card-quiet"
                        style={{
                            padding: 12,
                            marginTop: 14,
                            color: 'var(--orange-2)',
                            background: 'var(--orange-50)',
                            borderColor: 'rgba(255,90,46,.28)',
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}

                <div className="hairline" style={{ margin: '20px -24px' }} />

                <div
                    className="row between ai-center"
                    style={{ flexWrap: 'wrap', gap: 8 }}
                >
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                        }}
                    >
                        ◆ informational, not diagnostic
                    </span>
                    <button
                        onClick={analyze}
                        disabled={analyzing}
                        className="v4-btn v4-btn-cobalt v4-btn-lg"
                        style={{ opacity: analyzing ? 0.6 : 1 }}
                    >
                        {analyzing ? 'Analyzing…' : 'Analyze symptoms →'}
                    </button>
                </div>
            </div>

            {results && (
                <div className="col gap-4">
                    <div
                        className="row between ai-end"
                        style={{ flexWrap: 'wrap', gap: 8 }}
                    >
                        <span className="section-mark">II / what it might be</span>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '.08em',
                            }}
                        >
                            {results.analysis.length} possible conditions
                        </span>
                    </div>
                    {results.analysis.map((cond, i) => (
                        <div
                            key={cond.name + i}
                            className="card"
                            style={{ padding: 22 }}
                        >
                            <div
                                className="row between ai-baseline"
                                style={{ flexWrap: 'wrap', gap: 8 }}
                            >
                                <div
                                    className="display"
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 600,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {cond.name}
                                </div>
                                <div className="row gap-2 ai-center">
                                    <span
                                        className={URGENCY_PILL[cond.urgency] || 'pill'}
                                    >
                                        {cond.urgency}
                                    </span>
                                    <span
                                        className="num"
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 500,
                                            color: URGENCY_COLOR[cond.urgency] || 'var(--cobalt)',
                                        }}
                                    >
                                        {cond.likelihood}%
                                    </span>
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 10,
                                            color: 'var(--ink-4)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '.08em',
                                        }}
                                    >
                                        likelihood
                                    </span>
                                </div>
                            </div>
                            <p
                                style={{
                                    fontSize: 15,
                                    color: 'var(--ink-2)',
                                    lineHeight: 1.6,
                                    marginTop: 10,
                                }}
                            >
                                {cond.explanation}
                            </p>
                            {cond.tests.length > 0 && (
                                <div className="col gap-2" style={{ marginTop: 14 }}>
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '.08em',
                                        }}
                                    >
                                        recommended tests
                                    </span>
                                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                        {cond.tests.map((t) => {
                                            const slug = getTestSlug(t);
                                            return slug ? (
                                                <Link
                                                    key={t}
                                                    href={`/tests/${slug}`}
                                                    className="pill pill-cobalt"
                                                >
                                                    {t} →
                                                </Link>
                                            ) : (
                                                <span key={t} className="pill">
                                                    {t}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div
                                className="row gap-2"
                                style={{ marginTop: 14, flexWrap: 'wrap' }}
                            >
                                {cond.url || cond.slug ? (
                                    <Link
                                        href={cond.url || `/conditions/${cond.slug}`}
                                        className="v4-btn v4-btn-paper v4-btn-sm"
                                    >
                                        Read condition page →
                                    </Link>
                                ) : null}
                                <Link
                                    href={`/doctors?condition=${encodeURIComponent(cond.name)}`}
                                    className="v4-btn v4-btn-cobalt v4-btn-sm"
                                >
                                    Find specialist →
                                </Link>
                            </div>
                        </div>
                    ))}
                    <div
                        className="muted"
                        style={{ fontSize: 12, paddingTop: 8 }}
                    >
                        {results.disclaimer}
                    </div>
                </div>
            )}
        </div>
        </ChatGate>
    );
}
