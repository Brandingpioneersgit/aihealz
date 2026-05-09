import prisma from '@/lib/db';
import Link from 'next/link';
import ContentTable from './ContentTable';

async function getContent() {
    const content = await prisma.localizedContent.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 500,
        include: {
            condition: {
                select: { id: true, commonName: true, slug: true }
            },
            language: {
                select: { code: true, name: true }
            },
            geography: {
                select: { id: true, name: true, slug: true }
            },
            reviewer: {
                select: { id: true, name: true }
            }
        }
    });
    return content;
}

async function getStats() {
    const [total, aiDraft, underReview, verified, published] = await Promise.all([
        prisma.localizedContent.count(),
        prisma.localizedContent.count({ where: { status: 'ai_draft' } }),
        prisma.localizedContent.count({ where: { status: 'under_review' } }),
        prisma.localizedContent.count({ where: { status: 'verified' } }),
        prisma.localizedContent.count({ where: { status: 'published' } }),
    ]);

    return { total, aiDraft, underReview, verified, published };
}

export default async function ContentPage() {
    const [content, stats] = await Promise.all([getContent(), getStats()]);

    const cards: Array<{ label: string; value: number; code: string }> = [
        { label: 'Total Pages', value: stats.total, code: 'TT' },
        { label: 'AI Draft', value: stats.aiDraft, code: 'AI' },
        { label: 'Under Review', value: stats.underReview, code: 'UR' },
        { label: 'Verified', value: stats.verified, code: 'VR' },
        { label: 'Published', value: stats.published, code: 'PB' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / content</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Localized Content<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage condition pages in different languages and regions.
                    </p>
                </div>
                <Link href="/admin/content/new" className="btn btn-cobalt">
                    + Add Content
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
            <ContentTable content={content} />
        </div>
    );
}
