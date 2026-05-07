'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTpaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', shortName: '', slug: '', tpaType: 'private', headquartersCity: '',
    website: '', customerCarePhone: '', claimHelpline: '', email: '',
    licenseNumber: '', establishedYear: '', description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, establishedYear: form.establishedYear ? parseInt(form.establishedYear, 10) : undefined };
      const res = await fetch('/api/admin/tpas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to create');
      }
      router.push('/admin/tpas');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/tpas" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New TPA</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
        <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Short Name" value={form.shortName} onChange={(v) => setForm({ ...form, shortName: v })} />
        <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select value={form.tpaType} onChange={(e) => setForm({ ...form, tpaType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <Field label="HQ City" value={form.headquartersCity} onChange={(v) => setForm({ ...form, headquartersCity: v })} />
        <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://" />
        <Field label="Customer Care Phone" value={form.customerCarePhone} onChange={(v) => setForm({ ...form, customerCarePhone: v })} />
        <Field label="Claim Helpline" value={form.claimHelpline} onChange={(v) => setForm({ ...form, claimHelpline: v })} />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="License Number" value={form.licenseNumber} onChange={(v) => setForm({ ...form, licenseNumber: v })} />
        <Field label="Established Year" value={form.establishedYear} onChange={(v) => setForm({ ...form, establishedYear: v })} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{saving ? 'Creating…' : 'Create TPA'}</button>
          <Link href="/admin/tpas" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancel</Link>
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
