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
    <div className="max-w-2xl">
      <Link href="/admin/content" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">New Content Batch</h1>
      <p className="text-sm text-slate-500 mb-6">Seed a content generation batch by country, cities, and conditions.</p>
      {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{success}</div>}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Country *</label>
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required placeholder="in, us, uk" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cities (comma separated)</label>
          <input value={form.cities} onChange={(e) => setForm({ ...form, cities: e.target.value })} placeholder="mumbai,delhi,bangalore" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Conditions (comma separated slugs)</label>
          <input value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="diabetes-type-2,hypertension" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{saving ? 'Seeding…' : 'Seed Batch'}</button>
          <Link href="/admin/content" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
