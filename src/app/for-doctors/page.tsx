'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SPECIALTIES = [
    'Cardiology', 'Neurology', 'Psychiatry', 'Oncology', 'Orthopedics',
    'Dermatology', 'Gastroenterology', 'Endocrinology', 'Pulmonology',
    'Nephrology', 'Rheumatology', 'Pediatrics', 'Gynecology', 'Urology',
    'Ophthalmology', 'ENT', 'Dentistry', 'General Medicine', 'Other',
];

const CLINICAL_TOOLS = [
    { href: '/for-doctors/clinical-scores', abbr: 'CS', name: 'Clinical scores', desc: 'Wells, CHADS-VASC, MELD, GCS, APACHE II, qSOFA, and 15+ validated scoring systems.', badge: '15+ scores' },
    { href: '/for-doctors/surgical-checklist', abbr: 'SC', name: 'Surgical safety', desc: 'WHO Safe Surgery Checklist with Sign In, Time Out, Sign Out phases.', badge: 'WHO standard' },
    { href: '/for-doctors/drug-dosing', abbr: 'DD', name: 'Drug dosing', desc: 'Weight-based dosing, renal adjustments, and infusion-rate calculators.', badge: 'CrCl adjusted' },
    { href: '/for-doctors/quick-reference', abbr: 'QR', name: 'Quick reference', desc: 'RASS, CAM-ICU, ACLS drugs, antidotes, antibiotic spectrum, vent settings.', badge: 'ICU ready' },
];

