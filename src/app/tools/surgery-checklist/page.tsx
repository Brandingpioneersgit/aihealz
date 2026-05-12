'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChecklistItem {
    task: string;
    important: boolean;
}

interface PreOp {
    weeks_before: ChecklistItem[];
    days_before: ChecklistItem[];
    night_before: ChecklistItem[];
    day_of: ChecklistItem[];
}

interface PostOp {
    hospital: ChecklistItem[];
    first_week: ChecklistItem[];
    followup: ChecklistItem[];
}

interface Surgery {
    id: string;
    name: string;
    icon: string;
    description: string;
    preOp: PreOp;
    postOp: PostOp;
    warning_signs: string[];
}

interface PackingList {
    essentials: string[];
    comfort: string[];
    leave_home: string[];
}

interface SurgeryData {
    surgeries: Surgery[];
    packing_list: PackingList;
    general_tips: string[];
}

export default function SurgeryChecklistPage() {
    const [data, setData] = useState<SurgeryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSurgery, setSelectedSurgery] = useState<string>('general');
    const [activePhase, setActivePhase] = useState<'preOp' | 'postOp'>('preOp');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [showPacking, setShowPacking] = useState(false);

    useEffect(() => {
        fetch('/data/surgery-checklists.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const surgery = data?.surgeries.find(s => s.id === selectedSurgery);

    const toggleItem = (itemKey: string) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(itemKey)) {
            newChecked.delete(itemKey);
        } else {
            newChecked.add(itemKey);
        }
        setCheckedItems(newChecked);
    };

    const getProgress = () => {
        if (!surgery) return { total: 0, checked: 0, percent: 0 };
        const phase = activePhase === 'preOp' ? surgery.preOp : surgery.postOp;
        const allItems = Object.entries(phase);
        let total = 0;
        let checked = 0;
        allItems.forEach(([section, items]) => {
            items.forEach((_, idx) => {
                total += 1;
                if (checkedItems.has(`${selectedSurgery}-${activePhase}-${section}-${idx}`)) {
                    checked += 1;
                }
            });
        });
        return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 };
    };

    const progress = getProgress();

    const renderChecklist = (items: ChecklistItem[], section: string) => (
        <div className="col gap-2">
            {items.map((item, idx) => {
                const key = `${selectedSurgery}-${activePhase}-${section}-${idx}`;
                const isChecked = checkedItems.has(key);
                return (
                    <label
                        key={key}
                        className="row gap-3 ai-start"
                        style={{
                            padding: 12,
                            borderRadius: 'var(--r-2)',
                            border: '1px solid var(--rule)',
                            background: isChecked ? 'var(--mint-50)' : 'var(--paper)',
                            borderColor: isChecked ? 'rgba(40, 212, 168, .30)' : 'var(--rule)',
                            cursor: 'pointer',
                            transition: 'background 120ms ease',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem(key)}
                            style={{
                                accentColor: 'var(--mint-2)',
                                width: 18,
                                height: 18,
                                marginTop: 2,
                                flexShrink: 0,
                            }}
                        />
                        <div className="col gap-1" style={{ minWidth: 0, flex: 1 }}>
                            <span
                                style={{
                                    fontSize: 14,
                                    color: 'var(--ink)',
                                    textDecoration: isChecked ? 'line-through' : 'none',
                                    opacity: isChecked ? 0.6 : 1,
                                }}
                            >
                                {item.task}
                            </span>
                            {item.important && !isChecked && (
                                <span className="pill pill-orange" style={{ alignSelf: 'flex-start' }}>
                                    important
                                </span>
                            )}
                        </div>
                    </label>
                );
            })}
        </div>
    );

    if (loading) {
        return (
            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '60vh' }}>
                <div
                    style={{
                        maxWidth: 1280,
                        margin: '0 auto',
                        padding: '64px clamp(16px, 4vw, 28px)',
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
                        Loading checklists…
                    </div>
                </div>
            </main>
        );
    }

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
                    <span style={{ color: 'var(--ink)' }}>Surgery Checklist</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / surgery checklist</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>Surgery</span> checklists
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Pre-op preparation and post-op recovery checklists for the most common procedures. Track progress; flag warning signs.
                    </p>
                </header>

                {/* Surgery type */}
                <div className="card col gap-3" style={{ padding: 24 }}>
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--ink-3)',
                        }}
                    >
                        Select surgery type
                    </span>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: 8,
                        }}
                    >
                        {data?.surgeries.map(s => {
                            const isActive = selectedSurgery === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setSelectedSurgery(s.id);
                                        setCheckedItems(new Set());
                                    }}
                                    className="col gap-1 ai-center"
                                    style={{
                                        padding: 14,
                                        background: isActive ? 'var(--cobalt-50)' : 'var(--paper)',
                                        border: isActive
                                            ? '1px solid rgba(28, 91, 255, .35)'
                                            : '1px solid var(--rule)',
                                        borderRadius: 'var(--r-2)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: isActive ? 'var(--cobalt)' : 'var(--ink)',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {s.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {surgery && (
                    <>
                        <div className="card col gap-3" style={{ padding: 24 }}>
                            <div className="row gap-4 ai-start">
                                <span style={{ fontSize: 32 }}>{surgery.icon}</span>
                                <div className="col gap-1">
                                    <h2
                                        className="display"
                                        style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                                    >
                                        {surgery.name}
                                    </h2>
                                    <span className="muted" style={{ fontSize: 14 }}>
                                        {surgery.description}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Phase + progress */}
                        <div
                            className="row gap-4 ai-center"
                            style={{ flexWrap: 'wrap' }}
                        >
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => {
                                        setActivePhase('preOp');
                                        setShowPacking(false);
                                    }}
                                    className={!showPacking && activePhase === 'preOp' ? 'btn btn-primary' : 'btn btn-paper'}
                                >
                                    Pre-operative
                                </button>
                                <button
                                    onClick={() => {
                                        setActivePhase('postOp');
                                        setShowPacking(false);
                                    }}
                                    className={!showPacking && activePhase === 'postOp' ? 'btn btn-primary' : 'btn btn-paper'}
                                >
                                    Post-operative
                                </button>
                                <button
                                    onClick={() => setShowPacking(!showPacking)}
                                    className={showPacking ? 'btn btn-orange' : 'btn btn-paper'}
                                >
                                    Packing list
                                </button>
                            </div>

                            {!showPacking && (
                                <div
                                    className="row gap-3 ai-center"
                                    style={{ flex: 1, minWidth: 200 }}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                            height: 8,
                                            background: 'var(--bg-2)',
                                            border: '1px solid var(--rule)',
                                            borderRadius: 999,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${progress.percent}%`,
                                                height: '100%',
                                                background: 'var(--mint)',
                                                transition: 'width 200ms ease',
                                            }}
                                        />
                                    </div>
                                    <span
                                        className="num mono"
                                        style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}
                                    >
                                        {progress.checked}/{progress.total} ({progress.percent}%)
                                    </span>
                                </div>
                            )}
                        </div>

                        {showPacking && data && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                    gap: 16,
                                }}
                            >
                                {[
                                    { key: 'essentials', label: 'Essentials to bring', items: data.packing_list.essentials, accent: 'var(--cobalt)' },
                                    { key: 'comfort', label: 'Comfort items', items: data.packing_list.comfort, accent: 'var(--mint)' },
                                    { key: 'leave_home', label: 'Leave at home', items: data.packing_list.leave_home, accent: 'var(--orange)' },
                                ].map(group => (
                                    <div key={group.key} className="card col gap-3" style={{ padding: 22 }}>
                                        <div
                                            className="kicker"
                                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                        >
                                            <span
                                                className="dot"
                                                style={{ background: group.accent }}
                                            />
                                            {group.label}
                                        </div>
                                        <ul
                                            style={{
                                                margin: 0,
                                                padding: 0,
                                                listStyle: 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 6,
                                            }}
                                        >
                                            {group.items.map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="row gap-2 ai-start"
                                                    style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}
                                                >
                                                    <span
                                                        style={{
                                                            flexShrink: 0,
                                                            marginTop: 7,
                                                            width: 5,
                                                            height: 5,
                                                            background: group.accent,
                                                            borderRadius: 999,
                                                        }}
                                                    />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!showPacking && (
                            <div className="col gap-5">
                                {activePhase === 'preOp' ? (
                                    <>
                                        <Section index={1} title="Weeks before surgery">
                                            {renderChecklist(surgery.preOp.weeks_before, 'weeks_before')}
                                        </Section>
                                        <Section index={2} title="Days before surgery">
                                            {renderChecklist(surgery.preOp.days_before, 'days_before')}
                                        </Section>
                                        <Section index={3} title="Night before surgery">
                                            {renderChecklist(surgery.preOp.night_before, 'night_before')}
                                        </Section>
                                        <Section index={4} title="Day of surgery">
                                            {renderChecklist(surgery.preOp.day_of, 'day_of')}
                                        </Section>
                                    </>
                                ) : (
                                    <>
                                        <Section index={1} title="In the hospital">
                                            {renderChecklist(surgery.postOp.hospital, 'hospital')}
                                        </Section>
                                        <Section index={2} title="First week at home">
                                            {renderChecklist(surgery.postOp.first_week, 'first_week')}
                                        </Section>
                                        <Section index={3} title="Follow-up care">
                                            {renderChecklist(surgery.postOp.followup, 'followup')}
                                        </Section>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Warning signs */}
                        <div
                            className="card"
                            style={{
                                padding: 24,
                                background: 'var(--orange-50)',
                                border: '1px solid rgba(255, 90, 46, .28)',
                            }}
                        >
                            <h3
                                className="display"
                                style={{
                                    fontSize: 18,
                                    margin: 0,
                                    fontWeight: 600,
                                    letterSpacing: '-0.015em',
                                    color: 'var(--orange-2)',
                                    marginBottom: 12,
                                }}
                            >
                                Warning signs — call your doctor if:
                            </h3>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                    gap: 8,
                                }}
                            >
                                {surgery.warning_signs.map((sign, i) => (
                                    <div
                                        key={i}
                                        className="row gap-2 ai-start"
                                        style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}
                                    >
                                        <span
                                            style={{
                                                flexShrink: 0,
                                                marginTop: 6,
                                                width: 6,
                                                height: 6,
                                                background: 'var(--orange-2)',
                                                borderRadius: 999,
                                            }}
                                        />
                                        {sign}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {data && (
                    <div className="card col gap-3" style={{ padding: 24 }}>
                        <h3
                            className="display"
                            style={{ fontSize: 18, margin: 0, fontWeight: 600, letterSpacing: '-0.015em' }}
                        >
                            General tips
                        </h3>
                        <ul
                            style={{
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                            }}
                        >
                            {data.general_tips.map((tip, i) => (
                                <li
                                    key={i}
                                    className="row gap-3 ai-start"
                                    style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}
                                >
                                    <span
                                        style={{
                                            flexShrink: 0,
                                            marginTop: 7,
                                            width: 6,
                                            height: 6,
                                            background: 'var(--cobalt)',
                                            borderRadius: 999,
                                        }}
                                    />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Important.</strong> These checklists are general guides. Always follow your surgeon’s specific instructions — they may differ based on your individual health and the procedure.
                    </p>
                </div>
            </div>
        </main>
    );
}

function Section({
    index,
    title,
    children,
}: {
    index: number;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="card col gap-4" style={{ padding: 24 }}>
            <div className="row gap-3 ai-center">
                <div
                    className="display num"
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 'var(--r-2)',
                        background: 'var(--cobalt)',
                        color: 'var(--paper)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    {index}
                </div>
                <h3
                    className="display"
                    style={{
                        fontSize: 18,
                        margin: 0,
                        fontWeight: 600,
                        letterSpacing: '-0.015em',
                    }}
                >
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}
