'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';

export type MegaItem = { label: string; href: string; desc?: string };
export type NavItem = {
    label: string;
    href: string;
    /** When present, the item gets a hover/focus mega-menu panel. */
    mega?: { items: MegaItem[]; footerLabel: string; footerHref: string };
};

/**
 * Desktop primary nav. Derives the active item from the current
 * pathname, and renders a Bureau-style mega-menu panel for items that
 * declare one (Conditions, Treatments). Panels open on hover and on
 * keyboard focus, and close on Escape or blur.
 */
export default function NavLinks({ items }: { items: NavItem[] }) {
    const pathname = usePathname() || '/';
    const [openHref, setOpenHref] = useState<string | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelClose = useCallback(() => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    const scheduleClose = useCallback(() => {
        cancelClose();
        closeTimer.current = setTimeout(() => setOpenHref(null), 120);
    }, [cancelClose]);

    return (
        <nav
            aria-label="Primary"
            className="row gap-1 v4-nav-desktop"
            style={{ fontSize: 13 }}
            onKeyDown={(e) => {
                if (e.key === 'Escape') setOpenHref(null);
            }}
        >
            {items.map((item) => {
                const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href + '/'));
                const isOpen = openHref === item.href;

                const linkEl = (
                    <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        aria-haspopup={item.mega ? 'true' : undefined}
                        aria-expanded={item.mega ? isOpen : undefined}
                        onFocus={() => item.mega && setOpenHref(item.href)}
                        style={{
                            padding: '10px 12px',
                            minHeight: 44,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            borderRadius: 'var(--r-2)',
                            color: isActive || isOpen ? 'var(--ink)' : 'var(--ink-3)',
                            background: isActive || isOpen ? 'var(--bg-2)' : 'transparent',
                            fontWeight: isActive ? 500 : 400,
                        }}
                    >
                        {item.label}
                        {item.mega && (
                            <span
                                aria-hidden="true"
                                style={{
                                    fontSize: 9,
                                    color: 'var(--ink-3)',
                                    transform: isOpen ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 120ms',
                                }}
                            >
                                ▾
                            </span>
                        )}
                    </Link>
                );

                if (!item.mega) {
                    return <div key={item.href}>{linkEl}</div>;
                }

                return (
                    <div
                        key={item.href}
                        style={{ position: 'relative' }}
                        onMouseEnter={() => {
                            cancelClose();
                            setOpenHref(item.href);
                        }}
                        onMouseLeave={scheduleClose}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                setOpenHref(null);
                            }
                        }}
                    >
                        {linkEl}
                        {isOpen && (
                            <div
                                role="group"
                                aria-label={`${item.label} menu`}
                                onMouseEnter={cancelClose}
                                onMouseLeave={scheduleClose}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    left: 0,
                                    zIndex: 60,
                                    width: 460,
                                    maxWidth: '90vw',
                                    background: 'var(--paper)',
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-3, 8px)',
                                    boxShadow: '0 12px 32px rgba(10,26,47,0.10)',
                                    padding: 14,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 2,
                                    }}
                                >
                                    {item.mega.items.map((m) => (
                                        <Link
                                            key={m.href}
                                            href={m.href}
                                            className="col"
                                            style={{
                                                padding: '10px 12px',
                                                borderRadius: 'var(--r-2)',
                                                gap: 2,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 13.5,
                                                    fontWeight: 500,
                                                    color: 'var(--ink)',
                                                    letterSpacing: '-0.01em',
                                                }}
                                            >
                                                {m.label}
                                            </span>
                                            {m.desc && (
                                                <span
                                                    style={{
                                                        fontSize: 11.5,
                                                        color: 'var(--ink-3)',
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    {m.desc}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href={item.mega.footerHref}
                                    className="row between ai-center mono"
                                    style={{
                                        marginTop: 8,
                                        padding: '10px 12px',
                                        borderTop: '1px solid var(--rule)',
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                    }}
                                >
                                    {item.mega.footerLabel}
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
