'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function BookingForm() {
    const searchParams = useSearchParams();
    const doctorSlug = searchParams.get('doctor');
    const doctorName = searchParams.get('name');

    const [formData, setFormData] = useState({
        patientName: '',
        phone: '',
        email: '',
        preferredDate: '',
        preferredTime: '',
        reason: '',
        isNewPatient: 'yes',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Warn if no email provided
        if (!formData.email) {
            const proceed = window.confirm(
                'No email provided. Without an email, you will not receive appointment confirmation or reminders. Continue anyway?'
            );
            if (!proceed) {
                setLoading(false);
                return;
            }
        }

        try {
            const res = await fetch('/api/book/doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    doctorSlug,
                    doctorName,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="card col gap-4 ai-center" style={{ padding: 32, textAlign: 'center' }}>
                <span className="pill pill-mint">
                    <span className="pill-dot" style={{ background: 'var(--mint)' }} aria-hidden="true" />
                    Submitted
                </span>
                <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>
                    Appointment request sent
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="muted" style={{ fontSize: 15, margin: 0, maxWidth: 440 }}>
                    Your appointment request has been submitted. The doctor&apos;s office will contact you within 24 hours to confirm.
                </p>
                <Link href="/doctors" className="btn btn-cobalt">
                    Browse more doctors →
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="col gap-2" style={{ marginBottom: 32 }}>
                <span className="section-mark">request appointment</span>
                <h1
                    className="display"
                    style={{
                        fontSize: 'clamp(28px, 4vw, 40px)',
                        lineHeight: 1.05,
                        letterSpacing: '-0.035em',
                        margin: 0,
                        fontWeight: 600,
                    }}
                >
                    {doctorName ? <>Book with <span style={{ color: 'var(--cobalt)' }}>{doctorName}</span></> : 'Request appointment'}
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 16, margin: 0 }}>
                    Fill in your details and we&apos;ll coordinate with the doctor&apos;s office.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="card col gap-5" style={{ padding: 28 }}>
                {error && (
                    <div className="card-quiet" style={{ padding: 12, borderColor: 'rgba(255, 90, 46, .28)', background: 'var(--orange-50)' }}>
                        <span style={{ color: 'var(--orange-2)', fontSize: 13 }}>{error}</span>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label" htmlFor="patientName">Your name *</label>
                    <input
                        id="patientName"
                        type="text"
                        required
                        value={formData.patientName}
                        onChange={e => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                        className="input"
                        placeholder="Enter your full name"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">Phone number *</label>
                        <input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="input"
                            placeholder="+91 9876543210"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email <span style={{ color: 'var(--lemon-2)', fontWeight: 400 }}>(recommended)</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="input"
                            placeholder="your@email.com"
                            autoComplete="email"
                        />
                        <span className="form-hint">For confirmation and reminders</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="preferredDate">Preferred date *</label>
                        <input
                            id="preferredDate"
                            type="date"
                            required
                            value={formData.preferredDate}
                            onChange={e => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="preferredTime">Preferred time</label>
                        <select
                            id="preferredTime"
                            value={formData.preferredTime}
                            onChange={e => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                            className="select"
                        >
                            <option value="">Any time</option>
                            <option value="morning">Morning (9AM - 12PM)</option>
                            <option value="afternoon">Afternoon (12PM - 4PM)</option>
                            <option value="evening">Evening (4PM - 8PM)</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <span className="form-label">Are you a new patient?</span>
                    <div className="row gap-4" style={{ flexWrap: 'wrap' }}>
                        <label className="row gap-2 ai-center" style={{ cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="isNewPatient"
                                value="yes"
                                checked={formData.isNewPatient === 'yes'}
                                onChange={e => setFormData(prev => ({ ...prev, isNewPatient: e.target.value }))}
                                style={{ width: 16, height: 16, accentColor: 'var(--cobalt)' }}
                            />
                            <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>Yes, first visit</span>
                        </label>
                        <label className="row gap-2 ai-center" style={{ cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="isNewPatient"
                                value="no"
                                checked={formData.isNewPatient === 'no'}
                                onChange={e => setFormData(prev => ({ ...prev, isNewPatient: e.target.value }))}
                                style={{ width: 16, height: 16, accentColor: 'var(--cobalt)' }}
                            />
                            <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>No, follow-up</span>
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="reason">Reason for visit</label>
                    <textarea
                        id="reason"
                        value={formData.reason}
                        onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        rows={3}
                        className="textarea"
                        placeholder="Briefly describe your symptoms or reason for consultation..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-cobalt btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {loading ? 'Submitting...' : 'Request appointment →'}
                </button>

                <p className="form-hint" style={{ textAlign: 'center', margin: 0 }}>
                    By submitting, you agree to our{' '}
                    <Link href="/terms" style={{ color: 'var(--cobalt)' }}>Terms of Service</Link> and{' '}
                    <Link href="/privacy" style={{ color: 'var(--cobalt)' }}>Privacy Policy</Link>
                </p>
            </form>
        </>
    );
}

function LoadingFallback() {
    return (
        <div className="col gap-5">
            <div className="col gap-2" style={{ marginBottom: 16 }}>
                <div style={{ height: 11, width: 200, background: 'var(--rule)', borderRadius: 'var(--r-1)' }} />
                <div style={{ height: 36, width: 320, background: 'var(--rule)', borderRadius: 'var(--r-2)' }} />
            </div>
            <div className="card col gap-4" style={{ padding: 28 }}>
                <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                    <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                    <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                </div>
                <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                <div style={{ height: 48, background: 'var(--cobalt-50)', borderRadius: 'var(--r-2)' }} />
            </div>
        </div>
    );
}

export default function BookDoctorPage() {
    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 28px' }} className="col gap-6">
                {/* Breadcrumb */}
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        flexWrap: 'wrap',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/doctors" style={{ color: 'var(--ink-3)' }}>Doctors</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>Book appointment</span>
                </nav>

                <Suspense fallback={<LoadingFallback />}>
                    <BookingForm />
                </Suspense>
            </div>
        </main>
    );
}
