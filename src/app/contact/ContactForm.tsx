'use client';

import { useState } from 'react';

export default function ContactForm() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        if (!formData.name.trim()) {
            setStatus('error');
            setErrorMessage('Please enter your name');
            return;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setStatus('error');
            setErrorMessage('Please enter a valid email address');
            return;
        }
        if (!formData.message.trim() || formData.message.length < 10) {
            setStatus('error');
            setErrorMessage('Please enter a message (at least 10 characters)');
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            // Read the body once and validate shape so we can surface real
            // server errors (rate limits, validation) instead of a generic
            // "failed to send" no matter what came back.
            const payload: { success?: boolean; error?: string; id?: number } | null =
                await response.json().catch(() => null);

            if (!response.ok || !payload?.success) {
                const remote = payload?.error?.trim();
                throw new Error(remote || `Failed to send message (status ${response.status})`);
            }

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setStatus('error');
            setErrorMessage(
                err instanceof Error && err.message
                    ? err.message
                    : 'Failed to send message. Please try again or email us directly.'
            );
        }
    };

    if (status === 'success') {
        return (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div
                    className="mono"
                    style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: 'var(--mint-50)',
                        color: 'var(--mint-3)',
                        border: '1px solid rgba(40, 212, 168, .30)',
                        borderRadius: 'var(--r-2)',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        marginBottom: 16,
                    }}
                >
                    ✓ Sent
                </div>
                <h4
                    className="display"
                    style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 600, margin: '0 0 8px' }}
                >
                    Message received.
                </h4>
                <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 20px' }}>
                    We&apos;ll respond within 24 hours.
                </p>
                <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn btn-paper"
                >
                    Send another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="col gap-4">
            <div className="form-group">
                <label htmlFor="contact-name" className="form-label">Name</label>
                <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Your name"
                />
            </div>
            <div className="form-group">
                <label htmlFor="contact-email" className="form-label">Email</label>
                <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="you@email.com"
                />
            </div>
            <div className="form-group">
                <label htmlFor="contact-message" className="form-label">Message</label>
                <textarea
                    id="contact-message"
                    rows={5}
                    required
                    minLength={10}
                    maxLength={2000}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    className="textarea"
                    placeholder="How can we help?"
                />
            </div>

            {status === 'error' && (
                <div
                    role="alert"
                    style={{
                        padding: 12,
                        background: 'var(--orange-50)',
                        border: '1px solid rgba(255, 90, 46, .28)',
                        borderRadius: 'var(--r-2)',
                        color: 'var(--orange-2)',
                        fontSize: 13,
                    }}
                >
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-cobalt btn-lg"
                style={{ width: '100%' }}
            >
                {status === 'loading' ? (
                    <>
                        <svg
                            className="animate-spin"
                            style={{ width: 14, height: 14 }}
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending…
                    </>
                ) : (
                    <>Send message →</>
                )}
            </button>
        </form>
    );
}
