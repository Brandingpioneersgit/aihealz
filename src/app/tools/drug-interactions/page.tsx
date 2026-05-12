'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

interface Drug {
    id: string;
    name: string;
    brands: string[];
    class: string;
}

interface Interaction {
    drug1: string;
    drug2: string;
    severity: 'contraindicated' | 'severe' | 'moderate' | 'mild';
    effect: string;
    mechanism: string;
    recommendation: string;
    monitoring: string;
}

interface FoodInteraction {
    drug: string;
    food: string;
    examples: string[];
    effect: string;
    recommendation: string;
}

interface AlcoholInteraction {
    drugClass: string;
    examples: string[];
    severity: string;
    effect: string;
    recommendation: string;
}

interface DrugData {
    drugs: Drug[];
    interactions: Interaction[];
    food_interactions: FoodInteraction[];
    alcohol_interactions: AlcoholInteraction[];
}

const SEVERITY_CONFIG = {
    contraindicated: {
        label: 'Contraindicated',
        color: 'var(--sev-critical)',
        bg: 'rgba(182, 21, 21, .08)',
        border: 'rgba(182, 21, 21, .25)',
        description: 'NEVER combine — life-threatening risk.',
    },
    severe: {
        label: 'Severe',
        color: 'var(--orange-2)',
        bg: 'var(--orange-50)',
        border: 'rgba(255, 90, 46, .28)',
        description: 'Potentially dangerous — avoid if possible.',
    },
    moderate: {
        label: 'Moderate',
        color: '#8C6A00',
        bg: 'var(--lemon-50)',
        border: 'rgba(230, 185, 40, .40)',
        description: 'Use caution — monitor closely.',
    },
    mild: {
        label: 'Mild',
        color: 'var(--cobalt)',
        bg: 'var(--cobalt-50)',
        border: 'rgba(28, 91, 255, .22)',
        description: 'Minor interaction — usually safe.',
    },
};

