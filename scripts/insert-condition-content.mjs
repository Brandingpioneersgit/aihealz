// Inserts (or updates) ConditionPageContent for a single condition, validating
// the JSON payload against the EEAT/SEO guidelines in
// docs/condition-content-guidelines.md.
//
// Usage:
//   node scripts/insert-condition-content.mjs <condition-slug>
//
// Reads:
//   docs/conditions-content/<slug>.json
//   docs/editorial-reviewer.json
//
// Writes:
//   Upserts row in condition_page_content (languageCode='en', status='published')
//   Upserts row in condition_reviewers (isPrimary=true)
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/insert-condition-content.mjs <condition-slug> [--status=ai_draft|published]');
  process.exit(1);
}

// Content status. Default `published` keeps legacy single-page usage working;
// bulk WS1 generation passes --status=draft so pages stay noindex until a
// human reviewer promotes them to `published`. Valid values are the
// ConditionPageStatus enum: draft | review | published | archived.
const statusArg = (process.argv.find(a => a.startsWith('--status=')) || '').split('=')[1];
// Back-compat: callers may pass the LocalizedContent-style "ai_draft" — map it.
const STATUS_ALIASES = { ai_draft: 'draft', needs_review: 'review' };
const CONTENT_STATUS = STATUS_ALIASES[statusArg] || statusArg || 'published';
if (!['draft', 'review', 'published', 'archived'].includes(CONTENT_STATUS)) {
  console.error(`Invalid --status: ${statusArg} (valid: draft | review | published | archived)`);
  process.exit(1);
}

const ROOT = process.cwd();
const contentPath = path.join(ROOT, 'docs/conditions-content', `${slug}.json`);
const reviewerPath = path.join(ROOT, 'docs/editorial-reviewer.json');

if (!fs.existsSync(contentPath)) {
  console.error(`Content file not found: ${contentPath}`);
  process.exit(1);
}
if (!fs.existsSync(reviewerPath)) {
  console.error(`Reviewer file not found: ${reviewerPath}. Run scripts/seed-editorial-reviewer.mjs first.`);
  process.exit(1);
}

const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const reviewerInfo = JSON.parse(fs.readFileSync(reviewerPath, 'utf8'));

// ─── Validate payload against guidelines ─────────────────────────
const errors = [];

