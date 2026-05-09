'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

/* ─── Severity Classification ──────────────────────────────── */

export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical' | 'variable';

type SeverityCfg = {
    label: string;
    /** Bureau pill class to apply */
    pill: string;
    /** Inline color override (mostly for breakdown counts + dots) */
    color: string;
    /** Solid dot colour */
    dot: string;
};

const SEVERITY_CONFIG: Record<SeverityLevel, SeverityCfg> = {
    mild: {
        label: 'Mild',
        pill: 'pill pill-mint',
        color: 'var(--mint-3)',
        dot: 'var(--mint)',
    },
    moderate: {
        label: 'Moderate',
        pill: 'pill pill-lemon',
        color: '#8C6A00',
        dot: 'var(--lemon-2)',
    },
    severe: {
        label: 'Severe',
        pill: 'pill pill-orange',
        color: 'var(--orange-2)',
        dot: 'var(--orange)',
    },
    critical: {
        label: 'Critical',
        // Custom critical pill — uses --sev-critical token
        pill: 'pill',
        color: 'var(--sev-critical)',
        dot: 'var(--sev-critical)',
    },
    variable: {
        label: 'Variable',
        pill: 'pill',
        color: 'var(--ink-3)',
        dot: 'var(--ink-4)',
    },
};

/** Inline style for the critical pill since there is no .pill-critical class. */
const CRITICAL_STYLE: React.CSSProperties = {
    background: 'rgba(182, 21, 21, .08)',
    color: 'var(--sev-critical)',
    borderColor: 'rgba(182, 21, 21, .25)',
};

function pillStyleFor(sev: SeverityLevel): React.CSSProperties | undefined {
    return sev === 'critical' ? CRITICAL_STYLE : undefined;
}

/* ─── Types ────────────────────────────────────────────────── */

export interface ConditionItem {
    slug: string;
    name: string;
    severity: SeverityLevel;
    bodySystem: string | null;
}

export interface SpecialtyGroup {
    specialty: string;
    conditions: ConditionItem[];
}

const INITIAL_VISIBLE = 12;
const LOAD_MORE_COUNT = 24;
const MAX_SPECIALTIES_SHOWN = 10;

/** Compact severity badge used inside each condition row. */
function SeverityBadge({ severity }: { severity: SeverityLevel }) {
    const cfg = SEVERITY_CONFIG[severity];
    return (
        <span
            className={cfg.pill}
            style={{
                ...pillStyleFor(severity),
                fontSize: 9,
                padding: '2px 6px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: cfg.dot,
                    display: 'inline-block',
                }}
            />
            {cfg.label}
        </span>
    );
}

/* ─── Specialty Card Component ─────────────────────────────── */

