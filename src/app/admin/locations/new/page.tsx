'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewLocationPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        slug: '',
        level: 'city',
        parentId: '',
        isoCode: '',
        timezone: '',
        population: '',
        latitude: '',
        longitude: '',
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
                parentId: form.parentId ? parseInt(form.parentId, 10) : null,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
            };
            const res = await fetch('/api/admin/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Failed to create');
            }
            router.push('/admin/locations');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col gap-5" style={{ maxWidth: 720, color: 'var(--ink)' }}>
            <Link
                href="/admin/locations"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back
            </Link>
            <div className="col gap-2">
                <span className="section-mark">admin / locations / new</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New location<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
            </div>

            {error && (
                <div role="alert" className="card-flat" style={{ padding: '12px 16px', borderColor: 'rgba(255, 90, 46, .35)', background: 'var(--orange-50)', color: 'var(--orange-2)', fontSize: 13 }}>
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="card col gap-4" style={{ padding: 24 }}>
                <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Slug *" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required placeholder="mumbai" />

                <div className="form-group">
                    <label className="form-label">Level *</label>
                    <select
                        value={form.level}
                        onChange={(e) => setForm({ ...form, level: e.target.value })}
                        className="select"
                    >
                        <option value="continent">Continent</option>
                        <option value="country">Country</option>
                        <option value="state">State</option>
                        <option value="city">City</option>
                        <option value="locality">Locality</option>
                    </select>
                </div>

                <Field label="Parent ID" value={form.parentId} onChange={(v) => setForm({ ...form, parentId: v })} placeholder="numeric id of parent geo" />
                <Field label="ISO code" value={form.isoCode} onChange={(v) => setForm({ ...form, isoCode: v })} placeholder="IN, US, MH" />
                <Field label="Timezone" value={form.timezone} onChange={(v) => setForm({ ...form, timezone: v })} placeholder="Asia/Kolkata" />
                <Field label="Population" value={form.population} onChange={(v) => setForm({ ...form, population: v })} />
                <Field label="Latitude" value={form.latitude} onChange={(v) => setForm({ ...form, latitude: v })} />
                <Field label="Longitude" value={form.longitude} onChange={(v) => setForm({ ...form, longitude: v })} />

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={saving} className="btn btn-cobalt">
                        {saving ? 'Creating…' : 'Create location →'}
                    </button>
                    <Link href="/admin/locations" className="btn btn-paper">Cancel</Link>
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
