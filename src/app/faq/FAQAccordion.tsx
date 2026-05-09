'use client';

import { useState } from 'react';

interface QA { q: string; a: string }

export default function FAQAccordion({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            border: '1px solid var(--line, rgba(0,0,0,0.08))',
            borderRadius: 12,
            background: 'var(--card, #fff)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            style={{
              width: '100%',
              padding: '16px 18px',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--ink-1)',
            }}
          >
            <span>{item.q}</span>
            <span aria-hidden style={{ color: 'var(--ink-3)', fontSize: 20, lineHeight: 1 }}>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div style={{ padding: '0 18px 18px', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
