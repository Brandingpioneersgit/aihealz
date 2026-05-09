'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ─── Treatment Type Classification ────────────────────────── */

export type TreatmentType =
    | 'medical'
    | 'surgical'
    | 'otc'
    | 'home_remedy'
    | 'therapy'
    | 'drug'
    | 'injection'
    | 'prescription';

interface TreatmentCost {
    usd: number;
    currency: string;
    range?: [number, number];
}

interface TreatmentItem {
    name: string;
    type: TreatmentType;
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
    description?: string;
    costs?: {
        usa: TreatmentCost;
        uk: TreatmentCost;
        india: TreatmentCost;
        thailand: TreatmentCost;
        mexico: TreatmentCost;
        turkey: TreatmentCost;
        uae: TreatmentCost;
    };
}

interface SpecialtyGroup {
    specialty: string;
    treatments: TreatmentItem[];
}

type CountryKey = 'usa' | 'uk' | 'india' | 'thailand' | 'mexico' | 'turkey' | 'uae';

const COUNTRIES: { key: CountryKey; label: string; flag: string; currency: string }[] = [
    { key: 'usa', label: 'United States', flag: '🇺🇸', currency: 'USD' },
    { key: 'uk', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
    { key: 'india', label: 'India', flag: '🇮🇳', currency: 'INR' },
    { key: 'thailand', label: 'Thailand', flag: '🇹🇭', currency: 'THB' },
    { key: 'mexico', label: 'Mexico', flag: '🇲🇽', currency: 'MXN' },
    { key: 'turkey', label: 'Turkey', flag: '🇹🇷', currency: 'TRY' },
    { key: 'uae', label: 'UAE', flag: '🇦🇪', currency: 'AED' },
];

interface TypeCfg {
    label: string;
    shortLabel: string;
    pill: string;
    dot: string;
    color: string;
    glyph: string;
}

const TYPE_CONFIG: Record<TreatmentType, TypeCfg> = {
    medical: {
        label: 'Medical Management',
        shortLabel: 'Medical',
        pill: 'pill pill-cobalt',
        dot: 'var(--cobalt)',
        color: 'var(--cobalt)',
        glyph: 'M',
    },
    surgical: {
        label: 'Surgical / Procedure',
        shortLabel: 'Surgical',
        pill: 'pill pill-orange',
        dot: 'var(--orange)',
        color: 'var(--orange-2)',
        glyph: 'S',
    },
    drug: {
        label: 'Prescription Drugs',
        shortLabel: 'Drug',
        pill: 'pill pill-cobalt',
        dot: 'var(--cobalt-3)',
        color: 'var(--cobalt)',
        glyph: 'D',
    },
    injection: {
        label: 'Injections',
        shortLabel: 'Injection',
        pill: 'pill pill-magenta',
        dot: 'var(--magenta)',
        color: 'var(--magenta)',
        glyph: 'I',
    },
    prescription: {
        label: 'Prescription Medicines',
        shortLabel: 'Rx',
        pill: 'pill pill-cobalt',
        dot: 'var(--cobalt-2)',
        color: 'var(--cobalt-2)',
        glyph: 'R',
    },
    otc: {
        label: 'Over-the-Counter',
        shortLabel: 'OTC',
        pill: 'pill pill-lemon',
        dot: 'var(--lemon-2)',
        color: '#8C6A00',
        glyph: 'O',
    },
    home_remedy: {
        label: 'Home Remedy',
        shortLabel: 'Home',
        pill: 'pill pill-mint',
        dot: 'var(--mint)',
        color: 'var(--mint-3)',
        glyph: 'H',
    },
    therapy: {
        label: 'Therapy / Rehabilitation',
        shortLabel: 'Therapy',
        pill: 'pill',
        dot: 'var(--ink-3)',
        color: 'var(--ink-3)',
        glyph: 'T',
    },
};

const ALL_TYPES: TreatmentType[] = [
    'medical',
    'surgical',
    'drug',
    'injection',
    'prescription',
    'otc',
    'home_remedy',
    'therapy',
];

const INITIAL_VISIBLE = 12;

/* ─── TypeBadge ─────────────────────────────────────────── */

function TypeBadge({ type }: { type: TreatmentType }) {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.medical;
    return (
        <span
            className={cfg.pill}
            style={{
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
            {cfg.shortLabel}
        </span>
    );
}

/* ─── Cost Display ──────────────────────────────────────── */

function CostDisplay({ costs, country }: { costs?: TreatmentItem['costs']; country: CountryKey }) {
    if (!costs || !costs[country]) return null;

    const cost = costs[country];
    const countryInfo = COUNTRIES.find(c => c.key === country);

    if (!cost.range) return null;

    return (
        <span
            className="mono"
            style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--mint-3)',
                background: 'var(--mint-50)',
                border: '1px solid rgba(40, 212, 168, .30)',
                padding: '2px 6px',
                borderRadius: 'var(--r-1)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
            }}
        >
            {countryInfo?.currency} {cost.range[0].toLocaleString()}–{cost.range[1].toLocaleString()}
        </span>
    );
}

