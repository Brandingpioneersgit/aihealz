// Generates the next batch of N condition slugs to be written, filtering out
// ICD-tail noise (slugs like "fistula-left-hip-m25152") that the variant
// fallback already covers. Writes _assignments.md rows + a batch summary.
//
// Usage:
//   node generate-next-batch.mjs [batch_size=100] [batch_num=auto]
//
// batch_num auto-detects by scanning docs/conditions-content/_batch-*.json
// and picking max+1.
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const BATCH_SIZE = parseInt(process.argv[2] || '100', 10);

// --diversify (or env DIVERSIFY=1) round-robins picks across specialties so a
// single batch doesn't get dominated by one ICD-letter family (e.g. all
// infectious-disease A-codes). Default ON since batches were clumping.
const DIVERSIFY = !process.argv.includes('--no-diversify');

const BATCH_DIR = '/Users/taps/Desktop/Aihealz/docs/conditions-content';

function detectNextBatchNum() {
  const explicit = process.argv[3];
  if (explicit) return parseInt(explicit, 10);
  const files = fs.readdirSync(BATCH_DIR);
  const nums = files
    .map(f => f.match(/^_batch-(\d+)\.json$/))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  return nums.length ? Math.max(...nums) + 1 : 1;
}
const BATCH_NUM = detectNextBatchNum();
const BATCH_LABEL = String(BATCH_NUM).padStart(3, '0');
const BATCH_FILE = path.join(BATCH_DIR, `_batch-${BATCH_LABEL}.json`);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

const tierAnalysis = JSON.parse(fs.readFileSync('/Users/taps/Desktop/Aihealz/docs/condition-tier-analysis.json', 'utf8'));

// Slugs already done (have ConditionPageContent in en+published)
const doneRows = await p.conditionPageContent.findMany({
  where: { languageCode: 'en', status: 'published' },
  select: { conditionId: true },
});
const doneIds = new Set(doneRows.map(r => r.conditionId));
const doneConditions = await p.medicalCondition.findMany({
  where: { id: { in: Array.from(doneIds) } },
  select: { slug: true },
});
const doneSlugs = new Set(doneConditions.map(c => c.slug));

// Also exclude conditions claimed in any previous batch JSON (they're queued,
// not yet published — we don't want to double-assign them).
const claimedSlugs = new Set();
for (const f of fs.readdirSync(BATCH_DIR)) {
  if (!/^_batch-\d+\.json$/.test(f)) continue;
  const prev = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, f), 'utf8'));
  for (const c of (prev.conditions || [])) claimedSlugs.add(c.slug);
}

