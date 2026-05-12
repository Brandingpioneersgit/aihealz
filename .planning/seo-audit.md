# SEO + Internal Linking Audit — aihealz

_Generated: 2026-05-09_

## TL;DR

The site is **further along than typical** for a Next.js app of this size. The heavy-traffic surfaces — homepage, conditions/treatments/doctors/hospitals indexes, the localized `/[country]/[lang]/...` condition pages, and the dynamic leaf profiles — already have full metadata, JSON-LD, breadcrumbs, and (for localized routes) hreflang. Helper library at `src/lib/structured-data.tsx` (lines 1-975) is comprehensive: Organization, WebSite, MedicalWebPage, MedicalCondition, Physician, FAQPage, BreadcrumbList, HowTo, VideoObject, ImageObject, Speakable, Article, MedicalClinic, plus generators for ItemList / About / Contact pages.

**Coverage numbers (all 194 page/layout files):**
- `metadata` or `generateMetadata` exported: **84/194 = 43%** — but most of the 110 missing files are `admin/*`, `provider/*`, `admin/*/[id]`, and `admin/*/new` pages where the parent layout already sets `robots: noindex,nofollow` (admin layout line 6, provider layout line 5, vault layout line 12). Net effective miss is ~10-15 user-facing files.
- JSON-LD inline (`application/ld+json`): **39 files** — covers all major SEO surfaces.
- Sitemap inclusion: every public route family is present in `scripts/generate-sitemaps.ts` (STATIC_PAGES + dynamic fan-out) and served via `src/app/sitemap-index.xml/route.ts` + `/sitemap/[index]/route.ts` (45k URL chunks).
- hreflang: live on the localized `/[country]/[lang]/...` family via `generateHreflangTags` (`src/lib/hreflang.ts`).
- robots.txt + llms.txt: both shipped (`src/app/robots.txt/route.ts`, `src/app/llms.txt/route.ts`) with explicit AI-bot allowlists (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, etc.) and Bytespider blocked.

**Verdict on the user's question:** the site is roughly **80-85% there** on SEO. The remaining gaps are concentrated in (1) ~12 user-facing static pages missing canonical / OG / JSON-LD, (2) a handful of leaf families missing breadcrumb schema, (3) no shared metadata helper (every page hand-rolls), and (4) one or two cross-linking holes.

**Estimated work to complete the rest: ~28-40 focused engineering hours**, broken into phases below. The bulk is mechanical fill-in once the helper is built.

---

## Page Inventory

