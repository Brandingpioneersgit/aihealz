# AIHealz Condition Content Production Playbook

**Version:** 1.0 · 2026-05-12
**Purpose:** The single document that lets multiple writers (or AI sessions) produce SEO+EEAT-grade condition pages in parallel without conflicts.

If you are about to write content for a condition page, **read this entire document first**. Then write. Then validate. Then commit. That order.

---

## TL;DR — the writer's workflow

```
1. Claim a slug      → docs/conditions-content/_assignments.md (add your row)
2. Read this doc + docs/condition-content-guidelines.md
3. Copy template     → docs/conditions-content/_TEMPLATE.json
4. Write the content → docs/conditions-content/<slug>.json
5. Source images     → see Section 8 (Images & licensing)
6. Validate          → node scripts/insert-condition-content.mjs <slug>
7. Verify visually   → http://localhost:3500/us/en/<slug>
8. Commit            → git commit -m "content(<slug>): tier-1 EEAT-grade page"
9. Mark assignment done in _assignments.md
```

Hard rules — non-negotiable:
- One PR / commit per condition. Atomic.
- Never edit a slug that someone else has claimed in `_assignments.md`.
- Pass the validator. Don't disable validations.
- All citations real, all URLs resolve.

---

## 1. Project context

AIHealz is targeting #1 organic rankings on medical-condition keywords across multiple geographies. The condition page (`/[country]/[lang]/[condition-slug]`) is the unit of SEO traffic. There are:

- **72,099 active conditions** in `medical_conditions` (mostly ICD-10 imports)
- **~5,500 base conditions** that get unique content (Tier-1 + Tier-2)
- **~65,000 ICD variants** that canonical-redirect to their base (no unique content)

| Tier | Count | Quality bar | Source |
|---|---|---|---|
| Tier-1 (head) | 500 | 2,500-5,000 words, full EEAT, hand-written | `docs/condition-tier-analysis.json` → `tier1Conditions` |
| Tier-2 (long-tail) | 5,000 | 1,500-2,500 words, full EEAT structure, hand-written or model-assisted | `docs/condition-tier-analysis.json` → `tier2Conditions` |
| ICD variants | 65,000 | No unique content; canonical-redirect to base | Computed via `getBaseConditionName()` collapsing |

Read `docs/condition-content-guidelines.md` for the why-this-bar-exists rationale. This playbook is the operational handbook on top of those guidelines.

---

## 2. How to claim a slug (parallel coordination)

Before writing, **claim the slug**. Add a row to `docs/conditions-content/_assignments.md` with your name/initials, the date, and the status. Example:

| Slug | Tier | Specialty | Assignee | Claimed | Status |
|---|---|---|---|---|---|
| gout | 1 | Rheumatology | brand-team | 2026-05-12 | done |
| pneumonia | 1 | Pulmonology | KP | 2026-05-12 | drafting |
| anemia | 1 | Hematology | (open) | — | open |

Status values: `open` → `claimed` → `drafting` → `validating` → `pr-open` → `done`.
If you abandon a claim, change status to `open` again so others can pick it up.

---

## 3. The JSON shape (mirrors `ConditionPageContent`)

Every condition's content lives at `docs/conditions-content/<slug>.json`. The file is a single JSON object with the fields listed below. **Field names match the Prisma model exactly** — the insertion script maps them 1:1 into `condition_page_content`.

