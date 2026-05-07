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
    <div className="max-w-2xl">
      <Link href="/admin/advertising/pricing" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Pricing Tier</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
        <Field label="Tier Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Placement</label>
          <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="sidebar">Sidebar</option>
            <option value="banner">Banner</option>
            <option value="inline">Inline</option>
            <option value="sponsored_listing">Sponsored Listing</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pricing Model</label>
          <select value={form.pricingModel} onChange={(e) => setForm({ ...form, pricingModel: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="cpm">CPM (per 1,000 impressions)</option>
            <option value="cpc">CPC (per click)</option>
            <option value="flat">Flat (per period)</option>
          </select>
        </div>
        <Field label="Rate *" value={form.rate} onChange={(v) => setForm({ ...form, rate: v })} required placeholder="5.00" />
        <Field label="Currency" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} placeholder="USD, INR" />
        <Field label="Minimum Spend" value={form.minSpend} onChange={(v) => setForm({ ...form, minSpend: v })} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{saving ? 'Creating…' : 'Create Tier'}</button>
          <Link href="/admin/advertising/pricing" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancel</Link>
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
