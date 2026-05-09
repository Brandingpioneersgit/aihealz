'use client';

import { useState, useEffect } from 'react';

interface SEOSettings {
    schemas: {
        organization: boolean;
        medicalWebPage: boolean;
        breadcrumbs: boolean;
        faq: boolean;
    };
    metaTemplates: {
        condition: string;
        treatment: string;
        doctor: string;
        city: string;
    };
    indexingApi: {
        googleKeyJson: string;
        bingApiKey: string;
        verified: boolean;
    };
    canonicalRules: {
        trailingSlash: boolean;
        wwwRedirect: boolean;
        httpsOnly: boolean;
    };
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
                type="checkbox"
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span
                aria-hidden="true"
                style={{
                    display: 'inline-block',
                    width: 40,
                    height: 22,
                    borderRadius: 999,
                    background: checked ? 'var(--cobalt)' : 'var(--rule)',
                    position: 'relative',
                    transition: 'background 120ms ease',
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        top: 2,
                        left: checked ? 20 : 2,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 120ms ease',
                        boxShadow: '0 1px 2px rgba(10,26,47,.15)',
                    }}
                />
            </span>
        </label>
    );
}

export default function SeoSettingsPage() {
    const [settings, setSettings] = useState<SEOSettings>({
        schemas: {
            organization: true,
            medicalWebPage: true,
            breadcrumbs: true,
            faq: true,
        },
        metaTemplates: {
            condition: 'Best [Condition] Doctors in [City] | Symptoms & Treatments',
            treatment: '[Treatment] Cost & Top Hospitals in [City]',
            doctor: 'Dr. [Name] - [Specialty] in [City] | Reviews & Appointment',
            city: 'Top Doctors & Hospitals in [City] | Healthcare Guide',
        },
        indexingApi: {
            googleKeyJson: '',
            bingApiKey: '',
            verified: false,
        },
        canonicalRules: {
            trailingSlash: false,
            wwwRedirect: true,
            httpsOnly: true,
        },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/seo-settings');
            if (res.ok) {
                const data = await res.json();
                if (data.settings) {
                    setSettings(data.settings);
                }
            }
        } catch (error) {
            console.error('Failed to fetch SEO settings:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setSaveMessage(null);
        try {
            const res = await fetch('/api/admin/seo-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setHasChanges(false);
                setSaveMessage({ type: 'success', text: 'SEO settings saved successfully' });
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                const data = await res.json();
                setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' });
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    }

    async function handleVerifyCredentials() {
        setVerifying(true);
        try {
            const res = await fetch('/api/admin/seo-settings/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    googleKeyJson: settings.indexingApi.googleKeyJson,
                    bingApiKey: settings.indexingApi.bingApiKey,
                }),
            });
            const data = await res.json();
            setSettings(prev => ({
                ...prev,
                indexingApi: { ...prev.indexingApi, verified: data.verified || false },
            }));
            if (data.verified) {
                setSaveMessage({ type: 'success', text: 'Credentials verified successfully' });
            } else {
                setSaveMessage({ type: 'error', text: data.error || 'Verification failed' });
            }
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error('Verification failed:', error);
            setSaveMessage({ type: 'error', text: 'Verification failed' });
        } finally {
            setVerifying(false);
        }
    }

    function updateSchema(key: keyof typeof settings.schemas, value: boolean) {
        setSettings(prev => ({ ...prev, schemas: { ...prev.schemas, [key]: value } }));
        setHasChanges(true);
    }

    function updateTemplate(key: keyof typeof settings.metaTemplates, value: string) {
        setSettings(prev => ({ ...prev, metaTemplates: { ...prev.metaTemplates, [key]: value } }));
        setHasChanges(true);
    }

    function updateCanonical(key: keyof typeof settings.canonicalRules, value: boolean) {
        setSettings(prev => ({ ...prev, canonicalRules: { ...prev.canonicalRules, [key]: value } }));
        setHasChanges(true);
    }

    if (loading) {
        return (
            <div className="row center ai-center" style={{ minHeight: 400 }}>
                <div
                    aria-hidden="true"
                    style={{
                        width: 32,
                        height: 32,
                        border: '2px solid var(--rule)',
                        borderTopColor: 'var(--cobalt)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div className="col gap-6" style={{ maxWidth: 960, color: 'var(--ink)' }}>
            {/* Notice */}
            <div
                className="card-flat"
                style={{
                    padding: 14,
                    borderColor: 'rgba(230, 185, 40, .40)',
                    background: 'var(--lemon-50)',
                    fontSize: 13,
                    color: '#8C6A00',
                }}
            >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>SEO toggles are partially live.</div>
                <div>
                    Schema markup and meta-title templates on individual pages (homepage, conditions, treatments, doctors) are currently hardcoded in their respective page components. Toggles on this screen are saved but do not yet flip the live schemas. Treat this as a configuration staging area until the page components are refactored to read from the persisted SEO settings.
                </div>
            </div>

            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / seo settings</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        SEO &amp; meta settings<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        Configure global schema, canonical rules, and meta patterns.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="btn btn-cobalt"
                >
                    {saving ? 'Saving…' : 'Save configuration →'}
                </button>
            </div>

            {saveMessage && (
                <div
                    role="status"
                    className="card-flat"
                    style={{
                        padding: '12px 16px',
                        borderColor: saveMessage.type === 'success' ? 'rgba(40, 212, 168, .35)' : 'rgba(255, 90, 46, .35)',
                        background: saveMessage.type === 'success' ? 'var(--mint-50)' : 'var(--orange-50)',
                        color: saveMessage.type === 'success' ? 'var(--mint-3)' : 'var(--orange-2)',
                        fontSize: 13,
                    }}
                >
                    {saveMessage.text}
                </div>
            )}

            {/* Schema */}
            <section className="card col gap-4" style={{ padding: 24 }}>
                <div className="hairline-b" style={{ paddingBottom: 12 }}>
                    <span className="section-mark">global schema json-ld</span>
                </div>
                <div className="col">
                    {[
                        { key: 'organization' as const, label: 'Organization Schema', desc: 'Injects base aihealz organization schema on all pages.' },
                        { key: 'medicalWebPage' as const, label: 'MedicalWebPage Schema', desc: 'Auto-injects on condition, treatment, and directory pages.' },
                        { key: 'breadcrumbs' as const, label: 'Breadcrumb Schema', desc: 'Adds breadcrumb structured data for better navigation in search results.' },
                        { key: 'faq' as const, label: 'FAQ Schema', desc: 'Auto-generates FAQ schema from condition FAQs.' },
                    ].map(({ key, label, desc }, i, arr) => (
                        <div
                            key={key}
                            className="row between ai-center"
                            style={{
                                padding: '14px 0',
                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                gap: 12,
                            }}
                        >
                            <div className="col gap-1" style={{ flex: 1 }}>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                                <span className="muted" style={{ fontSize: 12 }}>{desc}</span>
                            </div>
                            <Toggle checked={settings.schemas[key]} onChange={(v) => updateSchema(key, v)} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Meta templates */}
            <section className="card col gap-4" style={{ padding: 24 }}>
                <div className="hairline-b" style={{ paddingBottom: 12 }}>
                    <span className="section-mark">meta title patterns</span>
                </div>
                <div className="col gap-4">
                    {[
                        { key: 'condition' as const, label: 'Conditions template (city)' },
                        { key: 'treatment' as const, label: 'Treatments template (city)' },
                        { key: 'doctor' as const, label: 'Doctor profile template' },
                        { key: 'city' as const, label: 'City directory template' },
                    ].map(({ key, label }) => (
                        <div key={key} className="form-group">
                            <label className="form-label">{label}</label>
                            <div className="row" style={{ alignItems: 'stretch' }}>
                                <input
                                    type="text"
                                    className="input mono"
                                    style={{ flex: 1, fontSize: 13, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                                    value={settings.metaTemplates[key]}
                                    onChange={(e) => updateTemplate(key, e.target.value)}
                                />
                                <div
                                    className="mono"
                                    style={{
                                        background: 'var(--bg-2)',
                                        borderTop: '1px solid var(--rule)',
                                        borderRight: '1px solid var(--rule)',
                                        borderBottom: '1px solid var(--rule)',
                                        borderTopRightRadius: 'var(--r-2)',
                                        borderBottomRightRadius: 'var(--r-2)',
                                        padding: '11px 14px',
                                        fontSize: 13,
                                        color: 'var(--ink-3)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    | aihealz
                                </div>
                            </div>
                        </div>
                    ))}
                    <p className="form-hint" style={{ marginTop: 0 }}>
                        Available placeholders: [Condition], [Treatment], [City], [Name], [Specialty], [Country]
                    </p>
                </div>
            </section>

            {/* Canonical */}
            <section className="card col gap-4" style={{ padding: 24 }}>
                <div className="hairline-b" style={{ paddingBottom: 12 }}>
                    <span className="section-mark">canonical rules</span>
                </div>
                <div className="col">
                    {[
                        { key: 'trailingSlash' as const, label: 'Trailing slash', desc: 'Add trailing slash to all URLs (e.g., /conditions/ vs /conditions)' },
                        { key: 'wwwRedirect' as const, label: 'WWW redirect', desc: 'Redirect non-www to www version of the site' },
                        { key: 'httpsOnly' as const, label: 'HTTPS only', desc: 'Force HTTPS on all pages' },
                    ].map(({ key, label, desc }, i, arr) => (
                        <div
                            key={key}
                            className="row between ai-center"
                            style={{
                                padding: '14px 0',
                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                gap: 12,
                            }}
                        >
                            <div className="col gap-1" style={{ flex: 1 }}>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                                <span className="muted" style={{ fontSize: 12 }}>{desc}</span>
                            </div>
                            <Toggle checked={settings.canonicalRules[key]} onChange={(v) => updateCanonical(key, v)} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Indexing API */}
            <section className="card col gap-4" style={{ padding: 24 }}>
                <div className="hairline-b" style={{ paddingBottom: 12 }}>
                    <span className="section-mark">indexing api</span>
                </div>
                <div className="col gap-4">
                    <div className="form-group">
                        <label className="form-label">Google Indexing API Key (JSON)</label>
                        <textarea
                            className="textarea mono"
                            style={{ fontSize: 12, height: 96 }}
                            value={settings.indexingApi.googleKeyJson}
                            onChange={(e) => {
                                setSettings(prev => ({
                                    ...prev,
                                    indexingApi: { ...prev.indexingApi, googleKeyJson: e.target.value, verified: false },
                                }));
                                setHasChanges(true);
                            }}
                            placeholder='{"type": "service_account", "project_id": "...", ...}'
                            spellCheck={false}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Bing Webmaster API Key</label>
                        <input
                            type="password"
                            className="input mono"
                            value={settings.indexingApi.bingApiKey}
                            onChange={(e) => {
                                setSettings(prev => ({
                                    ...prev,
                                    indexingApi: { ...prev.indexingApi, bingApiKey: e.target.value, verified: false },
                                }));
                                setHasChanges(true);
                            }}
                            placeholder="Enter Bing API key…"
                        />
                    </div>
                    <div className="row gap-3 ai-center">
                        <button
                            onClick={handleVerifyCredentials}
                            disabled={verifying}
                            className="btn btn-primary"
                        >
                            {verifying ? 'Verifying…' : 'Verify credentials'}
                        </button>
                        {settings.indexingApi.verified && (
                            <span className="pill pill-mint">✓ Verified</span>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
