'use client';

import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import ChatGate, { detectChatGate } from '@/components/chat/ChatGate';

// SSR-safe sanitize — DOMPurify is browser-only.
function sanitize(html: string, opts: Parameters<typeof DOMPurify.sanitize>[1]): string {
    if (typeof window === 'undefined') return html;
    const dp = DOMPurify as unknown as { sanitize?: typeof DOMPurify.sanitize; default?: { sanitize: typeof DOMPurify.sanitize } };
    if (typeof dp.sanitize === 'function') return dp.sanitize(html, opts);
    if (dp.default && typeof dp.default.sanitize === 'function') return dp.default.sanitize(html, opts);
    return html;
}
import { extractContentLinks, getClientGeoContext, type ContentLink } from '@/lib/content-linker';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ReferenceChatProps {
    category: string;
    placeholder: string;
    example: string;
    title: string;
}

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

// Lazy-loaded links section
const ContentLinksSection = lazy(() => Promise.resolve({
    default: ({ links }: { links: ContentLink[] }) => (
        <div className="hairline-t" style={{ marginTop: 14, paddingTop: 14 }}>
            <div className="section-mark" style={{ marginBottom: 10 }}>
                Related resources
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {links.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.url}
                        className={`${getPillForType(link.type)} row ai-center gap-1`}
                        style={{
                            textTransform: 'none',
                            padding: '6px 10px',
                            fontSize: 11,
                            cursor: 'pointer',
                        }}
                    >
                        {link.text}
                        <span aria-hidden="true" className="mono" style={{ fontSize: 12, opacity: 0.7 }}>
                            ↗
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

// Markdown → HTML (Bureau-styled, sanitized)
function formatMarkdown(md: string): string {
    const escaped = escapeHtml(md);

    const html = escaped
        .replace(/^### (.+)$/gm, '<h4 style="font-size:14px;font-weight:600;color:var(--ink);margin-top:18px;margin-bottom:8px;display:flex;align-items:center;gap:8px;letter-spacing:-0.015em;"><span style="width:3px;height:14px;background:var(--cobalt);border-radius:1px;"></span>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 style="font-size:16px;font-weight:600;color:var(--ink);margin-top:22px;margin-bottom:8px;letter-spacing:-0.02em;font-family:var(--display);">$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 style="font-size:18px;font-weight:600;color:var(--ink);margin-top:24px;margin-bottom:12px;letter-spacing:-0.02em;font-family:var(--display);">$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink);font-weight:600;">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em style="color:var(--cobalt);">$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg-2);border:1px solid var(--rule);border-radius:var(--r-2);padding:14px;font-size:12px;overflow-x:auto;margin:12px 0;font-family:var(--mono);color:var(--ink-2);"><code>$1</code></pre>')
        .replace(/`(.+?)`/g, '<code style="background:var(--bg-2);color:var(--ink);border:1px solid var(--rule);padding:1px 6px;border-radius:var(--r-1);font-size:12px;font-family:var(--mono);">$1</code>')
        .replace(/^[-•] (.+)$/gm, '<li style="display:flex;align-items:flex-start;gap:8px;margin:4px 0;list-style:none;"><span style="width:5px;height:5px;border-radius:999px;background:var(--cobalt);margin-top:8px;flex-shrink:0;"></span><span>$1</span></li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li style="display:flex;align-items:flex-start;gap:8px;margin:4px 0;list-style:none;"><span style="font-family:var(--mono);color:var(--cobalt);font-weight:600;font-size:12px;min-width:20px;">$1.</span><span>$2</span></li>')
        .replace(/\n{2,}/g, '</p><p style="margin:0 0 10px;color:var(--ink-2);line-height:1.6;font-size:14px;">')
        .replace(/\n/g, '<br/>')
        .replace(/^/, '<p style="margin:0 0 10px;color:var(--ink-2);line-height:1.6;font-size:14px;">')
        .replace(/$/, '</p>');

    return sanitize(html, {
        ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'code', 'pre', 'li', 'ul', 'ol', 'span'],
        ALLOWED_ATTR: ['class', 'style'],
    });
}

export default function ReferenceChat({ category, placeholder, example, title }: ReferenceChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const sendMessage = useCallback(async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;

        const userMsg: Message = { role: 'user', content: msg };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/reference/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    category,
                    history: messages.slice(-6),
                }),
            });

            if (await detectChatGate(res)) { setLoading(false); return; }

            const data = await res.json();
            // Never render server-side error strings as assistant content —
            // they leak technical details like "rate limit exceeded" into
            // the chat. Always fall back to a neutral in-character reply.
            const assistantMsg: Message = {
                role: 'assistant',
                content:
                    data.reply ||
                    "I'm taking a moment to think on that one — could you try sending again?",
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I couldn't reach the network just now — please try sending that again.",
            }]);
        }
        setLoading(false);
        inputRef.current?.focus();
    }, [input, loading, category, messages]);

    const formattedMessages = useMemo(() => {
        const geoContext = getClientGeoContext();
        return messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            return {
                ...msg,
                formattedContent: msg.role === 'assistant' ? formatMarkdown(msg.content) : null,
                contentLinks: msg.role === 'assistant' && isLast ? extractContentLinks(msg.content, undefined, geoContext) : [],
                key: i,
            };
        });
    }, [messages]);

    return (
        <ChatGate
            title="Sign in to use the clinical reference"
            subtitle="Get 5 free AI lookups today — one-time registration."
        >
        <div
            className="card col"
            style={{
                overflow: 'hidden',
                minHeight: 500,
                maxHeight: 700,
            }}
        >
            {/* Header */}
            <div
                className="hairline-b row ai-center gap-3"
                style={{
                    padding: '16px 22px',
                    background: 'var(--paper-2)',
                }}
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
                        {title}
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
                        Clinical AI Assistant
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
                    Ready
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="col gap-4"
                style={{ flex: 1, overflowY: 'auto', padding: 22 }}
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {messages.length === 0 ? (
                    <div
                        className="col ai-center center gap-5"
                        style={{ flex: 1, textAlign: 'center', padding: '32px 16px' }}
                    >
                        <div
                            className="row ai-center center"
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 'var(--r-3)',
                                background: 'var(--cobalt-50)',
                                border: '1px solid rgba(28, 91, 255, .22)',
                                color: 'var(--cobalt)',
                                fontFamily: 'var(--display)',
                                fontWeight: 600,
                                fontSize: 22,
                                letterSpacing: '-0.02em',
                            }}
                            aria-hidden="true"
                        >
                            AI
                        </div>
                        <div className="col gap-2">
                            <h3
                                className="display"
                                style={{
                                    fontSize: 20,
                                    fontWeight: 600,
                                    color: 'var(--ink)',
                                    margin: 0,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Ask about {title}
                            </h3>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: 'var(--ink-3)',
                                    maxWidth: 360,
                                    margin: 0,
                                    lineHeight: 1.55,
                                }}
                            >
                                Get instant, evidence-based clinical information powered by AI.
                            </p>
                        </div>
                        <button
                            onClick={() => sendMessage(example)}
                            className="row ai-center gap-3 group"
                            style={{
                                padding: '10px 16px',
                                background: 'var(--paper-2)',
                                border: '1px solid var(--rule)',
                                borderRadius: 'var(--r-2)',
                                color: 'var(--ink-2)',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontFamily: 'var(--sans)',
                                transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--paper)';
                                e.currentTarget.style.borderColor = 'var(--cobalt)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--paper-2)';
                                e.currentTarget.style.borderColor = 'var(--rule)';
                            }}
                        >
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
                                Try
                            </span>
                            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
                                &quot;{example}&quot;
                            </span>
                            <span aria-hidden="true" className="mono" style={{ color: 'var(--cobalt)', fontSize: 14 }}>
                                →
                            </span>
                        </button>
                    </div>
                ) : (
                    <>
                        {formattedMessages.map((msg) => (
                            <div
                                key={msg.key}
                                className="row"
                                style={{
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '90%',
                                        borderRadius: 'var(--r-3)',
                                        padding: '14px 18px',
                                        background:
                                            msg.role === 'user' ? 'var(--cobalt)' : 'var(--paper-2)',
                                        color: msg.role === 'user' ? '#fff' : 'var(--ink-2)',
                                        border:
                                            msg.role === 'user'
                                                ? '1px solid var(--cobalt)'
                                                : '1px solid var(--rule)',
                                    }}
                                >
                                    {msg.role === 'assistant' && msg.formattedContent ? (
                                        <div>
                                            <div dangerouslySetInnerHTML={{ __html: msg.formattedContent }} />
                                            {msg.contentLinks.length > 0 && (
                                                <Suspense
                                                    fallback={
                                                        <div
                                                            style={{
                                                                height: 36,
                                                                background: 'var(--bg-2)',
                                                                borderRadius: 'var(--r-2)',
                                                                marginTop: 14,
                                                                animation: 'pulse-subtle 1.5s ease-in-out infinite',
                                                            }}
                                                        />
                                                    }
                                                >
                                                    <ContentLinksSection links={msg.contentLinks} />
                                                </Suspense>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                                            {msg.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="row" style={{ justifyContent: 'flex-start' }}>
                                <div
                                    style={{
                                        background: 'var(--paper-2)',
                                        border: '1px solid var(--rule)',
                                        borderRadius: 'var(--r-3)',
                                        padding: '14px 18px',
                                    }}
                                >
                                    <div className="row ai-center gap-2">
                                        <div
                                            className="row ai-center gap-1"
                                            aria-label="AI is typing"
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
                                            Analyzing…
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <style>{`
                    @keyframes bounce {
                        0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
                        40% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>

            {/* Input */}
            <div
                className="hairline-t"
                style={{ padding: 16, background: 'var(--paper-2)' }}
            >
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    style={{ position: 'relative' }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        disabled={loading}
                        aria-label="Type your message"
                        className="input"
                        style={{
                            paddingRight: 56,
                            opacity: loading ? 0.6 : 1,
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        aria-label="Send message"
                        className="row ai-center center"
                        style={{
                            position: 'absolute',
                            right: 6,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--r-2)',
                            background: 'var(--cobalt)',
                            color: '#fff',
                            border: '1px solid var(--cobalt)',
                            cursor: 'pointer',
                            opacity: loading || !input.trim() ? 0.5 : 1,
                            transition: 'background var(--transition-fast)',
                        }}
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </form>
                <div
                    className="mono"
                    style={{
                        textAlign: 'center',
                        marginTop: 10,
                        fontSize: 10,
                        color: 'var(--ink-4)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                    }}
                >
                    For educational purposes only. Not for clinical diagnosis.
                </div>
            </div>
        </div>
        </ChatGate>
    );
}
