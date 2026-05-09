import prisma from '@/lib/db';
import LeadsTable from './LeadsTable';

async function getLeads() {
    const leads = await prisma.leadLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        include: {
            doctor: {
                select: { id: true, name: true, slug: true }
            },
            geography: {
                select: { id: true, name: true, slug: true }
            },
        }
    });
    return leads;
}

async function getStats() {
    const [total, high, medium, low, viewed, contacted] = await Promise.all([
        prisma.leadLog.count(),
        prisma.leadLog.count({ where: { intentLevel: 'high' } }),
        prisma.leadLog.count({ where: { intentLevel: 'medium' } }),
        prisma.leadLog.count({ where: { intentLevel: 'low' } }),
        prisma.leadLog.count({ where: { isViewed: true } }),
        prisma.leadLog.count({ where: { isContacted: true } }),
    ]);

    return { total, high, medium, low, viewed, contacted };
}

export default async function LeadsPage() {
    const [leads, stats] = await Promise.all([getLeads(), getStats()]);

    const cards: Array<{ label: string; value: number; code: string }> = [
        { label: 'Total Leads', value: stats.total, code: 'TT' },
        { label: 'High Intent', value: stats.high, code: 'HI' },
        { label: 'Medium Intent', value: stats.medium, code: 'MD' },
        { label: 'Low Intent', value: stats.low, code: 'LO' },
        { label: 'Viewed', value: stats.viewed, code: 'VW' },
        { label: 'Contacted', value: stats.contacted, code: 'CT' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="col gap-2">
                <span className="section-mark">admin / leads</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    Lead Management<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                    Track and manage patient enquiry leads.
                </p>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
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
                        <div className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>
                            {s.value.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <LeadsTable leads={leads} />
        </div>
    );
}
