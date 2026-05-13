'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { SpecialtyGroup, SeverityLevel } from '@/components/ui/conditions-explorer';

const SEVERITY_PILL: Record<SeverityLevel, string> = {
    mild: 'pill pill-mint',
    moderate: 'pill pill-lemon',
    severe: 'pill pill-orange',
    critical: 'pill pill-orange',
    variable: 'pill',
};

const SEVERITY_LABEL: Record<SeverityLevel, string> = {
    mild: 'mild',
    moderate: 'moderate',
    severe: 'severe',
    critical: 'critical',
    variable: 'variable',
};

const FILTERS: Array<{ id: SeverityLevel | 'all'; label: string }> = [
    { id: 'all', label: 'All severities' },
    { id: 'mild', label: 'Mild' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'severe', label: 'Severe' },
    { id: 'critical', label: 'Critical' },
];

type Props = {
    categories: SpecialtyGroup[];
    totalCount: number;
    country?: string | null;
    lang?: string | null;
};

export default function ConditionsIndex({
    categories,
    totalCount,
    country,
    lang,
}: Props) {
    const urlPrefix = country ? `/${country}/${lang || 'en'}` : '/india/en';
    const [query, setQuery] = useState('');
    const [severity, setSeverity] = useState<(typeof FILTERS)[number]['id']>('all');
    const [activeSpec, setActiveSpec] = useState<string | null>(null);

    const visibleCategories = useMemo(() => {
        const q = query.trim().toLowerCase();
        return categories
            .map((cat) => ({
                ...cat,
                conditions: cat.conditions.filter((c) => {
                    const matchesQuery = !q || c.name.toLowerCase().includes(q);
                    const matchesSev = severity === 'all' || c.severity === severity;
                    return matchesQuery && matchesSev;
                }),
            }))
            .filter((cat) => cat.conditions.length > 0)
            .filter((cat) => !activeSpec || cat.specialty === activeSpec);
    }, [categories, query, severity, activeSpec]);

    const matchingCount = visibleCategories.reduce(
        (sum, cat) => sum + cat.conditions.length,
        0,
    );

    return (
        <div className="col gap-5">
            <div
                className="card row ai-center"
                style={{ padding: 6, gap: 6, flexWrap: 'wrap' }}
            >
                <div
                    className="row ai-center"
                    style={{
                        padding: '0 14px',
                        borderRight: '1px solid var(--rule)',
                        height: 42,
                    }}
                >
                    <span
                        className="mono"
                        style={{ color: 'var(--ink-3)', fontSize: 13 }}
                    >
                        ⌕
                    </span>
                </div>
                <input
                    className="v4-input"
                    placeholder="Search a condition by name or symptom"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        flex: 1,
                        padding: '8px 4px',
                    }}
                />
                <select
                    className="v4-select v4-filter-select"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as typeof severity)}
                    style={{ flex: '0 0 200px' }}
                >
                    {FILTERS.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                <button
                    type="button"
                    onClick={() => setActiveSpec(null)}
                    className={
                        activeSpec === null
                            ? 'v4-btn v4-btn-primary v4-btn-sm'
                            : 'v4-btn v4-btn-paper v4-btn-sm'
                    }
                >
                    All specialties
                </button>
                {categories.slice(0, 14).map((cat) => (
                    <button
                        key={cat.specialty}
                        type="button"
                        onClick={() =>
                            setActiveSpec((prev) => (prev === cat.specialty ? null : cat.specialty))
                        }
                        className={
                            activeSpec === cat.specialty
                                ? 'v4-btn v4-btn-primary v4-btn-sm'
                                : 'v4-btn v4-btn-paper v4-btn-sm'
                        }
                    >
                        {cat.specialty}
                        <span
                            className="mono"
                            style={{
                                marginLeft: 6,
                                color:
                                    activeSpec === cat.specialty
                                        ? 'rgba(255,255,255,.7)'
                                        : 'var(--ink-3)',
                            }}
                        >
                            {cat.conditions.length}
                        </span>
                    </button>
                ))}
            </div>

            <div
                className="row between mono"
                style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                }}
            >
                <span>
                    showing {matchingCount.toLocaleString()} of {totalCount.toLocaleString()} conditions
                </span>
                <span>↕ alphabetical</span>
            </div>

            <div className="col gap-6">
                {visibleCategories.slice(0, 25).map((cat) => (
                    <section key={cat.specialty} className="col gap-3">
                        <div
                            className="row between ai-end"
                            style={{ flexWrap: 'wrap', gap: 8 }}
                        >
                            <h3
                                className="display"
                                style={{
                                    fontSize: 22,
                                    margin: 0,
                                    fontWeight: 600,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {cat.specialty}
                                <span
                                    className="mono"
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                    }}
                                >
                                    {cat.conditions.length} conditions
                                </span>
                            </h3>
                            <Link
                                href={`/conditions/${encodeURIComponent(cat.specialty.toLowerCase())}`}
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '.08em',
                                }}
                            >
                                view all →
                            </Link>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: 0,
                                border: '1px solid var(--rule)',
                                borderRadius: 'var(--r-3)',
                                background: 'var(--paper)',
                                overflow: 'hidden',
                            }}
                        >
                            {cat.conditions.slice(0, 18).map((c) => (
                                <Link
                                    key={c.slug}
                                    href={`${urlPrefix}/${c.slug}`}
                                    className="col gap-2"
                                    style={{
                                        padding: '14px 16px',
                                        borderRight: '1px solid var(--rule)',
                                        borderBottom: '1px solid var(--rule)',
                                    }}
                                >
                                    <div className="row between ai-baseline">
                                        <span
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: 'var(--ink)',
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {c.name}
                                        </span>
                                    </div>
                                    <div className="row gap-2 ai-center">
                                        <span className={SEVERITY_PILL[c.severity]}>
                                            {SEVERITY_LABEL[c.severity]}
                                        </span>
                                        {c.bodySystem && (
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 10,
                                                    color: 'var(--ink-4)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '.08em',
                                                }}
                                            >
                                                {c.bodySystem}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
