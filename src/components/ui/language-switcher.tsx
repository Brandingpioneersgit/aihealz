'use client';

import { useState, useEffect } from 'react';

interface LanguageSwitcherProps {
    /** Country slug — usually omitted; component reads from cookie on mount */
    country?: string | null;
    /** City slug — usually omitted; component reads from cookie on mount */
    city?: string | null;
    /** Initial language code (defaults to 'en'; cookie overrides on mount) */
    lang?: string;
    /** Regional language code (e.g. "hi"); usually derived from cookie */
    regionalLang?: string | null;
    /** Display info like "Hindi|हिन्दी" (usually derived from cookie) */
    regionalDisplay?: string | null;
}

// Indian city → regional language. Trimmed mirror of the table in proxy.ts so
// the switcher works without a server round-trip when only the geo cookie is
// present. Keep in sync with src/proxy.ts INDIAN_CITY_LANG.
const CITY_REGIONAL_LANG: Record<string, { code: string; display: string }> = {
    // Tamil
    chennai: { code: 'ta', display: 'Tamil|தமிழ்' },
    coimbatore: { code: 'ta', display: 'Tamil|தமிழ்' },
    madurai: { code: 'ta', display: 'Tamil|தமிழ்' },
    // Telugu
    hyderabad: { code: 'te', display: 'Telugu|తెలుగు' },
    visakhapatnam: { code: 'te', display: 'Telugu|తెలుగు' },
    // Marathi
    mumbai: { code: 'mr', display: 'Marathi|मराठी' },
    pune: { code: 'mr', display: 'Marathi|मराठी' },
    nagpur: { code: 'mr', display: 'Marathi|मराठी' },
    // Bengali
    kolkata: { code: 'bn', display: 'Bengali|বাংলা' },
    // Kannada
    bangalore: { code: 'kn', display: 'Kannada|ಕನ್ನಡ' },
    bengaluru: { code: 'kn', display: 'Kannada|ಕನ್ನಡ' },
    mysore: { code: 'kn', display: 'Kannada|ಕನ್ನಡ' },
    // Gujarati
    ahmedabad: { code: 'gu', display: 'Gujarati|ગુજરાતી' },
    surat: { code: 'gu', display: 'Gujarati|ગુજરાતી' },
    // Malayalam
    kochi: { code: 'ml', display: 'Malayalam|മലയാളം' },
    thiruvananthapuram: { code: 'ml', display: 'Malayalam|മലയാളം' },
    // Hindi (default for many cities) — handled as fallback in cityToRegional
};

const LANG_INFO: Record<string, { name: string; native: string }> = {
    en: { name: 'English', native: 'English' },
    hi: { name: 'Hindi', native: 'हिन्दी' },
    ta: { name: 'Tamil', native: 'தமிழ்' },
    mr: { name: 'Marathi', native: 'मराठी' },
    kn: { name: 'Kannada', native: 'ಕನ್ನಡ' },
    bn: { name: 'Bengali', native: 'বাংলা' },
    gu: { name: 'Gujarati', native: 'ગુજરાતી' },
    te: { name: 'Telugu', native: 'తెలుగు' },
    ml: { name: 'Malayalam', native: 'മലയാളം' },
    pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
};

function capitalize(s: string): string {
    return s.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    return (
        document.cookie
            .split('; ')
            .find(c => c.startsWith(`${name}=`))
            ?.split('=')[1] ?? null
    );
}

