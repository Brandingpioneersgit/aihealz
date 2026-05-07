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
    <div className="max-w-md">
      <Link href="/admin/languages" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Language</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required minLength={2} maxLength={5} placeholder="en, hi, fr-CA" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="English" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Native Name</label>
          <input value={form.nativeName} onChange={(e) => setForm({ ...form, nativeName: e.target.value })} placeholder="हिन्दी" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Language'}
          </button>
          <Link href="/admin/languages" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