export default function ForDoctorsPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', specialty: '', city: '', experience: '', clinicName: '', bio: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateField = (field: string, value: string): string => {
        switch (field) {
            case 'name':
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
                if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
                return '';
            case 'specialty':
                if (!value) return 'Please select a specialty';
                return '';
            case 'city':
                if (!value.trim()) return 'City is required';
                return '';
            default:
                return '';
        }
    };

    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            const fieldError = validateField(field, value);
            setFieldErrors(prev => ({ ...prev, [field]: fieldError }));
        }
    };

    const handleFieldBlur = (field: string, value: string) => {
        const fieldError = validateField(field, value);
        setFieldErrors(prev => ({ ...prev, [field]: fieldError }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const errors: Record<string, string> = {};
        ['name', 'email', 'password', 'specialty', 'city'].forEach(field => {
            const fieldError = validateField(field, formData[field as keyof typeof formData]);
            if (fieldError) errors[field] = fieldError;
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Please fix the errors above.');
            setLoading(false);
            const firstErrorField = Object.keys(errors)[0];
            document.querySelector(`[data-field="${firstErrorField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        try {
            const res = await fetch('/api/doctor-join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create profile');

            if (data.session?.token) {
                localStorage.setItem('provider_session', JSON.stringify({
                    token: data.session.token,
                    doctorId: String(data.doctor.id),
                    doctorName: data.doctor.name,
                    email: data.doctor.email,
                    expiresAt: new Date(data.session.expiresAt).getTime(),
                }));
                localStorage.setItem('provider_doctor_id', String(data.doctor.id));
            }

            setSubmitted(true);
            setTimeout(() => router.push('/provider/dashboard'), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setFormData(prev => ({ ...prev, [key]: e.target.value }));

    const passwordStrength = formData.password.length >= 12
        ? { label: 'Strong', color: 'var(--mint-3)', width: '100%' }
        : formData.password.length >= 8
        ? { label: 'Good', color: 'var(--lemon-2)', width: '66%' }
        : formData.password.length > 0
        ? { label: 'Weak', color: 'var(--orange-2)', width: '33%' }
        : null;

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            {/* ── Hero ─────────────────────────────────────── */}
            <section style={{ padding: '64px 28px 48px', maxWidth: 1280, margin: '0 auto' }}>
                <div className="row gap-8 ai-start" style={{ flexWrap: 'wrap' }}>
                    <div className="col gap-5" style={{ flex: '1.4 1 540px', minWidth: 0 }}>
                        <span className="section-mark">for doctors / built for practice</span>
                        <h1
                            className="display"
                            style={{
                                fontSize: 'clamp(40px, 6.5vw, 96px)',
                                lineHeight: 0.95,
                                letterSpacing: '-0.045em',
                                margin: 0,
                                fontWeight: 600,
                            }}
                        >
                            Scale your practice with{' '}
                            <span style={{ color: 'var(--cobalt)' }}>intelligent matching</span>
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 560 }}>
                            Join over <strong style={{ color: 'var(--ink)' }}>10,000+ verified doctors</strong> turning millions of monthly health enquiries into confirmed consultations — powered by aihealz&rsquo;s semantic patient-matching engine.
                        </p>
                        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                            <a href="#join-form" className="btn btn-cobalt btn-lg">
                                Claim free profile →
                            </a>
                            <Link href="/for-doctors/pricing" className="btn btn-paper btn-lg">
                                View premium plans
                            </Link>
                        </div>
                        <div
                            className="row hairline-t"
                            style={{ paddingTop: 24, marginTop: 4, flexWrap: 'wrap', gap: 0 }}
                        >
                            {[
                                { v: '2.4M+', l: 'monthly patients' },
                                { v: '70k+', l: 'conditions indexed' },
                                { v: '500+', l: 'cities covered' },
                            ].map((s, i, arr) => (
                                <div
                                    key={s.l}
                                    className="col gap-1"
                                    style={{
                                        flex: '1 1 140px',
                                        paddingRight: 18,
                                        borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                        paddingLeft: i > 0 ? 18 : 0,
                                    }}
                                >
                                    <div
                                        className="display num"
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 600,
                                            letterSpacing: '-0.03em',
                                            color: 'var(--ink)',
                                        }}
                                    >
                                        {s.v}
                                    </div>
                                    <div
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        {s.l}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature pillars */}
                    <div
                        className="card"
                        style={{ flex: '1 1 380px', padding: 24, minWidth: 0 }}
                    >
                        <div className="kicker" style={{ marginBottom: 14 }}>
                            <span className="dot" />what you get
                        </div>
                        <ul className="clean col gap-4">
                            {[
                                { t: 'AI-structured bio', d: 'Auto-generates your credentials into SEO-optimised content.' },
                                { t: 'High-intent leads', d: 'Patients searching for your specific expertise and procedures.' },
                                { t: 'Top-tier visibility', d: 'Premium placement on corresponding condition and location pages.' },
                                { t: 'Telehealth integration', d: 'Seamlessly connect your existing booking portal.' },
                            ].map(f => (
                                <li key={f.t} className="row gap-3 ai-start">
                                    <span className="num" style={{ color: 'var(--cobalt)', fontSize: 13, fontWeight: 500, minWidth: 20, marginTop: 2 }}>✓</span>
                                    <div className="col gap-1" style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: 15 }}>{f.t}</div>
                                        <div className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>{f.d}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── II / Clinical tools ──────────────────────── */}
            <section
                style={{
                    padding: '64px 28px',
                    background: 'var(--bg-2)',
                    borderTop: '1px solid var(--rule)',
                    borderBottom: '1px solid var(--rule)',
                }}
            >
                <div style={{ maxWidth: 1280, margin: '0 auto' }} className="col gap-6">
                    <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <div className="col gap-2" style={{ maxWidth: 720 }}>
                            <span className="section-mark">II / professional tools</span>
                            <h2
                                className="display"
                                style={{
                                    fontSize: 'clamp(28px, 4vw, 48px)',
                                    margin: 0,
                                    letterSpacing: '-0.035em',
                                    fontWeight: 600,
                                }}
                            >
                                Clinical decision support
                            </h2>
                            <p className="lede" style={{ fontSize: 17 }}>
                                Evidence-based tools built for medical professionals. Scoring systems, dosing calculators, and quick references.
                            </p>
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 0,
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {CLINICAL_TOOLS.map((t, i, arr) => {
                            const cols = 4;
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= arr.length - cols;
                            return (
                                <Link
                                    key={t.href}
                                    href={t.href}
                                    className="col gap-3"
                                    style={{
                                        padding: '22px 22px',
                                        borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                    }}
                                >
                                    <div className="row between ai-center">
                                        <div className="spec-icon">{t.abbr}</div>
                                        <span className="pill pill-cobalt" style={{ textTransform: 'none' }}>
                                            {t.badge}
                                        </span>
                                    </div>
                                    <div>
                                        <div
                                            className="display"
                                            style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}
                                        >
                                            {t.name}
                                        </div>
                                        <div className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.55 }}>
                                            {t.desc}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── III / Onboarding ─────────────────────────── */}
            <section style={{ padding: '64px 28px', maxWidth: 1280, margin: '0 auto' }}>
                <div className="col gap-6">
                    <div className="col gap-2" style={{ maxWidth: 720 }}>
                        <span className="section-mark">III / onboarding</span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 'clamp(28px, 4vw, 48px)',
                                margin: 0,
                                letterSpacing: '-0.035em',
                                fontWeight: 600,
                            }}
                        >
                            Frictionless onboarding
                        </h2>
                        <p className="lede" style={{ fontSize: 17 }}>
                            Get discovered by patients globally in three simple steps.
                        </p>
                    </div>
                    <div
                        className="row"
                        style={{
                            borderTop: '1px solid var(--rule)',
                            borderBottom: '1px solid var(--rule)',
                            flexWrap: 'wrap',
                        }}
                    >
                        {[
                            { n: '01', t: 'Submit credentials', d: 'Complete the short application form. Takes less than two minutes.' },
                            { n: '02', t: 'Manual verification', d: 'Our clinical team cross-checks your medical licences internally.' },
                            { n: '03', t: 'Profile publication', d: 'Your AI-generated profile goes live, matching you instantly with patients.' },
                        ].map((step, i, arr) => (
                            <div
                                key={step.n}
                                className="col gap-2"
                                style={{
                                    flex: '1 1 280px',
                                    padding: '22px 22px',
                                    borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                    minWidth: 0,
                                }}
                            >
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        letterSpacing: '0.10em',
                                        fontWeight: 500,
                                    }}
                                >
                                    {step.n}
                                </span>
                                <div
                                    className="display"
                                    style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}
                                >
                                    {step.t}
                                </div>
                                <div className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
                                    {step.d}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── IV / Signup form ─────────────────────────── */}
            <section
                id="join-form"
                style={{
                    padding: '64px 28px',
                    background: 'var(--bg-2)',
                    borderTop: '1px solid var(--rule)',
                }}
            >
                <div style={{ maxWidth: 720, margin: '0 auto' }} className="col gap-5">
                    <div className="col gap-2">
                        <span className="section-mark">IV / claim your profile</span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 'clamp(28px, 4vw, 44px)',
                                margin: 0,
                                letterSpacing: '-0.035em',
                                fontWeight: 600,
                            }}
                        >
                            Create your profile<span style={{ color: 'var(--orange)' }}>.</span>
                        </h2>
                        <p className="lede" style={{ fontSize: 16 }}>
                            Free profile gets you started instantly. Upgrade anytime for premium features.
                        </p>
                    </div>

                    {submitted ? (
                        <div
                            className="card"
                            role="status"
                            style={{
                                padding: 40,
                                textAlign: 'center',
                                borderColor: 'var(--mint)',
                                background: 'var(--mint-50)',
                            }}
                        >
                            <div
                                className="num"
                                aria-hidden="true"
                                style={{
                                    fontSize: 48,
                                    color: 'var(--mint-3)',
                                    fontWeight: 500,
                                    lineHeight: 1,
                                }}
                            >
                                ✓
                            </div>
                            <h3
                                className="display"
                                style={{ fontSize: 22, fontWeight: 600, margin: '14px 0 6px' }}
                            >
                                Profile created
                                <span style={{ color: 'var(--orange)' }}>.</span>
                            </h3>
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                Redirecting to your dashboard…
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="card col gap-6" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
                            {/* Account */}
                            <div className="col gap-4">
                                <div className="kicker">
                                    <span className="dot" />account details
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                        gap: 16,
                                    }}
                                >
                                    <div className="form-group" data-field="name">
                                        <label className="form-label" htmlFor="fdr-name">Full name *</label>
                                        <input
                                            id="fdr-name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            placeholder="Dr. First Last"
                                            value={formData.name}
                                            onChange={e => handleFieldChange('name', e.target.value)}
                                            onBlur={e => handleFieldBlur('name', e.target.value)}
                                            className={fieldErrors.name ? 'input form-input-error' : 'input'}
                                        />
                                        {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
                                    </div>
                                    <div className="form-group" data-field="email">
                                        <label className="form-label" htmlFor="fdr-email">Professional email *</label>
                                        <input
                                            id="fdr-email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="doctor@clinic.com"
                                            value={formData.email}
                                            onChange={e => handleFieldChange('email', e.target.value)}
                                            onBlur={e => handleFieldBlur('email', e.target.value)}
                                            className={fieldErrors.email ? 'input form-input-error' : 'input'}
                                        />
                                        {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
                                    </div>
                                </div>
                                <div className="form-group" data-field="password">
                                    <label className="form-label" htmlFor="fdr-password">Password *</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            id="fdr-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            placeholder="Min 8 characters, 1 uppercase, 1 number"
                                            autoComplete="new-password"
                                            autoCorrect="off"
                                            autoCapitalize="off"
                                            spellCheck="false"
                                            value={formData.password}
                                            onChange={e => handleFieldChange('password', e.target.value)}
                                            onBlur={e => handleFieldBlur('password', e.target.value)}
                                            className={fieldErrors.password ? 'input form-input-error' : 'input'}
                                            style={{ paddingRight: 44 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="mono"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            style={{
                                                position: 'absolute',
                                                right: 10,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--ink-3)',
                                                fontSize: 11,
                                                padding: 6,
                                                cursor: 'pointer',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    {fieldErrors.password && <p className="form-error">{fieldErrors.password}</p>}
                                    {passwordStrength && !fieldErrors.password && (
                                        <div className="row ai-center gap-3" style={{ marginTop: 4 }}>
                                            <div
                                                style={{
                                                    flex: 1,
                                                    height: 3,
                                                    background: 'var(--rule)',
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: passwordStrength.width,
                                                        background: passwordStrength.color,
                                                        transition: 'width 200ms',
                                                    }}
                                                />
                                            </div>
                                            <span
                                                className="mono"
                                                style={{
                                                    fontSize: 11,
                                                    color: passwordStrength.color,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="hairline" />

                            {/* Professional info */}
                            <div className="col gap-4">
                                <div className="kicker">
                                    <span className="dot" />professional information
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                        gap: 16,
                                    }}
                                >
                                    <div className="form-group" data-field="specialty">
                                        <label className="form-label" htmlFor="fdr-specialty">Specialty *</label>
                                        <select
                                            id="fdr-specialty"
                                            required
                                            value={formData.specialty}
                                            onChange={e => handleFieldChange('specialty', e.target.value)}
                                            onBlur={e => handleFieldBlur('specialty', e.target.value)}
                                            className={fieldErrors.specialty ? 'select form-input-error' : 'select'}
                                        >
                                            <option value="">Select specialty…</option>
                                            {SPECIALTIES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.specialty && <p className="form-error">{fieldErrors.specialty}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="fdr-experience">Years of experience</label>
                                        <input
                                            id="fdr-experience"
                                            type="number"
                                            min={0}
                                            max={60}
                                            placeholder="10"
                                            value={formData.experience}
                                            onChange={set('experience')}
                                            className="input"
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                        gap: 16,
                                    }}
                                >
                                    <div className="form-group" data-field="city">
                                        <label className="form-label" htmlFor="fdr-city">Primary city *</label>
                                        <input
                                            id="fdr-city"
                                            type="text"
                                            required
                                            placeholder="Mumbai, New York, London…"
                                            autoComplete="address-level2"
                                            value={formData.city}
                                            onChange={e => handleFieldChange('city', e.target.value)}
                                            onBlur={e => handleFieldBlur('city', e.target.value)}
                                            className={fieldErrors.city ? 'input form-input-error' : 'input'}
                                        />
                                        {fieldErrors.city && <p className="form-error">{fieldErrors.city}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="fdr-phone">Phone number</label>
                                        <input
                                            id="fdr-phone"
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            autoComplete="tel"
                                            value={formData.phone}
                                            onChange={e => handleFieldChange('phone', e.target.value)}
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="hairline" />

                            {/* Clinic */}
                            <div className="col gap-4">
                                <div className="row ai-baseline gap-2">
                                    <div className="kicker">
                                        <span className="dot" />clinic details
                                    </div>
                                    <span className="muted" style={{ fontSize: 12 }}>(optional)</span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="fdr-clinic">Clinic / hospital name</label>
                                    <input
                                        id="fdr-clinic"
                                        type="text"
                                        placeholder="Apollo Hospitals, Mayo Clinic…"
                                        value={formData.clinicName}
                                        onChange={set('clinicName')}
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="fdr-bio">Brief bio</label>
                                    <textarea
                                        id="fdr-bio"
                                        rows={3}
                                        maxLength={500}
                                        placeholder="Tell patients about your expertise, approach, and what makes you unique…"
                                        value={formData.bio}
                                        onChange={set('bio')}
                                        className="textarea"
                                    />
                                    <p className="form-hint">{formData.bio.length}/500 characters</p>
                                </div>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="card-flat"
                                    style={{
                                        padding: 14,
                                        borderColor: 'rgba(255, 90, 46, .35)',
                                        background: 'var(--orange-50)',
                                        color: 'var(--orange-2)',
                                        fontSize: 13,
                                    }}
                                >
                                    ⚠ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-cobalt btn-lg"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {loading ? 'Creating profile…' : 'Create free profile →'}
                            </button>

                            <p
                                className="muted"
                                style={{ fontSize: 13, textAlign: 'center', margin: 0 }}
                            >
                                Already have an account?{' '}
                                <Link
                                    href="/provider/login"
                                    style={{ color: 'var(--cobalt)', fontWeight: 500 }}
                                >
                                    Login to dashboard
                                </Link>
                            </p>

                            <div className="hairline" />

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: 16,
                                }}
                            >
                                <div className="card-quiet col gap-2" style={{ padding: 16 }}>
                                    <div className="row ai-center gap-2">
                                        <span className="pill">free</span>
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>Included now</span>
                                    </div>
                                    <ul className="clean col gap-1" style={{ fontSize: 13 }}>
                                        <li>✓ Basic public profile</li>
                                        <li>✓ 5 lead credits</li>
                                        <li>✓ 2 specialty conditions</li>
                                    </ul>
                                </div>
                                <div
                                    className="col gap-2"
                                    style={{
                                        padding: 16,
                                        background: 'var(--cobalt-50)',
                                        border: '1px solid rgba(28,91,255,.22)',
                                        borderRadius: 'var(--r-3)',
                                    }}
                                >
                                    <div className="row ai-center gap-2">
                                        <span className="pill pill-cobalt">pro</span>
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>Upgrade later</span>
                                    </div>
                                    <ul className="clean col gap-1" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                                        <li style={{ color: 'var(--cobalt)' }}>✓ Website &amp; clinic links</li>
                                        <li style={{ color: 'var(--cobalt)' }}>✓ 50+ lead credits / month</li>
                                        <li style={{ color: 'var(--cobalt)' }}>✓ Priority placement</li>
                                    </ul>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}
