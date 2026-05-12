'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import Link from 'next/link';

/**
 * ChatGate (v4 Bureau)
 *
 * Blocks any AI chat UI until the visitor has submitted the lead form
 * (name, email, phone, location, doctor/patient/other). After registration,
 * passes through to children. Tracks remaining daily quota.
 *
 * When a child fetch returns HTTP 429 with `reason === 'limit_reached'`,
 * dispatch `window.dispatchEvent(new CustomEvent('chat-gate:limit-reached'))`
 * (or use the `detectChatGate()` helper) to swap the chat surface for a
 * booking CTA.
 */

type ChatGateRole = 'doctor' | 'patient' | 'other';

interface ChatGateStatus {
    registered: boolean;
    bypass: boolean;
    leadId?: string;
    role?: ChatGateRole;
    remaining: number;
    limit: number;
    resetAt: number;
}

interface ChatGateContextValue {
    status: ChatGateStatus | null;
    refresh: () => Promise<void>;
    onLimitHit: (resetAt?: number) => void;
    decrement: () => void;
}

const ChatGateContext = createContext<ChatGateContextValue | null>(null);

export function useChatLead(): ChatGateContextValue {
    const ctx = useContext(ChatGateContext);
    if (!ctx) {
        throw new Error('useChatLead must be used inside <ChatGate>');
    }
    return ctx;
}

interface ChatGateProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export default function ChatGate({
    children,
    title = 'Sign in to start chatting',
    subtitle = 'Tell us who you are and we’ll unlock 5 free AI messages today.',
}: ChatGateProps) {
    const [status, setStatus] = useState<ChatGateStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [limitHitAt, setLimitHitAt] = useState<number | null>(null);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/api/chat-lead', { credentials: 'include' });
            if (!res.ok) return;
            const data = (await res.json()) as ChatGateStatus;
            setStatus(data);
        } catch {
            // network blip — UI will retry on next mount/refresh
        }
    }, []);

    useEffect(() => {
        (async () => {
            await refresh();
            setLoading(false);
        })();
    }, [refresh]);

    const onLimitHit = useCallback((resetAt?: number) => {
        setLimitHitAt(resetAt ?? Date.now() + 24 * 60 * 60 * 1000);
    }, []);

    const decrement = useCallback(() => {
        setStatus((s) => (s ? { ...s, remaining: Math.max(0, s.remaining - 1) } : s));
    }, []);

    useEffect(() => {
        function handler(ev: Event) {
            const detail = (ev as CustomEvent).detail as { resetAt?: number } | undefined;
            onLimitHit(detail?.resetAt);
        }
        function signupHandler() {
            setLimitHitAt(null);
            setStatus((s) => (s ? { ...s, registered: false } : s));
        }
        window.addEventListener('chat-gate:limit-reached', handler);
        window.addEventListener('chat-gate:signup-required', signupHandler);
        return () => {
            window.removeEventListener('chat-gate:limit-reached', handler);
            window.removeEventListener('chat-gate:signup-required', signupHandler);
        };
    }, [onLimitHit]);

    const ctxValue = useMemo<ChatGateContextValue>(
        () => ({ status, refresh, onLimitHit, decrement }),
        [status, refresh, onLimitHit, decrement]
    );

    if (loading) {
        return (
            <div
                className="col ai-center jc-center"
                style={{ minHeight: 360, color: 'var(--ink-3)', fontSize: 13 }}
            >
                Loading…
            </div>
        );
    }

    if (limitHitAt) {
        return <LimitReachedCard resetAt={limitHitAt} />;
    }

    if (!status?.registered) {
        return (
            <SignupForm
                title={title}
                subtitle={subtitle}
                onSuccess={async () => {
                    await refresh();
                }}
            />
        );
    }

    return (
        <ChatGateContext.Provider value={ctxValue}>
            {status.bypass ? null : <QuotaPill remaining={status.remaining} limit={status.limit} />}
            {children}
        </ChatGateContext.Provider>
    );
}

// ── Quota pill ───────────────────────────────────────────────────────────

function QuotaPill({ remaining, limit }: { remaining: number; limit: number }) {
    return (
        <div className="row jc-end" style={{ marginBottom: 8 }}>
            <span
                className="pill"
                style={{
                    background: 'var(--cobalt-50)',
                    borderColor: 'rgba(28,91,255,.22)',
                    color: 'var(--cobalt)',
                    fontSize: 11,
                }}
            >
                <span className="dot" />
                {remaining} of {limit} free messages left today
            </span>
        </div>
    );
}

// ── Limit-reached CTA ─────────────────────────────────────────────────────

function LimitReachedCard({ resetAt }: { resetAt: number }) {
    const resetDate = new Date(resetAt);
    return (
        <div
            className="card col ai-center gap-4"
            style={{ padding: 32, maxWidth: 560, margin: '0 auto', textAlign: 'center' }}
        >
            <span
                className="pill"
                style={{
                    background: 'rgba(255,182,72,.12)',
                    borderColor: 'rgba(255,182,72,.32)',
                    color: 'var(--amber, #b76e00)',
                }}
            >
                Daily limit reached
            </span>
            <h3 className="display" style={{ fontSize: 22, color: 'var(--ink)', margin: 0 }}>
                You’ve used your 5 free AI messages today.
            </h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 420 }}>
                For anything urgent or in-depth, please consult a real doctor — we have specialists
                ready in your area.
            </p>
            <div className="row gap-3 wrap jc-center" style={{ paddingTop: 4 }}>
                <Link
                    href="/book"
                    className="pill pill-cobalt"
                    style={{
                        background: 'var(--cobalt)',
                        color: 'white',
                        borderColor: 'var(--cobalt)',
                        padding: '10px 18px',
                        fontSize: 13,
                        textDecoration: 'none',
                    }}
                >
                    Book a consultation
                </Link>
                <Link
                    href="/doctors"
                    className="pill"
                    style={{
                        padding: '10px 18px',
                        fontSize: 13,
                        textDecoration: 'none',
                    }}
                >
                    Find a doctor near you
                </Link>
            </div>
            <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>
                Free messages reset {resetDate.toLocaleString()}.
            </p>
        </div>
    );
}

