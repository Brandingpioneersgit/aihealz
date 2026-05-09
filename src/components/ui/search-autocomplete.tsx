'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    type: 'condition' | 'treatment' | 'specialty' | 'tool' | 'symptom' | 'test';
    slug: string;
    name: string;
    subtitle: string;
    url: string;
    icon?: string;
    matchedSymptom?: string;
}

const TYPE_LABELS: Record<string, string> = {
    condition: 'condition',
    treatment: 'treatment',
    specialty: 'specialty',
    tool: 'tool',
    symptom: 'matching symptom',
    test: 'lab test',
};

const TYPE_PILL_CLASS: Record<string, string> = {
    condition: 'pill pill-cobalt',
    treatment: 'pill pill-mint',
    specialty: 'pill pill-magenta',
    tool: 'pill pill-orange',
    symptom: 'pill pill-lemon',
    test: 'pill pill-cobalt',
};

interface SearchAutocompleteProps {
    className?: string;
    /**
     * Visual variant. Bureau is the default; "ink" is for dark surfaces (e.g.
     * an ink section). The legacy "dark"/"light" props from the previous
     * design map onto Bureau ("light"/anything else) and ink ("dark").
     */
    variant?: 'bureau' | 'ink' | 'light' | 'dark';
    placeholder?: string;
    typeFilter?: 'condition' | 'treatment' | 'specialty' | 'tool' | 'test';
}

