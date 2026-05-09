import prisma from '@/lib/db';
import Link from 'next/link';
import DoctorsTable from './DoctorsTable';

async function getDoctors() {
    const doctors = await prisma.doctorProvider.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            geography: {
                select: { name: true, slug: true }
            },
            _count: {
                select: {
                    specialties: true,
                    leadLogs: true,
                }
            }
        }
    });
    return doctors;
}

export default async function DoctorsPage() {
    const doctors = await getDoctors();

    const serializedDoctors = doctors.map(doctor => ({
        ...doctor,
        rating: doctor.rating ? parseFloat(doctor.rating.toString()) : null,
        consultationFee: doctor.consultationFee ? parseFloat(doctor.consultationFee.toString()) : null,
        badgeScore: doctor.badgeScore ? parseFloat(doctor.badgeScore.toString()) : null,
        contactInfo: (doctor.contactInfo && typeof doctor.contactInfo === 'object' && !Array.isArray(doctor.contactInfo))
            ? (doctor.contactInfo as { email?: string; phone?: string; address?: string })
            : null,
        createdAt: doctor.createdAt.toISOString(),
        updatedAt: doctor.updatedAt.toISOString(),
        verificationDate: doctor.verificationDate?.toISOString() || null,
        badgeUpdated: doctor.badgeUpdated?.toISOString() || null,
    }));

    const stats = {
        total: doctors.length,
        verified: doctors.filter(d => d.isVerified).length,
        premium: doctors.filter(d => d.subscriptionTier === 'premium' || d.subscriptionTier === 'enterprise').length,
        totalLeads: doctors.reduce((acc, d) => acc + d._count.leadLogs, 0),
    };

    const cards: Array<{ label: string; value: number; code: string }> = [
        { label: 'Total Doctors', value: stats.total, code: 'DR' },
        { label: 'Verified', value: stats.verified, code: 'VR' },
        { label: 'Premium / Enterprise', value: stats.premium, code: 'PR' },
        { label: 'Total Leads', value: stats.totalLeads, code: 'LE' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / doctors</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Doctor Profiles<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage healthcare providers in the network.
                    </p>
                </div>
                <Link href="/admin/doctors/new" className="btn btn-cobalt">
                    + Add Doctor
                </Link>
            </div>

            {/* Stats */}
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
                {cards.map((s) => (
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
                        <div className="num bignum" style={{ fontSize: 32, color: 'var(--ink)' }}>
                            {s.value.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <DoctorsTable doctors={serializedDoctors} />
        </div>
    );
}
