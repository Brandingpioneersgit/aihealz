// Analyzes queued batch JSON files for "orphan subtypes" — slugs whose names
// share a parent clinical concept that has no clean parent slug in the DB.
//
// Strategy:
//   1. Tokenize every queued slug's name
//   2. Find shared 1-2 word prefixes that appear in ≥3 subtype names
//   3. Check whether a clean parent slug already exists in MedicalCondition
//   4. Recommend inserting parent rows for the missing concepts
//   5. With --apply, insert MedicalCondition rows for them and queue in a new batch
//
// Usage:
//   node scripts/inject-parent-conditions.mjs              (analyze only)
//   node scripts/inject-parent-conditions.mjs --apply      (also insert + queue)

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const BATCH_DIR = '/Users/taps/Desktop/Aihealz/docs/conditions-content';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

// Stop words that should not form a parent concept on their own.
const STOP = new Set([
  'of', 'and', 'or', 'the', 'a', 'an', 'with', 'without', 'in', 'on', 'to',
  'unspecified', 'unsp', 'other', 'specified', 'oth', 'site', 'sites',
  'acute', 'chronic', 'recurrent', 'primary', 'secondary', 'tertiary', 'latent',
  'early', 'late', 'congenital', 'acquired', 'idiopathic',
  'mild', 'moderate', 'severe', 'symptomatic', 'asymptomatic',
  'left', 'right', 'bilateral', 'lower', 'upper',
  'male', 'female', 'newborn', 'infant', 'juvenile',
  'type', 'class', 'stage', 'grade',
  'disease', 'disorder', 'syndrome', 'condition', 'infection',
  'fever', 'pain', 'complication', 'complications',
  'is', 'was', 'are', 'be', 'been', 'being',
  'r', 'l', 's', 'd', 'w', 'wo',
]);

