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
    <form
      onSubmit={submit}
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{
          flex: 1,
          minWidth: 220,
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid var(--line, rgba(0,0,0,0.12))',
          fontSize: 14,
          background: 'var(--card, #fff)',
        }}
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        style={{
          padding: '10px 18px',
          borderRadius: 10,
          background: 'var(--cobalt)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 500,
          border: 'none',
          cursor: state === 'loading' ? 'wait' : 'pointer',
          opacity: state === 'loading' ? 0.7 : 1,
        }}
      >
        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {state === 'ok' && <p style={{ width: '100%', fontSize: 13, color: '#059669' }}>Subscribed. Welcome aboard.</p>}
      {state === 'err' && <p style={{ width: '100%', fontSize: 13, color: '#dc2626' }}>Could not subscribe. Try again later.</p>}
    </form>
  );
}
