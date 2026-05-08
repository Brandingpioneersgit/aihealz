import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * Footer API — Client-side fallback
 *
 * GET /api/footer?country=india&city=delhi&lang=en
 *
 * Returns contextual footer links for client-side hydration
 * when SSR context isn't available (e.g., SPA navigation).
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const countrySlug = searchParams.get('country') || 'india';
        const citySlug = searchParams.get('city');
        const lang = searchParams.get('lang') || 'en';

        // Resolve geography — look up city + country in parallel; we keep
        // city when it resolves and otherwise fall back to country, but
        // hitting Postgres twice serially used to cost ~25–60ms per nav.
        const [cityRow, countryRow] = await Promise.all([
            citySlug
                ? prisma.geography.findFirst({
                    where: { slug: citySlug, isActive: true },
                    select: { id: true, name: true, parentId: true },
                })
                : Promise.resolve(null),
            prisma.geography.findFirst({
                where: { slug: countrySlug, isActive: true, level: 'country' },
                select: { id: true, name: true },
            }),
        ]);

        let geoId: number | null = null;
        let geoName = '';
        let cityParentId: number | null = null;
        if (cityRow) {
            geoId = cityRow.id;
            geoName = cityRow.name;
            cityParentId = cityRow.parentId ?? null;
        } else if (countryRow) {
            geoId = countryRow.id;
            geoName = countryRow.name;
        }

        // pinnedConditions and parentGeo both depend on geoId but are
        // independent of each other — fetch in parallel. parentGeo is only
        // needed if we resolved at country level (we already have parentId
        // from cityRow when the user picked a city).
        const [pinnedConditions, parentGeoRow] = await Promise.all([
            geoId
                ? prisma.pinnedCondition.findMany({
                    where: { geographyId: geoId, isActive: true },
                    orderBy: { displayOrder: 'asc' },
                    include: {
                        condition: { select: { commonName: true, slug: true } },
                    },
                    take: 10,
                })
                : Promise.resolve([] as Array<{ condition: { commonName: string; slug: string } }>),
            geoId && cityParentId === null
                ? prisma.geography.findFirst({
                    where: { id: geoId },
                    select: { parentId: true },
                })
                : Promise.resolve(null),
        ]);

        const parentForCities = cityParentId ?? parentGeoRow?.parentId ?? null;
        const pinnedSlugs = pinnedConditions.map((p) => p.condition.slug);

        // additionalConditions and nearbyCities have no dependency on each
        // other — last parallel batch.
        const [additionalConditions, citiesRows] = await Promise.all([
            prisma.medicalCondition.findMany({
                where: {
                    isActive: true,
                    slug: { notIn: pinnedSlugs },
                },
                select: { commonName: true, slug: true },
                take: 20 - pinnedConditions.length,
                orderBy: { createdAt: 'asc' },
            }),
            parentForCities
                ? prisma.geography.findMany({
                    where: { level: 'city', isActive: true, parentId: parentForCities },
                    select: { name: true, slug: true },
                    take: 8,
                })
                : Promise.resolve([] as Array<{ name: string; slug: string }>),
        ]);

        const conditions = [
            ...pinnedConditions.map((p) => ({
                name: p.condition.commonName,
                slug: p.condition.slug,
                isPinned: true,
                url: `/${countrySlug}/${lang}/${p.condition.slug}${citySlug ? `/${citySlug}` : ''}`,
            })),
            ...additionalConditions.map((c) => ({
                name: c.commonName,
                slug: c.slug,
                isPinned: false,
                url: `/${countrySlug}/${lang}/${c.slug}${citySlug ? `/${citySlug}` : ''}`,
            })),
        ];

        const nearbyCities = citiesRows.map((c) => ({
            name: c.name,
            slug: c.slug,
            url: `/${countrySlug}/${lang}/${c.slug}`,
        }));

        return NextResponse.json(
            {
                geo: { country: countrySlug, city: citySlug, name: geoName },
                conditions,
                nearbyCities,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error) {
        console.error('Footer API error:', error);
        return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: 500 });
    }
}
