import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ConditionForm from './ConditionForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getCondition(id: string) {
    if (id === 'new') return null;

    const condition = await prisma.medicalCondition.findUnique({
        where: { id: parseInt(id, 10) },
    });

    return condition;
}

async function getDynamicOptions() {
    const specialistTypes = await prisma.medicalCondition.findMany({
        where: { specialistType: { not: '' } },
        select: { specialistType: true },
        distinct: ['specialistType'],
        orderBy: { specialistType: 'asc' },
    });

    const bodySystems = await prisma.medicalCondition.findMany({
        where: { bodySystem: { not: null } },
        select: { bodySystem: true },
        distinct: ['bodySystem'],
        orderBy: { bodySystem: 'asc' },
    });

    const severityLevels = await prisma.medicalCondition.findMany({
        where: { severityLevel: { not: null } },
        select: { severityLevel: true },
        distinct: ['severityLevel'],
        orderBy: { severityLevel: 'asc' },
    });

    return {
        specialistTypes: specialistTypes.map(s => s.specialistType).filter(Boolean),
        bodySystems: bodySystems.map(b => b.bodySystem).filter((b): b is string => b !== null),
        severityLevels: severityLevels.map(s => s.severityLevel).filter((s): s is string => s !== null),
    };
}

export default async function ConditionEditPage({ params }: PageProps) {
    const { id } = await params;
    const [condition, dynamicOptions] = await Promise.all([
        getCondition(id),
        getDynamicOptions(),
    ]);

    if (id !== 'new' && !condition) {
        notFound();
    }

    return (
        <div className="col gap-5" style={{ maxWidth: 960, color: 'var(--ink)' }}>
            <Link
                href="/admin/conditions"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to conditions
            </Link>

            <div className="col gap-2">
                <span className="section-mark">
                    admin / conditions / {condition ? condition.commonName : 'new'}
                </span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    {condition ? condition.commonName : 'New condition'}
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    {condition ? `Editing existing condition.` : 'Create a new medical condition.'}
                </p>
            </div>

            <ConditionForm
                condition={condition}
                specialistOptions={dynamicOptions.specialistTypes}
                bodySystemOptions={dynamicOptions.bodySystems}
                severityOptions={dynamicOptions.severityLevels}
            />
        </div>
    );
}
