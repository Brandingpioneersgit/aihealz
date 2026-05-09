import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LanguageForm from './LanguageForm';

interface PageProps {
    params: Promise<{ code: string }>;
}

async function getLanguage(code: string) {
    if (code === 'new') return null;

    const language = await prisma.language.findUnique({
        where: { code },
    });

    return language;
}

export default async function LanguageEditPage({ params }: PageProps) {
    const { code } = await params;
    const language = await getLanguage(code);

    if (code !== 'new' && !language) {
        notFound();
    }

    return (
        <div className="col gap-5" style={{ maxWidth: 720, color: 'var(--ink)' }}>
            <Link
                href="/admin/languages"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to languages
            </Link>

            <div className="col gap-2">
                <span className="section-mark">
                    admin / languages / {language ? language.code : 'new'}
                </span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    {language ? language.name : 'New language'}
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    {language ? `Editing existing language (${language.code}).` : 'Add a new language to the system.'}
                </p>
            </div>

            <LanguageForm language={language} />
        </div>
    );
}
