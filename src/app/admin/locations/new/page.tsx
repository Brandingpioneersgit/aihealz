'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewLocationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    level: 'city',
    parentId: '',
    isoCode: '',
    timezone: '',
    population: '',
    latitude: '',
    longitude: '',
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
        parentId: form.parentId ? parseInt(form.parentId, 10) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to create');
      }
      router.push('/admin/locations');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/locations" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Location</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
        <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Slug *" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required placeholder="mumbai" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Level *</label>
          <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="continent">Continent</option>
            <option value="country">Country</option>
            <option value="state">State</option>
            <option value="city">City</option>
            <option value="locality">Locality</option>
          </select>
        </div>
        <Field label="Parent ID" value={form.parentId} onChange={(v) => setForm({ ...form, parentId: v })} placeholder="numeric id of parent geo" />
        <Field label="ISO Code" value={form.isoCode} onChange={(v) => setForm({ ...form, isoCode: v })} placeholder="IN, US, MH" />
        <Field label="Timezone" value={form.timezone} onChange={(v) => setForm({ ...form, timezone: v })} placeholder="Asia/Kolkata" />
        <Field label="Population" value={form.population} onChange={(v) => setForm({ ...form, population: v })} />
        <Field label="Latitude" value={form.latitude} onChange={(v) => setForm({ ...form, latitude: v })} />
        <Field label="Longitude" value={form.longitude} onChange={(v) => setForm({ ...form, longitude: v })} />
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Location'}
          </button>
          <Link href="/admin/locations" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancel</Link>
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
