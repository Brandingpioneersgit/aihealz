/**
 * Audit location-page coverage / indexation readiness.
 *
 * Read-only. Reports, per rollout country (India + USA), how many
 * condition × geography pages would currently be INDEXABLE vs noindex
 * under the data-density gate in src/lib/content-engine.ts
 * (computeLocalDataDensity).
 *
 * A country-level page is indexable when the condition has published
 * content. A sub-country (city) page is indexable only when it adds
 * something the country page doesn't: city-level cost data, a
 * geo-specific LocalizedContent row, or >= 3 geo-matched verified
 * doctors. Everything else is a near-duplicate → noindex.
 *
 * The output is the content-ops backlog: the gap between "city pages
 * that exist" and "city pages worth indexing" is exactly the work of
 * populating TreatmentCost / LocalizedContent / DoctorProvider.
 *
 * Usage: npx tsx scripts/audit-location-coverage.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Rollout scope — keep in sync with ROLLOUT_COUNTRY_CODES in content-engine.ts
const ROLLOUT = [
    { slug: 'india', code: 'in', name: 'India' },
    { slug: 'usa', code: 'us', name: 'USA' },
];

const MIN_LOCAL_DOCTORS = 3; // matches computeLocalDataDensity

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not set');
        process.exit(1);
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    try {
        // ─── Conditions + which have published content ───────────
        const conditions = await prisma.medicalCondition.findMany({
            where: { isActive: true },
            select: { id: true, slug: true, specialistType: true },
        });
        const publishedRows = await prisma.conditionPageContent.findMany({
            where: { status: 'published' },
            select: { conditionId: true },
        });
        const hasContent = new Set(publishedRows.map(r => r.conditionId));
        const withContent = conditions.filter(c => hasContent.has(c.id));

        // ─── Geography tree ──────────────────────────────────────
        const geos = await prisma.geography.findMany({
            select: { id: true, slug: true, name: true, level: true, parentId: true },
        });
        const childrenOf = new Map<number, typeof geos>();
        for (const g of geos) {
            if (g.parentId == null) continue;
            const arr = childrenOf.get(g.parentId) ?? [];
            arr.push(g);
            childrenOf.set(g.parentId, arr);
        }
        const collectCities = (rootId: number): typeof geos => {
            const out: typeof geos = [];
            const stack = [rootId];
            while (stack.length) {
                const id = stack.pop()!;
                for (const child of childrenOf.get(id) ?? []) {
                    if (child.level === 'city') out.push(child);
                    stack.push(child.id);
                }
            }
            return out;
        };

        // ─── TreatmentCost: condition slug → country/city coverage ─
        const costs = await prisma.treatmentCost.findMany({
            where: { countryCode: { in: ROLLOUT.map(r => r.code) } },
            select: { conditionSlug: true, countryCode: true, citySlug: true },
        });
        // key: `${countryCode}::${conditionSlug}` → { country: bool, cities: Set }
        const costMap = new Map<string, { country: boolean; cities: Set<string> }>();
        for (const c of costs) {
            const key = `${c.countryCode}::${c.conditionSlug}`;
            const entry = costMap.get(key) ?? { country: false, cities: new Set<string>() };
            if (c.citySlug) entry.cities.add(c.citySlug);
            else entry.country = true;
            costMap.set(key, entry);
        }

        // ─── DoctorProvider: (geographyId, specialty) → verified count ─
        const docGroups = await prisma.doctorProvider.groupBy({
            by: ['geographyId', 'specialty'],
            where: { isVerified: true, geographyId: { not: null } },
            _count: { _all: true },
        });
        const docMap = new Map<string, number>();
        for (const d of docGroups) {
            docMap.set(`${d.geographyId}::${d.specialty ?? ''}`, d._count._all);
        }

        // ─── LocalizedContent: (conditionId, geographyId) published, geo-specific ─
        const localRows = await prisma.localizedContent.findMany({
            where: { status: 'published', geographyId: { not: null } },
            select: { conditionId: true, geographyId: true },
        });
        const localMap = new Set<string>();
        for (const l of localRows) localMap.add(`${l.conditionId}::${l.geographyId}`);

        // ─── Report ──────────────────────────────────────────────
        console.log('\n══════════════════════════════════════════════════════════');
        console.log(' LOCATION-PAGE COVERAGE AUDIT');
        console.log(`  active conditions: ${conditions.length}  |  with published content: ${withContent.length}`);
        console.log('══════════════════════════════════════════════════════════');

        for (const country of ROLLOUT) {
            const countryGeo = geos.find(g => g.level === 'country' && g.slug === country.slug);
            if (!countryGeo) {
                console.log(`\n[${country.name}] — no Geography row for slug "${country.slug}", skipping`);
                continue;
            }
            const cities = collectCities(countryGeo.id);

            // Country-level pages
            const countryIndexable = withContent.length; // 1 per condition-with-content
            const countryThin = conditions.length - withContent.length;

            // City-level pages
            let cityTotal = 0;
            let cityIndexable = 0;
            const reason = { cost: 0, local: 0, doctors: 0 };
            const cityHits = new Map<string, number>(); // city name → indexable conditions

            for (const city of cities) {
                for (const cond of withContent) {
                    cityTotal++;
                    const cm = costMap.get(`${country.code}::${cond.slug}`);
                    const hasCityCost = !!cm && cm.cities.has(city.slug);
                    const hasLocal = localMap.has(`${cond.id}::${city.id}`);
                    const docCount = docMap.get(`${city.id}::${cond.specialistType ?? ''}`) ?? 0;
                    const hasDoctors = docCount >= MIN_LOCAL_DOCTORS;

                    if (hasCityCost || hasLocal || hasDoctors) {
                        cityIndexable++;
                        cityHits.set(city.name, (cityHits.get(city.name) ?? 0) + 1);
                        if (hasCityCost) reason.cost++;
                        if (hasLocal) reason.local++;
                        if (hasDoctors) reason.doctors++;
                    }
                }
            }

            const cityNoindex = cityTotal - cityIndexable;
            const pct = cityTotal ? ((cityIndexable / cityTotal) * 100).toFixed(1) : '0.0';

            console.log(`\n┌─ ${country.name} (${country.code}) ─ ${cities.length} cities seeded`);
            console.log(`│  Country pages : ${countryIndexable} indexable / ${countryThin} thin (no published content)`);
            console.log(`│  City pages    : ${cityTotal} possible`);
            console.log(`│     indexable  : ${cityIndexable} (${pct}%)`);
            console.log(`│     noindex    : ${cityNoindex}  ← near-duplicates of country page`);
            console.log(`│  Indexable-because (a page can have >1 reason):`);
            console.log(`│     city-level cost data     : ${reason.cost}`);
            console.log(`│     geo-specific local copy  : ${reason.local}`);
            console.log(`│     >=${MIN_LOCAL_DOCTORS} local verified doctors : ${reason.doctors}`);
            if (cityHits.size > 0) {
                const top = [...cityHits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
                console.log(`│  Top cities by indexable conditions:`);
                for (const [name, n] of top) console.log(`│     ${name}: ${n}`);
            } else {
                console.log(`│  No city page clears the gate yet — pure backlog.`);
            }
            console.log(`└─`);
        }

        console.log('\nBacklog = "City pages possible" minus "indexable". Closing it means');
        console.log('seeding TreatmentCost (city rows), LocalizedContent, or DoctorProvider.\n');
    } finally {
        await pool.end();
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