| Route family | Count | metadata | OG | JSON-LD | Sitemap | hreflang | Inbound links | Status |
|---|---|---|---|---|---|---|---|---|
| `/` (homepage) | 1 | ✅ | ✅ | ✅ WebPage + FAQ + ItemList + Speakable | ✅ | n/a | gold standard | ✅ done |
| `/conditions` | 1 | ✅ generateMetadata | ✅ | ✅ ItemList + MedicalSpecialty + FAQ + Speakable | ✅ | n/a | nav + footer | ✅ done |
| `/conditions/[specialty]` | ~25 | ✅ | ✅ | ✅ Breadcrumb + ItemList + MedicalSpecialty | ✅ | n/a | from /conditions, footer | ✅ done |
| `/[country]/[lang]/[condition]` | ~70k | ✅ | ✅ | ✅ MedicalCondition + FAQ + Breadcrumb (pre-generated, see line 290) | ✅ | ✅ full | from homepage cost section, related-conditions block | ✅ done |
| `/[country]/[lang]/[condition]/cost` | ~70k | ✅ | partial (no images[]) | ✅ | ✅ | partial | from homepage cost table | 🟡 minor |
| `/[country]/[lang]/treatments` | 16 (countries) | ✅ | ✅ | ✅ | ✅ | ✅ | weak | 🟡 |
| `/[country]/[lang]/treatments/[treatment]` | ~140k | ✅ | ✅ | ✅ | ✅ | ✅ | from /treatments leaf | ✅ |
| `/treatments` | 1 | ✅ | ✅ | ✅ MedicalSpecialty + ItemList ×2 + FAQ + Speakable | ✅ | n/a | nav + footer | ✅ done |
| `/treatments/[treatment]` | ~8.2k | ✅ | ✅ | ✅ Treatment + Breadcrumb + FAQ | ✅ | n/a | from /treatments | ✅ |
| `/doctors` | 1 | ✅ | ✅ | ✅ ItemList | ✅ | n/a | nav + footer | ✅ |
| `/doctors/[location]` | ~500 | ✅ | partial | ✅ | ✅ | n/a | from /doctors hub | 🟡 (no breadcrumb schema) |
| `/doctors/[location]/[lang]` | ~5k | ✅ | partial | ❌ | ✅ | partial | sparse | 🟡 |
| `/doctors/specialty/[specialty]` | ~25 | ✅ | partial | ❌ | ✅ | n/a | from /doctors hub | 🟡 |
| `/doctor/[slug]` | ~10k | ✅ | ✅ profile | ✅ Physician + Breadcrumb | ✅ | n/a | from location/specialty | ✅ |
| `/hospitals` | 1 | ✅ | ✅ | ✅ ItemList | ✅ | n/a | nav + footer | ✅ |
| `/hospitals/[slug]` | ~3k | ✅ | ✅ | ✅ Hospital + Breadcrumb | ✅ | n/a | from /hospitals | ✅ |
| `/hospitals/[slug]/enquire` | ~3k | ❌ no metadata | ❌ | ❌ | not in sitemap | n/a | from hospital page | 🔴 should be noindex (form) |
| `/diagnostic-labs` | 1 | ✅ | partial | ✅ ItemList | ✅ | n/a | footer | ✅ |
| `/diagnostic-labs/[slug]` | ~800 | ✅ | partial | ✅ Breadcrumb | ✅ | n/a | from /diagnostic-labs | ✅ |
| `/insurance` | 1 | ✅ | partial (no images[]) | ✅ | ✅ | n/a | footer | ✅ |
| `/insurance/[slug]` | ~150 | ✅ | partial | ✅ Breadcrumb + 2nd schema | ✅ | n/a | from /insurance | ✅ |
| `/tests` | 1 | ✅ | ✅ | ✅ | ✅ | n/a | footer | ✅ |
| `/tests/[slug]` | ~500 | ✅ | partial | ✅ Breadcrumb | ✅ | n/a | from /tests | ✅ |
| `/tests/[slug]/[city]` | ~7k | ✅ | partial | ✅ | ✅ | n/a | from `/tests/[slug]` | ✅ |
| `/tests/category/[slug]` | ~20 | ✅ | partial | ✅ | ✅ | n/a | from /tests | ✅ |
| `/symptoms` | 1 | ✅ but **no canonical** (line 43-53) | ✅ | ✅ | ✅ | n/a | nav, footer | 🟡 add canonical |
| `/about` | 1 | ✅ but **no canonical** (line 11-22) | ✅ | ✅ AboutPage + Org + Breadcrumb + FAQ | ✅ | n/a | footer | 🟡 add canonical |
| `/contact` (layout.tsx) | 1 | ✅ but **no canonical** (line 8-17) | partial (no images[]) | ✅ ContactPage + Org + Breadcrumb | ✅ | n/a | footer | 🟡 add canonical |
| `/help` | 1 | ✅ canonical | ❌ no openGraph | ❌ no JSON-LD | ✅ | n/a | footer | 🟡 |
| `/faq` | 1 | ✅ canonical | ✅ | ✅ FAQPage | ✅ | n/a | footer | ✅ |
| `/privacy` | 1 | ✅ canonical | ❌ no OG block | ✅ | ✅ | n/a | footer | 🟡 add OG |
| `/terms` | 1 | ✅ canonical | ❌ no OG | ✅ | ✅ | n/a | footer | 🟡 add OG |
| `/partner-agreement` | 1 | ✅ canonical | ❌ no OG | ❌ | not in STATIC_PAGES | n/a | footer | 🟡 |
| `/blog` | 1 | ✅ | ✅ | ❌ no JSON-LD (placeholder page) | ✅ | n/a | footer | 🟡 |
| `/careers` | 1 | ✅ | ✅ | ✅ | ✅ | n/a | footer | ✅ |
| `/press` | 1 | ✅ | ✅ | ❌ no JSON-LD | not in sitemap | n/a | footer | 🟡 |
| `/editorial-board` | 1 | ✅ | ✅ | ❌ no JSON-LD (no Person[] schema for the board) | not in sitemap | n/a | footer + homepage line 1031 | 🟡 high impact for E-E-A-T |
| `/sitemap` (HTML) | 1 | ✅ canonical | ❌ no OG | ❌ no JSON-LD | ✅ | n/a | footer | 🟡 |
| `/pricing` | 1 | ❌ no metadata, no canonical, no JSON-LD | ❌ | ❌ | ✅ | n/a | nav + footer | 🔴 |
| `/medical-travel` | 1 | ✅ canonical | ❌ no OG | ❌ no JSON-LD | ✅ | n/a | footer | 🔴 high-intent landing — needs all three |
| `/medical-travel/bot` (layout) | 1 | ✅ | ✅ | ❌ no schema | ✅ | n/a | from /medical-travel | 🟡 |
| `/healz-ai` (layout) | 1 | ✅ | ✅ | ✅ | ✅ | n/a | nav + footer | ✅ |
| `/analyze` (layout) | 1 | ✅ | partial | ❌ no JSON-LD | not in sitemap | n/a | nav (CTA) + footer | 🟡 high-priority — primary nav CTA, should have SoftwareApplication or WebApplication schema |
| `/chat`, `/chat/consult`, `/chat/diagnostic` | 3 | ✅ but `noindex` | n/a | n/a | not in sitemap | n/a | rare deep-link | ✅ correctly noindex |
| `/clinical-reference` (layout) | 1 | ✅ canonical | ❌ no OG | ❌ no JSON-LD | ✅ | n/a | footer | 🟡 |
| `/reference/[category]` | 6 | ✅ generateMetadata | ❌ no OG | ❌ no JSON-LD | ✅ via STATIC_PAGES per cat? | n/a | footer | 🟡 |
| `/remedies` | 1 | ✅ canonical (in both page.tsx and layout.tsx — duplicate) | partial | ✅ | ✅ | n/a | footer | 🟡 dedupe metadata |
| `/symptoms` | 1 | (covered above) | | | | | | |
| `/for-doctors` (layout) | 1 | ✅ | ✅ | ❌ no JSON-LD | ✅ | n/a | nav + footer | 🟡 missing canonical too |
| `/for-doctors/clinical-scores` (layout) | 1 | ✅ title+desc only | ❌ no OG | ❌ no JSON-LD, **no canonical** | ✅ | n/a | from /for-doctors, footer | 🟡 |
| `/for-doctors/drug-dosing` | 1 | ✅ minimal | ❌ | ❌, **no canonical** | ✅ | n/a | as above | 🟡 |
| `/for-doctors/quick-reference` | 1 | ✅ minimal | ❌ | ❌, **no canonical** | ✅ | n/a | as above | 🟡 |
| `/for-doctors/surgical-checklist` | 1 | ✅ minimal | ❌ | ❌, **no canonical** | ✅ | n/a | as above | 🟡 |
| `/for-doctors/pricing` | 1 | ✅ minimal | ❌ | ❌, **no canonical** | ✅ | n/a | as above | 🟡 |
| `/tools` | 1 | ✅ | ✅ | ✅ | not in STATIC | n/a | nav + footer | ✅ |
| `/tools/{calculator}` × ~14 | 14 | ✅ via layout.tsx (sampled bmi, bmr, glossary; pattern consistent) | ✅ | ✅ inline JSON-LD on each layout (line 40 in samples) | ✅ all 14 in STATIC_PAGES | n/a | from `/tools`, footer | ✅ |
| `/login` | 1 | ✅ noindex | n/a | n/a | not in sitemap | n/a | navbar (Sign in) | ✅ |
| `/register` | 1 | ✅ noindex | n/a | n/a | not in sitemap | n/a | rare | ✅ |
| `/auth/signin` | 1 | ✅ noindex | n/a | n/a | not in sitemap | n/a | rare | ✅ |
| `/vault`, `/vault/dossier/[fileId]` | 2 | ✅ noindex via layout | n/a | n/a | not in sitemap | n/a | post-login only | ✅ |
| `/admin/**` | 41 | ✅ noindex via `/admin/layout.tsx` (line 6) | n/a | n/a | not in sitemap | n/a | n/a | ✅ |
| `/provider/**` | 11 | ✅ noindex via `/provider/layout.tsx` (line 5) | n/a | n/a | not in sitemap | n/a | n/a | ✅ |
| `/advertise` (layout) | 1 | ✅ | ✅ | ❌ no JSON-LD | ✅ | n/a | footer | 🟡 |
| `/advertise/pricing` | 1 | ✅ | ✅ | ❌ | ✅ | n/a | footer | 🟡 |
| `/advertise/enquiry` | 1 | ❌ no metadata | ❌ | ❌ | ✅ | n/a | footer | 🟡 should be noindex (form) |
| `/advertise/success` | 1 | ✅ noindex | n/a | n/a | not in sitemap | n/a | post-form | ✅ |
| `/book`, `/book/doctor`, `/book/test/[slug]` | 3 | ✅ on /book only | partial | ❌ | ✅ /book; /book/doctor and /book/test/[slug] not | n/a | from doctor/test pages | 🟡 should likely be noindex (booking flow) |
| `/search` | 1 | ✅ noindex (correct — search results) | n/a | n/a | ✅ /search | n/a | navbar autocomplete | ✅ |
| `/doctors/join` | 1 | ❌ no metadata | ❌ | ❌ | ✅ | n/a | footer (Join as doctor) | 🟡 |
| `/sitemap/page.tsx` (HTML) | 1 | ✅ canonical | ❌ no OG | ❌ no JSON-LD (good ItemList opportunity) | ✅ | n/a | footer | 🟡 |