// Curated map: matcher token (lowercase) → canonical parent metadata.
// Only conditions in this list will get parent rows inserted. Auto-discovery
// is informational only; insertion is hand-curated to avoid bad parent names.
const CURATED_PARENTS = [
  // ── Wave 1 (already inserted in DB) ──────────────────────────
  { matcher: 'syphilitic', properName: 'Syphilis', slug: 'syphilis', specialty: 'Infectious Disease' },
  { matcher: 'syphilis', properName: 'Syphilis', slug: 'syphilis', specialty: 'Infectious Disease' },
  { matcher: 'gonococcal', properName: 'Gonorrhea', slug: 'gonorrhea', specialty: 'Infectious Disease' },
  { matcher: 'chlamydial', properName: 'Chlamydia Infection', slug: 'chlamydia-infection', specialty: 'Infectious Disease' },
  { matcher: 'trichomonal', properName: 'Trichomoniasis', slug: 'trichomoniasis', specialty: 'Infectious Disease' },
  { matcher: 'trichomoniasis', properName: 'Trichomoniasis', slug: 'trichomoniasis', specialty: 'Infectious Disease' },
  { matcher: 'herpesviral', properName: 'Herpes Simplex Infection', slug: 'herpes-simplex-infection', specialty: 'Infectious Disease' },
  { matcher: 'salmonella', properName: 'Salmonella Infection', slug: 'salmonella-infection', specialty: 'Infectious Disease' },
  { matcher: 'typhoid', properName: 'Typhoid Fever', slug: 'typhoid-fever', specialty: 'Infectious Disease' },
  { matcher: 'paratyphoid', properName: 'Paratyphoid Fever', slug: 'paratyphoid-fever', specialty: 'Infectious Disease' },
  { matcher: 'amebic', properName: 'Amebiasis', slug: 'amebiasis', specialty: 'Infectious Disease' },
  { matcher: 'escherichia coli', properName: 'Escherichia coli Infection', slug: 'e-coli-infection', specialty: 'Infectious Disease' },
  { matcher: 'foodborne', properName: 'Foodborne Illness', slug: 'foodborne-illness', specialty: 'Infectious Disease' },
  { matcher: 'rotaviral', properName: 'Rotavirus Infection', slug: 'rotavirus-infection', specialty: 'Infectious Disease' },
  { matcher: 'adenoviral', properName: 'Adenovirus Infection', slug: 'adenovirus-infection', specialty: 'Infectious Disease' },
  { matcher: 'yaws', properName: 'Yaws', slug: 'yaws', specialty: 'Infectious Disease' },
  { matcher: 'brucell', properName: 'Brucellosis', slug: 'brucellosis-general', specialty: 'Infectious Disease' },
  { matcher: 'rickett', properName: 'Rickettsial Infection', slug: 'rickettsial-infection', specialty: 'Infectious Disease' },
  { matcher: 'typhus', properName: 'Typhus', slug: 'typhus', specialty: 'Infectious Disease' },
  { matcher: 'congenital syphilitic', properName: 'Congenital Syphilis', slug: 'congenital-syphilis', specialty: 'Infectious Disease' },

  // ── Wave 2 (next layer of parent injection) ───────────────────
  // Infectious Disease subtypes
  { matcher: 'tularemia', properName: 'Tularemia', slug: 'tularemia', specialty: 'Infectious Disease' },
  { matcher: 'anthrax', properName: 'Anthrax', slug: 'anthrax', specialty: 'Infectious Disease' },
  { matcher: 'melioidosis', properName: 'Melioidosis', slug: 'melioidosis', specialty: 'Infectious Disease' },
  { matcher: 'leprosy', properName: 'Leprosy', slug: 'leprosy', specialty: 'Infectious Disease' },
  { matcher: 'leishmaniasis', properName: 'Leishmaniasis (general)', slug: 'leishmaniasis-general', specialty: 'Infectious Disease' },
  { matcher: 'schistosomiasis', properName: 'Schistosomiasis (general)', slug: 'schistosomiasis-general', specialty: 'Infectious Disease' },
  { matcher: 'filariasis', properName: 'Filariasis (general)', slug: 'filariasis-general', specialty: 'Infectious Disease' },
  { matcher: 'plague', properName: 'Plague', slug: 'plague', specialty: 'Infectious Disease' },
  { matcher: 'cysticercosis', properName: 'Cysticercosis', slug: 'cysticercosis', specialty: 'Infectious Disease' },
  { matcher: 'echinococcosis', properName: 'Echinococcosis', slug: 'echinococcosis', specialty: 'Infectious Disease' },
  { matcher: 'trichinellosis', properName: 'Trichinellosis', slug: 'trichinellosis', specialty: 'Infectious Disease' },
  { matcher: 'cytomegaloviral', properName: 'Cytomegalovirus Infection', slug: 'cytomegalovirus-infection', specialty: 'Infectious Disease' },
  { matcher: 'cytomegalovirus', properName: 'Cytomegalovirus Infection', slug: 'cytomegalovirus-infection', specialty: 'Infectious Disease' },
  { matcher: 'norovirus', properName: 'Norovirus Infection', slug: 'norovirus-infection', specialty: 'Infectious Disease' },
  { matcher: 'mycobacterial', properName: 'Atypical Mycobacterial Infection', slug: 'atypical-mycobacterial-infection', specialty: 'Infectious Disease' },

  // Substance use disorders (these have huge ICD subtype families F10-F19)
  { matcher: 'alcohol dependence', properName: 'Alcohol Use Disorder', slug: 'alcohol-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'alcohol abuse', properName: 'Alcohol Use Disorder', slug: 'alcohol-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'opioid dependence', properName: 'Opioid Use Disorder', slug: 'opioid-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'opioid abuse', properName: 'Opioid Use Disorder', slug: 'opioid-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'cocaine dependence', properName: 'Cocaine Use Disorder', slug: 'cocaine-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'cocaine abuse', properName: 'Cocaine Use Disorder', slug: 'cocaine-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'cannabis dependence', properName: 'Cannabis Use Disorder', slug: 'cannabis-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'cannabis abuse', properName: 'Cannabis Use Disorder', slug: 'cannabis-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'nicotine dependence', properName: 'Nicotine Dependence (Tobacco Use Disorder)', slug: 'nicotine-dependence', specialty: 'Psychiatry' },
  { matcher: 'sedative dependence', properName: 'Sedative Use Disorder', slug: 'sedative-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'sedative abuse', properName: 'Sedative Use Disorder', slug: 'sedative-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'stimulant dependence', properName: 'Stimulant Use Disorder', slug: 'stimulant-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'stimulant abuse', properName: 'Stimulant Use Disorder', slug: 'stimulant-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'hallucinogen dependence', properName: 'Hallucinogen Use Disorder', slug: 'hallucinogen-use-disorder', specialty: 'Psychiatry' },
  { matcher: 'inhalant dependence', properName: 'Inhalant Use Disorder', slug: 'inhalant-use-disorder', specialty: 'Psychiatry' },

  // Endocrine families
  { matcher: 'thyroiditis', properName: 'Thyroiditis', slug: 'thyroiditis', specialty: 'Endocrinology' },
  { matcher: 'thyrotoxicosis', properName: 'Thyrotoxicosis', slug: 'thyrotoxicosis', specialty: 'Endocrinology' },
  { matcher: 'goiter', properName: 'Goiter', slug: 'goiter', specialty: 'Endocrinology' },
  { matcher: 'pituitary', properName: 'Pituitary Disorders', slug: 'pituitary-disorders', specialty: 'Endocrinology' },

  // Oncology family heads (broad cancer pages)
  { matcher: 'merkel cell carcinoma', properName: 'Merkel Cell Carcinoma', slug: 'merkel-cell-carcinoma', specialty: 'Oncology' },
  { matcher: 'kaposi', properName: "Kaposi's Sarcoma", slug: 'kaposi-sarcoma', specialty: 'Oncology' },
  { matcher: 'basal cell carcinoma', properName: 'Basal Cell Carcinoma', slug: 'basal-cell-carcinoma', specialty: 'Oncology' },
  { matcher: 'squamous cell carcinoma', properName: 'Squamous Cell Carcinoma', slug: 'squamous-cell-carcinoma', specialty: 'Oncology' },

  // Cardiology / vascular families
  { matcher: 'myocarditis', properName: 'Myocarditis (general)', slug: 'myocarditis-general', specialty: 'Cardiology' },
  { matcher: 'pericarditis', properName: 'Pericarditis', slug: 'pericarditis', specialty: 'Cardiology' },
  { matcher: 'endocarditis', properName: 'Endocarditis (general)', slug: 'endocarditis-general', specialty: 'Cardiology' },

  // ── Wave 3 (broader families with many ICD subtypes) ────────
  // Viral hepatitis families
  { matcher: 'viral hepatitis', properName: 'Viral Hepatitis', slug: 'viral-hepatitis', specialty: 'Infectious Disease' },
  { matcher: 'hepatitis a', properName: 'Hepatitis A', slug: 'hepatitis-a', specialty: 'Infectious Disease' },
  { matcher: 'hepatitis b', properName: 'Hepatitis B', slug: 'hepatitis-b', specialty: 'Infectious Disease' },
  { matcher: 'hepatitis c', properName: 'Hepatitis C', slug: 'hepatitis-c', specialty: 'Infectious Disease' },
  { matcher: 'hepatitis d', properName: 'Hepatitis D', slug: 'hepatitis-d', specialty: 'Infectious Disease' },
  { matcher: 'hepatitis e', properName: 'Hepatitis E', slug: 'hepatitis-e', specialty: 'Infectious Disease' },
  { matcher: 'hepatitis', properName: 'Hepatitis', slug: 'hepatitis-general', specialty: 'Infectious Disease' },

  // Influenza families
  { matcher: 'influenza', properName: 'Influenza', slug: 'influenza', specialty: 'Pulmonology' },

  // Major depressive / mood disorder subtypes
  { matcher: 'major depressive', properName: 'Major Depressive Disorder', slug: 'major-depressive-disorder', specialty: 'Psychiatry' },
  { matcher: 'persistent depressive', properName: 'Persistent Depressive Disorder (Dysthymia)', slug: 'persistent-depressive-disorder', specialty: 'Psychiatry' },
  { matcher: 'mood disorder', properName: 'Mood Disorder', slug: 'mood-disorder', specialty: 'Psychiatry' },

  // Personality disorder family (F60.x subtypes)
  { matcher: 'personality disorder', properName: 'Personality Disorder', slug: 'personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'paranoid personality', properName: 'Paranoid Personality Disorder', slug: 'paranoid-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'schizoid personality', properName: 'Schizoid Personality Disorder', slug: 'schizoid-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'schizotypal personality', properName: 'Schizotypal Personality Disorder', slug: 'schizotypal-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'antisocial personality', properName: 'Antisocial Personality Disorder', slug: 'antisocial-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'borderline personality', properName: 'Borderline Personality Disorder', slug: 'borderline-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'histrionic personality', properName: 'Histrionic Personality Disorder', slug: 'histrionic-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'narcissistic personality', properName: 'Narcissistic Personality Disorder', slug: 'narcissistic-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'avoidant personality', properName: 'Avoidant Personality Disorder', slug: 'avoidant-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'dependent personality', properName: 'Dependent Personality Disorder', slug: 'dependent-personality-disorder', specialty: 'Psychiatry' },
  { matcher: 'obsessive-compulsive personality', properName: 'Obsessive-Compulsive Personality Disorder (OCPD)', slug: 'obsessive-compulsive-personality-disorder', specialty: 'Psychiatry' },

  // Anxiety subtypes
  { matcher: 'phobia', properName: 'Specific Phobia', slug: 'specific-phobia', specialty: 'Psychiatry' },
  { matcher: 'social phobia', properName: 'Social Anxiety Disorder', slug: 'social-anxiety-disorder', specialty: 'Psychiatry' },
  { matcher: 'agoraphobia', properName: 'Agoraphobia', slug: 'agoraphobia', specialty: 'Psychiatry' },
  { matcher: 'panic disorder', properName: 'Panic Disorder', slug: 'panic-disorder', specialty: 'Psychiatry' },
  { matcher: 'obsessive-compulsive disorder', properName: 'Obsessive-Compulsive Disorder (OCD)', slug: 'obsessive-compulsive-disorder', specialty: 'Psychiatry' },
  { matcher: 'generalized anxiety', properName: 'Generalized Anxiety Disorder', slug: 'generalized-anxiety-disorder', specialty: 'Psychiatry' },

  // Diabetes subtypes (parent already done, but subtype-specific parents add value)
  { matcher: 'type 1 diabetes', properName: 'Type 1 Diabetes Mellitus', slug: 'type-1-diabetes-mellitus', specialty: 'Endocrinology' },
  { matcher: 'type 2 diabetes', properName: 'Type 2 Diabetes Mellitus', slug: 'type-2-diabetes-mellitus', specialty: 'Endocrinology' },
  { matcher: 'gestational diabetes', properName: 'Gestational Diabetes', slug: 'gestational-diabetes', specialty: 'Endocrinology' },

  // Hypertension subtypes
  { matcher: 'essential hypertension', properName: 'Essential Hypertension', slug: 'essential-hypertension', specialty: 'Cardiology' },
  { matcher: 'secondary hypertension', properName: 'Secondary Hypertension', slug: 'secondary-hypertension', specialty: 'Cardiology' },
  { matcher: 'pulmonary hypertension', properName: 'Pulmonary Hypertension', slug: 'pulmonary-hypertension-general', specialty: 'Cardiology' },

  // Conduct/behavioral disorders
  { matcher: 'conduct disorder', properName: 'Conduct Disorder', slug: 'conduct-disorder', specialty: 'Psychiatry' },
  { matcher: 'oppositional defiant', properName: 'Oppositional Defiant Disorder', slug: 'oppositional-defiant-disorder', specialty: 'Psychiatry' },

  // Autism spectrum
  { matcher: 'autism', properName: 'Autism Spectrum Disorder', slug: 'autism-spectrum-disorder', specialty: 'Psychiatry' },
  { matcher: 'asperger', properName: "Asperger's Syndrome", slug: 'aspergers-syndrome', specialty: 'Psychiatry' },

  // Carcinoma-in-situ family
  { matcher: 'carcinoma in situ', properName: 'Carcinoma In Situ', slug: 'carcinoma-in-situ', specialty: 'Oncology' },
  { matcher: 'melanoma in situ', properName: 'Melanoma In Situ', slug: 'melanoma-in-situ', specialty: 'Oncology' },
  { matcher: 'melanocytic nevi', properName: 'Melanocytic Nevi', slug: 'melanocytic-nevi', specialty: 'Dermatology' },

  // Mesothelioma + soft-tissue / mesenchymal
  { matcher: 'mesothelioma', properName: 'Mesothelioma (general)', slug: 'mesothelioma-general', specialty: 'Oncology' },
];
const KNOWN_PARENT_PHRASES = CURATED_PARENTS.map(p => p.matcher);

const subtypeMap = new Map(); // parentConcept -> [{slug, name}]
const allQueuedSlugs = new Set();

for (const f of fs.readdirSync(BATCH_DIR)) {
  if (!/^_batch-\d+\.json$/.test(f)) continue;
  const data = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, f), 'utf8'));
  for (const c of (data.conditions || [])) {
    allQueuedSlugs.add(c.slug);
    const nameLower = (c.canonicalName || c.name || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!nameLower) continue;
    for (const phrase of KNOWN_PARENT_PHRASES) {
      if (nameLower.includes(phrase)) {
        if (!subtypeMap.has(phrase)) subtypeMap.set(phrase, []);
        subtypeMap.get(phrase).push({ slug: c.slug, name: c.canonicalName || c.name });
      }
    }
  }
}

