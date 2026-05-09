'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Posts to /api/admin/advertising/advertisers. Build the route if it doesn't exist.
export default function NewAdvertiserPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '', contactName: '', contactEmail: '', contactPhone: '',
        company: '', website: '', industry: '', status: 'active', notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/advertising/advertisers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || `Failed (HTTP ${res.status})`);
            }
            router.push('/admin/advertising/advertisers');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col gap-5" style={{ maxWidth: 720, color: 'var(--ink)' }}>
            <Link
                href="/admin/advertising/advertisers"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back
            </Link>
            <div className="col gap-2">
                <span className="section-mark">admin / advertising / advertisers / new</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New advertiser<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
            </div>

            {error && (
                <div role="alert" className="card-flat" style={{ padding: '12px 16px', borderColor: 'rgba(255, 90, 46, .35)', background: 'var(--orange-50)', color: 'var(--orange-2)', fontSize: 13 }}>
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="card col gap-4" style={{ padding: 24 }}>
                <Field label="Advertiser name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <Field label="Contact name" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
                <Field label="Contact email *" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} required />
                <Field label="Contact phone" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} />
                <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
                <Field label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />

                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="select"
                    >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="prospect">Prospect</option>
                    </select>
                </div>

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
                        {saving ? 'Creating…' : 'Create advertiser →'}
                    </button>
                    <Link href="/admin/advertising/advertisers" className="btn btn-paper">Cancel</Link>
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
