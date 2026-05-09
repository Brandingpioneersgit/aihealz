'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewConditionPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        commonName: '',
        scientificName: '',
        slug: '',
        specialistType: '',
        bodySystem: '',
        severityLevel: '',
        icdCode: '',
        description: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/conditions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    slug: form.slug || form.commonName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                }),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Failed to create condition');
            }
            router.push('/admin/conditions');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to create condition');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col gap-5" style={{ maxWidth: 720, color: 'var(--ink)' }}>
            <Link
                href="/admin/conditions"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to conditions
            </Link>
            <div className="col gap-2">
                <span className="section-mark">admin / conditions / new</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New condition<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    Add a medical condition to the editorial taxonomy.
                </p>
            </div>

            {error && (
                <div role="alert" className="card-flat" style={{ padding: '12px 16px', borderColor: 'rgba(255, 90, 46, .35)', background: 'var(--orange-50)', color: 'var(--orange-2)', fontSize: 13 }}>
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="card col gap-4" style={{ padding: 24 }}>
                <Field label="Common name *" value={form.commonName} onChange={(v) => setForm({ ...form, commonName: v })} required />
                <Field label="Scientific name *" value={form.scientificName} onChange={(v) => setForm({ ...form, scientificName: v })} required />
                <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated from common name" />
                <Field label="Specialist type *" value={form.specialistType} onChange={(v) => setForm({ ...form, specialistType: v })} required placeholder="cardiologist" />
                <Field label="Body system" value={form.bodySystem} onChange={(v) => setForm({ ...form, bodySystem: v })} placeholder="cardiovascular" />
                <Field label="Severity level" value={form.severityLevel} onChange={(v) => setForm({ ...form, severityLevel: v })} placeholder="mild | moderate | severe" />
                <Field label="ICD code" value={form.icdCode} onChange={(v) => setForm({ ...form, icdCode: v })} />

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="textarea"
                    />
                </div>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={saving} className="btn btn-cobalt">
                        {saving ? 'Creating…' : 'Create condition →'}
                    </button>
                    <Link href="/admin/conditions" className="btn btn-paper">Cancel</Link>
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
