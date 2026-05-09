import prisma from '@/lib/db';
import Link from 'next/link';
import LanguagesTable from './LanguagesTable';

async function getLanguages() {
    const languages = await prisma.language.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: {
                    localizedContent: true,
                    uiTranslations: true,
                }
            }
        }
    });
    return languages;
}

export default async function LanguagesPage() {
    const languages = await getLanguages();

    const stats = {
        total: languages.length,
        active: languages.filter(l => l.isActive).length,
        withContent: languages.filter(l => l._count.localizedContent > 0).length,
        totalTranslations: languages.reduce((acc, l) => acc + l._count.uiTranslations, 0),
    };

    const cards: Array<{ label: string; value: number; code: string }> = [
        { label: 'Total Languages', value: stats.total, code: 'LG' },
        { label: 'Active', value: stats.active, code: 'AC' },
        { label: 'With Content', value: stats.withContent, code: 'CN' },
        { label: 'UI Translations', value: stats.totalTranslations, code: 'UI' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / languages</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Languages<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage supported languages and translations.
                    </p>
                </div>
                <Link href="/admin/languages/new" className="btn btn-cobalt">
                    + Add Language
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
            <LanguagesTable languages={languages} />
        </div>
    );
}
