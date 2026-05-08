'use client';

import { useState } from 'react';

interface QA { q: string; a: string }

export default function FAQAccordion({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden hover:border-teal-500/30 transition-colors"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-white font-medium hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-base">{item.q}</span>
              <span aria-hidden className={`text-2xl leading-none transition-transform ${isOpen ? 'rotate-45 text-teal-400' : 'text-slate-500'}`}>+</span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
