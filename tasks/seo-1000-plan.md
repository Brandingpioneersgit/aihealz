# Reach 1,000 SEO-optimized condition pages

**Status:** 384 done → need 616 more. 30 agents per wave, ~21 waves.

## Approach
- Each agent writes ONE condition's JSON to `docs/conditions-content/<slug>.json`
- JSON must pass `scripts/insert-condition-content.mjs` validator (≥2,500 words, 12 FAQs, 5+ real PubMed sources, no banned phrases, meta lengths)
- Gold-standard template: `docs/conditions-content/gout.json`
- Orchestrator (me) bulk-commits after each wave, then launches next

## Validator hard rules (cribbed from scripts/insert-condition-content.mjs)
- Total word count ≥ 2,500
- heroOverview ≥ 80 words; definition ≥ 150; diagnosisOverview ≥ 150; treatmentOverview ≥ 200; prognosis ≥ 100
- primarySymptoms ≥ 6 items; causes ≥ 4; riskFactors ≥ 5; diagnosticTests ≥ 4; medicalTreatments ≥ 3
- complications ≥ 3; faqs ≥ 12 with ≥ 12 schemaEligible; sources ≥ 5 (real URLs, titles ≥ 10 chars)
- relatedConditions ≥ 2; confusedWithConditions ≥ 2
- metaTitle ≤ 60 chars; metaDescription 140-160 chars (exclusive of 160)
- Banned phrases scanned: "in today's world", "have you ever", "it is important to note", "it is worth mentioning", "navigate the complexities", "a holistic approach", "comprehensive approach", "tapestry", "delve into", "in conclusion", "to summarize"

## Wave 1 slugs (30)
obstructed-labor · chronic-gout · burn · anaphylactic-reaction · cerebral-infarction · arthritis · complete-loss-of-teeth · partial-loss-of-teeth · thrombosis · fibrosis · hemorrhage · embolism · sepsis · influenza · acute-bronchitis · irritant-contact-dermatitis · enophthalmos · congenital-pneumonia · neonatal-jaundice · hypotony-of-eye · epiphora · sepsis-of-newborn · shock · deformity-of-orbit · contact-dermatitis · whooping-cough · azoospermia · oligospermia · cardiac-arrest · derangement-of-medial-meniscus

## Source of remaining waves
`docs/conditions-content/_priority_queue.json` (length 616, filtered from tier1+tier2 base names, ranked by variantCount).