// (Auto-discovery from prefix-counts disabled — using curated CURATED_PARENTS list only)

// Check which parents already exist in the DB as clean slugs
const candidateParents = Array.from(subtypeMap.keys()).filter(k => k.length >= 4);
const existingMatches = await p.medicalCondition.findMany({
  where: {
    OR: candidateParents.map(k => ({
      commonName: { equals: k, mode: 'insensitive' },
    })),
  },
  select: { id: true, slug: true, commonName: true },
});
const existingSet = new Set(existingMatches.map(m => m.commonName.toLowerCase()));

const allDoneRows = await p.conditionPageContent.findMany({
  where: { languageCode: 'en', status: 'published', generationVersion: 'v2-hand-written-eeat' },
  include: { condition: { select: { slug: true, commonName: true } } },
});
const doneSlugs = new Set(allDoneRows.map(r => r.condition.slug));
const doneNames = new Set(allDoneRows.map(r => r.condition.commonName.toLowerCase()));

// Build the recommended parent list — group subtype hits per CURATED_PARENTS entry
const slugToInfo = new Map(); // proposed slug -> {properName, slug, specialty, subtypes:Set, matcher}
for (const cp of CURATED_PARENTS) {
  if (!slugToInfo.has(cp.slug)) {
    slugToInfo.set(cp.slug, {
      properName: cp.properName,
      slug: cp.slug,
      specialty: cp.specialty,
      subtypes: new Set(),
    });
  }
}
for (const [matcher, subs] of subtypeMap.entries()) {
  const cp = CURATED_PARENTS.find(p => p.matcher === matcher);
  if (!cp) continue;
  const entry = slugToInfo.get(cp.slug);
  for (const s of subs) entry.subtypes.add(s.name);
}

