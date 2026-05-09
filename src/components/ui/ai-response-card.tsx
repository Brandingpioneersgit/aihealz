'use client';

import React, { useMemo, useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { extractContentLinks, getClientGeoContext, type ContentLink } from '@/lib/content-linker';

interface AIResponseCardProps {
    content: string;
    isLoading?: boolean;
    userLocation?: string;
    showLinks?: boolean;
    variant?: 'chat' | 'inline' | 'card';
    className?: string;
}

// Map content type → Bureau pill class
function getPillForType(type: ContentLink['type']): string {
    switch (type) {
        case 'test':
            return 'pill pill-cobalt';
        case 'condition':
            return 'pill pill-orange';
        case 'treatment':
            return 'pill pill-mint';
        case 'specialty':
        case 'doctor':
            return 'pill pill-magenta';
        case 'hospital':
            return 'pill';
        case 'tool':
            return 'pill pill-lemon';
        default:
            return 'pill';
    }
}

// Lazy load the links section for performance
const ContentLinksSection = lazy(() => Promise.resolve({
    default: ({ links }: { links: ContentLink[] }) => (
        <div className="hairline-t" style={{ marginTop: 16, paddingTop: 16 }}>
            <div className="row ai-center gap-2" style={{ marginBottom: 12 }}>
                <span className="section-mark">Related on AIHealz</span>
            </div>
            <div
                className="grid"
                style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 8,
                }}
            >
                {links.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.url}
                        className="row ai-center gap-3"
                        style={{
                            padding: '10px 12px',
                            background: 'var(--paper-2)',
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-2)',
                            color: 'var(--ink-2)',
                            transition: 'background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
                            minWidth: 0,
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
                        <div className="col" style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'inherit',
                                    margin: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {link.text}
                            </p>
                            <span
                                className={getPillForType(link.type)}
                                style={{
                                    fontSize: 9,
                                    padding: '2px 6px',
                                    marginTop: 4,
                                    alignSelf: 'flex-start',
                                }}
                            >
                                {link.type === 'test' ? 'Test'
                                    : link.type === 'condition' ? 'Condition'
                                    : link.type === 'treatment' ? 'Treatment'
                                    : link.type === 'specialty' ? 'Specialty'
                                    : link.type === 'doctor' ? 'Doctor'
                                    : link.type === 'hospital' ? 'Hospital'
                                    : link.type === 'tool' ? 'Tool'
                                    : 'More'}
                            </span>
                        </div>
                        <span
                            aria-hidden="true"
                            className="mono"
                            style={{ fontSize: 14, color: 'var(--ink-4)', flexShrink: 0 }}
                        >
                            →
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}));

// Escape HTML entities
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

// Format markdown to HTML — Bureau styling, no gradients/glass
function formatMarkdown(md: string): string {
    const escaped = escapeHtml(md);

    const html = escaped
        // Headings
        .replace(/^### (.+)$/gm, '<h4 style="font-size:14px;font-weight:600;color:var(--ink);margin-top:18px;margin-bottom:8px;display:flex;align-items:center;gap:8px;letter-spacing:-0.015em;"><span style="width:3px;height:14px;background:var(--cobalt);border-radius:1px;"></span>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 style="font-size:16px;font-weight:600;color:var(--ink);margin-top:22px;margin-bottom:8px;display:flex;align-items:center;gap:8px;letter-spacing:-0.02em;"><span style="width:3px;height:18px;background:var(--cobalt);border-radius:1px;"></span>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 style="font-size:18px;font-weight:600;color:var(--ink);margin-top:24px;margin-bottom:12px;letter-spacing:-0.02em;font-family:var(--display);">$1</h2>')
        // Bold & italic
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink);font-weight:600;">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em style="color:var(--cobalt);">$1</em>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg-2);border:1px solid var(--rule);border-radius:var(--r-2);padding:14px;font-size:12px;overflow-x:auto;margin:12px 0;font-family:var(--mono);color:var(--ink-2);"><code>$1</code></pre>')
        // Inline code
        .replace(/`(.+?)`/g, '<code style="background:var(--bg-2);color:var(--ink);border:1px solid var(--rule);padding:1px 6px;border-radius:var(--r-1);font-size:12px;font-family:var(--mono);">$1</code>')
        // Bullet lists
        .replace(/^[-•] (.+)$/gm, '<li style="display:flex;align-items:flex-start;gap:8px;margin:4px 0;list-style:none;"><span style="width:5px;height:5px;border-radius:999px;background:var(--cobalt);margin-top:8px;flex-shrink:0;"></span><span>$1</span></li>')
        // Numbered lists
        .replace(/^(\d+)\. (.+)$/gm, '<li style="display:flex;align-items:flex-start;gap:8px;margin:4px 0;list-style:none;"><span style="font-family:var(--mono);color:var(--cobalt);font-weight:600;font-size:12px;min-width:20px;">$1.</span><span>$2</span></li>')
        // Paragraphs
        .replace(/\n{2,}/g, '</p><p style="margin:0 0 12px;color:var(--ink-2);line-height:1.6;font-size:14px;">')
        .replace(/\n/g, '<br/>')
        // Wrap
        .replace(/^/, '<p style="margin:0 0 12px;color:var(--ink-2);line-height:1.6;font-size:14px;">')
        .replace(/$/, '</p>');

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'code', 'pre', 'li', 'ul', 'ol', 'span'],
        ALLOWED_ATTR: ['class', 'style'],
    });
}

