import prisma from '@/lib/db';
import Link from 'next/link';

export default async function AdminDiagnosticTestsPage() {
  const [tests, categories, stats] = await Promise.all([
    prisma.diagnosticTest.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { prices: true, bookings: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.diagnosticCategory.findMany({
      where: { parentId: null },
      include: {
        _count: { select: { tests: true } },
        children: {
          include: { _count: { select: { tests: true } } },
        },
      },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.diagnosticTest.aggregate({
      _count: true,
    }),
  ]);

  const withPricing = tests.filter((t) => t._count.prices > 0).length;
  const noPricing = tests.filter((t) => t._count.prices === 0).length;

  const statCards: Array<{ label: string; value: string; code: string }> = [
    { label: 'Total Tests', value: stats._count.toLocaleString(), code: 'TT' },
    { label: 'Categories', value: categories.length.toLocaleString(), code: 'CA' },
    { label: 'With Pricing', value: withPricing.toLocaleString(), code: 'WP' },
    { label: 'No Pricing', value: noPricing.toLocaleString(), code: 'NP' },
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
          <span className="section-mark">admin / diagnostics / tests</span>
          <h1
            className="display"
            style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
          >
            Diagnostic Tests<span style={{ color: 'var(--orange)' }}>.</span>
          </h1>
          <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
            Manage lab tests, imaging scans, and health checkups.
          </p>
        </div>
        <Link href="/admin/diagnostics/tests/new" className="btn btn-cobalt">
          + Add Test
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

      <div className="card col gap-3" style={{ padding: 20 }}>
        <span className="section-mark">categories</span>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const totalTests = cat._count.tests + cat.children.reduce((sum, c) => sum + c._count.tests, 0);
            return (
              <Link
                key={cat.id}
                href={`/admin/diagnostics/tests?category=${cat.slug}`}
                className="btn btn-paper btn-sm"
              >
                {cat.icon} {cat.name} ({totalTests})
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="hairline-b row between ai-center" style={{ padding: 16, flexWrap: 'wrap', gap: 12 }}>
          <span className="section-mark">recent tests</span>
          <input type="text" placeholder="Search tests…" className="input" style={{ maxWidth: 280 }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
              <tr>
                <th scope="col" style={thStyle}>Test Name</th>
                <th scope="col" style={thStyle}>Category</th>
                <th scope="col" style={thStyle}>Type</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Providers</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Bookings</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Avg Price</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                  <td style={tdStyle}>
                    <div className="col" style={{ gap: 2 }}>
                      <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{test.shortName || test.name}</span>
                      {test.shortName && (
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{test.name}</span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>{test.category.name}</td>
                  <td style={tdStyle}>
                    <span className="pill">{test.testType.replace('_', ' ')}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{test._count.prices}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{test._count.bookings}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: 'var(--cobalt)' }}>
                    {test.avgPriceInr ? `₹${Number(test.avgPriceInr).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span className={test.isActive ? 'pill pill-mint' : 'pill pill-orange'}>
                      {test.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <Link
                      href={`/admin/diagnostics/tests/${test.id}`}
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
      </div>
    </div>
  );
}
