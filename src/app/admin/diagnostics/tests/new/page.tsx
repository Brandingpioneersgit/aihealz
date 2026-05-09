'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Posts to /api/admin/diagnostics/tests. Build the route to accept this shape.
export default function NewDiagnosticTestPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        slug: '',
        code: '',
        category: '',
        description: '',
        sampleType: '',
        fastingRequired: false,
        isActive: true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/diagnostics/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || `Failed (HTTP ${res.status})`);
            }
            router.push('/admin/diagnostics/tests');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col gap-5" style={{ maxWidth: 720, color: 'var(--ink)' }}>
            <Link
                href="/admin/diagnostics/tests"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back
            </Link>
            <div className="col gap-2">
                <span className="section-mark">admin / diagnostics / tests / new</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New diagnostic test<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
            </div>

            {error && (
                <div role="alert" className="card-flat" style={{ padding: '12px 16px', borderColor: 'rgba(255, 90, 46, .35)', background: 'var(--orange-50)', color: 'var(--orange-2)', fontSize: 13 }}>
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="card col gap-4" style={{ padding: 24 }}>
                <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
                <Field label="Test code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="CBC, LFT" />
                <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="hematology" />
                <Field label="Sample type" value={form.sampleType} onChange={(v) => setForm({ ...form, sampleType: v })} placeholder="blood, urine" />

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="textarea"
                    />
                </div>

                <label className="row ai-center gap-2" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                    <input
                        type="checkbox"
                        checked={form.fastingRequired}
                        onChange={(e) => setForm({ ...form, fastingRequired: e.target.checked })}
                    />
                    Fasting required
                </label>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={saving} className="btn btn-cobalt">
                        {saving ? 'Creating…' : 'Create test →'}
                    </button>
                    <Link href="/admin/diagnostics/tests" className="btn btn-paper">Cancel</Link>
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
