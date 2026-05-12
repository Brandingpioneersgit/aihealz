# AIHealz Condition Page Content Guidelines

**Version:** 1.0 · 2026-05-12
**Audience:** Anyone (human or AI) writing or reviewing content for `condition_page_content`.

This doc is the bar. If a draft doesn't meet every section here, it does not get inserted into the database. Goal: every Tier-1 page should be capable of ranking on page 1 for its head term within 6 months given the AIHealz domain + the geo strategy.

---

## 1. Why this bar exists

In March 2024 Google deployed the **scaled content abuse** policy. Pages identified as mass-AI-generated with thin EEAT signals are deindexed or manual-actioned, especially in YMYL categories (Your Money Your Life — medical content is the canonical YMYL example).

The pages that rank for `<condition name>`, `<condition name> symptoms`, `<condition name> treatment` in 2026 share six structural traits:

1. **Named medical reviewer** with verifiable credentials and a real reviewer block on the page
2. **Real primary-source citations** to PubMed / journal / authoritative health body — not just `[1] WHO`
3. **Original first-paragraph framing** (Google's "first 100 words" detection avoids template-shaped openers)
4. **Last-reviewed date** rendered on-page and in schema
5. **Internal links** to related conditions, treatments, doctors, tests (≥ 8 outbound internal links per page)
6. **Specific numerics** (prevalence %, age bands, response rates, cost ranges) — not generic "common / serious / variable"

Word count alone does not rank. A 2,500-word page without these structural bones loses to a 1,200-word Mayo page.

---

## 2. Word-count and section targets

| Section | Min words | Target | Notes |
|---|---|---|---|
| `heroOverview` | 80 | 100–120 | Plain-English explanation of what the condition is. Optimized for AI Overviews + featured snippet. |
| `definition` | 150 | 200–250 | Clinical definition. Should include ICD-10 code, body system, prevalence stat. |
| `primarySymptoms` (array) | 6 items | 8–12 | Each item one sentence describing the symptom + when it presents. |
| `causes` (array, structured) | 4 items | 5–8 | Each `{cause, description}` — description 30–60 words with mechanism. |
| `riskFactors` (array, structured) | 5 items | 6–10 | Categorized as `modifiable` / `non-modifiable` / `genetic`. |
| `diagnosisOverview` | 150 | 200–300 | How clinicians actually diagnose this. Reference test names, sensitivity, when they're indicated. |
| `diagnosticTests` (array, structured) | 4 items | 5–8 | Each `{test, purpose, whatToExpect}` — whatToExpect helps featured snippet. |
| `treatmentOverview` | 200 | 250–350 | First-line vs second-line approach. Mention guidelines if applicable (e.g. ACC/AHA, NICE, WHO). |
| `medicalTreatments` (array, structured) | 3 items | 4–8 | Each `{name, description, effectiveness}` — effectiveness with a number (`75% response rate`, `NNT 4`, etc.). |
| `surgicalOptions` (array, structured) | 0 items if N/A | 2–4 | Include success rates. |
| `prognosis` | 100 | 150–200 | Realistic outlook with numbers (5-yr survival, response rate, recurrence %). |
| `preventionStrategies` (array) | 3 items | 4–6 | Evidence-based only. No bunk. |
| `lifestyleModifications` (array) | 4 items | 5–8 | Specific and actionable. |
| `dietRecommendations` | `{recommended[], avoid[]}` | 4+4 | Backed by intervention studies, not folklore. |
| `complications` (array) | 3 items | 4–6 | Each item explains the complication and how to detect it early. |
| `faqs` (array of `{question, answer}`) | 12 items | 18–22 | Each answer 60–120 words. Mine People Also Ask + Quora + Reddit. Schema-eligible. |
| `sources` (array) | 5 items | 6–10 | **Real citations** — see Section 5. |
| `relatedConditions` + `confusedWithConditions` + `coOccurringConditions` | 2 each min | 3–5 each | Real internal links to other condition slugs. |

**Total target word count: 2,500–3,500 words.** Including arrays. The schema lets the page render a lot of structured content; the prose sections should be the bulk.

---

## 3. Voice, tone, and original framing

- **Voice:** Editorial-medical. Calm, precise, plain-English. Not patient-condescending, not doctor-pompous. Think Mayo Clinic's patient-facing pages, not WebMD's clickbait.
- **Tense:** Present tense for facts. ("Gout causes severe joint pain." not "Gout will cause...")
- **Person:** Mostly third-person. Second-person ("you") is allowed sparingly, in instruction-style FAQs. Never first-person.
- **Banned openers** (Google's AI-content detectors flag these):
  - "In today's world..."
  - "X is a complex condition that affects millions..."
  - "Understanding X is crucial because..."
  - "Have you ever experienced..."
  - "X is a serious medical condition..."
- **Required first-100-words pattern:** lead with a concrete, scoped fact specific to the condition — its mechanism, its prevalence, or what differentiates it from confused conditions. Examples that pass:
  - **Gout:** "Gout is the most common form of inflammatory arthritis in adults, caused by uric acid crystals depositing in joints — typically the base of the big toe."
  - **Endometriosis:** "Endometriosis is the growth of uterine-lining tissue outside the uterus, affecting roughly 10% of women of reproductive age and taking an average of 7 years to diagnose."
- **Forbidden filler phrases:**
  - "It is important to note that..."
  - "It is worth mentioning..."
  - "As we have discussed..."
  - "Various / numerous / multiple factors..."
  - "A holistic / comprehensive approach..."
  - "In conclusion..." / "To summarize..."
  - Any "delve into", "navigate", "tapestry", "landscape" used metaphorically.
- **Numbers over adjectives:** "affects 4% of US adults" beats "is common". "5-year survival is 84%" beats "the outlook is generally favorable".

---

## 4. EEAT structural requirements

Every Tier-1 page must populate:

### Reviewer (mandatory)
- `ConditionReviewer` row linking the condition → `DoctorProvider` with `isPrimary: true`
- The DoctorProvider must have: real name, `licenseNumber`, `licensingBody`, `qualifications[]`, `experienceYears`, `bio`
- `ConditionPageContent.reviewedByDoctorId` set to same doctor
- `ConditionPageContent.lastReviewed` set to the actual review date (not generation date)

Until real MDs are recruited, use the seeded **AIHealz Medical Editorial Board** doctor (id stored in `docs/editorial-reviewer.json`). This MUST be replaced with named individuals before launch.

### Sources (mandatory, real)
The `sources` array must reference real, verifiable publications. **Acceptable source types**, in order of preference:

1. **PubMed-indexed journal articles** — include PMID. Format: `{title, url: "https://pubmed.ncbi.nlm.nih.gov/<PMID>/", accessedDate}`
2. **Major clinical guidelines** — ACC/AHA, NICE, GINA, KDIGO, WHO clinical guidelines, RCOG, IDSA, etc. Cite the specific guideline by name + year.
3. **National health body educational pages** — NIH (NIDDK, NHLBI, NIMH, etc.), CDC, NHS, WHO topic pages, Cochrane reviews
4. **Authoritative academic centers** — Mayo Clinic, Cleveland Clinic, Johns Hopkins (use sparingly — these are our competitors)
5. **Cochrane systematic reviews** with citation
6. **Society guidelines** — American College of Rheumatology, American Diabetes Association, etc.

**Unacceptable as sources:**
- WebMD, Healthline, MedicineNet, Drugs.com — these aren't primary sources
- "Source: WHO" without a specific page/document
- Wikipedia
- Reddit / Quora / forums

Each source: `{title: "Full descriptive title", url: "https://...", accessedDate: "2026-05-12"}`. URLs must resolve. We will run a link-check on the database.

### Schema markup (auto-generated, must validate)
- `schemaMedicalCondition` (JSON-LD `MedicalCondition`) — auto-generated by `generatePageSchemas()` in `src/lib/schema-markup.ts`, but content must have populated `primarySymptoms`, `medicalTreatments`, `riskFactors` for the schema to be complete.
- `schemaFaqPage` (JSON-LD `FAQPage`) — drawn from `faqs[]` where `schemaEligible: true`. **Critical:** mark only schema-friendly answers as eligible. Schema-friendly means: short (< 300 chars), no markdown, factual, no marketing.
- Reviewer schema (`reviewedBy`) is appended to MedicalCondition schema in `generatePageSchemas()`. Verify it appears in the generated JSON-LD.

### On-page EEAT visible signals (frontend)
The condition detail page (`src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx`) must render:
- "Reviewed by Dr. <Name>, <Qualifications>, <LicensingBody>" with link to doctor profile
- "Last reviewed: <Month YYYY>"
- "Sources (N)" expandable section listing all sources with links
- ICD-10 code (already rendered)

If any of these are missing visually, the EEAT signal isn't being read by Google. The frontend rendering is non-negotiable.

---

## 5. SEO targeting per page

Every Tier-1 condition page targets a **head term** and 4-8 supporting long-tail variants.

### Head-term selection
The primary head term is the most-searched plain-English condition name (NOT the medical name unless it's the everyday term). Source: Google Keyword Planner monthly search volume, ahrefs/SEMrush if available. In absence of tooling, default to the `commonName` from the DB but verify against People Also Ask suggestions.

Examples:
- ✅ "Gout" (40k searches/mo) — not "Gouty arthritis"
- ✅ "Heart attack" → maps to `myocardial-infarction` but head term is "heart attack"
- ✅ "ADHD" — not "Attention Deficit Hyperactivity Disorder"
- ✅ "High blood pressure" — covers `hypertension` page

### Long-tail variants per page

Every page should naturally serve these query intents (in the prose, not stuffed):

1. **`<condition> symptoms`** — covered by `primarySymptoms` + symptom-focused FAQ
2. **`<condition> causes`** — covered by `causes`
3. **`<condition> treatment`** — covered by `treatmentOverview` + `medicalTreatments`
4. **`<condition> diagnosis`** — covered by `diagnosisOverview` + `diagnosticTests`
5. **`how to know if I have <condition>`** — FAQ
6. **`<condition> vs <confused condition>`** — covered by `confusedWithConditions` section
7. **`<condition> in women / men / children`** if relevant — FAQ
8. **`is <condition> serious / curable / hereditary`** — FAQ
9. **`how long does <condition> last / take to heal`** — covered by `recoveryTimeline`
10. **`best doctor for <condition>`** — links to specialist pages (handled by template + geo pages)

### Meta tags
- `metaTitle` — ≤ 60 chars. Format: `<Condition>: Symptoms, Causes & Treatment | aihealz` OR `<Condition> Treatment in <Country>: Cost & Specialists`
- `metaDescription` — 150–160 chars. Must include the condition name, 1 differentiator, 1 specific fact, and a soft CTA. Example: `Gout causes sudden severe joint pain from uric acid crystals. Learn symptoms, treatment options, and cost. Reviewed by board-certified rheumatologists.`
- `keywords` — 8–15 terms covering head + long-tail variants. (Note: Google ignores this field, but our internal search uses it.)

### URL structure (already correct, do not change)
- Canonical detail page: `/[country]/[lang]/[condition-slug]`
- Geo-multiplied: `/[country]/[lang]/[condition-slug]/[city]` etc.

---

## 6. Content depth requirements per section

### `heroOverview` (the most important 100 words on the page)
- Sentence 1: What is this condition (mechanism, 1 line)
- Sentence 2: Prevalence + who is affected (numbers required)
- Sentence 3: Lead symptom or how it usually presents
- Sentence 4: Why it matters (consequence if untreated, OR what differentiates it)
- Sentence 5: Treatment landscape (1 line)

This block feeds AI Overviews. Optimize ruthlessly.

### `definition`
- Open with ICD-10 code in passing: "Gout (ICD-10: M10) is a..."
- Define mechanism (immune, metabolic, genetic, etc.)
- Note body system and specialty
- Cite epidemiology with year-stamped numbers

### `primarySymptoms` array
Each item is a one-sentence symptom description **with context**: `"Sudden, severe joint pain that peaks within 12-24 hours, most commonly in the big toe (50% of first attacks)."` — NOT just "Joint pain".

### `causes` array
Structured `{cause, description}`. The `description` explains the mechanism in 30-60 words. Avoid platitudes like "exact cause unknown" — if it's idiopathic say so but explain the working hypotheses.

### `riskFactors` array
Structured `{factor, category, description}`. Categories: `modifiable`, `non-modifiable`, `genetic`, `environmental`. Each description includes effect size where known (`"obesity increases risk 3.4×"`).

### `diagnosisOverview` and `diagnosticTests`
Diagnosis section should walk through the actual clinical workflow: history → exam → first-line test → confirmatory test → differential diagnoses ruled out. Each test in `diagnosticTests` should have a `whatToExpect` field that wins featured snippets.

### `treatmentOverview` and treatment arrays
- Distinguish first-line, second-line, third-line treatments
- Name specific drugs/procedures by generic name (NSAIDs: ibuprofen, naproxen — not "anti-inflammatories")
- Include response rates with numbers
- Reference guidelines (e.g. ACR 2020 Gout Guideline, NICE NG136)

### `complications` array
What goes wrong if untreated/poorly managed. Each item: what the complication is + how to detect early. Don't be alarmist; be specific.

### `faqs` array (18–22 questions)
Mine People Also Ask from Google for the head term. Include:
- 4–6 symptom/diagnosis questions ("Is my X actually Y?")
- 3–5 treatment questions ("Will I need surgery for X?", "Can X be cured?")
- 2–4 cost/access questions ("How much does X treatment cost in [country]?", "Is X covered by insurance?")
- 2–3 lifestyle/prognosis questions ("Can I exercise with X?", "Will X get worse over time?")
- 2–3 specific demographic questions ("Is X common in women / men / kids / over 60?")

Each FAQ answer:
- 60–120 words
- Direct answer in first sentence (featured snippet bait)
- Supporting context after
- Mark `schemaEligible: true` only if the answer is < 300 chars and contains no markdown

---

## 7. Internal linking requirements

Every Tier-1 page must include:
- **`relatedConditions`** (3-5): other conditions in the same specialty that often co-occur or appear in differential diagnosis
- **`confusedWithConditions`** (3-5): conditions with overlapping symptoms — each with `keyDifference` explaining how to tell them apart (this is the "X vs Y" intent)
- **`coOccurringConditions`** (2-4): conditions that frequently appear alongside this one
- **`linkedTreatmentSlugs`** (2-6): slugs of treatment pages — these become inline cards on the rendered page

All slug references must be **valid slugs that exist in `MedicalCondition`**. The insertion script validates this.

---

## 8. Localization (Tier-1 priority languages)

Tier-1 conditions ship in English first, then translated to:

| Language | Code | Priority | Notes |
|---|---|---|---|
| English | `en` | P0 | Source |
| Hindi | `hi` | P0 | Largest non-English India audience |
| Tamil | `ta` | P1 |  |
| Telugu | `te` | P1 |  |
| Bengali | `bn` | P1 |  |
| Marathi | `mr` | P2 |  |
| Kannada | `kn` | P2 |  |
| Malayalam | `ml` | P2 |  |
| Gujarati | `gu` | P2 |  |
| Punjabi | `pa` | P3 |  |

Translation rules:
- Translate **structured field values**, never field names
- Localize numerics carefully (e.g. cost ranges in local currency, prevalence stats apply globally)
- Re-check schema markup post-translation — JSON-LD must validate per language
- Use a translation pipeline only after English EEAT is fully approved by a doctor reviewer

---

## 9. Cost, prevalence, and country specificity

The cost section (`costBreakdown`) is handled by the `TreatmentCost` table separately. In the prose:
- Avoid country-specific cost claims in the canonical English page (those go in geo-multiplied URLs)
- Prevalence stats: prefer global numbers unless WHO/CDC/India MoHFW reports diverge — then note divergence

---

## 10. The acceptance checklist (must pass before insert)

Before any condition's JSON is inserted into `condition_page_content`, verify:

- [ ] Word count ≥ 2,500 across all text fields (script will validate)
- [ ] All 18+ FAQs present, 12+ marked `schemaEligible: true`
- [ ] 6+ sources, all with real URLs that resolve (link-check passes)
- [ ] Reviewer DoctorProvider exists, ConditionReviewer row created
- [ ] `reviewedByDoctorId` set, `lastReviewed` set
- [ ] 3+ entries each in `relatedConditions`, `confusedWithConditions`, `coOccurringConditions` — all referencing valid slugs
- [ ] No banned phrases (script will scan)
- [ ] No template-shaped openers (manual review)
- [ ] `metaTitle` ≤ 60 chars, `metaDescription` 150-160 chars
- [ ] Schema markup validates against schema.org MedicalCondition and FAQPage
- [ ] Page renders correctly on dev server at `/us/en/<slug>` with all sections visible
- [ ] At least 8 internal links rendered (3 to other conditions + 2-6 to treatments + 1-3 to doctors + breadcrumb already counts)

The insertion script (`scripts/insert-condition-content.ts`) enforces most of these automatically. The manual ones (template-shape, voice) require a human pass.

---

## 11. Pipeline: writing → insert → verify → ship

```
docs/conditions-content/<slug>.json   ← write the content here
       │
       ▼
node scripts/insert-condition-content.mjs <slug>   ← validates + inserts
       │
       ▼
curl http://localhost:3000/us/en/<slug>   ← visual verification on dev
       │
       ▼
git commit "content(<slug>): tier-1 EEAT-grade page"
       │
       ▼
deploy → live page → monitor Search Console for indexation + rankings
```

Every commit covers one condition (or a small batch). Atomic, revertable, auditable.

---

## 12. Out of scope for v1

- Image generation (covered by `MediaAsset` table separately)
- Video content
- Localized cost-by-city deep dives (handled by `TreatmentCost` table at the data layer, not in prose)
- Trial / RCT data summaries beyond what fits in sources

---

**Last edited:** 2026-05-12 · **Owner:** Content engineering · **Status:** v1 baseline
