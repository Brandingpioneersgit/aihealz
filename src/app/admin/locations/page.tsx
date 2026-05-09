import prisma from '@/lib/db';
import Link from 'next/link';
import LocationsTable from './LocationsTable';

async function getLocations() {
    const locations = await prisma.geography.findMany({
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
        include: {
            parent: {
                select: { id: true, name: true, slug: true }
            },
            _count: {
                select: {
                    children: true,
                    doctors: true,
                    localizedContent: true,
                }
            }
        }
    });
    return locations;
}

export default async function LocationsPage() {
    const locations = await getLocations();

    const stats = {
        total: locations.length,
        countries: locations.filter(l => l.level === 'country').length,
        states: locations.filter(l => l.level === 'state').length,
        cities: locations.filter(l => l.level === 'city').length,
        active: locations.filter(l => l.isActive).length,
    };

    const cards: Array<{ label: string; value: number; code: string }> = [
        { label: 'Total Locations', value: stats.total, code: 'LO' },
        { label: 'Countries', value: stats.countries, code: 'CO' },
        { label: 'States', value: stats.states, code: 'ST' },
        { label: 'Cities', value: stats.cities, code: 'CI' },
        { label: 'Active', value: stats.active, code: 'AC' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* Header */}
            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / locations</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Locations<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage geographic locations and regions.
                    </p>
                </div>
                <Link href="/admin/locations/new" className="btn btn-cobalt">
                    + Add Location
                </Link>
            </div>

            {/* Stats */}
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
            <LocationsTable locations={locations} />
        </div>
    );
}
