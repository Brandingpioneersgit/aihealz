'use client';

import { useState } from 'react';
import ConfirmModal from '@/components/ui/confirm-modal';

interface FeatureFlag {
    name: string;
    key: string;
    enabled: boolean;
    disabled?: boolean;
}

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [features, setFeatures] = useState<FeatureFlag[]>([
        { name: 'Symptom Checker UI', key: 'symptom_checker', enabled: true },
        { name: 'Patient Vault', key: 'patient_vault', enabled: true },
        { name: 'Stripe Payments Checkout', key: 'stripe_payments', enabled: true },
        { name: 'Teleconsultation Video Rooms', key: 'teleconsultation', enabled: false, disabled: true },
    ]);
    const [purging, setPurging] = useState(false);
    const [purgeModal, setPurgeModal] = useState(false);

    const handleToggleFeature = (key: string) => {
        setFeatures(prev => prev.map(f =>
            f.key === key ? { ...f, enabled: !f.enabled } : f
        ));
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        setSaveMessage(null);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    features: features.filter(f => !f.disabled).map(f => ({
                        key: f.key,
                        enabled: f.enabled,
                    })),
                }),
            });

            if (res.ok) {
                setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    const handlePurgeCache = async () => {
        setPurgeModal(false);
        setPurging(true);
        try {
            const res = await fetch('/api/admin/settings/purge-cache', {
                method: 'POST',
            });

            if (res.ok) {
                setSaveMessage({ type: 'success', text: 'Translation cache cleared successfully!' });
            } else {
                throw new Error('Failed to purge');
            }
        } catch (error) {
            console.error('Failed to purge cache:', error);
            setSaveMessage({ type: 'error', text: 'Failed to clear cache. Please try again.' });
        } finally {
            setPurging(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    return (
        <>
            <ConfirmModal
                isOpen={purgeModal}
                title="Clear Translation Cache"
                message="Are you sure you want to clear the translation cache? This action cannot be undone. Next requests will re-hit the translation API."
                confirmText="Purge Cache"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={handlePurgeCache}
                onCancel={() => setPurgeModal(false)}
            />
            <div className="col gap-6" style={{ maxWidth: 960, color: 'var(--ink)' }}>
                {/* Header */}
                <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                    <div className="col gap-2">
                        <span className="section-mark">admin / settings</span>
                        <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                            Platform settings<span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                            Manage global API keys, webhook endpoints, feature flags, and platform variables.
                        </p>
                    </div>
                    <button
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="btn btn-cobalt"
                    >
                        {saving ? 'Saving…' : 'Save changes →'}
                    </button>
                </div>

                {saveMessage && (
                    <div
                        role="status"
                        className="card-flat row ai-center gap-3"
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

                {/* API Keys */}
                <section className="card col gap-4" style={{ padding: 24 }}>
                    <div className="row between ai-center hairline-b" style={{ paddingBottom: 12, gap: 12, flexWrap: 'wrap' }}>
                        <span className="section-mark">api keys</span>
                        <span className="pill">env vars</span>
                    </div>
                    <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                        API keys are managed through environment variables for security. Update them in your deployment settings or .env file.
                    </p>

                    <div className="col gap-4">
                        <div className="form-group">
                            <label className="form-label">OpenRouter API Key (LLM generation)</label>
                            <div className="row gap-2">
                                <input
                                    type="password"
                                    value={process.env.NEXT_PUBLIC_OPENROUTER_KEY ? '••••••••••••••••' : 'Not configured'}
                                    readOnly
                                    className="input mono"
                                    style={{ flex: 1, background: 'var(--bg-2)', color: 'var(--ink-3)' }}
                                />
                                <span className={`pill ${process.env.NEXT_PUBLIC_OPENROUTER_KEY ? 'pill-mint' : 'pill-lemon'}`}>
                                    {process.env.NEXT_PUBLIC_OPENROUTER_KEY ? 'Configured' : 'Missing'}
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Stripe Secret Key</label>
                            <div className="row gap-2">
                                <input
                                    type="password"
                                    value="••••••••••••••••"
                                    readOnly
                                    className="input mono"
                                    style={{ flex: 1, background: 'var(--bg-2)', color: 'var(--ink-3)' }}
                                />
                                <span className="pill pill-mint">Configured</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Database URL</label>
                            <div className="row gap-2">
                                <input
                                    type="password"
                                    value="••••••••••••••••"
                                    readOnly
                                    className="input mono"
                                    style={{ flex: 1, background: 'var(--bg-2)', color: 'var(--ink-3)' }}
                                />
                                <span className="pill pill-mint">Connected</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature flags */}
                <section className="card col gap-4" style={{ padding: 24 }}>
                    <div className="hairline-b" style={{ paddingBottom: 12 }}>
                        <span className="section-mark">features &amp; feature flags</span>
                    </div>

                    <div className="col">
                        {features.map((feature, i, arr) => (
                            <div
                                key={feature.key}
                                className="row between ai-center"
                                style={{
                                    padding: '14px 0',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                    gap: 12,
                                }}
                            >
                                <div className="col gap-1">
                                    <span style={{ fontSize: 14, fontWeight: 500, color: feature.disabled ? 'var(--ink-4)' : 'var(--ink)' }}>
                                        {feature.name}
                                    </span>
                                    {feature.disabled && (
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            Not available
                                        </span>
                                    )}
                                </div>
                                <label
                                    style={{
                                        position: 'relative',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        cursor: feature.disabled ? 'not-allowed' : 'pointer',
                                        opacity: feature.disabled ? 0.5 : 1,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
                                        checked={feature.enabled}
                                        disabled={feature.disabled}
                                        onChange={() => handleToggleFeature(feature.key)}
                                    />
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            display: 'inline-block',
                                            width: 40,
                                            height: 22,
                                            borderRadius: 999,
                                            background: feature.enabled ? 'var(--cobalt)' : 'var(--rule)',
                                            position: 'relative',
                                            transition: 'background 120ms ease',
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: 2,
                                                left: feature.enabled ? 20 : 2,
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
                            </div>
                        ))}
                    </div>
                </section>

                {/* Danger zone */}
                <section className="card col gap-4" style={{ padding: 24, borderColor: 'rgba(255, 90, 46, .35)' }}>
                    <div className="hairline-b" style={{ paddingBottom: 12 }}>
                        <span className="section-mark" style={{ color: 'var(--orange-2)' }}>danger zone</span>
                    </div>

                    <div
                        className="row between ai-center"
                        style={{
                            padding: 16,
                            border: '1px solid rgba(255, 90, 46, .28)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--orange-50)',
                            gap: 16,
                            flexWrap: 'wrap',
                        }}
                    >
                        <div className="col gap-1" style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange-2)' }}>
                                Clear translation cache
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--orange-2)' }}>
                                Wipes the translation_cache table. Next requests will re-hit the translation API.
                            </span>
                        </div>
                        <button
                            onClick={() => setPurgeModal(true)}
                            disabled={purging}
                            className="btn btn-orange btn-sm"
                        >
                            {purging ? 'Purging…' : 'Purge cache'}
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
}
