import prisma from '@/lib/db';
import Link from 'next/link';

export default async function CreativesPage() {
    const creatives = await prisma.adCreative.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            advertiser: {
                select: { id: true, companyName: true },
            },
        },
    });

    const adTypeLabels: Record<string, string> = {
        display_banner: 'Display Banner',
        sidebar_sticky: 'Sidebar Sticky',
        inline_content: 'Inline Content',
        sponsored_listing: 'Sponsored Listing',
        featured_badge: 'Featured Badge',
    };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            <Link
                href="/admin/advertising"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to advertising
            </Link>

            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / advertising / creatives</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Ad Creatives<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Manage ad images and content.
                    </p>
                </div>
                <Link href="/admin/advertising/creatives/new" className="btn btn-cobalt">
                    + Upload Creative
                </Link>
            </div>

            {creatives.length === 0 ? (
                <div className="card col gap-5" style={{ padding: 32, textAlign: 'center' }}>
                    <div className="col gap-3 ai-center">
                        <span className="spec-icon" aria-hidden="true">CR</span>
                        <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>
                            No ad creatives yet
                        </h3>
                        <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 480 }}>
                            Upload your first ad creative to start running campaigns.
                        </p>
                        <Link href="/admin/advertising/creatives/new" className="btn btn-cobalt">
                            + Upload First Creative
                        </Link>
                    </div>

                    <div className="hairline-t col gap-4" style={{ paddingTop: 24, marginTop: 8 }}>
                        <span className="section-mark">accepted formats</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12, textAlign: 'left' }}>
                            {[
                                { label: 'File Types', value: 'JPG, PNG, GIF, WebP' },
                                { label: 'Max File Size', value: '2MB per image' },
                                { label: 'Banner Sizes', value: '300×250, 728×90, 970×250' },
                                { label: 'Sidebar Sizes', value: '300×250, 300×600' },
                            ].map((spec) => (
                                <div key={spec.label} className="card-flat col gap-1" style={{ padding: 12, background: 'var(--bg-2)' }}>
                                    <span className="kicker">{spec.label}</span>
                                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 16 }}>
                    {creatives.map((creative) => (
                        <div key={creative.id} className="card col" style={{ overflow: 'hidden' }}>
                            <div
                                className="placeholder"
                                style={{ aspectRatio: '16/9', position: 'relative', borderRadius: 0, border: 0, borderBottom: '1px solid var(--rule)' }}
                            >
                                {creative.imageUrl ? (
                                    <img src={creative.imageUrl} alt={creative.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    'CREATIVE'
                                )}
                                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                    <span className={creative.isActive ? 'pill pill-mint' : 'pill'}>
                                        {creative.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="col gap-2" style={{ padding: 16 }}>
                                <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{creative.name}</span>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {creative.advertiser.companyName}
                                </span>
                                <div className="row ai-center gap-2">
                                    <span className="pill">{adTypeLabels[creative.adType] || creative.adType}</span>
                                    {creative.width && creative.height && (
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                            {creative.width}×{creative.height}
                                        </span>
                                    )}
                                </div>
                                {creative.headline && (
                                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{creative.headline}</span>
                                )}
                                <div className="row between ai-center hairline-t" style={{ paddingTop: 12 }}>
                                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                        {new Date(creative.createdAt).toLocaleDateString()}
                                    </span>
                                    <Link
                                        href={`/admin/advertising/creatives/${creative.id}`}
                                        className="mono"
                                        style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                                    >
                                        Edit →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
