// Bulk-upserts medical_conditions parent rows for every JSON file in
// docs/conditions-content/, AND stub rows for every cross-referenced slug
// (relatedConditions / confusedWithConditions / coOccurringConditions),
// so that scripts/insert-condition-content.mjs can then run for each slug
// without "referenced slug not found" errors.
//
// Idempotent: existing rows are left alone.
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

const CONTENT_DIR = path.join(process.cwd(), 'docs/conditions-content');
const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'))
    .sort();

// Collect primary slug → metadata for files we have content for, plus the
// set of all referenced cross-link slugs (which may not have content yet).
const primaries = new Map();       // slug → { commonName, scientificName, specialistType, description }
const refStubs = new Map();        // slug → { commonName }
const refSpecialties = new Map();  // slug → specialty inferred from the referencing file

function deriveName(slug) {
    return slug.split('-').filter(s => !/^l\d+$/i.test(s)).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

for (const file of files) {
    let json;
    try { json = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')); }
    catch (e) { console.error(`[parse ERR] ${file}: ${e.message}`); continue; }

    const meta = json._meta || {};
    const slug = meta.slug || file.replace(/\.json$/, '');
    const h1 = json.h1Title || '';
    const commonName = (h1.split(':')[0] || deriveName(slug)).trim() || slug;
    const specialistType = meta.primarySpecialty || json.specialistType || 'General Medicine';
    const description = (json.heroOverview || json.definition || '').slice(0, 4000);
    primaries.set(slug, { commonName, scientificName: commonName, specialistType, description });

    const refLists = [
        json.relatedConditions, json.confusedWithConditions, json.coOccurringConditions,
    ].filter(Array.isArray);
    for (const list of refLists) {
        for (const item of list) {
            const rSlug = item?.slug;
            if (!rSlug || primaries.has(rSlug)) continue;
            if (!refStubs.has(rSlug)) refStubs.set(rSlug, { commonName: item.name || item.title || deriveName(rSlug) });
            if (!refSpecialties.has(rSlug)) refSpecialties.set(rSlug, specialistType);
        }
    }
}

// Insert primaries first.
let pIns = 0, pSkip = 0, pErr = 0;
for (const [slug, m] of primaries) {
    try {
        const existing = await p.medicalCondition.findUnique({ where: { slug } });
        if (existing) { pSkip++; continue; }
        await p.medicalCondition.create({
            data: { slug, scientificName: m.scientificName, commonName: m.commonName, specialistType: m.specialistType, description: m.description, isActive: true },
        });
        pIns++;
    } catch (e) { pErr++; console.error(`[primary ERR] ${slug}: ${e.message}`); }
}

// Insert cross-ref stubs (don't overwrite a primary if a later pass produced one).
let sIns = 0, sSkip = 0, sErr = 0;
for (const [slug, m] of refStubs) {
    if (primaries.has(slug)) { sSkip++; continue; }
    try {
        const existing = await p.medicalCondition.findUnique({ where: { slug } });
        if (existing) { sSkip++; continue; }
        await p.medicalCondition.create({
            data: {
                slug,
                scientificName: m.commonName,
                commonName: m.commonName,
                specialistType: refSpecialties.get(slug) || 'General Medicine',
                description: null,
                isActive: false,  // stub — not yet published
            },
        });
        sIns++;
    } catch (e) { sErr++; console.error(`[stub ERR] ${slug}: ${e.message}`); }
}

console.log(`Primaries: inserted=${pIns} skipped=${pSkip} errors=${pErr} (of ${primaries.size})`);
console.log(`Stubs:     inserted=${sIns} skipped=${sSkip} errors=${sErr} (of ${refStubs.size})`);
await p.$disconnect();
