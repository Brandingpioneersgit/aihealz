'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmergencyService {
    name: string;
    number: string;
    type: string;
}

interface CountryEmergency {
    name: string;
    flag: string;
    universal_emergency: string;
    services: EmergencyService[];
    tips: string[];
}

interface EmergencyType {
    type: string;
    name: string;
    icon: string;
    symptoms: string[];
    actions: string[];
    warning: string;
}

interface FirstAidKit {
    name: string;
    items: string[];
}

interface EmergencyData {
    countries: Record<string, CountryEmergency>;
    emergency_types: EmergencyType[];
    first_aid_kits: Record<string, FirstAidKit>;
}

const TZ_COUNTRY_MAP: Record<string, string> = {
    'Asia/Kolkata': 'india', 'Asia/Calcutta': 'india',
    'America/New_York': 'usa', 'America/Los_Angeles': 'usa', 'America/Chicago': 'usa', 'America/Denver': 'usa',
    'Europe/London': 'uk', 'Europe/Berlin': 'germany', 'Europe/Paris': 'france',
    'Asia/Dubai': 'uae', 'Australia/Sydney': 'australia', 'Australia/Melbourne': 'australia',
    'America/Toronto': 'canada', 'America/Vancouver': 'canada',
    'Asia/Singapore': 'singapore', 'Asia/Tokyo': 'japan',
    'Africa/Lagos': 'nigeria', 'Africa/Nairobi': 'kenya',
};

function detectUserCountry(): string {
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/aihealz-geo=([^;:]+)/);
        if (match) {
            const country = match[1].split(':')[0];
            if (country) return country;
        }
    }
    if (typeof Intl !== 'undefined') {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (TZ_COUNTRY_MAP[tz]) return TZ_COUNTRY_MAP[tz];
    }
    return 'usa';
}

