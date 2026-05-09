import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DoctorForm from './DoctorForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getDoctor(id: string) {
    if (id === 'new') return null;

    const doctor = await prisma.doctorProvider.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
            geography: true,
            specialties: {
                include: {
                    condition: {
                        select: { id: true, commonName: true }
                    }
                }
            }
        }
    });

    return doctor;
}

async function getFormData() {
    const [geographies, conditions, subscriptionPlans] = await Promise.all([
        prisma.geography.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                level: true,
                parent: {
                    select: {
                        name: true,
                        parent: { select: { name: true } }
                    }
                }
            }
        }),
        prisma.medicalCondition.findMany({
            where: { isActive: true },
            orderBy: { commonName: 'asc' },
            select: { id: true, commonName: true, specialistType: true }
        }),
        prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            select: { tier: true, planName: true },
            distinct: ['tier'],
            orderBy: { tier: 'asc' },
        })
    ]);

    const tierOptions = subscriptionPlans.map(p => ({
        value: p.tier,
        label: p.planName,
    }));

    const transformedGeographies = geographies.map(geo => {
        let displayName = geo.name;
        if (geo.parent) {
            if (geo.parent.parent) {
                displayName = `${geo.name}, ${geo.parent.name}, ${geo.parent.parent.name}`;
            } else {
                displayName = `${geo.name}, ${geo.parent.name}`;
            }
        }
        return {
            id: geo.id,
            name: geo.name,
            slug: geo.slug,
            displayName,
        };
    });

    return { geographies: transformedGeographies, conditions, tierOptions };
}

export default async function DoctorEditPage({ params }: PageProps) {
    const { id } = await params;
    const [doctor, formData] = await Promise.all([
        getDoctor(id),
        getFormData()
    ]);

    if (id !== 'new' && !doctor) {
        notFound();
    }

    const serializedDoctor = doctor ? {
        ...doctor,
        consultationFee: doctor.consultationFee?.toString() || null,
        rating: doctor.rating?.toString() || null,
        badgeScore: doctor.badgeScore?.toString() || null,
        contactInfo: (doctor.contactInfo && typeof doctor.contactInfo === 'object' && !Array.isArray(doctor.contactInfo))
            ? (doctor.contactInfo as Record<string, unknown>)
            : null,
    } : null;

    return (
        <div className="col gap-5" style={{ maxWidth: 960, color: 'var(--ink)' }}>
            <Link
                href="/admin/doctors"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to doctors
            </Link>

            <div className="col gap-2">
                <span className="section-mark">
                    admin / doctors / {doctor ? doctor.name : 'new'}
                </span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    {doctor ? doctor.name : 'New doctor'}
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    {doctor ? 'Editing healthcare provider profile.' : 'Create a new healthcare provider profile.'}
                </p>
            </div>

            <DoctorForm
                doctor={serializedDoctor}
                geographies={formData.geographies}
                conditions={formData.conditions}
                tierOptions={formData.tierOptions}
            />
        </div>
    );
}
