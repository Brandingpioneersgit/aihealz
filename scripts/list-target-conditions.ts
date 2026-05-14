/**
 * WS1 step 1 — produce the target condition set for content generation.
 *
 * Read-only. Classifies every active medical_condition as either:
 *   - BASE      → a clean consumer-facing condition (slug does NOT embed
 *                 its ICD-10 code). These are the pages worth indexing.
 *   - VARIANT   → an ICD-10 child whose slug embeds the code (e.g.
 *                 `typhoid-meningitis-a0101`). These correctly canonical
 *                 up to a base via the variant-fallback logic — they are
 *                 NOT content-generation targets.
 *
 * For every BASE condition it records content status (published / draft /
 * none) by joining condition_page_content. The "none" + "draft" buckets
 * are the actual WS1 backlog.
 *
 * Writes the full target list to tasks/seo/target-conditions.json and
 * prints a summary. No AI spend, no DB writes.
 *
 * Usage: npx tsx scripts/list-target-conditions.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

/** A condition is a VARIANT when its slug embeds its own ICD-10 code. */
function isVariant(slug: string, icdCode: string | null): boolean {
    if (!icdCode) return false;
    const code = icdCode.toLowerCase().replace(/\./g, '');
    return code.length >= 3 && slug.replace(/-/g, '').includes(code);
}

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
        const conditions = await prisma.medicalCondition.findMany({
            where: { isActive: true },
            select: {
                id: true, slug: true, commonName: true,
                specialistType: true, bodySystem: true, icdCode: true,
            },
            orderBy: { commonName: 'asc' },
        });

        // condition_page_content status per conditionId (best status wins)
        const contentRows = await prisma.conditionPageContent.findMany({
            select: { conditionId: true, status: true },
        });
        const contentStatus = new Map<number, 'published' | 'draft'>();
        for (const r of contentRows) {
            const cur = contentStatus.get(r.conditionId);
            if (r.status === 'published') contentStatus.set(r.conditionId, 'published');
            else if (!cur) contentStatus.set(r.conditionId, 'draft');
        }

        const base: Array<{
            id: number; slug: string; commonName: string;
            specialistType: string; bodySystem: string | null;
            contentStatus: 'published' | 'draft' | 'none';
        }> = [];
        let variantCount = 0;

        for (const c of conditions) {
            if (isVariant(c.slug, c.icdCode)) { variantCount++; continue; }
            base.push({
                id: c.id,
                slug: c.slug,
                commonName: c.commonName,
                specialistType: c.specialistType,
                bodySystem: c.bodySystem,
                contentStatus: contentStatus.get(c.id) ?? 'none',
            });
        }

        const published = base.filter(b => b.contentStatus === 'published');
        const draft = base.filter(b => b.contentStatus === 'draft');
        const none = base.filter(b => b.contentStatus === 'none');

        // by specialty, for the backlog
        const backlogBySpecialty = new Map<string, number>();
        for (const b of [...draft, ...none]) {
            backlogBySpecialty.set(b.specialistType, (backlogBySpecialty.get(b.specialistType) ?? 0) + 1);
        }

        const outDir = path.join(process.cwd(), 'tasks', 'seo');
        fs.mkdirSync(outDir, { recursive: true });
        const outPath = path.join(outDir, 'target-conditions.json');
        fs.writeFileSync(outPath, JSON.stringify({
            generatedAt: new Date().toISOString(),
            totals: {
                activeConditions: conditions.length,
                variants: variantCount,
                baseConditions: base.length,
                published: published.length,
                draft: draft.length,
                none: none.length,
            },
            backlog: [...draft, ...none].map(b => b.slug),
            baseConditions: base,
        }, null, 2));

        console.log('\n══════════════════════════════════════════════════════════');
        console.log(' WS1 — TARGET CONDITION SET');
        console.log('══════════════════════════════════════════════════════════');
        console.log(`  active conditions      : ${conditions.length}`);
        console.log(`  ICD-10 variants        : ${variantCount}  (canonical up to base — NOT targets)`);
        console.log(`  BASE conditions        : ${base.length}  ← the indexable universe`);
        console.log(`    ├─ published content : ${published.length}`);
        console.log(`    ├─ draft content     : ${draft.length}`);
        console.log(`    └─ NO content        : ${none.length}  ← WS1 backlog`);
        console.log(`\n  WS1 backlog total      : ${draft.length + none.length} conditions`);
        console.log('\n  Backlog by specialty (top 15):');
        const top = [...backlogBySpecialty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
        for (const [spec, n] of top) console.log(`    ${spec}: ${n}`);
        console.log(`\n  Written: ${path.relative(process.cwd(), outPath)}`);
        console.log('══════════════════════════════════════════════════════════\n');
    } finally {
        await pool.end();
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
