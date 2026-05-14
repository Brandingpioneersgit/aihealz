/**
 * build-condition-target-list.ts  (WS1, step 1)
 *
 * Produces the ~1,500 "core consumer condition" target set that WS1 will
 * generate condition_page_content for.
 *
 * The DB holds 72k conditions but only ~420 have clean human slugs; the rest
 * are ICD-10-coded. Many ICD-coded rows are still real consumer conditions
 * (e.g. "lactose-intolerance-unspecified-e739"). This script:
 *   1. drops non-conditions / poorly-formatted / description-less rows
 *   2. scores each row for "consumer relevance"
 *   3. dedups by base condition name (keeps the best-scored slug per base)
 *   4. takes the top N (default 1,500)
 *   5. flags which already have condition_page_content
 *
 * Output: tasks/ws1-condition-targets.json  +  a console summary.
 *
 * Run:  npx tsx scripts/build-condition-target-list.ts [limit]
 */
import { config } from 'dotenv';
import { Pool } from 'pg';
import { writeFileSync } from 'fs';
import {
    isNonCondition,
    isPoorlyFormatted,
    getBaseConditionName,
    cleanConditionName,
} from '../src/lib/condition-cleaner';

config({ path: '.env' });
config({ path: '.env.local', override: true });

const LIMIT = parseInt(process.argv[2] || '1500', 10);

// ICD cruft tokens — their presence signals a billing-code variant rather
// than a thing a patient would search for.
const CRUFT = [
    'unspecified', 'not elsewhere classified', 'other specified', ', other',
    'sequela', 'initial encounter', 'subsequent encounter', 'due to',
    'without', 'with complication', 'in diseases classified',
];

// Service / workup / specialty-angle terms. An entry whose name or slug
// carries one of these is not a distinct patient-facing condition — it is a
// service ("chronic disease management"), a workup variant ("thyroid nodule
// evaluation"), or the same condition re-filed under a specialty ("gout
// (podiatric)"). Generating pages for these recreates the near-duplicate
// problem WS1 exists to fix, so they are rejected.
const NON_CONDITION_TERMS = [
    // services / workup / specialty-angle re-files
    'management', 'counseling', 'counselling', 'consultation', 'consultations',
    'evaluation', 'screening', 'staging', 'scintigraphy', 'ablation',
    'primary care', 'nuclear imaging', 'nuclear medicine', 'histopathology',
    'cytology', 'pathology testing', 'pathology staging', 'ultrasound findings',
    'imaging procedures', 'interventional radiology', 'programs', 'prevention',
    'rehabilitation', 'interpretation', 'incidental', 'cessation',
    // procedures / imaging / surgery — these are treatment or workup pages,
    // not patient-facing conditions, and don't fit the condition schema
    'surgery', 'surgical', 'transplant', 'reconstruction', 'repair',
    'replacement', 'grafting', 'graft', 'biopsy', 'imaging', ' scan',
    '-scan', 'mapping', 'stimulation', 'free flap', 'free-flap',
    'bypass', 'angioplasty', 'lithotripsy', 'perfusion imaging',
];

// Procedure slugs by suffix — Greek/Latin procedure endings the term list
// can miss (rhinoplasty, carotid-endarterectomy, thoracotomy, etc.).
const PROCEDURE_SLUG = /(plasty|ectomy|ostomy|otomy|centesis|pexy|desis|scopy)(-|$)/;

// Workup / imaging / device slugs: the slug carries an investigation modality
// or device rather than naming a condition (herniated-disc-mri,
// renal-mass-ct-finding, colon-polyp-histology, coronary-artery-calcium-score).
const WORKUP_SLUG = /(-histology|-cytology|-pap|-mri|-ct-|-ct$|-ultrasound|-radioiodine|-score|-device|-dialysis|-finding|-lesion|-analysis|-scan)(-|$)/;

// A handful of standalone procedure slugs with no give-away affix.
const PROCEDURE_EXACT = new Set([
    'liposuction', 'scar-revision', 'tissue-expansion', 'rhinoplasty',
    'blepharoplasty', 'abdominoplasty', 'microsurgery-free-flap',
]);

