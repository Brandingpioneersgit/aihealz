import prisma from '@/lib/db';
import Link from 'next/link';
import ConditionsTable from './ConditionsTable';

async function getStats() {
    const [total, activeCount, contentCount, specialtyBreakdown] = await Promise.all([
        prisma.medicalCondition.count(),
        prisma.medicalCondition.count({ where: { isActive: true } }),
        prisma.localizedContent.count(),
        prisma.medicalCondition.groupBy({
            by: ['specialistType'],
            _count: { _all: true },
            orderBy: { _count: { specialistType: 'desc' } },
        }),
    ]);

    const specialties = specialtyBreakdown.map(s => s.specialistType).sort();

    return { total, activeCount, contentCount, specialties, specialtyCount: specialtyBreakdown.length };
}

export default async function ConditionsPage() {
    const { total, activeCount, contentCount, specialties, specialtyCount } = await getStats();

    const stats: Array<{ label: string; value: number; code: string; pill?: string }> = [
        { label: 'Total Conditions', value: total, code: 'TC' },
        { label: 'Active', value: activeCount, code: 'AC', pill: 'pill-mint' },
        { label: 'Inactive', value: total - activeCount, code: 'IN' },
        { label: 'Content Pages', value: contentCount, code: 'CT', pill: 'pill-cobalt' },
        { label: 'Specialties', value: specialtyCount, code: 'SP', pill: 'pill-magenta' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / conditions</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Medical Conditions<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage all medical conditions in the system.
                    </p>
                </div>
                <Link href="/admin/conditions/new" className="btn btn-cobalt">
                    + Add Condition
                </Link>
            </div>

            {/* Stats grid */}
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
                {stats.map((s) => (
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

            {/* Table (fetches its own data via API) */}
            <ConditionsTable specialties={specialties} />
        </div>
    );
}