function countWords(s) {
  if (!s) return 0;
  if (typeof s !== 'string') return 0;
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function totalWordCount(payload) {
  let total = 0;
  const stringFields = [
    'h1Title', 'heroOverview', 'definition', 'diagnosisOverview',
    'treatmentOverview', 'whySeeSpecialist', 'doctorSelectionGuide',
    'insuranceGuide', 'financialAssistance', 'exerciseGuidelines',
    'prognosis', 'recoveryTimeline', 'metaTitle', 'metaDescription',
  ];
  for (const f of stringFields) total += countWords(payload[f]);

  // Array of strings
  for (const f of ['primarySymptoms', 'earlyWarningSigns', 'emergencySigns', 'affectedDemographics',
                    'hospitalCriteria', 'keyFacilities', 'preventionStrategies', 'lifestyleModifications',
                    'dailyManagement', 'complications', 'keywords', 'searchTags', 'symptomKeywords']) {
    if (Array.isArray(payload[f])) for (const s of payload[f]) total += countWords(s);
  }

  // Array of objects with description/answer/etc.
  for (const item of (payload.causes || [])) total += countWords(item.cause) + countWords(item.description);
  for (const item of (payload.riskFactors || [])) total += countWords(item.factor) + countWords(item.description);
  for (const item of (payload.diagnosticTests || [])) total += countWords(item.test) + countWords(item.purpose) + countWords(item.whatToExpect);
  for (const item of (payload.medicalTreatments || [])) total += countWords(item.name) + countWords(item.description) + countWords(item.effectiveness);
  for (const item of (payload.surgicalOptions || [])) total += countWords(item.name) + countWords(item.description) + countWords(item.successRate);
  for (const item of (payload.alternativeTreatments || [])) total += countWords(item.name) + countWords(item.description);
  for (const item of (payload.typesClassification || [])) total += countWords(item.type) + countWords(item.description);
  for (const item of (payload.faqs || [])) total += countWords(item.question) + countWords(item.answer);
  for (const item of (payload.confusedWithConditions || [])) total += countWords(item.name) + countWords(item.keyDifference);

  if (payload.dietRecommendations) {
    for (const s of (payload.dietRecommendations.recommended || [])) total += countWords(s);
    for (const s of (payload.dietRecommendations.avoid || [])) total += countWords(s);
  }
  return total;
}

const wordCount = totalWordCount(content);
if (wordCount < 2500) errors.push(`Word count ${wordCount} < 2,500 (guidelines section 2)`);

if (!content.heroOverview || countWords(content.heroOverview) < 80) errors.push('heroOverview < 80 words');
if (!content.definition || countWords(content.definition) < 150) errors.push('definition < 150 words');
if (!content.diagnosisOverview || countWords(content.diagnosisOverview) < 150) errors.push('diagnosisOverview < 150 words');
if (!content.treatmentOverview || countWords(content.treatmentOverview) < 200) errors.push('treatmentOverview < 200 words');
if (!content.prognosis || countWords(content.prognosis) < 100) errors.push('prognosis < 100 words');

if (!Array.isArray(content.primarySymptoms) || content.primarySymptoms.length < 6) errors.push('primarySymptoms < 6 items');
if (!Array.isArray(content.causes) || content.causes.length < 4) errors.push('causes < 4 items');
if (!Array.isArray(content.riskFactors) || content.riskFactors.length < 5) errors.push('riskFactors < 5 items');
if (!Array.isArray(content.diagnosticTests) || content.diagnosticTests.length < 4) errors.push('diagnosticTests < 4 items');
if (!Array.isArray(content.medicalTreatments) || content.medicalTreatments.length < 3) errors.push('medicalTreatments < 3 items');
if (!Array.isArray(content.complications) || content.complications.length < 3) errors.push('complications < 3 items');
if (!Array.isArray(content.faqs) || content.faqs.length < 12) errors.push('faqs < 12 items');
if (!Array.isArray(content.sources) || content.sources.length < 5) errors.push('sources < 5 items (need real PubMed/guideline citations)');
if (!Array.isArray(content.relatedConditions) || content.relatedConditions.length < 2) errors.push('relatedConditions < 2 items');
if (!Array.isArray(content.confusedWithConditions) || content.confusedWithConditions.length < 2) errors.push('confusedWithConditions < 2 items');

// Banned phrases scan
const BANNED = [
  "in today's world",
  'have you ever',
  'it is important to note',
  'it is worth mentioning',
  'navigate the complexities',
  'a holistic approach',
  'comprehensive approach',
  'tapestry',
  'delve into',
  'in conclusion',
  'to summarize',
];
const allText = [
  content.heroOverview, content.definition, content.diagnosisOverview,
  content.treatmentOverview, content.prognosis,
  ...((content.faqs || []).map(f => f.answer)),
].filter(Boolean).join(' ').toLowerCase();
for (const phrase of BANNED) {
  if (allText.includes(phrase)) errors.push(`Banned phrase used: "${phrase}"`);
}

// Meta tag length
if (!content.metaTitle || content.metaTitle.length > 60) errors.push(`metaTitle length ${content.metaTitle?.length} > 60`);
if (!content.metaDescription || content.metaDescription.length < 140 || content.metaDescription.length > 160)
  errors.push(`metaDescription length ${content.metaDescription?.length} not in 140-160 (DB column varchar(160))`);

// Sources must be real URLs
for (const src of (content.sources || [])) {
  if (!src.url || !/^https?:\/\//.test(src.url)) errors.push(`Source "${src.title}" has invalid URL: ${src.url}`);
  if (!src.title || src.title.length < 10) errors.push(`Source has weak title: "${src.title}"`);
}

// FAQs: at least 12 schemaEligible
const schemaEligibleFaqs = (content.faqs || []).filter(f => f.schemaEligible);
if (schemaEligibleFaqs.length < 12) errors.push(`schemaEligible FAQs ${schemaEligibleFaqs.length} < 12`);

if (errors.length > 0) {
  console.error('VALIDATION FAILED for', slug, ':');
  for (const e of errors) console.error('  -', e);
  console.error(`\nTotal word count: ${wordCount}`);
  process.exit(1);
}

console.log(`✓ Validation passed for ${slug}`);
console.log(`  Word count: ${wordCount}`);
console.log(`  FAQs: ${content.faqs.length} (${schemaEligibleFaqs.length} schema-eligible)`);
console.log(`  Sources: ${content.sources.length}`);

// ─── DB upsert ──────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

const condition = await p.medicalCondition.findUnique({ where: { slug } });
if (!condition) {
  console.error(`MedicalCondition with slug "${slug}" not found in DB`);
  process.exit(1);
}

// Validate internal-link slug references
const referencedSlugs = new Set();
for (const item of (content.relatedConditions || [])) referencedSlugs.add(item.slug);
for (const item of (content.confusedWithConditions || [])) referencedSlugs.add(item.slug);
for (const item of (content.coOccurringConditions || [])) referencedSlugs.add(item.slug);
if (referencedSlugs.size > 0) {
  const found = await p.medicalCondition.findMany({
    where: { slug: { in: Array.from(referencedSlugs) } },
    select: { slug: true },
  });
  const foundSet = new Set(found.map(f => f.slug));
  const missing = Array.from(referencedSlugs).filter(s => !foundSet.has(s));
  if (missing.length > 0) {
    console.error('Referenced slugs not found in MedicalCondition:', missing);
    process.exit(1);
  }
}

// Build schema markup if not pre-built
const schemaMedicalCondition = content.schemaMedicalCondition || {
  '@context': 'https://schema.org',
  '@type': 'MedicalCondition',
  name: condition.commonName,
  alternateName: condition.scientificName !== condition.commonName ? condition.scientificName : undefined,
  description: content.heroOverview,
  code: condition.icdCode ? { '@type': 'MedicalCode', code: condition.icdCode, codingSystem: 'ICD-10' } : undefined,
  signOrSymptom: (content.primarySymptoms || []).map(s => ({ '@type': 'MedicalSignOrSymptom', name: s })),
  cause: (content.causes || []).map(c => ({ '@type': 'MedicalCause', name: c.cause, description: c.description })),
  riskFactor: (content.riskFactors || []).map(r => ({ '@type': 'MedicalRiskFactor', name: r.factor })),
  possibleTreatment: (content.medicalTreatments || []).map(t => ({ '@type': 'MedicalTherapy', name: t.name, description: t.description })),
  reviewedBy: {
    '@type': 'Person',
    name: reviewerInfo.reviewerName,
    url: `https://aihealz.com/doctor/${reviewerInfo.reviewerSlug}`,
  },
  lastReviewed: content.lastReviewed || new Date().toISOString().split('T')[0],
};

const schemaFaqPage = content.schemaFaqPage || {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: schemaEligibleFaqs.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

const existing = await p.conditionPageContent.findUnique({
  where: { conditionId_languageCode: { conditionId: condition.id, languageCode: 'en' } },
});

const dataPayload = {
  conditionId: condition.id,
  languageCode: 'en',
  h1Title: content.h1Title,
  heroOverview: content.heroOverview,
  keyStats: content.keyStats || null,
  definition: content.definition,
  typesClassification: content.typesClassification || null,
  primarySymptoms: content.primarySymptoms,
  earlyWarningSigns: content.earlyWarningSigns || null,
  emergencySigns: content.emergencySigns || null,
  causes: content.causes,
  riskFactors: content.riskFactors,
  affectedDemographics: content.affectedDemographics || null,
  diagnosisOverview: content.diagnosisOverview,
  diagnosticTests: content.diagnosticTests,
  treatmentOverview: content.treatmentOverview,
  medicalTreatments: content.medicalTreatments,
  surgicalOptions: content.surgicalOptions || null,
  alternativeTreatments: content.alternativeTreatments || null,
  linkedTreatmentSlugs: content.linkedTreatmentSlugs || null,
  specialistType: content.specialistType || condition.specialistType,
  whySeeSpecialist: content.whySeeSpecialist || null,
  doctorSelectionGuide: content.doctorSelectionGuide || null,
  hospitalCriteria: content.hospitalCriteria || null,
  keyFacilities: content.keyFacilities || null,
  costBreakdown: content.costBreakdown || null,
  insuranceGuide: content.insuranceGuide || null,
  financialAssistance: content.financialAssistance || null,
  preventionStrategies: content.preventionStrategies || null,
  lifestyleModifications: content.lifestyleModifications || null,
  dietRecommendations: content.dietRecommendations || null,
  exerciseGuidelines: content.exerciseGuidelines || null,
  dailyManagement: content.dailyManagement || null,
  prognosis: content.prognosis,
  recoveryTimeline: content.recoveryTimeline || null,
  complications: content.complications,
  supportResources: content.supportResources || null,
  confusedWithConditions: content.confusedWithConditions,
  coOccurringConditions: content.coOccurringConditions || null,
  relatedConditions: content.relatedConditions,
  faqs: content.faqs,
  simpleName: content.simpleName || null,
  regionalNames: content.regionalNames || null,
  searchTags: content.searchTags || null,
  symptomKeywords: content.symptomKeywords || null,
  metaTitle: content.metaTitle,
  metaDescription: content.metaDescription,
  canonicalUrl: `https://aihealz.com/us/en/${slug}`,
  keywords: content.keywords || null,
  reviewedByDoctorId: reviewerInfo.reviewerDoctorId,
  lastReviewed: new Date(content.lastReviewed || new Date().toISOString().split('T')[0]),
  sources: content.sources,
  schemaMedicalCondition,
  schemaFaqPage,
  status: CONTENT_STATUS,
  qualityScore: 0.95,
  wordCount,
  generationVersion: 'v2-hand-written-eeat',
};

if (existing) {
  await p.conditionPageContent.update({ where: { id: existing.id }, data: dataPayload });
  console.log(`✓ UPDATED condition_page_content row id=${existing.id} for slug=${slug}`);
} else {
  const created = await p.conditionPageContent.create({ data: dataPayload });
  console.log(`✓ CREATED condition_page_content row id=${created.id} for slug=${slug}`);
}

// Upsert ConditionReviewer (isPrimary=true, geographyId=null for global)
const existingReviewer = await p.conditionReviewer.findFirst({
  where: { conditionId: condition.id, doctorId: reviewerInfo.reviewerDoctorId, geographyId: null },
});
if (existingReviewer) {
  await p.conditionReviewer.update({
    where: { id: existingReviewer.id },
    data: { isPrimary: true, reviewDate: new Date() },
  });
  console.log(`✓ Updated ConditionReviewer id=${existingReviewer.id}`);
} else {
  const cr = await p.conditionReviewer.create({
    data: {
      conditionId: condition.id,
      doctorId: reviewerInfo.reviewerDoctorId,
      geographyId: null,
      isPrimary: true,
      reviewDate: new Date(),
    },
  });
  console.log(`✓ Created ConditionReviewer id=${cr.id}`);
}

// ─── Upsert MediaAsset rows from images[] ─────────────────────
if (Array.isArray(content.images) && content.images.length > 0) {
  // Deactivate existing assets for this condition before re-inserting
  await p.mediaAsset.updateMany({
    where: { conditionSlug: slug, entityType: 'condition' },
    data: { isActive: false },
  });

  let imageCount = 0;
  for (const img of content.images) {
    if (!img.sourceUrl && !img.cdnUrl) continue;
    if (!img.altText || img.altText.length < 10) {
      console.warn(`  ⚠ Skipping image with weak altText: ${img.sourceUrl || img.cdnUrl}`);
      continue;
    }
    await p.mediaAsset.create({
      data: {
        conditionSlug: slug,
        entityId: condition.id,
        entityType: 'condition',
        // assetType identifies the role: 'feature' (hero), 'anatomy', 'clinical-photo',
        // 'diagnostic', 'treatment', 'comparison'. The page template uses this to
        // place images contextually. 'render' kept as the legacy hero fallback.
        assetType: img.assetType || 'feature',
        sourceUrl: img.sourceUrl || null,
        cdnUrl: img.cdnUrl || null,
        thumbnailUrl: img.thumbnailUrl || null,
        width: img.width || null,
        height: img.height || null,
        altText: img.altText,
        stylePreset: 'curated-external',
        // section + caption + license + credit don't have dedicated columns
        // yet; serialize them into promptUsed (a text field). The content
        // engine deserializes this back into a structured shape.
        promptUsed: JSON.stringify({
          section: img.section || null,
          caption: img.caption || null,
          license: img.license || null,
          credit: img.credit || null,
        }),
        generationApi: 'curated-external',
        isActive: true,
      },
    });
    imageCount++;
  }
  console.log(`✓ Wrote ${imageCount} MediaAsset rows for slug=${slug}`);
} else {
  console.log(`  (no images in JSON — skipping MediaAsset writes)`);
}

console.log(`\n→ Verify: http://localhost:3000/us/en/${slug}`);

await p.$disconnect();
