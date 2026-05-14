# WS1 Condition Content Generation Spec

You are writing tier-1 EEAT medical content for aihealz.com. This file is the
complete spec — follow it exactly. You will be given a list of condition slugs.

## Output per slug
Write `/Users/taps/Desktop/Aihealz/docs/conditions-content/<slug>.json`, then run:
```
cd /Users/taps/Desktop/Aihealz && node scripts/insert-condition-content.mjs <slug> --status=draft
```
If validation fails, fix the JSON and re-run until you see `✓ CREATED` or `✓ UPDATED`.

## Reference — READ FIRST
- `/Users/taps/Desktop/Aihealz/docs/conditions-content/uti.json` — APPROVED gold-standard example. Match its structure, field set, depth, and voice exactly.
- `/Users/taps/Desktop/Aihealz/docs/conditions-content/kidney-stones.json` — second approved example.

## Get each condition's data
Before writing, look up the condition's real name, ICD code, and specialty:
```
/opt/homebrew/opt/postgresql@16/bin/psql "postgresql://taps:taps@localhost:5432/aihealz" -t -A -F'|' -c "SELECT slug, common_name, scientific_name, icd_code, specialist_type, body_system FROM medical_conditions WHERE slug='<slug>';"
```

## JSON schema — exact field set (copy from uti.json)
`_meta, h1Title, specialistType, heroOverview, keyStats, definition, typesClassification, primarySymptoms, earlyWarningSigns, emergencySigns, causes, riskFactors, affectedDemographics, diagnosisOverview, diagnosticTests, treatmentOverview, medicalTreatments, surgicalOptions, alternativeTreatments, whySeeSpecialist, doctorSelectionGuide, preventionStrategies, lifestyleModifications, dietRecommendations, exerciseGuidelines, dailyManagement, prognosis, recoveryTimeline, complications, supportResources, sources, confusedWithConditions, coOccurringConditions, relatedConditions, linkedTreatmentSlugs, faqs, simpleName, regionalNames, searchTags, symptomKeywords, metaTitle, metaDescription, keywords, lastReviewed, images`
Set `_meta` = `{ "slug": "<slug>", "writtenBy": "ws1-sonnet-wave", "writtenAt": "2026-05-15" }`, `lastReviewed` = "2026-05-15", `images` = [], `linkedTreatmentSlugs` = [].

## HARD validation rules (insert script rejects otherwise)
- Total word count ≥ 2,500 — aim 3,000-5,000.
- heroOverview ≥ 80 words; definition ≥ 150; diagnosisOverview ≥ 150; treatmentOverview ≥ 200; prognosis ≥ 100.
- primarySymptoms ≥ 6 (write 8-12); causes ≥ 4 (5-8, each `{cause, description}` with 30-60 word mechanism); riskFactors ≥ 5 (6-10, each `{factor, category, description}`, category ∈ modifiable|non-modifiable|genetic|environmental); diagnosticTests ≥ 4 (5-7, each `{test, purpose, whatToExpect}`); medicalTreatments ≥ 3 (4-8, each `{name, description, effectiveness}` — effectiveness MUST contain a number); complications ≥ 3 (4-6 plain strings); faqs 18-22 with ≥12 having `schemaEligible: true` (schema-eligible answers must be <300 chars, no markdown); sources ≥ 5 (write 6-8 REAL ones); relatedConditions ≥ 2; confusedWithConditions ≥ 2.
- `surgicalOptions`: `[{name, description, successRate}]` if applicable, else `[]`.
- metaTitle ≤ 60 chars: `<Condition>: Symptoms, Causes & Treatment | aihealz` (shorten the descriptor if needed to fit).
- metaDescription EXACTLY 140-160 chars — count characters.
- `sources`: `{ "title": "...≥10 chars", "url": "https://...", "accessedDate": "2026-05-15" }`. Use REAL stable URLs you are confident exist: PubMed (`pubmed.ncbi.nlm.nih.gov/<PMID>/` for landmark papers you actually know), major guidelines (NICE, WHO, CDC, IDSA, AHA/ACC, etc.), and institutional pages (nih.gov, niddk.nih.gov, ninds.nih.gov, nhs.uk, who.int, cdc.gov, cochrane). Do NOT invent PMIDs — if unsure, use a guideline or institutional URL instead. NOT acceptable: WebMD, Healthline, Wikipedia, forums.

## Voice
Editorial-medical, calm, plain-English, like Mayo Clinic patient pages. Present tense for facts. Numbers over adjectives ("affects 4% of adults" not "is common"). The heroOverview's first sentence must be a concrete scoped fact about THIS condition — its mechanism, prevalence, or what differentiates it.

BANNED phrases (validator scans — never use): "in today's world", "have you ever", "it is important to note", "it is worth mentioning", "navigate the complexities", "a holistic approach", "comprehensive approach", "tapestry", "delve into", "in conclusion", "to summarize". No template openers ("X is a serious medical condition", "Understanding X is crucial", "X is a complex condition that affects millions").

## Internal-link slugs MUST exist in the DB
`relatedConditions`, `confusedWithConditions`, `coOccurringConditions` slugs must exist in `medical_conditions` or the insert fails. Verify candidates first:
```
/opt/homebrew/opt/postgresql@16/bin/psql "postgresql://taps:taps@localhost:5432/aihealz" -t -A -c "SELECT slug FROM medical_conditions WHERE slug IN ('cand1','cand2',...);"
```
Brainstorm 8-12 plausible related/confused/co-occurring conditions, query them, and use only the ones that come back (need ≥2-3 per field). If too few return, query broader with `ILIKE '%keyword%'` and pick the cleanest real slug. Slugs may carry ICD suffixes (e.g. `primary-hyperparathyroidism-e210`) — that's fine, use them as returned.

## Accuracy
This is YMYL content — every number must be defensible against the medical literature. Use established guideline ranges rather than inventing precision. If you are not confident of an exact statistic, state a well-known range and attribute it to a guideline body.

## Report when done
Per slug: final word count, FAQ count (and schema-eligible count), source count, and insert result (`✓ CREATED`/`✓ UPDATED` or the validation error if it could not be fixed).
