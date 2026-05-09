'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewLanguagePage() {
    const router = useRouter();
    const [form, setForm] = useState({ code: '', name: '', nativeName: '', isActive: true });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/languages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Failed to create');
            }
            router.push('/admin/languages');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col gap-5" style={{ maxWidth: 480, color: 'var(--ink)' }}>
            <Link
                href="/admin/languages"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back
            </Link>
            <div className="col gap-2">
                <span className="section-mark">admin / languages / new</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New language<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
            </div>

            {error && (
                <div role="alert" className="card-flat" style={{ padding: '12px 16px', borderColor: 'rgba(255, 90, 46, .35)', background: 'var(--orange-50)', color: 'var(--orange-2)', fontSize: 13 }}>
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="card col gap-4" style={{ padding: 24 }}>
                <div className="form-group">
                    <label className="form-label">Code *</label>
                    <input
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        required
                        minLength={2}
                        maxLength={5}
                        placeholder="en, hi, fr-CA"
                        className="input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="English"
                        className="input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Native name</label>
                    <input
                        value={form.nativeName}
                        onChange={(e) => setForm({ ...form, nativeName: e.target.value })}
                        placeholder="हिन्दी"
                        className="input"
                    />
                </div>

                <label className="row ai-center gap-2" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Active
                </label>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={saving} className="btn btn-cobalt">
                        {saving ? 'Creating…' : 'Create language →'}
                    </button>
                    <Link href="/admin/languages" className="btn btn-paper">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
