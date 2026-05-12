'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MarkdownReply from '@/components/v4/MarkdownReply';
import ThinkingDock from '@/components/v4/ThinkingDock';
import ChatGate, { detectChatGate } from '@/components/chat/ChatGate';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const HEALTH_SEGMENTS = [
    { id: 'symptoms', label: 'Symptom check', prompt: 'I have the following symptoms: ' },
    { id: 'medications', label: 'OTC meds', prompt: 'What OTC medicine can help with ' },
    { id: 'remedies', label: 'Home remedies', prompt: 'What are some home remedies for ' },
    { id: 'nutrition', label: 'Diet & nutrition', prompt: 'What should I eat or avoid if I have ' },
    { id: 'fitness', label: 'Exercise', prompt: 'What exercises are safe for someone with ' },
    { id: 'mental', label: 'Mental wellness', prompt: 'I need help with ' },
    { id: 'pediatric', label: 'Children', prompt: 'My child has ' },
    { id: 'elderly', label: 'Senior care', prompt: 'Health advice for elderly with ' },
    { id: 'lab', label: 'Lab results', prompt: 'Help me understand my lab result: ' },
];

const QUICK_QUESTIONS = [
    'What can help with a headache?',
    'Home remedies for cold and cough',
    'Foods to avoid with diabetes',
    'How to improve sleep quality?',
    'Safe exercises for back pain',
    'When should I see a doctor?',
];

