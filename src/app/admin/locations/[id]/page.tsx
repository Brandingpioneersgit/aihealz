import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LocationForm from './LocationForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getLocation(id: string) {
    if (id === 'new') return null;

    const location = await prisma.geography.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
            parent: true,
        }
    });

    return location;
}

async function getParentOptions() {
    const locations = await prisma.geography.findMany({
        where: {
            level: { in: ['continent', 'country', 'state', 'city'] }
        },
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, level: true }
    });

    return locations;
}

async function getLanguages() {
    const languages = await prisma.language.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { code: true, name: true }
    });

    return languages;
}

async function getTimezones() {
    const locations = await prisma.geography.findMany({
        where: { timezone: { not: null } },
        select: { timezone: true },
        distinct: ['timezone'],
        orderBy: { timezone: 'asc' },
    });

    return locations.map(l => l.timezone).filter((tz): tz is string => tz !== null);
}

export default async function LocationEditPage({ params }: PageProps) {
    const { id } = await params;
    const [location, parentOptions, languages, timezones] = await Promise.all([
        getLocation(id),
        getParentOptions(),
        getLanguages(),
        getTimezones(),
    ]);

    if (id !== 'new' && !location) {
        notFound();
    }

    const serializedLocation = location ? {
        ...location,
        population: location.population?.toString() || null,
        latitude: location.latitude?.toString() || null,
        longitude: location.longitude?.toString() || null,
    } : null;

    return (
        <div className="col gap-5" style={{ maxWidth: 960, color: 'var(--ink)' }}>
            <Link
                href="/admin/locations"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to locations
            </Link>

            <div className="col gap-2">
                <span className="section-mark">
                    admin / locations / {location ? location.name : 'new'}
                </span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    {location ? location.name : 'New location'}
                    <span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    {location ? 'Editing existing geographic record.' : 'Create a new geographic location.'}
                </p>
            </div>

            <LocationForm
                location={serializedLocation}
                parentOptions={parentOptions}
                languages={languages}
                timezoneOptions={timezones}
            />
        </div>
    );
}
