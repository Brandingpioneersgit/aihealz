'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TYPE_LABELS: Record<string, string> = {
  lab: 'Pathology Lab',
  imaging_center: 'Imaging Center',
  hospital: 'Hospital',
  clinic: 'Clinic',
  home_collection: 'Home Collection',
  full_service: 'Full Service',
};

interface Provider {
  id: number;
  slug: string;
  name: string;
  providerType: string;
  logo?: string;
  isPartner: boolean;
  isVerified: boolean;
  isActive: boolean;
  homeCollectionAvailable: boolean;
  accreditations: string[];
  rating?: number;
  reviewCount: number;
  geography?: { name: string };
  _count: {
    testPrices: number;
    packages: number;
    bookings: number;
    reviews: number;
  };
}

interface ProviderStats {
  total: number;
  avgRating: string | null;
  partners: number;
  verified: number;
  homeCollection: number;
}

export default function AdminDiagnosticProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/admin/diagnostic-providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = (providerId: number) => {
    localStorage.setItem('admin_impersonating', 'true');
    localStorage.setItem('admin_original_session', localStorage.getItem('admin_session') || '');
    localStorage.setItem('provider_lab_id', providerId.toString());
    localStorage.setItem('provider_session', JSON.stringify({ labId: providerId, impersonated: true }));
    window.open('/provider/lab/dashboard', '_blank');
  };

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.geography?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const thStyle: React.CSSProperties = {
    padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--mono)',
    fontSize: 10, fontWeight: 600, color: 'var(--ink-3)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  };
  const tdStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: 13, color: 'var(--ink-2)', verticalAlign: 'middle',
  };

  if (loading) {
    return (
      <div className="row ai-center center" style={{ height: 256 }}>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            border: '3px solid var(--rule)',
            borderTopColor: 'var(--cobalt)',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const statCards: Array<{ label: string; value: string; code: string }> = [
    { label: 'Total Providers', value: (stats?.total || 0).toLocaleString(), code: 'TT' },
    { label: 'Partners', value: (stats?.partners || 0).toLocaleString(), code: 'PR' },
    { label: 'Verified', value: (stats?.verified || 0).toLocaleString(), code: 'VR' },
    { label: 'Home Collection', value: (stats?.homeCollection || 0).toLocaleString(), code: 'HC' },
    { label: 'Avg Rating', value: stats?.avgRating || '—', code: 'AR' },
  ];

  return (
    <div className="col gap-6" style={{ color: 'var(--ink)' }}>
      <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div className="col gap-2">
          <span className="section-mark">admin / diagnostics / providers</span>
          <h1
            className="display"
            style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
          >
            Diagnostic Providers<span style={{ color: 'var(--orange)' }}>.</span>
          </h1>
          <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
            Manage labs, imaging centers and diagnostic service providers.
          </p>
        </div>
        <Link href="/admin/diagnostics/providers/new" className="btn btn-cobalt">
          + Add Provider
        </Link>
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
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="hairline-b row between ai-center" style={{ padding: 16, flexWrap: 'wrap', gap: 12 }}>
          <span className="section-mark">all providers</span>
          <input
            type="text"
            placeholder="Search providers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ maxWidth: 280 }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
              <tr>
                <th scope="col" style={thStyle}>Provider</th>
                <th scope="col" style={thStyle}>Type</th>
                <th scope="col" style={thStyle}>Location</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Tests</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Packages</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Bookings</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Rating</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((provider) => (
                <tr key={provider.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                  <td style={tdStyle}>
                    <div className="row ai-center gap-3">
                      {provider.logo ? (
                        <img src={provider.logo} alt={provider.name} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'cover' }} />
                      ) : (
                        <span className="spec-icon" aria-hidden="true">{provider.name.charAt(0)}</span>
                      )}
                      <div className="col" style={{ gap: 2 }}>
                        <div className="row ai-center gap-2">
                          <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{provider.name}</span>
                          {provider.isPartner && <span className="pill pill-orange">Partner</span>}
                        </div>
                        {provider.accreditations.length > 0 && (
                          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                            {provider.accreditations.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span className="pill">{TYPE_LABELS[provider.providerType] || provider.providerType}</span>
                  </td>
                  <td style={tdStyle}>{provider.geography?.name || '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{provider._count.testPrices}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{provider._count.packages}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{provider._count.bookings}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {provider.rating ? (
                      <div className="row ai-center center gap-1">
                        <span style={{ color: 'var(--lemon-2)' }}>★</span>
                        <span style={{ fontWeight: 500 }}>{Number(provider.rating).toFixed(1)}</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>({provider.reviewCount})</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ink-4)' }}>—</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div className="row ai-center center gap-1">
                      {provider.isVerified && <span className="pill pill-mint">Verified</span>}
                      <span className={provider.isActive ? 'pill pill-cobalt' : 'pill pill-orange'}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div className="row ai-center gap-1" style={{ justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleImpersonate(provider.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--magenta)' }}
                        title="Login as this provider"
                      >
                        Impersonate
                      </button>
                      <Link
                        href={`/admin/diagnostics/providers/${provider.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--cobalt)' }}
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProviders.length === 0 && (
          <div
            className="mono"
            style={{
              padding: 48,
              textAlign: 'center',
              color: 'var(--ink-4)',
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            No providers found
          </div>
        )}
      </div>
    </div>
  );
}
