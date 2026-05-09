import prisma from '@/lib/db';
import Link from 'next/link';

const STATUS_PILL: Record<string, string> = {
  pending: 'pill pill-lemon',
  confirmed: 'pill pill-cobalt',
  sample_collected: 'pill pill-cobalt',
  processing: 'pill pill-magenta',
  report_ready: 'pill pill-mint',
  completed: 'pill pill-mint',
  cancelled: 'pill pill-orange',
  no_show: 'pill',
};

const PAYMENT_PILL: Record<string, string> = {
  pending: 'pill pill-lemon',
  paid: 'pill pill-mint',
  partial: 'pill pill-orange',
  refunded: 'pill pill-cobalt',
  failed: 'pill pill-orange',
};

export default async function AdminDiagnosticBookingsPage() {
  const [bookings, stats] = await Promise.all([
    prisma.diagnosticBooking.findMany({
      include: {
        provider: { select: { name: true, slug: true } },
        test: { select: { name: true, shortName: true, slug: true } },
        package: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.diagnosticBooking.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const totalBookings = stats.reduce((sum, s) => sum + s._count, 0);
  const pendingCount = stats.find((s) => s.status === 'pending')?._count || 0;
  const completedCount = stats.find((s) => s.status === 'completed')?._count || 0;
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.finalPrice), 0);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  const statCards: Array<{ label: string; value: string; code: string }> = [
    { label: 'Total Bookings', value: totalBookings.toLocaleString(), code: 'TT' },
    { label: 'Pending', value: pendingCount.toLocaleString(), code: 'PD' },
    { label: 'Completed', value: completedCount.toLocaleString(), code: 'CO' },
    { label: 'Total Revenue', value: bookings.length > 0 ? `₹${totalRevenue.toLocaleString('en-IN')}` : '₹0', code: 'RV' },
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
      <div className="col gap-2">
        <span className="section-mark">admin / diagnostics / bookings</span>
        <h1
          className="display"
          style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
        >
          Test Bookings<span style={{ color: 'var(--orange)' }}>.</span>
        </h1>
        <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
          Manage diagnostic test and package bookings.
        </p>
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

      {/* Status filters */}
      <div className="card row gap-2" style={{ padding: 16, flexWrap: 'wrap' }}>
        <Link href="/admin/diagnostics/bookings" className="btn btn-cobalt btn-sm">
          All ({totalBookings})
        </Link>
        {stats.map((s) => (
          <Link
            key={s.status}
            href={`/admin/diagnostics/bookings?status=${s.status}`}
            className={`${STATUS_PILL[s.status] || 'pill'}`}
            style={{ textTransform: 'uppercase', cursor: 'pointer' }}
          >
            {s.status.replace('_', ' ')} ({s._count})
          </Link>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
              <tr>
                <th scope="col" style={thStyle}>Booking ID</th>
                <th scope="col" style={thStyle}>Patient</th>
                <th scope="col" style={thStyle}>Test/Package</th>
                <th scope="col" style={thStyle}>Provider</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Collection</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Payment</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                  <td style={tdStyle}>
                    <Link
                      href={`/admin/diagnostics/bookings/${booking.id}`}
                      className="mono"
                      style={{ color: 'var(--cobalt)', fontSize: 12 }}
                    >
                      {booking.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <div className="col" style={{ gap: 2 }}>
                      <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{booking.patientName}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{booking.patientPhone}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {booking.test?.shortName || booking.test?.name || booking.package?.name || 'N/A'}
                  </td>
                  <td style={tdStyle}>
                    <Link
                      href={`/admin/diagnostics/providers/${booking.provider.slug}`}
                      style={{ color: 'var(--ink-2)' }}
                    >
                      {booking.provider.name}
                    </Link>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span className={booking.collectionType === 'home_collection' ? 'pill pill-cobalt' : 'pill'}>
                      {booking.collectionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span className={STATUS_PILL[booking.status] || 'pill'}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span className={PAYMENT_PILL[booking.paymentStatus] || 'pill'}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>
                    ₹{Number(booking.finalPrice).toLocaleString('en-IN')}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontSize: 12, color: 'var(--ink-3)' }}>
                    {formatDate(booking.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
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
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
}
