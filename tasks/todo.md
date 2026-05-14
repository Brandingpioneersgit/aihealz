# Plan of Action — Make the Programmatic Pages Genuinely Unique & Indexable

> Created 2026-05-14. Supersedes the 2026-05-07 triage doc (archived in git history).
>
> Goal: grow the set of **indexed, genuinely-distinct** condition × geography
> pages from ~800 today toward tens of thousands, tier by tier. The long
> tail stays `noindex,follow` + canonical-to-country — that is correct SEO,
> not a failure.

## The constraint we are building around

`computeLocalDataDensity()` (content-engine.ts) decides `isIndexable`:

```
isIndexable =
  country ∈ {in, us}                       // ROLLOUT_COUNTRY_CODES
  AND hasPageContent                       // condition_page_content row exists
  AND ( geoLevel == 'country'
        OR hasCityCost                     // city-level treatment_costs row
        OR hasLocalContent                 // non-fallback localized_content row
        OR doctorCount >= 3 )              // ≥3 geo-matched verified doctors
```

## Current state (measured 2026-05-14)

| Signal | State | Implication |
|---|---|---|
| `condition_page_content` | 404 conditions (of 72,135) | **Master gate.** Only 404 conditions can ever be indexed. |
| `treatment_costs` | **0 rows** | `/cost` route empty; `hasCityCost` never true. |
| `localized_content` | **0 rows** | `hasLocalContent` never true. |
| Doctors ≥3 per (city×specialty) | 266 cells; India in 3 cities, USA in 2 | `doctorCount>=3` rarely true. |
| Rollout cities | India 63 defined / 3 with doctors, USA 2 | Universe is small. |
| `docs/conditions-content/*.json` | 319 files | Existing content pipeline output. |

**Indexable today:** ~404 conditions × {india,usa} country pages ≈ **800 pages**.
Every sub-country page is currently `noindex` (no costs, no local content,
<3 doctors).

## Strategy — 5 workstreams, WS1 gates the rest

```
WS1 Condition page content ──┬─> WS2 Treatment costs ──┐
   (the master gate)         ├─> WS3 Doctor coverage   ├─> WS5 Rollout + verify
                             └─> WS4 Localized content ┘
```

---

## WS1 — Condition page content (UNBLOCKS EVERYTHING)

Without `condition_page_content`, a condition is `noindex` at every geo.
Scale the existing `docs/conditions-content/` → `insert-condition-content.mjs`
pipeline.

- [ ] Decide the **target condition set**: NOT all 72k (most are raw ICD-10
      variant codes that correctly canonical to a base). Target the
      consumer-facing conditions — estimate 1,500–3,000. Produce the list
      (short slug, no trailing ICD code, has description, not `isNonCondition`).
- [ ] Audit `generate-next-batch.mjs` — confirm it can batch-generate the
      target set; measure per-batch AI cost & time.
- [ ] Generate content in batches of ~50 (existing batch convention).
- [ ] Import via `insert-condition-content.mjs`; verify `condition_page_content`
      row count climbs.
- [ ] Quality gate: word count ≥ target, EEAT fields populated, schema valid.

**Exit:** target conditions all have `condition_page_content` → country-level
pages for them become indexable.

## WS2 — Treatment costs (powers /cost route + hasCityCost)

`treatment_costs` is completely empty — the entire `/cost` route (~7M URLs)
renders with no data, and `hasCityCost` can never be true.

- [ ] **Country-level first.** Build `scripts/generate-treatment-costs.ts`:
      per (condition × treatment × rollout country), produce min/max/avg from
      AI estimate or a reference table. Start with `in` + `us`.
- [ ] **City fan-out.** For major cities, derive city costs = country cost ×
      city cost-of-living multiplier (reuse the regional-multiplier concept
      already in `advertise/pricing`). Writes `city_slug` rows.
- [ ] Verify `/india/en/<cond>/cost` renders real numbers; spot-check 10.
- [ ] Confirm `hasCityCost` flips `isIndexable` for covered city pages.

**Exit:** rollout-country `/cost` pages populated; major-city condition pages
gain the `hasCityCost` signal.

## WS3 — Doctor coverage (powers doctorCount ≥ 3)

Only 3 Indian + 2 US cities have any doctors. Need ≥3 verified doctors per
(major city × specialty).

- [ ] Pick the **major-city set**: top ~25 India + top ~15 US cities by
      population (from `geographies`).
- [ ] Fix `seed-doctors-all-regions.ts` (its condition-slug linking is dead —
      already bypassed by the new `specialty` column; just needs to set
      `specialty` directly + `geography_id` + `is_verified`).
- [ ] Seed ≥3 doctors per (major city × ~30 specialties) → ~40 cities × 30 ×
      3 ≈ 3,600 doctor rows. Run `derive-doctor-specialty.ts` after.
- [ ] Verify coverage query: every (major city × specialty) cell ≥ 3.
- [ ] **Decision needed:** synthetic doctors (fast, precedent exists) vs.
      importing a real dataset. Recommendation: synthetic now, real later.

**Exit:** major-city condition pages gain the `doctorCount>=3` signal; doctor
sections populate site-wide.

## WS4 — Localized content (richest uniqueness signal)

`localized_content` per (condition × geography) — genuinely location-specific
text: local prevalence, treatment availability, consultation tips, local
factors. This is the strongest anti-duplicate signal and powers
`hasLocalContent`.

- [ ] Build `scripts/generate-localized-content.ts` — AI pipeline keyed on
      (condition_id, language_code, geography_id), writes `title`,
      `description`, `localized_advice`, `local_factors`, `consultation_tips`,
      `meta_title`, `meta_description`, `status='ai_draft'`.
- [ ] **Tier it** — do NOT attempt 7M. Scope: WS1 target conditions ×
      major-city set (WS3) × `en` first. Estimate rows & AI cost before run.
- [ ] Confirm `resolveLocalContent` returns these as non-fallback so
      `hasLocalContent` flips true for covered pages.
- [ ] Generate in batches; track `word_count` + `status`.

**Exit:** major-city condition pages have real local copy → genuinely unique,
not just templated; `hasLocalContent` true for covered pages.

## WS5 — Rollout expansion + verification

- [ ] Expand `ROLLOUT_COUNTRY_CODES` in content-engine.ts as data lands per
      country (start `in` → add `us` → expand).
- [ ] Regenerate sitemap (`scripts/generate-sitemaps.ts`) after each major
      data load so newly-indexable URLs surface.
- [ ] Add `scripts/coverage-report.ts`: % conditions with page content, %
      (city×specialty) cells ≥3 doctors, % conditions with costs/local content,
      count of `isIndexable` pages. Run before/after each workstream.
- [ ] Submit sitemap to Search Console; monitor indexed count + impressions.
- [ ] Deploy after each workstream; verify live with the uniqueness probe.

---

## Decisions — LOCKED 2026-05-14

1. **Target condition count (WS1):** ~1,500 core consumer conditions.
2. **AI budget:** estimate first on a 10-item sample, project the full run,
   confirm before committing the batch run.
3. **Doctors (WS3):** **real dataset only** — WS3 is BLOCKED until the user
   provides a real doctor dataset to import. No synthetic seeding.
4. **City tier size:** TBD when WS2/WS4 start (default ~25 India + ~15 US).
5. **Execution order:** WS1 → (WS2 + WS3) parallel → WS4 → WS5.
   - WS3 blocked on dataset; WS2 proceeds alone in the parallel slot until then.

## Review

_(to be filled in as workstreams complete)_
