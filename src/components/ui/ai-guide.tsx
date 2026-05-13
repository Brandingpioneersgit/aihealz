'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface QuickAction {
    href: string;
    label: string;
    description: string;
    monogram: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        href: '/analyze',
        label: 'Analyze Report',
        description: 'Upload & understand your medical reports',
        monogram: 'AR',
    },
    {
        href: '/symptoms',
        label: 'Check Symptoms',
        description: 'AI-powered symptom analysis',
        monogram: 'CS',
    },
    {
        href: '/chat/consult',
        label: 'AI Care Bot',
        description: 'Get OTC & home remedy advice',
        monogram: 'CB',
    },
    {
        href: '/doctors',
        label: 'Find Doctor',
        description: 'Search specialists near you',
        monogram: 'FD',
    },
    {
        href: '/tools',
        label: 'Health Tools',
        description: 'BMI, BMR, risk calculators',
        monogram: 'HT',
    },
];

export default function AIGuide() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className="col ai-end"
            style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
            }}
        >
            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="card"
                    style={{
                        position: 'relative',
                        marginBottom: 12,
                        padding: 22,
                        width: 'min(320px, calc(100vw - 32px))',
                        animation: 'slide-up 280ms ease-out',
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close AI Health Guide"
                        className="row ai-center center"
                        style={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            width: 28,
                            height: 28,
                            borderRadius: 'var(--r-2)',
                            background: 'transparent',
                            border: '1px solid transparent',
                            color: 'var(--ink-3)',
                            cursor: 'pointer',
                            transition: 'background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-2)';
                            e.currentTarget.style.color = 'var(--ink)';
                            e.currentTarget.style.borderColor = 'var(--rule)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--ink-3)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        ×
                    </button>

                    {/* Header */}
                    <div className="row ai-center gap-3" style={{ marginBottom: 16 }}>
                        <span className="spec-icon" aria-hidden="true">AI</span>
                        <div className="col" style={{ minWidth: 0 }}>
                            <p
                                className="display"
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--ink)',
                                    margin: 0,
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                AI Health Guide
                            </p>
                            <span
                                className="row ai-center gap-1 mono"
                                style={{
                                    fontSize: 10,
                                    color: 'var(--mint-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    fontWeight: 500,
                                    marginTop: 2,
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 999,
                                        background: 'var(--mint)',
                                        animation: 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                    }}
                                />
                                Online
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <p
                        style={{
                            fontSize: 13,
                            color: 'var(--ink-3)',
                            margin: '0 0 14px',
                            lineHeight: 1.5,
                        }}
                    >
                        How can I help you today? Pick an option below.
                    </p>

                    {/* Quick Actions */}
                    <div className="col gap-2">
                        {QUICK_ACTIONS.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                onClick={() => setIsOpen(false)}
                                className="row ai-center gap-3 group"
                                style={{
                                    padding: '10px 12px',
                                    background: 'var(--paper-2)',
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-2)',
                                    color: 'var(--ink-2)',
                                    textDecoration: 'none',
                                    transition: 'background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--paper)';
                                    e.currentTarget.style.borderColor = 'var(--cobalt)';
                                    e.currentTarget.style.color = 'var(--ink)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--paper-2)';
                                    e.currentTarget.style.borderColor = 'var(--rule)';
                                    e.currentTarget.style.color = 'var(--ink-2)';
                                }}
                            >
                                <span
                                    className="row ai-center center mono"
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 'var(--r-2)',
                                        background: 'var(--cobalt-50)',
                                        color: 'var(--cobalt)',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        flexShrink: 0,
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    {action.monogram}
                                </span>
                                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                                    <p
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: 'inherit',
                                            margin: 0,
                                        }}
                                    >
                                        {action.label}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-4)',
                                            margin: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {action.description}
                                    </p>
                                </div>
                                <span
                                    aria-hidden="true"
                                    className="mono"
                                    style={{
                                        color: 'var(--ink-4)',
                                        fontSize: 14,
                                        flexShrink: 0,
                                    }}
                                >
                                    →
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Footer */}
                    <div
                        className="hairline-t"
                        style={{ marginTop: 16, paddingTop: 12, textAlign: 'center' }}
                    >
                        <span
                            className="mono"
                            style={{
                                fontSize: 10,
                                color: 'var(--ink-4)',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Powered by AIHealz Intelligence
                        </span>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="AI Health Guide"
                className="row ai-center center"
                style={{
                    position: 'relative',
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--r-3)',
                    background: 'var(--cobalt)',
                    border: '1px solid var(--cobalt)',
                    color: '#fff',
                    fontFamily: 'var(--display)',
                    fontWeight: 600,
                    fontSize: 18,
                    letterSpacing: '-0.02em',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast), transform var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--cobalt-2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--cobalt)';
                }}
            >
                {isOpen ? '×' : 'AI'}

                {/* Notification dot */}
                {!isOpen && (
                    <span
                        aria-hidden="true"
                        className="row ai-center center mono"
                        style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 18,
                            height: 18,
                            background: 'var(--orange)',
                            color: '#fff',
                            borderRadius: 999,
                            border: '2px solid var(--bg)',
                            fontSize: 9,
                            fontWeight: 700,
                        }}
                    >
                        !
                    </span>
                )}
            </button>
        </div>
    );
}
