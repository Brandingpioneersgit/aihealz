'use client';

import { useEffect, useState } from 'react';

interface TocItem {
    id: string;
    label: string;
    icon?: string;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
        );

        for (const item of items) {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, [items]);

    return (
        <nav className="card-flat" style={{ padding: 16 }}>
            <div className="section-mark" style={{ marginBottom: 12, paddingLeft: 4 }}>
                On this page
            </div>
            <ol className="clean col gap-1">
                {items.map((item, idx) => {
                    const isActive = activeId === item.id;
                    return (
                        <li key={item.id}>
                            <a
                                href={`#${item.id}`}
                                className="row ai-center gap-2"
                                style={{
                                    padding: '8px 12px',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: isActive ? 'var(--cobalt)' : 'var(--ink-3)',
                                    background: isActive ? 'var(--cobalt-50)' : 'transparent',
                                    borderRadius: 'var(--r-2)',
                                    borderLeft: isActive
                                        ? '2px solid var(--cobalt)'
                                        : '2px solid transparent',
                                    transition:
                                        'color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.color = 'var(--ink)';
                                        e.currentTarget.style.background = 'var(--bg-2)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.color = 'var(--ink-3)';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: isActive ? 'var(--cobalt)' : 'var(--ink-4)',
                                        minWidth: 18,
                                    }}
                                >
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <span style={{ flex: 1, minWidth: 0 }}>{item.label}</span>
                            </a>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
