'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewContentBatchPage() {
    const router = useRouter();
    const [form, setForm] = useState({ country: 'in', cities: '', conditions: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/content-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'seed', ...form }),
            });
            const j = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(j.error || 'Failed to seed');
            setSuccess('Batch seeded. Redirecting…');
            setTimeout(() => router.push('/admin/content'), 800);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to seed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col gap-5" style={{ maxWidth: 720, color: 'var(--ink)' }}>
            <Link
                href="/admin/content"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back
            </Link>
            <div className="col gap-2">
                <span className="section-mark">admin / content / new batch</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New content batch<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    Seed a content generation batch by country, cities, and conditions.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="card-flat"
                    style={{ padding: '12px 16px', borderColor: 'rgba(255, 90, 46, .35)', background: 'var(--orange-50)', color: 'var(--orange-2)', fontSize: 13 }}
                >
                    {error}
                </div>
            )}
            {success && (
                <div
                    role="status"
                    className="card-flat"
                    style={{ padding: '12px 16px', borderColor: 'rgba(40, 212, 168, .35)', background: 'var(--mint-50)', color: 'var(--mint-3)', fontSize: 13 }}
                >
                    {success}
                </div>
            )}

            <form onSubmit={submit} className="card col gap-4" style={{ padding: 24 }}>
                <div className="form-group">
                    <label className="form-label">Country *</label>
                    <input
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        required
                        placeholder="in, us, uk"
                        className="input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Cities (comma separated)</label>
                    <input
                        value={form.cities}
                        onChange={(e) => setForm({ ...form, cities: e.target.value })}
                        placeholder="mumbai,delhi,bangalore"
                        className="input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Conditions (comma separated slugs)</label>
                    <input
                        value={form.conditions}
                        onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                        placeholder="diabetes-type-2,hypertension"
                        className="input"
                    />
                </div>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={saving} className="btn btn-cobalt">
                        {saving ? 'Seeding…' : 'Seed batch →'}
                    </button>
                    <Link href="/admin/content" className="btn btn-paper">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
