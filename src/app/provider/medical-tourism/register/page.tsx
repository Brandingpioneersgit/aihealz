'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type ProviderType = 'hcf' | 'agency';

interface FormData {
    providerType: ProviderType;
    companyName: string;
    legalName: string;
    registrationNumber: string;
    establishedYear: string;
    website: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    whatsapp: string;
    servicesOffered: string[];
    specializations: string[];
    destinationCountries: string[];
    sourceCountries: string[];
    languagesSupported: string[];
    certifications: string[];
    hospitalPartners: string;
    insurancePartners: string;
    adminName: string;
    adminDesignation: string;
    adminPhone: string;
    adminEmail: string;
    password: string;
    confirmPassword: string;
    agreeTerms: boolean;
}

const SERVICES_HCF = [
    'Treatment Planning', 'Hospital Selection', 'Doctor Appointments', 'Visa Assistance',
    'Airport Pickup', 'Accommodation Booking', 'Local Transport', 'Language Interpretation',
    'Medical Records Translation', 'Post-Treatment Follow-up', 'Second Opinion Coordination', 'Insurance Coordination',
];

const SERVICES_AGENCY = [
    'End-to-End Medical Tourism Packages', 'Hospital Tie-ups', 'Travel Arrangements', 'Visa Processing',
    'Medical Visa Letters', 'Accommodation', 'Local Tours', 'Companion Assistance',
    'Currency Exchange Support', 'Emergency Support 24/7',
];

const SPECIALIZATIONS = [
    'Cardiac Care', 'Orthopedics', 'Oncology', 'Fertility & IVF', 'Cosmetic Surgery',
    'Dental Tourism', 'Eye Care', 'Organ Transplant', 'Bariatric Surgery', 'Neurosurgery',
    'Spine Surgery', 'Wellness & Ayurveda',
];

const DESTINATION_COUNTRIES = ['India', 'Thailand', 'Turkey', 'Singapore', 'Malaysia', 'Mexico', 'Costa Rica', 'Germany', 'South Korea', 'UAE'];
const SOURCE_COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Middle East', 'Africa', 'CIS Countries', 'Bangladesh', 'Nepal', 'Sri Lanka'];
const LANGUAGES = ['English', 'Hindi', 'Arabic', 'Russian', 'French', 'Spanish', 'German', 'Bengali', 'Swahili', 'Mandarin'];
const CERTIFICATIONS = ['MTQUA Certified', 'NABH Empanelled', 'JCI Partner', 'TEMOS Certified', 'ISO 9001', 'Government Registered'];