```json
{
  "_meta": { /* not stored; bookkeeping for writers */ },
  "h1Title": "...",
  "specialistType": "Rheumatology",

  "heroOverview": "...100-120 words...",
  "keyStats": { "prevalence": "...", "demographics": "...", "avgAge": "...", "globalCases": "..." },

  "definition": "...200-250 words...",
  "typesClassification": [ { "type": "...", "description": "..." } ],

  "primarySymptoms": [ "...", "..." ],
  "earlyWarningSigns": [ "...", "..." ],
  "emergencySigns": [ "...", "..." ],

  "causes": [ { "cause": "...", "description": "..." } ],
  "riskFactors": [ { "factor": "...", "category": "modifiable|non-modifiable|genetic|environmental", "description": "..." } ],
  "affectedDemographics": [ "..." ],

  "diagnosisOverview": "...200-300 words...",
  "diagnosticTests": [ { "test": "...", "purpose": "...", "whatToExpect": "..." } ],

  "treatmentOverview": "...250-350 words...",
  "medicalTreatments": [ { "name": "...", "description": "...", "effectiveness": "..." } ],
  "surgicalOptions": [ { "name": "...", "description": "...", "successRate": "..." } ],
  "alternativeTreatments": [ { "name": "...", "description": "..." } ],
  "linkedTreatmentSlugs": [ "..." ],

  "whySeeSpecialist": "...",
  "doctorSelectionGuide": "...",

  "hospitalCriteria": [ "..." ],
  "keyFacilities": [ "..." ],

  "costBreakdown": null,
  "insuranceGuide": null,
  "financialAssistance": null,

  "preventionStrategies": [ "..." ],
  "lifestyleModifications": [ "..." ],
  "dietRecommendations": { "recommended": [ "..." ], "avoid": [ "..." ] },
  "exerciseGuidelines": "...",

  "dailyManagement": [ "..." ],
  "prognosis": "...150-200 words...",
  "recoveryTimeline": "...",
  "complications": [ "..." ],
  "supportResources": [ { "name": "...", "url": "https://...", "description": "..." } ],

  "confusedWithConditions": [ { "slug": "...", "name": "...", "keyDifference": "..." } ],
  "coOccurringConditions": [ { "slug": "...", "name": "..." } ],
  "relatedConditions": [ { "slug": "...", "name": "...", "relevance": "..." } ],

  "faqs": [ { "question": "...", "answer": "...", "schemaEligible": true } ],

  "simpleName": "...",
  "regionalNames": [ { "name": "...", "region": "...", "language": "..." } ],
  "searchTags": [ "..." ],
  "symptomKeywords": [ "..." ],

  "metaTitle": "≤60 chars",
  "metaDescription": "140-165 chars",

  "keywords": [ "..." ],

  "lastReviewed": "YYYY-MM-DD",
  "sources": [ { "title": "...", "url": "https://...", "accessedDate": "YYYY-MM-DD" } ],

  "images": [ /* see Section 8 */ ]
}
```

A working filled-in example is `docs/conditions-content/gout.json`. **Copy it as your template** and rewrite section by section — do not start from an empty file.

---

## 4. Voice, tone, and content rules

These are the boil-down of `docs/condition-content-guidelines.md` Section 3:

### Required first 100 words
Lead with a **concrete, scoped, specific fact** about the condition. Mechanism, prevalence, or differentiator. Never with "X is a complex condition that affects..."

### Banned openers
- "In today's world..."
- "X is a complex condition that affects millions..."
- "Understanding X is crucial because..."
- "Have you ever experienced..."
- "X is a serious medical condition..."

### Banned filler phrases
- "It is important to note that..."
- "It is worth mentioning..."
- "Various / numerous / multiple factors..."
- "A holistic / comprehensive approach..."
- "In conclusion..." / "To summarize..."
- "delve into", "tapestry", "landscape", "navigate" (metaphorical use)

The `insert-condition-content.mjs` validator scans for these and **rejects** the content if any are present. Don't try to defeat the regex — fix the prose.

### Numbers over adjectives
- ❌ "common condition"
- ✅ "affects 4% of US adults (NHANES 2007-2016)"
- ❌ "serious if untreated"
- ✅ "5-year survival without treatment falls below 30%"

Every claim of prevalence, response rate, or mortality should have a number with a year or source attached. If you can't source a number, drop the claim.

### Tense and voice
- Present tense for facts: "Gout causes severe joint pain" not "will cause"
- Third-person primarily; second-person sparingly in instruction-style FAQs
- Never first-person ("I think")
- Active voice over passive where possible

---

## 5. Section-by-section content requirements

### `h1Title`
Format: `<Condition>: Symptoms, Causes, Diagnosis, and Treatment` OR `<Condition>: Symptoms, Causes & Treatment`. Keep under 70 chars. The H1 must contain the head term verbatim.

### `heroOverview` (100-120 words)
The most important 100 words on the page. Feeds AI Overviews and featured snippets. Structure:

1. **Sentence 1**: What the condition is (mechanism, one line)
2. **Sentence 2**: Prevalence + who it affects (specific numbers)
3. **Sentence 3**: How it typically presents
4. **Sentence 4**: Why it matters (consequence if untreated, OR what differentiates it)
5. **Sentence 5**: Treatment landscape (one line)

Example (Gout):
> Gout is the most common form of inflammatory arthritis in adults, caused by monosodium urate crystals depositing inside joints when blood uric acid stays elevated for years. It affects roughly 4% of adults in the United States and a rising share of adults globally, with men over 40 and post-menopausal women at highest risk. The classic first attack hits the base of the big toe overnight — sudden, severe, often described as the worst pain a person has felt. Untreated, attacks recur and the disease progresses to chronic tophaceous gout, joint damage, and kidney stones. Effective treatment exists at every stage: flares respond to anti-inflammatory drugs within 24-48 hours, and long-term urate-lowering therapy can prevent recurrence entirely.

### `definition` (200-250 words)
The clinical definition. Mention:
- ICD-10 code: `"<Condition> (ICD-10: M10) is..."`
- Pathophysiologic mechanism
- Body system affected
- Stage classification if any
- Specialty that manages it
- Where it sits in the broader disease landscape

### `keyStats` object
| Field | Example | Notes |
|---|---|---|
| `prevalence` | `"3.9% of US adults (NHANES 2007-2016)"` | Real published number with source/year |
| `demographics` | `"Men 4-5x more affected than premenopausal women"` | Sex/age/ethnicity skew |
| `avgAge` | `"First attack typically age 30-50 in men, 60+ in women"` | Or `"Onset typically 5-15 years"` for pediatric |
| `globalCases` | `"~50 million people worldwide"` | When available |

### `typesClassification` (2-5 items)
Sub-types or stages of the condition. Useful for differentials, treatment selection, and prognosis. Skip if the condition is unitary.

### `primarySymptoms` (8-12 items)
Each item is a **full sentence with context**, not a label:
- ❌ "Joint pain"
- ✅ "Sudden, severe joint pain that peaks within 12-24 hours, most commonly in the big toe (50% of first attacks)."

Include onset pattern, location, intensity descriptors, time course, what triggers it, what relieves it — whatever applies.

### `earlyWarningSigns` (3-5 items)
Subtle prodromal symptoms, lab abnormalities, or signs that precede the full presentation. Use this section to teach patients what to watch for before a full episode.

### `emergencySigns` (3-5 items)
Red flags that warrant immediate medical attention. Be specific:
- ❌ "Severe symptoms"
- ✅ "Fever above 38.5°C with a single hot, swollen joint — septic arthritis must be excluded urgently"

### `causes` array (5-8 items)
Structured `{cause, description}`. Description is 30-60 words and explains the **mechanism**, not just the label. Order by frequency or causal weight.

### `riskFactors` array (6-10 items)
Structured `{factor, category, description}`. Categories must be one of: `modifiable`, `non-modifiable`, `genetic`, `environmental`. Description includes effect size where available (`"obesity increases risk 3.4×"`, `"BMI ≥30 doubles incidence"`).

### `affectedDemographics` (3-5 items)
Brief epidemiologic facts about who is affected — by ethnicity, geography, sex, age. Cite the data source in parentheses when relevant.

### `diagnosisOverview` (200-300 words)
Walk through the actual clinical workflow: history → exam → first-line test → confirmatory test → differentials. Mention the gold-standard test and current guideline recommendations. This is the section that "<condition> diagnosis" searches land on.

### `diagnosticTests` array (5-8 items)
Structured `{test, purpose, whatToExpect}`. The `whatToExpect` field wins featured snippets — describe the patient experience: "A standard blood draw. Results return same day in most labs." Avoid jargon.

### `treatmentOverview` (250-350 words)
The big-picture treatment strategy. Distinguish first-line, second-line, third-line. Mention guideline names (ACR 2020, NICE NG219, EULAR 2016, etc.) and treat-to-target principles where they apply. Reference specific drug names by generic name.

### `medicalTreatments` array (4-8 items)
Structured `{name, description, effectiveness}`. Always include effectiveness with a **number** — response rate, NNT, time to remission. If unknown, omit the field rather than say "highly effective".