export default function EmergencyPage() {
    const [data, setData] = useState<EmergencyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('usa');
    const [activeTab, setActiveTab] = useState<'numbers' | 'guide' | 'kits'>('numbers');
    const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);

    useEffect(() => {
        const detected = detectUserCountry();
        setSelectedCountry(detected);

        fetch('/data/emergency-services.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                if (!d.countries[detected]) {
                    setSelectedCountry('usa');
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const country = data?.countries[selectedCountry];
    const countries = data ? Object.entries(data.countries) : [];

    if (loading) {
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
                        Loading emergency data…
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
                    <span style={{ color: 'var(--ink)' }}>Emergency</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / emergency services</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>Emergency</span> services
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Country-specific emergency numbers, first aid guidance for common emergencies, and ready-made first-aid kit checklists.
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
                    {(['numbers', 'guide', 'kits'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={activeTab === tab ? 'btn btn-primary' : 'btn btn-paper'}
                        >
                            {tab === 'numbers' && 'Emergency numbers'}
                            {tab === 'guide' && 'Emergency guide'}
                            {tab === 'kits' && 'First aid kits'}
                        </button>
                    ))}
                </div>

                {activeTab === 'numbers' && (
                    <>
                        {/* Country selector */}
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
                                Select country
                            </span>
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                {countries.map(([key, c]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCountry(key)}
                                        className={selectedCountry === key ? 'pill pill-cobalt' : 'pill'}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {c.flag} {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Universal emergency number */}
                        {country && (
                            <div
                                style={{
                                    padding: 'clamp(28px, 4vw, 48px)',
                                    background: 'var(--ink)',
                                    color: 'var(--paper)',
                                    borderRadius: 'var(--r-4)',
                                    textAlign: 'center',
                                }}
                                className="col gap-3 ai-center"
                            >
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--cobalt-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.10em',
                                    }}
                                >
                                    Universal emergency number
                                </span>
                                <div
                                    className="bignum num"
                                    style={{
                                        fontSize: 'clamp(64px, 12vw, 128px)',
                                        color: 'var(--paper)',
                                        lineHeight: 0.9,
                                    }}
                                >
                                    {country.universal_emergency}
                                </div>
                                <span style={{ fontSize: 16, color: 'rgba(255,255,255,.7)' }}>
                                    {country.flag} {country.name}
                                </span>
                                <a
                                    href={`tel:${country.universal_emergency}`}
                                    className="btn btn-orange btn-lg"
                                    style={{ marginTop: 12 }}
                                >
                                    Call now
                                </a>
                            </div>
                        )}

                        {/* Services */}
                        {country && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: 0,
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-3)',
                                    background: 'var(--paper)',
                                    overflow: 'hidden',
                                }}
                            >
                                {country.services.map((service, idx, arr) => {
                                    const cols = 3;
                                    const isLastCol = (idx + 1) % cols === 0;
                                    const isLastRow = idx >= arr.length - cols;
                                    return (
                                        <div
                                            key={idx}
                                            className="col gap-2"
                                            style={{
                                                padding: 18,
                                                borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                                borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                            }}
                                        >
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 10,
                                                    color: 'var(--ink-3)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                {service.type.replace('_', ' ')}
                                            </span>
                                            <span style={{ fontSize: 14, fontWeight: 500 }}>{service.name}</span>
                                            <div className="row between ai-center">
                                                <span
                                                    className="num display"
                                                    style={{
                                                        fontSize: 22,
                                                        fontWeight: 600,
                                                        letterSpacing: '-0.02em',
                                                    }}
                                                >
                                                    {service.number}
                                                </span>
                                                <a
                                                    href={`tel:${service.number.replace(/[^0-9+]/g, '')}`}
                                                    className="btn btn-paper btn-sm"
                                                >
                                                    Call
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {country && (
                            <div className="card col gap-3" style={{ padding: 24 }}>
                                <h3
                                    className="display"
                                    style={{ fontSize: 18, margin: 0, fontWeight: 600, letterSpacing: '-0.015em' }}
                                >
                                    Emergency tips for {country.name}
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
                                    {country.tips.map((tip, idx) => (
                                        <li
                                            key={idx}
                                            className="row gap-3 ai-start"
                                            style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}
                                        >
                                            <span
                                                style={{
                                                    flexShrink: 0,
                                                    marginTop: 7,
                                                    width: 6,
                                                    height: 6,
                                                    background: 'var(--mint)',
                                                    borderRadius: 999,
                                                }}
                                            />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'guide' && (
                    <>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: 0,
                                border: '1px solid var(--rule)',
                                borderRadius: 'var(--r-3)',
                                background: 'var(--paper)',
                                overflow: 'hidden',
                            }}
                        >
                            {data?.emergency_types.map((emergency, i, arr) => {
                                const cols = 4;
                                const isLastCol = (i + 1) % cols === 0;
                                const isLastRow = i >= arr.length - cols;
                                const isActive = selectedEmergency === emergency.type;
                                return (
                                    <button
                                        key={emergency.type}
                                        onClick={() =>
                                            setSelectedEmergency(isActive ? null : emergency.type)
                                        }
                                        className="col gap-2"
                                        style={{
                                            padding: 22,
                                            background: isActive ? 'var(--cobalt-50)' : 'transparent',
                                            border: 'none',
                                            borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                            borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <span style={{ fontSize: 26 }}>{emergency.icon}</span>
                                        <span
                                            className="display"
                                            style={{
                                                fontSize: 15,
                                                fontWeight: 600,
                                                letterSpacing: '-0.015em',
                                                color: isActive ? 'var(--cobalt)' : 'var(--ink)',
                                            }}
                                        >
                                            {emergency.name}
                                        </span>
                                        <span className="muted" style={{ fontSize: 12 }}>
                                            Tap for guidance
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedEmergency &&
                            (() => {
                                const emergency = data?.emergency_types.find(
                                    e => e.type === selectedEmergency
                                );
                                if (!emergency) return null;
                                return (
                                    <div className="card col gap-5" style={{ padding: 28 }}>
                                        <div className="row gap-4 ai-start">
                                            <span style={{ fontSize: 36 }}>{emergency.icon}</span>
                                            <div className="col gap-2">
                                                <h2
                                                    className="display"
                                                    style={{
                                                        fontSize: 22,
                                                        margin: 0,
                                                        fontWeight: 600,
                                                        letterSpacing: '-0.02em',
                                                    }}
                                                >
                                                    {emergency.name}
                                                </h2>
                                                <span
                                                    className="pill pill-orange"
                                                    style={{ alignSelf: 'flex-start' }}
                                                >
                                                    {emergency.warning}
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: 24,
                                            }}
                                            className="eg-detail"
                                        >
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
                                                    Symptoms
                                                </span>
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
                                                    {emergency.symptoms.map((s, i) => (
                                                        <li
                                                            key={i}
                                                            className="row gap-2 ai-start"
                                                            style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}
                                                        >
                                                            <span
                                                                style={{
                                                                    flexShrink: 0,
                                                                    marginTop: 7,
                                                                    width: 6,
                                                                    height: 6,
                                                                    background: 'var(--orange)',
                                                                    borderRadius: 999,
                                                                }}
                                                            />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
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
                                                    What to do
                                                </span>
                                                <ol
                                                    style={{
                                                        margin: 0,
                                                        padding: 0,
                                                        listStyle: 'none',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8,
                                                        counterReset: 'step',
                                                    }}
                                                >
                                                    {emergency.actions.map((a, i) => (
                                                        <li
                                                            key={i}
                                                            className="row gap-3 ai-start"
                                                            style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}
                                                        >
                                                            <span
                                                                className="mono num"
                                                                style={{
                                                                    flexShrink: 0,
                                                                    fontSize: 12,
                                                                    fontWeight: 500,
                                                                    color: 'var(--cobalt)',
                                                                    minWidth: 18,
                                                                }}
                                                            >
                                                                {String(i + 1).padStart(2, '0')}
                                                            </span>
                                                            {a}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                    </>
                )}

                {activeTab === 'kits' && data && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {Object.entries(data.first_aid_kits).map(([key, kit]) => (
                            <div key={key} className="card col gap-3" style={{ padding: 24 }}>
                                <div className="kicker"><span className="dot" />{key}</div>
                                <h3
                                    className="display"
                                    style={{
                                        fontSize: 18,
                                        margin: 0,
                                        fontWeight: 600,
                                        letterSpacing: '-0.015em',
                                    }}
                                >
                                    {kit.name}
                                </h3>
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
                                    {kit.items.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="row gap-2 ai-start"
                                            style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}
                                        >
                                            <span
                                                style={{
                                                    flexShrink: 0,
                                                    marginTop: 7,
                                                    width: 5,
                                                    height: 5,
                                                    background: 'var(--cobalt)',
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

                <div
                    className="card-quiet"
                    style={{
                        padding: 18,
                        background: 'var(--orange-50)',
                        border: '1px solid rgba(255, 90, 46, .28)',
                    }}
                >
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--orange-2)' }}>In a real emergency.</strong> Call your local emergency number immediately. This guide is for education — do not delay professional help to read it.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 720px) {
                    .eg-detail { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </main>
    );
}
