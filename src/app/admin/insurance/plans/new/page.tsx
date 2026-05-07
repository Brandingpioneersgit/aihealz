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
    <div className="max-w-2xl">
      <Link href="/admin/insurance" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Insurance Plan</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
        <Field label="Insurance Provider ID *" value={form.insuranceProviderId} onChange={(v) => setForm({ ...form, insuranceProviderId: v })} required placeholder="numeric id" />
        <Field label="Plan Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Plan Type</label>
          <select value={form.planType} onChange={(e) => setForm({ ...form, planType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="individual">Individual</option>
            <option value="family">Family</option>
            <option value="senior">Senior Citizen</option>
            <option value="critical_illness">Critical Illness</option>
            <option value="group">Group</option>
          </select>
        </div>
        <Field label="Sum Insured Min" value={form.sumInsuredMin} onChange={(v) => setForm({ ...form, sumInsuredMin: v })} />
        <Field label="Sum Insured Max" value={form.sumInsuredMax} onChange={(v) => setForm({ ...form, sumInsuredMax: v })} />
        <Field label="Premium Min" value={form.annualPremiumMin} onChange={(v) => setForm({ ...form, annualPremiumMin: v })} />
        <Field label="Premium Max" value={form.annualPremiumMax} onChange={(v) => setForm({ ...form, annualPremiumMax: v })} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{saving ? 'Creating…' : 'Create Plan'}</button>
          <Link href="/admin/insurance" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
    </div>
  );
}
