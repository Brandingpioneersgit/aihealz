'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Item = { label: string; href: string };

export default function MobileMenu({ items }: { items: Item[] }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="v4-mobile-menu"
                onClick={() => setOpen(v => !v)}
                className="v4-mobile-toggle v4-btn v4-btn-ghost v4-btn-sm"
                style={{
                    minWidth: 44,
                    minHeight: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {open ? (
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    ) : (
                        <>
                            <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </>
                    )}
                </svg>
            </button>
            {open && (
                <div
                    id="v4-mobile-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        background: 'rgba(15,23,42,.55)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                    onClick={() => setOpen(false)}
                >
                    <nav
                        aria-label="Mobile primary"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'min(360px, 88vw)',
                            background: 'var(--bg, #fff)',
                            color: 'var(--ink-1, #0f172a)',
                            padding: 24,
                            paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close menu"
                            style={{
                                alignSelf: 'flex-end',
                                background: 'transparent',
                                border: 'none',
                                color: 'inherit',
                                fontSize: 18,
                                lineHeight: 1,
                                padding: 12,
                                marginBottom: 8,
                                cursor: 'pointer',
                                minHeight: 44,
                                minWidth: 44,
                            }}
                        >
                            ✕
                        </button>
                        <Link
                            href="/provider/login"
                            onClick={() => setOpen(false)}
                            style={{ padding: '12px 8px', fontWeight: 600, minHeight: 44 }}
                        >
                            Sign in →
                        </Link>
                        <hr style={{ border: 0, borderTop: '1px solid var(--rule, #e5e7eb)', margin: '8px 0' }} />
                        {items.map((it) => (
                            <Link
                                key={it.href}
                                href={it.href}
                                onClick={() => setOpen(false)}
                                style={{
                                    padding: '12px 8px',
                                    fontSize: 15,
                                    minHeight: 44,
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'inherit',
                                }}
                            >
                                {it.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </>
    );
}
