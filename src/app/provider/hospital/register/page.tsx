'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface FormData {
    hospitalName: string;
    legalName: string;
    hospitalType: string;
    ownershipType: string;
    registrationNumber: string;
    establishedYear: string;
    bedCount: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    phone: string;
    email: string;
    website: string;
    adminName: string;
    adminDesignation: string;
    adminPhone: string;
    adminEmail: string;
    password: string;
    confirmPassword: string;
    accreditations: string[];
    specialties: string[];
    agreeTerms: boolean;
}

const HOSPITAL_TYPES = [
    { value: 'multi_specialty', label: 'Multi-Specialty Hospital' },
    { value: 'super_specialty', label: 'Super-Specialty Hospital' },
    { value: 'single_specialty', label: 'Single-Specialty Hospital' },
    { value: 'general', label: 'General Hospital' },
    { value: 'nursing_home', label: 'Nursing Home' },
    { value: 'clinic', label: 'Clinic / Polyclinic' },
    { value: 'day_care', label: 'Day Care Center' },
];

const OWNERSHIP_TYPES = [
    { value: 'private', label: 'Private' },
    { value: 'government', label: 'Government' },
    { value: 'trust', label: 'Trust / NGO' },
    { value: 'corporate', label: 'Corporate Chain' },
    { value: 'ppp', label: 'Public-Private Partnership' },
];

const ACCREDITATIONS = ['NABH', 'JCI', 'NABL', 'ISO 9001', 'QCI', 'NHSRC'];

const TOP_SPECIALTIES = [
    'Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Gastroenterology',
    'Urology', 'Nephrology', 'Pulmonology', 'Dermatology', 'Pediatrics',
    'Obstetrics & Gynecology', 'ENT', 'Ophthalmology', 'General Surgery',
];

