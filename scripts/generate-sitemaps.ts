/**
 * Sitemap Generator Script
 *
 * Generates sitemap entries for:
 *  - Curated static pages (homepage, tools, marketing, AEO/GEO surfaces)
 *  - Condition × geography × language fan-out
 *  - Cost variants per condition × country
 *  - Treatments (en + per-country) from public/data/treatments.json
 *  - Doctor / hospital / diagnostic-lab / diagnostic-test / insurance slugs
 *
 * Run via: npx tsx scripts/generate-sitemaps.ts
 * Schedule as a cron job: run daily or after content updates.
 */

import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/db';

const URLS_PER_SITEMAP = parseInt(process.env.SITEMAP_URLS_PER_FILE || '45000', 10);

interface GeoRecord {
    id: number;
    slug: string;
    level: string;
    parentId: number | null;
    supportedLanguages: string[];
}

type EntryInput = {
    urlPath: string;
    changefreq: string;
    priority: number;
    languageCode: string | null;
    conditionId?: number | null;
    geographyId?: number | null;
    lastModified?: Date;
};

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

const STATIC_PAGES: Array<Pick<EntryInput, 'urlPath' | 'changefreq' | 'priority'>> = [
    { urlPath: '/', changefreq: 'daily', priority: 1.0 },
    { urlPath: '/about', changefreq: 'monthly', priority: 0.5 },
    { urlPath: '/contact', changefreq: 'monthly', priority: 0.4 },
    { urlPath: '/privacy', changefreq: 'yearly', priority: 0.3 },
    { urlPath: '/terms', changefreq: 'yearly', priority: 0.3 },
    { urlPath: '/faq', changefreq: 'monthly', priority: 0.5 },
    { urlPath: '/help', changefreq: 'monthly', priority: 0.5 },
    { urlPath: '/healz-ai', changefreq: 'weekly', priority: 0.9 },
    { urlPath: '/symptoms', changefreq: 'weekly', priority: 0.9 },
    { urlPath: '/conditions', changefreq: 'daily', priority: 0.9 },
    { urlPath: '/treatments', changefreq: 'daily', priority: 0.9 },
    { urlPath: '/doctors', changefreq: 'daily', priority: 0.9 },
    { urlPath: '/hospitals', changefreq: 'daily', priority: 0.8 },
    { urlPath: '/insurance', changefreq: 'weekly', priority: 0.7 },
    { urlPath: '/diagnostic-labs', changefreq: 'daily', priority: 0.8 },
    { urlPath: '/tests', changefreq: 'daily', priority: 0.8 },
    { urlPath: '/clinical-reference', changefreq: 'weekly', priority: 0.7 },
    { urlPath: '/remedies', changefreq: 'weekly', priority: 0.7 },
    { urlPath: '/medical-travel', changefreq: 'weekly', priority: 0.7 },
    { urlPath: '/medical-travel/bot', changefreq: 'weekly', priority: 0.6 },
    { urlPath: '/pricing', changefreq: 'monthly', priority: 0.6 },
    { urlPath: '/advertise', changefreq: 'monthly', priority: 0.4 },
    { urlPath: '/advertise/pricing', changefreq: 'monthly', priority: 0.4 },
    { urlPath: '/advertise/enquiry', changefreq: 'monthly', priority: 0.3 },
    { urlPath: '/for-doctors', changefreq: 'weekly', priority: 0.7 },
    { urlPath: '/for-doctors/pricing', changefreq: 'monthly', priority: 0.5 },
    { urlPath: '/for-doctors/quick-reference', changefreq: 'weekly', priority: 0.6 },
    { urlPath: '/for-doctors/clinical-scores', changefreq: 'weekly', priority: 0.6 },
    { urlPath: '/for-doctors/drug-dosing', changefreq: 'weekly', priority: 0.6 },
    { urlPath: '/for-doctors/surgical-checklist', changefreq: 'weekly', priority: 0.6 },
    { urlPath: '/tools/bmi-calculator', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/bmr-calculator', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/body-fat-calculator', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/water-intake-calculator', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/heart-risk-calculator', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/kidney-function-calculator', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/diabetes-risk-calculator', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/pregnancy-due-date-calculator', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/lab-tests', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/emergency', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/surgery-checklist', changefreq: 'monthly', priority: 0.6 },
    { urlPath: '/tools/drug-interactions', changefreq: 'monthly', priority: 0.7 },
    { urlPath: '/tools/glossary', changefreq: 'monthly', priority: 0.6 },
    { urlPath: '/tools/vaccinations', changefreq: 'monthly', priority: 0.6 },
];

