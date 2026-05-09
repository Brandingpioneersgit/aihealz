'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DoctorFormData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  registrationNumber: string;
  specialties: string[];
  qualifications: string;
  experience: string;
  languages: string[];
  city: string;
  state: string;
  country: string;
  clinicName: string;
  clinicAddress: string;
  consultationFee: string;
  bio: string;
  subscriptionTier: string;
  isVerified: boolean;
  isActive: boolean;
}

const SPECIALTIES = [
  'Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Gastroenterology',
  'Dermatology', 'Pediatrics', 'Gynecology', 'Urology', 'Ophthalmology',
  'ENT', 'Psychiatry', 'General Medicine', 'General Surgery', 'Pulmonology',
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada'];

export default function AddDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    slug: '',
    email: '',
    phone: '',
    registrationNumber: '',
    specialties: [],
    qualifications: '',
    experience: '',
    languages: ['English'],
    city: '',
    state: '',
    country: 'India',
    clinicName: '',
    clinicAddress: '',
    consultationFee: '',
    bio: '',
    subscriptionTier: 'free',
    isVerified: false,
    isActive: true,
  });

  const updateField = (field: keyof DoctorFormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'name') {
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const toggleArrayField = (field: 'specialties' | 'languages', value: string) => {
    const current = formData[field];
    setFormData((prev) => ({
      ...prev,
      [field]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || formData.specialties.length === 0) {
      setError('Please fill in name, email, and select at least one specialty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
          experience: formData.experience ? parseInt(formData.experience) : null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/doctors');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create doctor profile');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="row ai-center center" style={{ minHeight: 400 }}>
        <div className="col ai-center gap-3">
          <div className="spec-icon" style={{ width: 56, height: 56, background: 'var(--mint)', fontSize: 24 }}>✓</div>
          <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Doctor added successfully</h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Redirecting to doctors list…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="col gap-5" style={{ maxWidth: 960, color: 'var(--ink)' }}>
      <Link
        href="/admin/doctors"
        className="mono"
        style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        ← Back to doctors
      </Link>

      <div className="col gap-2">
        <span className="section-mark">admin / doctors / new</span>
        <h1
          className="display"
          style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
        >
          New doctor<span style={{ color: 'var(--orange)' }}>.</span>
        </h1>
        <p className="lede" style={{ fontSize: 14, margin: 0 }}>
          Create a new healthcare provider profile.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="card-flat"
          style={{
            padding: '12px 16px',
            borderColor: 'rgba(255, 90, 46, .35)',
            background: 'var(--orange-50)',
            color: 'var(--orange-2)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="col gap-5">
        {/* Basic */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">basic information</span>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Dr. John Doe"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="dr-john-doe"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="doctor@email.com"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91-XXXXXXXXXX"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Number</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => updateField('registrationNumber', e.target.value)}
                placeholder="Medical Council Reg. No."
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => updateField('experience', e.target.value)}
                placeholder="10"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">specialties *</span>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {SPECIALTIES.map((spec) => (
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

        {/* Qualifications & Languages */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">qualifications &amp; languages</span>
          <div className="form-group">
            <label className="form-label">Qualifications</label>
            <input
              type="text"
              value={formData.qualifications}
              onChange={(e) => updateField('qualifications', e.target.value)}
              placeholder="MBBS, MD (Cardiology), FACC"
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Languages</label>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleArrayField('languages', lang)}
                  className={formData.languages.includes(lang) ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Clinic */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">location &amp; clinic</span>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Mumbai"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="Maharashtra"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
                placeholder="India"
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Clinic / Hospital Name</label>
              <input
                type="text"
                value={formData.clinicName}
                onChange={(e) => updateField('clinicName', e.target.value)}
                placeholder="Apollo Hospital"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Consultation Fee (INR)</label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => updateField('consultationFee', e.target.value)}
                placeholder="1500"
                className="input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Clinic Address</label>
            <textarea
              value={formData.clinicAddress}
              onChange={(e) => updateField('clinicAddress', e.target.value)}
              placeholder="Full clinic address"
              rows={2}
              className="textarea"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">professional bio</span>
          <textarea
            value={formData.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Write a professional bio for the doctor…"
            rows={4}
            className="textarea"
          />
        </div>

        {/* Admin Settings */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">admin settings</span>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Subscription Tier</label>
              <select
                value={formData.subscriptionTier}
                onChange={(e) => updateField('subscriptionTier', e.target.value)}
                className="select"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="row ai-center gap-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={formData.isVerified}
                onChange={(e) => updateField('isVerified', e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="isVerified" className="form-label" style={{ margin: 0 }}>Mark as Verified</label>
            </div>
            <div className="row ai-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="isActive" className="form-label" style={{ margin: 0 }}>Active Profile</label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="row gap-3" style={{ justifyContent: 'flex-end' }}>
          <Link href="/admin/doctors" className="btn btn-paper">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn btn-cobalt">
            {isSubmitting ? 'Creating…' : 'Create doctor →'}
          </button>
        </div>
      </form>
    </div>
  );
}
