'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AIResponseCard, { TypingIndicator } from '@/components/ui/ai-response-card';
import ChatGate, { detectChatGate } from '@/components/chat/ChatGate';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function AiCareBotContent() {
    const searchParams = useSearchParams();
    const conditionParam = searchParams.get('condition') || '';
    const condition = conditionParam.replace(/-/g, ' ');

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hello! I'm the **AI Care Bot**. ${condition ? `I see you're looking for guidance on **${condition}**.` : ''} I can provide evidence-based Over-The-Counter (OTC) medication suggestions and safe home remedies.\n\nCould you describe the exact symptoms you're feeling right now?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const newMessages = [...messages, { role: 'user', content: input.trim() } as Message];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    condition
                })
            });
            if (await detectChatGate(res)) return;
            const data = await res.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Network error occurred." }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const quickPrompts = useMemo(() => {
        if (condition) {
            return [
                `What are common symptoms of ${condition}?`,
                `What OTC medicines help with ${condition}?`,
                `Home remedies for ${condition}`,
                `When should I see a doctor for ${condition}?`,
            ];
        }
        return [
            'I have a headache and fever',
            'My throat is sore and scratchy',
            'I have an upset stomach',
            'I feel tired and weak',
        ];
    }, [condition]);

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
                    height: 'calc(100vh - 24px)',
                    minHeight: 720,
                }}
            >
                {/* Header */}
                <header
                    className="row between ai-center hairline-b"
                    style={{
                        padding: '16px 20px',
                        background: 'var(--paper)',
                        border: '1px solid var(--rule)',
                        borderBottom: 'none',
                        borderTopLeftRadius: 'var(--r-3)',
                        borderTopRightRadius: 'var(--r-3)',
                        flexWrap: 'wrap',
                        gap: 12,
                    }}
                >
                    <div className="row gap-3 ai-center">
                        <div className="spec-icon">AI</div>
                        <div className="col">
                            <h1
                                className="display"
                                style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}
                            >
                                AI Care Bot
                            </h1>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--mint-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                ● evidence-based · OTC + home remedies
                            </span>
                        </div>
                    </div>
                    <Link href="/symptoms" className="btn btn-paper btn-sm">
                        Symptom checker →
                    </Link>
                </header>

                {/* Disclaimer */}
                <div
                    style={{
                        padding: '10px 20px',
                        borderLeft: '1px solid var(--rule)',
                        borderRight: '1px solid var(--rule)',
                        background: 'var(--orange-50)',
                        borderTop: '1px solid rgba(255, 90, 46, .15)',
                        borderBottom: '1px solid rgba(255, 90, 46, .15)',
                    }}
                >
                    <p
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--orange-2)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            margin: 0,
                            lineHeight: 1.5,
                        }}
                    >
                        Disclaimer · educational only · not a doctor · consult a physician for severe or persistent symptoms.
                    </p>
                </div>

                {/* Chat Area */}
                <div
                    className="col gap-5"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '24px 20px',
                        background: 'var(--paper-2)',
                        borderLeft: '1px solid var(--rule)',
                        borderRight: '1px solid var(--rule)',
                    }}
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className="row"
                            style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                        >
                            {msg.role === 'user' ? (
                                <div
                                    style={{
                                        maxWidth: '85%',
                                        background: 'var(--cobalt)',
                                        color: '#fff',
                                        padding: '14px 18px',
                                        borderRadius: 'var(--r-3)',
                                        borderTopRightRadius: 'var(--r-1)',
                                    }}
                                >
                                    <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{msg.content}</p>
                                </div>
                            ) : (
                                <div style={{ maxWidth: '90%' }}>
                                    <AIResponseCard
                                        content={msg.content}
                                        variant="chat"
                                        showLinks={i === messages.length - 1}
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="row" style={{ justifyContent: 'flex-start' }}>
                            <div
                                style={{
                                    background: 'var(--paper)',
                                    border: '1px solid var(--rule)',
                                    padding: '14px 18px',
                                    borderRadius: 'var(--r-3)',
                                    borderTopLeftRadius: 'var(--r-1)',
                                }}
                            >
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} style={{ height: 1, flexShrink: 0 }} />
                </div>

                {/* Quick prompts */}
                {messages.length < 3 && !isLoading && (
                    <div
                        className="col gap-2"
                        style={{
                            padding: '12px 20px 14px',
                            borderLeft: '1px solid var(--rule)',
                            borderRight: '1px solid var(--rule)',
                            background: 'var(--paper-2)',
                        }}
                    >
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Quick prompts
                        </span>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            {quickPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(prompt);
                                        inputRef.current?.focus();
                                    }}
                                    className="pill"
                                    style={{ textTransform: 'none', cursor: 'pointer' }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div
                    style={{
                        padding: '16px 20px',
                        background: 'var(--paper)',
                        border: '1px solid var(--rule)',
                        borderTop: 'none',
                        borderBottomLeftRadius: 'var(--r-3)',
                        borderBottomRightRadius: 'var(--r-3)',
                    }}
                >
                    <form onSubmit={sendMessage} style={{ position: 'relative', display: 'flex' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            placeholder="Describe your symptoms (e.g., I have a sore throat and mild fever)…"
                            className="input"
                            style={{ paddingRight: 60 }}
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
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
                    <div
                        className="row center gap-3"
                        style={{ marginTop: 10 }}
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
                            powered by aihealz intelligence
                        </span>
                        <span style={{ color: 'var(--ink-4)' }}>·</span>
                        <Link
                            href="/tools"
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Health calculators →
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

function LoadingFallback() {
    return (
        <main
            style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}
            className="col center ai-center"
        >
            <div className="col gap-3 ai-center">
                <div className="spec-icon" style={{ width: 48, height: 48 }}>AI</div>
                <p className="muted" style={{ fontSize: 14, margin: 0 }}>Loading AI Care Bot…</p>
            </div>
        </main>
    );
}

export default function AiCareBotPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ChatGate
                title="Sign in to talk to the AI Care Bot"
                subtitle="Get 5 free AI messages today — register once to continue."
            >
                <AiCareBotContent />
            </ChatGate>
        </Suspense>
    );
}
