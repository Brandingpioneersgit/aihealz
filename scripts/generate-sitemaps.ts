/**
 * Sitemap Generator Script — streaming version
 *
 * Generates sitemap entries for:
 *  - Curated static pages (homepage, tools, marketing, AEO/GEO surfaces)
 *  - Condition × geography × language fan-out
 *  - Cost variants per condition × country
 *  - Treatments (en + per-country) from public/data/treatments.json
 *  - Doctor / hospital / diagnostic-lab / diagnostic-test / insurance slugs
 *  - Per-city test variants
 *  - Doctors-by-location + doctors-by-specialty pages
 *  - Conditions-by-specialty pages
 *
 * The previous buffered version OOMed at ~4M URLs because it held the entire
 * entry list in memory before inserting. This streaming version flushes every
 * BATCH_SIZE rows directly to the DB and keeps a single dedup Set of URL paths
 * (~50 bytes per string × ~5M strings = ~250 MB — well within 8 GB heap).
 *
 * Run via: NODE_OPTIONS="--max-old-space-size=4096" node --env-file=.env --import tsx scripts/generate-sitemaps.ts
 * Schedule as a cron job: run daily or after content updates.
 */

import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/db';

const URLS_PER_SITEMAP = parseInt(process.env.SITEMAP_URLS_PER_FILE || '45000', 10);
const BATCH_SIZE = parseInt(process.env.SITEMAP_BATCH_SIZE || '1000', 10);

interface GeoRecord {
    id: number;
    slug: string;
    level: string;
    parentId: number | null;
    supportedLanguages: string[];
}

type EntryRow = {
    urlPath: string;
    sitemapIndex: number;
    changefreq: string;
    priority: number;
    languageCode: string | null;
    conditionId: number | null;
    geographyId: number | null;
    lastModified: Date;
};

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

/**
 * Streaming entry sink. Buffers up to BATCH_SIZE rows in memory, then flushes
 * to the DB and clears the buffer. Tracks a global dedup Set so the same
 * urlPath isn't inserted twice across the run, and increments a global counter
 * to assign sitemapIndex without re-shuffling later.
 */
class EntrySink {
    private buffer: EntryRow[] = [];
    private seen = new Set<string>();
    private accepted = 0;
    private inserted = 0;
    private categoryCounts: Record<string, number> = {};

    async push(input: EntryInput, category: string) {
        if (this.seen.has(input.urlPath)) return;
        this.seen.add(input.urlPath);

        const idx = Math.floor(this.accepted / URLS_PER_SITEMAP);
        this.accepted += 1;
        this.categoryCounts[category] = (this.categoryCounts[category] || 0) + 1;

        this.buffer.push({
            urlPath: input.urlPath,
            sitemapIndex: idx,
            changefreq: input.changefreq,
            priority: input.priority,
            languageCode: input.languageCode,
            conditionId: input.conditionId ?? null,
            geographyId: input.geographyId ?? null,
            lastModified: input.lastModified ?? new Date(),
        });

        if (this.buffer.length >= BATCH_SIZE) {
            await this.flush();
        }
    }

    async flush() {
        if (this.buffer.length === 0) return;
        const batch = this.buffer;
        this.buffer = [];
        await prisma.sitemapEntry.createMany({ data: batch, skipDuplicates: true });
        this.inserted += batch.length;
        if (this.inserted % 50_000 === 0 || this.inserted - batch.length === 0) {
            process.stdout.write(`\r  inserted ${this.inserted.toLocaleString()} entries`);
        }
    }

    stats() {
        return {
            accepted: this.accepted,
            inserted: this.inserted,
            chunks: Math.ceil(this.accepted / URLS_PER_SITEMAP),
            categories: this.categoryCounts,
        };
    }
}