const missingParents = Array.from(slugToInfo.values())
  .map(e => ({
    parentConcept: e.properName.toLowerCase(),
    proposedSlug: e.slug,
    properName: e.properName,
    specialty: e.specialty,
    subtypeCount: e.subtypes.size,
    sampleSubtypes: Array.from(e.subtypes).slice(0, 4),
  }))
  .filter(m => m.subtypeCount >= 2) // need at least 2 subtypes to justify a parent
  .filter(m => !doneSlugs.has(m.proposedSlug))
  .filter(m => !doneNames.has(m.properName.toLowerCase()));

missingParents.sort((a, b) => b.subtypeCount - a.subtypeCount);

console.log('=== ORPHAN SUBTYPE ANALYSIS ===\n');
console.log(`Queued slugs analyzed: ${allQueuedSlugs.size}`);
console.log(`Already-written parents: ${doneSlugs.size}`);
console.log(`\nMissing parent concepts (≥3 subtypes each):\n`);

for (const m of missingParents.slice(0, 40)) {
  console.log(`  ${m.subtypeCount.toString().padStart(3)} subtypes → "${m.properName}" (proposed slug: ${m.proposedSlug})`);
  console.log(`        e.g. ${m.sampleSubtypes.slice(0, 3).join('; ')}`);
}

