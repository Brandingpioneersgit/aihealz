'use client';

import { useState, useRef, useEffect, Suspense, useMemo, lazy } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';

// DOMPurify is browser-only; on the server it's a stub. Resolve the actual
// sanitizer lazily so SSR/prerender doesn't blow up calling .sanitize() on a
// shape that isn't fully realised yet.
function sanitize(html: string, opts: Parameters<typeof DOMPurify.sanitize>[1]): string {
    if (typeof window === 'undefined') return html;
    // The dompurify ESM default may itself be the API or have it nested under
    // `.default` depending on how the bundler resolved the package.
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

const QUICK_PROMPTS = [
    { label: 'What is CBC test?', query: 'What is a Complete Blood Count (CBC) test and why is it done?' },
    { label: 'Thyroid tests', query: 'What are the different thyroid tests and when should I get them?' },
    { label: 'Fasting requirements', query: 'Which tests require fasting and for how long?' },
    { label: 'Diabetes tests', query: 'What tests are used to diagnose or monitor diabetes?' },
    { label: 'Home collection', query: 'Which tests can be collected at home?' },
    { label: 'Cholesterol test', query: 'What does a lipid profile test measure?' },
];

// Lazy content links
const ContentLinksSection = lazy(() => Promise.resolve({
    default: ({ links }: { links: ContentLink[] }) => (
        <div
            style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid var(--rule)',
            }}
        >
            <div className="row gap-2 ai-center" style={{ marginBottom: 10 }}>
                <span
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    Book these tests
                </span>
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {links.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.url}
                        className="pill pill-cobalt"
                        style={{ textTransform: 'none' }}
                    >
                        {link.text} →
                    </Link>
                ))}
            </div>
        </div>
    )
}));