// Filter for clinically distinct conditions worth their own content.
// Loosened in batch-007 onward: ICD-tail slugs are allowed as long as the
// canonical name is a clean clinical entity (not just a laterality variant).
// The variant fallback already covers laterality/encounter variants.
function isRealHeadTerm(c) {
  const slug = c.canonicalSlug;
  const name = c.canonicalName || '';

  // STILL REJECT: ICD activity / external-cause codes (Y/V/W/X)
  if (/^(activity|actvty)-/i.test(slug)) return false;
  if (/-y9[0-9a-z]+$/i.test(slug)) return false;

  // STILL REJECT: laterality / anatomic-side variants — these are pure
  // variants whose content lives on the parent page via canonical fallback.
  if (/\b(left|right|bilateral)-/i.test(slug)) return false;
  if (/\b(left|right|bilateral)\b/i.test(name)) return false;

  // STILL REJECT: orthopedic anatomical-position noise where the slug starts
  // with a generic finding + body part (effusion-hip, fistula-elbow, etc.).
  if (/^(fistula|effusion|ganglion|ankylosis|osteophyte|osteolysis|chondrolysis|hemarthrosis|contracture)-/i.test(slug)) return false;

  // STILL REJECT: site-specific oncology (parent cancer page covers them).
  if (/^(malignant|secondary|benign)-neoplasm/i.test(slug)) return false;

  // STILL REJECT: "unspecified site" variants where the parent has a clean
  // alternative.
  if (/-unspecified-site-/.test(slug)) return false;

  // REJECT: clinical assessment scales/scores that aren't diseases (NIHSS,
  // Glasgow coma, APACHE, etc. — these are tools, not conditions to rank for).
  if (/^nihss-score/i.test(slug)) return false;
  if (/^(glasgow-coma-scale|apache|sofa|qsofa)-/i.test(slug)) return false;
  if (/^(score-|grade-)/i.test(slug)) return false;

  // REJECT: individual phobia entries — they collapse to a "specific phobia"
  // parent page. Keep agoraphobia and social anxiety which are distinct DSM-5
  // entities.
  const lname = name.toLowerCase();
  if (/^(fear of |androphobia|gynephobia|acrophobia|claustrophobia|arachnophobia|trypanophobia)/i.test(lname)
      && !/(agoraphobia|social anxiety|panic disorder)/.test(lname)) {
    return false;
  }

  // REJECT: trivial Z-codes (factor-influencing-health) and observation R-codes
  // unless they're real complaints worth a page.
  if (/-z[0-9]{2,}$/i.test(slug) && !/-(sleep-|smoking|obesity|pregnancy|family-history)/.test(slug)) return false;
  if (/^(allergy-to-|sibling-rivalry|loss-of-height)/i.test(slug)) return false;

  // REJECT: isolated lab-finding entries that aren't diagnoses on their own
  // (these belong on the differential of a parent condition).
  if (/^(bandemia|basophilia|plasmacytosis|monocytosis-symptomatic|lymphocytosis-symptomatic|leukemoid-reaction)/i.test(slug)) return false;

  // REJECT: "of [body part]" anatomic variants — fistula-of-X, cellulitis-of-X,
  // furuncle-of-X, carbuncle-of-X. The parent condition page covers these via
  // variant fallback. (Periorbital cellulitis is distinct enough to keep.)
  if (/-of-(face|head|neck|trunk|abdomen|chest|back|buttock|groin|perineum|umbilicus|hip|knee|ankle|foot|toe|hand|finger|wrist|elbow|shoulder|arm|leg|thigh|orbit|ear|eye)\b/i.test(slug)) return false;

  // REJECT: anatomic-position-suffixed orthopedic variants (chondromalacia-knee, etc.)
  if (/-(hip|knee|ankle|foot|toe|hand|finger|wrist|elbow|shoulder|arm|leg|thigh)\b-?/i.test(slug) && !/^(plantar-fasciitis|carpal-tunnel|tennis-elbow|frozen-shoulder|hammer-toe|rotator-cuff)/i.test(slug)) {
    // Allow if the FIRST word is the condition name (e.g. plantar-fasciitis-foot is fine);
    // reject anatomic-variant ICD entries.
    if (/-(unspecified|other)-?/i.test(slug)) return false;
  }

  // REJECT: "due to X" causal subtypes — usually variants of a parent condition.
  if (/-due-to-/i.test(slug)) return false;

  // REJECT: "Other X" / "Other specified X" / "Unspecified X" subtypes when a
  // cleaner parent exists. We let some specific ones through ("other ocular
  // albinism" etc. don't have cleaner parents on the DB).
  if (/^(other|oth)-(specified-)?/i.test(slug) || /^(other|oth)-/i.test(name.toLowerCase())) return false;
  if (/^(unspecified|unsp)-/i.test(slug)) return false;

  // REJECT: ICD external-cause / injury variants leaked through Tier-2
  if (/-(due-to|secondary-to|after|following)-/i.test(slug)) return false;
  if (/-(init|subs|sequela)$/i.test(slug)) return false;

  // REJECT: clearly procedural-complication codes (T8x range — device/graft/transplant
  // complications that belong on the procedure's complication section, not their own page)
  if (/-t8[0-9][a-z0-9]+$/i.test(slug)) return false;

  // STILL REJECT: too-short single-word slugs with no clinical meaning.
  const words = slug.split('-');
  if (words.length === 1 && name.split(/\s+/).length === 1 && slug.length < 4) return false;

  // STILL REJECT: badly truncated names ending in 'w', 'w/', incomplete clauses.
  if (/\bw$|\bw\/$|, w$/.test(name)) return false;

  // ACCEPT EVERYTHING ELSE — including ICD-tail slugs that name a real
  // clinical entity (e.g. farmers-lung-j670, common-variable-immunodeficiency-d83x).
  return true;
}