console.log(`\nTotal missing parents identified: ${missingParents.length}`);
const totalReachableSubtypes = missingParents.reduce((acc, m) => acc + m.subtypeCount, 0);
console.log(`Total subtypes that would be rescued via fallback: ${totalReachableSubtypes}`);
console.log(`Leverage ratio: 1 parent page rescues ${(totalReachableSubtypes / Math.max(missingParents.length, 1)).toFixed(1)} subtypes on average`);

if (!APPLY) {
  console.log('\n(Run with --apply to insert parent MedicalCondition rows and queue them)');
  await p.$disconnect();
  process.exit(0);
}

// --apply: insert parent rows + add to a new batch file
console.log('\n--apply mode: inserting parent MedicalCondition rows and queuing them\n');

// Find current max id so we can allocate IDs above the autoincrement sequence
// (the sequence is out of sync with the ICD-10 bulk-imported rows).
const maxIdRow = await p.$queryRaw`SELECT COALESCE(MAX(id), 0) AS max_id FROM medical_conditions`;
let nextId = Number(maxIdRow[0].max_id) + 1;
console.log(`Allocating IDs starting at ${nextId}\n`);

const newParentEntries = [];
for (const m of missingParents) {
  // Double-check the proposed slug isn't already taken
  const existing = await p.medicalCondition.findUnique({ where: { slug: m.proposedSlug } });
  if (existing) {
    console.log(`  SKIP "${m.properName}" — slug "${m.proposedSlug}" already exists (id=${existing.id})`);
    continue;
  }
  const created = await p.medicalCondition.create({
    data: {
      id: nextId++,
      slug: m.proposedSlug,
      commonName: m.properName,
      scientificName: m.properName,
      description: `Parent clinical concept for ${m.subtypeCount} ICD-10 subtype variants (e.g. ${m.sampleSubtypes.slice(0, 2).join(', ')}). Content covers the disease in general; specific ICD-coded variants serve via canonical fallback.`,
      specialistType: m.specialty,
      isActive: true,
      symptoms: [],
      treatments: [],
      faqs: [],
    },
  });
  const specialty = m.specialty;
  console.log(`  ✓ Inserted parent "${m.properName}" as slug "${m.proposedSlug}" (id=${created.id}) — covers ${m.subtypeCount} subtypes`);
  newParentEntries.push({
    slug: m.proposedSlug,
    tier: 1,
    specialty,
    variantCount: m.subtypeCount,
    canonicalName: m.properName,
  });
}

