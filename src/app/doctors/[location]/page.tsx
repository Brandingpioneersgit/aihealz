import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';

export const revalidate = 3600;

// ── Dynamic SEO Metadata ────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
    const { location } = await params;
    const geo = await prisma.geography.findFirst({
        where: { slug: location, isActive: true },
        select: { id: true, name: true, level: true },
    });
    if (!geo) return { title: 'Doctors | aihealz' };

    const levelLabel = geo.level === 'country' ? 'Country' : geo.level === 'state' ? 'State' : 'City';
    return {
        title: `Top Doctors in ${geo.name} – Verified Specialists | aihealz`,
        description: `Find the best verified doctors and specialists in ${geo.name} (${levelLabel}). Compare ratings, read patient reviews, and book consultations.`,
        keywords: [`doctors in ${geo.name}`, `best doctors ${geo.name}`, `specialists ${geo.name}`, `hospitals ${geo.name}`, 'aihealz'],
        openGraph: {
            title: `Top Doctors in ${geo.name} | aihealz`,
            description: `Browse verified specialists in ${geo.name}. AI-powered ranking and matching.`,
            type: 'website',
        },
    };
}

// ── Collect all descendant geography IDs ────────────────────
async function getDescendantIds(parentId: number): Promise<number[]> {
    const children = await prisma.geography.findMany({
        where: { parentId, isActive: true },
        select: { id: true },
    });
    const ids = children.map(c => c.id);
    for (const child of children) {
        const grandchildren = await getDescendantIds(child.id);
        ids.push(...grandchildren);
    }
    return ids;
}

