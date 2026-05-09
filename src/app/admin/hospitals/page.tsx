import prisma from '@/lib/db';
import Link from 'next/link';

export default async function HospitalsAdminPage() {
    const [hospitals, stats] = await Promise.all([
        prisma.hospital.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                geography: { select: { name: true } },
                _count: {
                    select: {
                        doctors: true,
                        reviews: true,
                        enquiries: true,
                        specialties: true,
                        insuranceTies: true,
                    },
                },
            },
        }),
        Promise.all([
            prisma.hospital.count(),
            prisma.hospital.count({ where: { isVerified: true } }),
            prisma.hospital.count({ where: { isActive: true } }),
            prisma.hospital.aggregate({ _avg: { bedCount: true } }),
            prisma.hospitalEnquiry.count({ where: { status: 'new' } }),
        ]),
    ]);

    const [totalCount, verifiedCount, activeCount, avgBeds, pendingEnquiries] = stats;

    const hospitalTypeLabels: Record<string, string> = {
        government: 'Government',
        private: 'Private',
        public_private_partnership: 'PPP',
        charitable: 'Charitable',
        trust: 'Trust',
        corporate_chain: 'Corporate Chain',
    };

    const statCards: Array<{ label: string; value: string; code: string }> = [
        { label: 'Total Hospitals', value: totalCount.toLocaleString(), code: 'TT' },
        { label: 'Verified', value: verifiedCount.toLocaleString(), code: 'VR' },
        { label: 'Active', value: activeCount.toLocaleString(), code: 'AC' },
        { label: 'Avg Beds', value: Math.round(avgBeds._avg.bedCount || 0).toLocaleString(), code: 'BD' },
        { label: 'Pending Enquiries', value: pendingEnquiries.toLocaleString(), code: 'PE' },
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
                    <span className="section-mark">admin / hospitals</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Hospitals<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage hospital profiles, reviews, and enquiries.
                    </p>
                </div>
                <Link href="/admin/hospitals/new" className="btn btn-cobalt">
                    + Add Hospital
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

            {/* Filters */}
            <div className="card row gap-3" style={{ padding: 16, flexWrap: 'wrap' }}>
                <input type="text" placeholder="Search hospitals…" className="input" style={{ flex: 1, minWidth: 200 }} />
                <select className="select" style={{ width: 'auto', minWidth: 140 }}>
                    <option value="">All Types</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="corporate_chain">Corporate Chain</option>
                    <option value="charitable">Charitable</option>
                </select>
                <select className="select" style={{ width: 'auto', minWidth: 140 }}>
                    <option value="">All Cities</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Chennai">Chennai</option>
                </select>
                <select className="select" style={{ width: 'auto', minWidth: 140 }}>
                    <option value="">Verification</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                </select>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                {hospitals.length === 0 ? (
                    <div className="col ai-center gap-4" style={{ padding: 48, textAlign: 'center' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            No hospitals added yet
                        </span>
                        <Link href="/admin/hospitals/new" className="btn btn-cobalt">
                            Add First Hospital
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                                <tr>
                                    <th scope="col" style={thStyle}>Hospital</th>
                                    <th scope="col" style={thStyle}>Type</th>
                                    <th scope="col" style={thStyle}>Location</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Beds</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Doctors</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Reviews</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Insurance</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hospitals.map((hospital) => (
                                    <tr key={hospital.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                        <td style={tdStyle}>
                                            <div className="row ai-center gap-3">
                                                {hospital.logo ? (
                                                    <img src={hospital.logo} alt={hospital.name} style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', objectFit: 'cover', border: '1px solid var(--rule)' }} />
                                                ) : (
                                                    <span className="spec-icon" aria-hidden="true">{hospital.name.charAt(0)}</span>
                                                )}
                                                <div className="col" style={{ gap: 2 }}>
                                                    <Link href={`/admin/hospitals/${hospital.id}`} style={{ fontWeight: 500, color: 'var(--ink)' }}>
                                                        {hospital.name}
                                                    </Link>
                                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>/{hospital.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span className="pill">{hospitalTypeLabels[hospital.hospitalType] || hospital.hospitalType}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            {hospital.city || hospital.geography?.name || '—'}
                                            {hospital.state && <span style={{ color: 'var(--ink-4)' }}>, {hospital.state}</span>}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{hospital.bedCount || '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{hospital._count.doctors}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <div className="row ai-center center gap-1">
                                                {hospital.overallRating && (
                                                    <>
                                                        <span style={{ color: 'var(--lemon-2)' }}>★</span>
                                                        <span style={{ fontWeight: 500 }}>{Number(hospital.overallRating).toFixed(1)}</span>
                                                    </>
                                                )}
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>({hospital._count.reviews})</span>
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{hospital._count.insuranceTies}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <div className="row ai-center center gap-1">
                                                {hospital.isVerified && <span className="pill pill-mint">Verified</span>}
                                                {!hospital.isActive && <span className="pill pill-orange">Inactive</span>}
                                                {hospital.isActive && !hospital.isVerified && <span className="pill pill-lemon">Pending</span>}
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <div className="row ai-center gap-1" style={{ justifyContent: 'flex-end' }}>
                                                <Link
                                                    href={`/hospitals/${hospital.slug}`}
                                                    target="_blank"
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    View ↗
                                                </Link>
                                                <Link
                                                    href={`/admin/hospitals/${hospital.id}`}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--cobalt)' }}
                                                >
                                                    Manage
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card-quiet col gap-3" style={{ padding: 20 }}>
                <span className="section-mark">common accreditations</span>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    {['NABH', 'JCI', 'NABL', 'ISO 9001', 'ISO 14001', 'Green OT'].map((acc) => (
                        <span key={acc} className="pill">{acc}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