async function generateSitemapEntries() {
    console.log('🗺️  Starting sitemap generation...');

    await prisma.sitemapEntry.deleteMany();

    // ── 1. Static curated pages ─────────────────────────────────
    const entries: EntryInput[] = STATIC_PAGES.map((p) => ({
        ...p,
        languageCode: 'en',
        lastModified: new Date(),
    }));

    // ── 2. Condition × geography × language fan-out ────────────
    const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, updatedAt: true },
    });

    const geographies: GeoRecord[] = await prisma.geography.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, level: true, parentId: true, supportedLanguages: true },
    });
    const geoMap = new Map<number, GeoRecord>(geographies.map((g) => [g.id, g]));

    function buildGeoUrlPath(geoId: number): string {
        const parts: string[] = [];
        let current: GeoRecord | undefined = geoMap.get(geoId);
        while (current) {
            parts.unshift(current.slug);
            current = current.parentId ? geoMap.get(current.parentId) : undefined;
        }
        return parts.join('/');
    }

    const countryGeos = geographies.filter((g) => g.level === 'country');

    for (const condition of conditions) {
        for (const geo of geographies) {
            for (const lang of geo.supportedLanguages) {
                const geoPath = buildGeoUrlPath(geo.id);
                const parts = geoPath.split('/');
                const country = parts[0];
                const subPath = parts.slice(1).join('/');
                const urlPath = `/${country}/${lang}/${condition.slug}${subPath ? '/' + subPath : ''}`;

                let priority = 0.5;
                switch (geo.level) {
                    case 'country': priority = 0.6; break;
                    case 'state': priority = 0.7; break;
                    case 'city': priority = 0.8; break;
                    case 'locality': priority = 0.9; break;
                }

                entries.push({
                    urlPath,
                    changefreq: 'weekly',
                    priority,
                    languageCode: lang,
                    conditionId: condition.id,
                    geographyId: geo.id,
                    lastModified: condition.updatedAt,
                });
            }
        }
    }

    // ── 3. Per-condition cost pages, country level ─────────────
    for (const condition of conditions) {
        for (const geo of countryGeos) {
            for (const lang of geo.supportedLanguages) {
                entries.push({
                    urlPath: `/${geo.slug}/${lang}/${condition.slug}/cost`,
                    changefreq: 'weekly',
                    priority: 0.7,
                    languageCode: lang,
                    conditionId: condition.id,
                    geographyId: geo.id,
                    lastModified: condition.updatedAt,
                });
            }
        }
    }

    // ── 4. Treatments (canonical + per-country) ────────────────
    try {
        const treatmentsPath = path.resolve(__dirname, '../public/data/treatments.json');
        if (fs.existsSync(treatmentsPath)) {
            const treatments: Array<{ name: string; simpleName?: string }> =
                JSON.parse(fs.readFileSync(treatmentsPath, 'utf-8'));
            const seenTreatmentSlugs = new Set<string>();
            for (const t of treatments) {
                const slug = slugify(t.simpleName || t.name);
                if (!slug || seenTreatmentSlugs.has(slug)) continue;
                seenTreatmentSlugs.add(slug);

                entries.push({
                    urlPath: `/treatments/${slug}`,
                    changefreq: 'monthly',
                    priority: 0.7,
                    languageCode: 'en',
                });
                for (const geo of countryGeos) {
                    for (const lang of geo.supportedLanguages) {
                        entries.push({
                            urlPath: `/${geo.slug}/${lang}/treatments/${slug}`,
                            changefreq: 'monthly',
                            priority: 0.6,
                            languageCode: lang,
                            geographyId: geo.id,
                        });
                    }
                }
            }
            // Treatments index per locale
            for (const geo of countryGeos) {
                for (const lang of geo.supportedLanguages) {
                    entries.push({
                        urlPath: `/${geo.slug}/${lang}/treatments`,
                        changefreq: 'weekly',
                        priority: 0.7,
                        languageCode: lang,
                        geographyId: geo.id,
                    });
                }
            }
        }
    } catch (err) {
        console.warn('  ⚠ skipping treatments slugs:', (err as Error).message);
    }

    // ── 5. Doctor profile slugs ────────────────────────────────
    const doctors = await prisma.doctorProvider.findMany({
        where: { isVerified: true },
        select: { slug: true, updatedAt: true },
    });
    for (const d of doctors) {
        entries.push({
            urlPath: `/doctor/${d.slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            languageCode: 'en',
            lastModified: d.updatedAt,
        });
    }

    // ── 6. Hospital slugs ──────────────────────────────────────
    const hospitals = await prisma.hospital.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });
    for (const h of hospitals) {
        entries.push({
            urlPath: `/hospitals/${h.slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            languageCode: 'en',
            lastModified: h.updatedAt,
        });
    }

    // ── 7. Diagnostic-lab slugs ────────────────────────────────
    const diagProviders = await prisma.diagnosticProvider.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });
    for (const p of diagProviders) {
        entries.push({
            urlPath: `/diagnostic-labs/${p.slug}`,
            changefreq: 'weekly',
            priority: 0.6,
            languageCode: 'en',
            lastModified: p.updatedAt,
        });
    }

    // ── 8. Insurance slugs ─────────────────────────────────────
    const insurers = await prisma.insuranceProvider.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });
    for (const ins of insurers) {
        entries.push({
            urlPath: `/insurance/${ins.slug}`,
            changefreq: 'monthly',
            priority: 0.6,
            languageCode: 'en',
            lastModified: ins.updatedAt,
        });
    }

    // ── 9. Diagnostic-test slugs ───────────────────────────────
    const tests = await prisma.diagnosticTest.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });
    const cityGeos = geographies.filter((g) => g.level === 'city');
    for (const t of tests) {
        entries.push({
            urlPath: `/tests/${t.slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            languageCode: 'en',
            lastModified: t.updatedAt,
        });
        // Per-city test variant — high SEO leverage
        for (const c of cityGeos) {
            entries.push({
                urlPath: `/tests/${t.slug}/${c.slug}`,
                changefreq: 'weekly',
                priority: 0.6,
                languageCode: 'en',
                geographyId: c.id,
                lastModified: t.updatedAt,
            });
        }
    }

    // ── 10. De-duplicate & assign sitemap shards ───────────────
    const seen = new Set<string>();
    const uniqueEntries = entries.filter((e) => {
        if (seen.has(e.urlPath)) return false;
        seen.add(e.urlPath);
        return true;
    });

    const final = uniqueEntries.map((e, i) => ({
        urlPath: e.urlPath,
        sitemapIndex: Math.floor(i / URLS_PER_SITEMAP),
        changefreq: e.changefreq,
        priority: e.priority,
        languageCode: e.languageCode,
        conditionId: e.conditionId ?? null,
        geographyId: e.geographyId ?? null,
        lastModified: e.lastModified ?? new Date(),
    }));

    // Batch insert (chunks of 1000)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < final.length; i += BATCH_SIZE) {
        const batch = final.slice(i, i + BATCH_SIZE);
        await prisma.sitemapEntry.createMany({ data: batch, skipDuplicates: true });
        process.stdout.write(`\r  Inserted ${Math.min(i + BATCH_SIZE, final.length)} / ${final.length} entries`);
    }

    console.log(
        `\n✅ Generated ${final.length} sitemap entries (` +
        `static=${STATIC_PAGES.length}, ` +
        `doctors=${doctors.length}, hospitals=${hospitals.length}, ` +
        `labs=${diagProviders.length}, insurers=${insurers.length}, tests=${tests.length}` +
        `) across ${Math.ceil(final.length / URLS_PER_SITEMAP)} sub-sitemaps`
    );
}

generateSitemapEntries()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
