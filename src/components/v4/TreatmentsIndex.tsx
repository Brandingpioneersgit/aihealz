'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { TreatmentType } from '@/components/ui/treatments-explorer';

export interface TreatmentItem {
    name: string;
    type: TreatmentType;
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
    description?: string;
    costs?: {
        usa: { usd: number };
        uk: { usd: number };
        india: { usd: number };
        thailand?: { usd: number };
        mexico?: { usd: number };
        turkey?: { usd: number };
        uae?: { usd: number };
    };
}

export interface TreatmentSpecialty {
    specialty: string;
    treatments: TreatmentItem[];
}

const TYPE_LABEL: Record<TreatmentType, string> = {
    medical: 'medical mgmt',
    surgical: 'surgical',
    otc: 'OTC',
    home_remedy: 'home remedy',
    therapy: 'therapy',
    drug: 'drug',
    injection: 'injection',
    prescription: 'rx',
};

const TYPE_PILL: Record<TreatmentType, string> = {
    medical: 'pill pill-cobalt',
    surgical: 'pill pill-orange',
    otc: 'pill pill-mint',
    home_remedy: 'pill pill-lemon',
    therapy: 'pill pill-magenta',
    drug: 'pill pill-cobalt',
    injection: 'pill pill-orange',
    prescription: 'pill pill-cobalt',
};

const TYPE_FILTERS: Array<{ id: TreatmentType | 'all'; label: string }> = [
    { id: 'all', label: 'All types' },
    { id: 'prescription', label: 'Prescription' },
    { id: 'surgical', label: 'Surgical' },
    { id: 'therapy', label: 'Therapy' },
    { id: 'otc', label: 'OTC' },
    { id: 'home_remedy', label: 'Home remedies' },
    { id: 'injection', label: 'Injectable' },
];

type Props = {
    categories: TreatmentSpecialty[];
    totalTreatments: number;
    country?: string | null;
    lang?: string | null;
};

function fmtUSD(n: number | undefined) {
    if (n == null || isNaN(n)) return '—';
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
    return `$${Math.round(n)}`;
}

export default function TreatmentsIndex({
    categories,
    totalTreatments,
    country,
    lang,
}: Props) {
    const urlPrefix = country
        ? `/${country}/${lang || 'en'}/treatments`
        : '/treatments';

    const [query, setQuery] = useState('');
    const [type, setType] = useState<(typeof TYPE_FILTERS)[number]['id']>('all');
    const [activeSpec, setActiveSpec] = useState<string | null>(null);

    const visibleCategories = useMemo(() => {
        const q = query.trim().toLowerCase();
        return categories
            .map((cat) => ({
                ...cat,
                treatments: cat.treatments.filter((t) => {
                    const matchesQuery =
                        !q ||
                        t.name.toLowerCase().includes(q) ||
                        t.brandNames?.some((b) => b.toLowerCase().includes(q));
                    const matchesType = type === 'all' || t.type === type;
                    return matchesQuery && matchesType;
                }),
            }))
            .filter((cat) => cat.treatments.length > 0)
            .filter((cat) => !activeSpec || cat.specialty === activeSpec);
    }, [categories, query, type, activeSpec]);

    const matching = visibleCategories.reduce(
        (sum, cat) => sum + cat.treatments.length,
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
                    placeholder="Search drugs, procedures, generics, brands…"
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
                    value={type}
                    onChange={(e) => setType(e.target.value as typeof type)}
                    style={{ flex: '0 0 200px' }}
                >
                    {TYPE_FILTERS.map((f) => (
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
                            setActiveSpec((p) =>
                                p === cat.specialty ? null : cat.specialty,
                            )
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
                            {cat.treatments.length}
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
                    showing {matching.toLocaleString()} of {totalTreatments.toLocaleString()} treatments
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
                                    {cat.treatments.length} treatments
                                </span>
                            </h3>
                        </div>
                        <div
                            className="card"
                            style={{ padding: 0, overflow: 'hidden' }}
                        >
                            {cat.treatments.slice(0, 14).map((t, i, arr) => (
                                <Link
                                    key={t.name + i}
                                    href={`${urlPrefix}/${encodeURIComponent(
                                        t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    )}`}
                                    className="row ai-center"
                                    style={{
                                        padding: '14px 18px',
                                        borderBottom:
                                            i < arr.length - 1
                                                ? '1px solid var(--rule)'
                                                : 'none',
                                        gap: 14,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div
                                        className="col"
                                        style={{ flex: '2 1 280px', minWidth: 0 }}
                                    >
                                        <div
                                            className="row ai-center gap-2"
                                            style={{ flexWrap: 'wrap' }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {t.name}
                                            </span>
                                            <span className={TYPE_PILL[t.type]}>
                                                {TYPE_LABEL[t.type]}
                                            </span>
                                            {t.genericAvailable && (
                                                <span className="pill pill-mint">
                                                    generic
                                                </span>
                                            )}
                                            {t.requiresPrescription && (
                                                <span className="pill">rx</span>
                                            )}
                                        </div>
                                        {t.brandNames && t.brandNames.length > 0 && (
                                            <div
                                                className="muted"
                                                style={{ fontSize: 12, marginTop: 2 }}
                                            >
                                                {t.brandNames.slice(0, 4).join(' · ')}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="row gap-3"
                                        style={{ flex: '1 1 240px', minWidth: 0 }}
                                    >
                                        {t.costs ? (
                                            <>
                                                <CostCell label="USA" value={t.costs.usa?.usd} />
                                                <CostCell label="UK" value={t.costs.uk?.usd} />
                                                <CostCell
                                                    label="India"
                                                    value={t.costs.india?.usd}
                                                    highlight
                                                />
                                            </>
                                        ) : (
                                            <span
                                                className="muted"
                                                style={{ fontSize: 12 }}
                                            >
                                                Cost coming soon
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

function CostCell({
    label,
    value,
    highlight,
}: {
    label: string;
    value: number | undefined;
    highlight?: boolean;
}) {
    return (
        <div
            className="col"
            style={{ minWidth: 60 }}
        >
            <span
                className="mono"
                style={{
                    fontSize: 10,
                    color: highlight ? 'var(--cobalt)' : 'var(--ink-4)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                }}
            >
                {label}
            </span>
            <span
                className="num"
                style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: highlight ? 'var(--cobalt)' : 'var(--ink)',
                }}
            >
                {fmtUSD(value)}
            </span>
        </div>
    );
}
