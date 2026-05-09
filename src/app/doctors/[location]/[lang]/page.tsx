import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';

// ── Language display names ──────────────────────────────────
const LANG_NAMES: Record<string, string> = {
    en: 'English', hi: 'हिन्दी (Hindi)', te: 'తెలుగు (Telugu)', ta: 'தமிழ் (Tamil)',
    kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)', mr: 'मराठी (Marathi)',
    gu: 'ગુજરાતી (Gujarati)', bn: 'বাংলা (Bengali)', pa: 'ਪੰਜਾਬੀ (Punjabi)',
    or: 'ଓଡ଼ିଆ (Odia)', as: 'অসমীয়া (Assamese)', ur: 'اردو (Urdu)',
    ne: 'नेपाली (Nepali)', kok: 'कोंकणी (Konkani)', kha: 'Khasi',
    lus: 'Mizo', mni: 'মৈতৈলোন্ (Manipuri)', nag: 'Naga', fr: 'Français (French)',
};

// ── Collect descendant geo IDs ──────────────────────────────
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

// ── Dynamic metadata ────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ location: string; lang: string }> }): Promise<Metadata> {
    const { location, lang } = await params;
    const geo = await prisma.geography.findFirst({ where: { slug: location, isActive: true } });
    if (!geo) return { title: 'Doctors | aihealz' };
    const langName = LANG_NAMES[lang] || lang;

    return {
        title: `Doctors in ${geo.name} — ${langName} | aihealz`,
        description: `Browse top verified doctors in ${geo.name}. Page available in ${langName}. AI-powered specialist matching and ranking.`,
        keywords: [`doctors ${geo.name}`, `${langName} doctors`, `specialists ${geo.name}`, 'aihealz'],
    };
}

// ── Page Component ──────────────────────────────────────────
export default async function LanguageLocationDoctors({ params }: { params: Promise<{ location: string; lang: string }> }) {
    const { location, lang } = await params;

    const geo = await prisma.geography.findFirst({
        where: { slug: location, isActive: true },
    });
    if (!geo) notFound();

    const supportedLangs: string[] = (geo.supportedLanguages as string[]) || ['en'];
    if (!supportedLangs.includes(lang)) notFound();

    const descendantIds = await getDescendantIds(geo.id);
    const allGeoIds = [geo.id, ...descendantIds];

    const doctors = await prisma.doctorProvider.findMany({
        where: { geographyId: { in: allGeoIds }, isVerified: true },
        orderBy: { badgeScore: 'desc' },
        take: 50,
        include: {
            specialties: { include: { condition: true } },
            geography: true,
        },
    });

    const subLocations = await prisma.geography.findMany({
        where: { parentId: geo.id, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, level: true },
    });

    const langName = LANG_NAMES[lang] || lang;
    const levelLabel = geo.level === 'country' ? 'Country' : geo.level === 'state' ? 'State' : 'City';

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 64 }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }} className="col gap-6">

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
                    <Link href={`/doctors/${geo.slug}`} style={{ color: 'var(--ink-3)' }}>{geo.name}</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>{langName}</span>
                </nav>

                {/* Hero */}
                <div className="col gap-3" style={{ maxWidth: 760 }}>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        <span className="pill">{levelLabel}</span>
                        <span className="pill pill-cobalt">{langName}</span>
                    </div>
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
                        Doctors in <span style={{ color: 'var(--cobalt)' }}>{geo.name}</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 18, margin: 0, maxWidth: 640 }}>
                        {doctors.length} verified specialists in {geo.name}. Viewing in {langName}.
                    </p>
                </div>

                {/* Language switcher */}
                <div className="col gap-2">
                    <span className="kicker"><span className="dot" />available languages</span>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        {supportedLangs.map(l => (
                            <Link
                                key={l}
                                href={l === 'en' ? `/doctors/${geo.slug}` : `/doctors/${geo.slug}/${l}`}
                                className={l === lang ? 'pill pill-cobalt' : 'pill'}
                            >
                                {LANG_NAMES[l] || l}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Sub-locations */}
                {subLocations.length > 0 && (
                    <section className="col gap-3">
                        <div className="row gap-3 ai-baseline">
                            <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 01</span>
                            <h2 className="display" style={{ fontSize: 'clamp(20px, 2vw, 24px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
                                {geo.level === 'country' ? 'States' : 'Cities'} in {geo.name}
                            </h2>
                        </div>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            {subLocations.map(sub => (
                                <Link
                                    key={sub.id}
                                    href={`/doctors/${sub.slug}/${lang}`}
                                    className="pill"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Doctor grid */}
                <section className="col gap-4">
                    <div className="row gap-3 ai-baseline">
                        <span className="num" style={{ fontSize: 14, color: 'var(--cobalt)', fontWeight: 500, letterSpacing: '0.06em' }}>§ 02</span>
                        <h2 className="display" style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0, letterSpacing: '-0.03em', fontWeight: 600 }}>
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
                                        <div style={{ position: 'absolute', top: 10, left: 10 }}>
                                            <span className="pill" style={{ background: 'var(--paper)' }}>
                                                ★ {doc.rating ? Number(doc.rating).toFixed(1) : '5.0'}
                                            </span>
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
                                        <span className="muted-2" style={{ fontSize: 12, marginTop: 'auto', paddingTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            ◆ {doc.geography?.name || geo.name}
                                        </span>
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
                            No specialists found
                        </h3>
                        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                            We haven&apos;t onboarded specialists in this area yet.
                        </p>
                        <Link href="/doctors" className="btn btn-cobalt">
                            ← Browse all locations
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