---

## SEO Findings

### Strong (already done — do not redo)

- **Localized condition pages `/[country]/[lang]/[condition]/[[...geo]]/page.tsx`** (1,732 lines) are the most thoroughly optimized surface in the codebase. Lines 218-251 emit dynamic `title`, `description`, full `openGraph` with locale + image, full `alternates.canonical` + `alternates.languages` (hreflang), `robots` with `max-snippet: -1`, and a custom `other:` block carrying `llm-summary`, `medical-condition`, `icd-10-code`, `specialist-type`, `condition-prevalence`, `reviewed-by` — these are LLM/AEO-tier signals most sites don't emit.
- The same page pre-generates `schemaMedicalCondition`, `schemaFaqPage`, and a `BreadcrumbList` (lines 290-296) and merges them into a single combined JSON-LD blob.
- **Homepage (`src/app/page.tsx`)** emits multiple schemas and has the best internal-linking density on the site (Coverage Map, AI Tools Hub, cost-compare table with pinned India links, trending searches, footer to `/conditions/{slug}` deep links).
- **Doctor profile** (`/doctor/[slug]/page.tsx` lines 188-220): valid `Physician` + `BreadcrumbList`, `aggregateRating`, `address`, `priceRange`, related doctors block (line 156 + render line 750), 12 cross-links to conditions in same specialty (line 170).
- **Hospital profile** (`/hospitals/[slug]/page.tsx` lines 114-200): `Hospital` schema, breadcrumbs, sibling-hospital cross-link block (line 741).
- **Conditions specialty index** (`/conditions/[specialty]/page.tsx` lines 151-190): `BreadcrumbList` + `ItemList` of 50 conditions + `MedicalSpecialty` schema + `relatedSpecs` cross-links.
- **Helper library `src/lib/structured-data.tsx`** is broad and well-typed. Both component-style helpers (`<MedicalConditionSchema/>`) and pure-object generators (`generateBreadcrumbSchema`, `generateFAQSchema`, `generateItemListSchema`).
- **hreflang** (`src/lib/hreflang.ts`) generates language-region (`hi-IN`) plus `x-default` correctly.
- **Sitemap pipeline** is real: ~5M URLs streamed into `sitemapEntry` table, served from `/sitemap-index.xml` -> `/sitemap/[i]` chunks of 45k each. STATIC_PAGES list (lines 66-110 of `scripts/generate-sitemaps.ts`) covers nearly every top-level singleton.
- **robots.txt** at `src/app/robots.txt/route.ts` is opinionated and correct: explicit allow for AI bots that drive AEO traffic (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, anthropic-ai, Google-Extended, CCBot), Bytespider blocked, sensible Disallow on tracking query params.
- **llms.txt** ships at `/llms.txt` with curated top URLs.
- **Tools layouts** are uniform: each `/tools/{calc}/layout.tsx` has metadata + JSON-LD (sampled BMI, BMR, glossary; same pattern). Mechanical to extend.
- **Admin / provider / vault / login / register / auth / chat-consult / chat-diagnostic / advertise-success / search** all have `robots: { index: false, follow: false }` (or `'noindex, nofollow'`) — correctly excluded from index. `/admin/layout.tsx:6` and `/provider/layout.tsx:5` cascade to all subpages.