function eligible(c) {
  if (doneSlugs.has(c.canonicalSlug)) return false;
  if (claimedSlugs.has(c.canonicalSlug)) return false;
  return isRealHeadTerm(c);
}

const filteredTier1 = tierAnalysis.tier1Conditions.filter(eligible).map(c => ({ ...c, _tier: 1 }));
const filteredTier2 = (tierAnalysis.tier2Conditions || []).filter(eligible).map(c => ({ ...c, _tier: 2 }));

// Take from Tier-1 first; top up from Tier-2; finally fall back to Tier-3
// (the broader MedicalCondition table, anything not yet in the curated lists).
let filtered = [...filteredTier1, ...filteredTier2];

if (filtered.length < BATCH_SIZE) {
  // Tier-3 fallback: query the live MedicalCondition table directly.
  const slugsAlreadyConsidered = new Set([
    ...doneSlugs,
    ...claimedSlugs,
    ...tierAnalysis.tier1Conditions.map(c => c.canonicalSlug),
    ...(tierAnalysis.tier2Conditions || []).map(c => c.canonicalSlug),
  ]);

  const dbRows = await p.medicalCondition.findMany({
    where: {
      isActive: true,
      slug: { notIn: Array.from(slugsAlreadyConsidered) },
      // Pre-filter at SQL level: short slugs (≤5 hyphen-separated parts) are
      // much more likely to be head terms than long ICD-suffixed entries.
      NOT: [
        { slug: { contains: 'unspecified' } },
        { slug: { contains: 'bilateral' } },
        { slug: { startsWith: 'activity-' } },
        { slug: { startsWith: 'actvty-' } },
      ],
    },
    select: {
      slug: true,
      commonName: true,
      specialistType: true,
    },
    orderBy: { commonName: 'asc' },
  });

  const tier3 = dbRows
    .map(r => ({
      canonicalSlug: r.slug,
      canonicalName: r.commonName,
      specialties: r.specialistType ? [r.specialistType] : [],
      variantCount: 1,
      _tier: 3,
    }))
    .filter(eligible)
    // Extra Tier-3 hygiene: name must be clean prose, slug must be short-ish
    .filter(c => {
      const name = c.canonicalName || '';
      if (name.length > 80) return false;
      if (/\b(due to|secondary to|associated with|in remission|on long-term)\b/i.test(name)) return false;
      if (/\bnec\b|\bnos\b|\bunspec/i.test(name)) return false;
      if (c.canonicalSlug.split('-').length > 7) return false;
      return true;
    });

  console.log(`Tier-3 (live DB) eligible: ${tier3.length}`);
  filtered = [...filtered, ...tier3];
}

console.log(`Tier-1 total: ${tierAnalysis.tier1Conditions.length} (eligible: ${filteredTier1.length})`);
console.log(`Tier-2 total: ${(tierAnalysis.tier2Conditions || []).length} (eligible: ${filteredTier2.length})`);
console.log(`Already published: ${doneSlugs.size}`);
console.log(`Already claimed in prior batches: ${claimedSlugs.size}`);
console.log(`Diversify by specialty: ${DIVERSIFY ? 'on' : 'off'}`);
console.log(`Generating batch ${BATCH_LABEL}\n`);

