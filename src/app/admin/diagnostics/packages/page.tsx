import prisma from '@/lib/db';
import Link from 'next/link';

const TYPE_LABELS: Record<string, string> = {
  health_checkup: 'Health Checkup',
  disease_specific: 'Disease Specific',
  organ_specific: 'Organ Specific',
  age_specific: 'Age Specific',
  gender_specific: 'Gender Specific',
  lifestyle: 'Lifestyle',
  preventive: 'Preventive',
  corporate: 'Corporate',
};

export default async function AdminDiagnosticPackagesPage() {
  const [packages, stats] = await Promise.all([
    prisma.diagnosticPackage.findMany({
      include: {
        provider: { select: { name: true, slug: true } },
        tests: {
          include: {
            test: { select: { name: true, shortName: true } },
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.diagnosticPackage.aggregate({
      _count: true,
      _avg: { price: true },
    }),
  ]);

  const featuredCount = packages.filter((p) => p.isFeatured).length;
  const totalBookings = packages.reduce((sum, p) => sum + p._count.bookings, 0);

  const statCards: Array<{ label: string; value: string; code: string }> = [
    { label: 'Total Packages', value: stats._count.toLocaleString(), code: 'TT' },
    { label: 'Featured', value: featuredCount.toLocaleString(), code: 'FT' },
    { label: 'Avg Price', value: stats._avg.price ? `₹${Math.round(Number(stats._avg.price)).toLocaleString('en-IN')}` : '—', code: 'AP' },
    { label: 'Total Bookings', value: totalBookings.toLocaleString(), code: 'BK' },
  ];

  const thStyle: React.CSSProperties = {
    padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--mono)',
    fontSize: 10, fontWeight: 600, color: 'var(--ink-3)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  };
  const tdStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: 13, color: 'var(--ink-2)', verticalAlign: 'middle',
  };

  return (
    <div className="col gap-6" style={{ color: 'var(--ink)' }}>
      <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div className="col gap-2">
          <span className="section-mark">admin / diagnostics / packages</span>
          <h1
            className="display"
            style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
          >
            Health Packages<span style={{ color: 'var(--orange)' }}>.</span>
          </h1>
          <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
            Manage bundled test packages from providers.
          </p>
        </div>
        <Link href="/admin/diagnostics/packages/new" className="btn btn-cobalt">
          + Add Package
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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

      {/* Type filters */}
      <div className="card row gap-2" style={{ padding: 16, flexWrap: 'wrap' }}>
        <Link href="/admin/diagnostics/packages" className="btn btn-cobalt btn-sm">
          All Packages
        </Link>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/diagnostics/packages?type=${key}`}
            className="btn btn-paper btn-sm"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
              <tr>
                <th scope="col" style={thStyle}>Package Name</th>
                <th scope="col" style={thStyle}>Provider</th>
                <th scope="col" style={thStyle}>Type</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Tests</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Bookings</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                  <td style={tdStyle}>
                    <div className="row ai-center gap-2">
                      <div className="col" style={{ gap: 2 }}>
                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{pkg.name}</span>
                        {pkg.targetAudience && (
                          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                            For: {pkg.targetAudience}
                          </span>
                        )}
                      </div>
                      {pkg.isFeatured && <span className="pill pill-orange">Featured</span>}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <Link
                      href={`/admin/diagnostics/providers/${pkg.provider.slug}`}
                      style={{ color: 'var(--ink-2)' }}
                    >
                      {pkg.provider.name}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <span className="pill">{TYPE_LABELS[pkg.packageType] || pkg.packageType}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{pkg.tests.length}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{pkg._count.bookings}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div className="col ai-end" style={{ gap: 2 }}>
                      <span style={{ fontWeight: 600, color: 'var(--cobalt)' }}>
                        ₹{Number(pkg.price).toLocaleString('en-IN')}
                      </span>
                      {pkg.mrpPrice && Number(pkg.mrpPrice) > Number(pkg.price) && (
                        <span style={{ fontSize: 11, color: 'var(--ink-4)', textDecoration: 'line-through' }}>
                          ₹{Number(pkg.mrpPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span className={pkg.isActive ? 'pill pill-mint' : 'pill pill-orange'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <Link
                      href={`/admin/diagnostics/packages/${pkg.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--cobalt)' }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {packages.length === 0 && (
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
            No packages found
          </div>
        )}
      </div>
    </div>
  );
}
