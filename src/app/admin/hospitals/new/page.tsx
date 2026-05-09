'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HospitalFormData {
  name: string;
  slug: string;
  hospitalType: string;
  description: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  bedCount: string;
  icuBeds: string;
  operationTheaters: string;
  emergencyBeds: string;
  accreditations: string[];
  isVerified: boolean;
  isActive: boolean;
}

const HOSPITAL_TYPES = [
  { value: 'private', label: 'Private Hospital' },
  { value: 'government', label: 'Government Hospital' },
  { value: 'corporate_chain', label: 'Corporate Chain' },
  { value: 'charitable', label: 'Charitable Trust' },
  { value: 'trust', label: 'Trust Hospital' },
  { value: 'public_private_partnership', label: 'PPP Hospital' },
];

const ACCREDITATIONS = [
  'NABH', 'JCI', 'NABL', 'ISO 9001', 'ISO 14001', 'Green OT',
  'QCI', 'HACCP', 'ISO 22000', 'CAP',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat',
  'Rajasthan', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Bihar',
  'Punjab', 'Haryana', 'Kerala', 'Telangana', 'Madhya Pradesh',
];

export default function AddHospitalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<HospitalFormData>({
    name: '',
    slug: '',
    hospitalType: 'private',
    description: '',
    tagline: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    emergencyPhone: '',
    email: '',
    website: '',
    bedCount: '',
    icuBeds: '',
    operationTheaters: '',
    emergencyBeds: '',
    accreditations: [],
    isVerified: false,
    isActive: true,
  });

  const updateField = (field: keyof HospitalFormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'name') {
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const toggleAccreditation = (acc: string) => {
    const current = formData.accreditations;
    setFormData((prev) => ({
      ...prev,
      accreditations: current.includes(acc)
        ? current.filter((a) => a !== acc)
        : [...current, acc],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.city) {
      setError('Please fill in the hospital name and city');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bedCount: formData.bedCount ? parseInt(formData.bedCount) : null,
          icuBeds: formData.icuBeds ? parseInt(formData.icuBeds) : null,
          operationTheaters: formData.operationTheaters ? parseInt(formData.operationTheaters) : null,
          emergencyBeds: formData.emergencyBeds ? parseInt(formData.emergencyBeds) : null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/hospitals');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create hospital');
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
          <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Hospital added successfully</h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Redirecting to hospitals list…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="col gap-5" style={{ maxWidth: 960, color: 'var(--ink)' }}>
      <Link
        href="/admin/hospitals"
        className="mono"
        style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        ← Back to hospitals
      </Link>

      <div className="col gap-2">
        <span className="section-mark">admin / hospitals / new</span>
        <h1
          className="display"
          style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
        >
          New hospital<span style={{ color: 'var(--orange)' }}>.</span>
        </h1>
        <p className="lede" style={{ fontSize: 14, margin: 0 }}>
          Create a new hospital profile.
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
              <label className="form-label">Hospital Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Apollo Hospital"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="apollo-hospital-mumbai"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital Type *</label>
              <select
                value={formData.hospitalType}
                onChange={(e) => updateField('hospitalType', e.target.value)}
                className="select"
              >
                {HOSPITAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="Where Care Meets Excellence"
                className="input"
              />
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the hospital, its history, specialties, and facilities…"
                rows={4}
                className="textarea"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">location</span>
          <div className="form-group">
            <label className="form-label">Full Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Complete street address"
              rows={2}
              className="textarea"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">City *</label>
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
              <select
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="select"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
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
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => updateField('pincode', e.target.value)}
                placeholder="400001"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">contact information</span>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91-22-XXXXXXXX"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Phone</label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => updateField('emergencyPhone', e.target.value)}
                placeholder="+91-22-XXXXXXXX"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="info@hospital.com"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://hospital.com"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">facilities &amp; capacity</span>
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Total Beds</label>
              <input
                type="number"
                value={formData.bedCount}
                onChange={(e) => updateField('bedCount', e.target.value)}
                placeholder="500"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">ICU Beds</label>
              <input
                type="number"
                value={formData.icuBeds}
                onChange={(e) => updateField('icuBeds', e.target.value)}
                placeholder="50"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operation Theaters</label>
              <input
                type="number"
                value={formData.operationTheaters}
                onChange={(e) => updateField('operationTheaters', e.target.value)}
                placeholder="10"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Beds</label>
              <input
                type="number"
                value={formData.emergencyBeds}
                onChange={(e) => updateField('emergencyBeds', e.target.value)}
                placeholder="20"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Accreditations */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">accreditations</span>
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

        {/* Admin Settings */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">admin settings</span>
          <div className="row ai-center gap-6" style={{ flexWrap: 'wrap' }}>
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
          <Link href="/admin/hospitals" className="btn btn-paper">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn btn-cobalt">
            {isSubmitting ? 'Creating…' : 'Create hospital →'}
          </button>
        </div>
      </form>
    </div>
  );
}
