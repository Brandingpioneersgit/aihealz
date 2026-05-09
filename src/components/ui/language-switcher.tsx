'use client';

import { useState, useEffect } from 'react';

interface LanguageSwitcherProps {
    /** Country slug from server-side headers, e.g. "india" */
    country?: string | null;
    /** Detected city slug, e.g. "delhi" */
    city?: string | null;
    /** Primary language code, e.g. "en" */
    lang?: string;
    /** Regional language code, e.g. "hi" */
    regionalLang?: string | null;
    /** Display info like "Hindi|हिन्दी" */
    regionalDisplay?: string | null;
}

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

export default function LanguageSwitcher({
    country,
    city,
    lang = 'en',
    regionalLang,
    regionalDisplay,
}: LanguageSwitcherProps) {
    const [activeLang, setActiveLang] = useState(lang);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const cookieVal = document.cookie
            .split('; ')
            .find(c => c.startsWith('aihealz-lang='))
            ?.split('=')[1];
        if (cookieVal) setActiveLang(cookieVal);
    }, []);

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
