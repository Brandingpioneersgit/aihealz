'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type MenuLink = {
    label: string;
    href: string;
    external?: boolean;
    meta?: string;
};

type MenuGroup = {
    title: string;
    accent?: boolean;
    links: MenuLink[];
};

const GROUPS: MenuGroup[] = [
    {
        title: 'AI tools',
        accent: true,
        links: [
            { label: 'Healz AI — chat', href: '/healz-ai' },
            { label: 'AI second opinion', href: '/analyze' },
            { label: 'Symptom checker', href: '/symptoms' },
            { label: 'Health vault', href: '/vault' },
        ],
    },
    {
        title: 'Browse the index',
        links: [
            { label: 'Conditions', href: '/conditions' },
            { label: 'Doctors', href: '/doctors' },
            { label: 'Hospitals', href: '/hospitals' },
            { label: 'Treatments', href: '/treatments' },
            { label: 'Diagnostic labs', href: '/diagnostic-labs' },
            { label: 'Tests', href: '/tests' },
        ],
    },
    {
        title: 'Compare & decide',
        links: [
            { label: 'Cost compare', href: '/treatments' },
            { label: 'Insurance', href: '/insurance' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Book a consult', href: '/book' },
            { label: 'Medical travel — Medcasts', href: 'https://medcasts.com', external: true },
        ],
    },
    {
        title: 'Calculators',
        links: [
            { label: 'BMI', href: '/tools/bmi-calculator' },
            { label: 'Heart risk', href: '/tools/heart-risk-calculator' },
            { label: 'Diabetes risk', href: '/tools/diabetes-risk-calculator' },
            { label: 'Drug interactions', href: '/tools/drug-interactions' },
            { label: 'Pregnancy due date', href: '/tools/pregnancy-due-date-calculator' },
            { label: 'All calculators', href: '/tools' },
        ],
    },
    {
        title: 'For doctors',
        links: [
            { label: 'For Doctors hub', href: '/for-doctors' },
            { label: 'Clinical scores', href: '/for-doctors/clinical-scores' },
            { label: 'Drug dosing', href: '/for-doctors/drug-dosing' },
            { label: 'Surgical checklist', href: '/for-doctors/surgical-checklist' },
            { label: 'Clinical reference', href: '/clinical-reference' },
            { label: 'Get the ethical badge — mdrpedia', href: 'https://mdrpedia.com', external: true },
        ],
    },
    {
        title: 'The Bureau',
        links: [
            { label: 'Editorial board', href: '/editorial-board' },
            { label: 'Blog', href: '/blog' },
            { label: 'About', href: '/about' },
            { label: 'Press', href: '/press' },
            { label: 'Help & FAQ', href: '/help' },
            { label: 'Contact', href: '/contact' },
        ],
    },
];

const PRIMARY_CTAS: MenuLink[] = [
    { label: 'Sign in', href: '/provider/login' },
    { label: 'Analyze a report →', href: '/analyze' },
    { label: 'SOS — emergency', href: '/tools/emergency' },
];

export default function MobileMenu(_props?: { items?: unknown }) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!open) return;
        setMounted(true);
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
                aria-controls="aihealz-fullpage-menu"
                onClick={() => setOpen(v => !v)}
                className="v4-fullpage-toggle v4-btn v4-btn-ghost v4-btn-sm"
                style={{
                    minWidth: 44,
                    minHeight: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    gap: 6,
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {open ? (
                        <path
                            d="M6 6l12 12M18 6L6 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    ) : (
                        <>
                            <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M4 17h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </>
                    )}
                </svg>
                <span
                    className="mono v4-fullpage-toggle-label"
                    style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    {open ? 'Close' : 'Menu'}
                </span>
            </button>

            {(open || mounted) && (
                <div
                    id="aihealz-fullpage-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Site menu"
                    onClick={() => setOpen(false)}
                    onTransitionEnd={() => {
                        if (!open) setMounted(false);
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--bg, #F4F6FA)',
                        opacity: open ? 1 : 0,
                        transition: 'opacity 240ms cubic-bezier(.22,.61,.36,1)',
                        overflowY: 'auto',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: 1280,
                            width: '100%',
                            margin: '0 auto',
                            padding: '20px clamp(16px, 4vw, 28px) 56px',
                            paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 32,
                            transform: open ? 'translateY(0)' : 'translateY(-12px)',
                            transition: 'transform 320ms cubic-bezier(.22,.61,.36,1)',
                        }}
                    >
                        {/* header bar */}
                        <div
                            className="row between ai-center"
                            style={{
                                paddingBottom: 16,
                                borderBottom: '1px solid var(--rule)',
                                flexWrap: 'wrap',
                                gap: 12,
                            }}
                        >
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.10em',
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        display: 'inline-block',
                                        width: 6,
                                        height: 6,
                                        background: 'var(--cobalt)',
                                        borderRadius: 99,
                                        marginRight: 8,
                                        verticalAlign: 'middle',
                                    }}
                                />
                                aihealz / index
                            </span>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close menu"
                                className="v4-btn v4-btn-ghost v4-btn-sm"
                                style={{ minHeight: 40, minWidth: 80 }}
                            >
                                Close ✕
                            </button>
                        </div>

                        {/* primary CTAs */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                        >
                            {PRIMARY_CTAS.map((cta, i) => (
                                <Link
                                    key={cta.href}
                                    href={cta.href}
                                    onClick={() => setOpen(false)}
                                    className="card-ink"
                                    style={{
                                        padding: '18px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: i === 1 ? 'var(--cobalt)' : 'var(--ink)',
                                        borderRadius: 'var(--r-2)',
                                        opacity: open ? 1 : 0,
                                        transform: open ? 'translateY(0)' : 'translateY(8px)',
                                        transition: `opacity 320ms ease ${80 + i * 40}ms, transform 320ms cubic-bezier(.22,.61,.36,1) ${80 + i * 40}ms`,
                                    }}
                                >
                                    <span
                                        className="display"
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 500,
                                            letterSpacing: '-0.015em',
                                            color: 'var(--paper)',
                                        }}
                                    >
                                        {cta.label}
                                    </span>
                                    <span aria-hidden="true" style={{ color: 'rgba(255,255,255,.6)' }}>
                                        →
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* groups grid */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: 32,
                            }}
                        >
                            {GROUPS.map((group, gi) => (
                                <div
                                    key={group.title}
                                    className="col gap-3"
                                    style={{
                                        opacity: open ? 1 : 0,
                                        transform: open ? 'translateY(0)' : 'translateY(12px)',
                                        transition: `opacity 380ms ease ${160 + gi * 50}ms, transform 420ms cubic-bezier(.22,.61,.36,1) ${160 + gi * 50}ms`,
                                    }}
                                >
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: group.accent ? 'var(--cobalt)' : 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.10em',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {group.accent && (
                                            <span
                                                aria-hidden="true"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 6,
                                                    height: 6,
                                                    background: 'var(--cobalt)',
                                                    borderRadius: 99,
                                                    marginRight: 8,
                                                    verticalAlign: 'middle',
                                                }}
                                            />
                                        )}
                                        {group.title}
                                    </span>
                                    <div className="col">
                                        {group.links.map((l, i) => {
                                            const linkStyle: React.CSSProperties = {
                                                padding: '12px 0',
                                                borderBottom:
                                                    i < group.links.length - 1
                                                        ? '1px solid var(--rule)'
                                                        : 'none',
                                                fontSize: 14.5,
                                                color: l.external ? 'var(--cobalt)' : 'var(--ink-2)',
                                                letterSpacing: '-0.005em',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'baseline',
                                                lineHeight: 1.3,
                                            };
                                            return l.external ? (
                                                <a
                                                    key={l.href}
                                                    href={l.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => setOpen(false)}
                                                    style={linkStyle}
                                                >
                                                    <span>
                                                        {l.label}
                                                        <span aria-hidden="true" style={{ marginLeft: 6, opacity: 0.7 }}>
                                                            ↗
                                                        </span>
                                                    </span>
                                                </a>
                                            ) : (
                                                <Link
                                                    key={l.href}
                                                    href={l.href}
                                                    onClick={() => setOpen(false)}
                                                    style={linkStyle}
                                                >
                                                    <span>{l.label}</span>
                                                    {l.meta && (
                                                        <span
                                                            className="mono"
                                                            style={{ fontSize: 10, color: 'var(--ink-4)' }}
                                                        >
                                                            {l.meta}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* footer strip */}
                        <div
                            className="row between ai-center"
                            style={{
                                paddingTop: 24,
                                borderTop: '1px solid var(--rule)',
                                flexWrap: 'wrap',
                                gap: 12,
                            }}
                        >
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                aihealz · vol. 04 · the bureau
                            </span>
                            <Link
                                href="/sitemap"
                                onClick={() => setOpen(false)}
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    fontWeight: 500,
                                }}
                            >
                                Full sitemap →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
