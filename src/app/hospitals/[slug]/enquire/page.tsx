'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

function EnquiryForm() {
    const params = useParams();
    const searchParams = useSearchParams();
    const hospitalSlug = params.slug as string;
    const isInternational = searchParams.get('type') === 'international';

    const [hospitalName, setHospitalName] = useState('');
    const [formData, setFormData] = useState({
        patientName: '',
        phone: '',
        email: '',
        country: isInternational ? '' : 'India',
        patientType: isInternational ? 'international' : 'domestic',
        enquiryType: '',
        condition: '',
        specialty: '',
        message: '',
        hasInsurance: false,
        insuranceProvider: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/hospitals/${hospitalSlug}`)
            .then(res => res.json())
            .then(data => {
                if (data.name) setHospitalName(data.name);
            })
            .catch((err) => {
                console.warn('Failed to load hospital name:', err);
            });
    }, [hospitalSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/hospitals/enquire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    hospitalSlug,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to submit enquiry');
            }

            setSubmitted(true);
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
                    Enquiry submitted
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="muted" style={{ fontSize: 15, margin: 0, maxWidth: 480 }}>
                    {isInternational
                        ? 'Our international patient services team will contact you within 24 hours with treatment options and cost estimates.'
                        : 'The hospital will contact you within 24 hours to assist with your enquiry.'
                    }
                </p>
                <div className="row gap-3" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href={`/hospitals/${hospitalSlug}`} className="btn btn-paper">
                        Back to hospital
                    </Link>
                    <Link href="/hospitals" className="btn btn-cobalt">
                        Browse more hospitals →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
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
                <Link href="/hospitals" style={{ color: 'var(--ink-3)' }}>Hospitals</Link>
                <span aria-hidden="true">/</span>
                <Link href={`/hospitals/${hospitalSlug}`} style={{ color: 'var(--ink-3)' }}>
                    {hospitalName || 'Hospital'}
                </Link>
                <span aria-hidden="true">/</span>
                <span style={{ color: 'var(--ink)' }}>Enquiry</span>
            </nav>

            <div className="col gap-2">
                {isInternational && (
                    <span className="pill pill-magenta" style={{ alignSelf: 'flex-start' }}>
                        International patient services
                    </span>
                )}
                <span className="section-mark">{isInternational ? 'medical travel enquiry' : 'hospital enquiry'}</span>
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
                    {isInternational ? 'International enquiry' : 'Book appointment'}
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                {hospitalName && (
                    <p className="lede" style={{ fontSize: 17, margin: 0 }}>
                        At <span style={{ color: 'var(--cobalt)' }}>{hospitalName}</span>
                    </p>
                )}
                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                    {isInternational
                        ? 'Get personalized treatment plans and cost estimates for medical travel.'
                        : 'Fill in your details and we\'ll help you schedule your visit.'
                    }
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
                            placeholder={isInternational ? '+1 234 567 8900' : '+91 9876543210'}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email *</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="input"
                            placeholder="your@email.com"
                        />
                    </div>
                </div>

                {isInternational && (
                    <div className="form-group">
                        <label className="form-label" htmlFor="country">Your country *</label>
                        <input
                            id="country"
                            type="text"
                            required
                            value={formData.country}
                            onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            className="input"
                            placeholder="e.g., United States, United Kingdom"
                        />
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label" htmlFor="enquiryType">Enquiry type</label>
                    <select
                        id="enquiryType"
                        value={formData.enquiryType}
                        onChange={e => setFormData(prev => ({ ...prev, enquiryType: e.target.value }))}
                        className="select"
                    >
                        <option value="">Select type</option>
                        <option value="treatment">Treatment / Surgery</option>
                        <option value="consultation">Doctor Consultation</option>
                        <option value="second_opinion">Second Opinion</option>
                        <option value="cost_estimate">Cost Estimate</option>
                        <option value="general">General Enquiry</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="condition">Medical condition</label>
                        <input
                            id="condition"
                            type="text"
                            value={formData.condition}
                            onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                            className="input"
                            placeholder="e.g., Knee Replacement, Heart Surgery"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="specialty">Preferred specialty</label>
                        <input
                            id="specialty"
                            type="text"
                            value={formData.specialty}
                            onChange={e => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                            className="input"
                            placeholder="e.g., Orthopedics, Cardiology"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="message">Additional details</label>
                    <textarea
                        id="message"
                        value={formData.message}
                        onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        className="textarea"
                        placeholder="Describe your medical condition, treatment requirements, or any questions you have..."
                    />
                </div>

                <div className="card-quiet col gap-3" style={{ padding: 16 }}>
                    <label className="row gap-3 ai-center" style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.hasInsurance}
                            onChange={e => setFormData(prev => ({ ...prev, hasInsurance: e.target.checked }))}
                            style={{ width: 18, height: 18, accentColor: 'var(--cobalt)' }}
                        />
                        <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>I have health insurance</span>
                    </label>

                    {formData.hasInsurance && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="insuranceProvider">Insurance provider</label>
                            <input
                                id="insuranceProvider"
                                type="text"
                                value={formData.insuranceProvider}
                                onChange={e => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                                className="input"
                                placeholder="e.g., HDFC Ergo, Star Health"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-cobalt btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {loading ? 'Submitting...' : 'Submit enquiry →'}
                </button>

                <p className="form-hint" style={{ textAlign: 'center', margin: 0 }}>
                    By submitting, you agree to our{' '}
                    <Link href="/terms" style={{ color: 'var(--cobalt)' }}>Terms of Service</Link> and{' '}
                    <Link href="/privacy" style={{ color: 'var(--cobalt)' }}>Privacy Policy</Link>
                </p>
            </form>

            {isInternational && (
                <div className="card col gap-3" style={{ padding: 24 }}>
                    <span className="kicker"><span className="dot" style={{ background: 'var(--magenta)' }} />international patient services</span>
                    <ul className="clean col gap-2">
                        {[
                            'Personalized treatment plans with cost estimates',
                            'Medical visa assistance and documentation',
                            'Airport pickup and accommodation arrangements',
                            'Dedicated international patient coordinator',
                        ].map((item, i) => (
                            <li key={i} className="row gap-2 ai-start" style={{ fontSize: 14, color: 'var(--ink-2)' }}>
                                <span style={{ color: 'var(--mint-3)', fontWeight: 600, marginTop: 1 }}>✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}

function LoadingFallback() {
    return (
        <div className="col gap-5">
            <div style={{ height: 11, width: 280, background: 'var(--rule)', borderRadius: 'var(--r-1)' }} />
            <div className="col gap-2">
                <div style={{ height: 11, width: 200, background: 'var(--rule)', borderRadius: 'var(--r-1)' }} />
                <div style={{ height: 36, width: 320, background: 'var(--rule)', borderRadius: 'var(--r-2)' }} />
            </div>
            <div className="card col gap-4" style={{ padding: 28 }}>
                <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                    <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                    <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                </div>
                <div style={{ height: 96, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
                <div style={{ height: 48, background: 'var(--cobalt-50)', borderRadius: 'var(--r-2)' }} />
            </div>
        </div>
    );
}

export default function HospitalEnquirePage() {
    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)' }} className="col gap-6">
                <Suspense fallback={<LoadingFallback />}>
                    <EnquiryForm />
                </Suspense>
            </div>
        </main>
    );
}