Drug entries should follow the format: `"<Generic name> (<dose>)"`. Example: `"Allopurinol (start 100 mg daily; titrate to 300-600 mg)"`.

### `surgicalOptions` array (0-4 items)
For conditions with surgical management. Include success rates with numbers. If surgery is genuinely not part of the management, set this field to `null` or `[]`.

### `alternativeTreatments` (0-3 items)
Evidence-based complementary approaches with citations (e.g. cherry consumption for gout, omega-3 for rheumatoid arthritis). **No anecdotal or unevidenced treatments.** If you can't cite a study, leave this empty.

### `whySeeSpecialist` + `doctorSelectionGuide`
2-3 sentences each. Specific criteria for specialist referral and practical guidance for choosing a doctor.

### `preventionStrategies` (4-6 items)
Specific, actionable, evidence-based. Each item leads with the action verb.

### `lifestyleModifications` (5-8 items)
Same as prevention but for active disease management.

### `dietRecommendations`
`{recommended: [...], avoid: [...]}` — both lists need 4-6 items each, all backed by intervention studies or strong observational data. No folklore.

### `dailyManagement` (4-6 items)
Practical things a patient does every day. Medication timing, monitoring, hydration, etc.

### `prognosis` (150-200 words)
The realistic outlook with specific numbers — 5-year survival, response rate, recurrence rate, time to remission, what predicts good vs poor outcome.

### `recoveryTimeline`
For conditions with discrete episodes/recovery: timeline expectations. For chronic conditions, the timeline of disease control.

### `complications` (4-6 items)
What goes wrong if untreated/poorly managed. Each item: what the complication is + how to detect early. Be specific, not alarmist.

### `supportResources` (2-4 items)
Real patient organizations, helplines, and authoritative patient-facing pages. Include real URLs.

### `confusedWithConditions` (3-5 items)
Structured `{slug, name, keyDifference}`. The `keyDifference` is a 2-3 sentence explanation of how to tell this condition apart from a similar one. This is the "X vs Y" search intent.

**Slug rule:** every slug must exist in `medical_conditions`. The validator checks. Use `node scripts/check-slugs.mjs <slug>` to verify before writing.

### `coOccurringConditions` (2-4 items)
Conditions that frequently appear together (comorbidities).

### `relatedConditions` (3-5 items)
Other conditions in the same specialty or pathway. Each `{slug, name, relevance}` — relevance is one line explaining the connection.

### `faqs` (18-22 items)
Mine Google's "People Also Ask" for the head term. Mix:
- 4-6 symptom/diagnosis questions
- 3-5 treatment questions
- 2-4 cost/access questions
- 2-3 lifestyle/prognosis questions
- 2-3 demographic questions ("Can women get X?", "Is X common in children?")

Each answer 60-120 words. Direct answer in first sentence (featured-snippet bait). `schemaEligible: true` ONLY if the answer:
- Is under 300 chars
- Contains no markdown formatting
- Is purely factual (no marketing, no "talk to your doctor about...")

Aim for at least 12 schemaEligible FAQs per condition.

### `simpleName`
Plain-English everyday term. "Gout (uric acid crystal arthritis)" — useful when the canonical name is medical jargon.

### `regionalNames` (0-5 items)
`{name, region, language}` — local-language names for the condition. Especially valuable for Indian-language search intent.

### `searchTags` (10-15 items)
All searchable terms, including misspellings, abbreviations, synonyms. Used by internal search.

### `symptomKeywords` (5-10 items)
Plain-language symptom phrases that map to this condition. Used by symptom checker.

### `metaTitle` (≤ 60 chars)
Format: `<Condition>: Symptoms, Causes & Treatment | aihealz` — must include head term.

### `metaDescription` (140-165 chars)
Must contain: condition name, one differentiator, one specific fact, soft trust signal. Don't pad with adjectives.

Example (Gout):
> Gout: sudden severe joint pain from uric acid crystals, often in the big toe. Symptoms, treatment, diet, and prognosis reviewed by our medical board.

### `keywords` (10-15 items)
Head term + 8-12 long-tail variants. Internal use only.

### `lastReviewed` (YYYY-MM-DD)
The actual review date. Not the future date when content was written.