// ── Signup form ───────────────────────────────────────────────────────────

interface SignupFormProps {
    title: string;
    subtitle: string;
    onSuccess: () => Promise<void> | void;
}

function SignupForm({ title, subtitle, onSuccess }: SignupFormProps) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        role: 'patient' as ChatGateRole,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch('/api/chat-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data?.error || 'Sign-up failed. Please try again.');
                return;
            }
            await onSuccess();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="card col gap-4"
            style={{ padding: 28, maxWidth: 560, margin: '0 auto' }}
        >
            <div className="col gap-1">
                <p className="kicker">
                    <span className="dot" /> One-time signup
                </p>
                <h3 className="display" style={{ fontSize: 22, color: 'var(--ink)', margin: '4px 0 0' }}>
                    {title}
                </h3>
                <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                    {subtitle}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="col gap-3">
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 12,
                    }}
                >
                    <Field label="Full name" required>
                        <input
                            type="text"
                            className="v4-input"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            required
                            maxLength={120}
                            autoComplete="name"
                        />
                    </Field>
                    <Field label="Email" required>
                        <input
                            type="email"
                            className="v4-input"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            required
                            maxLength={160}
                            autoComplete="email"
                        />
                    </Field>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 12,
                    }}
                >
                    <Field label="Phone" required>
                        <input
                            type="tel"
                            className="v4-input"
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            required
                            maxLength={40}
                            autoComplete="tel"
                        />
                    </Field>
                    <Field label="Country">
                        <input
                            type="text"
                            className="v4-input"
                            value={form.country}
                            onChange={(e) => update('country', e.target.value)}
                            maxLength={80}
                            autoComplete="country-name"
                        />
                    </Field>
                </div>

                <Field label="City">
                    <input
                        type="text"
                        className="v4-input"
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        maxLength={120}
                        autoComplete="address-level2"
                    />
                </Field>

                <div className="col gap-2">
                    <span
                        style={{
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 0.4,
                            color: 'var(--ink-3)',
                        }}
                    >
                        I am a
                    </span>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 8,
                        }}
                    >
                        {(['patient', 'doctor', 'other'] as const).map((r) => {
                            const active = form.role === r;
                            return (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => update('role', r)}
                                    className="pill"
                                    style={{
                                        padding: '10px 14px',
                                        justifyContent: 'center',
                                        background: active ? 'var(--cobalt-50)' : 'transparent',
                                        borderColor: active
                                            ? 'rgba(28,91,255,.32)'
                                            : 'var(--rule)',
                                        color: active ? 'var(--cobalt)' : 'var(--ink)',
                                        textTransform: 'capitalize',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: active ? 500 : 400,
                                    }}
                                >
                                    {r}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <div
                        style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'rgba(220, 38, 38, .08)',
                            border: '1px solid rgba(220, 38, 38, .22)',
                            color: '#b91c1c',
                            fontSize: 12,
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="pill"
                    style={{
                        padding: '12px 18px',
                        justifyContent: 'center',
                        background: submitting ? 'rgba(28,91,255,.55)' : 'var(--cobalt)',
                        color: 'white',
                        borderColor: 'var(--cobalt)',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                >
                    {submitting ? 'Signing in…' : 'Continue to chat'}
                </button>

                <p
                    className="muted"
                    style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.6, marginTop: 2 }}
                >
                    We use your details only to personalize your experience and contact you about
                    your queries. 5 free messages per day.
                </p>
            </form>
        </div>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label className="col gap-1">
            <span
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                    color: 'var(--ink-3)',
                }}
            >
                {label}
                {required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
            </span>
            {children}
        </label>
    );
}

/**
 * Convenience helper for client chat code that has access to the context.
 *   const { onLimitHit, decrement } = useChatLead();
 *   const res = await fetch('/api/bot', { ... });
 *   if (await handleChatResponse(res, { onLimitHit, decrement })) return;
 */
export async function handleChatResponse(
    res: Response,
    handlers: { onLimitHit: (resetAt?: number) => void; decrement: () => void }
): Promise<boolean> {
    if (res.status === 429) {
        const data = await res.clone().json().catch(() => ({}));
        if (data?.error === 'limit_reached') {
            handlers.onLimitHit(typeof data.resetAt === 'number' ? data.resetAt : undefined);
            return true;
        }
    }
    if (res.ok) handlers.decrement();
    return false;
}

/**
 * Context-free helper for legacy chat surfaces. Inspect a fetch Response and
 * dispatch a window event the surrounding <ChatGate> will pick up. Returns
 * `true` when the gate consumed the response (caller should bail out).
 */
export async function detectChatGate(res: Response): Promise<boolean> {
    if (res.status === 401 || res.status === 429) {
        const data = await res.clone().json().catch(() => ({}));
        if (data?.error === 'limit_reached') {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('chat-gate:limit-reached', {
                        detail: { resetAt: data.resetAt },
                    })
                );
            }
            return true;
        }
        if (data?.error === 'signup_required') {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('chat-gate:signup-required'));
            }
            return true;
        }
    }
    return false;
}
