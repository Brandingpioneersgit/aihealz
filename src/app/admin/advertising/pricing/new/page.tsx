'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Posts to /api/admin/advertising/pricing. Build the route if it doesn't exist.
export default function NewPricingTierPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        placement: 'sidebar',
        pricingModel: 'cpm',
        rate: '',
        currency: 'USD',
        minSpend: '',
        notes: '',
        isActive: true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...form,
                rate: form.rate ? parseFloat(form.rate) : null,
                minSpend: form.minSpend ? parseFloat(form.minSpend) : null,
            };
            const res = await fetch('/api/admin/advertising/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || `Failed (HTTP ${res.status})`);
            }
            router.push('/admin/advertising/pricing');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col gap-5" style={{ maxWidth: 720, color: 'var(--ink)' }}>
            <Link
                href="/admin/advertising/pricing"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back
            </Link>
            <div className="col gap-2">
                <span className="section-mark">admin / advertising / pricing</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New pricing tier<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    Define a new ad placement tier with pricing model and rate.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="card-flat"
                    style={{
                        padding: '12px 16px',
                        borderColor: 'rgba(255, 90, 46, .35)',
                        background: 'var(--orange-50)',
                        color: 'var(--orange-2)',
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="card col gap-4" style={{ padding: 24 }}>
                <Field label="Tier name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />

                <div className="form-group">
                    <label className="form-label">Placement</label>
                    <select
                        value={form.placement}
                        onChange={(e) => setForm({ ...form, placement: e.target.value })}
                        className="select"
                    >
                        <option value="sidebar">Sidebar</option>
                        <option value="banner">Banner</option>
                        <option value="inline">Inline</option>
                        <option value="sponsored_listing">Sponsored Listing</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Pricing model</label>
                    <select
                        value={form.pricingModel}
                        onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}
                        className="select"
                    >
                        <option value="cpm">CPM (per 1,000 impressions)</option>
                        <option value="cpc">CPC (per click)</option>
                        <option value="flat">Flat (per period)</option>
                    </select>
                </div>

                <Field label="Rate *" value={form.rate} onChange={(v) => setForm({ ...form, rate: v })} required placeholder="5.00" />
                <Field label="Currency" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} placeholder="USD, INR" />
                <Field label="Minimum spend" value={form.minSpend} onChange={(v) => setForm({ ...form, minSpend: v })} />

                <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={3}
                        className="textarea"
                    />
                </div>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={saving} className="btn btn-cobalt">
                        {saving ? 'Creating…' : 'Create tier →'}
                    </button>
                    <Link href="/admin/advertising/pricing" className="btn btn-paper">Cancel</Link>
                </div>
            </form>
        </div>
    );
}

function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                className="input"
            />
        </div>
    );
}