### `sources` (6-10 items, all REAL)
This is the EEAT spine. Every page needs at minimum:
- 1 primary clinical guideline (ACR, AHA, NICE, EULAR, KDIGO, GINA, etc.)
- 1 epidemiology source (CDC, NHANES, WHO, national stats)
- 2-3 peer-reviewed articles (PubMed-indexed, with PMID in URL)
- 1 patient organization or authoritative health body

Format:
```json
{
  "title": "<Authors> <Year>. <Full title>. <Journal> <volume>:<pages>.",
  "url": "https://pubmed.ncbi.nlm.nih.gov/<PMID>/",
  "accessedDate": "YYYY-MM-DD"
}
```

**Banned as primary sources:** WebMD, Healthline, MedicineNet, Drugs.com, Wikipedia, Quora, blogs. They aren't primary sources.

URLs must resolve. The validator does a URL format check; a periodic link-check job will run against the DB.

---

## 6. Internal linking — mandatory

Every page must have working internal links via:

| Field | Minimum items |
|---|---|
| `confusedWithConditions` | 3 |
| `coOccurringConditions` | 2 |
| `relatedConditions` | 3 |
| `linkedTreatmentSlugs` | 2-6 (where available) |
| `supportResources` | 2 (external but high-authority) |

The validator rejects payloads where slug references don't exist in `medical_conditions`. Use `node scripts/check-slugs.mjs --search <term>` to find valid slugs.

Slug-search examples:
```bash
node scripts/check-slugs.mjs --search "pseudogout"        # returns cppd-disease
node scripts/check-slugs.mjs --search "type 2 diabetes"   # find variants
node scripts/check-slugs.mjs hypertension osteoarthritis  # verify specific slugs exist
```

When a perfect slug doesn't exist (because it's an ICD variant cluster), use the cleanest available variant slug.

---

## 7. Reviewer assignment

For now, all pages route to the placeholder `aihealz-medical-editorial-board` reviewer (doctor id 1001) via the insertion script. **This is temporary.** Before launching publicly, each Tier-1 condition must be reassigned to a real named MD reviewer in their specialty.

