'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Posts to /api/admin/diagnostics/packages. Build the route to accept this shape.
export default function NewDiagnosticPackagePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    providerId: '',
    name: '',
    slug: '',
    packageType: 'health_checkup',
    targetAudience: '',
    price: '',
    mrpPrice: '',
    fastingRequired: false,
    homeCollection: false,
    isFeatured: false,
    isActive: true,
    description: '',
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
        providerId: form.providerId ? parseInt(form.providerId, 10) : null,
        price: form.price ? parseFloat(form.price) : null,
        mrpPrice: form.mrpPrice ? parseFloat(form.mrpPrice) : null,
      };
      const res = await fetch('/api/admin/diagnostics/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed (HTTP ${res.status})`);
      }
      router.push('/admin/diagnostics/packages');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/diagnostics/packages" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Health Package</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
        <Field label="Provider ID *" value={form.providerId} onChange={(v) => setForm({ ...form, providerId: v })} required placeholder="numeric diagnostic provider id" />
        <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Package Type</label>
          <select value={form.packageType} onChange={(e) => setForm({ ...form, packageType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="health_checkup">Health Checkup</option>
            <option value="executive">Executive</option>
            <option value="senior">Senior</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="cardiac">Cardiac</option>
            <option value="diabetes">Diabetes</option>
          </select>
        </div>
        <Field label="Target Audience" value={form.targetAudience} onChange={(v) => setForm({ ...form, targetAudience: v })} placeholder="men, women, seniors" />
        <Field label="Price *" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required placeholder="2999" />
        <Field label="MRP" value={form.mrpPrice} onChange={(v) => setForm({ ...form, mrpPrice: v })} placeholder="4999" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-700">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.fastingRequired} onChange={(e) => setForm({ ...form, fastingRequired: e.target.checked })} /> Fasting required</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.homeCollection} onChange={(e) => setForm({ ...form, homeCollection: e.target.checked })} /> Home collection</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{saving ? 'Creating…' : 'Create Package'}</button>
          <Link href="/admin/diagnostics/packages" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancel</Link>
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
