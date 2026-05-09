'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface RenalAdjustment {
    crcl_min: number;
    crcl_max: number;
    adjustment: string;
}

interface DrugCalculation {
    type: string;
    dose?: string;
    dose_per_kg?: number;
    unit?: string;
    frequency?: string;
    route?: string;
    label?: string;
    min_mcg_kg_min?: number;
    max_mcg_kg_min?: number;
    min_mcg_kg_hr?: number;
    max_mcg_kg_hr?: number;
    typical_start?: number;
}

interface Drug {
    id: string;
    name: string;
    category: string;
    class: string;
    standard_dose: string;
    loading_dose?: string;
    max_dose?: string;
    calculations: DrugCalculation[];
    renal_adjustments?: RenalAdjustment[];
    monitoring?: string;
    notes?: string;
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface DosingData {
    categories: Category[];
    drugs: Drug[];
}

export default function DrugDosingPage() {
    const [data, setData] = useState<DosingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
    const [weight, setWeight] = useState<number>(70);
    const [age, setAge] = useState<number>(50);
    const [scr, setScr] = useState<number>(1.0);
    const [sex, setSex] = useState<'male' | 'female'>('male');
    const [showCrCl, setShowCrCl] = useState(false);

    useEffect(() => {
        fetch('/data/drug-dosing.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredDrugs = useMemo(() => {
        if (!data) return [];
        if (selectedCategory === 'all') return data.drugs;
        return data.drugs.filter(d => d.category === selectedCategory);
    }, [data, selectedCategory]);

    const currentDrug = data?.drugs.find(d => d.id === selectedDrug);

    // Cockcroft-Gault — DO NOT alter
    const crcl = useMemo(() => {
        const factor = sex === 'female' ? 0.85 : 1;
        return Math.round(((140 - age) * weight * factor) / (72 * scr));
    }, [age, weight, scr, sex]);

    const renalAdjustment = useMemo(() => {
        if (!currentDrug?.renal_adjustments) return null;
        return currentDrug.renal_adjustments.find(
            adj => crcl >= adj.crcl_min && crcl <= adj.crcl_max
        );
    }, [currentDrug, crcl]);

    const calculateDose = (calc: DrugCalculation) => {
        if (calc.type === 'weight_based' && calc.dose_per_kg) {
            const dose = calc.dose_per_kg * weight;
            return `${dose.toFixed(0)} ${calc.unit || 'mg'} ${calc.frequency || ''} ${calc.route || ''}`;
        }
        if (calc.type === 'fixed') {
            return `${calc.dose} ${calc.frequency || ''} ${calc.route || ''}`;
        }
        if (calc.type === 'infusion_range') {
            if (calc.min_mcg_kg_min !== undefined) {
                const minRate = calc.min_mcg_kg_min * weight * 60;
                const maxRate = (calc.max_mcg_kg_min || 0) * weight * 60;
                return `${calc.min_mcg_kg_min}-${calc.max_mcg_kg_min} mcg/kg/min (${(minRate/1000).toFixed(1)}-${(maxRate/1000).toFixed(1)} mg/hr for ${weight}kg)`;
            }
            if (calc.min_mcg_kg_hr !== undefined) {
                const minRate = calc.min_mcg_kg_hr * weight;
                const maxRate = (calc.max_mcg_kg_hr || 0) * weight;
                return `${calc.min_mcg_kg_hr}-${calc.max_mcg_kg_hr} mcg/kg/hr (${minRate.toFixed(0)}-${maxRate.toFixed(0)} mcg/hr for ${weight}kg)`;
            }
        }
        return calc.dose || '';
    };

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
                    <span style={{ color: 'var(--ink)' }}>Drug Dosing</span>
                </nav>

                {/* Hero */}
                <div className="col gap-3" style={{ maxWidth: 760 }}>
                    <span className="section-mark">clinical calculator</span>
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
                        Drug dosing <span style={{ color: 'var(--cobalt)' }}>calculator</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 17, margin: 0, maxWidth: 600 }}>
                        Weight-based dosing, renal adjustments, and infusion rate calculations.
                    </p>
                </div>