Workflow when real reviewers are recruited:
1. Add real MD as `DoctorProvider` row with credentials, license number, specialty, profile image, bio
2. Update `ConditionReviewer` for relevant condition slugs to point to the new doctor
3. Update `ConditionPageContent.reviewedByDoctorId` accordingly
4. Rebuild schema markup with `node scripts/rebuild-condition-schemas.mjs` (TODO: doesn't exist yet)
5. Push the change → page now shows real reviewer name + credentials + last reviewed date

Until then: the placeholder is fine for indexing; it's NOT sufficient for ranking on competitive head terms.

---

## 8. Images & visual content (the hard part)

Real condition images make content rank — Google's image-pack featured-snippet for medical queries is dominated by sites with original clinical photos and anatomical diagrams. But **scraping Google Image Search is copyright infringement** in the US, EU, India, and most jurisdictions. We need to source images legitimately.

### Acceptable image sources (in order of preference)

| Source | License | Best for | URL pattern |
|---|---|---|---|
| **CDC Public Health Image Library (PHIL)** | US Public Domain | Infectious diseases, dermatology, clinical photos | `https://phil.cdc.gov/` |
| **NLM Open-i** | Mixed open licenses (filter to CC) | Medical imaging, X-rays, histology, diagnostic visuals | `https://openi.nlm.nih.gov/` |
| **PubMed Central Open Access subset** | Author-licensed (varies — check each) | Disease-specific clinical photos, diagrams | `https://pmc.ncbi.nlm.nih.gov/` |
| **Wikimedia Commons** | CC-BY, CC-BY-SA, Public Domain (varies by image) | Anatomy diagrams, histology, X-rays | `https://commons.wikimedia.org/` |
| **DermNet NZ** | CC-BY-NC-ND (educational use allowed, attribute) | Dermatology clinical photos | `https://dermnetnz.org/` |
| **Radiopaedia** | Case-level CC-BY-NC-SA (most cases) | Radiology images, X-rays, CT, MRI | `https://radiopaedia.org/` |
| **WHO Image Library** | Mostly free for educational use, attribution required | Global health, infectious disease | `https://www.who.int/images/` |
| **NCI Visuals Online** | US Public Domain (most) | Oncology, anatomy | `https://visualsonline.cancer.gov/` |
| **3D4Medical / BioDigital** | Paid license, commercial use OK | Premium anatomical illustrations | Subscription required |
| **Adobe Stock / Shutterstock Medical** | Paid license | High-quality clinical photos | Standard license per image |

### Unacceptable image sources
- ❌ Google Image Search (most images are copyrighted)
- ❌ Other commercial medical sites (Mayo Clinic photos, WebMD photos, Healthline photos — they're under their own copyright)
- ❌ Random Instagram / X / Reddit medical photos (no licensing)
- ❌ AI-generated images presented as real clinical photos (deceptive, also flagged by Google's image-authenticity heuristics)

### Image types per condition page

For each Tier-1 condition, aim for **3-6 images**:

| Type | Required? | Purpose | Where it appears | Best source |
|---|---|---|---|---|
| **Hero / feature image** | Yes | Top of page, social shares | hero header | CDC PHIL, Wikimedia, PubMed Central |
| **Anatomical diagram** | Yes | What's affected and where | overview/definition section | Wikimedia Commons, NCI Visuals |
| **Clinical presentation photo** | Strongly preferred | What it actually looks like (skin, joint, eye, etc.) | symptoms section | DermNet, CDC PHIL, Radiopaedia |
| **Diagnostic image** | Where applicable | X-ray, CT, ultrasound, microscopy | diagnosis section | Radiopaedia, NLM Open-i |
| **Treatment / procedure illustration** | Optional | Surgical approach, injection site | treatment section | Wikimedia Commons, surgical atlases |
| **Comparison figure** | Optional | This vs confused condition | confusedWith section | Wikimedia, NLM Open-i |

### Image data shape (extends MediaAsset)

Add an `images` array to the JSON content file. The insertion script will create `MediaAsset` rows from these:

```json
{
  "images": [
    {
      "assetType": "feature",
      "section": "hero",
      "sourceUrl": "https://phil.cdc.gov/Details.aspx?pid=12345",
      "cdnUrl": "https://cdn.aihealz.com/conditions/gout/hero.jpg",
      "altText": "Inflamed first metatarsophalangeal joint with redness and swelling, typical of acute gout",
      "caption": "Acute gout flare in the first metatarsophalangeal joint (podagra).",
      "license": "Public Domain (CDC PHIL #12345)",
      "credit": "CDC Public Health Image Library",
      "width": 1200,
      "height": 800
    },
    {
      "assetType": "anatomy",
      "section": "definition",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:....",
      "cdnUrl": "https://cdn.aihealz.com/conditions/gout/joint-anatomy.svg",
      "altText": "Diagram of joint anatomy showing synovial fluid, cartilage, and bone surfaces affected by urate crystal deposition",
      "caption": "Where monosodium urate crystals deposit in a synovial joint.",
      "license": "CC-BY-SA 4.0",
      "credit": "Wikimedia Commons / [author name]",
      "width": 800,
      "height": 600
    },
    {
      "assetType": "clinical-photo",
      "section": "symptoms",
      "sourceUrl": "https://dermnetnz.org/...",
      "cdnUrl": "https://cdn.aihealz.com/conditions/gout/tophus.jpg",
      "altText": "Chalky-white tophus on the helix of the ear, a late sign of chronic gout",
      "caption": "Tophus on the ear helix — visible urate deposit in chronic gout.",
      "license": "CC-BY-NC-ND 4.0",
      "credit": "DermNet NZ",
      "width": 1200,
      "height": 900
    },
    {
      "assetType": "diagnostic",
      "section": "diagnosis",
      "sourceUrl": "https://radiopaedia.org/cases/...",
      "cdnUrl": "https://cdn.aihealz.com/conditions/gout/dect-feet.jpg",
      "altText": "Dual-energy CT of the feet showing color-coded green urate deposits in the first metatarsophalangeal joints",
      "caption": "Dual-energy CT highlighting urate deposits (green) in both first MTPs.",
      "license": "CC-BY-NC-SA 3.0",
      "credit": "Dr. [name], Radiopaedia case [id]",
      "width": 1200,
      "height": 1200
    }
  ]
}
```

### Image workflow

1. **Find** a candidate image on an acceptable source listed above
2. **Verify the license** — the page must explicitly state CC-BY/CC-BY-SA/Public Domain/CC-BY-NC. Save the license text in your notes.
3. **Verify it shows the right thing** — a clinician should be able to look at the image and say "yes, that's typical of [condition]". Avoid grossly atypical or staged photos.
4. **Download the highest-quality version available**
5. **Crop and optimize**:
   - Hero: 1200×800 or 1200×675 (16:9)
   - Body images: 800–1200 wide, aspect ratio matching original
   - Format: WebP or AVIF if the CDN supports it, otherwise JPG (clinical photos) or SVG/PNG (diagrams)
   - File size under 250 KB for body images, under 400 KB for hero
6. **Upload to CDN** at the path `conditions/<slug>/<asset-type>.<ext>`
7. **Write the alt text** — describe the medical content, not the visual style. The alt text feeds Google Image Search.
8. **Record the source URL and license in the JSON** — this becomes the on-page attribution and a defense if anyone challenges usage.

### Attribution rendering

The detail page template must render image credits underneath each image:
```
Credit: <credit> (<license>) · Source
```
This is **mandatory** for CC-BY-style licenses, and good practice for public-domain too.

### What the codebase currently supports vs needs

Current state:
- `MediaAsset` table exists with one `assetType: 'render'` row per condition (hero only)
- `content-engine.ts` fetches one `featureImage` via `findFirst`
- Detail page renders only the hero image

Needed (to be built — flagged in playbook v1):
- Insert script extension: write multiple MediaAsset rows from `images[]` array
- Detail page update: fetch ALL MediaAsset rows for the condition and render per section
- Credit/license rendering component
- Schema markup update: add `image` array to `MedicalCondition` schema JSON-LD

Until that ships, **populate the `images[]` array in your JSON anyway** — insertion will store source URLs and licenses, and the renderer upgrade will pick them up automatically.

---

## 9. Schema markup (JSON-LD)

Auto-generated by the insertion script. Each page emits:

1. **MedicalCondition** — with name, alternateName, ICD code, signOrSymptom (from primarySymptoms), cause, riskFactor, possibleTreatment, reviewedBy (the reviewer), lastReviewed, image array.
2. **FAQPage** — built from FAQs marked `schemaEligible: true`.
3. **BreadcrumbList** — rendered by the page template itself.

Validate manually after insertion:
```bash
# Copy the JSON-LD blob from the page source and paste into:
# https://validator.schema.org/
# Required: zero errors. Warnings are OK if intentional.
```

---

## 10. Local-language translations

English is source of truth. After English is approved by a reviewer:
1. Run `scripts/translate-page-content.ts` for the slug
2. Verify translated JSON-LD validates
3. Visually check on dev server at `/in/hi/<slug>`, `/in/ta/<slug>`, etc.

Priority languages for India market (P0 = English + Hindi; P1 = Tamil, Telugu, Bengali; P2 = Marathi, Kannada, Malayalam, Gujarati; P3 = Punjabi).

---

## 11. The acceptance checklist (validator-enforced)

Before insertion, the validator enforces:

- [ ] Word count ≥ 2,500 across all text fields
- [ ] heroOverview ≥ 80 words
- [ ] definition ≥ 150 words
- [ ] diagnosisOverview ≥ 150 words
- [ ] treatmentOverview ≥ 200 words
- [ ] prognosis ≥ 100 words
- [ ] primarySymptoms ≥ 6 items
- [ ] causes ≥ 4 items
- [ ] riskFactors ≥ 5 items
- [ ] diagnosticTests ≥ 4 items
- [ ] medicalTreatments ≥ 3 items
- [ ] complications ≥ 3 items
- [ ] faqs ≥ 12 items
- [ ] sources ≥ 5 items with real URLs
- [ ] relatedConditions ≥ 2 items with valid slugs
- [ ] confusedWithConditions ≥ 2 items with valid slugs
- [ ] No banned phrases
- [ ] metaTitle ≤ 60 chars
- [ ] metaDescription 140-165 chars
- [ ] schemaEligible FAQs ≥ 12

If validation fails, **fix the content** — don't bypass the validator. If a check seems wrong for a specific condition, raise it with the team and update the playbook for everyone.

---

## 12. Manual review pass

Validator-pass ≠ ready-to-ship. Before commit, also verify:

- [ ] First 100 words do not match any banned-opener pattern
- [ ] No template-shaped sentences (read aloud — does it sound like a person?)
- [ ] All numerics have a source or are clearly attributed
- [ ] Drug names spelled correctly, doses match current guidelines
- [ ] confusedWith section actually distinguishes the conditions (don't just say "they're similar")
- [ ] FAQ answers are direct (first sentence answers the question)
- [ ] Image alt text is medical-content-descriptive, not visual-style-descriptive
- [ ] Sources include at least 1 clinical guideline + 2 PubMed citations
- [ ] Reviewer is set correctly in the seeded `editorial-reviewer.json`
- [ ] Page renders fully in browser (sections, schema, images, breadcrumb, doctor cards)

---

## 13. Commit format

```
content(<slug>): tier-1 EEAT-grade page

- N words, K FAQs (K schemaEligible)
- N sources (PubMed PMID counts: X)
- N internal links (M confusedWith, N coOccurring, P related)
- N images sourced from <CDC PHIL / Wikimedia / Radiopaedia / etc.>
- Reviewed by <reviewer slug>

Validation: passed (scripts/insert-condition-content.mjs)
Render check: passed (http://localhost:3500/us/en/<slug>)
```

One condition per commit. Easier to revert, audit, and review.

---

## 14. Tooling reference

| Script | Purpose |
|---|---|
| `node scripts/analyze-condition-tiers.mjs` | Re-generate `docs/condition-tier-analysis.json` |
| `node scripts/check-slugs.mjs <slug>` | Verify a slug exists; check before linking |
| `node scripts/check-slugs.mjs --search <term>` | Search for candidate slugs by name |
| `node scripts/seed-editorial-reviewer.mjs` | Idempotent — re-runs are safe |
| `node scripts/insert-condition-content.mjs <slug>` | Validate + upsert content into DB |

After inserting, verify rendering: `curl http://localhost:3500/us/en/<slug> | wc -c` should be > 250 KB and grep should find your section content.

---

## 15. Common failures and how to fix

| Validator error | Cause | Fix |
|---|---|---|
| `Word count N < 2,500` | Sections are too short, especially the prose sections | Expand definition, diagnosisOverview, treatmentOverview, or add more FAQ items |
| `Banned phrase used: "X"` | You wrote one of the templated AI openers | Rewrite the sentence to be specific. Don't game the regex. |
| `metaDescription length N not in 140-165` | Too long or too short | Trim adjectives, prefer concrete fact density |
| `Source has weak title: "X"` | Title is too short or missing authors | Use the full citation: `<Authors> <Year>. <Title>. <Journal>;<vol>:<pp>` |
| `Referenced slugs not found in MedicalCondition` | Slug typo or doesn't exist | Use `check-slugs.mjs --search` to find the right slug |
| `schemaEligible FAQs N < 12` | Too many FAQ answers exceed 300 chars | Shorten the answers OR mark fewer as schemaEligible (the validator wants ≥12 short ones) |

---

## 16. Live working example

`docs/conditions-content/gout.json` — 5,323 words, 21 FAQs (all schemaEligible), 8 real PubMed/NICE citations, ICD-10 M10, 4 confused-with links, 5 related conditions, 3 co-occurring. Inserted as ConditionPageContent row 484. Rendered at `http://localhost:3500/us/en/gout`.

Use it as the template for everything else. **Don't start from scratch — copy this and rewrite section by section.**

---

## 17. Roadmap items not in v1

These are flagged for future work; do not block content writing today:

- Multiple MediaAsset rows per condition (currently only `assetType: render` is rendered)
- Image credit/attribution rendering on the page
- Image-search-optimized alt text and structured data (`ImageObject` schema)
- Automated link-check job against `sources[]` URLs
- Per-specialty reviewer assignment workflow
- Localized cost rendering (handled in `TreatmentCost` table, not the prose)
- Translation pipeline triggered automatically after English approval
- Geo-multiplied long-tail prose (Tier-2 city/country variants)
- Canonical-redirect / noindex pipeline for the 65k ICD variants

---

**Owner:** Content engineering · **Last edited:** 2026-05-12 · **Status:** v1