// ── Page Component ──────────────────────────────────────────
export default async function LocationDoctors({ params }: { params: Promise<{ location: string }> }) {
    const { location } = await params;

    const geo = await prisma.geography.findFirst({
        where: { slug: location, isActive: true },
        select: { id: true, name: true, level: true, slug: true },
    });

    if (!geo) notFound();

    const descendantIds = await getDescendantIds(geo.id);
    const allGeoIds = [geo.id, ...descendantIds];

    const doctors = await prisma.doctorProvider.findMany({
        where: { geographyId: { in: allGeoIds }, isVerified: true },
        orderBy: { badgeScore: 'desc' },
        take: 50,
        include: {
            specialties: { include: { condition: true } },
            geography: { select: { name: true } },
        },
    });

    const subLocations = await prisma.geography.findMany({
        where: { parentId: geo.id, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, level: true },
    });

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Top Doctors in ${geo.name}`,
        description: `Verified medical specialists in ${geo.name}, ranked by AI-powered impact scoring.`,
        numberOfItems: doctors.length,
        itemListElement: doctors.slice(0, 10).map((doc, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'Physician',
                name: doc.name,
                url: `https://aihealz.com/in/en/doctors/${doc.slug}`,
                ...(doc.profileImage && { image: doc.profileImage }),
                ...(doc.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(doc.rating), bestRating: 5, ratingCount: doc.reviewCount || 1 } }),
                address: { '@type': 'PostalAddress', addressLocality: geo.name },
                medicalSpecialty: doc.specialties[0]?.condition?.commonName || 'General Medicine',
            }
        })),
    };

    const levelLabel = geo.level === 'country' ? 'Country' : geo.level === 'state' ? 'State / Province' : 'City';
    const subLevelLabel = geo.level === 'country' ? 'States / Provinces' : geo.level === 'state' ? 'Cities' : 'Localities';

    const LANG_NAMES: Record<string, string> = {
        en: 'English', hi: 'हिन्दी', te: 'తెలుగు', ta: 'தமிழ்', kn: 'ಕನ್ನಡ', ml: 'മലയാളം', mr: 'मराठी',
        gu: 'ગુજરાતી', bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ', or: 'ଓଡ଼ିଆ', as: 'অসমীয়া', ur: 'اردو', ne: 'नेपाली',
        kok: 'कोंकणी', kha: 'Khasi', lus: 'Mizo', mni: 'মৈতৈলোন্', fr: 'Français',
    };
    const langs = (geo.supportedLanguages as string[]) || [];
    const otherLangs = langs.filter(l => l !== 'en');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)' }} className="col gap-6">

                    {/* Breadcrumb */}
                    <nav
                        className="row gap-2 mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            flexWrap: 'wrap',
                        }}
                        aria-label="Breadcrumb"
                    >
                        <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
                        <span aria-hidden="true">/</span>
                        <Link href="/doctors" style={{ color: 'var(--ink-3)' }}>Doctors</Link>
                        <span aria-hidden="true">/</span>
                        <span style={{ color: 'var(--ink)' }}>{geo.name}</span>
                    </nav>

                    {/* Hero */}
                    <div className="col gap-3" style={{ maxWidth: 760 }}>
                        <span className="section-mark">{levelLabel}</span>
                        <h1
                            className="display"
                            style={{
                                fontSize: 'clamp(36px, 5vw, 56px)',
                                lineHeight: 1.05,
                                letterSpacing: '-0.04em',
                                margin: 0,
                                fontWeight: 600,
                            }}
                        >
                            Top doctors in <span style={{ color: 'var(--cobalt)' }}>{geo.name}</span>
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="lede" style={{ fontSize: 18, margin: 0, maxWidth: 640 }}>
                            {doctors.length} verified specialists across {geo.name}. AI-ranked by clinical outcomes,
                            patient feedback, and research impact.
                        </p>
                    </div>

                    <SearchAutocomplete className="" />

                    {/* Language options */}
                    {otherLangs.length > 0 && (
                        <div className="col gap-2">
                            <span className="kicker"><span className="dot" />also available in</span>
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                {otherLangs.map(l => (
                                    <Link
                                        key={l}
                                        href={`/doctors/${geo.slug}/${l}`}
                                        className="pill"
                                    >
                                        {LANG_NAMES[l] || l}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sub-locations */}
                    {subLocations.length > 0 && (
                        <section className="col gap-3">
                            <div className="row gap-3 ai-baseline">
                                <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 01</span>
                                <h2 className="display" style={{ fontSize: 'clamp(20px, 2vw, 24px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                    {subLevelLabel} in {geo.name}
                                </h2>
                            </div>
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                {subLocations.map(sub => (
                                    <Link
                                        key={sub.id}
                                        href={`/doctors/${sub.slug}`}
                                        className="pill"
                                    >
                                        {sub.name}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Doctor grid */}
                    <section className="col gap-4" aria-labelledby="doctors-heading">
                        <div className="row gap-3 ai-baseline">
                            <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 02</span>
                            <h2 id="doctors-heading" className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                Verified specialists ({doctors.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 16 }}>
                            {doctors.map((doc) => {
                                const initial = doc.name.trim().charAt(0).toUpperCase();
                                return (
                                    <Link
                                        key={doc.id}
                                        href={`/doctor/${doc.slug}`}
                                        className="card col"
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div
                                            style={{
                                                height: 144,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                background: 'var(--bg-2)',
                                                borderBottom: '1px solid var(--rule)',
                                            }}
                                        >
                                            {doc.profileImage ? (
                                                <AvatarWithFallback
                                                    src={doc.profileImage}
                                                    alt={doc.name}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="display" style={{ fontSize: 48, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '-0.04em' }}>
                                                        {initial}
                                                    </span>
                                                </div>
                                            )}
                                            <div style={{ position: 'absolute', top: 10, left: 10, right: 10 }} className="row between ai-start">
                                                <span className="pill" style={{ background: 'var(--paper)' }}>
                                                    ★ {doc.rating ? Number(doc.rating).toFixed(1) : '5.0'}
                                                </span>
                                                {Number(doc.badgeScore || 0) > 90 && (
                                                    <span className="pill pill-orange">Top 1%</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col gap-1" style={{ padding: 16, flex: 1 }}>
                                            <span className="display truncate-2" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.3 }}>
                                                {doc.name}
                                            </span>
                                            {doc.specialties.length > 0 && (
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {doc.specialties[0].condition?.commonName || 'Specialist'}
                                                </span>
                                            )}
                                            <div className="col gap-1" style={{ marginTop: 'auto', paddingTop: 8 }}>
                                                <span className="muted-2" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    ◆ {doc.geography?.name || geo.name}
                                                </span>
                                                {doc.experienceYears && (
                                                    <span className="muted-2" style={{ fontSize: 12 }}>
                                                        ⏱ {doc.experienceYears}+ years
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {doctors.length === 0 && (
                        <div className="card col gap-4 ai-center" style={{ padding: 64, textAlign: 'center' }}>
                            <span className="section-mark">no results</span>
                            <h3 className="display" style={{ fontSize: 24, margin: 0, fontWeight: 600, letterSpacing: '-0.03em' }}>
                                No specialists found in {geo.name}
                            </h3>
                            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                                We haven&apos;t onboarded specialists in this {levelLabel.toLowerCase()} yet.
                            </p>
                            <Link href="/doctors" className="btn btn-cobalt">
                                ← Browse all locations
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
