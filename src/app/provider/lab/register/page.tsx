'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface FormData {
    labName: string;
    legalName: string;
    labType: string;
    registrationNumber: string;
    establishedYear: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    phone: string;
    email: string;
    website: string;
    adminName: string;
    adminPhone: string;
    adminEmail: string;
    password: string;
    confirmPassword: string;
    accreditations: string[];
    homeCollection: boolean;
    operatingHours: string;
    agreeTerms: boolean;
}

const LAB_TYPES = [
    { value: 'pathology', label: 'Pathology Lab' },
    { value: 'imaging', label: 'Imaging / Radiology Center' },
    { value: 'full_service', label: 'Full Service Diagnostics' },
    { value: 'collection_center', label: 'Collection Center' },
    { value: 'hospital_lab', label: 'Hospital Laboratory' },
    { value: 'research', label: 'Research Laboratory' },
];

const ACCREDITATIONS = ['NABL', 'CAP', 'ISO 15189', 'ISO 9001', 'NABH'];

function LabRegisterForm() {
    const searchParams = useSearchParams();
    const selectedPlan = searchParams.get('plan') || 'starter';

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        labName: '',
        legalName: '',
        labType: '',
        registrationNumber: '',
        establishedYear: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        phone: '',
        email: '',
        website: '',
        adminName: '',
        adminPhone: '',
        adminEmail: '',
        password: '',
        confirmPassword: '',
        accreditations: [],
        homeCollection: false,
        operatingHours: '',
        agreeTerms: false,
    });

    const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleAccreditation = (acc: string) => {
        setFormData((prev) => ({
            ...prev,
            accreditations: prev.accreditations.includes(acc)
                ? prev.accreditations.filter((a) => a !== acc)
                : [...prev.accreditations, acc],
        }));
    };

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            if (!formData.labName || !formData.labType) {
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
            const res = await fetch('/api/provider/lab/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, plan: selectedPlan }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('provider_session', JSON.stringify({
                    labId: data.lab.id,
                    name: data.lab.name,
                    email: data.lab.email,
                    subscriptionTier: data.lab.subscriptionTier,
                    token: data.session.token,
                    expiresAt: data.session.expiresAt,
                }));
                localStorage.setItem('provider_lab_id', String(data.lab.id));

                window.location.href = data.redirectTo || '/provider/lab/dashboard?welcome=true';
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const PLAN_NAMES: Record<string, string> = {
        starter: 'Starter',
        growth: 'Growth',
        chain: 'Chain',
    };

    return (
        <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64, color: 'var(--ink)' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
                {/* Header */}
                <div className="col ai-center gap-3 text-center" style={{ marginBottom: 32 }}>
                    <span className="section-mark">provider / lab registration</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Register your diagnostic lab<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0 }}>
                        Partner with AIHealz for patient bookings. Selected plan:{' '}
                        <span style={{ color: 'var(--cobalt)', fontWeight: 600 }}>{PLAN_NAMES[selectedPlan]}</span>
                    </p>
                </div>

                {/* Progress */}
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
                                <div
                                    style={{
                                        width: 60,
                                        height: 2,
                                        margin: '0 8px',
                                        background: step > s ? 'var(--cobalt)' : 'var(--rule)',
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div
                        role="alert"
                        className="card-flat row ai-center gap-3"
                        style={{
                            marginBottom: 24,
                            padding: '12px 16px',
                            borderColor: 'rgba(255, 90, 46, .35)',
                            background: 'var(--orange-50)',
                            color: 'var(--orange-2)',
                            fontSize: 13,
                        }}
                    >
                        ⚠ {error}
                    </div>
                )}

                <div className="card" style={{ overflow: 'hidden' }}>
                    {step === 1 && (
                        <div className="col gap-5" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Lab details</h2>
                            <div className="form-group">
                                <label className="form-label">Lab name *</label>
                                <input type="text" value={formData.labName} onChange={(e) => updateField('labName', e.target.value)} placeholder="e.g., Dr. Lal PathLabs" className="input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Legal entity name</label>
                                <input type="text" value={formData.legalName} onChange={(e) => updateField('legalName', e.target.value)} placeholder="As per registration" className="input" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Lab type *</label>
                                    <select value={formData.labType} onChange={(e) => updateField('labType', e.target.value)} className="select">
                                        <option value="">Select type</option>
                                        {LAB_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Registration number</label>
                                    <input type="text" value={formData.registrationNumber} onChange={(e) => updateField('registrationNumber', e.target.value)} placeholder="Lab license number" className="input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Accreditations</label>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {ACCREDITATIONS.map((acc) => (
                                        <button
                                            key={acc}
                                            type="button"
                                            onClick={() => toggleAccreditation(acc)}
                                            className={formData.accreditations.includes(acc) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                        >
                                            {acc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <label
                                className="row ai-center gap-3"
                                style={{
                                    padding: 14,
                                    borderRadius: 'var(--r-3)',
                                    background: 'var(--cobalt-50)',
                                    border: '1px solid rgba(28, 91, 255, .25)',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.homeCollection}
                                    onChange={(e) => updateField('homeCollection', e.target.checked)}
                                />
                                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--cobalt)' }}>Home collection available</span>
                            </label>
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
                                    <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="e.g., Delhi" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input type="text" value={formData.state} onChange={(e) => updateField('state', e.target.value)} placeholder="e.g., Delhi NCR" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Phone *</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91-XXXXXXXXXX" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="lab@email.com" className="input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Operating hours</label>
                                <input type="text" value={formData.operatingHours} onChange={(e) => updateField('operatingHours', e.target.value)} placeholder="e.g., Mon-Sat 7AM-9PM, Sun 8AM-2PM" className="input" />
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
                                    <label className="form-label">Admin phone</label>
                                    <input type="tel" value={formData.adminPhone} onChange={(e) => updateField('adminPhone', e.target.value)} placeholder="+91-XXXXXXXXXX" className="input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Admin email *</label>
                                <input type="email" value={formData.adminEmail} onChange={(e) => updateField('adminEmail', e.target.value)} placeholder="admin@lab.com" className="input" />
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
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Review &amp; submit</h2>
                            <div className="card-quiet col gap-3" style={{ padding: 20 }}>
                                <span className="section-mark">registration summary</span>
                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, fontSize: 13 }}>
                                    <div className="col gap-1">
                                        <span className="kicker">Lab name</span>
                                        <span style={{ fontWeight: 500 }}>{formData.labName || '—'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Type</span>
                                        <span style={{ fontWeight: 500 }}>{LAB_TYPES.find(t => t.value === formData.labType)?.label || '—'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Location</span>
                                        <span style={{ fontWeight: 500 }}>{formData.city ? `${formData.city}, ${formData.country}` : '—'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Plan</span>
                                        <span style={{ color: 'var(--cobalt)', fontWeight: 500 }}>{PLAN_NAMES[selectedPlan]}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Home collection</span>
                                        <span style={{ fontWeight: 500 }}>{formData.homeCollection ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Accreditations</span>
                                        <span style={{ fontWeight: 500 }}>{formData.accreditations.length > 0 ? formData.accreditations.join(', ') : 'None'}</span>
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
                                    <Link href="/privacy" style={{ color: 'var(--cobalt)' }}>Privacy Policy</Link>. I confirm that I am authorized to register this diagnostic lab on AIHealz.
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Nav */}
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

export default function LabRegisterPage() {
    return (
        <Suspense
            fallback={
                <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div
                        aria-hidden="true"
                        style={{
                            width: 32, height: 32,
                            border: '2px solid var(--rule)',
                            borderTopColor: 'var(--cobalt)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            }
        >
            <LabRegisterForm />
        </Suspense>
    );
}
