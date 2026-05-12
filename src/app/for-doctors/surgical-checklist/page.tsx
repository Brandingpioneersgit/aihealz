'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface ChecklistItem {
    id: string;
    text: string;
    critical: boolean;
    details?: string;
    type?: 'question' | 'verbal';
    options?: string[];
    prompts?: string[];
}

interface Phase {
    id: string;
    name: string;
    timing: string;
    color: string;
    personnel: string[];
    items: ChecklistItem[];
}

interface AdditionalCheck {
    name: string;
    items: string[];
}

interface ChecklistData {
    version: string;
    reference: string;
    phases: Phase[];
    additional_checks: Record<string, AdditionalCheck>;
}

// Map raw phase color tokens → Bureau accent vars
const PHASE_ACCENT: Record<string, { bar: string; pillClass: string; text: string }> = {
    amber: { bar: 'var(--lemon-2)', pillClass: 'pill pill-lemon', text: '#8C6A00' },
    red: { bar: 'var(--orange)', pillClass: 'pill pill-orange', text: 'var(--orange-2)' },
    green: { bar: 'var(--mint)', pillClass: 'pill pill-mint', text: 'var(--mint-3)' },
};

export default function SurgicalChecklistPage() {
    const [data, setData] = useState<ChecklistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [patientInfo, setPatientInfo] = useState({ name: '', dob: '', procedure: '', surgeon: '' });
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [completionModal, setCompletionModal] = useState<{ isOpen: boolean; completionTime: string }>({ isOpen: false, completionTime: '' });

    useMemo(() => {
        fetch('/data/surgical-safety-checklist.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const phase = data?.phases[currentPhase];
    const accent = phase ? PHASE_ACCENT[phase.color] || PHASE_ACCENT.amber : PHASE_ACCENT.amber;

    const getPhaseProgress = (phaseId: string) => {
        const p = data?.phases.find(ph => ph.id === phaseId);
        if (!p) return { total: 0, checked: 0, percent: 0 };
        const total = p.items.length;
        const checked = p.items.filter(item => checkedItems.has(item.id)).length;
        return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 };
    };

    const toggleItem = (itemId: string) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(itemId)) {
            newChecked.delete(itemId);
        } else {
            newChecked.add(itemId);
        }
        setCheckedItems(newChecked);
    };

    const startChecklist = () => {
        setStartTime(new Date());
        setCurrentPhase(0);
        setCheckedItems(new Set());
        setResponses({});
    };

    const resetChecklist = () => {
        setStartTime(null);
        setCurrentPhase(0);
        setCheckedItems(new Set());
        setResponses({});
        setPatientInfo({ name: '', dob: '', procedure: '', surgeon: '' });
    };

    const isPhaseComplete = (phaseId: string) => {
        const p = data?.phases.find(ph => ph.id === phaseId);
        if (!p) return false;
        return p.items.filter(i => i.critical).every(item => checkedItems.has(item.id));
    };

    if (loading) {
        return (
            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)' }}>
                    <div className="row center" style={{ height: 256 }}>
                        <span className="mono muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loading…</span>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <>
            {/* Completion modal */}
            {completionModal.isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setCompletionModal({ isOpen: false, completionTime: '' })}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(10, 26, 47, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 500,
                        padding: 16,
                    }}
                >
                    <div className="card col gap-4 ai-center" style={{ padding: 32, maxWidth: 440, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <span className="pill pill-mint">
                            <span className="pill-dot" style={{ background: 'var(--mint)' }} aria-hidden="true" />
                            Complete
                        </span>
                        <h3 className="display" style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>
                            Checklist complete
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h3>
                        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                            All phases of the Surgical Safety Checklist have been verified.
                        </p>
                        <div className="card-quiet col gap-1 ai-center" style={{ padding: 16, width: '100%' }}>
                            <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Completion time</span>
                            <span className="num" style={{ fontSize: 18, color: 'var(--mint-3)', fontWeight: 500 }}>{completionModal.completionTime}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCompletionModal({ isOpen: false, completionTime: '' })}
                            className="btn btn-cobalt"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
                <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)' }} className="col gap-6">
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
                        <span style={{ color: 'var(--ink)' }}>Surgical Safety Checklist</span>
                    </nav>

                    {/* Hero */}
                    <div className="col gap-3" style={{ maxWidth: 760 }}>
                        <span className="section-mark">who safe surgery</span>
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
                            Surgical safety <span style={{ color: 'var(--cobalt)' }}>checklist</span>
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="muted mono" style={{ fontSize: 12, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {data?.version} · {data?.reference}
                        </p>
                    </div>

                    {!startTime ? (
                        /* Pre-start screen */
                        <div className="card col gap-5" style={{ padding: 28 }}>
                            <h2 className="display" style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>
                                Patient information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="ptName">Patient name</label>
                                    <input
                                        id="ptName"
                                        type="text"
                                        value={patientInfo.name}
                                        onChange={e => setPatientInfo(p => ({ ...p, name: e.target.value }))}
                                        className="input"
                                        placeholder="Enter patient name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="ptDob">Date of birth</label>
                                    <input
                                        id="ptDob"
                                        type="date"
                                        value={patientInfo.dob}
                                        onChange={e => setPatientInfo(p => ({ ...p, dob: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="ptProc">Procedure</label>
                                    <input
                                        id="ptProc"
                                        type="text"
                                        value={patientInfo.procedure}
                                        onChange={e => setPatientInfo(p => ({ ...p, procedure: e.target.value }))}
                                        className="input"
                                        placeholder="Enter planned procedure"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="ptSurg">Surgeon</label>
                                    <input
                                        id="ptSurg"
                                        type="text"
                                        value={patientInfo.surgeon}
                                        onChange={e => setPatientInfo(p => ({ ...p, surgeon: e.target.value }))}
                                        className="input"
                                        placeholder="Enter surgeon name"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={startChecklist}
                                disabled={!patientInfo.name || !patientInfo.procedure}
                                className="btn btn-cobalt btn-lg"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                Begin safety checklist →
                            </button>

                            {/* Phases overview */}
                            <div className="col gap-3" style={{ paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
                                <span className="kicker"><span className="dot" />checklist phases</span>
                                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
                                    {data?.phases.map(p => {
                                        const a = PHASE_ACCENT[p.color] || PHASE_ACCENT.amber;
                                        return (
                                            <div key={p.id} className="card-flat col gap-1" style={{ padding: 14 }}>
                                                <div className="row gap-2 ai-center">
                                                    <span style={{ width: 8, height: 8, background: a.bar, borderRadius: 999 }} aria-hidden="true" />
                                                    <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{p.name}</span>
                                                </div>
                                                <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.timing}</span>
                                                <span className="muted-2" style={{ fontSize: 12 }}>
                                                    {p.items.length} items · {p.items.filter(i => i.critical).length} critical
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Patient banner */}
                            <div className="card-flat row between ai-center" style={{ padding: 16, flexWrap: 'wrap', gap: 16 }}>
                                <div className="row gap-5" style={{ flexWrap: 'wrap' }}>
                                    <div className="col">
                                        <span className="mono muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Patient</span>
                                        <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{patientInfo.name}</span>
                                    </div>
                                    <div className="col">
                                        <span className="mono muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>DOB</span>
                                        <span style={{ fontSize: 14, color: 'var(--ink)' }}>{patientInfo.dob || '—'}</span>
                                    </div>
                                    <div className="col">
                                        <span className="mono muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Procedure</span>
                                        <span style={{ fontSize: 14, color: 'var(--ink)' }}>{patientInfo.procedure}</span>
                                    </div>
                                </div>
                                <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Started: {startTime.toLocaleTimeString()}
                                </span>
                            </div>

                            {/* Phase navigation */}
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                {data?.phases.map((p, i) => {
                                    const a = PHASE_ACCENT[p.color] || PHASE_ACCENT.amber;
                                    const progress = getPhaseProgress(p.id);
                                    const complete = isPhaseComplete(p.id);
                                    const isActive = currentPhase === i;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setCurrentPhase(i)}
                                            className="card col gap-2"
                                            style={{
                                                flex: 1,
                                                minWidth: 200,
                                                padding: 14,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                borderColor: isActive ? 'var(--cobalt)' : 'var(--rule)',
                                                background: isActive ? 'var(--cobalt-50)' : 'var(--paper)',
                                            }}
                                        >
                                            <div className="row between ai-center gap-2">
                                                <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{p.name}</span>
                                                {complete && <span style={{ color: 'var(--mint-3)', fontWeight: 600 }}>✓</span>}
                                            </div>
                                            <div style={{ height: 4, background: 'var(--rule)', borderRadius: 999, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${progress.percent}%`, background: a.bar, transition: 'width 200ms ease' }} />
                                            </div>
                                            <span className="mono muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                {progress.checked}/{progress.total}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Current phase */}
                            {phase && (
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div
                                        className="row between ai-center"
                                        style={{
                                            padding: 20,
                                            borderBottom: '1px solid var(--rule)',
                                            borderLeft: `4px solid ${accent.bar}`,
                                            flexWrap: 'wrap',
                                            gap: 12,
                                        }}
                                    >
                                        <div className="col gap-1">
                                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>{phase.name}</h2>
                                            <span className="mono muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{phase.timing}</span>
                                        </div>
                                        <div className="col ai-end">
                                            <span className="mono muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Personnel</span>
                                            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{phase.personnel.join(', ')}</span>
                                        </div>
                                    </div>

                                    <div className="col gap-3" style={{ padding: 24 }}>
                                        {phase.items.map(item => {
                                            const isChecked = checkedItems.has(item.id);
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="card"
                                                    style={{
                                                        padding: 14,
                                                        borderColor: isChecked ? 'rgba(40, 212, 168, .30)' : 'var(--rule)',
                                                        background: isChecked ? 'var(--mint-50)' : 'var(--paper)',
                                                    }}
                                                >
                                                    <label className="row gap-3 ai-start" style={{ cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => toggleItem(item.id)}
                                                            style={{ width: 20, height: 20, marginTop: 2, accentColor: 'var(--mint-2)' }}
                                                        />
                                                        <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
                                                            <div className="row gap-2 ai-baseline" style={{ flexWrap: 'wrap' }}>
                                                                <span style={{
                                                                    fontSize: 14,
                                                                    fontWeight: 500,
                                                                    color: isChecked ? 'var(--ink-3)' : 'var(--ink)',
                                                                    textDecoration: isChecked ? 'line-through' : 'none',
                                                                }}>
                                                                    {item.text}
                                                                </span>
                                                                {item.critical && <span className="pill pill-orange">CRITICAL</span>}
                                                            </div>
                                                            {item.details && (
                                                                <p className="muted" style={{ fontSize: 13, margin: 0 }}>{item.details}</p>
                                                            )}
                                                            {item.prompts && (
                                                                <ul className="clean col gap-1">
                                                                    {item.prompts.map((prompt, i) => (
                                                                        <li key={i} className="row gap-2 ai-start" style={{ fontSize: 13, color: 'var(--cobalt)' }}>
                                                                            <span className="muted-2">•</span>
                                                                            <span>{prompt}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {item.options && (
                                                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                                                    {item.options.map((opt, i) => {
                                                                        const isSelected = responses[item.id] === opt;
                                                                        return (
                                                                            <button
                                                                                key={i}
                                                                                type="button"
                                                                                onClick={() => setResponses(r => ({ ...r, [item.id]: opt }))}
                                                                                className={isSelected ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                                                            >
                                                                                {opt}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="row gap-2" style={{ padding: 24, paddingTop: 0 }}>
                                        {currentPhase > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentPhase(currentPhase - 1)}
                                                className="btn btn-paper"
                                            >
                                                ← Previous phase
                                            </button>
                                        )}
                                        {currentPhase < (data?.phases.length || 0) - 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentPhase(currentPhase + 1)}
                                                disabled={!isPhaseComplete(phase.id)}
                                                className="btn btn-cobalt"
                                                style={{ flex: 1, justifyContent: 'center' }}
                                            >
                                                {isPhaseComplete(phase.id) ? 'Proceed to next phase →' : 'Complete critical items to continue'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isPhaseComplete(phase.id)) {
                                                        setCompletionModal({ isOpen: true, completionTime: new Date().toLocaleTimeString() });
                                                    }
                                                }}
                                                disabled={!isPhaseComplete(phase.id)}
                                                className="btn btn-cobalt"
                                                style={{ flex: 1, justifyContent: 'center' }}
                                            >
                                                Complete checklist ✓
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Additional checks */}
                            <div className="col gap-2">
                                {data && Object.entries(data.additional_checks).map(([key, check]) => (
                                    <details key={key} className="card" style={{ padding: 0 }}>
                                        <summary className="row between ai-center" style={{ padding: 16, cursor: 'pointer', listStyle: 'none' }}>
                                            <span className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{check.name}</span>
                                            <span className="mono muted-2" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>expand</span>
                                        </summary>
                                        <div className="col gap-2" style={{ padding: '0 16px 16px', borderTop: '1px solid var(--rule)', marginTop: 0, paddingTop: 12 }}>
                                            {check.items.map((item, i) => (
                                                <label key={i} className="row gap-2 ai-center" style={{ padding: 6, cursor: 'pointer' }}>
                                                    <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--cobalt)' }} />
                                                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </details>
                                ))}
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={resetChecklist}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Reset checklist
                                </button>
                            </div>
                        </>
                    )}

                    {/* About */}
                    <div className="card col gap-2" style={{ padding: 24 }}>
                        <span className="kicker"><span className="dot" />about the who surgical safety checklist</span>
                        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                            The WHO Surgical Safety Checklist is a tool used by surgical teams to improve patient safety.
                            Studies have shown it reduces surgical complications by up to 36% and mortality by up to 47%.
                        </p>
                        <div className="row gap-3 mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', flexWrap: 'wrap' }}>
                            <a href="https://www.who.int/publications/i/item/9789241598590" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cobalt)' }}>
                                ↗ WHO implementation manual
                            </a>
                            <span>·</span>
                            <span>Haynes AB, et al. NEJM 2009</span>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