function HospitalRegisterForm() {
    const searchParams = useSearchParams();
    const selectedPlan = searchParams.get('plan') || 'basic';

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        hospitalName: '',
        legalName: '',
        hospitalType: '',
        ownershipType: '',
        registrationNumber: '',
        establishedYear: '',
        bedCount: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        phone: '',
        email: '',
        website: '',
        adminName: '',
        adminDesignation: '',
        adminPhone: '',
        adminEmail: '',
        password: '',
        confirmPassword: '',
        accreditations: [],
        specialties: [],
        agreeTerms: false,
    });

    const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleArrayField = (field: 'accreditations' | 'specialties', value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter((v) => v !== value)
                : [...prev[field], value],
        }));
    };

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            if (!formData.hospitalName || !formData.hospitalType || !formData.ownershipType) {
                setError('Please fill in all required fields');
                return false;
            }
        }
        if (currentStep === 2) {
            if (!formData.address || !formData.city || !formData.phone || !formData.email) {
                setError('Please fill in all required contact details');
                return false;
            }
        }
        if (currentStep === 3) {
            if (!formData.adminName || !formData.adminEmail || !formData.password) {
                setError('Please fill in admin account details');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters');
                return false;
            }
        }
        setError(null);
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep((prev) => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        if (!formData.agreeTerms) {
            setError('Please agree to the terms and conditions');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/provider/hospital/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, plan: selectedPlan }),
            });

            if (res.ok) {
                window.location.href = '/provider/hospital/dashboard?welcome=true';
            } else {
                const data = await res.json();
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const PLAN_NAMES: Record<string, string> = {
        basic: 'Basic',
        professional: 'Professional',
        enterprise: 'Enterprise',
    };

    return (
        <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64, color: 'var(--ink)' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
                <div className="col ai-center gap-3 text-center" style={{ marginBottom: 32 }}>
                    <span className="section-mark">provider / hospital registration</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Register your hospital<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0 }}>
                        Join AIHealz to reach millions of patients. Selected plan:{' '}
                        <span style={{ color: 'var(--cobalt)', fontWeight: 600 }}>{PLAN_NAMES[selectedPlan]}</span>
                    </p>
                </div>

                <div className="row center ai-center gap-2" style={{ marginBottom: 32 }}>
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="row ai-center">
                            <div
                                className="num"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 'var(--r-2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    background: step >= s ? 'var(--cobalt)' : 'var(--bg-2)',
                                    color: step >= s ? '#fff' : 'var(--ink-3)',
                                    border: '1px solid',
                                    borderColor: step >= s ? 'var(--cobalt)' : 'var(--rule)',
                                    fontSize: 14,
                                }}
                            >
                                {step > s ? '✓' : s}
                            </div>
                            {s < 4 && (
                                <div style={{ width: 60, height: 2, margin: '0 8px', background: step > s ? 'var(--cobalt)' : 'var(--rule)' }} />
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div role="alert" className="card-flat row ai-center gap-3" style={{ marginBottom: 24, padding: '12px 16px', borderColor: 'rgba(255, 90, 46, .35)', background: 'var(--orange-50)', color: 'var(--orange-2)', fontSize: 13 }}>
                        ⚠ {error}
                    </div>
                )}

                <div className="card" style={{ overflow: 'hidden' }}>
                    {step === 1 && (
                        <div className="col gap-5" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Hospital details</h2>
                            <div className="form-group">
                                <label className="form-label">Hospital name *</label>
                                <input type="text" value={formData.hospitalName} onChange={(e) => updateField('hospitalName', e.target.value)} placeholder="e.g., Apollo Hospitals" className="input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Legal entity name</label>
                                <input type="text" value={formData.legalName} onChange={(e) => updateField('legalName', e.target.value)} placeholder="As per registration" className="input" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Hospital type *</label>
                                    <select value={formData.hospitalType} onChange={(e) => updateField('hospitalType', e.target.value)} className="select">
                                        <option value="">Select type</option>
                                        {HOSPITAL_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ownership type *</label>
                                    <select value={formData.ownershipType} onChange={(e) => updateField('ownershipType', e.target.value)} className="select">
                                        <option value="">Select ownership</option>
                                        {OWNERSHIP_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Registration number</label>
                                    <input type="text" value={formData.registrationNumber} onChange={(e) => updateField('registrationNumber', e.target.value)} placeholder="Hospital reg. no." className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Established year</label>
                                    <input type="text" value={formData.establishedYear} onChange={(e) => updateField('establishedYear', e.target.value)} placeholder="e.g., 1995" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bed count</label>
                                    <input type="number" value={formData.bedCount} onChange={(e) => updateField('bedCount', e.target.value)} placeholder="Total beds" className="input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Accreditations</label>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {ACCREDITATIONS.map((acc) => (
                                        <button
                                            key={acc}
                                            type="button"
                                            onClick={() => toggleArrayField('accreditations', acc)}
                                            className={formData.accreditations.includes(acc) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                        >
                                            {acc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="col gap-5" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Contact &amp; location</h2>
                            <div className="form-group">
                                <label className="form-label">Full address *</label>
                                <textarea value={formData.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Street address, landmark" rows={2} className="textarea" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="e.g., Mumbai" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input type="text" value={formData.state} onChange={(e) => updateField('state', e.target.value)} placeholder="e.g., Maharashtra" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Country</label>
                                    <input type="text" value={formData.country} onChange={(e) => updateField('country', e.target.value)} className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">PIN/ZIP code</label>
                                    <input type="text" value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value)} placeholder="e.g., 400001" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Phone *</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91-XXXXXXXXXX" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="hospital@email.com" className="input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Website</label>
                                <input type="url" value={formData.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://www.hospital.com" className="input" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="col gap-5" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Admin account</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Admin name *</label>
                                    <input type="text" value={formData.adminName} onChange={(e) => updateField('adminName', e.target.value)} placeholder="Full name" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Designation</label>
                                    <input type="text" value={formData.adminDesignation} onChange={(e) => updateField('adminDesignation', e.target.value)} placeholder="e.g., Hospital Administrator" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Admin phone</label>
                                    <input type="tel" value={formData.adminPhone} onChange={(e) => updateField('adminPhone', e.target.value)} placeholder="+91-XXXXXXXXXX" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Admin email *</label>
                                    <input type="email" value={formData.adminEmail} onChange={(e) => updateField('adminEmail', e.target.value)} placeholder="admin@hospital.com" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Min. 8 characters" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm password *</label>
                                    <input type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Re-enter password" className="input" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="col gap-5" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Specialties &amp; review</h2>

                            <div className="form-group">
                                <label className="form-label">Key specialties (select all that apply)</label>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {TOP_SPECIALTIES.map((spec) => (
                                        <button
                                            key={spec}
                                            type="button"
                                            onClick={() => toggleArrayField('specialties', spec)}
                                            className={formData.specialties.includes(spec) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                        >
                                            {spec}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="card-quiet col gap-3" style={{ padding: 20 }}>
                                <span className="section-mark">registration summary</span>
                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, fontSize: 13 }}>
                                    <div className="col gap-1">
                                        <span className="kicker">Hospital name</span>
                                        <span style={{ fontWeight: 500 }}>{formData.hospitalName || '—'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Type</span>
                                        <span style={{ fontWeight: 500 }}>{HOSPITAL_TYPES.find(t => t.value === formData.hospitalType)?.label || '—'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Location</span>
                                        <span style={{ fontWeight: 500 }}>{formData.city ? `${formData.city}, ${formData.country}` : '—'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Plan</span>
                                        <span style={{ color: 'var(--cobalt)', fontWeight: 500 }}>{PLAN_NAMES[selectedPlan]}</span>
                                    </div>
                                </div>
                            </div>

                            <label className="row gap-3 ai-start" style={{ cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.agreeTerms}
                                    onChange={(e) => updateField('agreeTerms', e.target.checked)}
                                    style={{ marginTop: 4 }}
                                />
                                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                                    I agree to the <Link href="/terms" style={{ color: 'var(--cobalt)' }}>Terms of Service</Link> and{' '}
                                    <Link href="/privacy" style={{ color: 'var(--cobalt)' }}>Privacy Policy</Link>. I confirm that I am authorized to register this hospital on AIHealz.
                                </span>
                            </label>
                        </div>
                    )}

                    <div className="row between ai-center hairline-t" style={{ padding: '16px 32px', background: 'var(--bg-2)' }}>
                        {step > 1 ? (
                            <button onClick={prevStep} className="btn btn-ghost">Back</button>
                        ) : (
                            <Link href="/pricing" className="btn btn-ghost">Cancel</Link>
                        )}

                        {step < 4 ? (
                            <button onClick={nextStep} className="btn btn-cobalt">Continue →</button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-cobalt">
                                {isSubmitting ? 'Registering…' : 'Complete registration →'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function HospitalRegisterPage() {
    return (
        <Suspense
            fallback={
                <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div
                        aria-hidden="true"
                        style={{ width: 32, height: 32, border: '2px solid var(--rule)', borderTopColor: 'var(--cobalt)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}
                    />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            }
        >
            <HospitalRegisterForm />
        </Suspense>
    );
}
