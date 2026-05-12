import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import fs from 'node:fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

function getBaseConditionName(name) {
  let s = name.toLowerCase().trim();
  s = s.replace(/,?\s*(initial encounter|subsequent encounter|sequela)$/i, '');
  s = s.replace(/\b(left|right|bilateral|unspecified|other specified|unsp)\b/gi, '');
  s = s.replace(/\bdue to\b.*$/i, '');
  s = s.replace(/[,\-]+\s*$/, '').replace(/\s{2,}/g, ' ').trim();
  s = s.replace(/of\s+of/g, 'of').replace(/\s{2,}/g, ' ').trim();
  return s;
}
function isNonCondition(name) {
  const n = (name || '').toLowerCase();
  if (n.length < 3) return true;
  if (/^[0-9.]+$/.test(n)) return true;
  if (/encounter for|examination|screening|aftercare|follow-up|history of|family history|personal history/i.test(n)) return true;
  if (/observation for|consultation|administrative|adjustment/i.test(n)) return true;
  return false;
}
function isPoorlyFormatted(name) {
  return /unsp|nec|nos|w\/o|w\/|, w$|, w |, init|, subs|, sequela/i.test(name);
}
function isCleanIcdCode(slug) {
  // Slugs ending in -<letter><digits> pattern (e.g. -l2389, -h905, -j670) are ICD-derived; less clean for SEO
  return /-[a-z]\d{2,4}$/i.test(slug);
}

const rows = await p.medicalCondition.findMany({
  where: { isActive: true },
  select: { slug: true, commonName: true, specialistType: true, severityLevel: true, description: true, icdCode: true },
});

// Existing content rows
const existing = await p.conditionPageContent.findMany({
  where: { languageCode: 'en', status: 'published' },
  select: { conditionId: true, h1Title: true, wordCount: true, qualityScore: true },
});
const existingByConditionId = new Map(existing.map(r => [r.conditionId, r]));

const condById = new Map();
{
  const all = await p.medicalCondition.findMany({
    where: { id: { in: Array.from(existingByConditionId.keys()) } },
    select: { id: true, slug: true, commonName: true, specialistType: true },
  });
  for (const c of all) condById.set(c.id, c);
}

console.log('=== EXISTING 99 PUBLISHED EN CONDITIONS (curated head list) ===');
const seedList = Array.from(existingByConditionId.entries()).map(([id, r]) => ({
  id, slug: condById.get(id)?.slug, name: condById.get(id)?.commonName, specialty: condById.get(id)?.specialistType, h1: r.h1Title,
})).filter(x => x.slug).sort((a, b) => a.id - b.id);
for (const s of seedList) {
  console.log(`  ${String(s.id).padStart(6)}  ${(s.slug || '').padEnd(50)} ${(s.name || '').padEnd(40)} ${s.specialty || ''}`);
}

// Group all conditions by base name
const groups = new Map();
for (const r of rows) {
  if (isNonCondition(r.commonName)) continue;
  const base = getBaseConditionName(r.commonName);
  if (!base) continue;
  if (!groups.has(base)) groups.set(base, []);
  groups.get(base).push(r);
}

// Tier-1 criteria: clean canonical slug (no ICD code tail), no "unsp/nec" in name,
// reasonable number of variants (< 1000), specialty is one of the top medical specialties.
const RANKABLE_SPECIALTIES = new Set([
  'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Gastroenterology', 'Oncology',
  'Pulmonology', 'Endocrinology', 'Rheumatology', 'Nephrology', 'Urology', 'Ophthalmology',
  'ENT', 'ENT Specialist', 'Psychiatry', 'Pediatrics', 'Obstetrics', 'Gynecology',
  'Infectious Disease', 'Hematology', 'Allergy & Immunology', 'General Medicine', 'Family Medicine',
  'Emergency Medicine', 'Sports Medicine', 'Podiatry', 'Podiatrist',
  'Rheumatologist', 'Tropical Medicine', 'Pain Medicine & Palliative Care',
  'Sleep Medicine', 'Physical Medicine & Rehabilitation', 'Genetics', 'Neurosurgery',
  'Geriatrics', 'Neonatology', 'Nutrition', 'Occupational Medicine',
]);