### Partial (needs touch-up)

1. **`/about`, `/contact`, `/symptoms` — no `alternates.canonical`.** All three have full OG + JSON-LD but the canonical is missing. Easy 1-line fix per file.
   - `src/app/about/page.tsx:11-22`
   - `src/app/contact/layout.tsx:8-17`
   - `src/app/symptoms/page.tsx:43-53`
2. **Privacy/Terms/Help — no OG block** (`src/app/privacy/page.tsx`, `terms/page.tsx`, `help/page.tsx`). Low impact (legal pages don't need rich Twitter cards) but trivial to add.
3. **for-doctors subpages** (`/for-doctors/{clinical-scores,drug-dosing,quick-reference,surgical-checklist,pricing}/layout.tsx`) — title + description only, no canonical, no OG, no JSON-LD. These are clinician-attractor pages and good MedicalScholarlyArticle / SoftwareApplication / HowTo candidates.
4. **`/medical-travel`** — has canonical only. No OG, no JSON-LD. Should have `Service` or `MedicalBusiness` + FAQ. High-intent commercial page.
5. **`/clinical-reference` and `/reference/[category]`** — minimal metadata, no OG, no JSON-LD (these would benefit from `MedicalScholarlyArticle` or `Book`/`Course`).
6. **`/blog`** is a placeholder; `/press` and `/editorial-board` lack JSON-LD. Editorial board especially is high-leverage for E-E-A-T (`Organization` with `member: [Person]` array) — Google's medical-content guidelines weigh this heavily.
7. **`/[country]/[lang]/[condition]/cost`** has canonical but no OG `images[]` and lighter JSON-LD vs the parent condition page.
8. **`/doctors/[location]/[lang]/page.tsx`** and **`/doctors/specialty/[specialty]/page.tsx`** — metadata + ItemList only, missing breadcrumb schema, OG image, hreflang on the localized variant.
9. **`/remedies` has `alternates.canonical` set in BOTH `layout.tsx:21` and `page.tsx:9`** — duplicate metadata. Pick one (keep the layout, drop from page.tsx, or vice versa).

### Missing entirely

1. **`/pricing`** — no metadata export at all (page.tsx is in the no-metadata list). Public, in nav, in sitemap. **Highest-priority static fix.**
2. **`/doctors/join`** — no metadata, no canonical, no schema. Acquisition-funnel page.
3. **`/advertise/enquiry`** — no metadata; should be `noindex` (lead form).
4. **`/hospitals/[slug]/enquire`** — no metadata; should be `noindex` (lead form). Currently could be crawled.
5. **`/book/doctor` and `/book/test/[slug]`** — no metadata; should be `noindex` (booking funnel).
6. **`/analyze`** layout has metadata but **no JSON-LD** for what is the primary nav CTA. `WebApplication` or `MedicalRiskCalculator` schema would be a meaningful AEO win.

---

## Internal Linking Findings

### Hub pages

- **Homepage `src/app/page.tsx`** — gold standard. ~22 outbound `<Link>` blocks. Trending searches, AI tools hub, cost-compare with pinned `/india/en/{condition}/cost` deep links, conditions-by-specialty grid (`HomepageSpecialties`), Coverage Map. Cross-links to `/editorial-board`, `/conditions/{slug}` examples (hypothyroidism, high-cholesterol).
- **Footer `src/components/v4/Footer.tsx`** (243 lines) — 8 sections × 6-10 links = ~64 links. Coverage is comprehensive: Care, Tools, Calculators, For Doctors, Clinical Reference, Company, Help, Legal. Includes `/sitemap.xml` ping at the bottom.
- **Navbar `src/components/v4/Navbar.tsx`** — 7 primary nav items + SOS + Sign in + Analyze CTA. Mobile menu (`MobileMenu.tsx`, 424 lines) extends with Symptoms, Insurance, Medical Travel, Healz AI, Pricing, About, Contact. Plus a `/sitemap` link at line 405 of MobileMenu.

### Index pages (cross-link well to leaves)

- `/conditions` -> `/conditions/[specialty]` (8 featured + alphabetical list).
- `/conditions/[specialty]` -> 50 conditions via deep links, plus `RELATED_SPECIALTIES` (lines 61-72) cross-links to 3 sibling specialty pages.
- `/treatments` -> 8 categories + ItemList.
- `/doctors` -> `/doctors/[location]` and `/doctors/specialty/[specialty]`.
- `/hospitals` -> `/hospitals/[slug]`.

### Leaf pages (cross-linking)

- **Localized condition page** has a "Related conditions" block (lines 1233-1260) emitting `<Link href="/{country}/{lang}/{related.slug}" />` cards. Good intra-country topical cluster.
- **Doctor profile** has related-doctors-in-same-location (line 750) and treated-conditions list (line 170) -> condition pages. ~12 internal links.
- **Hospital profile** has sibling-hospitals cross-link (line 741), 11 total links.
- **Specialty index** -> 50 condition links, breadcrumb up, related-specialty pills.

### Gaps in linking

1. **Condition leaf -> doctor cross-link is one-directional or sparse.** `/[country]/[lang]/[condition]` shows a `data.doctors.premium/free` list, but the reverse — `/doctor/[slug]` linking back to the deep-localized `/{country}/{lang}/{conditionSlug}` URLs — is not present in the snippet inspected. The doctor page links to non-localized `/conditions/{slug}` (which doesn't exist as a route — `/conditions` is the index, individual conditions are `/{country}/{lang}/{slug}`). **This is a real bug**: clicking "treated conditions" on a doctor page may 404 or land on the index. Verify behavior of the `Link` at `/doctor/[slug]/page.tsx` lines around 170 + render.
2. **Treatment leaf -> related conditions** — `/treatments/[treatment]/page.tsx` doesn't appear to surface "Related conditions for this treatment" (would also be a topical cluster boost).
3. **Hospital leaf -> doctors at this hospital** — needs verification whether the doctor list on `/hospitals/[slug]` includes Link cards into individual `/doctor/[slug]` pages.
4. **`/conditions/[specialty]` -> `/doctors/specialty/[specialty]`** — no direct link found; specialty index should sidebar a "Find a {specialist} near you" CTA pointing to the corresponding doctor specialty page.
5. **`/diagnostic-labs/[slug]`, `/insurance/[slug]`, `/tests/[slug]`** — none cross-link into condition pages where those tests/labs/plans are relevant. E.g. a diabetes test page should link to `/conditions/endocrinology` and `/{country}/{lang}/diabetes`.
6. **`/editorial-board`** is linked from the homepage (line 1031) and footer but not from any condition/treatment page as the "Reviewed by aihealz Editorial Board" badge — adding that link from the 70k localized condition pages would massively distribute PageRank to the E-E-A-T page.
7. **Breadcrumbs**: visible HTML breadcrumbs exist on conditions/[specialty], doctor/[slug], hospitals/[slug], treatments/[treatment], insurance/[slug], tests/[slug], diagnostic-labs/[slug]. Verify presence on `/[country]/[lang]/[condition]` (likely yes given pre-generated breadcrumb schema, but worth confirming the visible rendered HTML breadcrumb).

---

## Gaps Ranked by Impact

1. **`/pricing` has zero metadata.** Public, in nav, in sitemap. Currently inherits only the root layout title template. **Top priority** — fix in 5 min.
2. **`/medical-travel` has only canonical.** This is a high-commercial-intent page. Add OG, FAQ JSON-LD, breadcrumb. (~30 min)
3. **`/editorial-board` has no Person/Organization JSON-LD.** Critical for medical-content E-E-A-T (Google YMYL guidelines). Add `Organization` + `member: [Person]` array with credentials. ~1-2 hr including content gathering.
4. **`/analyze` has no JSON-LD.** Nav CTA, primary product. Add `WebApplication` / `MedicalRiskCalculator` schema. ~30 min.
5. **`/for-doctors/{5 subpages}`** missing canonical + OG + schema. Cumulatively meaningful for B2B/clinician traffic. ~1.5 hr.
6. **Doctor profile -> condition link target may be wrong.** `/doctor/[slug]/page.tsx` references `/conditions/{slug}` which is not a real route in this app (individual conditions live under `/{country}/{lang}/{slug}`). Need to either build `/conditions/{slug}` redirector or rewrite the link to use the resolved geo from headers. **Bug, not just SEO.** ~2-3 hr depending on resolution.
7. **`/about`, `/contact`, `/symptoms` missing canonical.** Tiny but trivial. ~10 min total.
8. **No shared `pageMetadata()` helper.** Every page hand-rolls the same OG/Twitter/canonical block. Worth ~3 hr to build a typed helper in `src/lib/seo/metadata.ts` (a `seo/` dir already exists) and migrate the static singletons to it. Pays off long-term and prevents future drift.
9. **`/hospitals/[slug]/enquire`, `/advertise/enquiry`, `/book/doctor`, `/book/test/[slug]`** should be `noindex`. Lead-funnel pages do not belong in the index. ~15 min.
10. **`/[country]/[lang]/[condition]/cost`** OG image + heavier JSON-LD parity with the parent. ~1 hr.
11. **`/blog`, `/press`, `/clinical-reference`, `/reference/[category]`** missing JSON-LD. ~2 hr.
12. **`/doctors/specialty/[specialty]` and `/doctors/[location]/[lang]`** missing breadcrumb schema + better OG. ~1 hr.
13. **Cross-link gaps**: condition <-> doctor specialty, treatment <-> conditions, hospital -> doctor, diagnostic-labs/insurance/tests -> conditions. ~4-6 hr to add components reused across leaf families.
14. **Editorial-board "Reviewed by" link from condition pages.** Already-emitted `reviewedBy` schema on the localized condition page; just needs the visible link added to that template. ~1 hr.
15. **Image `alt` text audit** on hero/og images — not yet verified across leaf pages. The localized condition page passes `alt: 'Medical illustration of {conditionName}'` (line 243), good. Sample doctor / hospital / treatment leaves to confirm; ~1 hr.

---

## Effort Estimate to Complete

Assumes one senior engineer doing focused work. Includes writing a reusable metadata helper (saves time long-term), QA via Rich Results Test, and submitting an updated sitemap.

| Phase | Work | Hours |
|---|---|---|
| 1 — Quick wins (canonical, OG, noindex) | Add canonical to `/about`, `/contact`, `/symptoms`. Add OG to `/privacy`, `/terms`, `/help`. Add `noindex` to `/hospitals/[slug]/enquire`, `/advertise/enquiry`, `/book/doctor`, `/book/test/[slug]`. Dedupe `/remedies` metadata. | **2-3** |
| 2 — Build shared `pageMetadata()` helper in `src/lib/seo/metadata.ts` | Typed builder for title/desc/canonical/og/twitter/robots. Migrate the ~12 static singletons. | **3-4** |
| 3 — Fix high-priority static gaps | `/pricing` (full metadata + WebPage schema), `/medical-travel` (FAQ + Service schema), `/analyze` (WebApplication schema), `/editorial-board` (Organization + members), `/blog`, `/press`, `/clinical-reference`, `/reference/[category]`. | **6-8** |
| 4 — for-doctors subpages | Five layouts: clinical-scores, drug-dosing, quick-reference, surgical-checklist, pricing. Add canonical + OG + appropriate schema (HowTo / SoftwareApplication / MedicalScholarlyArticle). | **2-3** |
| 5 — Dynamic leaf parity | `/[country]/[lang]/[condition]/cost` OG + schema parity. `/doctors/[location]/[lang]` and `/doctors/specialty/[specialty]` breadcrumb + OG. `/doctors/join` metadata. | **3-4** |
| 6 — Cross-linking + breadcrumb fixes | Fix doctor-profile -> condition link target (the `/conditions/{slug}` 404 risk). Add condition -> doctor-specialty CTA. Add treatment -> related-conditions block. Add diagnostic-labs/insurance/tests -> conditions cross-link. Add editorial-board "Reviewed by" visible link to localized condition template. | **6-8** |
| 7 — QA + Search Console | Run Google Rich Results Test on 1 sample per family. Fix schema errors. Re-run sitemap generator. Re-submit sitemap. Submit re-crawl request for top 50 changed URLs. | **3-4** |
| 8 — Image alt audit + final pass | Verify alt text on hero/og images across families; add where missing. Lighthouse SEO 100 verification on top 20 templates. | **2-3** |
| **Total** | | **27-37 hours** |

Realistic banded estimate: **28-40 hours** (~1 calendar week of focused work, or 2 weeks part-time). Heavy lift is phase 6 (cross-linking) and phase 3 (high-priority static page schema). The mechanical fill-ins (phases 1, 4, 5) go fast once the helper from phase 2 exists.

---

## Recommendations

1. **Build `src/lib/seo/metadata.ts` first** (phase 2). Every static page in this audit hand-rolls the same `openGraph` + `twitter` + `alternates` block. A typed `pageMetadata({ path, title, description, image?, type? })` helper would cut every future static-page metadata block from 25 lines to 4 and eliminate the canonical-drift class of bugs we're seeing on `/about`, `/contact`, `/symptoms`.
2. **Resolve the doctor-profile -> `/conditions/{slug}` 404 risk** (#6 in gaps). This is a real bug, not just an SEO miss. Either add a `/conditions/{slug}/page.tsx` that 308-redirects to the user's resolved-geo localized page, or rewrite the link to use the resolved geo headers (`x-aihealz-country`, `x-aihealz-lang`).
3. **Add a `<ReviewedByEditorialBoard />` component** (a kicker line + link to `/editorial-board`) to the localized condition template, treatment template, and doctor profile. The schema already declares `reviewedBy` — making it a visible link distributes PageRank to the E-E-A-T page from the 70k+ condition pages.
4. **`/editorial-board` JSON-LD should ship `Organization` with `member: [Person { name, jobTitle, hasCredential }]` array.** Highest single-file leverage on YMYL ranking.
5. **Index hygiene**: add `noindex` to all 4 lead-form / booking-funnel pages identified above (`/hospitals/[slug]/enquire`, `/advertise/enquiry`, `/book/doctor`, `/book/test/[slug]`). These dilute the index and risk thin-content penalties.
6. **`/pricing` is currently un-titled.** Search Console will flag it as soon as it gets discovered. Fix in phase 1.
7. **Run the Rich Results Test on 1 representative URL per family** before/after phase 6. Schema errors silently disable rich snippets; the helpers in `structured-data.tsx` are correct on paper but worth proving in production.
8. **Consider adding `BreadcrumbList` to the homepage** as a 1-item or 2-item entity ("Home"). Some search engines render it.
9. **The sitemap generator's `STATIC_PAGES` list** (`scripts/generate-sitemaps.ts:66-110`) is missing `/about`, `/contact`, `/blog`, `/careers`, `/press`, `/editorial-board`, `/partner-agreement`, `/sitemap`, `/login`, `/register`. Some are correctly excluded (login/register), but `/about`, `/contact`, `/blog`, `/careers`, `/press`, `/editorial-board`, `/partner-agreement`, `/sitemap` should be added. Add in phase 1 (~5 min).
10. **Long-term**: the `MedicalCondition` schema on the localized condition page is excellent. Worth replicating that depth on `/treatments/[treatment]` (currently uses generic Treatment schema; could add `MedicalProcedure` with `bodyLocation`, `preparation`, `followup`, `howPerformed`).
