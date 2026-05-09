'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COMPANY_TYPES = [
    { value: 'clinic', label: 'Clinic / Medical Practice' },
    { value: 'hospital', label: 'Hospital / Healthcare Network' },
    { value: 'diagnostic', label: 'Diagnostic Lab' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'pharma', label: 'Pharmaceutical Company' },
    { value: 'medtech', label: 'Medical Device / MedTech' },
    { value: 'insurance', label: 'Health Insurance' },
    { value: 'wellness', label: 'Wellness / Fitness' },
    { value: 'other', label: 'Other Healthcare Business' },
];

const BUDGET_RANGES = [
    { value: 'under-500', label: 'Under $500/mo' },
    { value: '500-2000', label: '$500 – $2,000/mo' },
    { value: '2000-5000', label: '$2,000 – $5,000/mo' },
    { value: '5000-10000', label: '$5,000 – $10,000/mo' },
    { value: 'over-10000', label: '$10,000+/mo' },
    { value: 'undecided', label: 'Not sure yet' },
];

const REGIONS = [
    { value: 'india', label: 'India' },
    { value: 'usa', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'uae', label: 'UAE' },
    { value: 'australia', label: 'Australia' },
    { value: 'canada', label: 'Canada' },
    { value: 'germany', label: 'Germany' },
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'kenya', label: 'Kenya' },
    { value: 'south-africa', label: 'South Africa' },
    { value: 'global', label: 'Global / Multiple' },
];