const tier1Candidates = [];
const tier2Candidates = [];

for (const [base, variants] of groups.entries()) {
  // Pick canonical variant: prefer no ICD code tail, not poorly formatted, shortest slug
  const ranked = [...variants].sort((a, b) => {
    const aClean = !isCleanIcdCode(a.slug) && !isPoorlyFormatted(a.commonName);
    const bClean = !isCleanIcdCode(b.slug) && !isPoorlyFormatted(b.commonName);
    if (aClean !== bClean) return aClean ? -1 : 1;
    return a.slug.length - b.slug.length;
  });
  const canonical = ranked[0];

  // Reject if canonical is still trash
  if (isPoorlyFormatted(canonical.commonName)) continue;
  if (base.length < 3 || base.length > 80) continue;
  if (/^\d/.test(base)) continue;

  const specialties = new Set(variants.map(v => v.specialistType).filter(Boolean));
  const hasRankableSpecialty = Array.from(specialties).some(s => RANKABLE_SPECIALTIES.has(s));
  if (!hasRankableSpecialty) continue;

  const candidate = {
    canonicalSlug: canonical.slug,
    canonicalName: canonical.commonName,
    baseName: base,
    description: canonical.description?.slice(0, 200) || null,
    icdCode: canonical.icdCode,
    specialties: Array.from(specialties),
    variantCount: variants.length,
    variantSlugs: variants.map(v => v.slug),
    alreadyHasContent: existingByConditionId.has(canonical.id),
  };

  // Tier-1 heuristic: short canonical name (head term-y), clean slug, decent variant count (signals real condition)
  const slugWords = canonical.slug.split('-').length;
  const isHeadTerm = slugWords <= 4 && !isCleanIcdCode(canonical.slug);
  if (isHeadTerm) tier1Candidates.push(candidate);
  else tier2Candidates.push(candidate);
}

// Sort tier-1 by variant count desc (more variants = more clinical relevance) then short name first
tier1Candidates.sort((a, b) => {
  if (a.alreadyHasContent !== b.alreadyHasContent) return a.alreadyHasContent ? -1 : 1;
  if (b.variantCount !== a.variantCount) return b.variantCount - a.variantCount;
  return a.canonicalName.length - b.canonicalName.length;
});
tier2Candidates.sort((a, b) => b.variantCount - a.variantCount);

console.log(`\nTier-1 candidates (short name, clean slug, rankable specialty): ${tier1Candidates.length}`);
console.log('\n=== TIER-1 TOP 50 (post-curated head terms) ===');
for (const c of tier1Candidates.slice(0, 50)) {
  const flag = c.alreadyHasContent ? '✓' : ' ';
  console.log(`  ${flag} ${c.canonicalSlug.padEnd(45)} ${c.canonicalName.padEnd(40)} (${c.variantCount}v, ${c.specialties[0]})`);
}

console.log(`\nTier-2 candidates: ${tier2Candidates.length}`);

const out = {
  generatedAt: new Date().toISOString(),
  totals: {
    activeConditions: rows.length,
    distinctBaseConditions: groups.size,
    tier1Candidates: tier1Candidates.length,
    tier2Candidates: tier2Candidates.length,
    existingPublishedEn: existing.length,
  },
  seedList,
  tier1Conditions: tier1Candidates.slice(0, 500),
  tier2Conditions: tier2Candidates.slice(0, 5000),
};

fs.writeFileSync('/Users/taps/Desktop/Aihealz/docs/condition-tier-analysis.json', JSON.stringify(out, null, 2));
console.log('\nWrote: docs/condition-tier-analysis.json');
console.log(`  Tier-1 (head, top 500): ${out.tier1Conditions.length}`);
console.log(`  Tier-2 (long-tail, top 5000): ${out.tier2Conditions.length}`);

await p.$disconnect();
