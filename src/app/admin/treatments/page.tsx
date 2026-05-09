import prisma from '@/lib/db';

export default async function AdminTreatmentsPage() {
    const specialties = await prisma.medicalCondition.groupBy({
        by: ['specialistType'],
        _count: { id: true },
        where: { isActive: true },
        orderBy: { _count: { id: 'desc' } },
    });

    const thStyle: React.CSSProperties = {
        padding: '12px 16px',
        textAlign: 'left',
        fontFamily: 'var(--mono)',
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--ink-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
    };
    const tdStyle: React.CSSProperties = {
        padding: '14px 16px',
        fontSize: 13,
        color: 'var(--ink-2)',
    };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <div className="col gap-2">
                <span className="section-mark">admin / treatments</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    Treatments<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                    Manage treatment categories and procedures.
                </p>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                        <tr>
                            <th scope="col" style={thStyle}>Specialty</th>
                            <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Conditions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specialties.map((s, i) => (
                            <tr key={i} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--ink)' }}>{s.specialistType || 'Unknown'}</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <span className="pill pill-cobalt">{s._count.id.toLocaleString()}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