// Loading skeleton
function LoadingSkeleton() {
    return (
        <div style={{ animation: 'pulse-subtle 1.5s ease-in-out infinite' }}>
            <div className="row ai-center gap-3">
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--r-2)',
                        background: 'var(--bg-2)',
                    }}
                />
                <div className="col gap-2" style={{ flex: 1 }}>
                    <div style={{ height: 10, background: 'var(--bg-2)', borderRadius: 999, width: '75%' }} />
                    <div style={{ height: 10, background: 'var(--bg-2)', borderRadius: 999, width: '50%' }} />
                </div>
            </div>
            <div className="col gap-2" style={{ marginTop: 14 }}>
                <div style={{ height: 10, background: 'var(--bg-2)', borderRadius: 999 }} />
                <div style={{ height: 10, background: 'var(--bg-2)', borderRadius: 999, width: '85%' }} />
                <div style={{ height: 10, background: 'var(--bg-2)', borderRadius: 999, width: '70%' }} />
            </div>
        </div>
    );
}

// Typing indicator
function TypingIndicator() {
    return (
        <div className="row ai-center gap-3">
            <span className="spec-icon" style={{ background: 'var(--cobalt)' }}>AI</span>
            <div
                className="row ai-center gap-2"
                style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--r-3)',
                    padding: '10px 14px',
                }}
            >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0ms' }} />
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '150ms' }} />
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '300ms' }} />
            </div>
            <span
                className="mono"
                style={{
                    fontSize: 11,
                    color: 'var(--ink-4)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                }}
            >
                AI is thinking…
            </span>
            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// Links loading placeholder
function LinksPlaceholder() {
    return (
        <div
            className="hairline-t"
            style={{
                marginTop: 16,
                paddingTop: 16,
                animation: 'pulse-subtle 1.5s ease-in-out infinite',
            }}
        >
            <div className="row ai-center gap-2" style={{ marginBottom: 12 }}>
                <div style={{ width: 18, height: 18, borderRadius: 'var(--r-1)', background: 'var(--bg-2)' }} />
                <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 999, width: 100 }} />
            </div>
            <div
                className="grid"
                style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}
            >
                <div style={{ height: 56, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                <div style={{ height: 56, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
            </div>
        </div>
    );
}

export default function AIResponseCard({
    content,
    isLoading = false,
    userLocation,
    showLinks = true,
    variant = 'chat',
    className = '',
}: AIResponseCardProps) {
    const [linksExpanded, setLinksExpanded] = useState(true);

    const contentLinks = useMemo(() => {
        if (!showLinks || isLoading || !content) return [];
        const geoContext = getClientGeoContext();
        return extractContentLinks(content, userLocation, geoContext);
    }, [content, userLocation, showLinks, isLoading]);

    const formattedContent = useMemo(() => {
        if (isLoading || !content) return '';
        return formatMarkdown(content);
    }, [content, isLoading]);

    // Variant container
    const containerClass = {
        chat: 'card-flat',
        inline: '',
        card: 'card',
    }[variant];

    if (isLoading) {
        return (
            <div className={`${containerClass} ${className}`} style={{ padding: 20 }}>
                <TypingIndicator />
            </div>
        );
    }

    return (
        <div className={`${containerClass} ${className}`}>
            {/* Header - card variant only */}
            {variant === 'card' && (
                <div
                    className="hairline-b row ai-center gap-3"
                    style={{ padding: '18px 22px' }}
                >
                    <span className="spec-icon">AI</span>
                    <div className="col" style={{ flex: 1, minWidth: 0 }}>
                        <h3
                            className="display"
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--ink)',
                                margin: 0,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            AIHealz Intelligence
                        </h3>
                        <span
                            className="mono"
                            style={{
                                fontSize: 10,
                                color: 'var(--ink-4)',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}
                        >
                            AI-Powered Health Assistant
                        </span>
                    </div>
                    <div
                        className="row ai-center gap-1 mono"
                        style={{
                            fontSize: 10,
                            color: 'var(--mint-3)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                        }}
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: 999,
                                background: 'var(--mint)',
                            }}
                        />
                        Online
                    </div>
                </div>
            )}

            {/* Content */}
            <div style={{ padding: variant === 'card' ? 22 : variant === 'inline' ? 0 : 20 }}>
                {/* Avatar for chat variant */}
                {variant === 'chat' && (
                    <div className="row ai-center gap-2" style={{ marginBottom: 10 }}>
                        <span
                            className="spec-icon"
                            style={{ width: 26, height: 26, fontSize: 11 }}
                        >
                            AI
                        </span>
                        <span
                            className="mono"
                            style={{
                                fontSize: 10,
                                color: 'var(--ink-4)',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}
                        >
                            AI Response
                        </span>
                    </div>
                )}

                {/* Formatted content */}
                <div dangerouslySetInnerHTML={{ __html: formattedContent }} />

                {/* Content Links */}
                {showLinks && contentLinks.length > 0 && (
                    <div>
                        {/* Collapse toggle for many links */}
                        {contentLinks.length > 4 && (
                            <button
                                onClick={() => setLinksExpanded(!linksExpanded)}
                                className="btn btn-ghost btn-sm"
                                style={{
                                    width: '100%',
                                    marginTop: 16,
                                }}
                            >
                                <span className="mono" style={{ fontSize: 11 }}>
                                    {linksExpanded ? 'Show fewer' : `Show ${contentLinks.length} related pages`}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="mono"
                                    style={{
                                        transition: 'transform var(--transition-normal)',
                                        transform: linksExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        display: 'inline-block',
                                    }}
                                >
                                    ▾
                                </span>
                            </button>
                        )}

                        {linksExpanded && (
                            <Suspense fallback={<LinksPlaceholder />}>
                                <ContentLinksSection links={contentLinks.slice(0, 6)} />
                            </Suspense>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - card variant */}
            {variant === 'card' && (
                <div
                    className="hairline-t mono"
                    style={{
                        padding: '12px 22px',
                        background: 'var(--paper-2)',
                        textAlign: 'center',
                        fontSize: 10,
                        color: 'var(--ink-4)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                    }}
                >
                    For informational purposes only. Consult a healthcare provider for medical advice.
                </div>
            )}
        </div>
    );
}

export { TypingIndicator, LoadingSkeleton };
