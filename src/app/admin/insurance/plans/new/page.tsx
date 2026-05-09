'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Posts to /api/admin/insurance/plans. The route may not exist yet — the
// form will surface the API error if so. Build the route to accept this shape.
export default function NewInsurancePlanPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        insuranceProviderId: '',
        name: '',
        slug: '',
        planType: 'individual',
        sumInsuredMin: '',
        sumInsuredMax: '',
        annualPremiumMin: '',
        annualPremiumMax: '',
        description: '',
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
                insuranceProviderId: form.insuranceProviderId ? parseInt(form.insuranceProviderId, 10) : null,
                sumInsuredMin: form.sumInsuredMin ? parseFloat(form.sumInsuredMin) : null,
                sumInsuredMax: form.sumInsuredMax ? parseFloat(form.sumInsuredMax) : null,
                annualPremiumMin: form.annualPremiumMin ? parseFloat(form.annualPremiumMin) : null,
                annualPremiumMax: form.annualPremiumMax ? parseFloat(form.annualPremiumMax) : null,
            };
            const res = await fetch('/api/admin/insurance/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || `Failed (HTTP ${res.status})`);
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
                <span className="section-mark">admin / insurance / plans / new</span>
                <h1 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                    New insurance plan<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    Add a new plan offering linked to a carrier.
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
                <Field label="Insurance Provider ID *" value={form.insuranceProviderId} onChange={(v) => setForm({ ...form, insuranceProviderId: v })} required placeholder="numeric id" />
                <Field label="Plan name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />

                <div className="form-group">
                    <label className="form-label">Plan type</label>
                    <select
                        value={form.planType}
                        onChange={(e) => setForm({ ...form, planType: e.target.value })}
                        className="select"
                    >
                        <option value="individual">Individual</option>
                        <option value="family">Family</option>
                        <option value="senior">Senior citizen</option>
                        <option value="critical_illness">Critical illness</option>
                        <option value="group">Group</option>
                    </select>
                </div>

                <Field label="Sum insured min" value={form.sumInsuredMin} onChange={(v) => setForm({ ...form, sumInsuredMin: v })} />
                <Field label="Sum insured max" value={form.sumInsuredMax} onChange={(v) => setForm({ ...form, sumInsuredMax: v })} />
                <Field label="Premium min" value={form.annualPremiumMin} onChange={(v) => setForm({ ...form, annualPremiumMin: v })} />
                <Field label="Premium max" value={form.annualPremiumMax} onChange={(v) => setForm({ ...form, annualPremiumMax: v })} />

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
                        {saving ? 'Creating…' : 'Create plan →'}
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