// Round-robin across (specialty, ICD-family) pairs so a batch isn't dominated
// by one specialty AND isn't dominated by one ICD-3-digit family inside that
// specialty. Within each leaf bucket we preserve the original ordering.
//
// "ICD-family" = first letter + first two digits of the suffix (e.g. e09, f11,
// d17). Slugs without an ICD suffix (T1 head terms, Tier-3) bucket under
// "head" so they pick first regardless of family.
function diversifyBySpecialty(pool, target) {
  const buckets = new Map(); // key = "specialty|family" → conditions[]
  for (const c of pool) {
    const spec = (c.specialties && c.specialties[0]) || 'Unknown';
    const m = c.canonicalSlug.match(/-([a-z]\d{2})[a-z0-9]*$/i);
    const family = m ? m[1].toLowerCase() : 'head';
    const key = `${spec}|${family}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(c);
  }

  // Shuffle the bucket order so leaders rotate between runs — keeps a single
  // specialty from always being picked first.
  const keys = [...buckets.keys()].sort(() => Math.random() - 0.5);
  const queues = keys.map(k => buckets.get(k));

  const picked = [];
  let advanced = true;
  while (picked.length < target && advanced) {
    advanced = false;
    for (const q of queues) {
      if (q.length === 0) continue;
      picked.push(q.shift());
      advanced = true;
      if (picked.length >= target) break;
    }
  }
  return picked;
}

const batch = DIVERSIFY
  ? diversifyBySpecialty(filtered, BATCH_SIZE)
  : filtered.slice(0, BATCH_SIZE);
console.log(`\nNext batch (${batch.length} conditions):`);

const rows = [];
for (const c of batch) {
  const spec = (c.specialties && c.specialties[0]) || '?';
  console.log(`  T${c._tier} ${c.canonicalSlug.padEnd(40)} ${c.canonicalName.padEnd(35)} ${spec}`);
  rows.push({
    slug: c.canonicalSlug,
    tier: c._tier,
    specialty: spec,
    variantCount: c.variantCount,
    canonicalName: c.canonicalName,
  });
}

// Write a structured batch file for parallel agents
const batchOut = {
  generatedAt: new Date().toISOString(),
  batchSize: batch.length,
  alreadyDone: Array.from(doneSlugs).sort(),
  conditions: rows,
};
fs.writeFileSync(BATCH_FILE, JSON.stringify(batchOut, null, 2));
console.log(`\nWrote: ${path.relative('/Users/taps/Desktop/Aihealz', BATCH_FILE)}`);

// Append assignment rows to _assignments.md
const assignmentsPath = '/Users/taps/Desktop/Aihealz/docs/conditions-content/_assignments.md';
const existing = fs.readFileSync(assignmentsPath, 'utf8');

// Insert before the "Reviewer assignments" section if present, else append
const reviewerHeaderIdx = existing.indexOf('## Reviewer assignments');
const rulesIdx = existing.indexOf('## Rules');

const newRows = batch.map(c => {
  const spec = (c.specialties && c.specialties[0]) || '?';
  return `| ${c.canonicalSlug} | ${c._tier} | ${spec} | (open) | — | open | Batch ${BATCH_LABEL}, ${c.variantCount} variant${c.variantCount === 1 ? '' : 's'} |`;
}).join('\n');

const batchSection = `\n\n<!-- BATCH ${BATCH_LABEL} — ${batch.length} conditions, generated ${new Date().toISOString().split('T')[0]} -->\n${newRows}\n`;

let updated;
if (rulesIdx > 0) {
  updated = existing.slice(0, rulesIdx) + batchSection + '\n' + existing.slice(rulesIdx);
} else {
  updated = existing + batchSection;
}

fs.writeFileSync(assignmentsPath, updated);
console.log(`Appended ${batch.length} rows to _assignments.md`);

await p.$disconnect();