async function generateSitemapEntries() {
    console.log('🗺️  Starting sitemap generation (streaming)...');
    console.time('total');

    await prisma.sitemapEntry.deleteMany();
    console.log('  ✓ wiped sitemap_entries table');

    const sink = new EntrySink();

    // ── 1. Static curated pages ─────────────────────────────────
    for (const p of STATIC_PAGES) {
        await sink.push({ ...p, languageCode: 'en', lastModified: new Date() }, 'static');
    }
    console.log(`  ✓ static pages: ${STATIC_PAGES.length}`);

    // ── shared lookups ──────────────────────────────────────────
    // Active language codes — geographies.supportedLanguages may reference
    // codes that aren't seeded into the languages table (e.g. fil, he, sv,
    // ne, si, am, af, kha, kok, lus, mni, nag). Filter those out so the FK
    // constraint on sitemap_entries.language_code never fires.
    const activeLanguages = await prisma.language.findMany({
        where: { isActive: true },
        select: { code: true },
    });
    const validLangCodes = new Set(activeLanguages.map((l) => l.code));
    console.log(`  ✓ active languages: ${validLangCodes.size}`);

    const rawGeographies: GeoRecord[] = await prisma.geography.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, level: true, parentId: true, supportedLanguages: true },
    });
    // Drop any unsupported language codes from each geography's list.
    const geographies: GeoRecord[] = rawGeographies.map((g) => ({
        ...g,
        supportedLanguages: g.supportedLanguages.filter((l) => validLangCodes.has(l)),
    }));
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
    const cityGeos = geographies.filter((g) => g.level === 'city');
    console.log(`  ✓ geographies: ${geographies.length} (${countryGeos.length} countries / ${cityGeos.length} cities)`);

    // ── 2. Condition × COUNTRY × language fan-out ─────────────
    // Country-level only — fanning out 72k conditions × ~1k geographies ×
    // multiple languages explodes to 150M+ thin URLs that Google would
    // rightly downrank. Sub-country geography (state/city/locality) is
    // covered by /doctors, /tests/[slug]/[city], /hospitals etc., not by
    // multiplying every condition page across every city.
    //
    // Stream conditions in pages so we don't pull all 70k+ rows at once.
    const CONDITION_PAGE = 5000;
    let condCursor: number | undefined = undefined;
    let condProcessed = 0;
    while (true) {
        const conditions: { id: number; slug: string; updatedAt: Date }[] =
            await prisma.medicalCondition.findMany({
                where: { isActive: true },
                select: { id: true, slug: true, updatedAt: true },
                orderBy: { id: 'asc' },
                take: CONDITION_PAGE,
                ...(condCursor ? { cursor: { id: condCursor }, skip: 1 } : {}),
            });
        if (conditions.length === 0) break;

        for (const condition of conditions) {
            for (const geo of countryGeos) {
                for (const lang of geo.supportedLanguages) {
                    await sink.push({
                        urlPath: `/${geo.slug}/${lang}/${condition.slug}`,
                        changefreq: 'weekly',
                        priority: 0.6,
                        languageCode: lang,
                        conditionId: condition.id,
                        geographyId: geo.id,
                        lastModified: condition.updatedAt,
                    }, 'condition_geo');

                    // Per-condition cost pages, country level
                    await sink.push({
                        urlPath: `/${geo.slug}/${lang}/${condition.slug}/cost`,
                        changefreq: 'weekly',
                        priority: 0.7,
                        languageCode: lang,
                        conditionId: condition.id,
                        geographyId: geo.id,
                        lastModified: condition.updatedAt,
                    }, 'condition_cost');
                }
            }
        }

        condProcessed += conditions.length;
        process.stdout.write(`\r  conditions processed: ${condProcessed.toLocaleString()}`);

        if (conditions.length < CONDITION_PAGE) break;
        condCursor = conditions[conditions.length - 1].id;
    }
    process.stdout.write(`\n  ✓ condition fan-out + cost variants done\n`);

    // ── 3. Conditions-by-specialty index pages ─────────────────
    // Prisma 7 rejects `{ not: null }` shorthand — filter null in JS.
    const specialtiesRaw = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: { specialistType: true },
        distinct: ['specialistType'],
    });
    const specialtyNames = Array.from(
        new Set(
            specialtiesRaw
                .map((s) => s.specialistType)
                .filter((s): s is string => typeof s === 'string' && s.length > 0)
                .map((s) => slugify(s))
        )
    );
    for (const slug of specialtyNames) {
        await sink.push({
            urlPath: `/conditions/${slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            languageCode: 'en',
        }, 'condition_specialty');
    }
    console.log(`  ✓ conditions-by-specialty: ${specialtyNames.length}`);

    // ── 4. Treatments (canonical + per-country + per-locale index) ──
    let treatmentCount = 0;
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
                treatmentCount += 1;

                await sink.push({
                    urlPath: `/treatments/${slug}`,
                    changefreq: 'monthly',
                    priority: 0.7,
                    languageCode: 'en',
                }, 'treatment_canonical');
                for (const geo of countryGeos) {
                    for (const lang of geo.supportedLanguages) {
                        await sink.push({
                            urlPath: `/${geo.slug}/${lang}/treatments/${slug}`,
                            changefreq: 'monthly',
                            priority: 0.6,
                            languageCode: lang,
                            geographyId: geo.id,
                        }, 'treatment_geo');
                    }
                }
            }
            for (const geo of countryGeos) {
                for (const lang of geo.supportedLanguages) {
                    await sink.push({
                        urlPath: `/${geo.slug}/${lang}/treatments`,
                        changefreq: 'weekly',
                        priority: 0.7,
                        languageCode: lang,
                        geographyId: geo.id,
                    }, 'treatment_index');
                }
            }
        }
    } catch (err) {
        console.warn('  ⚠ skipping treatments slugs:', (err as Error).message);
    }
    console.log(`  ✓ treatments: ${treatmentCount} canonical + per-country variants`);

    // ── 5. Doctor profile slugs ────────────────────────────────
    const doctors = await prisma.doctorProvider.findMany({
        where: { isVerified: true },
        select: { slug: true, updatedAt: true },
    });
    for (const d of doctors) {
        await sink.push({
            urlPath: `/doctor/${d.slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            languageCode: 'en',
            lastModified: d.updatedAt,
        }, 'doctor_profile');
    }
    console.log(`  ✓ doctor profiles: ${doctors.length}`);

    // ── 5b. Doctors-by-location pages ──────────────────────────
    for (const geo of geographies) {
        await sink.push({
            urlPath: `/doctors/${geo.slug}`,
            changefreq: 'weekly',
            priority: geo.level === 'city' ? 0.7 : geo.level === 'state' ? 0.6 : 0.5,
            languageCode: 'en',
            geographyId: geo.id,
        }, 'doctor_location');
        for (const lang of geo.supportedLanguages) {
            if (lang === 'en') continue; // already covered by base path
            await sink.push({
                urlPath: `/doctors/${geo.slug}/${lang}`,
                changefreq: 'weekly',
                priority: 0.5,
                languageCode: lang,
                geographyId: geo.id,
            }, 'doctor_location_lang');
        }
    }
    console.log(`  ✓ doctors-by-location: ${geographies.length} base + per-language variants`);

    // ── 5c. Doctors-by-specialty pages ─────────────────────────
    const DOCTOR_SPECIALTIES = [
        'general-physician', 'cardiologist', 'dermatologist', 'neurologist',
        'orthopedist', 'pediatrician', 'gynecologist', 'dentist', 'psychiatrist',
        'ophthalmologist', 'ent-specialist', 'general-surgeon', 'urologist',
        'oncologist', 'endocrinologist', 'pulmonologist', 'gastroenterologist',
        'nephrologist', 'rheumatologist', 'radiologist', 'pathologist',
    ];
    for (const slug of DOCTOR_SPECIALTIES) {
        await sink.push({
            urlPath: `/doctors/specialty/${slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            languageCode: 'en',
        }, 'doctor_specialty');
    }
    console.log(`  ✓ doctors-by-specialty: ${DOCTOR_SPECIALTIES.length}`);

    // ── 6. Hospital slugs ──────────────────────────────────────
    const hospitals = await prisma.hospital.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });
    for (const h of hospitals) {
        await sink.push({
            urlPath: `/hospitals/${h.slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            languageCode: 'en',
            lastModified: h.updatedAt,
        }, 'hospital');
    }
    console.log(`  ✓ hospitals: ${hospitals.length}`);

    // ── 7. Diagnostic-lab slugs ────────────────────────────────
    const diagProviders = await prisma.diagnosticProvider.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });
    for (const p of diagProviders) {
        await sink.push({
            urlPath: `/diagnostic-labs/${p.slug}`,
            changefreq: 'weekly',
            priority: 0.6,
            languageCode: 'en',
            lastModified: p.updatedAt,
        }, 'diagnostic_lab');
    }
    console.log(`  ✓ diagnostic-labs: ${diagProviders.length}`);

    // ── 8. Insurance slugs ─────────────────────────────────────
    const insurers = await prisma.insuranceProvider.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });
    for (const ins of insurers) {
        await sink.push({
            urlPath: `/insurance/${ins.slug}`,
            changefreq: 'monthly',
            priority: 0.6,
            languageCode: 'en',
            lastModified: ins.updatedAt,
        }, 'insurance');
    }
    console.log(`  ✓ insurance: ${insurers.length}`);

    // ── 9. Diagnostic-test slugs + per-city variants + categories ──
    const tests = await prisma.diagnosticTest.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });
    for (const t of tests) {
        await sink.push({
            urlPath: `/tests/${t.slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            languageCode: 'en',
            lastModified: t.updatedAt,
        }, 'test_canonical');
        for (const c of cityGeos) {
            await sink.push({
                urlPath: `/tests/${t.slug}/${c.slug}`,
                changefreq: 'weekly',
                priority: 0.6,
                languageCode: 'en',
                geographyId: c.id,
                lastModified: t.updatedAt,
            }, 'test_city');
        }
    }
    console.log(`  ✓ tests: ${tests.length} canonical + per-city variants`);

    // Test categories — DiagnosticCategory has no updatedAt column; use createdAt.
    const categories = await prisma.diagnosticCategory
        .findMany({ select: { slug: true, createdAt: true } })
        .catch(() => [] as Array<{ slug: string; createdAt: Date }>);
    for (const c of categories) {
        await sink.push({
            urlPath: `/tests/category/${c.slug}`,
            changefreq: 'weekly',
            priority: 0.6,
            languageCode: 'en',
            lastModified: c.createdAt,
        }, 'test_category');
    }
    if (categories.length) console.log(`  ✓ test-categories: ${categories.length}`);

    // ── final flush ────────────────────────────────────────────
    await sink.flush();
    process.stdout.write('\n');

    const stats = sink.stats();
    console.log('\n──────────────────────────────────────────');
    console.log(`✅ Generated ${stats.accepted.toLocaleString()} sitemap entries across ${stats.chunks} sub-sitemaps`);
    console.log('   Breakdown by category:');
    for (const [cat, count] of Object.entries(stats.categories).sort((a, b) => b[1] - a[1])) {
        console.log(`     ${cat.padEnd(28)} ${count.toLocaleString()}`);
    }
    console.timeEnd('total');
}

generateSitemapEntries()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