                {/* Patient parameters */}
                <div className="card col gap-4" style={{ padding: 24 }}>
                    <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 8 }}>
                        <span className="kicker"><span className="dot" />patient parameters</span>
                        <button
                            type="button"
                            onClick={() => setShowCrCl(!showCrCl)}
                            className="mono"
                            style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'transparent', border: 'none' }}
                        >
                            {showCrCl ? '× Hide' : '+ Show'} CrCl calculator
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Weight (kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={e => setWeight(Number(e.target.value))}
                                className="input"
                            />
                        </div>
                        {showCrCl && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Age (years)</label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={e => setAge(Number(e.target.value))}
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">SCr (mg/dL)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={scr}
                                        onChange={e => setScr(Number(e.target.value))}
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sex</label>
                                    <select
                                        value={sex}
                                        onChange={e => setSex(e.target.value as 'male' | 'female')}
                                        className="select"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                    {showCrCl && (
                        <div className="card-flat row between ai-center" style={{ padding: 16, flexWrap: 'wrap', gap: 12, background: 'var(--cobalt-50)', borderColor: 'rgba(28, 91, 255, .22)' }}>
                            <div className="col gap-1">
                                <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--cobalt)' }}>
                                    Creatinine clearance (Cockcroft-Gault)
                                </span>
                                <span className="mono muted-2" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    CrCl = [(140-age) × weight × (0.85 if female)] / (72 × SCr)
                                </span>
                            </div>
                            <span className="bignum" style={{ fontSize: 32, color: 'var(--ink)' }}>
                                {crcl} <span className="mono muted" style={{ fontSize: 14 }}>mL/min</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Category filter */}
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={selectedCategory === 'all' ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                    >
                        All drugs
                    </button>
                    {data?.categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={selectedCategory === cat.id ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                        >
                            <span style={{ marginRight: 6 }}>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="row gap-6 ai-start" style={{ flexWrap: 'wrap' }}>
                    {/* Drug list */}
                    <div className="col gap-2" style={{ flex: '1 1 280px', minWidth: 260, maxHeight: 700, overflowY: 'auto' }}>
                        {filteredDrugs.map(drug => {
                            const cat = data?.categories.find(c => c.id === drug.category);
                            const isActive = selectedDrug === drug.id;
                            return (
                                <button
                                    key={drug.id}
                                    type="button"
                                    onClick={() => setSelectedDrug(drug.id)}
                                    className="card row gap-3 ai-center"
                                    style={{
                                        padding: 14,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        borderColor: isActive ? 'var(--cobalt)' : 'var(--rule)',
                                        background: isActive ? 'var(--cobalt-50)' : 'var(--paper)',
                                        width: '100%',
                                    }}
                                >
                                    <span style={{ fontSize: 18, lineHeight: 1 }}>{cat?.icon}</span>
                                    <div className="col" style={{ flex: 1, minWidth: 0 }}>
                                        <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
                                            {drug.name}
                                        </span>
                                        <span className="muted-2" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {drug.class}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Drug details */}
                    <div className="col" style={{ flex: '2 1 600px', minWidth: 0 }}>
                        {!currentDrug ? (
                            <div className="card col gap-3 ai-center" style={{ padding: 64, textAlign: 'center' }}>
                                <span className="section-mark">select a drug</span>
                                <h3 className="display" style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>
                                    Choose a drug
                                </h3>
                                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                    Pick a medication from the list to view dosing information.
                                </p>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Drug header */}
                                <div className="col gap-2" style={{ padding: 24, borderBottom: '1px solid var(--rule)' }}>
                                    <h2 className="display" style={{ fontSize: 26, margin: 0, fontWeight: 600, letterSpacing: '-0.035em' }}>
                                        {currentDrug.name}
                                    </h2>
                                    <span className="mono" style={{ fontSize: 12, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        {currentDrug.class}
                                    </span>
                                    <p className="muted" style={{ fontSize: 14, margin: 0 }}>{currentDrug.standard_dose}</p>
                                    <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                                        {currentDrug.loading_dose && (
                                            <span className="pill pill-lemon">Loading: {currentDrug.loading_dose}</span>
                                        )}
                                        {currentDrug.max_dose && (
                                            <span className="pill pill-orange">Max: {currentDrug.max_dose}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Calculated doses */}
                                <div className="col gap-3" style={{ padding: 24, borderBottom: '1px solid var(--rule)' }}>
                                    <span className="kicker"><span className="dot" />calculated for {weight} kg</span>
                                    <div className="col gap-2">
                                        {currentDrug.calculations.map((calc, i) => (
                                            <div key={i} className="card-flat col gap-1" style={{ padding: 14 }}>
                                                {calc.label && (
                                                    <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                        {calc.label}
                                                    </span>
                                                )}
                                                <span className="display" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                                                    {calculateDose(calc)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Renal adjustments */}
                                {currentDrug.renal_adjustments && (
                                    <div className="col gap-3" style={{ padding: 24, borderBottom: '1px solid var(--rule)' }}>
                                        <span className="kicker"><span className="dot" />renal dose adjustments</span>
                                        <div className="col">
                                            {currentDrug.renal_adjustments.map((adj, i, arr) => {
                                                const isCurrent = showCrCl && crcl >= adj.crcl_min && crcl <= adj.crcl_max;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="row between ai-center"
                                                        style={{
                                                            padding: '10px 14px',
                                                            borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                                            background: isCurrent ? 'var(--cobalt-50)' : 'transparent',
                                                            borderLeft: isCurrent ? '2px solid var(--cobalt)' : '2px solid transparent',
                                                        }}
                                                    >
                                                        <span className="muted" style={{ fontSize: 13 }}>
                                                            CrCl {adj.crcl_min}-{adj.crcl_max === 999 ? '∞' : adj.crcl_max} mL/min
                                                        </span>
                                                        <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: isCurrent ? 500 : 400 }}>
                                                            {adj.adjustment}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {showCrCl && renalAdjustment && (
                                            <div className="card-flat" style={{ padding: 14, background: 'var(--lemon-50)', borderColor: 'rgba(230, 185, 40, .40)' }}>
                                                <span style={{ fontSize: 14, color: '#8C6A00', fontWeight: 500 }}>
                                                    For CrCl {crcl} mL/min: {renalAdjustment.adjustment}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Monitoring */}
                                {currentDrug.monitoring && (
                                    <div className="col gap-2" style={{ padding: 24, borderBottom: '1px solid var(--rule)' }}>
                                        <span className="kicker"><span className="dot" />monitoring</span>
                                        <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0, lineHeight: 1.55 }}>{currentDrug.monitoring}</p>
                                    </div>
                                )}

                                {/* Notes */}
                                {currentDrug.notes && (
                                    <div className="col gap-2" style={{ padding: 24 }}>
                                        <span className="kicker"><span className="dot" />clinical notes</span>
                                        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>{currentDrug.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="card col gap-2" style={{ padding: 24, borderColor: 'rgba(255, 90, 46, .28)' }}>
                    <span className="kicker" style={{ color: 'var(--orange-2)' }}>
                        <span className="dot" style={{ background: 'var(--orange)' }} />verify all doses
                    </span>
                    <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                        This calculator is intended for use by healthcare professionals as a reference tool only.
                        Always verify doses with current prescribing information, institutional protocols, and clinical
                        judgment. Consider patient-specific factors including hepatic function, drug interactions, and
                        clinical status.
                    </p>
                </div>
            </div>
        </main>
    );
}