function HealzAIContent() {
    const searchParams = useSearchParams();
    const segmentParam = searchParams.get('segment');
    const conditionParam = searchParams.get('condition');

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamPreview, setStreamPreview] = useState('');
    const [selectedSegment, setSelectedSegment] = useState<string | null>(segmentParam);
    const [recent, setRecent] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Only fire the initial AI message once per ?condition= value. The ref
    // makes the "fire-once" intent explicit so we don't need an exhaustive-
    // deps eslint-disable to suppress sendMessage / messages: even when the
    // effect re-runs because of an unrelated render, the guard is the
    // single source of truth.
    const seededFor = useRef<string | null>(null);
    useEffect(() => {
        if (!conditionParam) return;
        if (seededFor.current === conditionParam) return;
        seededFor.current = conditionParam;
        const initial = `I want to know about ${conditionParam.replace(/-/g, ' ')}`;
        void sendMessage(initial);
        // sendMessage closes over stable setters + the latest isLoading,
        // which we already gate inside the function. Re-running on its
        // identity change would be a no-op thanks to the ref guard above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionParam]);

    async function sendMessage(messageText: string) {
        if (!messageText.trim() || isLoading) return;
        const userMessage: Message = { role: 'user', content: messageText };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStreamPreview('');
        setRecent((prev) => [
            messageText.length > 60 ? messageText.slice(0, 60) + '…' : messageText,
            ...prev.filter((r) => r !== messageText),
        ].slice(0, 5));

        const payload = {
            messages: [...messages, userMessage].map((m) => ({
                role: m.role,
                content: m.content,
            })),
            segment: selectedSegment,
            stream: true,
        };

        try {
            const response = await fetch('/api/bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (await detectChatGate(response)) return;

            if (!response.ok || !response.body) {
                // Fallback to JSON if the server didn't accept streaming.
                const data = await response.json().catch(() => ({}));
                const reply =
                    data.reply ||
                    'I apologize, but I encountered an error. Please try again.';
                setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            let assembled = '';
            let currentEvent = '';

            for (;;) {
                const { value, done } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });

                // SSE frames are separated by blank lines (\n\n)
                let split: number;
                while ((split = buf.indexOf('\n\n')) !== -1) {
                    const frame = buf.slice(0, split);
                    buf = buf.slice(split + 2);
                    currentEvent = '';
                    let dataLine = '';
                    for (const line of frame.split('\n')) {
                        if (line.startsWith('event:')) currentEvent = line.slice(6).trim();
                        else if (line.startsWith('data:')) dataLine += line.slice(5).trim();
                    }
                    if (!dataLine) continue;

                    if (currentEvent === 'delta') {
                        try {
                            const { text } = JSON.parse(dataLine);
                            if (typeof text === 'string') {
                                assembled += text;
                                setStreamPreview(assembled);
                            }
                        } catch {
                            /* ignore malformed delta */
                        }
                    } else if (currentEvent === 'error') {
                        // Server now emits a graceful delta+done on exhaustion
                        // instead of an error frame, but if we still receive one
                        // (legacy / unknown), fall back to a neutral message —
                        // NEVER expose the upstream error string to the user.
                        assembled =
                            assembled ||
                            "I'm taking a moment to think on that one — could you try sending again?";
                    }
                }
            }

            const final =
                assembled.trim() ||
                'I apologize, but I encountered an error. Please try again.';
            setMessages((prev) => [...prev, { role: 'assistant', content: final }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Network error occurred. Please try again.' },
            ]);
        } finally {
            setIsLoading(false);
            setStreamPreview('');
        }
    }

    /**
     * Append a "while you wait" detail chip to the input field so the user
     * can supplement their question without interrupting the in-flight one.
     */
    function appendDetail(detail: string) {
        setInput(prev => (prev ? `${prev}\n\n${detail} ` : `${detail} `));
    }

    function handleSegmentClick(segment: typeof HEALTH_SEGMENTS[number]) {
        setSelectedSegment(segment.id);
        setInput(segment.prompt);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        sendMessage(input);
    }

    const segmentLabel =
        HEALTH_SEGMENTS.find((s) => s.id === selectedSegment)?.label || 'Symptom check';

    return (
        <div
            className="v4-root"
            style={{ background: 'var(--bg)', minHeight: '100vh' }}
        >
            <div
                className="row gap-5 ai-start"
                style={{
                    padding: '32px clamp(16px, 4vw, 28px) 64px',
                    maxWidth: 1180,
                    margin: '0 auto',
                    flexWrap: 'wrap',
                }}
            >
                <aside
                    className="col gap-2 healz-ai-aside"
                    style={{ flex: '1 1 240px', minWidth: 0 }}
                >
                    <span className="section-mark" style={{ marginBottom: 6 }}>
                        healz ai
                    </span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 32,
                            lineHeight: 1,
                            marginBottom: 8,
                            letterSpacing: '-0.035em',
                            fontWeight: 600,
                            margin: 0,
                        }}
                    >
                        Ask Healz — AI medical assistant
                    </h1>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
                        Trained on the full aihealz library + 47 board-certified reviewers.
                    </div>

                    <div className="col gap-1">
                        {HEALTH_SEGMENTS.map((seg) => {
                            const active = selectedSegment === seg.id;
                            return (
                                <button
                                    key={seg.id}
                                    type="button"
                                    onClick={() => handleSegmentClick(seg)}
                                    className={
                                        active
                                            ? 'v4-btn v4-btn-paper'
                                            : 'v4-btn v4-btn-ghost'
                                    }
                                    style={{
                                        justifyContent: 'flex-start',
                                        padding: '8px 12px',
                                        fontSize: 13,
                                    }}
                                >
                                    {seg.label}
                                </button>
                            );
                        })}
                    </div>

                    {recent.length > 0 && (
                        <div
                            className="hairline-t"
                            style={{ marginTop: 14, paddingTop: 14 }}
                        >
                            <div className="kicker" style={{ marginBottom: 8 }}>
                                <span className="dot" /> recent
                            </div>
                            <div className="col gap-1">
                                {recent.map((r) => (
                                    <span
                                        key={r}
                                        style={{ fontSize: 13, color: 'var(--ink-3)' }}
                                    >
                                        · {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                <div
                    className="card"
                    style={{
                        flex: '1 1 580px',
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 680,
                        minWidth: 0,
                    }}
                >
                    <div
                        className="row between hairline-b"
                        style={{ padding: '14px 22px' }}
                    >
                        <div className="row gap-2 ai-center">
                            <div
                                className="spec-icon"
                                style={{
                                    width: 28,
                                    height: 28,
                                    fontSize: 13,
                                    background: 'var(--cobalt)',
                                }}
                            >
                                AI
                            </div>
                            <span style={{ fontWeight: 500, fontSize: 14 }}>
                                {segmentLabel}
                            </span>
                            <span className="pill pill-mint">
                                <span
                                    className="pill-dot"
                                    style={{ background: 'var(--mint)' }}
                                />
                                safety-checked
                            </span>
                        </div>
                        <div className="row gap-1">
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        navigator?.share &&
                                        messages.length > 0
                                    ) {
                                        navigator
                                            .share({
                                                title: 'Healz AI conversation',
                                                text: messages
                                                    .map(
                                                        (m) =>
                                                            `${m.role === 'user' ? 'You' : 'Healz AI'}: ${m.content}`,
                                                    )
                                                    .join('\n\n'),
                                            })
                                            .catch((err) => {
                                                // AbortError = user cancelled the share sheet — fine.
                                                if (err?.name !== 'AbortError') {
                                                    console.warn('Share failed:', err);
                                                }
                                            });
                                    }
                                }}
                                className="v4-btn v4-btn-ghost v4-btn-sm"
                            >
                                ↗ Share
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMessages([]);
                                    setSelectedSegment(null);
                                    setInput('');
                                }}
                                className="v4-btn v4-btn-ghost v4-btn-sm"
                            >
                                + New chat
                            </button>
                        </div>
                    </div>

                    {messages.length === 0 ? (
                        <div
                            className="col gap-5"
                            style={{
                                padding: 32,
                                flex: 1,
                                overflow: 'auto',
                            }}
                        >
                            <div
                                className="display"
                                style={{
                                    fontSize: 28,
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.025em',
                                    fontWeight: 500,
                                    maxWidth: 520,
                                }}
                            >
                                What can I help you understand?
                            </div>
                            <div className="col gap-3">
                                <div
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '.08em',
                                    }}
                                >
                                    quick questions
                                </div>
                                <div
                                    className="row gap-2"
                                    style={{ flexWrap: 'wrap' }}
                                >
                                    {QUICK_QUESTIONS.map((q) => (
                                        <button
                                            key={q}
                                            type="button"
                                            onClick={() => sendMessage(q)}
                                            className="pill"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div
                                className="card-quiet"
                                style={{ padding: 14 }}
                            >
                                <div
                                    className="kicker"
                                    style={{ marginBottom: 6 }}
                                >
                                    <span className="dot" /> medical disclaimer
                                </div>
                                <div
                                    className="muted"
                                    style={{ fontSize: 13, lineHeight: 1.55 }}
                                >
                                    HealzAI provides general health information only. It is not
                                    a substitute for professional medical advice. For serious
                                    symptoms or emergencies, consult a healthcare provider
                                    immediately.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="col gap-5"
                            style={{
                                padding: 32,
                                flex: 1,
                                overflow: 'auto',
                            }}
                        >
                            {messages.map((m, i) => (
                                <div key={i} className="row ai-start gap-3">
                                    {m.role === 'assistant' ? (
                                        <div
                                            className="spec-icon"
                                            style={{
                                                flexShrink: 0,
                                                background: 'var(--cobalt)',
                                            }}
                                        >
                                            AI
                                        </div>
                                    ) : (
                                        <div
                                            className="placeholder"
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 'var(--r-2)',
                                                fontSize: 10,
                                                flexShrink: 0,
                                            }}
                                        >
                                            YOU
                                        </div>
                                    )}
                                    <div
                                        className="col gap-1"
                                        style={{
                                            flex: 1,
                                            maxWidth: 680,
                                            minWidth: 0,
                                        }}
                                    >
                                        <div
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--ink-3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '.08em',
                                            }}
                                        >
                                            {m.role === 'user' ? 'You' : 'Healz AI'}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: m.role === 'assistant' ? 15 : 14,
                                                lineHeight: 1.6,
                                                color:
                                                    m.role === 'user'
                                                        ? 'var(--ink)'
                                                        : 'var(--ink-2)',
                                                whiteSpace: m.role === 'user' ? 'pre-wrap' : 'normal',
                                            }}
                                        >
                                            {m.role === 'assistant' ? (
                                                <MarkdownReply>{m.content}</MarkdownReply>
                                            ) : (
                                                m.content
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <ThinkingDock
                                    lastUserMessage={
                                        [...messages].reverse().find((m) => m.role === 'user')
                                            ?.content || ''
                                    }
                                    onAddDetail={appendDetail}
                                    streamPreview={streamPreview}
                                />
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="hairline-t"
                        style={{ padding: 18 }}
                    >
                        <div
                            className="card-flat row ai-center"
                            style={{ padding: 6, gap: 6 }}
                        >
                            <input
                                className="v4-input"
                                placeholder="Ask anything — symptoms, results, options…"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    flex: 1,
                                }}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <Link
                                href="/analyze"
                                className="v4-btn v4-btn-ghost v4-btn-sm"
                            >
                                ↑ Attach
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="v4-btn v4-btn-cobalt v4-btn-sm"
                                style={{
                                    opacity: isLoading || !input.trim() ? 0.5 : 1,
                                }}
                            >
                                Send →
                            </button>
                        </div>
                        <div
                            className="row gap-3 mono"
                            style={{
                                fontSize: 11,
                                marginTop: 10,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '.08em',
                                flexWrap: 'wrap',
                            }}
                        >
                            <span>◆ informational, not diagnostic</span>
                            <span>◆ board-reviewed weekly</span>
                            <span>◆ end-to-end encrypted</span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function HealzAIPage() {
    return (
        <Suspense
            fallback={
                <div
                    className="v4-root"
                    style={{
                        background: 'var(--bg)',
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        className="display"
                        style={{
                            fontSize: 32,
                            color: 'var(--ink-3)',
                            letterSpacing: '-0.025em',
                        }}
                    >
                        loading healz ai
                        <span style={{ color: 'var(--cobalt)' }}>…</span>
                    </div>
                </div>
            }
        >
            <ChatGate
                title="Sign in to chat with Healz AI"
                subtitle="Get 5 free AI messages today — register once, no spam."
            >
                <HealzAIContent />
            </ChatGate>
        </Suspense>
    );
}