// Find the next batch number
const batches = fs.readdirSync(BATCH_DIR).filter(f => /^_batch-\d+\.json$/.test(f));
const nums = batches.map(f => parseInt(f.match(/^_batch-(\d+)\.json$/)[1], 10));
const nextBatchNum = nums.length ? Math.max(...nums) + 1 : 1;
const batchLabel = String(nextBatchNum).padStart(3, '0');
const batchFile = path.join(BATCH_DIR, `_batch-${batchLabel}.json`);

const batchOut = {
  generatedAt: new Date().toISOString(),
  batchSize: newParentEntries.length,
  source: 'parent-injection',
  description: 'Parent clinical concepts inserted to consolidate fallback content for ICD subtype variants',
  conditions: newParentEntries,
};
fs.writeFileSync(batchFile, JSON.stringify(batchOut, null, 2));
console.log(`\n✓ Wrote batch ${batchLabel} with ${newParentEntries.length} parent slots: ${path.relative('/Users/taps/Desktop/Aihealz', batchFile)}`);

// Append to _assignments.md
const assignmentsPath = path.join(BATCH_DIR, '_assignments.md');
const existing = fs.readFileSync(assignmentsPath, 'utf8');
const rulesIdx = existing.indexOf('## Rules');
const newRows = newParentEntries.map(c =>
  `| ${c.slug} | 1 | ${c.specialty} | (open) | — | open | Batch ${batchLabel} (parent-injection), rescues ${c.variantCount} subtypes |`
).join('\n');
const batchSection = `\n\n<!-- BATCH ${batchLabel} (parent-injection) — ${newParentEntries.length} parent concepts, ${newParentEntries.reduce((a,c) => a+c.variantCount, 0)} subtypes rescued -->\n${newRows}\n`;
const updated = rulesIdx > 0
  ? existing.slice(0, rulesIdx) + batchSection + '\n' + existing.slice(rulesIdx)
  : existing + batchSection;
fs.writeFileSync(assignmentsPath, updated);
console.log(`✓ Appended ${newParentEntries.length} rows to _assignments.md`);

// Bump the autoincrement sequence to our new max so future Prisma inserts work
await p.$executeRaw`SELECT setval('medical_conditions_id_seq', ${nextId - 1}, true)`;
console.log(`✓ Reset medical_conditions_id_seq to ${nextId - 1}`);

await p.$disconnect();