// Escape HTML
function escapeHtml(text: string): string {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

// Format markdown
function formatMarkdown(md: string): string {
    const escaped = escapeHtml(md);
    const html = escaped
        .replace(/^### (.+)$/gm, '<h4 style="font-size:14px;font-weight:600;color:var(--ink);margin:14px 0 6px;">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 style="font-size:15px;font-weight:600;color:var(--ink);margin:18px 0 8px;">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink);font-weight:600;">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em style="color:var(--cobalt);">$1</em>')
        .replace(/`(.+?)`/g, '<code style="background:var(--cobalt-50);color:var(--cobalt);padding:1px 6px;border-radius:2px;font-size:12px;font-family:var(--mono);">$1</code>')
        .replace(/^[-•] (.+)$/gm, '<li style="display:flex;gap:8px;margin:4px 0;"><span style="width:5px;height:5px;border-radius:99px;background:var(--cobalt);margin-top:8px;flex-shrink:0;"></span><span>$1</span></li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li style="display:flex;gap:8px;margin:4px 0;"><span style="color:var(--cobalt);font-family:var(--mono);font-weight:500;font-size:12px;min-width:20px;">$1.</span><span>$2</span></li>')
        .replace(/\n{2,}/g, '</p><p style="margin:0 0 12px;color:var(--ink-2);line-height:1.6;">')
        .replace(/\n/g, '<br/>')
        .replace(/^/, '<p style="margin:0 0 12px;color:var(--ink-2);line-height:1.6;">')
        .replace(/$/, '</p>');

    return sanitize(html, {
        ALLOWED_TAGS: ['h3', 'h4', 'p', 'br', 'strong', 'em', 'code', 'li', 'span'],
        ALLOWED_ATTR: ['class', 'style'],
    });
}

function DiagnosticChatContent() {
    const searchParams = useSearchParams();
    const testSlug = searchParams.get('test');
    const providerSlug = searchParams.get('provider');

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: messageText };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/diagnostics/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    history: messages.slice(-6),
                    testSlug,
                    providerSlug,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'I apologize, but I encountered a network error. Please try again.' },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

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
        <main
            style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}
            className="col ai-center"
        >
            <div
                className="col"
                style={{
                    width: '100%',
                    maxWidth: 1024,
                    padding: '32px 16px',
                    flex: 1,
                }}
            >
                {/* Top breadcrumb / hero */}
                <div className="col gap-3" style={{ marginBottom: 20 }}>
                    <Link
                        href="/tests"
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        ← Back to tests
                    </Link>
                    <span className="section-mark">diagnostic assistant</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(28px, 4vw, 40px)',
                            margin: 0,
                            letterSpacing: '-0.03em',
                            fontWeight: 600,
                            lineHeight: 1.05,
                        }}
                    >
                        Ask anything about <span style={{ color: 'var(--cobalt)' }}>lab tests</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
                        Preparation, normal ranges, fasting requirements — answered.
                    </p>
                </div>

                {/* Chat panel */}
                <div
                    className="col"
                    style={{
                        flex: 1,
                        background: 'var(--paper)',
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--r-3)',
                        overflow: 'hidden',
                        minHeight: 560,
                    }}
                >
                    {/* Header bar */}
                    <div
                        className="row between ai-center hairline-b"
                        style={{ padding: '14px 20px' }}
                    >
                        <div className="row gap-3 ai-center">
                            <div className="spec-icon">DX</div>
                            <div className="col">
                                <span style={{ fontSize: 14, fontWeight: 500 }}>Lab test expert</span>
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    diagnostic AI
                                </span>
                            </div>
                        </div>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--mint-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            ● online
                        </span>
                    </div>

                    {/* Messages */}
                    <div
                        className="col gap-4"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 24,
                        }}
                    >
                        {messages.length === 0 ? (
                            <div className="col gap-5 ai-center center" style={{ flex: 1, textAlign: 'center', padding: '24px 12px' }}>
                                <div className="spec-icon" style={{ width: 56, height: 56, fontSize: 22 }}>DX</div>
                                <div className="col gap-2 ai-center">
                                    <h3
                                        className="display"
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 600,
                                            margin: 0,
                                            letterSpacing: '-0.025em',
                                        }}
                                    >
                                        How can I help today?
                                    </h3>
                                    <p
                                        className="muted"
                                        style={{ fontSize: 14, margin: 0, maxWidth: 420 }}
                                    >
                                        Lab tests, preparation requirements, normal ranges, and when you might need them.
                                    </p>
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: 8,
                                        maxWidth: 560,
                                        width: '100%',
                                    }}
                                >
                                    {QUICK_PROMPTS.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage(prompt.query)}
                                            className="card-flat"
                                            style={{
                                                padding: '12px 14px',
                                                fontSize: 13,
                                                color: 'var(--ink-2)',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                background: 'var(--paper)',
                                            }}
                                        >
                                            {prompt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {formattedMessages.map((msg) => (
                                    <div
                                        key={msg.key}
                                        className="row"
                                        style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: '85%',
                                                background: msg.role === 'user' ? 'var(--cobalt)' : 'var(--bg-2)',
                                                color: msg.role === 'user' ? '#fff' : 'var(--ink)',
                                                padding: '14px 18px',
                                                border: msg.role === 'user' ? 'none' : '1px solid var(--rule)',
                                                borderRadius: 'var(--r-3)',
                                                borderTopRightRadius: msg.role === 'user' ? 'var(--r-1)' : 'var(--r-3)',
                                                borderTopLeftRadius: msg.role === 'user' ? 'var(--r-3)' : 'var(--r-1)',
                                            }}
                                        >
                                            {msg.role === 'assistant' && msg.formattedContent ? (
                                                <div>
                                                    <div
                                                        style={{ fontSize: 14 }}
                                                        dangerouslySetInnerHTML={{ __html: msg.formattedContent }}
                                                    />
                                                    {msg.contentLinks.length > 0 && (
                                                        <Suspense fallback={null}>
                                                            <ContentLinksSection links={msg.contentLinks} />
                                                        </Suspense>
                                                    )}
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="row" style={{ justifyContent: 'flex-start' }}>
                                        <div
                                            style={{
                                                background: 'var(--bg-2)',
                                                border: '1px solid var(--rule)',
                                                borderRadius: 'var(--r-3)',
                                                borderTopLeftRadius: 'var(--r-1)',
                                                padding: '14px 18px',
                                            }}
                                        >
                                            <div className="row gap-2 ai-center">
                                                <div className="row gap-1">
                                                    <span
                                                        style={{
                                                            width: 6, height: 6, borderRadius: 99,
                                                            background: 'var(--cobalt)',
                                                            animation: 'pulse-subtle 1s ease-in-out 0s infinite',
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            width: 6, height: 6, borderRadius: 99,
                                                            background: 'var(--cobalt)',
                                                            animation: 'pulse-subtle 1s ease-in-out 150ms infinite',
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            width: 6, height: 6, borderRadius: 99,
                                                            background: 'var(--cobalt)',
                                                            animation: 'pulse-subtle 1s ease-in-out 300ms infinite',
                                                        }}
                                                    />
                                                </div>
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                    Researching…
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div
                        className="hairline-t"
                        style={{ padding: 16, background: 'var(--paper-2)' }}
                    >
                        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about any lab test or diagnostic…"
                                className="input"
                                style={{ paddingRight: 60 }}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="btn btn-cobalt"
                                style={{
                                    position: 'absolute',
                                    right: 6,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    padding: '8px 12px',
                                    minHeight: 0,
                                }}
                            >
                                →
                            </button>
                        </form>
                        <div className="row center gap-3" style={{ marginTop: 10 }}>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                informational only
                            </span>
                            <span style={{ color: 'var(--ink-4)' }}>·</span>
                            <Link
                                href="/diagnostic-labs"
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                Find labs near you →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function DiagnosticChatPage() {
    return (
        <Suspense fallback={
            <main
                style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}
                className="col center ai-center"
            >
                <div className="col gap-3 ai-center">
                    <div className="spec-icon" style={{ width: 48, height: 48 }}>DX</div>
                    <p className="muted" style={{ fontSize: 14, margin: 0 }}>Loading diagnostic assistant…</p>
                </div>
            </main>
        }>
            <DiagnosticChatContent />
        </Suspense>
    );
}
