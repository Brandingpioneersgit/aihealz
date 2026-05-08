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

const TYPE_COLOR: Record<SearchResult['type'], string> = {
    condition: 'bg-rose-100 text-rose-700',
    treatment: 'bg-cyan-100 text-cyan-700',
    specialty: 'bg-purple-100 text-purple-700',
    test: 'bg-amber-100 text-amber-700',
    symptom: 'bg-orange-100 text-orange-700',
    tool: 'bg-slate-200 text-slate-700',
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

        return () => { cancelled = true; };
    }, [query, type]);

    if (error) {
        return <p className="text-rose-600">{error}</p>;
    }

    if (results === null) {
        return <p className="text-slate-500">Searching…</p>;
    }

    if (results.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <p className="text-slate-700 font-semibold mb-2">No matches.</p>
                <p className="text-sm text-slate-500">
                    Try a broader term, or ask <Link href="/healz-ai" className="text-teal-600 font-medium">Healz AI</Link>.
                </p>
            </div>
        );
    }

    return (
        <ul className="space-y-3" aria-live="polite">
            {results.map((r, i) => (
                <li key={`${r.type}-${r.slug}-${i}`}>
                    <Link
                        href={r.url}
                        className="flex items-start justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all"
                    >
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{r.name}</p>
                            <p className="text-sm text-slate-500 truncate">{r.subtitle}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${TYPE_COLOR[r.type]}`}>
                            {TYPE_LABEL[r.type]}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