export default function LanguageSwitcher({
    country: countryProp,
    city: cityProp,
    lang = 'en',
    regionalLang: regionalLangProp,
    regionalDisplay: regionalDisplayProp,
}: LanguageSwitcherProps) {
    const [activeLang, setActiveLang] = useState(lang);
    const [dismissed, setDismissed] = useState(false);
    // Geo state filled on mount when not provided by parent (the static-ISR path).
    const [detectedCountry, setDetectedCountry] = useState<string | null>(countryProp ?? null);
    const [detectedCity, setDetectedCity] = useState<string | null>(cityProp ?? null);
    const [detectedRegional, setDetectedRegional] = useState<{ code: string; display: string } | null>(
        regionalLangProp ? { code: regionalLangProp, display: regionalDisplayProp || '' } : null,
    );

    useEffect(() => {
        const cookieLang = getCookie('aihealz-lang');
        if (cookieLang) setActiveLang(cookieLang);

        // If parent didn't pass geo, derive it from the aihealz-geo cookie set by proxy.ts.
        if (!countryProp && !cityProp) {
            const geo = getCookie('aihealz-geo');
            if (geo) {
                const [countrySlug, _state, citySlug] = decodeURIComponent(geo).split(':');
                if (countrySlug) setDetectedCountry(countrySlug);
                if (citySlug) {
                    setDetectedCity(citySlug);
                    const reg = CITY_REGIONAL_LANG[citySlug.toLowerCase()];
                    if (reg) setDetectedRegional(reg);
                    else if (countrySlug.toLowerCase() === 'india') {
                        // Hindi default for cities not in the regional map
                        setDetectedRegional({ code: 'hi', display: 'Hindi|हिन्दी' });
                    }
                }
            }
        }
    }, [countryProp, cityProp]);

    const country = countryProp ?? detectedCountry;
    const city = cityProp ?? detectedCity;
    const regionalLang = regionalLangProp ?? detectedRegional?.code ?? null;
    const regionalDisplay = regionalDisplayProp ?? detectedRegional?.display ?? null;

    if (!regionalLang || dismissed) return null;
    if (activeLang === regionalLang) return null;

    let regName = LANG_INFO[regionalLang]?.name || regionalLang;
    let regNative = LANG_INFO[regionalLang]?.native || '';
    if (regionalDisplay) {
        try {
            const decoded = decodeURIComponent(regionalDisplay);
            const parts = decoded.split('|');
            regName = parts[0] || regName;
            regNative = parts[1] || regNative;
        } catch {
            // fallback gracefully
        }
    }

    const cityDisplay = city ? capitalize(city) : null;

    const switchToLang = (code: string) => {
        document.cookie = `aihealz-lang=${code};path=/;max-age=${365 * 24 * 3600};samesite=lax`;
        setActiveLang(code);
        window.location.reload();
    };

    const pillBtnStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '4px 10px',
        borderRadius: 'var(--r-2)',
        fontFamily: 'var(--mono)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: isActive ? 'var(--cobalt-50)' : 'transparent',
        color: isActive ? 'var(--cobalt)' : 'var(--ink-3)',
        border: isActive ? '1px solid rgba(28, 91, 255, .22)' : '1px solid var(--rule)',
        cursor: 'pointer',
        transition: 'background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast)',
    });

    return (
        <div
            role="region"
            aria-label="Choose language"
            className="hairline-b"
            style={{ background: 'var(--paper)' }}
        >
            <div
                className="row ai-center between gap-4"
                style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '10px 16px',
                    flexWrap: 'wrap',
                }}
            >
                <div className="row ai-center gap-3" style={{ minWidth: 0 }}>
                    <span
                        aria-hidden="true"
                        className="mono"
                        style={{
                            width: 22,
                            height: 22,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--cobalt)',
                            fontSize: 13,
                            flexShrink: 0,
                        }}
                    >
                        ◐
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                        {cityDisplay ? (
                            <>
                                Browsing from{' '}
                                <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>
                                    {cityDisplay}
                                </strong>
                            </>
                        ) : country ? (
                            <>
                                Browsing from{' '}
                                <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>
                                    {capitalize(country)}
                                </strong>
                            </>
                        ) : (
                            <>Choose your language</>
                        )}
                    </span>
                </div>

                <div className="row ai-center gap-2">
                    <button
                        lang="en"
                        aria-label="Switch to English"
                        aria-pressed={activeLang === 'en'}
                        style={pillBtnStyle(activeLang === 'en')}
                        onClick={() => switchToLang('en')}
                    >
                        EN · English
                    </button>
                    <button
                        lang={regionalLang}
                        aria-label={`Switch to ${regName}`}
                        aria-pressed={activeLang === regionalLang}
                        style={pillBtnStyle(activeLang === regionalLang)}
                        onClick={() => switchToLang(regionalLang)}
                    >
                        {regionalLang.toUpperCase()} · {regNative}
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        aria-label="Dismiss language switcher"
                        className="row ai-center center"
                        style={{
                            width: 28,
                            height: 28,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--ink-4)',
                            cursor: 'pointer',
                            fontSize: 16,
                            marginLeft: 4,
                            borderRadius: 'var(--r-1)',
                            transition: 'color var(--transition-fast), background var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--ink)';
                            e.currentTarget.style.background = 'var(--bg-2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--ink-4)';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
}
