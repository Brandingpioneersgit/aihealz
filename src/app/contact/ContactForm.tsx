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
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Message Sent</h4>
                <p className="text-sm text-slate-400 mb-6">We&apos;ll respond within 24 hours.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                >
                    Send Another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="contact-name" className="block text-sm text-slate-400 mb-2">Name</label>
                <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/60 border border-white/10 focus:border-teal-500/50 outline-none transition-all text-white placeholder:text-slate-600"
                    placeholder="Your name"
                />
            </div>
            <div>
                <label htmlFor="contact-email" className="block text-sm text-slate-400 mb-2">Email</label>
                <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/60 border border-white/10 focus:border-teal-500/50 outline-none transition-all text-white placeholder:text-slate-600"
                    placeholder="you@email.com"
                />
            </div>
            <div>
                <label htmlFor="contact-message" className="block text-sm text-slate-400 mb-2">Message</label>
                <textarea
                    id="contact-message"
                    rows={4}
                    required
                    minLength={10}
                    maxLength={2000}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/60 border border-white/10 focus:border-teal-500/50 outline-none transition-all resize-none text-white placeholder:text-slate-600"
                    placeholder="How can we help?"
                />
            </div>

            {status === 'error' && (
                <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {status === 'loading' ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                    </>
                ) : (
                    'Send Message'
                )}
            </button>
        </form>
    );
}
