'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ChatGate, { detectChatGate } from '@/components/chat/ChatGate';

// Common test name to slug mapping
const TEST_SLUGS: Record<string, string> = {
    'cbc': 'complete-blood-count',
    'complete blood count': 'complete-blood-count',
    'blood glucose': 'blood-glucose-fasting',
    'fasting blood sugar': 'blood-glucose-fasting',
    'hba1c': 'hba1c-glycated-hemoglobin',
    'lipid profile': 'lipid-profile',
    'cholesterol': 'lipid-profile',
    'thyroid profile': 'thyroid-profile',
    'thyroid function': 'thyroid-profile',
    'tsh': 'tsh',
    'liver function test': 'liver-function-test',
    'lft': 'liver-function-test',
    'kidney function test': 'kidney-function-test',
    'kft': 'kidney-function-test',
    'creatinine': 'creatinine',
    'urine test': 'urinalysis',
    'urinalysis': 'urinalysis',
    'ecg': 'ecg-electrocardiogram',
    'ekg': 'ecg-electrocardiogram',
    'electrocardiogram': 'ecg-electrocardiogram',
    'x-ray': 'x-ray',
    'ct scan': 'ct-scan',
    'mri': 'mri',
    'ultrasound': 'ultrasound',
    'vitamin d': 'vitamin-d',
    'vitamin b12': 'vitamin-b12',
    'iron studies': 'iron-studies',
    'hemoglobin': 'hemoglobin',
    'blood pressure': 'blood-pressure-monitoring',
    'blood test': 'complete-blood-count',
    'uric acid': 'uric-acid',
    'bilirubin': 'bilirubin',
    'albumin': 'albumin',
    'blood culture': 'blood-culture',
    'stool test': 'stool-examination',
    'covid test': 'covid-19-rt-pcr',
};

// Convert test name to URL slug
function getTestSlug(testName: string): string | null {
    const normalized = testName.toLowerCase().trim();
    // Direct match
    if (TEST_SLUGS[normalized]) return TEST_SLUGS[normalized];
    // Partial match
    for (const [key, slug] of Object.entries(TEST_SLUGS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return slug;
        }
    }
    return null;
}

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

/* ─── Urgency → Bureau severity mapping ───────────────────────── */

type UrgencyVisual = {
    label: string;
    pillClass: string;
    pillStyle?: React.CSSProperties;
    barColor: string;
};

const CRITICAL_PILL_STYLE: React.CSSProperties = {
    background: 'rgba(182, 21, 21, .08)',
    color: 'var(--sev-critical)',
    borderColor: 'rgba(182, 21, 21, .25)',
};

function urgencyVisual(u: string): UrgencyVisual {
    switch (u) {
        case 'emergency':
            return {
                label: u,
                pillClass: 'pill',
                pillStyle: CRITICAL_PILL_STYLE,
                barColor: 'var(--sev-critical)',
            };
        case 'high':
            return { label: u, pillClass: 'pill pill-orange', barColor: 'var(--orange)' };
        case 'moderate':
            return { label: u, pillClass: 'pill pill-lemon', barColor: 'var(--lemon-2)' };
        default:
            return { label: u, pillClass: 'pill pill-mint', barColor: 'var(--mint-2)' };
    }
}

function likelihoodBarColor(pct: number): string {
    if (pct > 70) return 'var(--sev-critical)';
    if (pct > 40) return 'var(--lemon-2)';
    return 'var(--mint-2)';
}

