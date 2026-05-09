'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface ReferenceCard {
    id: string;
    name: string;
    category: string;
    icon: string;
    items?: Array<{ score?: string; term?: string; description?: string }>;
    steps?: Array<{ step: number; name: string; question?: string; yes?: string; no?: string; threshold?: string; questions?: string[] }>;
    drugs?: Array<{ name: string; indication: string; dose: string; notes?: string }>;
    antidotes?: Array<{ toxin: string; antidote: string; dose: string; notes?: string }>;
    antibiotics?: Array<{ name: string; spectrum: string; covers: string[]; gaps: string[]; note?: string }>;
    modes?: Array<{ name: string; settings: Record<string, string>; targets?: Record<string, string>; use?: string }>;
    scales?: Array<{ name: string; range: string; description?: string; use?: string; interpretation?: Array<{ range: string; level: string }> | string; components?: Array<{ domain: string; scores?: string[]; range?: string }> }>;
    products?: Array<{ product: string; thresholds: Array<{ population?: string; indication?: string; threshold?: string; dose?: string; target?: string }>; dose?: string; notes?: string; content?: string }>;
    protocol?: { initiation: Array<{ glucose?: string; action?: string; starting_rate?: string }>; adjustments: Array<{ bg_range: string; action: string }>; monitoring: string };
    target?: string;
    note?: string;
    notes?: string;
    ibw_formula?: string;
    ards_protocol?: { name: string; vt: string; plateau_goal: string; peep_fio2_table: string; ph_management: string };
}

interface ReferenceData {
    cards: ReferenceCard[];
}

const CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'Sedation', name: 'Sedation' },
    { id: 'Emergency', name: 'Emergency' },
    { id: 'Toxicology', name: 'Toxicology' },
    { id: 'Infectious Disease', name: 'ID' },
    { id: 'Critical Care', name: 'ICU' },
    { id: 'Assessment', name: 'Assessment' },
    { id: 'Hematology', name: 'Hematology' },
    { id: 'Endocrine', name: 'Endocrine' },
];

