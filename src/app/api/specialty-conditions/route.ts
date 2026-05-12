import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Returns conditions for a set of raw specialistTypes. Caller passes the
// raw types (the homepage already has them from its initial groupBy), so
// this stays stateless and avoids re-normalizing server-side.
//
// GET /api/specialty-conditions?types=Cardiologist,Cardiac%20Care&limit=12
export async function GET(request: NextRequest) {
    const types = (request.nextUrl.searchParams.get('types') || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    const limit = Math.min(
        Math.max(parseInt(request.nextUrl.searchParams.get('limit') || '12', 10) || 12, 1),
        50,
    );

    if (types.length === 0) {
        return NextResponse.json({ conditions: [] });
    }

    try {
        const rows = await prisma.medicalCondition.findMany({
            where: { isActive: true, specialistType: { in: types } },
            select: { slug: true, commonName: true, specialistType: true, description: true },
            orderBy: [{ description: 'asc' }, { commonName: 'asc' }],
            take: 30,
        });

        const seen = new Set<string>();
        const deduped = rows.filter((c) => {
            const key = c.commonName.toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const curated = deduped.filter((c) => c.description && c.description.length > 0);
        const others = deduped.filter((c) => !c.description || c.description.length === 0);
        const conditions = [...curated, ...others].slice(0, limit);

        return NextResponse.json(
            { conditions },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            },
        );
    } catch (error) {
        console.error('[specialty-conditions] error:', (error as Error).message);
        return NextResponse.json({ conditions: [], error: 'fetch_failed' }, { status: 500 });
    }
}