export default function SearchAutocomplete({
    className = '',
    variant = 'bureau',
    placeholder = 'Search a condition, treatment, or symptom',
    typeFilter,
}: SearchAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const isInk = variant === 'ink' || variant === 'dark';

    const fetchResults = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        setIsLoading(true);
        try {
            const typeParam = typeFilter ? `&type=${typeFilter}` : '';
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}${typeParam}`);
            const data: SearchResult[] = await res.json();
            setResults(data);
            setIsOpen(data.length > 0);
            setActiveIdx(-1);
        } catch {
            setResults([]);
        }
        setIsLoading(false);
    }, [typeFilter]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchResults(query), 250);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, fetchResults]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navigate = (url: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(url);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            navigate(results[activeIdx].url);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {});

    let flatIdx = 0;

    const wrapperBg = isInk ? 'rgba(255,255,255,.04)' : 'var(--paper)';
    const wrapperBorder = isInk ? 'rgba(255,255,255,.12)' : 'var(--rule)';
    const inputColor = isInk ? 'var(--paper)' : 'var(--ink)';
    const placeholderColor = isInk ? 'rgba(255,255,255,.5)' : 'var(--ink-4)';
    const iconColor = isInk ? 'rgba(255,255,255,.5)' : 'var(--ink-3)';

    const dropdownBg = isInk ? '#102036' : 'var(--paper)';
    const dropdownBorder = isInk ? 'rgba(255,255,255,.12)' : 'var(--rule)';
    const dropdownDivider = isInk ? 'rgba(255,255,255,.08)' : 'var(--rule)';
    const itemTextColor = isInk ? 'var(--paper)' : 'var(--ink)';
    const itemSubColor = isInk ? 'rgba(255,255,255,.6)' : 'var(--ink-3)';
    const itemActiveBg = isInk ? 'rgba(28,91,255,.18)' : 'var(--cobalt-50)';

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div
                className="row ai-center"
                style={{
                    background: wrapperBg,
                    border: `1px solid ${wrapperBorder}`,
                    borderRadius: 'var(--r-3)',
                    padding: 6,
                    gap: 6,
                    transition: 'border-color 120ms',
                }}
            >
                <div
                    className="row ai-center"
                    aria-hidden="true"
                    style={{ padding: '0 12px', borderRight: `1px solid ${wrapperBorder}`, height: 36 }}
                >
                    <span className="mono" style={{ color: iconColor, fontSize: 13 }}>⌕</span>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls="search-listbox"
                    aria-autocomplete="list"
                    aria-label="Search"
                    aria-activedescendant={activeIdx >= 0 ? `search-option-${activeIdx}` : undefined}
                    className="sans"
                    style={{
                        flex: 1,
                        padding: '8px 4px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: 14,
                        color: inputColor,
                        minWidth: 0,
                    }}
                />
                <style>{`.search-ac-input::placeholder{color:${placeholderColor};}`}</style>
                {isLoading && (
                    <div
                        aria-hidden="true"
                        style={{
                            width: 14,
                            height: 14,
                            border: `2px solid ${isInk ? 'rgba(255,255,255,.4)' : 'var(--rule)'}`,
                            borderTopColor: 'var(--cobalt)',
                            borderRadius: '50%',
                            margin: '0 8px',
                            animation: 'spin 0.7s linear infinite',
                        }}
                    />
                )}
                {!isLoading && query.length > 0 && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                            inputRef.current?.focus();
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ color: iconColor, padding: '4px 8px' }}
                    >
                        ✕
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => activeIdx >= 0 ? navigate(results[activeIdx].url) : null}
                    className="btn btn-cobalt btn-sm"
                >
                    Search
                </button>
            </div>

            {isOpen && (
                <div
                    id="search-listbox"
                    role="listbox"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        marginTop: 8,
                        left: 0,
                        right: 0,
                        background: dropdownBg,
                        border: `1px solid ${dropdownBorder}`,
                        borderRadius: 'var(--r-3)',
                        boxShadow: 'var(--shadow-2)',
                        overflow: 'hidden',
                        zIndex: 50,
                        maxHeight: 384,
                        overflowY: 'auto',
                    }}
                >
                    {Object.entries(grouped).map(([type, items]) => (
                        <div key={type}>
                            <div
                                className="mono"
                                style={{
                                    padding: '8px 14px',
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: itemSubColor,
                                    background: isInk ? 'rgba(255,255,255,.03)' : 'var(--bg-2)',
                                    borderBottom: `1px solid ${dropdownDivider}`,
                                    fontWeight: 500,
                                }}
                            >
                                {TYPE_LABELS[type] || type}
                            </div>
                            {items.map((r) => {
                                const idx = flatIdx++;
                                const isActive = idx === activeIdx;
                                const pillClass = TYPE_PILL_CLASS[r.type] || 'pill';
                                return (
                                    <button
                                        key={`${r.type}-${r.slug}`}
                                        id={`search-option-${idx}`}
                                        role="option"
                                        aria-selected={isActive}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onClick={() => navigate(r.url)}
                                        className="row ai-center gap-3"
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px 14px',
                                            background: isActive ? itemActiveBg : 'transparent',
                                            borderBottom: `1px solid ${dropdownDivider}`,
                                            border: 'none',
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            cursor: 'pointer',
                                            transition: 'background 100ms',
                                            color: itemTextColor,
                                        }}
                                    >
                                        <span className={pillClass} style={{ flexShrink: 0 }}>
                                            {r.icon ? r.icon : TYPE_LABELS[r.type]?.slice(0, 3)}
                                        </span>
                                        <div className="col" style={{ flex: 1, minWidth: 0 }}>
                                            <span style={{
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: itemTextColor,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>{r.name}</span>
                                            <span style={{
                                                fontSize: 12,
                                                color: itemSubColor,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>{r.subtitle}</span>
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="mono"
                                            style={{ color: isActive ? 'var(--cobalt)' : itemSubColor, fontSize: 13 }}
                                        >→</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}

                    {results.length === 0 && query.length >= 2 && !isLoading && (
                        <div
                            style={{ padding: '32px 16px', textAlign: 'center', color: itemSubColor }}
                        >
                            <p style={{ fontSize: 13, margin: 0 }}>No results for &quot;{query}&quot;.</p>
                            <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>Try a different term.</p>
                        </div>
                    )}
                </div>
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