// Strip a trailing/parenthetical specialty qualifier — "Gout (Podiatric)",
// "Osteoarthritis (Primary Care)", "Herniated Disc (MRI)" — so the base-name
// dedup folds them onto the real condition instead of treating each as new.
function stripQualifier(name: string): string {
    return name.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function scoreCondition(commonName: string, slug: string, hasDesc: boolean): number {
    const base = getBaseConditionName(commonName);
    const lower = commonName.toLowerCase();
    let score = 100;

    // fewer words in the base name → more likely a head term
    const words = base.split(/\s+/).filter(Boolean).length;
    score -= words * 6;

    // ICD cruft tokens
    for (const c of CRUFT) if (lower.includes(c)) score -= 18;

    // clean slug (no ICD digits) is the strongest "real condition" signal
    if (!/[0-9]/.test(slug)) score += 40;

    // shorter slug → cleaner
    score -= Math.max(0, slug.length - 24) * 0.8;

    // must have a description to be worth a page
    if (!hasDesc) score -= 1000;

    return score;
}

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

    const { rows } = await pool.query<{
        id: number; slug: string; common_name: string;
        specialist_type: string; has_desc: boolean;
    }>(`
        SELECT mc.id, mc.slug, mc.common_name, mc.specialist_type,
               (mc.description IS NOT NULL) AS has_desc
        FROM medical_conditions mc
        WHERE mc.is_active = true
    `);

    const haveContent = new Set<number>(
        (await pool.query<{ condition_id: number }>(
            `SELECT DISTINCT condition_id FROM condition_page_content`,
        )).rows.map(r => r.condition_id),
    );

    // score + filter
    type Cand = {
        id: number; slug: string; commonName: string; cleanName: string;
        baseName: string; specialistType: string; hasContent: boolean; score: number;
    };
    const candidates: Cand[] = [];
    for (const r of rows) {
        if (!r.has_desc) continue;
        if (isNonCondition(r.common_name)) continue;
        if (isPoorlyFormatted(r.common_name)) continue;
        // Reject services / workup variants / specialty re-files / procedures.
        const haystack = `${r.common_name} ${r.slug.replace(/-/g, ' ')}`.toLowerCase();
        if (NON_CONDITION_TERMS.some(t => haystack.includes(t))) continue;
        if (PROCEDURE_SLUG.test(r.slug)) continue;
        if (WORKUP_SLUG.test(r.slug)) continue;
        if (PROCEDURE_EXACT.has(r.slug)) continue;
        const score = scoreCondition(r.common_name, r.slug, r.has_desc);
        if (score < 0) continue;
        // Base name with the parenthetical specialty qualifier stripped, so
        // "Gout (Podiatric)" dedups onto plain "gout".
        const baseName = getBaseConditionName(stripQualifier(r.common_name));
        candidates.push({
            id: r.id,
            slug: r.slug,
            commonName: r.common_name,
            cleanName: cleanConditionName(r.common_name),
            baseName,
            specialistType: r.specialist_type,
            hasContent: haveContent.has(r.id),
            score,
        });
    }

    // dedup by base name — keep the best-scored slug per base
    const byBase = new Map<string, Cand>();
    for (const c of candidates) {
        const existing = byBase.get(c.baseName);
        if (!existing || c.score > existing.score) byBase.set(c.baseName, c);
    }

    // rank, then take top N
    const ranked = [...byBase.values()].sort((a, b) => b.score - a.score);
    const target = ranked.slice(0, LIMIT);

    const needContent = target.filter(c => !c.hasContent);
    const haveAlready = target.filter(c => c.hasContent);

    const out = {
        generatedAt: new Date().toISOString(),
        limit: LIMIT,
        totalActiveConditions: rows.length,
        candidatesAfterFilter: candidates.length,
        distinctBaseConditions: byBase.size,
        targetCount: target.length,
        alreadyHaveContent: haveAlready.length,
        needContent: needContent.length,
        target: target.map(c => ({
            id: c.id, slug: c.slug, commonName: c.commonName,
            specialistType: c.specialistType, hasContent: c.hasContent,
            score: Math.round(c.score),
        })),
    };

    writeFileSync('tasks/ws1-condition-targets.json', JSON.stringify(out, null, 2));

    console.log('=== WS1 Target List ===');
    console.log(`Total active conditions:     ${out.totalActiveConditions}`);
    console.log(`After non-condition filter:  ${out.candidatesAfterFilter}`);
    console.log(`Distinct base conditions:    ${out.distinctBaseConditions}`);
    console.log(`Target (capped at ${LIMIT}):     ${out.targetCount}`);
    console.log(`  ├─ already have content:   ${out.alreadyHaveContent}`);
    console.log(`  └─ need generation:        ${out.needContent}`);
    console.log(`\nScore range: ${Math.round(target[target.length - 1].score)} … ${Math.round(target[0].score)}`);
    console.log('\nTop 15 targets:');
    target.slice(0, 15).forEach(c => console.log(`  [${c.hasContent ? '✓' : ' '}] ${c.slug}`));
    console.log('\nBottom 10 of the target set (lowest-scored still included):');
    target.slice(-10).forEach(c => console.log(`  [${c.hasContent ? '✓' : ' '}] ${c.slug} — "${c.commonName}"`));
    console.log('\nWritten: tasks/ws1-condition-targets.json');

    await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