function SpecialtyCard({
    category,
    activeSeverities,
    urlPrefix,
}: {
    category: SpecialtyGroup;
    activeSeverities: Set<SeverityLevel>;
    urlPrefix: string;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

    // Filter conditions by active severities
    const filteredConditions = useMemo(() =>
        category.conditions.filter(c => activeSeverities.has(c.severity)),
        [category.conditions, activeSeverities]
    );

    // Severity breakdown
    const sevCounts = useMemo(() => {
        const counts: Partial<Record<SeverityLevel, number>> = {};
        filteredConditions.forEach(c => {
            counts[c.severity] = (counts[c.severity] || 0) + 1;
        });
        return counts;
    }, [filteredConditions]);

    const visibleConditions = isExpanded
        ? filteredConditions.slice(0, visibleCount)
        : filteredConditions.slice(0, INITIAL_VISIBLE);

    const hasMore = filteredConditions.length > INITIAL_VISIBLE;
    const canLoadMore = isExpanded && visibleCount < filteredConditions.length;

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredConditions.length));
    }, [filteredConditions.length]);

    const handleToggle = useCallback(() => {
        if (isExpanded) {
            setIsExpanded(false);
            setVisibleCount(INITIAL_VISIBLE);
        } else {
            setIsExpanded(true);
        }
    }, [isExpanded]);

    if (filteredConditions.length === 0) return null;

    // Two-letter monogram for the specialty (matches .spec-icon convention)
    const monogram = category.specialty
        .split(/\s+/)
        .map(w => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || category.specialty.slice(0, 2).toUpperCase();

    return (
        <section
            id={`spec-${category.specialty.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
            className="card scroll-mt-32"
            style={{ overflow: 'hidden' }}
        >
            {/* Header */}
            <button
                onClick={handleToggle}
                className="row between ai-center gap-4"
                style={{
                    width: '100%',
                    padding: '20px 22px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--ink)',
                }}
                aria-expanded={isExpanded}
            >
                <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
                    <div className="row ai-center gap-3" style={{ flexWrap: 'wrap' }}>
                        <span className="spec-icon" aria-hidden="true">{monogram}</span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 22,
                                fontWeight: 600,
                                letterSpacing: '-0.02em',
                                margin: 0,
                                color: 'var(--ink)',
                            }}
                        >
                            {category.specialty}
                        </h2>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}
                        >
                            {filteredConditions.length.toLocaleString()} conditions
                        </span>
                    </div>

                    {/* Severity breakdown */}
                    <div className="row gap-3" style={{ flexWrap: 'wrap', paddingLeft: 48 }}>
                        {(Object.keys(SEVERITY_CONFIG) as SeverityLevel[]).map(sev => {
                            const count = sevCounts[sev];
                            if (!count) return null;
                            const cfg = SEVERITY_CONFIG[sev];
                            return (
                                <span
                                    key={sev}
                                    className="row ai-center gap-1 mono"
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 500,
                                        color: cfg.color,
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: 999,
                                            background: cfg.dot,
                                            display: 'inline-block',
                                        }}
                                    />
                                    {count.toLocaleString()} {cfg.label}
                                </span>
                            );
                        })}
                    </div>
                </div>

                <span
                    aria-hidden="true"
                    className="mono"
                    style={{
                        fontSize: 18,
                        color: 'var(--ink-3)',
                        transition: 'transform var(--transition-normal)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        flexShrink: 0,
                    }}
                >
                    ▾
                </span>
            </button>

            <div className="hairline" />

            {/* Conditions Grid */}
            <div style={{ padding: '20px 22px' }}>
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    style={{ gap: 8 }}
                >
                    {visibleConditions.map((c, i) => (
                        <Link
                            key={`${c.slug}-${i}`}
                            href={`${urlPrefix}/${c.slug}`}
                            className="row ai-center between gap-2"
                            style={{
                                padding: '10px 14px',
                                background: 'var(--paper-2)',
                                border: '1px solid var(--rule)',
                                borderRadius: 'var(--r-2)',
                                color: 'var(--ink-2)',
                                fontSize: 14,
                                fontWeight: 500,
                                transition:
                                    'background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
                                minWidth: 0,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--paper)';
                                e.currentTarget.style.borderColor = 'var(--cobalt)';
                                e.currentTarget.style.color = 'var(--ink)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--paper-2)';
                                e.currentTarget.style.borderColor = 'var(--rule)';
                                e.currentTarget.style.color = 'var(--ink-2)';
                            }}
                        >
                            <span
                                className="truncate"
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {c.name}
                            </span>
                            <SeverityBadge severity={c.severity} />
                        </Link>
                    ))}
                </div>

                {/* Load More / Collapse buttons */}
                {hasMore && (
                    <div className="row gap-2" style={{ marginTop: 16, flexWrap: 'wrap' }}>
                        {!isExpanded ? (
                            <button
                                onClick={handleToggle}
                                className="btn btn-paper"
                                style={{ flex: 1, minWidth: 200 }}
                            >
                                Show all {filteredConditions.length.toLocaleString()} conditions
                                <span aria-hidden="true" className="mono">▾</span>
                            </button>
                        ) : (
                            <>
                                {canLoadMore && (
                                    <button
                                        onClick={handleLoadMore}
                                        className="btn btn-paper"
                                        style={{ flex: 1, minWidth: 200 }}
                                    >
                                        Load more ({(filteredConditions.length - visibleCount).toLocaleString()} remaining)
                                        <span aria-hidden="true" className="mono">▾</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleToggle}
                                    className="btn btn-ghost"
                                >
                                    Collapse
                                    <span
                                        aria-hidden="true"
                                        className="mono"
                                        style={{ transform: 'rotate(180deg)', display: 'inline-block' }}
                                    >
                                        ▾
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ─── Main Explorer ────────────────────────────────────────── */

export default function ConditionsExplorer({
    categories,
    totalCount,
    country,
    lang,
}: {
    categories: SpecialtyGroup[];
    totalCount: number;
    country?: string | null;
    lang?: string;
}) {
    // Build the URL prefix based on detected region
    const urlPrefix = country ? `/${country}/${lang || 'en'}` : '/india/en';
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSeverities, setActiveSeverities] = useState<Set<SeverityLevel>>(
        new Set(['mild', 'moderate', 'severe', 'critical', 'variable'])
    );
    const [visibleSpecialties, setVisibleSpecialties] = useState(MAX_SPECIALTIES_SHOWN);
    const [showFilters, setShowFilters] = useState(false);

    const toggleSeverity = useCallback((sev: SeverityLevel) => {
        setActiveSeverities(prev => {
            const next = new Set(prev);
            if (next.has(sev)) {
                if (next.size > 1) next.delete(sev);
            } else {
                next.add(sev);
            }
            return next;
        });
    }, []);

    const selectAllSeverities = useCallback(() => {
        setActiveSeverities(new Set(['mild', 'moderate', 'severe', 'critical', 'variable']));
    }, []);

    const filteredCategories = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return categories
            .map(cat => {
                let conditions = cat.conditions.filter(c => activeSeverities.has(c.severity));
                if (q) {
                    conditions = conditions.filter(c =>
                        c.name.toLowerCase().includes(q) ||
                        cat.specialty.toLowerCase().includes(q)
                    );
                }
                return { ...cat, conditions };
            })
            .filter(cat => cat.conditions.length > 0);
    }, [categories, searchQuery, activeSeverities]);

    const totalFiltered = filteredCategories.reduce((sum, c) => sum + c.conditions.length, 0);

    // Paginated specialties for lazy loading
    const visibleCategories = filteredCategories.slice(0, visibleSpecialties);
    const hasMoreSpecialties = visibleSpecialties < filteredCategories.length;

    // Load more specialties on scroll near bottom
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMoreSpecialties) {
                    setVisibleSpecialties(prev => Math.min(prev + MAX_SPECIALTIES_SHOWN, filteredCategories.length));
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMoreSpecialties, filteredCategories.length]);

    // Reset visible specialties when search changes
    useEffect(() => {
        setVisibleSpecialties(MAX_SPECIALTIES_SHOWN);
    }, [searchQuery, activeSeverities]);

    // Calculate severity counts across all conditions
    const globalSevCounts = useMemo(() => {
        const counts: Record<SeverityLevel, number> = {
            mild: 0,
            moderate: 0,
            severe: 0,
            critical: 0,
            variable: 0,
        };
        categories.forEach(cat => {
            cat.conditions.forEach(c => {
                counts[c.severity]++;
            });
        });
        return counts;
    }, [categories]);

    // Empty state when no categories data
    if (!categories || categories.length === 0) {
        return (
            <div className="card col ai-center gap-4" style={{ padding: '64px 24px', textAlign: 'center' }}>
                <div
                    className="row ai-center center"
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 'var(--r-3)',
                        background: 'var(--bg-2)',
                        border: '1px solid var(--rule)',
                        fontFamily: 'var(--mono)',
                        fontSize: 22,
                        color: 'var(--ink-3)',
                    }}
                    aria-hidden="true"
                >
                    ⌕
                </div>
                <h3
                    className="display"
                    style={{
                        fontSize: 28,
                        fontWeight: 600,
                        letterSpacing: '-0.025em',
                        margin: 0,
                        color: 'var(--ink)',
                    }}
                >
                    No conditions available
                </h3>
                <p style={{ color: 'var(--ink-3)', maxWidth: 420, margin: 0 }}>
                    Medical conditions data is currently being loaded or is not available for this region.
                </p>
                <Link href="/conditions" className="btn btn-cobalt" style={{ marginTop: 8 }}>
                    Browse all conditions →
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Stats Bar */}
            <div
                className="row between ai-center gap-4"
                style={{ marginBottom: 20, flexWrap: 'wrap' }}
            >
                <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span className="section-mark">the index</span>
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        · {filteredCategories.length} specialties · {totalFiltered.toLocaleString()} conditions
                    </span>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                    aria-expanded={showFilters}
                >
                    <span aria-hidden="true" className="mono">⌗</span>
                    Filters
                    {activeSeverities.size < 5 && (
                        <span
                            className="mono"
                            style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '1px 6px',
                                borderRadius: 'var(--r-1)',
                                background: showFilters ? 'rgba(255,255,255,.2)' : 'var(--cobalt)',
                                color: showFilters ? '#fff' : '#fff',
                                marginLeft: 2,
                            }}
                        >
                            {activeSeverities.size}
                        </span>
                    )}
                </button>
            </div>

            {/* Search */}
            <div
                className="card-flat"
                style={{
                    padding: '4px 14px 4px 4px',
                    marginBottom: 20,
                    maxWidth: 640,
                    marginInline: 'auto',
                    position: 'relative',
                }}
            >
                <div className="row ai-center gap-2">
                    <span
                        aria-hidden="true"
                        className="row ai-center center mono"
                        style={{
                            width: 40,
                            height: 40,
                            fontSize: 18,
                            color: 'var(--ink-3)',
                            flexShrink: 0,
                        }}
                    >
                        ⌕
                    </span>
                    <input
                        type="text"
                        placeholder={`Search ${totalCount.toLocaleString()} conditions…`}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontFamily: 'var(--sans)',
                            fontSize: 15,
                            color: 'var(--ink)',
                            padding: '8px 0',
                            minWidth: 0,
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                            className="row ai-center center mono"
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 'var(--r-1)',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--ink-3)',
                                fontSize: 16,
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-2)';
                                e.currentTarget.style.color = 'var(--ink)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--ink-3)';
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Severity Filters */}
            {showFilters && (
                <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                    <div className="row between ai-center" style={{ marginBottom: 12 }}>
                        <span className="kicker">
                            <span className="dot" />Filter by severity
                        </span>
                        <button
                            onClick={selectAllSeverities}
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: 500,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        >
                            Select all
                        </button>
                    </div>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        {(Object.keys(SEVERITY_CONFIG) as SeverityLevel[]).map(sev => {
                            const cfg = SEVERITY_CONFIG[sev];
                            const isActive = activeSeverities.has(sev);
                            const count = globalSevCounts[sev];

                            const baseStyle: React.CSSProperties = isActive
                                ? { ...pillStyleFor(sev), cursor: 'pointer', textTransform: 'none', padding: '8px 12px', fontSize: 12 }
                                : {
                                    cursor: 'pointer',
                                    textTransform: 'none',
                                    padding: '8px 12px',
                                    fontSize: 12,
                                    background: 'var(--paper)',
                                    color: 'var(--ink-4)',
                                    borderColor: 'var(--rule)',
                                };

                            return (
                                <button
                                    key={sev}
                                    onClick={() => toggleSeverity(sev)}
                                    className={isActive ? cfg.pill : 'pill'}
                                    style={baseStyle}
                                    aria-pressed={isActive}
                                >
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: 999,
                                            background: isActive ? cfg.dot : 'var(--ink-5)',
                                            display: 'inline-block',
                                        }}
                                    />
                                    {cfg.label}
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            padding: '1px 6px',
                                            borderRadius: 'var(--r-1)',
                                            background: isActive
                                                ? 'rgba(10, 26, 47, .08)'
                                                : 'var(--bg-2)',
                                            color: 'inherit',
                                            opacity: 0.85,
                                        }}
                                    >
                                        {count.toLocaleString()}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No Results */}
            {filteredCategories.length === 0 && (
                <div className="card col ai-center gap-3" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div
                        className="row ai-center center mono"
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--r-2)',
                            background: 'var(--bg-2)',
                            border: '1px solid var(--rule)',
                            fontSize: 20,
                            color: 'var(--ink-3)',
                        }}
                        aria-hidden="true"
                    >
                        ⌕
                    </div>
                    <h3
                        className="display"
                        style={{
                            fontSize: 22,
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                            margin: 0,
                            color: 'var(--ink)',
                        }}
                    >
                        No conditions found
                    </h3>
                    <p style={{ color: 'var(--ink-3)', margin: 0 }}>
                        Try adjusting your search or filters.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            selectAllSeverities();
                        }}
                        className="btn btn-paper btn-sm"
                        style={{ marginTop: 4 }}
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Specialty Accordion */}
            <div className="col gap-4">
                {visibleCategories.map(category => (
                    <SpecialtyCard
                        key={category.specialty}
                        category={category}
                        activeSeverities={activeSeverities}
                        urlPrefix={urlPrefix}
                    />
                ))}
            </div>

            {/* Load More Trigger / Loading Indicator */}
            {hasMoreSpecialties && (
                <div ref={loadMoreRef} style={{ padding: '32px 0', textAlign: 'center' }}>
                    <div
                        className="row ai-center gap-3"
                        style={{
                            display: 'inline-flex',
                            padding: '10px 18px',
                            background: 'var(--paper)',
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                        }}
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: 999,
                                border: '2px solid var(--rule)',
                                borderTopColor: 'var(--cobalt)',
                                animation: 'spin 0.8s linear infinite',
                                display: 'inline-block',
                            }}
                        />
                        <span
                            className="mono"
                            style={{
                                fontSize: 12,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}
                        >
                            Loading more · {(filteredCategories.length - visibleSpecialties).toLocaleString()} remaining
                        </span>
                    </div>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            )}

            {/* All Loaded */}
            {!hasMoreSpecialties && filteredCategories.length > 0 && (
                <div
                    className="mono"
                    style={{
                        padding: '32px 0',
                        textAlign: 'center',
                        fontSize: 11,
                        color: 'var(--ink-4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    Showing all {filteredCategories.length} specialties
                </div>
            )}
        </>
    );
}
