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
 * ChatGate
 *
 * Blocks any AI chat UI until the visitor has submitted the lead form
 * (name, email, phone, location, doctor/patient/other). After registration,
 * passes through to children. Tracks remaining daily quota.
 *
 * When a child fetch returns HTTP 429 with `reason === 'limit_reached'`,
 * call `useChatLead().onLimitHit()` to swap the chat surface for a booking CTA.
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

    // Global escape hatch: any chat fetch can dispatch
    // `window.dispatchEvent(new CustomEvent('chat-gate:limit-reached', { detail: { resetAt } }))`
    // and the gate will swap in the booking CTA.
    useEffect(() => {
        function handler(ev: Event) {
            const detail = (ev as CustomEvent).detail as { resetAt?: number } | undefined;
            onLimitHit(detail?.resetAt);
        }
        function signupHandler() {
            // chat fetch saw 401 signup_required (cookie expired / wiped) — reset gate
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

    const decrement = useCallback(() => {
        setStatus((s) => (s ? { ...s, remaining: Math.max(0, s.remaining - 1) } : s));
    }, []);

    const ctxValue = useMemo<ChatGateContextValue>(
        () => ({ status, refresh, onLimitHit, decrement }),
        [status, refresh, onLimitHit, decrement]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-surface-100/40 text-sm">
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
        <div className="flex justify-end mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/5 text-[11px] text-surface-100/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                {remaining} of {limit} free messages left today
            </span>
        </div>
    );
}

// ── Limit-reached CTA ─────────────────────────────────────────────────────

function LimitReachedCard({ resetAt }: { resetAt: number }) {
    const resetDate = new Date(resetAt);
    return (
        <div className="glass-card p-8 max-w-xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs">
                Daily limit reached
            </div>
            <h3 className="text-2xl font-semibold text-surface-100">
                You’ve used your 5 free AI messages today.
            </h3>
            <p className="text-sm text-surface-100/60 leading-relaxed">
                For anything urgent or in-depth, please consult a real doctor — we have specialists
                ready in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                    href="/book"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all"
                >
                    Book a consultation
                </Link>
                <Link
                    href="/doctors"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-surface-100 text-sm font-medium transition-all"
                >
                    Find a doctor near you
                </Link>
            </div>
            <p className="text-xs text-surface-100/30 pt-2">
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
        <div className="glass-card p-6 sm:p-8 max-w-xl mx-auto space-y-5">
            <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-semibold text-surface-100">{title}</h3>
                <p className="text-sm text-surface-100/60">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Full name" required>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            required
                            maxLength={120}
                            autoComplete="name"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Email" required>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            required
                            maxLength={160}
                            autoComplete="email"
                            className={inputCls}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Phone" required>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            required
                            maxLength={40}
                            autoComplete="tel"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Country">
                        <input
                            type="text"
                            value={form.country}
                            onChange={(e) => update('country', e.target.value)}
                            maxLength={80}
                            autoComplete="country-name"
                            className={inputCls}
                        />
                    </Field>
                </div>

                <Field label="City">
                    <input
                        type="text"
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        maxLength={120}
                        autoComplete="address-level2"
                        className={inputCls}
                    />
                </Field>

                <div>
                    <label className="block text-xs font-medium text-surface-100/60 mb-2">
                        I am a
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['patient', 'doctor', 'other'] as const).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => update('role', r)}
                                className={`px-3 py-2.5 rounded-xl border text-sm capitalize transition-all ${
                                    form.role === r
                                        ? 'bg-primary-600/20 border-primary-500/40 text-surface-100'
                                        : 'bg-white/[0.03] border-white/10 text-surface-100/60 hover:bg-white/[0.06]'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
                >
                    {submitting ? 'Signing in…' : 'Continue to chat'}
                </button>

                <p className="text-[11px] text-surface-100/30 text-center leading-relaxed">
                    We use your details only to personalize your experience and contact you about
                    your queries. 5 free messages per day.
                </p>
            </form>
        </div>
    );
}

const inputCls =
    'w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-surface-100 placeholder:text-surface-100/30 focus:outline-none focus:border-primary-500/40 transition-all';

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
        <label className="block">
            <span className="block text-xs font-medium text-surface-100/60 mb-1.5">
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
            </span>
            {children}
        </label>
    );
}

/**
 * Convenience helper for client chat code: wrap your fetch call to detect a
 * 429 limit-reached response and trigger the booking CTA automatically.
 *
 * Usage:
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
