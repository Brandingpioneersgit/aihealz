'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Provider {
  id: number;
  slug: string;
  name: string;
  providerType: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  accreditations: string[];
  homeCollectionAvailable: boolean;
  homeCollectionFee?: number;
  isPartner: boolean;
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount: number;
  totalBookings: number;
  geography?: { id: number; name: string; slug: string };
  testPrices: Array<{
    id: number;
    price: number;
    test: { id: number; name: string; slug: string };
  }>;
  packages: Array<{ id: number; name: string; price: number; isActive: boolean }>;
  bookings: Array<{ id: number; patientName: string; status: string; createdAt: string }>;
  reviews: Array<{ id: number; reviewerName: string; rating: number; review?: string; createdAt: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  lab: 'Pathology Lab',
  imaging_center: 'Imaging Center',
  hospital: 'Hospital Lab',
  clinic: 'Clinic',
  home_collection: 'Home Collection',
  full_service: 'Full Service',
};

export default function DiagnosticProviderDetailPage() {
  const params = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'packages' | 'bookings' | 'reviews'>('overview');

  const fetchProvider = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/diagnostic-providers/${params.id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProvider(data);
      }
    } catch (error) {
      console.error('Failed to fetch provider:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  const handleToggle = async (field: 'isVerified' | 'isActive' | 'isPartner') => {
    if (!provider) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/diagnostic-providers/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !provider[field] }),
        credentials: 'include',
      });
      if (res.ok) {
        setProvider({ ...provider, [field]: !provider[field] });
      }
    } catch (error) {
      console.error('Failed to update provider:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImpersonate = () => {
    if (!provider) return;
    localStorage.setItem('admin_impersonating', 'true');
    localStorage.setItem('admin_original_session', localStorage.getItem('admin_session') || '');
    localStorage.setItem('provider_lab_id', provider.id.toString());
    localStorage.setItem('provider_session', JSON.stringify({ labId: provider.id, impersonated: true }));
    window.open('/provider/lab/dashboard', '_blank');
  };

  if (loading) {
    return (
      <div className="row ai-center center" style={{ height: 256 }}>
        <span
          style={{
            width: 24, height: 24, borderRadius: 999,
            border: '3px solid var(--rule)', borderTopColor: 'var(--cobalt)',
            animation: 'spin 0.8s linear infinite', display: 'inline-block',
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="col ai-center gap-3" style={{ padding: 48, textAlign: 'center' }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Provider not found
        </span>
        <Link href="/admin/diagnostics/providers" className="btn btn-paper">← Back to Providers</Link>
      </div>
    );
  }

  const statCards: Array<{ label: string; value: string; sub?: string; code: string }> = [
    { label: 'Rating', value: provider.rating ? Number(provider.rating).toFixed(1) : '—', sub: `${provider.reviewCount} reviews`, code: '★' },
    { label: 'Tests Available', value: provider.testPrices.length.toLocaleString(), code: 'TS' },
    { label: 'Health Packages', value: provider.packages.length.toLocaleString(), code: 'PK' },
    { label: 'Total Bookings', value: provider.totalBookings.toLocaleString(), code: 'BK' },
    { label: 'Home Collection', value: provider.homeCollectionAvailable ? 'Yes' : 'No', code: 'HC' },
  ];

  return (
    <div className="col gap-6" style={{ color: 'var(--ink)' }}>
      <Link
        href="/admin/diagnostics/providers"
        className="mono"
        style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        ← Back to providers
      </Link>

      <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div className="row ai-center gap-4">
          {provider.logo ? (
            <img src={provider.logo} alt={provider.name} style={{ width: 64, height: 64, borderRadius: 'var(--r-3)', objectFit: 'cover', border: '1px solid var(--rule)' }} />
          ) : (
            <div className="spec-icon" style={{ width: 64, height: 64, fontSize: 28 }}>{provider.name.charAt(0)}</div>
          )}
          <div className="col gap-2">
            <span className="section-mark">admin / diagnostics / providers / {provider.name}</span>
            <h1
              className="display"
              style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
            >
              {provider.name}<span style={{ color: 'var(--orange)' }}>.</span>
            </h1>
            <div className="row ai-center gap-2" style={{ flexWrap: 'wrap' }}>
              <span className="pill">{TYPE_LABELS[provider.providerType] || provider.providerType}</span>
              {provider.isPartner && <span className="pill pill-orange">Partner</span>}
              {provider.isVerified && <span className="pill pill-mint">✓ Verified</span>}
              {!provider.isActive && <span className="pill pill-orange">Inactive</span>}
            </div>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{provider.geography?.name || 'No location set'}</span>
          </div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <button onClick={handleImpersonate} className="btn btn-paper" style={{ color: 'var(--magenta)' }}>
            Impersonate
          </button>
          <button
            onClick={() => handleToggle('isPartner')}
            disabled={saving}
            className={provider.isPartner ? 'btn btn-paper' : 'btn btn-orange'}
          >
            {provider.isPartner ? 'Remove Partner' : 'Make Partner'}
          </button>
          <button
            onClick={() => handleToggle('isVerified')}
            disabled={saving}
            className={provider.isVerified ? 'btn btn-paper' : 'btn btn-cobalt'}
          >
            {provider.isVerified ? 'Remove Verification' : 'Verify'}
          </button>
          <button
            onClick={() => handleToggle('isActive')}
            disabled={saving}
            className={provider.isActive ? 'btn btn-orange' : 'btn btn-cobalt'}
          >
            {provider.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 0,
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-3)',
          background: 'var(--paper)',
          overflow: 'hidden',
        }}
      >
        {statCards.map((s) => (
          <div
            key={s.label}
            className="col gap-2"
            style={{
              padding: 20,
              borderRight: '1px solid var(--rule)',
              borderBottom: '1px solid var(--rule)',
              background: 'var(--paper)',
            }}
          >
            <div className="row ai-center gap-3">
              <span className="spec-icon" aria-hidden="true">{s.code}</span>
              <span className="kicker">{s.label}</span>
            </div>
            <div className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>
              {s.value}
            </div>
            {s.sub && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.sub}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="row gap-1 hairline-b">
        {[
          { key: 'overview' as const, label: 'Overview' },
          { key: 'tests' as const, label: `Tests (${provider.testPrices.length})` },
          { key: 'packages' as const, label: `Packages (${provider.packages.length})` },
          { key: 'bookings' as const, label: `Bookings (${provider.bookings.length})` },
          { key: 'reviews' as const, label: `Reviews (${provider.reviews.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="mono"
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--cobalt)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--cobalt)' : 'var(--ink-3)',
              fontSize: 12,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
          <div className="card col gap-3" style={{ padding: 24 }}>
            <span className="section-mark">provider details</span>
            {provider.description && (
              <div className="col gap-1">
                <span className="kicker">Description</span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{provider.description}</span>
              </div>
            )}
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              {[
                { label: 'Address', value: provider.address },
                { label: 'Phone', value: provider.phone },
                { label: 'Email', value: provider.email },
              ].map((row) => (
                <div key={row.label} className="col gap-1">
                  <span className="kicker">{row.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink)' }}>{row.value || '—'}</span>
                </div>
              ))}
              <div className="col gap-1">
                <span className="kicker">Website</span>
                {provider.website ? (
                  <a href={provider.website} target="_blank" rel="noopener" style={{ fontSize: 13, color: 'var(--cobalt)' }}>
                    {provider.website}
                  </a>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--ink)' }}>—</span>
                )}
              </div>
            </div>
          </div>

          <div className="card col gap-3" style={{ padding: 24 }}>
            <span className="section-mark">accreditations</span>
            {provider.accreditations.length > 0 ? (
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {provider.accreditations.map((acc) => (
                  <span key={acc} className="pill pill-cobalt">{acc}</span>
                ))}
              </div>
            ) : (
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                No accreditations added
              </span>
            )}

            {provider.homeCollectionAvailable && (
              <div
                className="card-flat col gap-1 hairline-t"
                style={{ paddingTop: 16, padding: 16, background: 'var(--mint-50)', borderColor: 'rgba(40, 212, 168, .30)' }}
              >
                <span style={{ fontWeight: 500, color: 'var(--mint-3)' }}>Home Collection Available</span>
                {provider.homeCollectionFee && (
                  <span style={{ fontSize: 13, color: 'var(--mint-3)' }}>
                    Fee: ₹{provider.homeCollectionFee}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {provider.testPrices.length > 0 ? (
            <div className="col">
              {provider.testPrices.map((tp) => (
                <div key={tp.id} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{tp.test.name}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>/{tp.test.slug}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--cobalt)' }}>₹{Number(tp.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              No tests configured
            </div>
          )}
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {provider.packages.length > 0 ? (
            <div className="col">
              {provider.packages.map((pkg) => (
                <div key={pkg.id} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                  <div className="row ai-center gap-3">
                    <span className="spec-icon" aria-hidden="true">PK</span>
                    <div className="col" style={{ gap: 2 }}>
                      <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{pkg.name}</span>
                      <span className="mono" style={{ fontSize: 11, color: pkg.isActive ? 'var(--mint-3)' : 'var(--orange-2)', textTransform: 'uppercase' }}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--magenta)' }}>₹{Number(pkg.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              No packages created
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {provider.bookings.length > 0 ? (
            <div className="col">
              {provider.bookings.map((booking) => (
                <div key={booking.id} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{booking.patientName}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={
                      booking.status === 'completed' ? 'pill pill-mint'
                      : booking.status === 'pending' ? 'pill pill-lemon'
                      : booking.status === 'cancelled' ? 'pill pill-orange'
                      : 'pill pill-cobalt'
                    }
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              No bookings yet
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="col gap-3">
          {provider.reviews.length > 0 ? (
            provider.reviews.map((review) => (
              <div key={review.id} className="card col gap-2" style={{ padding: 16 }}>
                <div className="row between ai-start">
                  <div className="col gap-1">
                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{review.reviewerName}</span>
                    <div className="row" style={{ gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? 'var(--lemon-2)' : 'var(--ink-5)' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.review && <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{review.review}</span>}
              </div>
            ))
          ) : (
            <div className="card mono" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              No reviews yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
