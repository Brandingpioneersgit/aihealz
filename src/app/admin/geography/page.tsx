import prisma from '@/lib/db';
import Link from 'next/link';

export default async function GeographyOverviewPage() {
    const [totalCountries, totalStates, totalCities] = await Promise.all([
        prisma.geography.count({ where: { level: 'country' } }),
        prisma.geography.count({ where: { level: 'state' } }),
        prisma.geography.count({ where: { level: 'city' } }),
    ]);

    const topCitiesWithDoctors = await prisma.geography.findMany({
        where: { level: 'city' },
        orderBy: { population: 'desc' },
        take: 10,
        include: {
            parent: {
                select: { name: true, parent: { select: { name: true } } },
            },
            _count: {
                select: { doctors: true, leadLogs: true },
            },
        },
    });

    const hospitalsByCity = await prisma.hospital.groupBy({
        by: ['city'],
        where: { city: { not: null } },
        _count: true,
        orderBy: { _count: { city: 'desc' } },
        take: 10,
    });

    const insuranceByCountry = await prisma.insuranceProvider.groupBy({
        by: ['headquartersCountry'],
        where: { headquartersCountry: { not: null } },
        _count: true,
    });

    const contentCoverage = await prisma.localizedContent.groupBy({
        by: ['languageCode'],
        _count: true,
        orderBy: { _count: { languageCode: 'desc' } },
        take: 10,
    });

    const stats: Array<{ label: string; value: number; code: string }> = [
        { label: 'Countries', value: totalCountries, code: 'CO' },
        { label: 'States / Regions', value: totalStates, code: 'ST' },
        { label: 'Cities', value: totalCities, code: 'CI' },
        { label: 'Total Locations', value: totalCountries + totalStates + totalCities, code: 'LO' },
    ];

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <div className="col gap-2">
                <span className="section-mark">admin / geography</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    Geographic Overview<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                    View location hierarchy, coverage, and content distribution.
                </p>
            </div>

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
                        <div className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>
                            {s.value.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                {/* Top Cities */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="hairline-b row between ai-center" style={{ padding: 16 }}>
                        <span className="section-mark">top cities (by population)</span>
                        <Link
                            href="/admin/locations"
                            className="mono"
                            style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                        >
                            View all →
                        </Link>
                    </div>
                    <div className="col">
                        {topCitiesWithDoctors.map((city, i) => (
                            <div key={city.id} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                <div className="row ai-center gap-3">
                                    <span className="spec-icon" aria-hidden="true">{i + 1}</span>
                                    <div className="col" style={{ gap: 2 }}>
                                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{city.name}</span>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            {city.parent?.name}{city.parent?.parent?.name && `, ${city.parent.parent.name}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="col ai-end" style={{ gap: 2 }}>
                                    <span style={{ fontWeight: 500 }}>{city._count.doctors} doctors</span>
                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{city._count.leadLogs} leads</span>
                                </div>
                            </div>
                        ))}
                        {topCitiesWithDoctors.length === 0 && (
                            <div className="mono" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                No city data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Hospitals by City */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="hairline-b row between ai-center" style={{ padding: 16 }}>
                        <span className="section-mark">hospitals by city</span>
                        <Link
                            href="/admin/hospitals"
                            className="mono"
                            style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                        >
                            View all →
                        </Link>
                    </div>
                    <div className="col">
                        {hospitalsByCity.map((item, i) => (
                            <div key={item.city} className="row between ai-center" style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                                <div className="row ai-center gap-3">
                                    <span className="spec-icon" aria-hidden="true">{i + 1}</span>
                                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{item.city}</span>
                                </div>
                                <div className="row ai-center gap-2">
                                    <span style={{ fontWeight: 600 }}>{item._count}</span>
                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>hospitals</span>
                                </div>
                            </div>
                        ))}
                        {hospitalsByCity.length === 0 && (
                            <div className="mono" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                No hospital location data
                            </div>
                        )}
                    </div>
                </div>

                {/* Insurance by Country */}
                <div className="card col gap-3" style={{ padding: 20 }}>
                    <span className="section-mark">insurance providers by country</span>
                    {insuranceByCountry.length > 0 ? (
                        <div className="col gap-3">
                            {insuranceByCountry.map((item) => {
                                const maxCount = Math.max(...insuranceByCountry.map((i) => i._count));
                                return (
                                    <div key={item.headquartersCountry} className="col gap-1">
                                        <div className="row between ai-center">
                                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{item.headquartersCountry}</span>
                                            <span className="mono" style={{ fontSize: 12 }}>{item._count}</span>
                                        </div>
                                        <div style={{ height: 4, background: 'var(--bg-2)', borderRadius: 'var(--r-1)', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    background: 'var(--cobalt)',
                                                    width: `${(item._count / maxCount) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 16, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No insurance provider data
                        </div>
                    )}
                </div>

                {/* Content by Language */}
                <div className="card col gap-3" style={{ padding: 20 }}>
                    <span className="section-mark">content coverage by language</span>
                    {contentCoverage.length > 0 ? (
                        <div className="col gap-3">
                            {contentCoverage.map((item) => {
                                const maxCount = contentCoverage[0]._count;
                                return (
                                    <div key={item.languageCode} className="col gap-1">
                                        <div className="row between ai-center">
                                            <span className="mono" style={{ fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase' }}>
                                                {item.languageCode}
                                            </span>
                                            <span className="mono" style={{ fontSize: 12 }}>
                                                {item._count.toLocaleString()} pages
                                            </span>
                                        </div>
                                        <div style={{ height: 4, background: 'var(--bg-2)', borderRadius: 'var(--r-1)', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    background: 'var(--mint)',
                                                    width: `${(item._count / maxCount) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mono" style={{ padding: 16, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            No content data
                        </div>
                    )}
                </div>
            </div>

            {/* Hierarchy summary */}
            <div className="card-quiet col gap-3" style={{ padding: 20 }}>
                <span className="section-mark">location hierarchy</span>
                <div className="row ai-center center gap-4" style={{ flexWrap: 'wrap' }}>
                    <span className="pill pill-mint">Countries ({totalCountries})</span>
                    <span style={{ color: 'var(--ink-4)' }}>→</span>
                    <span className="pill pill-cobalt">States ({totalStates})</span>
                    <span style={{ color: 'var(--ink-4)' }}>→</span>
                    <span className="pill pill-magenta">Cities ({totalCities})</span>
                </div>
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
                    Locations are organized hierarchically for proper SEO URL structure and content targeting.
                </p>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
                {[
                    { href: '/admin/locations', label: 'Manage Locations', desc: 'Add/edit geographies', code: 'LO' },
                    { href: '/admin/hospitals', label: 'Manage Hospitals', desc: 'Hospital locations', code: 'HO' },
                    { href: '/admin/doctors', label: 'View Doctors', desc: 'Doctor locations', code: 'DR' },
                    { href: '/admin/languages', label: 'Languages', desc: 'Content localization', code: 'LG' },
                ].map((a) => (
                    <Link key={a.href} href={a.href} className="card row ai-center gap-3" style={{ padding: 16 }}>
                        <span className="spec-icon" aria-hidden="true">{a.code}</span>
                        <div className="col" style={{ gap: 2 }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{a.label}</span>
                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {a.desc}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
