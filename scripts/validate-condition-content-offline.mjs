// Standalone JSON-only validator. Mirrors all checks in
// scripts/insert-condition-content.mjs that run BEFORE the DB calls.
// Usage:
//   node scripts/validate-condition-content-offline.mjs <slug-or-file> [...more]
// Or pass `--all` to validate every *.json in docs/conditions-content/
// that isn't a `_batch`/`_TEMPLATE`/`_priority_queue`/`_assignments` file.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'docs/conditions-content');

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

const countWords = (s) => (!s || typeof s !== 'string') ? 0 : s.trim().split(/\s+/).filter(Boolean).length;

function totalWordCount(p) {
  let t = 0;
  for (const f of ['h1Title','heroOverview','definition','diagnosisOverview','treatmentOverview','whySeeSpecialist','doctorSelectionGuide','insuranceGuide','financialAssistance','exerciseGuidelines','prognosis','recoveryTimeline','metaTitle','metaDescription']) t += countWords(p[f]);
  for (const f of ['primarySymptoms','earlyWarningSigns','emergencySigns','affectedDemographics','hospitalCriteria','keyFacilities','preventionStrategies','lifestyleModifications','dailyManagement','complications','keywords','searchTags','symptomKeywords']) if (Array.isArray(p[f])) for (const s of p[f]) t += countWords(s);
  for (const x of (p.causes||[])) t += countWords(x.cause)+countWords(x.description);
  for (const x of (p.riskFactors||[])) t += countWords(x.factor)+countWords(x.description);
  for (const x of (p.diagnosticTests||[])) t += countWords(x.test)+countWords(x.purpose)+countWords(x.whatToExpect);
  for (const x of (p.medicalTreatments||[])) t += countWords(x.name)+countWords(x.description)+countWords(x.effectiveness);
  for (const x of (p.surgicalOptions||[])) t += countWords(x.name)+countWords(x.description)+countWords(x.successRate);
  for (const x of (p.alternativeTreatments||[])) t += countWords(x.name)+countWords(x.description);
  for (const x of (p.typesClassification||[])) t += countWords(x.type)+countWords(x.description);
  for (const x of (p.faqs||[])) t += countWords(x.question)+countWords(x.answer);
  for (const x of (p.confusedWithConditions||[])) t += countWords(x.name)+countWords(x.keyDifference);
  if (p.dietRecommendations) {
    for (const s of (p.dietRecommendations.recommended||[])) t += countWords(s);
    for (const s of (p.dietRecommendations.avoid||[])) t += countWords(s);
  }
  return t;
}

function validate(slug, content) {
  const errors = [];
  const wc = totalWordCount(content);
  if (wc < 2500) errors.push(`Word count ${wc} < 2,500`);
  if (!content.heroOverview || countWords(content.heroOverview) < 80) errors.push('heroOverview < 80 words');
  if (!content.definition || countWords(content.definition) < 150) errors.push('definition < 150 words');
  if (!content.diagnosisOverview || countWords(content.diagnosisOverview) < 150) errors.push('diagnosisOverview < 150 words');
  if (!content.treatmentOverview || countWords(content.treatmentOverview) < 200) errors.push('treatmentOverview < 200 words');
  if (!content.prognosis || countWords(content.prognosis) < 100) errors.push('prognosis < 100 words');
  if (!Array.isArray(content.primarySymptoms) || content.primarySymptoms.length < 6) errors.push('primarySymptoms < 6');
  if (!Array.isArray(content.causes) || content.causes.length < 4) errors.push('causes < 4');
  if (!Array.isArray(content.riskFactors) || content.riskFactors.length < 5) errors.push('riskFactors < 5');
  if (!Array.isArray(content.diagnosticTests) || content.diagnosticTests.length < 4) errors.push('diagnosticTests < 4');
  if (!Array.isArray(content.medicalTreatments) || content.medicalTreatments.length < 3) errors.push('medicalTreatments < 3');
  if (!Array.isArray(content.complications) || content.complications.length < 3) errors.push('complications < 3');
  if (!Array.isArray(content.faqs) || content.faqs.length < 12) errors.push('faqs < 12');
  if (!Array.isArray(content.sources) || content.sources.length < 5) errors.push('sources < 5');
  if (!Array.isArray(content.relatedConditions) || content.relatedConditions.length < 2) errors.push('relatedConditions < 2');
  if (!Array.isArray(content.confusedWithConditions) || content.confusedWithConditions.length < 2) errors.push('confusedWithConditions < 2');

  const allText = [content.heroOverview, content.definition, content.diagnosisOverview, content.treatmentOverview, content.prognosis, ...((content.faqs||[]).map(f=>f.answer))].filter(Boolean).join(' ').toLowerCase();
  for (const phrase of BANNED) if (allText.includes(phrase)) errors.push(`Banned phrase: "${phrase}"`);

  if (!content.metaTitle || content.metaTitle.length > 60) errors.push(`metaTitle length ${content.metaTitle?.length} > 60`);
  if (!content.metaDescription || content.metaDescription.length < 140 || content.metaDescription.length > 160) errors.push(`metaDescription length ${content.metaDescription?.length} not in 140-160`);

  for (const src of (content.sources||[])) {
    if (!src.url || !/^https?:\/\//.test(src.url)) errors.push(`Source bad URL: "${src.title}" → ${src.url}`);
    if (!src.title || src.title.length < 10) errors.push(`Source weak title: "${src.title}"`);
  }

  const schemaEligibleFaqs = (content.faqs||[]).filter(f => f.schemaEligible);
  if (schemaEligibleFaqs.length < 12) errors.push(`schemaEligible FAQs ${schemaEligibleFaqs.length} < 12`);

  return { wc, errors, faqs: (content.faqs||[]).length, schemaEligible: schemaEligibleFaqs.length, sources: (content.sources||[]).length };
}

let targets = process.argv.slice(2);
if (targets.length === 0) { console.error('Usage: node scripts/validate-condition-content-offline.mjs <slug|file> [...]  or --all'); process.exit(1); }
if (targets.includes('--all')) {
  targets = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => f.replace('.json',''));
}

const failed = [];
const passed = [];
for (const t of targets) {
  const slug = t.replace(/\.json$/, '').replace(/^docs\/conditions-content\//, '');
  const file = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(file)) { failed.push({ slug, errors: [`File not found: ${file}`] }); continue; }
  let content;
  try { content = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { failed.push({ slug, errors: [`JSON parse error: ${e.message}`] }); continue; }
  const r = validate(slug, content);
  if (r.errors.length === 0) {
    passed.push({ slug, wc: r.wc, faqs: r.faqs, sources: r.sources });
    console.log(`✓ ${slug}  ${r.wc}w  ${r.faqs}FAQs (${r.schemaEligible}sch)  ${r.sources}src`);
  } else {
    failed.push({ slug, errors: r.errors, wc: r.wc });
    console.log(`✗ ${slug}  errors=${r.errors.length}  wc=${r.wc}`);
    for (const e of r.errors) console.log(`    - ${e}`);
  }
}

console.log(`\nPassed: ${passed.length}/${targets.length}  Failed: ${failed.length}`);
if (failed.length > 0) process.exit(1);