export default function QuickReferencePage() {
    const [data, setData] = useState<ReferenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/data/clinical-reference.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredCards = useMemo(() => {
        if (!data) return [];
        let cards = data.cards;
        if (selectedCategory !== 'all') {
            cards = cards.filter(c => c.category === selectedCategory);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            cards = cards.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                JSON.stringify(c).toLowerCase().includes(q)
            );
        }
        return cards;
    }, [data, selectedCategory, searchQuery]);

    if (loading) {
        return (
            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }}>
                    <div className="row center" style={{ height: 256 }}>
                        <span className="mono muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loading…</span>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }} className="col gap-6">
                {/* Breadcrumb */}
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        flexWrap: 'wrap',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/for-doctors" style={{ color: 'var(--ink-3)' }}>For Doctors</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>Quick Reference</span>
                </nav>

                {/* Hero */}
                <div className="col gap-3" style={{ maxWidth: 760 }}>
                    <span className="section-mark">clinical reference</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(32px, 4.5vw, 48px)',
                            lineHeight: 1.05,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Quick reference <span style={{ color: 'var(--cobalt)' }}>cards</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 17, margin: 0, maxWidth: 600 }}>
                        Essential clinical references: scales, protocols, drug guides, and more.
                    </p>
                </div>

                {/* Search */}
                <div style={{ maxWidth: 600 }}>
                    <div className="form-group">
                        <label htmlFor="ref-search" className="form-label">Search references</label>
                        <input
                            id="ref-search"
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search references..."
                            className="input"
                        />
                    </div>
                </div>

                {/* Category filter */}
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={selectedCategory === cat.id ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
                    {filteredCards.map(card => {
                        const isExpanded = expandedCard === card.id;
                        return (
                            <div
                                key={card.id}
                                className="card"
                                style={{
                                    padding: 0,
                                    overflow: 'hidden',
                                    borderColor: isExpanded ? 'var(--cobalt)' : 'var(--rule)',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                                    className="row between ai-center"
                                    style={{
                                        width: '100%',
                                        padding: 16,
                                        textAlign: 'left',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div className="row gap-3 ai-center" style={{ minWidth: 0 }}>
                                        <span style={{ fontSize: 22, lineHeight: 1 }}>{card.icon}</span>
                                        <div className="col gap-1" style={{ minWidth: 0 }}>
                                            <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
                                                {card.name}
                                            </span>
                                            <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                {card.category}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                            transition: 'transform 200ms ease',
                                        }}
                                    >
                                        ▾
                                    </span>
                                </button>

                                {isExpanded && (
                                    <div className="col gap-3" style={{ padding: 16, paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
                                        {/* RASS / item list */}
                                        {card.items && (
                                            <div className="col gap-2">
                                                {card.items.map((item, i) => (
                                                    <div key={i} className="card-flat row gap-3 ai-start" style={{ padding: 10 }}>
                                                        <span
                                                            className="num"
                                                            style={{
                                                                fontWeight: 500,
                                                                width: 36,
                                                                textAlign: 'center',
                                                                color: (item.score?.startsWith('+') || item.score === '0') ? 'var(--lemon-2)' : 'var(--cobalt)',
                                                            }}
                                                        >
                                                            {item.score}
                                                        </span>
                                                        <div className="col">
                                                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{item.term}</span>
                                                            <span className="muted" style={{ fontSize: 12 }}>{item.description}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {card.target && (
                                                    <div className="card-flat" style={{ padding: 12, background: 'var(--cobalt-50)', borderColor: 'rgba(28, 91, 255, .22)' }}>
                                                        <span style={{ fontSize: 13, color: 'var(--cobalt)', fontWeight: 500 }}>{card.target}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Steps */}
                                        {card.steps && (
                                            <div className="col gap-3">
                                                {card.steps.map((step, i) => (
                                                    <div key={i} className="card-flat col gap-2" style={{ padding: 12 }}>
                                                        <div className="row gap-2 ai-center">
                                                            <span
                                                                className="num"
                                                                style={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    borderRadius: 999,
                                                                    background: 'var(--cobalt-50)',
                                                                    color: 'var(--cobalt)',
                                                                    fontSize: 12,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {step.step}
                                                            </span>
                                                            <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{step.name}</span>
                                                        </div>
                                                        {step.question && <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>{step.question}</p>}
                                                        {step.questions && (
                                                            <ul className="clean col gap-1">
                                                                {step.questions.map((q, j) => (
                                                                    <li key={j} className="muted" style={{ fontSize: 13 }}>• {q}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {step.threshold && (
                                                            <span className="mono" style={{ fontSize: 11, color: 'var(--lemon-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                                Threshold: {step.threshold}
                                                            </span>
                                                        )}
                                                        <div className="row gap-3 mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                            {step.yes && <span style={{ color: 'var(--mint-3)' }}>Yes → {step.yes}</span>}
                                                            {step.no && <span style={{ color: 'var(--orange-2)' }}>No → {step.no}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* ACLS drugs */}
                                        {card.drugs && (
                                            <div className="col gap-2">
                                                {card.drugs.map((drug, i) => (
                                                    <div key={i} className="card-flat col gap-1" style={{ padding: 12 }}>
                                                        <div className="row between ai-baseline gap-2">
                                                            <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{drug.name}</span>
                                                            <span className="pill pill-lemon">{drug.indication}</span>
                                                        </div>
                                                        <span className="mono num" style={{ fontSize: 13, color: 'var(--cobalt)' }}>{drug.dose}</span>
                                                        {drug.notes && <span className="muted-2" style={{ fontSize: 12 }}>{drug.notes}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Antidotes */}
                                        {card.antidotes && (
                                            <div className="col gap-2" style={{ maxHeight: 384, overflowY: 'auto' }}>
                                                {card.antidotes.map((ant, i) => (
                                                    <div key={i} className="card-flat col gap-1" style={{ padding: 12 }}>
                                                        <div className="row gap-2 ai-center">
                                                            <span style={{ fontSize: 13, color: 'var(--orange-2)', fontWeight: 500 }}>{ant.toxin}</span>
                                                            <span className="muted-2">→</span>
                                                            <span style={{ fontSize: 13, color: 'var(--mint-3)', fontWeight: 500 }}>{ant.antidote}</span>
                                                        </div>
                                                        <span className="mono num" style={{ fontSize: 13, color: 'var(--cobalt)' }}>{ant.dose}</span>
                                                        {ant.notes && <span className="muted-2" style={{ fontSize: 12 }}>{ant.notes}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Antibiotics */}
                                        {card.antibiotics && (
                                            <div className="col gap-3">
                                                {card.antibiotics.map((abx, i) => (
                                                    <div key={i} className="card-flat col gap-2" style={{ padding: 12 }}>
                                                        <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{abx.name}</span>
                                                        <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                            {abx.spectrum}
                                                        </span>
                                                        <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                                            {abx.covers.map((c, j) => (
                                                                <span key={j} className="pill pill-mint">{c}</span>
                                                            ))}
                                                        </div>
                                                        <span className="muted-2" style={{ fontSize: 12 }}>Gaps: {abx.gaps.join(', ')}</span>
                                                        {abx.note && (
                                                            <span style={{ fontSize: 12, color: 'var(--lemon-2)' }}>{abx.note}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Vent modes */}
                                        {card.modes && (
                                            <div className="col gap-3">
                                                {card.modes.map((mode, i) => (
                                                    <div key={i} className="card-flat col gap-2" style={{ padding: 12 }}>
                                                        <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{mode.name}</span>
                                                        <div className="col gap-1">
                                                            {Object.entries(mode.settings).map(([key, val]) => (
                                                                <div key={key} className="row between ai-center" style={{ fontSize: 13 }}>
                                                                    <span className="muted">{key}:</span>
                                                                    <span className="mono num" style={{ color: 'var(--cobalt)' }}>{val}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {mode.targets && (
                                                            <div className="col gap-1" style={{ paddingTop: 8, borderTop: '1px solid var(--rule)' }}>
                                                                <span className="mono muted-2" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Targets</span>
                                                                {Object.entries(mode.targets).map(([key, val]) => (
                                                                    <span key={key} style={{ fontSize: 12, color: 'var(--mint-3)' }}>
                                                                        {key}: {val}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {card.ibw_formula && (
                                                    <div className="card-flat" style={{ padding: 10, background: 'var(--lemon-50)', borderColor: 'rgba(230, 185, 40, .40)' }}>
                                                        <span style={{ fontSize: 12, color: '#8C6A00' }}>IBW: {card.ibw_formula}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Pain scales */}
                                        {card.scales && (
                                            <div className="col gap-3">
                                                {card.scales.map((scale, i) => (
                                                    <div key={i} className="card-flat col gap-2" style={{ padding: 12 }}>
                                                        <div className="row between ai-baseline gap-2">
                                                            <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{scale.name}</span>
                                                            <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                                Range: {scale.range}
                                                            </span>
                                                        </div>
                                                        {scale.description && <p className="muted" style={{ fontSize: 13, margin: 0 }}>{scale.description}</p>}
                                                        {scale.use && (
                                                            <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                                Use: {scale.use}
                                                            </span>
                                                        )}
                                                        {scale.interpretation && Array.isArray(scale.interpretation) && (
                                                            <div className="col gap-1">
                                                                {scale.interpretation.map((int, j) => (
                                                                    <div key={j} className="row between" style={{ fontSize: 13 }}>
                                                                        <span className="muted">{int.range}</span>
                                                                        <span style={{ color: 'var(--ink)' }}>{int.level}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {typeof scale.interpretation === 'string' && (
                                                            <span style={{ fontSize: 13, color: 'var(--mint-3)' }}>{scale.interpretation}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Transfusion products */}
                                        {card.products && (
                                            <div className="col gap-3">
                                                {card.products.map((prod, i) => (
                                                    <div key={i} className="card-flat col gap-2" style={{ padding: 12 }}>
                                                        <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{prod.product}</span>
                                                        <div className="col gap-1">
                                                            {prod.thresholds.map((t, j) => (
                                                                <div key={j} style={{ fontSize: 13 }}>
                                                                    <span className="muted">{t.population || t.indication}: </span>
                                                                    <span style={{ color: 'var(--cobalt)' }}>{t.threshold || t.dose}</span>
                                                                    {t.target && <span style={{ color: 'var(--mint-3)' }}> → {t.target}</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {prod.dose && <span style={{ fontSize: 12, color: 'var(--lemon-2)' }}>{prod.dose}</span>}
                                                        {prod.notes && <span className="muted-2" style={{ fontSize: 12 }}>{prod.notes}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Insulin protocol */}
                                        {card.protocol && (
                                            <div className="col gap-3">
                                                <div className="card-flat" style={{ padding: 10, background: 'var(--mint-50)', borderColor: 'rgba(40, 212, 168, .30)' }}>
                                                    <span style={{ fontSize: 13, color: 'var(--mint-3)' }}>Target: {card.target}</span>
                                                </div>
                                                <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adjustments</span>
                                                <div className="col">
                                                    {card.protocol.adjustments.map((adj, i, arr) => (
                                                        <div
                                                            key={i}
                                                            className="row between ai-center"
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            <span className="muted">BG {adj.bg_range}</span>
                                                            <span style={{ color: 'var(--cobalt)' }}>{adj.action}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="muted-2" style={{ fontSize: 12 }}>{card.protocol.monitoring}</span>
                                            </div>
                                        )}

                                        {card.notes && (
                                            <div className="card-flat" style={{ padding: 12 }}>
                                                <span className="muted" style={{ fontSize: 13 }}>{card.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredCards.length === 0 && (
                    <div className="card col gap-3 ai-center" style={{ padding: 64, textAlign: 'center' }}>
                        <span className="section-mark">no results</span>
                        <h3 className="display" style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>
                            No references found
                        </h3>
                        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                            Try a different search or category.
                        </p>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="card col gap-2" style={{ padding: 24, borderColor: 'rgba(230, 185, 40, .40)' }}>
                    <span className="kicker" style={{ color: '#8C6A00' }}>
                        <span className="dot" style={{ background: 'var(--lemon-2)' }} />clinical reference only
                    </span>
                    <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                        These references are intended as quick guides for trained medical professionals. Always verify
                        information with institutional protocols and current guidelines. Clinical judgment should guide
                        all patient care decisions.
                    </p>
                </div>
            </div>
        </main>
    );
}
