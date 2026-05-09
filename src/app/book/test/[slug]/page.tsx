'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface BookingFormData {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge: string;
  patientGender: string;
  collectionType: 'walk_in' | 'home_collection';
  preferredDate: string;
  preferredTime: string;
  collectionAddress: string;
  notes: string;
}

interface TestInfo {
  id: number;
  name: string;
  slug: string;
  sampleType: string | null;
  fastingRequired: boolean;
  reportTimeHours: number | null;
  homeCollectionPossible: boolean;
}

interface ProviderInfo {
  id: number;
  name: string;
  slug: string;
  homeCollectionAvailable: boolean;
  homeCollectionFee: number | null;
  address: string | null;
  phone: string | null;
  price: number;
  mrpPrice: number | null;
}

export default function BookTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams();
  const providerSlug = searchParams.get('provider');

  const [testSlug, setTestSlug] = useState<string>('');
  const [test, setTest] = useState<TestInfo | null>(null);
  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    collectionType: 'walk_in',
    preferredDate: '',
    preferredTime: '',
    collectionAddress: '',
    notes: '',
  });

  useEffect(() => {
    params.then((p) => setTestSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!testSlug) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/diagnostics/test-info?slug=${testSlug}&provider=${providerSlug || ''}`);
        const data = await res.json();
        if (data.test) setTest(data.test);
        if (data.provider) setProvider(data.provider);
      } catch {
        setError('Failed to load test information');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [testSlug, providerSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test || !provider) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/diagnostics/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          testId: test.id,
          ...formData,
          patientAge: formData.patientAge ? parseInt(formData.patientAge, 10) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setSuccess(true);
      setBookingId(data.bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 28px' }} className="col gap-5">
          <div style={{ height: 11, width: 200, background: 'var(--rule)', borderRadius: 'var(--r-1)' }} />
          <div style={{ height: 36, width: 360, background: 'var(--rule)', borderRadius: 'var(--r-2)' }} />
          <div className="card col gap-4" style={{ padding: 28 }}>
            <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
            <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
            <div style={{ height: 44, background: 'var(--bg-2)', borderRadius: 'var(--r-2)' }} />
            <div style={{ height: 48, background: 'var(--cobalt-50)', borderRadius: 'var(--r-2)' }} />
          </div>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 28px' }} className="col gap-5">
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
            <Link href="/tests" style={{ color: 'var(--ink-3)' }}>Tests</Link>
            <span aria-hidden="true">/</span>
            <span style={{ color: 'var(--ink)' }}>Submitted</span>
          </nav>

          <div className="card col gap-4 ai-center" style={{ padding: 48, textAlign: 'center' }}>
            <div
              className="row ai-center center"
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--r-2)',
                background: 'var(--mint-50)',
                border: '1px solid rgba(40, 212, 168, .30)',
              }}
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mint-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="pill pill-mint">
              <span className="pill-dot" style={{ background: 'var(--mint)' }} aria-hidden="true" />
              Submitted
            </span>
            <h1
              className="display"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.05 }}
            >
              Booking submitted<span style={{ color: 'var(--orange)' }}>.</span>
            </h1>
            <p className="lede" style={{ fontSize: 16, margin: 0, maxWidth: 440 }}>
              Your booking request has been received. The diagnostic center will contact you shortly to confirm the appointment.
            </p>
            {bookingId && (
              <span className="mono muted" style={{ fontSize: 12, letterSpacing: '0.06em' }}>
                booking id · {bookingId}
              </span>
            )}
            <div className="row gap-2 center" style={{ flexWrap: 'wrap', marginTop: 8 }}>
              <Link href="/tests" className="btn btn-paper">
                Browse more tests
              </Link>
              <Link href="/" className="btn btn-cobalt">
                Go home →
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }} className="col gap-6">
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
          <Link href="/tests" style={{ color: 'var(--ink-3)' }}>Tests</Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: 'var(--ink)' }}>Book test</span>
        </nav>

        {/* Hero */}
        <header className="col gap-2">
          <span className="section-mark">book a test</span>
          <h1
            className="display"
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              margin: 0,
              fontWeight: 600,
            }}
          >
            {test ? <>Book <span style={{ color: 'var(--cobalt)' }}>{test.name}</span></> : 'Book your test'}
            <span style={{ color: 'var(--orange)' }}>.</span>
          </h1>
          <p className="lede" style={{ fontSize: 16, margin: 0 }}>
            Fill in your details and we&apos;ll coordinate with the lab.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: 24,
          }}
        >
          {/* Form */}
          <form onSubmit={handleSubmit} className="col gap-5">
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

            {/* Patient info */}
            <section className="card col gap-4" style={{ padding: 24 }}>
              <div className="col gap-1">
                <span className="kicker"><span className="dot" />patient details</span>
                <h2
                  className="display"
                  style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                >
                  Patient information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="patientName">
                    Full name <span style={{ color: 'var(--orange-2)' }}>*</span>
                  </label>
                  <input
                    id="patientName"
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="input"
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="patientPhone">
                    Phone number <span style={{ color: 'var(--orange-2)' }}>*</span>
                  </label>
                  <input
                    id="patientPhone"
                    type="tel"
                    required
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="patientEmail">Email</label>
                  <input
                    id="patientEmail"
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    className="input"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid grid-cols-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="patientAge">Age</label>
                    <input
                      id="patientAge"
                      type="number"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                      className="input"
                      placeholder="Age"
                      min="0"
                      max="150"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="patientGender">Gender</label>
                    <select
                      id="patientGender"
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                      className="select"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Collection */}
            <section className="card col gap-4" style={{ padding: 24 }}>
              <div className="col gap-1">
                <span className="kicker"><span className="dot" />collection</span>
                <h2
                  className="display"
                  style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}
                >
                  Collection preference
                </h2>
              </div>

              <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                <label
                  className="card-flat row gap-3 ai-center"
                  style={{
                    padding: 16,
                    flex: '1 1 220px',
                    cursor: 'pointer',
                    background: formData.collectionType === 'walk_in' ? 'var(--cobalt-50)' : 'var(--paper)',
                    borderColor: formData.collectionType === 'walk_in' ? 'rgba(28, 91, 255, .35)' : 'var(--rule)',
                  }}
                >
                  <input
                    type="radio"
                    name="collectionType"
                    value="walk_in"
                    checked={formData.collectionType === 'walk_in'}
                    onChange={(e) => setFormData({ ...formData, collectionType: e.target.value as 'walk_in' | 'home_collection' })}
                    style={{ width: 16, height: 16, accentColor: 'var(--cobalt)' }}
                  />
                  <div className="col gap-1">
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Visit lab</span>
                    <span className="muted" style={{ fontSize: 12 }}>Walk-in to the center</span>
                  </div>
                </label>

                {test?.homeCollectionPossible && provider?.homeCollectionAvailable && (
                  <label
                    className="card-flat row gap-3 ai-center"
                    style={{
                      padding: 16,
                      flex: '1 1 220px',
                      cursor: 'pointer',
                      background: formData.collectionType === 'home_collection' ? 'var(--cobalt-50)' : 'var(--paper)',
                      borderColor: formData.collectionType === 'home_collection' ? 'rgba(28, 91, 255, .35)' : 'var(--rule)',
                    }}
                  >
                    <input
                      type="radio"
                      name="collectionType"
                      value="home_collection"
                      checked={formData.collectionType === 'home_collection'}
                      onChange={(e) => setFormData({ ...formData, collectionType: e.target.value as 'walk_in' | 'home_collection' })}
                      style={{ width: 16, height: 16, accentColor: 'var(--cobalt)' }}
                    />
                    <div className="col gap-1">
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Home collection</span>
                      <span className="muted num" style={{ fontSize: 12 }}>
                        {provider?.homeCollectionFee ? `+${formatPrice(provider.homeCollectionFee)}` : 'Free'}
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {formData.collectionType === 'home_collection' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="collectionAddress">
                    Collection address <span style={{ color: 'var(--orange-2)' }}>*</span>
                  </label>
                  <textarea
                    id="collectionAddress"
                    required
                    value={formData.collectionAddress}
                    onChange={(e) => setFormData({ ...formData, collectionAddress: e.target.value })}
                    className="textarea"
                    placeholder="Enter your complete address for sample collection"
                    rows={3}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="preferredDate">Preferred date</label>
                  <input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="preferredTime">Preferred time</label>
                  <select
                    id="preferredTime"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="select"
                  >
                    <option value="">Any time</option>
                    <option value="06:00-08:00">6:00 AM – 8:00 AM</option>
                    <option value="08:00-10:00">8:00 AM – 10:00 AM</option>
                    <option value="10:00-12:00">10:00 AM – 12:00 PM</option>
                    <option value="12:00-14:00">12:00 PM – 2:00 PM</option>
                    <option value="14:00-16:00">2:00 PM – 4:00 PM</option>
                    <option value="16:00-18:00">4:00 PM – 6:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">Additional notes</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="textarea"
                  placeholder="Any special requirements or medical conditions to note"
                  rows={2}
                />
              </div>
            </section>

            <button
              type="submit"
              disabled={submitting || !test || !provider}
              className="btn btn-cobalt btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? 'Submitting…' : 'Confirm booking →'}
            </button>
          </form>

          {/* Order summary */}
          <aside>
            <div className="card col" style={{ padding: 0, position: 'sticky', top: 96 }}>
              <div className="hairline-b" style={{ padding: '16px 20px' }}>
                <h3
                  className="display"
                  style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}
                >
                  Order summary
                </h3>
              </div>

              {test && (
                <div className="col gap-2 hairline-b" style={{ padding: '16px 20px' }}>
                  <span className="kicker">test</span>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{test.name}</p>
                  <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    {test.sampleType && <span className="pill">{test.sampleType}</span>}
                    {test.fastingRequired && <span className="pill pill-orange">fasting</span>}
                    {test.reportTimeHours && (
                      <span className="pill">
                        Report · {test.reportTimeHours < 24 ? `${test.reportTimeHours}h` : `${Math.round(test.reportTimeHours / 24)}d`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {provider && (
                <div className="col gap-2 hairline-b" style={{ padding: '16px 20px' }}>
                  <span className="kicker">lab</span>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{provider.name}</p>
                  {provider.address && (
                    <p className="muted" style={{ fontSize: 12, margin: 0 }}>{provider.address}</p>
                  )}
                </div>
              )}

              {provider && (
                <div className="col gap-2" style={{ padding: '16px 20px' }}>
                  <div className="row between ai-center">
                    <span className="muted" style={{ fontSize: 13 }}>Test price</span>
                    <span className="num" style={{ fontSize: 13, color: 'var(--ink)' }}>{formatPrice(provider.price)}</span>
                  </div>
                  {formData.collectionType === 'home_collection' && provider.homeCollectionFee && (
                    <div className="row between ai-center">
                      <span className="muted" style={{ fontSize: 13 }}>Home collection</span>
                      <span className="num" style={{ fontSize: 13, color: 'var(--ink)' }}>
                        {formatPrice(provider.homeCollectionFee)}
                      </span>
                    </div>
                  )}
                  <div className="hairline" />
                  <div className="row between ai-baseline">
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Total</span>
                    <span
                      className="display num"
                      style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--cobalt)' }}
                    >
                      {formatPrice(
                        provider.price +
                          (formData.collectionType === 'home_collection' && provider.homeCollectionFee
                            ? provider.homeCollectionFee
                            : 0)
                      )}
                    </span>
                  </div>
                  {provider.mrpPrice && provider.mrpPrice > provider.price && (
                    <p className="muted num" style={{ fontSize: 11, textAlign: 'right', margin: 0 }}>
                      You save {formatPrice(provider.mrpPrice - provider.price)}
                    </p>
                  )}
                  <p className="form-hint" style={{ marginTop: 8, margin: 0 }}>
                    Payment collected at the lab or during home collection.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
