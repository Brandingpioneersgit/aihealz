'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SearchResult {
    type: 'condition' | 'treatment' | 'specialty' | 'tool' | 'symptom' | 'test';
    slug: string;
    name: string;
    subtitle: string;
    url: string;
}

const TYPE_LABEL: Record<SearchResult['type'], string> = {
    condition: 'Condition',
    treatment: 'Treatment',
    specialty: 'Specialty',
    test: 'Diagnostic test',
    symptom: 'Symptom match',
    tool: 'Tool',
};

const TYPE_PILL_CLASS: Record<SearchResult['type'], string> = {
    condition: 'pill pill-orange',
    treatment: 'pill pill-cobalt',
    specialty: 'pill pill-magenta',
    test: 'pill pill-lemon',
    symptom: 'pill pill-orange',
    tool: 'pill',
};

interface Props {
    query: string;
    type?: string;
}

export default function SearchResults({ query, type }: Props) {
    const [results, setResults] = useState<SearchResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setResults(null);
        setError(null);

        const params = new URLSearchParams({ q: query, limit: '40' });
        if (type) params.set('type', type);

        fetch(`/api/search?${params.toString()}`)
            .then(async res => {
                if (!res.ok) throw new Error(`Search failed (${res.status})`);
                return res.json();
            })
            .then((data: SearchResult[] | { error: string }) => {
                if (cancelled) return;
                if (Array.isArray(data)) setResults(data);
                else setError(data.error || 'Search failed');
            })
            .catch((err: Error) => {
                if (!cancelled) setError(err.message);
            });

        return () => {
            cancelled = true;
        };
    }, [query, type]);

    if (error) {
        return (
            <div
                className="card col gap-2"
                style={{ padding: 24, borderColor: 'rgba(255, 90, 46, .28)' }}
            >
                <span
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--orange-2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    ● error
                </span>
                <p style={{ fontSize: 14, color: 'var(--orange-2)', margin: 0 }}>{error}</p>
            </div>
        );
    }

    if (results === null) {
        return (
            <div className="row gap-2 ai-center">
                <span
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--cobalt)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    ● searching…
                </span>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div
                className="card col gap-3 center"
                style={{ padding: 32, alignItems: 'center', textAlign: 'center' }}
            >
                <span className="kicker">
                    <span className="dot" />
                    no matches
                </span>
                <div
                    className="display"
                    style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.025em', margin: 0 }}
                >
                    Nothing turned up for that.
                </div>
                <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 380 }}>
                    Try a broader term, or hand it to{' '}
                    <Link href="/healz-ai" style={{ color: 'var(--cobalt)', fontWeight: 500 }}>
                        Healz AI
                    </Link>
                    .
                </p>
            </div>
        );
    }

    return (
        <div className="col gap-3">
            <div
                className="row between ai-center"
                style={{ paddingBottom: 8 }}
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
                    {results.length} {results.length === 1 ? 'match' : 'matches'}
                </span>
            </div>

            <ul className="clean col" aria-live="polite">
                {results.map((r, i) => {
                    const isLast = i === results.length - 1;
                    return (
                        <li
                            key={`${r.type}-${r.slug}-${i}`}
                            className={isLast ? '' : 'hairline-b'}
                        >
                            <Link
                                href={r.url}
                                className="row between gap-3 ai-center"
                                style={{
                                    padding: '18px 20px',
                                    background: 'var(--paper)',
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-3)',
                                    transition: 'border-color 120ms, background 120ms',
                                    marginBottom: isLast ? 0 : 8,
                                }}
                            >
                                <div className="col gap-1" style={{ minWidth: 0, flex: 1 }}>
                                    <p
                                        style={{
                                            fontSize: 15,
                                            fontWeight: 500,
                                            color: 'var(--cobalt)',
                                            margin: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {r.name}
                                    </p>
                                    <p
                                        className="muted"
                                        style={{
                                            fontSize: 13,
                                            margin: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {r.subtitle}
                                    </p>
                                </div>
                                <span className={TYPE_PILL_CLASS[r.type]} style={{ flexShrink: 0 }}>
                                    {TYPE_LABEL[r.type]}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