export default function DrugInteractionsChecker() {
    const [drugData, setDrugData] = useState<DrugData | null>(null);
    const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [includeAlcohol, setIncludeAlcohol] = useState(false);

    useEffect(() => {
        fetch('/data/drug-interactions.json')
            .then(res => res.json())
            .then(data => setDrugData(data))
            .catch(console.error);
    }, []);

    const filteredDrugs = useMemo(() => {
        if (!drugData || !searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return drugData.drugs.filter(drug =>
            drug.name.toLowerCase().includes(q) ||
            drug.brands.some(b => b.toLowerCase().includes(q)) ||
            drug.class.toLowerCase().includes(q)
        ).slice(0, 10);
    }, [drugData, searchQuery]);

    const foundInteractions = useMemo(() => {
        if (!drugData || selectedDrugs.length < 2) return [];
        const interactions: Interaction[] = [];
        for (let i = 0; i < selectedDrugs.length; i++) {
            for (let j = i + 1; j < selectedDrugs.length; j++) {
                const drug1 = selectedDrugs[i];
                const drug2 = selectedDrugs[j];
                const found = drugData.interactions.find(int =>
                    (int.drug1 === drug1 && int.drug2 === drug2) ||
                    (int.drug1 === drug2 && int.drug2 === drug1)
                );
                if (found) interactions.push(found);
            }
        }
        const severityOrder = { contraindicated: 0, severe: 1, moderate: 2, mild: 3 };
        return interactions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }, [drugData, selectedDrugs]);

    const foodInteractions = useMemo(() => {
        if (!drugData) return [];
        return drugData.food_interactions.filter(fi =>
            selectedDrugs.some(d => {
                const drug = drugData.drugs.find(dd => dd.id === d);
                return drug && (
                    fi.drug.toLowerCase().includes(drug.name.toLowerCase()) ||
                    fi.drug.toLowerCase().includes(drug.class.toLowerCase())
                );
            })
        );
    }, [drugData, selectedDrugs]);

    const alcoholWarnings = useMemo(() => {
        if (!drugData || !includeAlcohol) return [];
        return drugData.alcohol_interactions.filter(ai =>
            selectedDrugs.some(d => {
                const drug = drugData.drugs.find(dd => dd.id === d);
                return drug && (
                    ai.examples.some(e => e.toLowerCase().includes(drug.name.toLowerCase())) ||
                    ai.drugClass.toLowerCase().includes(drug.class.toLowerCase())
                );
            })
        );
    }, [drugData, selectedDrugs, includeAlcohol]);

    const addDrug = (drugId: string) => {
        if (!selectedDrugs.includes(drugId)) {
            setSelectedDrugs([...selectedDrugs, drugId]);
        }
        setSearchQuery('');
        setShowSearch(false);
    };

    const removeDrug = (drugId: string) => {
        setSelectedDrugs(selectedDrugs.filter(d => d !== drugId));
    };

    const getDrugName = (id: string) => {
        return drugData?.drugs.find(d => d.id === id)?.name || id;
    };

    const getDrugBrands = (id: string) => {
        return drugData?.drugs.find(d => d.id === id)?.brands || [];
    };

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1100, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
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
                    <span style={{ color: 'var(--ink)' }}>Drug Interactions</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / drug interactions</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>Drug</span> interactions checker
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Add the medications you’re taking. We’ll surface drug-drug, food, and alcohol interactions with severity tiers and clinical guidance.
                    </p>
                </header>

                {/* ── Selected drugs + search ───────── */}
                <div className="card col gap-4" style={{ padding: 28 }}>
                    <div className="kicker"><span className="dot" />your medications</div>

                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        {selectedDrugs.map(drugId => (
                            <div
                                key={drugId}
                                className="row gap-2 ai-center"
                                style={{
                                    padding: '6px 6px 6px 12px',
                                    background: 'var(--cobalt-50)',
                                    border: '1px solid rgba(28, 91, 255, .22)',
                                    borderRadius: 'var(--r-2)',
                                }}
                            >
                                <div className="col" style={{ minWidth: 0 }}>
                                    <span style={{ fontSize: 13, fontWeight: 500 }}>{getDrugName(drugId)}</span>
                                    {getDrugBrands(drugId).length > 0 && (
                                        <span className="muted" style={{ fontSize: 11 }}>
                                            {getDrugBrands(drugId).slice(0, 2).join(', ')}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeDrug(drugId)}
                                    className="btn btn-ghost btn-sm"
                                    aria-label={`Remove ${getDrugName(drugId)}`}
                                    style={{ padding: 4 }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {selectedDrugs.length === 0 && (
                            <span className="muted" style={{ fontSize: 13 }}>No medications added yet.</span>
                        )}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by drug name or brand (e.g. Lipitor, Warfarin, Aspirin)…"
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setShowSearch(true);
                            }}
                            onFocus={() => setShowSearch(true)}
                            className="input"
                        />
                        {showSearch && filteredDrugs.length > 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--paper)',
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-2)',
                                    boxShadow: 'var(--shadow-2)',
                                    zIndex: 50,
                                    maxHeight: 320,
                                    overflowY: 'auto',
                                }}
                            >
                                {filteredDrugs.map((drug, i, arr) => (
                                    <button
                                        key={drug.id}
                                        onClick={() => addDrug(drug.id)}
                                        className="row between ai-center"
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="col" style={{ minWidth: 0 }}>
                                            <span style={{ fontSize: 14, fontWeight: 500 }}>
                                                {drug.name}{' '}
                                                <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>
                                                    ({drug.class})
                                                </span>
                                            </span>
                                            <span className="muted" style={{ fontSize: 12 }}>
                                                {drug.brands.join(', ')}
                                            </span>
                                        </div>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            Add +
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <label className="row gap-2 ai-center" style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={includeAlcohol}
                            onChange={e => setIncludeAlcohol(e.target.checked)}
                            style={{ accentColor: 'var(--cobalt)', width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                            Include alcohol interaction warnings
                        </span>
                    </label>
                </div>

                {/* ── Results ───────────────────────── */}
                {selectedDrugs.length >= 2 && (
                    <section className="col gap-5">
                        <div className="card col gap-4" style={{ padding: 28 }}>
                            <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                                <div className="kicker"><span className="dot" />drug-drug interactions</div>
                                {foundInteractions.length > 0 && (
                                    <span className="pill pill-orange">{foundInteractions.length} found</span>
                                )}
                            </div>

                            {foundInteractions.length === 0 ? (
                                <div
                                    className="col gap-2 ai-center"
                                    style={{
                                        padding: 32,
                                        background: 'var(--mint-50)',
                                        border: '1px solid rgba(40, 212, 168, .30)',
                                        borderRadius: 'var(--r-3)',
                                    }}
                                >
                                    <span
                                        className="display"
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 600,
                                            color: 'var(--mint-3)',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        No known interactions found
                                    </span>
                                    <span className="muted" style={{ fontSize: 13, textAlign: 'center' }}>
                                        These medications appear safe to take together — but always confirm with your pharmacist.
                                    </span>
                                </div>
                            ) : (
                                <div className="col gap-3">
                                    {foundInteractions.map((int, i) => {
                                        const cfg = SEVERITY_CONFIG[int.severity];
                                        return (
                                            <div
                                                key={i}
                                                style={{
                                                    padding: 20,
                                                    background: cfg.bg,
                                                    border: `1px solid ${cfg.border}`,
                                                    borderRadius: 'var(--r-3)',
                                                }}
                                                className="col gap-3"
                                            >
                                                <div className="row gap-2 ai-center" style={{ flexWrap: 'wrap' }}>
                                                    <span
                                                        className="pill"
                                                        style={{
                                                            background: cfg.bg,
                                                            color: cfg.color,
                                                            borderColor: cfg.border,
                                                        }}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                                                        {getDrugName(int.drug1)} + {getDrugName(int.drug2)}
                                                    </span>
                                                </div>
                                                <p
                                                    style={{
                                                        fontSize: 14,
                                                        color: 'var(--ink)',
                                                        margin: 0,
                                                        lineHeight: 1.55,
                                                    }}
                                                >
                                                    {int.effect}
                                                </p>
                                                <div className="col gap-2">
                                                    <Detail label="Mechanism" value={int.mechanism} />
                                                    <Detail label="Recommendation" value={int.recommendation} />
                                                    {int.monitoring && (
                                                        <Detail label="Monitor" value={int.monitoring} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {foodInteractions.length > 0 && (
                            <div className="card col gap-4" style={{ padding: 28 }}>
                                <div className="kicker"><span className="dot" />food interactions</div>
                                <div className="col gap-3">
                                    {foodInteractions.map((fi, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 18,
                                                background: 'var(--lemon-50)',
                                                border: '1px solid rgba(230, 185, 40, .40)',
                                                borderRadius: 'var(--r-3)',
                                            }}
                                            className="col gap-2"
                                        >
                                            <span style={{ fontSize: 14, fontWeight: 600 }}>Avoid: {fi.food}</span>
                                            <span className="muted" style={{ fontSize: 12 }}>
                                                Examples: {fi.examples.join(', ')}
                                            </span>
                                            <span style={{ fontSize: 13, color: '#8C6A00' }}>{fi.effect}</span>
                                            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{fi.recommendation}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {includeAlcohol && alcoholWarnings.length > 0 && (
                            <div className="card col gap-4" style={{ padding: 28 }}>
                                <div className="kicker"><span className="dot" />alcohol interactions</div>
                                <div className="col gap-3">
                                    {alcoholWarnings.map((aw, i) => {
                                        const isSevere = aw.severity === 'severe';
                                        return (
                                            <div
                                                key={i}
                                                style={{
                                                    padding: 18,
                                                    background: isSevere ? 'var(--orange-50)' : 'var(--lemon-50)',
                                                    border: `1px solid ${isSevere ? 'rgba(255, 90, 46, .28)' : 'rgba(230, 185, 40, .40)'}`,
                                                    borderRadius: 'var(--r-3)',
                                                }}
                                                className="col gap-2"
                                            >
                                                <div className="row gap-2 ai-center">
                                                    <span className={isSevere ? 'pill pill-orange' : 'pill pill-lemon'}>
                                                        {aw.severity}
                                                    </span>
                                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{aw.drugClass}</span>
                                                </div>
                                                <span style={{ fontSize: 14, color: 'var(--ink)' }}>{aw.effect}</span>
                                                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{aw.recommendation}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {selectedDrugs.length === 1 && (
                    <div
                        className="card-flat col gap-2 ai-center"
                        style={{ padding: 32, textAlign: 'center' }}
                    >
                        <span
                            className="display"
                            style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}
                        >
                            Add a second medication to check interactions
                        </span>
                        <span className="muted" style={{ fontSize: 13 }}>
                            Drug interaction checking requires at least two medications.
                        </span>
                    </div>
                )}

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Medical disclaimer.</strong> This tool provides general information and is not a substitute for professional medical advice. Always consult your doctor or pharmacist about your specific medications. The database may not include all possible interactions.
                    </p>
                </div>
            </div>
        </main>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ fontSize: 13, lineHeight: 1.55 }}>
            <span
                className="mono"
                style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--ink-3)',
                    marginRight: 6,
                }}
            >
                {label}:
            </span>
            <span style={{ color: 'var(--ink-2)' }}>{value}</span>
        </div>
    );
}
