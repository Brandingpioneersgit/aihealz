'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProviderFormData {
  name: string;
  slug: string;
  providerType: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  accreditations: string[];
  homeCollectionAvailable: boolean;
  homeCollectionFee: string;
  isPartner: boolean;
  isVerified: boolean;
  isActive: boolean;
}

const PROVIDER_TYPES = [
  { value: 'lab', label: 'Pathology Lab' },
  { value: 'imaging_center', label: 'Imaging Center' },
  { value: 'hospital', label: 'Hospital Lab' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'home_collection', label: 'Home Collection Only' },
  { value: 'full_service', label: 'Full Service Center' },
];

const ACCREDITATIONS = [
  'NABL', 'CAP', 'ISO 15189', 'ISO 9001', 'JCI', 'NABH',
  'College of American Pathologists', 'AERB (Radiology)',
];

export default function AddDiagnosticProviderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    slug: '',
    providerType: 'lab',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    accreditations: [],
    homeCollectionAvailable: false,
    homeCollectionFee: '',
    isPartner: false,
    isVerified: false,
    isActive: true,
  });

  const updateField = (field: keyof ProviderFormData, value: string | boolean | string[]) => {
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

    if (!formData.name) {
      setError('Please enter the provider name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/diagnostic-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          homeCollectionFee: formData.homeCollectionFee ? parseFloat(formData.homeCollectionFee) : null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/diagnostics/providers');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create provider');
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
          <h2 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Provider added successfully</h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Redirecting to providers list…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="col gap-5" style={{ maxWidth: 960, color: 'var(--ink)' }}>
      <Link
        href="/admin/diagnostics/providers"
        className="mono"
        style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        ← Back to providers
      </Link>

      <div className="col gap-2">
        <span className="section-mark">admin / diagnostics / providers / new</span>
        <h1
          className="display"
          style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
        >
          New diagnostic provider<span style={{ color: 'var(--orange)' }}>.</span>
        </h1>
        <p className="lede" style={{ fontSize: 14, margin: 0 }}>
          Create a new lab or diagnostic center profile.
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
              <label className="form-label">Provider Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Dr. Lal PathLabs"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="dr-lal-pathlabs"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Provider Type *</label>
              <select
                value={formData.providerType}
                onChange={(e) => updateField('providerType', e.target.value)}
                className="select"
              >
                {PROVIDER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the lab, its services, and specialties…"
                rows={3}
                className="textarea"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">contact &amp; location</span>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Complete address with area, city"
              rows={2}
              className="textarea"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
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
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="info@lab.com"
                className="input"
              />
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://lab.com"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="card col gap-4" style={{ padding: 24 }}>
          <span className="section-mark">services</span>
          <div className="row ai-center gap-4" style={{ flexWrap: 'wrap' }}>
            <div className="row ai-center gap-2">
              <input
                type="checkbox"
                id="homeCollection"
                checked={formData.homeCollectionAvailable}
                onChange={(e) => updateField('homeCollectionAvailable', e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="homeCollection" className="form-label" style={{ margin: 0 }}>
                Home Collection Available
              </label>
            </div>
            {formData.homeCollectionAvailable && (
              <div className="row ai-center gap-2">
                <span className="kicker">Fee</span>
                <input
                  type="number"
                  value={formData.homeCollectionFee}
                  onChange={(e) => updateField('homeCollectionFee', e.target.value)}
                  placeholder="100"
                  className="input"
                  style={{ width: 100 }}
                />
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>INR</span>
              </div>
            )}
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
                id="isPartner"
                checked={formData.isPartner}
                onChange={(e) => updateField('isPartner', e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="isPartner" className="form-label" style={{ margin: 0 }}>Official Partner</label>
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
          <Link href="/admin/diagnostics/providers" className="btn btn-paper">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn btn-cobalt">
            {isSubmitting ? 'Creating…' : 'Create provider →'}
          </button>
        </div>
      </form>
    </div>
  );
}
