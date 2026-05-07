'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewConditionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    commonName: '',
    scientificName: '',
    slug: '',
    specialistType: '',
    bodySystem: '',
    severityLevel: '',
    icdCode: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: form.slug || form.commonName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to create condition');
      }
      router.push('/admin/conditions');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create condition');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/conditions" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">← Back to conditions</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Condition</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
        <Field label="Common Name *" value={form.commonName} onChange={(v) => setForm({ ...form, commonName: v })} required />
        <Field label="Scientific Name *" value={form.scientificName} onChange={(v) => setForm({ ...form, scientificName: v })} required />
        <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated from common name" />
        <Field label="Specialist Type *" value={form.specialistType} onChange={(v) => setForm({ ...form, specialistType: v })} required placeholder="cardiologist" />
        <Field label="Body System" value={form.bodySystem} onChange={(v) => setForm({ ...form, bodySystem: v })} placeholder="cardiovascular" />
        <Field label="Severity Level" value={form.severityLevel} onChange={(v) => setForm({ ...form, severityLevel: v })} placeholder="mild | moderate | severe" />
        <Field label="ICD Code" value={form.icdCode} onChange={(v) => setForm({ ...form, icdCode: v })} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Condition'}
          </button>
          <Link href="/admin/conditions" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
      />
    </div>
  );
}