function MedicalTourismRegisterForm() {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type') as ProviderType | null;

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        providerType: typeParam || 'hcf',
        companyName: '',
        legalName: '',
        registrationNumber: '',
        establishedYear: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        whatsapp: '',
        servicesOffered: [],
        specializations: [],
        destinationCountries: [],
        sourceCountries: [],
        languagesSupported: ['English'],
        certifications: [],
        hospitalPartners: '',
        insurancePartners: '',
        adminName: '',
        adminDesignation: '',
        adminPhone: '',
        adminEmail: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
    });

    const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleArrayField = (field: keyof FormData, value: string) => {
        const current = formData[field] as string[];
        setFormData((prev) => ({
            ...prev,
            [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
        }));
    };

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            if (!formData.companyName || !formData.providerType) {
                setError('Please fill in company name and select provider type');
                return false;
            }
        }
        if (currentStep === 2) {
            if (!formData.address || !formData.city || !formData.country || !formData.phone || !formData.email) {
                setError('Please fill in all required contact details');
                return false;
            }
        }
        if (currentStep === 3) {
            if (formData.servicesOffered.length === 0) {
                setError('Please select at least one service');
                return false;
            }
        }
        if (currentStep === 4) {
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
        if (validateStep(step)) setStep((prev) => Math.min(prev + 1, 5));
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
            const res = await fetch('/api/provider/medical-tourism/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                window.location.href = '/provider/medical-tourism/dashboard?welcome=true';
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

    const isHCF = formData.providerType === 'hcf';
    const services = isHCF ? SERVICES_HCF : SERVICES_AGENCY;

    return (
        <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64, color: 'var(--ink)' }}>
            <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 24px' }}>
                <div className="col ai-center gap-3 text-center" style={{ marginBottom: 32 }}>
                    <span className="section-mark">provider / medical tourism</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Become a medical tourism partner<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0 }}>
                        Register as a Healthcare Facilitator (HCF) or Medical Tourism Agency.
                    </p>
                </div>

                <div className="row center ai-center gap-1" style={{ marginBottom: 32 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="row ai-center">
                            <div
                                className="num"
                                style={{
                                    width: 36, height: 36,
                                    borderRadius: 'var(--r-2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                            {s < 5 && (
                                <div style={{ width: 40, height: 2, margin: '0 4px', background: step > s ? 'var(--cobalt)' : 'var(--rule)' }} />
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
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Provider type &amp; company</h2>

                            <div className="form-group">
                                <label className="form-label">What type of provider are you? *</label>
                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                    <button
                                        type="button"
                                        onClick={() => updateField('providerType', 'hcf')}
                                        className="col gap-2 ai-start text-left"
                                        style={{
                                            padding: 20,
                                            border: formData.providerType === 'hcf' ? '2px solid var(--cobalt)' : '1px solid var(--rule)',
                                            borderRadius: 'var(--r-3)',
                                            background: formData.providerType === 'hcf' ? 'var(--cobalt-50)' : 'var(--paper)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <span className="spec-icon" style={{ background: formData.providerType === 'hcf' ? 'var(--cobalt)' : 'var(--ink-4)' }}>HCF</span>
                                        <span style={{ fontSize: 15, fontWeight: 600 }}>Healthcare Facilitator (HCF)</span>
                                        <span className="muted" style={{ fontSize: 12 }}>
                                            Individual or company that guides patients through medical treatment abroad.
                                        </span>
                                        <ul className="clean col gap-1" style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-4)' }}>
                                            <li>· Direct patient coordination</li>
                                            <li>· Hospital liaison services</li>
                                            <li>· Treatment planning</li>
                                        </ul>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updateField('providerType', 'agency')}
                                        className="col gap-2 ai-start text-left"
                                        style={{
                                            padding: 20,
                                            border: formData.providerType === 'agency' ? '2px solid var(--cobalt)' : '1px solid var(--rule)',
                                            borderRadius: 'var(--r-3)',
                                            background: formData.providerType === 'agency' ? 'var(--cobalt-50)' : 'var(--paper)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <span className="spec-icon" style={{ background: formData.providerType === 'agency' ? 'var(--cobalt)' : 'var(--ink-4)' }}>AG</span>
                                        <span style={{ fontSize: 15, fontWeight: 600 }}>Medical Tourism Agency</span>
                                        <span className="muted" style={{ fontSize: 12 }}>
                                            Company offering end-to-end medical tourism packages and services.
                                        </span>
                                        <ul className="clean col gap-1" style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-4)' }}>
                                            <li>· Complete travel packages</li>
                                            <li>· Multiple hospital tie-ups</li>
                                            <li>· Volume-based operations</li>
                                        </ul>
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Company / business name *</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => updateField('companyName', e.target.value)}
                                    placeholder={isHCF ? 'e.g., HealthCare Solutions' : 'e.g., MedTravel International'}
                                    className="input"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Registration / license number</label>
                                    <input type="text" value={formData.registrationNumber} onChange={(e) => updateField('registrationNumber', e.target.value)} placeholder="Business registration no." className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Established year</label>
                                    <input type="text" value={formData.establishedYear} onChange={(e) => updateField('establishedYear', e.target.value)} placeholder="e.g., 2015" className="input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Website</label>
                                <input type="url" value={formData.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://www.yourcompany.com" className="input" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="col gap-5" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Contact &amp; location</h2>
                            <div className="form-group">
                                <label className="form-label">Office address *</label>
                                <textarea value={formData.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Street address" rows={2} className="textarea" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="e.g., Mumbai" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input type="text" value={formData.state} onChange={(e) => updateField('state', e.target.value)} placeholder="e.g., Maharashtra" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Country *</label>
                                    <input type="text" value={formData.country} onChange={(e) => updateField('country', e.target.value)} placeholder="e.g., India" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Phone *</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91-XXXXXXXXXX" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="contact@company.com" className="input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">WhatsApp</label>
                                    <input type="tel" value={formData.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} placeholder="+91-XXXXXXXXXX" className="input" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="col gap-6" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Services &amp; coverage</h2>

                            <div className="form-group">
                                <label className="form-label">Services offered *</label>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {services.map((service) => (
                                        <button
                                            key={service}
                                            type="button"
                                            onClick={() => toggleArrayField('servicesOffered', service)}
                                            className={formData.servicesOffered.includes(service) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Medical specializations</label>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {SPECIALIZATIONS.map((spec) => (
                                        <button
                                            key={spec}
                                            type="button"
                                            onClick={() => toggleArrayField('specializations', spec)}
                                            className={formData.specializations.includes(spec) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                        >
                                            {spec}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>
                                <div className="form-group">
                                    <label className="form-label">✈ Destination countries</label>
                                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                        {DESTINATION_COUNTRIES.map((country) => (
                                            <button
                                                key={country}
                                                type="button"
                                                onClick={() => toggleArrayField('destinationCountries', country)}
                                                className={formData.destinationCountries.includes(country) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                            >
                                                {country}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Source markets</label>
                                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                        {SOURCE_COUNTRIES.map((country) => (
                                            <button
                                                key={country}
                                                type="button"
                                                onClick={() => toggleArrayField('sourceCountries', country)}
                                                className={formData.sourceCountries.includes(country) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                            >
                                                {country}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Languages supported</label>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => toggleArrayField('languagesSupported', lang)}
                                            className={formData.languagesSupported.includes(lang) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="col gap-6" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Credentials &amp; account</h2>

                            <div className="form-group">
                                <label className="form-label">Certifications &amp; accreditations</label>
                                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                    {CERTIFICATIONS.map((cert) => (
                                        <button
                                            key={cert}
                                            type="button"
                                            onClick={() => toggleArrayField('certifications', cert)}
                                            className={formData.certifications.includes(cert) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                        >
                                            {cert}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Hospital partners (names)</label>
                                    <textarea value={formData.hospitalPartners} onChange={(e) => updateField('hospitalPartners', e.target.value)} placeholder="List your major hospital partners" rows={2} className="textarea" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Insurance partners</label>
                                    <textarea value={formData.insurancePartners} onChange={(e) => updateField('insurancePartners', e.target.value)} placeholder="List insurance companies you work with" rows={2} className="textarea" />
                                </div>
                            </div>

                            <div className="hairline-t col gap-4" style={{ paddingTop: 24 }}>
                                <h3 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600 }}>Admin account</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Admin name *</label>
                                        <input type="text" value={formData.adminName} onChange={(e) => updateField('adminName', e.target.value)} placeholder="Full name" className="input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Designation</label>
                                        <input type="text" value={formData.adminDesignation} onChange={(e) => updateField('adminDesignation', e.target.value)} placeholder="e.g., Managing Director" className="input" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Admin email *</label>
                                        <input type="email" value={formData.adminEmail} onChange={(e) => updateField('adminEmail', e.target.value)} placeholder="admin@company.com" className="input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Admin phone</label>
                                        <input type="tel" value={formData.adminPhone} onChange={(e) => updateField('adminPhone', e.target.value)} placeholder="+91-XXXXXXXXXX" className="input" />
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
                        </div>
                    )}

                    {step === 5 && (
                        <div className="col gap-5" style={{ padding: 32 }}>
                            <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Review &amp; submit</h2>

                            {/* Benefits */}
                            <div
                                className="card-flat col gap-4"
                                style={{ padding: 20, borderColor: 'rgba(28, 91, 255, .25)', background: 'var(--cobalt-50)' }}
                            >
                                <span className="section-mark" style={{ color: 'var(--cobalt)' }}>what you&apos;ll get as a partner</span>
                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
                                    {[
                                        'Access to international patient leads',
                                        'Listing on AIHealz medical tourism directory',
                                        'Verified partner badge',
                                        'Commission-based earning model',
                                        '24/7 support dashboard',
                                        'Quality certification display',
                                    ].map((text) => (
                                        <div key={text} className="row ai-center gap-3">
                                            <span
                                                aria-hidden="true"
                                                style={{
                                                    width: 24, height: 24,
                                                    borderRadius: 'var(--r-2)',
                                                    background: 'var(--cobalt)',
                                                    color: '#fff',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 11,
                                                }}
                                            >
                                                ✓
                                            </span>
                                            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card-quiet col gap-3" style={{ padding: 20 }}>
                                <span className="section-mark">registration summary</span>
                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, fontSize: 13 }}>
                                    <div className="col gap-1">
                                        <span className="kicker">Provider type</span>
                                        <span style={{ fontWeight: 500 }}>{isHCF ? 'Healthcare Facilitator' : 'Medical Tourism Agency'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Company name</span>
                                        <span style={{ fontWeight: 500 }}>{formData.companyName || '—'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Location</span>
                                        <span style={{ fontWeight: 500 }}>{formData.city ? `${formData.city}, ${formData.country}` : '—'}</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Services</span>
                                        <span style={{ fontWeight: 500 }}>{formData.servicesOffered.length} selected</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Specializations</span>
                                        <span style={{ fontWeight: 500 }}>{formData.specializations.length} selected</span>
                                    </div>
                                    <div className="col gap-1">
                                        <span className="kicker">Languages</span>
                                        <span style={{ fontWeight: 500 }}>{formData.languagesSupported.join(', ')}</span>
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
                                    I agree to the <Link href="/terms" style={{ color: 'var(--cobalt)' }}>Terms of Service</Link>,{' '}
                                    <Link href="/privacy" style={{ color: 'var(--cobalt)' }}>Privacy Policy</Link>, and{' '}
                                    <Link href="/partner-agreement" style={{ color: 'var(--cobalt)' }}>Partner Agreement</Link>. I confirm that all information provided is accurate and I am authorized to register this business.
                                </span>
                            </label>
                        </div>
                    )}

                    <div className="row between ai-center hairline-t" style={{ padding: '16px 32px', background: 'var(--bg-2)' }}>
                        {step > 1 ? (
                            <button onClick={prevStep} className="btn btn-ghost">Back</button>
                        ) : (
                            <Link href="/medical-travel" className="btn btn-ghost">Cancel</Link>
                        )}

                        {step < 5 ? (
                            <button onClick={nextStep} className="btn btn-cobalt">Continue →</button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-cobalt">
                                {isSubmitting ? 'Registering…' : 'Submit application →'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function MedicalTourismRegisterPage() {
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
            <MedicalTourismRegisterForm />
        </Suspense>
    );
}
