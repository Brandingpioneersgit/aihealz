'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface VaccineDose {
    age: string;
    note?: string;
}

interface VaccineScheduleItem {
    vaccine: string;
    name: string;
    doses: VaccineDose[];
}

interface CountrySchedule {
    name: string;
    authority: string;
    infant?: VaccineScheduleItem[];
    child?: VaccineScheduleItem[];
    adolescent?: VaccineScheduleItem[];
    adult?: VaccineScheduleItem[];
    booster?: VaccineScheduleItem[];
}

interface TravelVaccine {
    id: string;
    name: string;
    description: string;
    required_regions: string[];
    timing: string;
    duration: string;
    certificate: boolean;
    note?: string;
    costs: Record<string, { min: number; max: number }>;
}

interface VaccineInfo {
    fullName: string;
    type: string;
    protects: string[];
}

interface Destination {
    region: string;
    vaccines: string[];
    malaria: boolean | string;
}

interface VaccinationData {
    schedules: Record<string, CountrySchedule>;
    travel_vaccines: TravelVaccine[];
    vaccine_info: Record<string, VaccineInfo>;
    destinations: Destination[];
}

const COUNTRIES = [
    { key: 'usa', label: 'United States', flag: '🇺🇸' },
    { key: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
    { key: 'india', label: 'India', flag: '🇮🇳' },
    { key: 'thailand', label: 'Thailand', flag: '🇹🇭' },
    { key: 'mexico', label: 'Mexico', flag: '🇲🇽' },
    { key: 'turkey', label: 'Turkey', flag: '🇹🇷' },
    { key: 'uae', label: 'UAE', flag: '🇦🇪' },
];

const CURRENCY_MAP: Record<string, { symbol: string; rate: number }> = {
    usa: { symbol: '$', rate: 1 },
    uk: { symbol: '£', rate: 0.79 },
    india: { symbol: '₹', rate: 83 },
    thailand: { symbol: '฿', rate: 35 },
    mexico: { symbol: 'MX$', rate: 17 },
    turkey: { symbol: '₺', rate: 32 },
    uae: { symbol: 'AED', rate: 3.67 },
};

const AGE_GROUPS = [
    { key: 'infant', label: 'Infant (0–2 yr)' },
    { key: 'child', label: 'Child (2–11 yr)' },
    { key: 'adolescent', label: 'Adolescent (11–18 yr)' },
    { key: 'adult', label: 'Adult (18+ yr)' },
    { key: 'booster', label: 'Boosters' },
];

export default function VaccinationsPage() {
    const [data, setData] = useState<VaccinationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('usa');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('infant');
    const [activeTab, setActiveTab] = useState<'schedule' | 'travel'>('schedule');
    const [selectedDestination, setSelectedDestination] = useState<string>('');
    const [priceCountry, setPriceCountry] = useState('usa');

    useEffect(() => {
        fetch('/data/vaccinations.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const schedule = data?.schedules[selectedCountry];
    const ageGroupSchedule = schedule?.[selectedAgeGroup as keyof CountrySchedule] as VaccineScheduleItem[] | undefined;

    const filteredTravelVaccines = useMemo(() => {
        if (!data || !selectedDestination) return data?.travel_vaccines || [];
        const dest = data.destinations.find(d => d.region === selectedDestination);
        if (!dest) return data.travel_vaccines;
        return data.travel_vaccines.filter(v =>
            dest.vaccines.some(dv => v.name.toLowerCase().includes(dv.toLowerCase()) || dv.toLowerCase().includes(v.name.toLowerCase()))
        );
    }, [data, selectedDestination]);

    const selectedDest = data?.destinations.find(d => d.region === selectedDestination);

    const formatPrice = (costs: Record<string, { min: number; max: number }>, country: string) => {
        const c = costs[country];
        if (!c) return 'N/A';
        const { symbol, rate } = CURRENCY_MAP[country] || { symbol: '$', rate: 1 };
        const min = Math.round(c.min * rate);
        const max = Math.round(c.max * rate);
        return `${symbol}${min} – ${symbol}${max}`;
    };

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
                        Loading vaccination data…
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
                    <span style={{ color: 'var(--ink)' }}>Vaccinations</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / vaccination schedule</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>Vaccination</span> schedule
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Country-specific routine immunizations and travel vaccine recommendations. Cost compared across seven countries.
                    </p>
                </header>

                {/* Tabs */}
                <div
                    className="row gap-2"
                    style={{
                        flexWrap: 'wrap',
                        borderBottom: '1px solid var(--rule)',
                        paddingBottom: 12,
                    }}
                >
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={activeTab === 'schedule' ? 'btn btn-primary' : 'btn btn-paper'}
                    >
                        Routine schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('travel')}
                        className={activeTab === 'travel' ? 'btn btn-primary' : 'btn btn-paper'}
                    >
                        Travel vaccines
                    </button>
                </div>

                {activeTab === 'schedule' ? (
                    <>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 16,
                            }}
                            className="vx-grid"
                        >
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
                                    Country
                                </span>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {COUNTRIES.map(c => (
                                        <button
                                            key={c.key}
                                            onClick={() => setSelectedCountry(c.key)}
                                            className={selectedCountry === c.key ? 'pill pill-cobalt' : 'pill'}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {c.flag} {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                                    Age group
                                </span>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {AGE_GROUPS.filter(g => schedule?.[g.key as keyof CountrySchedule]).map(g => (
                                        <button
                                            key={g.key}
                                            onClick={() => setSelectedAgeGroup(g.key)}
                                            className={selectedAgeGroup === g.key ? 'pill pill-cobalt' : 'pill'}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {schedule && (
                            <div
                                className="row between ai-end"
                                style={{ flexWrap: 'wrap', gap: 12, padding: '0 4px' }}
                            >
                                <div className="col gap-1">
                                    <h2
                                        className="display"
                                        style={{ fontSize: 22, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}
                                    >
                                        {schedule.name}
                                    </h2>
                                    <span className="muted" style={{ fontSize: 13 }}>{schedule.authority}</span>
                                </div>
                                <span className="pill pill-mint">
                                    {ageGroupSchedule?.length || 0} vaccines
                                </span>
                            </div>
                        )}

                        {/* Vaccine table */}
                        <div
                            style={{
                                border: '1px solid var(--rule)',
                                borderRadius: 'var(--r-3)',
                                background: 'var(--paper)',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ overflowX: 'auto' }}>
                                <table
                                    style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}
                                >
                                    <caption className="sr-only">Vaccination schedule by age group</caption>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-2)' }}>
                                            <th
                                                scope="col"
                                                className="mono"
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 16px',
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    color: 'var(--ink-3)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                Code
                                            </th>
                                            <th
                                                scope="col"
                                                className="mono"
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 16px',
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    color: 'var(--ink-3)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                Vaccine
                                            </th>
                                            <th
                                                scope="col"
                                                className="mono"
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 16px',
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    color: 'var(--ink-3)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                Doses &amp; timing
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ageGroupSchedule?.map((item, idx) => {
                                            const info = data?.vaccine_info[item.vaccine];
                                            return (
                                                <tr
                                                    key={idx}
                                                    style={{ borderTop: '1px solid var(--rule)' }}
                                                >
                                                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                                                        <span
                                                            className="pill pill-cobalt mono"
                                                            style={{ fontSize: 11 }}
                                                        >
                                                            {item.vaccine}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                                                        <div
                                                            style={{
                                                                fontSize: 14,
                                                                fontWeight: 500,
                                                                color: 'var(--ink)',
                                                            }}
                                                        >
                                                            {item.name}
                                                        </div>
                                                        {info && (
                                                            <div
                                                                className="muted"
                                                                style={{ fontSize: 12, marginTop: 4 }}
                                                            >
                                                                {info.type} · protects:{' '}
                                                                {info.protects.join(', ')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                                                        <div
                                                            className="row gap-2"
                                                            style={{ flexWrap: 'wrap' }}
                                                        >
                                                            {item.doses.map((dose, di) => (
                                                                <div
                                                                    key={di}
                                                                    className="col"
                                                                    style={{
                                                                        padding: '6px 10px',
                                                                        background: 'var(--bg-2)',
                                                                        border: '1px solid var(--rule)',
                                                                        borderRadius: 'var(--r-2)',
                                                                    }}
                                                                >
                                                                    <span
                                                                        className="num"
                                                                        style={{
                                                                            fontSize: 12,
                                                                            fontWeight: 500,
                                                                            color: 'var(--cobalt)',
                                                                        }}
                                                                    >
                                                                        {dose.age}
                                                                    </span>
                                                                    {dose.note && (
                                                                        <span
                                                                            className="muted"
                                                                            style={{ fontSize: 11 }}
                                                                        >
                                                                            {dose.note}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {(!ageGroupSchedule || ageGroupSchedule.length === 0) && (
                                <div
                                    style={{
                                        padding: 32,
                                        textAlign: 'center',
                                        color: 'var(--ink-4)',
                                        fontSize: 14,
                                    }}
                                >
                                    No vaccines scheduled for this age group in the selected country.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 16,
                            }}
                            className="vx-grid"
                        >
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
                                    Where are you traveling?
                                </span>
                                <select
                                    value={selectedDestination}
                                    onChange={e => setSelectedDestination(e.target.value)}
                                    className="select"
                                >
                                    <option value="">All travel vaccines</option>
                                    {data?.destinations.map(d => (
                                        <option key={d.region} value={d.region}>
                                            {d.region}
                                        </option>
                                    ))}
                                </select>
                                {selectedDest && (
                                    <div className="card-quiet" style={{ padding: 12 }}>
                                        <span
                                            style={{
                                                fontSize: 13,
                                                color:
                                                    typeof selectedDest.malaria === 'boolean'
                                                        ? selectedDest.malaria
                                                            ? 'var(--orange-2)'
                                                            : 'var(--mint-3)'
                                                        : '#8C6A00',
                                            }}
                                        >
                                            <strong>Malaria risk:</strong>{' '}
                                            {typeof selectedDest.malaria === 'boolean'
                                                ? selectedDest.malaria
                                                    ? 'Yes — prophylaxis required'
                                                    : 'No'
                                                : selectedDest.malaria}
                                        </span>
                                    </div>
                                )}
                            </div>

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
                                    View prices in
                                </span>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {COUNTRIES.map(c => (
                                        <button
                                            key={c.key}
                                            onClick={() => setPriceCountry(c.key)}
                                            className={priceCountry === c.key ? 'pill pill-cobalt' : 'pill'}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {c.flag} {c.key.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Travel vaccines */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: 16,
                            }}
                        >
                            {filteredTravelVaccines.map(vaccine => (
                                <div
                                    key={vaccine.id}
                                    className="card col gap-3"
                                    style={{ padding: 22 }}
                                >
                                    <div className="row between ai-start" style={{ gap: 8 }}>
                                        <h3
                                            className="display"
                                            style={{
                                                fontSize: 17,
                                                margin: 0,
                                                fontWeight: 600,
                                                letterSpacing: '-0.015em',
                                            }}
                                        >
                                            {vaccine.name}
                                        </h3>
                                        {vaccine.certificate && (
                                            <span className="pill pill-lemon">certificate</span>
                                        )}
                                    </div>
                                    <p
                                        className="muted"
                                        style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}
                                    >
                                        {vaccine.description}
                                    </p>

                                    <div className="col gap-1" style={{ fontSize: 13 }}>
                                        <Detail label="Timing" value={vaccine.timing} />
                                        <Detail label="Duration" value={vaccine.duration} />
                                        {vaccine.note && <Detail label="Note" value={vaccine.note} accent />}
                                    </div>

                                    <div className="hairline" />

                                    <div className="row between ai-center">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 10,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Estimated cost
                                        </span>
                                        <span
                                            className="num display"
                                            style={{
                                                fontSize: 17,
                                                fontWeight: 600,
                                                color: 'var(--cobalt)',
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            {formatPrice(vaccine.costs, priceCountry)}
                                        </span>
                                    </div>

                                    <div className="col gap-2">
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 10,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Recommended for
                                        </span>
                                        <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                                            {vaccine.required_regions.slice(0, 3).map((region, i) => (
                                                <span key={i} className="pill">{region}</span>
                                            ))}
                                            {vaccine.required_regions.length > 3 && (
                                                <span className="pill">
                                                    +{vaccine.required_regions.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* CTA */}
                <section className="card-ink" style={{ padding: 'clamp(28px, 4vw, 48px)' }}>
                    <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 24 }}>
                        <div className="col gap-3" style={{ flex: '1 1 480px', minWidth: 0 }}>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.10em',
                                    fontWeight: 500,
                                }}
                            >
                                travel health services
                            </span>
                            <h3
                                className="display"
                                style={{
                                    fontSize: 'clamp(24px, 3vw, 36px)',
                                    lineHeight: 1.1,
                                    margin: 0,
                                    fontWeight: 600,
                                    color: 'var(--paper)',
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                Planning a trip? <span style={{ color: 'var(--cobalt-3)' }}>Get a tailored vaccination plan</span>
                                <span style={{ color: 'var(--orange)' }}>.</span>
                            </h3>
                            <p
                                style={{
                                    fontSize: 15,
                                    color: 'rgba(255,255,255,.7)',
                                    lineHeight: 1.55,
                                    maxWidth: 540,
                                    margin: 0,
                                }}
                            >
                                Personalized travel-health advice and a list of clinics near you. Be protected before you fly.
                            </p>
                        </div>
                        <Link href="/medical-travel/bot" className="btn btn-cobalt btn-lg">
                            Get travel health plan →
                        </Link>
                    </div>
                </section>

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> Educational only. Schedules may vary; costs are estimates. Consult a healthcare provider or travel medicine specialist for personalized recommendations.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 720px) {
                    .vx-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </main>
    );
}

function Detail({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="row gap-2 ai-baseline">
            <span
                className="mono"
                style={{
                    fontSize: 10,
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    minWidth: 60,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: 13,
                    color: accent ? '#8C6A00' : 'var(--ink-2)',
                }}
            >
                {value}
            </span>
        </div>
    );
}
