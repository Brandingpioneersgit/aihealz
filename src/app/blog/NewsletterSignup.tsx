'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog' }),
      });
      setState(res.ok ? 'ok' : 'err');
    } catch {
      setState('err');
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-teal-500/50 focus:bg-white/[0.07]"
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {state === 'ok' && <p className="w-full text-sm text-emerald-400">Subscribed. Welcome aboard.</p>}
      {state === 'err' && <p className="w-full text-sm text-rose-400">Could not subscribe. Try again later.</p>}
    </form>
  );
}