export default function AdvertiseEnquiryPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        companyName: '',
        companyType: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        adBudget: '',
        targetRegions: [] as string[],
        message: '',
    });

    const handleRegionToggle = (region: string) => {
        setForm((prev) => ({
            ...prev,
            targetRegions: prev.targetRegions.includes(region)
                ? prev.targetRegions.filter((r) => r !== region)
                : [...prev.targetRegions, region],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/ads/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit enquiry');
            }

            router.push('/advertise/success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 28px' }} className="col gap-7">
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
                    <Link href="/advertise" style={{ color: 'var(--ink-3)' }}>Advertise</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>Enquiry</span>
                </nav>

                {/* Hero */}
                <header className="col gap-4">
                    <span className="section-mark">enquiry / start advertising</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5.5vw, 56px)',
                            lineHeight: 1.0,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        Start advertising on <span style={{ color: 'var(--cobalt)' }}>aihealz</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', margin: 0, maxWidth: 640 }}>
                        Fill the form below. Our team replies within 24 hours.
                    </p>
                </header>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="card col gap-7" style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
                    {/* Section 1: Company */}
                    <section className="col gap-4">
                        <div className="row gap-3 ai-center">
                            <span className="spec-icon">01</span>
                            <h2
                                className="display"
                                style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                            >
                                Company information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="companyName">
                                    Company name <span style={{ color: 'var(--orange-2)' }}>*</span>
                                </label>
                                <input
                                    id="companyName"
                                    type="text"
                                    required
                                    value={form.companyName}
                                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                    className="input"
                                    placeholder="Your company name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="companyType">
                                    Company type <span style={{ color: 'var(--orange-2)' }}>*</span>
                                </label>
                                <select
                                    id="companyType"
                                    required
                                    value={form.companyType}
                                    onChange={(e) => setForm({ ...form, companyType: e.target.value })}
                                    className="select"
                                >
                                    <option value="">Select type…</option>
                                    {COMPANY_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" htmlFor="website">Website</label>
                                <input
                                    id="website"
                                    type="url"
                                    value={form.website}
                                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                                    className="input"
                                    placeholder="https://your-website.com"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="hairline" />

                    {/* Section 2: Contact */}
                    <section className="col gap-4">
                        <div className="row gap-3 ai-center">
                            <span className="spec-icon">02</span>
                            <h2
                                className="display"
                                style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                            >
                                Contact information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="contactName">
                                    Your name <span style={{ color: 'var(--orange-2)' }}>*</span>
                                </label>
                                <input
                                    id="contactName"
                                    type="text"
                                    required
                                    value={form.contactName}
                                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                                    className="input"
                                    placeholder="Full name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">
                                    Email address <span style={{ color: 'var(--orange-2)' }}>*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input"
                                    placeholder="you@company.com"
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" htmlFor="phone">Phone number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="input"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="hairline" />

                    {/* Section 3: Campaign */}
                    <section className="col gap-4">
                        <div className="row gap-3 ai-center">
                            <span className="spec-icon">03</span>
                            <h2
                                className="display"
                                style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                            >
                                Campaign details
                            </h2>
                        </div>

                        <div className="form-group">
                            <span className="form-label">Monthly advertising budget</span>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: 8,
                                }}
                            >
                                {BUDGET_RANGES.map((b) => {
                                    const active = form.adBudget === b.value;
                                    return (
                                        <button
                                            type="button"
                                            key={b.value}
                                            onClick={() => setForm({ ...form, adBudget: b.value })}
                                            className="btn"
                                            style={{
                                                padding: '12px 14px',
                                                fontSize: 13,
                                                background: active ? 'var(--cobalt-50)' : 'var(--paper)',
                                                color: active ? 'var(--cobalt)' : 'var(--ink-2)',
                                                borderColor: active ? 'rgba(28, 91, 255, .35)' : 'var(--rule)',
                                                fontWeight: active ? 500 : 400,
                                            }}
                                            aria-pressed={active}
                                        >
                                            {b.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <span className="form-label">Target regions <span className="muted" style={{ fontWeight: 400 }}>· select all that apply</span></span>
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                {REGIONS.map((r) => {
                                    const active = form.targetRegions.includes(r.value);
                                    return (
                                        <button
                                            type="button"
                                            key={r.value}
                                            onClick={() => handleRegionToggle(r.value)}
                                            className="btn btn-sm"
                                            style={{
                                                background: active ? 'var(--cobalt-50)' : 'var(--paper)',
                                                color: active ? 'var(--cobalt)' : 'var(--ink-2)',
                                                borderColor: active ? 'rgba(28, 91, 255, .35)' : 'var(--rule)',
                                                fontWeight: active ? 500 : 400,
                                            }}
                                            aria-pressed={active}
                                        >
                                            {active && (
                                                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {r.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="message">
                                Tell us about your advertising goals
                            </label>
                            <textarea
                                id="message"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                rows={4}
                                className="textarea"
                                placeholder="What conditions or specialties do you want to target? Any specific goals or requirements?"
                            />
                        </div>
                    </section>

                    {/* Error */}
                    {error && (
                        <div
                            className="card-quiet"
                            style={{
                                padding: 14,
                                background: 'var(--orange-50)',
                                borderColor: 'rgba(255, 90, 46, .28)',
                            }}
                            role="alert"
                        >
                            <span style={{ color: 'var(--orange-2)', fontSize: 13 }}>{error}</span>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="col gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-cobalt btn-lg"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                                    </svg>
                                    Submitting…
                                </>
                            ) : (
                                <>Submit enquiry →</>
                            )}
                        </button>
                        <p className="form-hint" style={{ textAlign: 'center', margin: 0 }}>
                            By submitting, you agree to our{' '}
                            <Link href="/terms" style={{ color: 'var(--cobalt)' }}>Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="/privacy" style={{ color: 'var(--cobalt)' }}>Privacy Policy</Link>.
                        </p>
                    </div>
                </form>

                {/* Alternative */}
                <p className="muted" style={{ textAlign: 'center', fontSize: 14, margin: 0 }}>
                    Prefer to talk directly?{' '}
                    <Link href="/contact" style={{ color: 'var(--cobalt)', fontWeight: 500 }}>
                        Contact our sales team →
                    </Link>
                </p>
            </div>
        </main>
    );
}