/* ─── Treatment Card ────────────────────────────────────── */

interface TreatmentCardProps {
    treatment: TreatmentItem;
    country: CountryKey;
    lang?: string;
    baseUrl?: string;
}

function TreatmentCard({ treatment, country, lang = 'en', baseUrl }: TreatmentCardProps) {
    const slug = treatment.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const countrySlugMap: Record<CountryKey, string> = {
        usa: 'us',
        uk: 'uk',
        india: 'in',
        thailand: 'th',
        mexico: 'mx',
        turkey: 'tr',
        uae: 'ae',
    };
    const countrySlug = countrySlugMap[country] || 'in';

    const href = baseUrl
        ? `${baseUrl}/${slug}`
        : `/${countrySlug}/${lang}/treatments/${slug}`;

    return (
        <Link
            href={href}
            className="col gap-2"
            style={{
                padding: '12px 14px',
                background: 'var(--paper-2)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-2)',
                color: 'var(--ink-2)',
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
            <div className="row between ai-start gap-2">
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'inherit',
                        flex: 1,
                        minWidth: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {treatment.name}
                </span>
                <TypeBadge type={treatment.type} />
            </div>

            {/* Brand names */}
            {treatment.brandNames && treatment.brandNames.length > 0 && (
                <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                    {treatment.brandNames.slice(0, 2).map((brand, i) => (
                        <span
                            key={i}
                            className="mono"
                            style={{
                                fontSize: 10,
                                color: 'var(--ink-4)',
                                background: 'var(--bg-2)',
                                border: '1px solid var(--rule)',
                                padding: '1px 6px',
                                borderRadius: 'var(--r-1)',
                                letterSpacing: '0.02em',
                            }}
                        >
                            {brand}
                        </span>
                    ))}
                    {treatment.brandNames.length > 2 && (
                        <span
                            className="mono"
                            style={{ fontSize: 10, color: 'var(--ink-4)' }}
                        >
                            +{treatment.brandNames.length - 2}
                        </span>
                    )}
                </div>
            )}

            {/* Cost + flags */}
            <div className="row between ai-center gap-2" style={{ marginTop: 'auto' }}>
                <div className="row ai-center gap-1">
                    {treatment.genericAvailable && (
                        <span
                            className="pill pill-mint"
                            style={{ fontSize: 9, padding: '2px 6px' }}
                        >
                            Generic
                        </span>
                    )}
                    {treatment.requiresPrescription && (
                        <span
                            className="pill pill-lemon"
                            style={{ fontSize: 9, padding: '2px 6px' }}
                        >
                            Rx
                        </span>
                    )}
                </div>
                <CostDisplay costs={treatment.costs} country={country} />
            </div>
        </Link>
    );
}

/* ─── Country Slug Mapping ──────────────────────────────── */

const COUNTRY_SLUG_TO_KEY: Record<string, CountryKey> = {
    usa: 'usa',
    uk: 'uk',
    india: 'india',
    thailand: 'thailand',
    mexico: 'mexico',
    turkey: 'turkey',
    uae: 'uae',
};

function getCountryKey(slug: string | null | undefined): CountryKey {
    if (!slug) return 'usa';
    const lower = slug.toLowerCase();
    return COUNTRY_SLUG_TO_KEY[lower] || 'usa';
}

/* ─── Main Explorer ─────────────────────────────────────── */

interface TreatmentsExplorerProps {
    categories: SpecialtyGroup[];
    defaultCountry?: string | null;
    lang?: string;
    baseUrl?: string;
}

export default function TreatmentsExplorer({
    categories,
    defaultCountry,
    lang = 'en',
    baseUrl,
}: TreatmentsExplorerProps) {
    const initialCountry = getCountryKey(defaultCountry);
    const [activeTypes, setActiveTypes] = useState<Set<TreatmentType>>(new Set(ALL_TYPES));
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<CountryKey>(initialCountry);
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const toggleType = (type: TreatmentType) => {
        setActiveTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) {
                if (next.size > 1) next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    };

    const toggleSection = (specialty: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(specialty)) next.delete(specialty);
            else next.add(specialty);
            return next;
        });
    };

    const filteredCategories = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();

        return categories
            .map(cat => {
                let treatments = cat.treatments.filter(t => activeTypes.has(t.type));
                if (q) {
                    treatments = treatments.filter(
                        t =>
                            t.name.toLowerCase().includes(q) ||
                            (t.brandNames && t.brandNames.some(b => b.toLowerCase().includes(q)))
                    );
                }
                return { ...cat, treatments };
            })
            .filter(cat => cat.treatments.length > 0);
    }, [categories, activeTypes, searchQuery]);

    const totalFiltered = filteredCategories.reduce((sum, c) => sum + c.treatments.length, 0);
    const totalAll = categories.reduce((sum, c) => sum + c.treatments.length, 0);

    const currentCountry = COUNTRIES.find(c => c.key === selectedCountry)!;

    return (
        <>
            {/* Stats Bar */}
            <div
                className="row between ai-center gap-4"
                style={{ marginBottom: 20, flexWrap: 'wrap' }}
            >
                <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span className="section-mark">treatments</span>
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        · {filteredCategories.length} specialties · {totalFiltered.toLocaleString()} / {totalAll.toLocaleString()} treatments
                    </span>
                </div>

                {/* Country Selector */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowCountrySelector(!showCountrySelector)}
                        className="btn btn-paper btn-sm"
                        aria-expanded={showCountrySelector}
                    >
                        <span aria-hidden="true">{currentCountry.flag}</span>
                        <span>{currentCountry.label}</span>
                        <span
                            className="mono"
                            style={{
                                fontSize: 10,
                                color: 'var(--ink-4)',
                                letterSpacing: '0.04em',
                            }}
                        >
                            {currentCountry.currency}
                        </span>
                        <span aria-hidden="true" className="mono" style={{ fontSize: 10 }}>
                            ▾
                        </span>
                    </button>

                    {showCountrySelector && (
                        <div
                            className="card-flat animate-scale-in"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: 6,
                                minWidth: 240,
                                padding: 6,
                                zIndex: 100,
                                boxShadow: 'var(--shadow-2)',
                            }}
                        >
                            <p
                                className="kicker"
                                style={{ padding: '6px 10px 8px' }}
                            >
                                <span className="dot" />
                                Select country for costs
                            </p>
                            <div className="col gap-1">
                                {COUNTRIES.map(country => {
                                    const isSelected = selectedCountry === country.key;
                                    return (
                                        <button
                                            key={country.key}
                                            onClick={() => {
                                                setSelectedCountry(country.key);
                                                setShowCountrySelector(false);
                                            }}
                                            className="row ai-center gap-2"
                                            style={{
                                                padding: '8px 10px',
                                                fontSize: 13,
                                                background: isSelected ? 'var(--cobalt-50)' : 'transparent',
                                                color: isSelected ? 'var(--cobalt)' : 'var(--ink-2)',
                                                border: 'none',
                                                borderRadius: 'var(--r-2)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                width: '100%',
                                                fontWeight: isSelected ? 600 : 500,
                                                transition: 'background var(--transition-fast), color var(--transition-fast)',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.background = 'var(--bg-2)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.background = 'transparent';
                                                }
                                            }}
                                        >
                                            <span aria-hidden="true">{country.flag}</span>
                                            <span style={{ flex: 1 }}>{country.label}</span>
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 10,
                                                    color: isSelected ? 'var(--cobalt)' : 'var(--ink-4)',
                                                    letterSpacing: '0.04em',
                                                }}
                                            >
                                                {country.currency}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Search */}
            <div
                className="card-flat"
                style={{
                    padding: '4px 14px 4px 4px',
                    marginBottom: 16,
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
                        placeholder="Search 10,000+ treatments, drugs, procedures…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontFamily: 'var(--sans)',
                            fontSize: 14,
                            color: 'var(--ink)',
                            padding: '8px 0',
                            minWidth: 0,
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                            className="row ai-center center"
                            style={{
                                width: 28,
                                height: 28,
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--ink-3)',
                                fontSize: 16,
                                cursor: 'pointer',
                                flexShrink: 0,
                                borderRadius: 'var(--r-1)',
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

            {/* Filter Toggle */}
            <div className="row center" style={{ marginBottom: 12 }}>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-ghost btn-sm"
                >
                    <span
                        aria-hidden="true"
                        className="mono"
                        style={{
                            transition: 'transform var(--transition-normal)',
                            transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                            display: 'inline-block',
                        }}
                    >
                        ▾
                    </span>
                    {showFilters ? 'Hide filters' : 'Show filters'}
                </button>
            </div>

            {/* Type Filter Chips */}
            {showFilters && (
                <div
                    className="row gap-2"
                    style={{
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        marginBottom: 28,
                    }}
                >
                    {ALL_TYPES.map(type => {
                        const cfg = TYPE_CONFIG[type];
                        const isActive = activeTypes.has(type);
                        const count = categories.reduce(
                            (sum, c) => sum + c.treatments.filter(t => t.type === type).length,
                            0
                        );

                        return (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={isActive ? cfg.pill : 'pill'}
                                style={{
                                    cursor: 'pointer',
                                    textTransform: 'none',
                                    padding: '8px 12px',
                                    fontSize: 12,
                                    background: isActive ? undefined : 'var(--paper)',
                                    color: isActive ? undefined : 'var(--ink-4)',
                                    borderColor: isActive ? undefined : 'var(--rule)',
                                }}
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
                                <span className="hidden sm:inline">{cfg.label}</span>
                                <span className="sm:hidden">{cfg.shortLabel}</span>
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
            )}

            {/* No Results */}
            {filteredCategories.length === 0 && (
                <div
                    className="card col ai-center gap-3"
                    style={{ padding: '48px 24px', textAlign: 'center' }}
                >
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
                        No treatments found
                    </h3>
                    <p style={{ color: 'var(--ink-3)', margin: 0 }}>
                        Try adjusting your filters or search term.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setActiveTypes(new Set(ALL_TYPES));
                        }}
                        className="btn btn-cobalt btn-sm"
                        style={{ marginTop: 4 }}
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Specialty Accordion Sections */}
            <div className="col gap-4">
                {filteredCategories.map(category => {
                    const isExpanded = expandedSections.has(category.specialty);
                    const visibleTreatments = isExpanded
                        ? category.treatments
                        : category.treatments.slice(0, INITIAL_VISIBLE);
                    const hasMore = category.treatments.length > INITIAL_VISIBLE;

                    const typeCounts: Partial<Record<TreatmentType, number>> = {};
                    category.treatments.forEach(t => {
                        typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
                    });

                    const monogram = category.specialty
                        .split(/\s+/)
                        .map(w => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || category.specialty.slice(0, 2).toUpperCase();

                    return (
                        <section
                            key={category.specialty}
                            id={`treat-${category.specialty.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
                            className="card scroll-mt-32"
                            style={{ overflow: 'hidden' }}
                        >
                            {/* Header */}
                            <button
                                onClick={() => toggleSection(category.specialty)}
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
                                    <div
                                        className="row ai-center gap-3"
                                        style={{ flexWrap: 'wrap' }}
                                    >
                                        <span className="spec-icon" aria-hidden="true">
                                            {monogram}
                                        </span>
                                        <h2
                                            className="display"
                                            style={{
                                                fontSize: 20,
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
                                            {category.treatments.length.toLocaleString()} treatments
                                        </span>
                                    </div>

                                    {/* Type breakdown */}
                                    <div
                                        className="row gap-3"
                                        style={{ flexWrap: 'wrap', paddingLeft: 48 }}
                                    >
                                        {ALL_TYPES.map(type => {
                                            const count = typeCounts[type];
                                            if (!count) return null;
                                            const cfg = TYPE_CONFIG[type];
                                            return (
                                                <span
                                                    key={type}
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
                                                    {count} {cfg.shortLabel}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="row ai-center gap-3">
                                    <Link
                                        href={`/conditions/${category.specialty.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                        onClick={e => e.stopPropagation()}
                                        className="btn btn-paper btn-sm hidden md:inline-flex"
                                    >
                                        Conditions
                                        <span aria-hidden="true" className="mono" style={{ fontSize: 10 }}>
                                            →
                                        </span>
                                    </Link>
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
                                </div>
                            </button>

                            <div className="hairline" />

                            {/* Treatment Grid */}
                            <div style={{ padding: '20px 22px' }}>
                                <div
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                    style={{ gap: 8 }}
                                >
                                    {visibleTreatments.map((t, i) => (
                                        <TreatmentCard
                                            key={i}
                                            treatment={t}
                                            country={selectedCountry}
                                            lang={lang}
                                            baseUrl={baseUrl}
                                        />
                                    ))}
                                </div>

                                {hasMore && (
                                    <button
                                        onClick={() => toggleSection(category.specialty)}
                                        className="btn btn-paper"
                                        style={{
                                            marginTop: 14,
                                            width: '100%',
                                        }}
                                    >
                                        {isExpanded ? (
                                            <>
                                                Show less
                                                <span
                                                    aria-hidden="true"
                                                    className="mono"
                                                    style={{
                                                        transform: 'rotate(180deg)',
                                                        display: 'inline-block',
                                                    }}
                                                >
                                                    ▾
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                Show all {category.treatments.length} treatments
                                                <span aria-hidden="true" className="mono">▾</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Cost Disclaimer */}
            <div
                className="card-quiet"
                style={{
                    marginTop: 24,
                    padding: 16,
                    textAlign: 'center',
                }}
            >
                <p
                    style={{
                        fontSize: 12,
                        color: 'var(--ink-3)',
                        margin: 0,
                        lineHeight: 1.55,
                    }}
                >
                    <strong style={{ color: 'var(--ink-2)' }}>Cost disclaimer:</strong> Prices shown are estimates and may vary by hospital, insurance, and individual circumstances.
                    Contact healthcare providers directly for accurate quotes. Costs for {currentCountry.label} shown in {currentCountry.currency}.
                </p>
            </div>
        </>
    );
}
