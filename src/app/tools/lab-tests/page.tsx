'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface LabTest {
    id: string;
    name: string;
    category: string;
    description: string;
    fasting: boolean;
    turnaround: string;
    components: any[];
    costs: Record<string, { min: number; max: number }>;
    interpretation?: Record<string, string>;
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface LabData {
    categories: Category[];
    tests: LabTest[];
}

type CountryKey = 'usa' | 'uk' | 'india' | 'thailand' | 'mexico' | 'turkey' | 'uae';

const COUNTRIES: { key: CountryKey; label: string; flag: string; currency: string; symbol: string }[] = [
    { key: 'usa', label: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$' },
    { key: 'uk', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
    { key: 'india', label: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹' },
    { key: 'thailand', label: 'Thailand', flag: '🇹🇭', currency: 'THB', symbol: '฿' },
    { key: 'mexico', label: 'Mexico', flag: '🇲🇽', currency: 'MXN', symbol: '$' },
    { key: 'turkey', label: 'Turkey', flag: '🇹🇷', currency: 'TRY', symbol: '₺' },
    { key: 'uae', label: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ' },
];

const TZ_COUNTRY_MAP: Record<string, CountryKey> = {
    'Asia/Kolkata': 'india', 'Asia/Calcutta': 'india',
    'America/New_York': 'usa', 'America/Los_Angeles': 'usa', 'America/Chicago': 'usa', 'America/Denver': 'usa',
    'Europe/London': 'uk',
    'Asia/Dubai': 'uae',
    'Asia/Bangkok': 'thailand',
    'America/Mexico_City': 'mexico',
    'Europe/Istanbul': 'turkey',
};

function detectUserCountry(): CountryKey {
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/aihealz-geo=([^;:]+)/);
        if (match) {
            const country = match[1].split(':')[0];
            const countryMap: Record<string, CountryKey> = {
                'india': 'india', 'usa': 'usa', 'uk': 'uk',
                'uae': 'uae', 'thailand': 'thailand', 'mexico': 'mexico', 'turkey': 'turkey'
            };
            if (countryMap[country]) return countryMap[country];
        }
    }
    if (typeof Intl !== 'undefined') {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (TZ_COUNTRY_MAP[tz]) return TZ_COUNTRY_MAP[tz];
    }
    return 'usa';
}

export default function LabTestsDirectory() {
    const [labData, setLabData] = useState<LabData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<CountryKey>('usa');
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [expandedTest, setExpandedTest] = useState<string | null>(null);

    useEffect(() => {
        setSelectedCountry(detectUserCountry());
        fetch('/data/lab-tests.json')
            .then(res => res.json())
            .then(data => setLabData(data))
            .catch(console.error);
    }, []);

    const filteredTests = useMemo(() => {
        if (!labData) return [];
        let tests = labData.tests;
        if (selectedCategory) {
            tests = tests.filter(t => t.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            tests = tests.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.components.some((c: any) => c.name?.toLowerCase().includes(q))
            );
        }
        return tests;
    }, [labData, searchQuery, selectedCategory]);

    const currentCountry = COUNTRIES.find(c => c.key === selectedCountry)!;

    const formatCost = (costs: Record<string, { min: number; max: number }>, country: CountryKey) => {
        const cost = costs[country];
        if (!cost) return 'N/A';
        const countryInfo = COUNTRIES.find(c => c.key === country)!;
        return `${countryInfo.symbol}${cost.min} – ${countryInfo.symbol}${cost.max}`;
    };

    if (!labData) {
        return (
            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '60vh' }}>
                <div
                    style={{
                        maxWidth: 1280,
                        margin: '0 auto',
                        padding: '64px 28px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        Loading lab tests…
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px 80px' }}
                className="col gap-6"
            >
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/tools">Tools</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>Lab Tests</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / lab test directory</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5vw, 72px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        <span className="num" style={{ color: 'var(--cobalt)' }}>{labData.tests.length}+</span>{' '}
                        lab tests
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Normal ranges, what each value means, country-by-country cost. Search by test name or component.
                    </p>
                </header>

                {/* Controls */}
                <div className="card col gap-4" style={{ padding: 24 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 12,
                        }}
                        className="lt-controls"
                    >
                        <input
                            type="text"
                            placeholder="Search tests (e.g. CBC, thyroid, cholesterol)…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input"
                        />
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowCountrySelector(!showCountrySelector)}
                                className="btn btn-paper"
                                style={{ minHeight: 42 }}
                            >
                                {currentCountry.flag} {currentCountry.label}
                                <span style={{ marginLeft: 6 }}>▾</span>
                            </button>
                            {showCountrySelector && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        right: 0,
                                        background: 'var(--paper)',
                                        border: '1px solid var(--rule)',
                                        borderRadius: 'var(--r-2)',
                                        boxShadow: 'var(--shadow-2)',
                                        zIndex: 50,
                                        minWidth: 220,
                                        padding: '6px 0',
                                    }}
                                >
                                    <div
                                        className="mono"
                                        style={{
                                            padding: '8px 14px',
                                            fontSize: 10,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        Price in
                                    </div>
                                    {COUNTRIES.map(country => (
                                        <button
                                            key={country.key}
                                            onClick={() => {
                                                setSelectedCountry(country.key);
                                                setShowCountrySelector(false);
                                            }}
                                            className="row between ai-center"
                                            style={{
                                                width: '100%',
                                                padding: '8px 14px',
                                                background:
                                                    selectedCountry === country.key
                                                        ? 'var(--cobalt-50)'
                                                        : 'transparent',
                                                color:
                                                    selectedCountry === country.key
                                                        ? 'var(--cobalt)'
                                                        : 'var(--ink-2)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: 13,
                                                textAlign: 'left',
                                            }}
                                        >
                                            <span>
                                                {country.flag} {country.label}
                                            </span>
                                            <span
                                                className="mono"
                                                style={{ fontSize: 11, color: 'var(--ink-4)' }}
                                            >
                                                {country.currency}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col gap-2">
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--ink-3)',
                            }}
                        >
                            Category
                        </span>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={!selectedCategory ? 'pill pill-cobalt' : 'pill'}
                                style={{ cursor: 'pointer' }}
                            >
                                All ({labData.tests.length})
                            </button>
                            {labData.categories.map(cat => {
                                const count = labData.tests.filter(t => t.category === cat.id).length;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() =>
                                            setSelectedCategory(cat.id === selectedCategory ? null : cat.id)
                                        }
                                        className={selectedCategory === cat.id ? 'pill pill-cobalt' : 'pill'}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {cat.name} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    Showing {filteredTests.length} of {labData.tests.length} tests
                </div>

                {/* Tests list */}
                <div
                    style={{
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--r-3)',
                        background: 'var(--paper)',
                        overflow: 'hidden',
                    }}
                >
                    {filteredTests.map((test, idx, arr) => {
                        const isExpanded = expandedTest === test.id;
                        const category = labData.categories.find(c => c.id === test.category);
                        return (
                            <div
                                key={test.id}
                                style={{
                                    borderBottom: idx < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                }}
                            >
                                <button
                                    onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                                    style={{
                                        width: '100%',
                                        padding: '20px 22px',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div className="row between ai-center" style={{ gap: 16, flexWrap: 'wrap' }}>
                                        <div className="col gap-1" style={{ minWidth: 0, flex: 1 }}>
                                            <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                                                <span
                                                    className="display"
                                                    style={{
                                                        fontSize: 18,
                                                        fontWeight: 600,
                                                        letterSpacing: '-0.015em',
                                                    }}
                                                >
                                                    {test.name}
                                                </span>
                                                {category && (
                                                    <span className="pill">{category.name}</span>
                                                )}
                                            </div>
                                            <span
                                                className="muted"
                                                style={{ fontSize: 13, lineHeight: 1.55 }}
                                            >
                                                {test.description}
                                            </span>
                                            <div className="row gap-3" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                                                {test.fasting && (
                                                    <span className="pill pill-lemon">fasting required</span>
                                                )}
                                                <span
                                                    className="mono"
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--ink-3)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    Results: {test.turnaround}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col ai-end gap-1">
                                            <span
                                                className="num display"
                                                style={{
                                                    fontSize: 18,
                                                    fontWeight: 600,
                                                    color: 'var(--cobalt)',
                                                    letterSpacing: '-0.02em',
                                                }}
                                            >
                                                {formatCost(test.costs, selectedCountry)}
                                            </span>
                                            <span
                                                className="mono"
                                                style={{ fontSize: 10, color: 'var(--ink-4)' }}
                                            >
                                                {currentCountry.currency} · {isExpanded ? 'COLLAPSE ▴' : 'EXPAND ▾'}
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div
                                        className="col gap-5"
                                        style={{
                                            padding: '0 22px 22px',
                                        }}
                                    >
                                        <div className="hairline" />

                                        {/* Components */}
                                        <div className="col gap-2">
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 11,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    color: 'var(--ink-3)',
                                                }}
                                            >
                                                Components &amp; normal ranges
                                            </span>
                                            <div
                                                style={{
                                                    border: '1px solid var(--rule)',
                                                    borderRadius: 'var(--r-2)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <table className="w-full" style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                                                    <caption className="sr-only">
                                                        Lab test components and normal reference ranges
                                                    </caption>
                                                    <thead>
                                                        <tr style={{ background: 'var(--bg-2)' }}>
                                                            <th
                                                                scope="col"
                                                                className="mono"
                                                                style={{
                                                                    textAlign: 'left',
                                                                    padding: '10px 14px',
                                                                    fontSize: 11,
                                                                    fontWeight: 500,
                                                                    color: 'var(--ink-3)',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.08em',
                                                                }}
                                                            >
                                                                Component
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="mono"
                                                                style={{
                                                                    textAlign: 'left',
                                                                    padding: '10px 14px',
                                                                    fontSize: 11,
                                                                    fontWeight: 500,
                                                                    color: 'var(--ink-3)',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.08em',
                                                                }}
                                                            >
                                                                Normal range
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="mono"
                                                                style={{
                                                                    textAlign: 'left',
                                                                    padding: '10px 14px',
                                                                    fontSize: 11,
                                                                    fontWeight: 500,
                                                                    color: 'var(--ink-3)',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.08em',
                                                                }}
                                                            >
                                                                Unit
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {test.components.map((comp: any, i: number) => (
                                                            <tr
                                                                key={i}
                                                                style={{
                                                                    borderTop: '1px solid var(--rule)',
                                                                }}
                                                            >
                                                                <td style={{ padding: '10px 14px', color: 'var(--ink)' }}>
                                                                    {comp.name}
                                                                </td>
                                                                <td style={{ padding: '10px 14px', color: 'var(--ink-2)' }}>
                                                                    {comp.range && `${comp.range.low} – ${comp.range.high}`}
                                                                    {comp.male && `M: ${comp.male.low}-${comp.male.high}`}
                                                                    {comp.female && ` | F: ${comp.female.low}-${comp.female.high}`}
                                                                    {comp.normal && typeof comp.normal === 'string' && comp.normal}
                                                                    {comp.optimal && `< ${comp.optimal.high} (optimal)`}
                                                                </td>
                                                                <td
                                                                    className="mono"
                                                                    style={{ padding: '10px 14px', color: 'var(--ink-3)' }}
                                                                >
                                                                    {comp.unit || '—'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Interpretation */}
                                        {test.interpretation && (
                                            <div className="col gap-2">
                                                <span
                                                    className="mono"
                                                    style={{
                                                        fontSize: 11,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                        color: 'var(--ink-3)',
                                                    }}
                                                >
                                                    What results mean
                                                </span>
                                                <div className="col gap-2">
                                                    {Object.entries(test.interpretation).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="row gap-3 ai-start"
                                                            style={{ fontSize: 13, color: 'var(--ink-2)' }}
                                                        >
                                                            <span
                                                                style={{
                                                                    flexShrink: 0,
                                                                    marginTop: 6,
                                                                    width: 6,
                                                                    height: 6,
                                                                    background: 'var(--cobalt)',
                                                                    borderRadius: 999,
                                                                }}
                                                            />
                                                            <div style={{ lineHeight: 1.55 }}>
                                                                <span
                                                                    style={{
                                                                        color: 'var(--ink)',
                                                                        fontWeight: 500,
                                                                        textTransform: 'capitalize',
                                                                    }}
                                                                >
                                                                    {key.replace(/_/g, ' ')}:
                                                                </span>{' '}
                                                                {value as string}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cost comparison */}
                                        <div className="col gap-2">
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 11,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    color: 'var(--ink-3)',
                                                }}
                                            >
                                                Cost by country
                                            </span>
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                                    gap: 0,
                                                    border: '1px solid var(--rule)',
                                                    borderRadius: 'var(--r-2)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {COUNTRIES.map((country, i, arr) => (
                                                    <div
                                                        key={country.key}
                                                        className="col gap-1 ai-center"
                                                        style={{
                                                            padding: '12px 8px',
                                                            background:
                                                                country.key === selectedCountry
                                                                    ? 'var(--cobalt-50)'
                                                                    : 'var(--paper)',
                                                            borderRight:
                                                                i < arr.length - 1
                                                                    ? '1px solid var(--rule)'
                                                                    : 'none',
                                                        }}
                                                    >
                                                        <span style={{ fontSize: 18 }}>{country.flag}</span>
                                                        <span
                                                            className="mono"
                                                            style={{ fontSize: 10, color: 'var(--ink-3)' }}
                                                        >
                                                            {country.currency}
                                                        </span>
                                                        <span
                                                            className="num"
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 500,
                                                                color:
                                                                    country.key === selectedCountry
                                                                        ? 'var(--cobalt)'
                                                                        : 'var(--ink)',
                                                            }}
                                                        >
                                                            {formatCost(test.costs, country.key)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredTests.length === 0 && (
                    <div
                        className="card-flat col gap-2 ai-center"
                        style={{ padding: 48, textAlign: 'center' }}
                    >
                        <span
                            className="display"
                            style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}
                        >
                            No tests found
                        </span>
                        <span className="muted" style={{ fontSize: 14 }}>
                            Try adjusting your search or filters.
                        </span>
                    </div>
                )}

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Note.</strong> Normal ranges may vary slightly between laboratories. Costs are estimates and vary by facility. Always consult your healthcare provider for result interpretation.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 720px) {
                    .lt-controls { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </main>
    );
}
