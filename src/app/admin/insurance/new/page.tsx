'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewInsurancePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        shortName: '',
        slug: '',
        providerType: 'private',
        description: '',
        headquartersCountry: 'India',
        headquartersCity: '',
        website: '',
        customerCarePhone: '',
        email: '',
        licenseNumber: '',
        establishedYear: '',
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
                establishedYear: form.establishedYear ? parseInt(form.establishedYear, 10) : undefined,
            };
            const res = await fetch('/api/admin/insurance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Failed to create');
            }
            router.push('/admin/insurance');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col gap-5" style={{ maxWidth: 720, color: 'var(--ink)' }}>
            <Link
                href="/admin/insurance"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back
            </Link>
            <div className="col gap-2">
                <span className="section-mark">admin / insurance / new</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New insurance provider<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    Add a new insurance carrier to the network.
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
                <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Short name" value={form.shortName} onChange={(v) => setForm({ ...form, shortName: v })} />
                <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />

                <div className="form-group">
                    <label className="form-label">Provider type *</label>
                    <select
                        value={form.providerType}
                        onChange={(e) => setForm({ ...form, providerType: e.target.value })}
                        className="select"
                    >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                        <option value="standalone_health">Standalone Health</option>
                        <option value="general">General</option>
                    </select>
                </div>

                <Field label="HQ country" value={form.headquartersCountry} onChange={(v) => setForm({ ...form, headquartersCountry: v })} />
                <Field label="HQ city" value={form.headquartersCity} onChange={(v) => setForm({ ...form, headquartersCity: v })} />
                <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://" />
                <Field label="Customer care phone" value={form.customerCarePhone} onChange={(v) => setForm({ ...form, customerCarePhone: v })} />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="License number" value={form.licenseNumber} onChange={(v) => setForm({ ...form, licenseNumber: v })} />
                <Field label="Established year" value={form.establishedYear} onChange={(v) => setForm({ ...form, establishedYear: v })} placeholder="2001" />

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="textarea"
                    />
                </div>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={saving} className="btn btn-cobalt">
                        {saving ? 'Creating…' : 'Create provider →'}
                    </button>
                    <Link href="/admin/insurance" className="btn btn-paper">Cancel</Link>
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