export default function SymptomChecker() {
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<SymptomSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState('');
    const [activeIdx, setActiveIdx] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Autocomplete fetch — uses the dedicated symptoms endpoint
    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
        try {
            const res = await fetch(`/api/symptoms/suggest?q=${encodeURIComponent(q)}`);
            if (!res.ok) {
                setSuggestions([]);
                return;
            }
            const data = await res.json();
            // Validate response is an array
            if (!Array.isArray(data)) {
                setSuggestions([]);
                return;
            }
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
            setActiveIdx(-1);
        } catch {
            setSuggestions([]);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(inputValue), 200);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [inputValue, fetchSuggestions]);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const addSymptom = (text: string) => {
        const trimmed = text.trim();
        if (trimmed && !symptoms.includes(trimmed)) {
            setSymptoms(prev => [...prev, trimmed]);
        }
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeSymptom = (idx: number) => {
        setSymptoms(prev => prev.filter((_, i) => i !== idx));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIdx >= 0 && suggestions[activeIdx]) {
                addSymptom(suggestions[activeIdx].name);
            } else if (inputValue.trim()) {
                addSymptom(inputValue);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Backspace' && !inputValue && symptoms.length > 0) {
            removeSymptom(symptoms.length - 1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const analyze = async () => {
        if (symptoms.length === 0) return;
        setIsAnalyzing(true);
        setError('');
        setResults(null);

        // Client-side timeout (35 seconds to give server timeout a chance first)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        try {
            const res = await fetch('/api/symptoms/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms, age: age || undefined, gender: gender || undefined }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (await detectChatGate(res)) { setIsAnalyzing(false); return; }

            // Check response status BEFORE parsing to handle HTML error pages
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Analysis failed' }));
                throw new Error(errorData.error || 'Analysis failed');
            }
            const data = await res.json();
            // Validate response structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response from server');
            }
            setResults(data);
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    setError('Analysis timed out. Please try again with fewer symptoms or try later.');
                } else {
                    setError(err.message || 'Something went wrong. Please try again.');
                }
            } else {
                setError('Something went wrong. Please try again.');
            }
        }
        setIsAnalyzing(false);
    };

    const likelihoodBar = (pct: number) => (
        <div
            style={{
                height: 4,
                background: 'var(--bg-3)',
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: likelihoodBarColor(pct),
                    transition: 'width 700ms ease',
                }}
            />
        </div>
    );

    return (
        <ChatGate
            title="Sign in to use the symptom checker"
            subtitle="5 free AI analyses today — quick registration to get started."
        >
        <div className="col gap-6">
            {/* ── Symptom Input Area ─────────────────────── */}
            <fieldset className="card" style={{ padding: 32, border: '1px solid var(--rule)' }}>
                <legend className="sr-only">Symptom checker — Step 1 of 1</legend>
                <p className="kicker" aria-hidden="true" style={{ marginBottom: 8 }}>
                    <span className="dot" />Step 1 of 1
                </p>
                <h2 className="display" style={{ fontSize: 24, marginBottom: 6, color: 'var(--ink)' }}>
                    Describe your symptoms
                </h2>
                <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
                    Type a symptom and press Enter. Add as many as you&apos;re experiencing.
                </p>

                <div ref={wrapperRef} className="relative" style={{ marginBottom: 24 }}>
                    <div
                        className="row ai-center"
                        style={{
                            flexWrap: 'wrap',
                            gap: 8,
                            padding: 10,
                            background: 'var(--paper-2)',
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            minHeight: 56,
                        }}
                    >
                        {symptoms.map((s, i) => (
                            <span key={i} className="pill pill-cobalt" style={{ paddingRight: 6 }}>
                                {s}
                                <button
                                    onClick={() => removeSymptom(i)}
                                    aria-label={`Remove symptom: ${s}`}
                                    className="row ai-center center"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        marginLeft: 4,
                                        color: 'inherit',
                                        cursor: 'pointer',
                                        width: 14,
                                        height: 14,
                                    }}
                                >
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder={symptoms.length === 0 ? 'e.g. headache, nausea, chest pain...' : 'Add another symptom...'}
                            aria-label="Add a symptom"
                            style={{
                                flex: 1,
                                minWidth: 200,
                                padding: '6px 4px',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'var(--ink)',
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        />
                    </div>

                    {/* Autocomplete dropdown */}
                    {showSuggestions && (
                        <div
                            className="card-flat"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: 4,
                                overflow: 'hidden',
                                zIndex: 50,
                                maxHeight: 240,
                                overflowY: 'auto',
                                boxShadow: 'var(--shadow-2)',
                            }}
                        >
                            {suggestions.map((s, i) => (
                                <button
                                    key={`${s.name}-${i}`}
                                    onMouseEnter={() => setActiveIdx(i)}
                                    onClick={() => addSymptom(s.name)}
                                    className="row ai-center gap-3"
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '10px 14px',
                                        borderBottom: '1px solid var(--rule-2)',
                                        background: i === activeIdx ? 'var(--cobalt-50)' : 'transparent',
                                        border: 'none',
                                        borderBottomWidth: 1,
                                        borderBottomStyle: 'solid',
                                        borderBottomColor: 'var(--rule-2)',
                                        cursor: 'pointer',
                                        transition: 'background var(--transition-fast)',
                                    }}
                                >
                                    <span
                                        className="row ai-center center"
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 'var(--r-2)',
                                            background: 'var(--cobalt-50)',
                                            color: 'var(--cobalt)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </span>
                                    <span className="col" style={{ gap: 2 }}>
                                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{s.name}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.category}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Optional context */}
                <div className="row" style={{ flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                        <label htmlFor="symptom-age" className="kicker">Age range (optional)</label>
                        <select
                            id="symptom-age"
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            className="select"
                        >
                            <option value="">Select</option>
                            <option value="0-12">Child (0-12)</option>
                            <option value="13-17">Teen (13-17)</option>
                            <option value="18-30">Young Adult (18-30)</option>
                            <option value="31-50">Adult (31-50)</option>
                            <option value="51-65">Middle-aged (51-65)</option>
                            <option value="65+">Senior (65+)</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                        <label htmlFor="symptom-gender" className="kicker">Gender (optional)</label>
                        <select
                            id="symptom-gender"
                            value={gender}
                            onChange={e => setGender(e.target.value)}
                            className="select"
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Analyze Button */}
                <button
                    onClick={analyze}
                    disabled={symptoms.length === 0 || isAnalyzing}
                    className="btn btn-cobalt btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {isAnalyzing ? (
                        <>
                            <span
                                style={{
                                    width: 16,
                                    height: 16,
                                    border: '2px solid #fff',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    display: 'inline-block',
                                }}
                            />
                            Analyzing with AI...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Analyze symptoms ({symptoms.length} selected)
                        </>
                    )}
                </button>
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </fieldset>

            {/* ── Error ──────────────────────────────────── */}
            {error && (
                <div
                    className="card-flat"
                    style={{
                        background: 'var(--orange-50)',
                        borderColor: 'rgba(255, 90, 46, .28)',
                        padding: 20,
                        textAlign: 'center',
                    }}
                >
                    <p style={{ color: 'var(--orange-2)', fontWeight: 500, fontSize: 14, margin: 0 }}>{error}</p>
                </div>
            )}

            {/* ── Analysis Loading State ─────────────────── */}
            {isAnalyzing && (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                    <div
                        className="row ai-center center"
                        style={{
                            width: 56,
                            height: 56,
                            margin: '0 auto 24px',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--cobalt-50)',
                            color: 'var(--cobalt)',
                        }}
                    >
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animation: 'pulse 1.6s ease-in-out infinite' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <p className="kicker" style={{ marginBottom: 8 }}>AI engine</p>
                    <h3 className="display" style={{ fontSize: 22, color: 'var(--ink)', margin: '0 0 8px' }}>
                        Processing
                    </h3>
                    <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                        Cross-referencing symptoms against our medical database...
                    </p>
                    <div style={{ marginTop: 24, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
                        <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: '70%',
                                    background: 'var(--cobalt)',
                                    animation: 'pulse 1.6s ease-in-out infinite',
                                }}
                            />
                        </div>
                    </div>
                    <style jsx>{`
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: .55; }
                        }
                    `}</style>
                </div>
            )}

            {/* ── Results ────────────────────────────────── */}
            {results && (
                <div className="col gap-5">
                    {/* Disclaimer */}
                    <div
                        className="card-flat row ai-start gap-3"
                        style={{
                            background: 'var(--orange-50)',
                            borderColor: 'rgba(255, 90, 46, .28)',
                            padding: 18,
                        }}
                    >
                        <span
                            aria-hidden="true"
                            className="row ai-center center"
                            style={{
                                width: 24,
                                height: 24,
                                flexShrink: 0,
                                color: 'var(--orange-2)',
                                fontSize: 16,
                                fontFamily: 'var(--mono)',
                                fontWeight: 600,
                            }}
                        >
                            !
                        </span>
                        <div className="col gap-1">
                            <p className="kicker" style={{ color: 'var(--orange-2)', margin: 0 }}>
                                Medical disclaimer
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--orange-2)', lineHeight: 1.55, margin: 0 }}>
                                {results.disclaimer}
                            </p>
                        </div>
                    </div>

                    {/* Results Header */}
                    <div className="row between ai-center">
                        <div className="col gap-1">
                            <span className="kicker"><span className="dot" />Results</span>
                            <h2 className="display" style={{ fontSize: 28, color: 'var(--ink)', margin: 0 }}>
                                Possible conditions
                            </h2>
                        </div>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {results.analysis.length} matches
                        </span>
                    </div>

                    {/* Condition Cards */}
                    {results.analysis.map((cond, i) => {
                        const visual = urgencyVisual(cond.urgency);
                        return (
                            <article key={i} className="card" style={{ overflow: 'hidden' }}>
                                {/* Header */}
                                <div style={{ padding: 24 }}>
                                    <div className="row between ai-start gap-4" style={{ marginBottom: 14 }}>
                                        <div className="row ai-center gap-3">
                                            <span
                                                className="num row ai-center center"
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 'var(--r-2)',
                                                    background: 'var(--bg-2)',
                                                    color: 'var(--ink-3)',
                                                    fontSize: 16,
                                                    fontWeight: 500,
                                                    border: '1px solid var(--rule)',
                                                }}
                                            >
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div className="col gap-2">
                                                <h3 className="display" style={{ fontSize: 20, color: 'var(--ink)', margin: 0 }}>
                                                    {cond.name}
                                                </h3>
                                                <span
                                                    className={visual.pillClass}
                                                    style={visual.pillStyle}
                                                >
                                                    {visual.label} urgency
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col ai-end" style={{ flexShrink: 0 }}>
                                            <span className="bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>
                                                {cond.likelihood}%
                                            </span>
                                            <span className="kicker" style={{ marginTop: 2 }}>likelihood</span>
                                        </div>
                                    </div>

                                    {likelihoodBar(cond.likelihood)}

                                    <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 16, lineHeight: 1.6, marginBottom: 0 }}>
                                        {cond.explanation}
                                    </p>
                                </div>

                                {/* Tests */}
                                {cond.tests && cond.tests.length > 0 && (
                                    <div className="hairline-t" style={{ padding: '18px 24px' }}>
                                        <p className="kicker" style={{ marginBottom: 10 }}>
                                            Recommended tests
                                        </p>
                                        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                                            {cond.tests.map((test, ti) => {
                                                const testSlug = getTestSlug(test);
                                                if (testSlug) {
                                                    return (
                                                        <Link
                                                            key={ti}
                                                            href={`/tests/${testSlug}`}
                                                            className="pill pill-cobalt"
                                                            style={{ textTransform: 'none', cursor: 'pointer' }}
                                                        >
                                                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                            </svg>
                                                            {test}
                                                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: 0.6 }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </Link>
                                                    );
                                                }
                                                return (
                                                    <span key={ti} className="pill" style={{ textTransform: 'none' }}>
                                                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--cobalt)' }}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                                        </svg>
                                                        {test}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Home Care & OTC */}
                                {((cond.otc_remedies?.length ?? 0) > 0 || (cond.home_care?.length ?? 0) > 0) && (
                                    <div
                                        className="hairline-t"
                                        style={{
                                            padding: '20px 24px',
                                            background: 'var(--paper-2)',
                                        }}
                                    >
                                        <div
                                            className="grid"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                                gap: 24,
                                            }}
                                        >
                                            {/* OTC */}
                                            {cond.otc_remedies && cond.otc_remedies.length > 0 && (
                                                <div className="col gap-3">
                                                    <p className="kicker">
                                                        <span className="dot" />Safe OTC options
                                                    </p>
                                                    <ul className="clean col gap-2">
                                                        {cond.otc_remedies.map((remedy, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="row ai-start gap-2"
                                                                style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}
                                                            >
                                                                <span
                                                                    aria-hidden="true"
                                                                    style={{
                                                                        color: 'var(--mint-2)',
                                                                        flexShrink: 0,
                                                                        marginTop: 2,
                                                                        fontFamily: 'var(--mono)',
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    +
                                                                </span>
                                                                <span>{remedy}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {/* Home Care */}
                                            {cond.home_care && cond.home_care.length > 0 && (
                                                <div className="col gap-3">
                                                    <p className="kicker">
                                                        <span className="dot" />Natural / home care
                                                    </p>
                                                    <ul className="clean col gap-2">
                                                        {cond.home_care.map((care, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="row ai-start gap-2"
                                                                style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}
                                                            >
                                                                <span
                                                                    aria-hidden="true"
                                                                    style={{
                                                                        color: 'var(--mint-2)',
                                                                        flexShrink: 0,
                                                                        marginTop: 2,
                                                                        fontFamily: 'var(--mono)',
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    +
                                                                </span>
                                                                <span>{care}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="hairline-t row"
                                            style={{ marginTop: 18, paddingTop: 14, justifyContent: 'flex-end' }}
                                        >
                                            <Link
                                                href={`/chat/consult?condition=${encodeURIComponent(cond.name)}`}
                                                className="btn btn-paper btn-sm"
                                            >
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                                Consult AI care bot
                                                <span aria-hidden="true">→</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Link to condition page */}
                                {cond.url && (
                                    <div className="hairline-t" style={{ padding: '14px 24px' }}>
                                        <Link
                                            href={cond.url}
                                            className="row ai-center gap-2"
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: 'var(--cobalt)',
                                            }}
                                        >
                                            Read full condition guide
                                            <span aria-hidden="true">→</span>
                                        </Link>
                                    </div>
                                )}
                            </article>
                        );
                    })}

                    {/* Reset Button */}
                    <button
                        onClick={() => { setResults(null); setSymptoms([]); setAge(''); setGender(''); }}
                        className="btn btn-paper btn-lg"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Start new analysis
                    </button>
                </div>
            )}
        </div>
        </ChatGate>
    );
}
