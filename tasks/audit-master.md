# Aihealz Master Audit — 779 Fixable Items

Generated 2026-05-08. Six parallel audits across pages, SEO, navigation, functionality, performance/a11y, and content/security. Items are concrete with file paths. Organized so you can work top-to-bottom.

Severity tags where present: `[CRIT]` exploitable / production-broken, `[HIGH]` likely broken or major SEO loss, `[MED]` quality, `[LOW]` polish.

---

## SECTION 1 — PAGES & ROUTES (108 items)

### 1.1 Missing routes referenced from internal links

1. `src/components/v4/Navbar.tsx:113` `/auth/signin` does not exist (no `src/app/auth/`). Sign-in button is a 404. Fix to `/provider/login` or build the page.
2. `/partner-agreement` referenced from provider flows but no page exists.
3. `src/app/provider/hospital/dashboard/page.tsx` `/provider/hospital/edit` linked but no edit route.
4. `src/app/admin/conditions/page.tsx:34`, `src/app/admin/page.tsx:376` `/admin/conditions/new` only `[id]/page.tsx` exists.
5. `src/app/admin/content/page.tsx:51` `/admin/content/new` doesn't exist.
6. `src/app/admin/insurance/page.tsx:54,168` `/admin/insurance/new` doesn't exist.
7. `src/app/admin/insurance/plans/page.tsx:64,96` `/admin/insurance/plans/new` doesn't exist.
8. `src/app/admin/languages/page.tsx:39` `/admin/languages/new` doesn't exist.
9. `src/app/admin/locations/page.tsx:44` `/admin/locations/new` doesn't exist.
10. `src/app/admin/tpas/page.tsx:58,126` `/admin/tpas/new` doesn't exist.
11. `src/app/admin/diagnostics/tests/page.tsx:38` `/admin/diagnostics/tests/new` doesn't exist.
12. `src/app/admin/diagnostics/packages/page.tsx:47` `/admin/diagnostics/packages/new` doesn't exist.
13. `src/app/admin/advertising/advertisers/page.tsx:54,91` `/admin/advertising/advertisers/new` doesn't exist.
14. `src/app/admin/advertising/pricing/page.tsx:48,80` `/admin/advertising/pricing/new` doesn't exist.

### 1.2 Stub / "Coming Soon" / unfinished sections

15. `src/app/provider/lab/dashboard/page.tsx:330` All non-overview tabs render "coming soon".
16. `src/app/provider/hospital/dashboard/page.tsx:447` Departments tab: "coming soon".
17. `src/app/provider/hospital/dashboard/page.tsx:459` Insurance tab: "coming soon".
18. `src/app/admin/settings/page.tsx:18` Feature flag "Patient Vault (Coming Soon)" hardcoded disabled though `/vault` exists.
19. `src/app/provider/dashboard/page.tsx:330` `// TODO: Implement tele-link booking flow`.

### 1.3 Orphan / hardcoded one-off page

20. `src/app/uk/en/acute-and-subacute-endocarditis-unspecified-i339/page.tsx` 905-line client component shadows the dynamic route. Remove and route through content engine.
21. Same file marked `'use client'` only for an FAQ accordion — should be server component using `<details>`.
22. Same path no localized counterparts; bypasses i18n pipeline.

### 1.4 Duplicate / competing routes

23. `/treatments` vs `/[country]/[lang]/treatments` — pick canonical, 301 the other.
24. `/treatments/[treatment]` vs `/[country]/[lang]/treatments/[treatment]` — same.
25. `/diagnostic-labs` vs `/tests` — duplicate.
26. `/pricing`, `/for-doctors/pricing`, `/advertise/pricing` — three pricing trees.
27. `/healz-ai` vs `/symptoms` — both AI symptom interfaces; footer "Symptom checker" mispoints.

### 1.5 Footer wrong/lazy links

28. `src/components/v4/Footer.tsx:25` "Drug interactions" → `/clinical-reference`; should be `/tools/drug-interactions`.
29. `src/components/v4/Footer.tsx:26` "Risk calculators" → `/clinical-reference`; should be `/tools`.
30. `src/components/v4/Footer.tsx:27` "Glossary" → `/clinical-reference`; should be `/tools/glossary`.
31. `src/components/v4/Footer.tsx:33` "Patients" → `/`; should be `/symptoms` or `/conditions`.
32. `src/components/v4/Footer.tsx:44` "Editorial board" → `/about`; needs own page/anchor.
33. `src/components/v4/Footer.tsx:45` "Careers" → `/about`; no careers page exists.
34. `src/components/v4/Footer.tsx:47` "Terms" → `/privacy`; should be `/terms` (page exists).
35. `src/components/v4/Footer.tsx:24` "Symptom checker" → `/healz-ai`; `/symptoms` is real and distinct.

### 1.6 Dynamic routes with weak / missing 404 handling

36. `src/app/treatments/[treatment]/page.tsx` Never calls `notFound()`. Unknown slugs render with formatted slug + no data.
37. `src/app/[country]/[lang]/treatments/[treatment]/page.tsx` Imports `notFound` but verify it fires on miss.
38. `src/app/reference/[category]/page.tsx` Fixed `CATEGORY_MAP` keys but never calls `notFound()` for invalid; no `generateStaticParams`.
39. `src/app/doctors/specialty/[specialty]/page.tsx` No `notFound()` for unknown specialty.
40. `src/app/conditions/[specialty]/page.tsx:222` Only fires `notFound()` when zero results; doesn't validate slug.
41. `src/app/[country]/[lang]/treatments/page.tsx` Invalid combos render notFound but no middleware redirect to defaults.

### 1.7 Missing loading.tsx / error.tsx / not-found.tsx

42. Only ONE `not-found.tsx` (root). Add per-segment for `[country]/[lang]/[condition]`, `treatments/[treatment]`, `doctor/[slug]`, `hospitals/[slug]`, `insurance/[slug]`.
43. NO `error.tsx` ANYWHERE. Add at root, `/admin`, `/provider`, `/[country]/[lang]/[condition]`.
44. NO `loading.tsx` ANYWHERE. Heavy DB pages show no streaming skeleton.
45. `src/app/admin/` No `admin/error.tsx`.
46. `src/app/provider/` No `provider/error.tsx`.

### 1.8 Client-only detail pages without server-side notFound

47. `src/app/admin/insurance/[id]/page.tsx` Client fetch; "not found" plain message, not Next notFound.
48. `src/app/admin/tpas/[id]/page.tsx` Same.
49. `src/app/admin/hospitals/[id]/page.tsx` Same.
50. `src/app/admin/diagnostics/providers/[id]/page.tsx` Client-only, no proper 404.

### 1.9 Server-vs-client component issues

51. `src/app/admin/sitemap/page.tsx` `'use client'` for a dashboard consuming `/api/admin/seo-monitor`.
52. `src/app/admin/encounters/page.tsx` `'use client'` with all data via fetch.
53. `src/app/admin/footer/page.tsx` `'use client'` for CRUD; should use server actions.
54. `src/app/admin/translation-queue/page.tsx`, `admin/keywords/page.tsx`, `admin/analytics/page.tsx`, `admin/reports/page.tsx` All `'use client'` for read-mostly dashboards.
55. `src/app/admin/layout.tsx:1` Entire admin layout `'use client'` — forces every subtree to hydrate. Split sidebar into a client island.
56. `src/app/contact/page.tsx:1` Entire page `'use client'` because of one form. Extract `<ContactForm>`, keep page server.
57. `src/app/pricing/page.tsx` `'use client'` for a content-heavy pricing matrix; only the tab toggle needs client.
58. `src/app/healz-ai/page.tsx` Fully `'use client'`; no metadata, fully hydrated.

### 1.10 Hardcoded content / data mismatches

59. `src/app/page.tsx:96-99` `totalDoctors = 8_217`, `totalTreatments = 12_400` hardcoded; never queried from DB.
60. `src/app/page.tsx:60-65` `COST_ROWS` hardcoded; never reflects `treatmentCost` table or treatments.json.
61. `src/app/page.tsx:69-75` `TRENDING` array hardcoded; if slugs not in DB, links 404.
62. `src/app/page.tsx:83-88` `EDITORIAL_BOARD` hardcoded with placeholder names.
63. `src/app/page.tsx:77-81` `NOW_READING` placeholder articles, no CMS, no links.
64. `src/app/medical-travel/page.tsx` Entire price table hardcoded constants.
65. `src/app/treatments/[treatment]/page.tsx` Costs sourced only from `public/data/treatments.json`; ignores `prisma.treatmentCost`.

### 1.11 Locale handling gaps

66. `src/app/symptoms/page.tsx` English-only inside `V4Page`; no localized `/symptoms` route.
67. `src/app/healz-ai/page.tsx` Fully English; no language switching.
68. `src/app/conditions/page.tsx`, `/conditions/[specialty]` English-only; no localized parallel.
69. `src/app/doctors/page.tsx` English-only.
70. `src/app/treatments/page.tsx:108-110` Reads middleware headers but content hardcoded English.
71. `src/app/about/page.tsx`, `privacy/page.tsx`, `terms/page.tsx` English only; should at least carry hreflang alternates.
72. `src/app/clinical-reference/page.tsx`, `remedies/page.tsx` English only.

### 1.12 Hospitals / providers / booking detail pages

73. `src/app/hospitals/[slug]/enquire/page.tsx` No server-side check that hospital exists.
74. `src/app/book/doctor/page.tsx`, `src/app/book/test/[slug]/page.tsx` Booking pages do not validate slug or doctor before form.
75. `src/app/diagnostic-labs/page.tsx` No search/filter UI; no pagination.
76. `src/app/insurance/page.tsx` No pagination, no filter UI.
77. `src/app/hospitals/page.tsx` No pagination, no filter UI.

### 1.13 Inline image performance

78. `admin/insurance/[id]/page.tsx:129,380,412`, `admin/hospitals/[id]/page.tsx:190,555`, `admin/tpas/[id]/page.tsx:116,299`, `admin/diagnostics/providers/[id]/page.tsx:154` Raw `<img>` for logos; use `next/image`.

### 1.14 Content / CTA gaps

79. `src/app/symptoms/page.tsx` No related-articles or doctor-CTA after symptom checker.
80. `src/app/medical-travel/bot/page.tsx` "PDF" via `window.print()` after `setTimeout` — not a real PDF, no real quote logic.
81. `src/app/admin/treatments/page.tsx` Read-only aggregate by specialty; no actual treatment CRUD.
82. `src/app/admin/tests/page.tsx` Entire file is `redirect('/admin/diagnostics/tests')` — orphan stub directory.
83. `src/app/provider/page.tsx` Just redirects to login; no "auto-redirect if already logged in".
84. `src/app/admin/page.tsx` Heavy parallel queries, no `loading.tsx`, no error boundary.
85. `src/app/conditions/page.tsx` No breadcrumb JSON-LD.
86. `src/app/tests/page.tsx` No `notFound` for empty category trees.
87. `src/app/remedies/page.tsx` Static hardcoded content; no link to localized treatments/conditions.
88. `src/app/clinical-reference/page.tsx` Link grid points to `/reference/[category]` which has no notFound/generateStaticParams.
89. `src/app/pricing/page.tsx` Anchor `/for-doctors#join-form` fires only post-hydration.
90. `src/app/for-doctors/page.tsx` `'use client'`; no `metadata` export.
91. `src/app/provider/dashboard/page.tsx` Fully client; no metadata; auth check via fetch — flash of dashboard before redirect.
92. `src/app/provider/login/page.tsx` `'use client'`; no metadata.

### 1.15 Missing standard pages

93. No `/sitemap` HTML page (only XML).
94. No `/blog` or `/articles`.
95. No `/careers`.
96. No `/press`.
97. No `/editorial-board`.
98. No `/help` or `/faq`.
99. No `/login` (only `/provider/login` and broken `/auth/signin`).
100. No `/register` or `/signup` for patients despite vault flows.

### 1.16 Other concrete page issues

101. `src/app/contact/page.tsx:43` `throw new Error('Failed to send message')` swallowed; success path never validates response shape.
102. `src/app/admin/diagnostics/providers/[id]/page.tsx` `useParams()` for `[id]` never validated as numeric.
103. `src/app/admin/footer/page.tsx` Manages templates that `<V4Footer />` never consumes.
104. `src/app/admin/navigation/page.tsx` Edits navigation, but `Navbar.tsx` hardcodes `NAV_ITEMS` (lines 7-14).
105. `src/app/admin/seo-settings/page.tsx` Toggles schemas/meta templates that pages hardcode.
106. `src/app/admin/conditions/page.tsx` 21KB ConditionsTable client component; should paginate from server.
107. `src/app/admin/keywords/page.tsx`, `trigger-batch/page.tsx`, `translation-queue/page.tsx` Heavy client pages.
108. `src/middleware.ts` Doesn't redirect bare `/treatments`, `/conditions` to `/[country]/[lang]/...` even when both exist.

---

## SECTION 2 — SEO (170 items)

### 2.1 Metadata: missing title/description/generateMetadata

109. `src/app/healz-ai/page.tsx` `'use client'` with NO metadata. Add `healz-ai/layout.tsx`.
110. `src/app/page.tsx` Homepage exports NO metadata. Missing OG image, canonical, Twitter card.
111. `src/app/medical-travel/bot/page.tsx` No metadata, no layout.
112. `src/app/chat/diagnostic/page.tsx` Client page, no layout, no metadata. Add `robots:{index:false}`.
113. `src/app/chat/consult/page.tsx` Same; missing metadata + noindex.
114. `src/app/analyze/layout.tsx` Relies on root metadata. Add description + canonical.
115. `src/app/remedies/page.tsx` No metadata export, no layout sibling.
116. `src/app/clinical-reference/page.tsx` Verify metadata; add if absent.
117. `src/app/reference/[category]/page.tsx` Needs `generateMetadata` keyed off `[category]`.
118. `src/app/vault/page.tsx`, `src/app/vault/dossier/[fileId]/page.tsx` Set `robots:{index:false,follow:false}`.
119. `src/app/vault/layout.tsx` Set `metadata.robots = {index:false}` for whole subtree.
120. `src/app/admin/layout.tsx` Does not set robots noindex. Add defense-in-depth.
121. `src/app/provider/login/page.tsx`, `forgot-password/page.tsx`, `dashboard/page.tsx`, `hospital/dashboard/page.tsx`, `lab/dashboard/page.tsx`, `medical-tourism/register/page.tsx` No noindex meta robots.
122. `src/app/tools/lab-tests/page.tsx`, `tools/emergency/page.tsx`, `tools/surgery-checklist/page.tsx`, `tools/drug-interactions/page.tsx`, `tools/glossary/page.tsx`, `tools/vaccinations/page.tsx` Missing layouts/metadata.
123. `src/app/tools/bmi-calculator/layout.tsx` (and bmr, body-fat, water-intake, heart-risk, kidney, diabetes, pregnancy-due-date) Missing `openGraph.siteName`, `openGraph.images`, `twitter` card.
124. `src/app/for-doctors/surgical-checklist/layout.tsx`, `drug-dosing`, `quick-reference`, `clinical-scores`, `pricing` Risk of duplicate "for doctors" titles.
125. `src/app/contact/layout.tsx:9` Title duplicates brand via root template.
126. `src/app/about/page.tsx:22` OG `images:'/og-about.jpg'` references non-existent asset. Missing twitter card.
127. `src/app/medical-travel/page.tsx` Missing twitter card, `alternates.canonical`, OG image.
128. `src/app/symptoms/page.tsx` Missing twitter card and `alternates.canonical`.
129. `src/app/treatments/page.tsx` Missing twitter card, OG image.
130. `src/app/conditions/page.tsx` Missing twitter card, OG image.
131. `src/app/doctors/page.tsx` Missing twitter card, canonical, OG image.
132. `src/app/hospitals/page.tsx` Missing twitter card, canonical, OG image, siteName.
133. `src/app/insurance/page.tsx` Missing twitter, siteName, canonical, OG image.
134. `src/app/diagnostic-labs/page.tsx` Missing twitter, canonical, OG image, url.
135. `src/app/diagnostic-labs/[slug]/page.tsx` Verify per-slug `alternates.canonical`.
136. `src/app/conditions/[specialty]/page.tsx` Missing `alternates.canonical` and twitter card.
137. `src/app/insurance/[slug]/page.tsx` Verify `alternates.canonical: /insurance/${slug}` and OG `url`.
138. `src/app/doctors/specialty/[specialty]/page.tsx` Missing `alternates.canonical` and twitter card.
139. `src/app/doctors/[location]/page.tsx` & `/doctors/[location]/[lang]/page.tsx` Duplicate listings without canonical strategy.
140. `src/app/doctors/[location]/[lang]/page.tsx` No hreflang entries.
141. `src/app/tests/page.tsx`, `tests/[slug]/page.tsx`, `tests/[slug]/[city]/page.tsx`, `tests/category/[slug]/page.tsx` Verify per-page canonical.
142. `src/app/[country]/[lang]/[condition]/cost/page.tsx` Missing canonical and `alternates.languages`.
143. `src/app/[country]/[lang]/[condition]/cost/page.tsx:61` `country.toUpperCase()` produces "INDIA"/"UK" in titles. Use COUNTRIES lookup.
144. `src/app/[country]/[lang]/treatments/page.tsx:75-78` `alternates.languages` only includes `en` + current lang. Iterate all locales.
145. `src/app/[country]/[lang]/treatments/[treatment]/page.tsx` Verify hreflang; missing canonical.
146. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx:104` `canonicalUrl` uses env only — fallback when missing → `undefined/...`.
147. Same file: fallback meta description often <60 chars. Pad to 140-160.
148. Same file:91-93 heroOverview substring(0,155) cuts mid-word.

### 2.2 Canonical / duplicate URL issues

149. `src/app/sitemap-index.xml/route.ts` AND `/sitemap.xml/route.ts` AND `/sitemap/[index]/route.ts` Three competing sitemap routes. Consolidate.
150. `src/app/robots.txt/route.ts:69` Only one Sitemap directive; `/sitemap-index.xml` unreferenced.
151. Same file:66 `Crawl-delay: 1` ignored by Googlebot. Drop.
152. Same file:72-91 Blanket disallow for GPTBot/Google-Extended/ClaudeBot conflicts with AEO/GEO commit. Re-allow Google-Extended + ChatGPT-User.
153. Same file:31 vs 54 `Allow: /vault` contradicts gated nature.
154. Same file:40-41 `Allow: /*/*/*/` redundant with `Allow:/`. Remove noise.
155. `src/app/uk/en/acute-and-subacute-endocarditis-unspecified-i339/page.tsx` Hardcoded route DUPLICATES dynamic route. Both will index.
156. `src/app/treatments/[treatment]/page.tsx` AND `/[country]/[lang]/treatments/[treatment]/page.tsx` Two URLs same treatment.
157. `src/app/conditions/[specialty]/page.tsx` Pagination strategy unclear.
158. `src/app/doctors/[location]/page.tsx` vs `/doctors/[location]/[lang]/page.tsx` Duplicate ranking risk.
159. `src/app/page.tsx` No canonical declaration.
160. Trailing-slash inconsistency in robots.txt.
161. `scripts/generate-sitemaps.ts:12` Static page list omits `/healz-ai`, `/clinical-reference`, `/reference`, `/remedies`, `/chat/diagnostic`, `/chat/consult`, `/medical-travel/bot`, every `/tools/*`, every `/for-doctors/*`, `/advertise/pricing`, `/advertise/enquiry`, `/book/doctor`.
162. Same script:42 Only emits `/{country}/en/{cond}`. Does NOT generate per-language URLs.
163. Same script Does NOT emit treatment URLs (both routes), doctor `[slug]`, hospital `[slug]`, tests `[slug]` and `[slug]/[city]`, insurance `[slug]`, lab `[slug]`, cost variant.
164. Same script:23 Only `level='country'` geographies. Drops state/city/locality.
165. Same script Every condition gets static `priority:0.7`, `changefreq:'weekly'`. Vary.
166. `src/app/sitemap.xml/route.ts` Does not emit `<xhtml:link rel="alternate" hreflang>` per URL.
167. `src/app/sitemap-index.xml/route.ts:28` `lastmod` is "today" for every shard.
168. No image-sitemap.xml or video sitemap.

### 2.3 Structured data (JSON-LD) gaps

169. `src/app/page.tsx` No Organization, WebSite (with SearchAction), or BreadcrumbList directly. Verify `<DefaultSiteSchemas />` covers WebSite + sitelinks SearchBox.
170. `src/app/treatments/page.tsx` No ItemList schema. Add ItemList + BreadcrumbList.
171. `src/app/treatments/[treatment]/page.tsx` No Drug, MedicalTherapy, MedicalProcedure, or Product+Offer.
172. `src/app/[country]/[lang]/treatments/[treatment]/page.tsx` Same gap.
173. `src/app/[country]/[lang]/[condition]/cost/page.tsx` No PriceSpecification/Service+Offer.
174. `src/app/diagnostic-labs/page.tsx` No ItemList of MedicalBusiness/DiagnosticLab.
175. `src/app/diagnostic-labs/[slug]/page.tsx` Verify MedicalBusiness type with address/openingHours/priceRange.
176. `src/app/insurance/page.tsx` No ItemList; insurance providers should use FinancialProduct/InsuranceAgency.
177. `src/app/insurance/[slug]/page.tsx` No Organization/InsuranceAgency schema.
178. `src/app/conditions/[specialty]/page.tsx` No MedicalSpecialty or CollectionPage schema, no BreadcrumbList.
179. `src/app/symptoms/page.tsx` No MedicalWebPage/MedicalCondition schema.
180. `src/app/remedies/page.tsx` No HowTo or MedicalTherapy schema.
181. `src/app/healz-ai/page.tsx` No WebApplication schema.
182. `src/app/tools/*/page.tsx` Calculators no MedicalCalculator/SoftwareApplication/WebApplication schema.
183. `src/app/about/page.tsx` Verify `generateAboutPageSchema` includes Organization with sameAs + MedicalOrganization medicalSpecialty.
184. `src/app/contact/layout.tsx` `generateContactPageSchema` lacks ContactPoint.areaServed and language-specific contacts.
185. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx:178-194` Fallback `generatePageSchemas` skipped when only one of MedicalCondition/FAQ present, dropping BreadcrumbList/Person/Physician.
186. Same file `data.reviewer` rendered visually but no `MedicalReviewedBy`/`reviewedBy` in schema (E-E-A-T loss).
187. `src/lib/schema-markup.ts` `generateFAQSchema` Pages don't dedupe FAQs; same FAQ across URLs causes spam.
188. `src/app/treatments/[treatment]/page.tsx:515-528` `references` rendered but no Citation/MedicalScholarlyArticle schema.
189. `src/app/uk/en/acute-and-subacute-endocarditis-unspecified-i339/page.tsx` ZERO JSON-LD on highest-quality page.
190. `src/app/doctor/[slug]/page.tsx` Has aggregateRating but no Physician.affiliation→Hospital, no typed MedicalSpecialty.
191. `src/app/hospitals/[slug]/page.tsx:119` `medicalSpecialty` emits raw strings, not `@type:MedicalSpecialty` objects.
192. No site-wide WebSite schema with `potentialAction:SearchAction`.

### 2.4 Hreflang

193. `src/lib/hreflang.ts` Verify `x-default` is emitted; if missing Google ignores hreflang sets.
194. `src/app/[country]/[lang]/treatments/page.tsx:75-78` Only `en` + current lang in `alternates.languages`.
195. Pages outside `/[country]/[lang]/...` emit no hreflang despite 16 language treatment files.
196. `src/app/uk/en/acute-and-subacute-endocarditis-unspecified-i339/layout.tsx` Emits canonical but no `alternates.languages`.
197. `src/app/layout.tsx:55` `<html lang="en">` hardcoded for all 17 languages.
198. Same No `dir="rtl"` toggling for ar/ur.

### 2.5 Semantic HTML / heading structure

199. `src/app/page.tsx` Homepage has NO `<h1>`. CRITICAL.
200. `src/app/medical-travel/page.tsx`, `medical-travel/bot/page.tsx` No `<h1>`.
201. `src/app/diagnostic-labs/page.tsx` No `<h1>`.
202. `src/app/clinical-reference/page.tsx` No `<h1>`.
203. `src/app/treatments/page.tsx` No `<h1>` (uses display divs).
204. `src/app/tests/page.tsx`, `tests/[slug]/page.tsx`, `tests/[slug]/[city]/page.tsx`, `tests/category/[slug]/page.tsx` None contain `<h1>`.
205. `src/app/healz-ai/page.tsx` No `<h1>`.
206. `src/app/advertise/page.tsx`, `advertise/pricing/page.tsx`, `advertise/enquiry/page.tsx` No `<h1>`.
207. `src/app/for-doctors/page.tsx` and all 5 sub-pages No `<h1>`.
208. `src/app/conditions/page.tsx`, `conditions/[specialty]/page.tsx` No `<h1>`.
209. `src/app/insurance/page.tsx`, `insurance/[slug]/page.tsx` No `<h1>`.
210. `src/app/hospitals/[slug]/page.tsx` No `<h1>`; hospital name is styled div.
211. `src/app/doctor/[slug]/page.tsx` No `<h1>`; doctor name is styled div.
212. `src/app/diagnostic-labs/[slug]/page.tsx` No `<h1>`.
213. `src/app/treatments/[treatment]/page.tsx` No `<h1>`.
214. `src/app/symptoms/page.tsx:49` h1 contains a raw `<br />` mid-h1.
215. `src/app/about/page.tsx` No `<h1>`.
216. `src/app/[country]/[lang]/treatments/page.tsx`, `[country]/[lang]/treatments/[treatment]/page.tsx`, `[country]/[lang]/[condition]/cost/page.tsx` No `<h1>` in any high-volume route.
217. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx:264` `<nav>` breadcrumb lacks `aria-label="Breadcrumb"`.
218. `src/app/not-found.tsx` Has `<h1>` but no `metadata` to set 404 title.

### 2.6 Images & alt

219. Raw `<img>` instead of `next/image` in: admin/hospitals/[id], admin/tpas/[id], admin/diagnostics/providers, admin/insurance/plans, admin/insurance/[id]. Replace with Image.
220. `src/app/page.tsx`, `conditions/page.tsx`, `treatments/page.tsx`, `doctors/page.tsx`, `hospitals/page.tsx`, condition+treatment detail pages — none import `next/image`.
221. `src/app/uk/en/acute-and-subacute-endocarditis-unspecified-i339/layout.tsx:19` OG image is `images.unsplash.com` URL; needs `next.config.ts` `remotePatterns` whitelist.
222. `public/images/default-avatar.svg`, `default-placeholder.svg` Verify width/height to avoid CLS.
223. Doctor avatars in condition/doctor/hospital/analyze pages — confirm `alt` forwarded.

### 2.7 Internal linking

224. `src/app/conditions/[specialty]/page.tsx` Doesn't link to localized variants; orphan localized pages.
225. `src/app/treatments/page.tsx` No links to `/conditions/<related>`; treatment↔condition graph broken.
226. `src/app/treatments/[treatment]/page.tsx` No "doctors who prescribe", "hospitals offering", related conditions block.
227. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx:833` "View all" doctors uses `?specialty=` query. Use canonical path.
228. `src/app/page.tsx:70-73` TRENDING links only to indexes; no deep-linking.
229. `src/app/doctors/page.tsx` Should include filter links to `/doctors/specialty/<slug>`.
230. `src/components/v4/Footer.tsx` Verify it carries deep links to top conditions/treatments/cities.
231. `src/components/v4/Navbar.tsx` Primary nav must surface conditions/treatments/doctors/hospitals/insurance/tests.

### 2.8 External links / rel attributes

232. `src/app/admin/layout.tsx:406` `<Link href="/" target="_blank">` no `rel="noopener"`.
233. `src/app/admin/conditions/ConditionsTable.tsx:333`, `subscriptions/page.tsx:293`, `insurance/page.tsx:269`, `hospitals/page.tsx:267` Audit rel.
234. `src/app/analyze/page.tsx:700` External `target="_blank"`; check rel.
235. `src/app/provider/lab/dashboard/page.tsx:175`, `dashboard/page.tsx:672` Same.

### 2.9 AEO / GEO

236. `src/app/robots.txt/route.ts` Disallows GPTBot/ChatGPT-User/Google-Extended/ClaudeBot — contradicts AEO/GEO commit.
237. No `public/llms.txt`. Add summary, top URLs, content licensing.
238. No `ai.txt` or `humans.txt`.
239. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx:973` FAQs at section 08, deep below fold. Move one Q&A above fold for AI extraction.
240. Same Pages without `automatedContent` show only H1 + tiny doctor block. Add fallback content.
241. Same:1043 Sources section renders only when `aut?.sources` exists. Fall back to NHS/NIH/Mayo.
242. Condition pages set OG `type:'article'` but no Article meta (`author`, `published_time`, `modified_time`).
243. `src/lib/structured-data.tsx` Verify `generateOrganizationSchema` includes `medicalSpecialty`, `award`, `slogan`, `knowsAbout`.

### 2.10 Title/description length & quality

244. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx:87` Fallback title double-space when location empty.
245. `src/app/treatments/page.tsx:15` Title 73 chars + root template → 84+ chars, truncates.
246. `src/app/medical-travel/page.tsx:8` "...| aihealz | aihealz" double-brand.
247. Same double-brand in: treatments/page.tsx, symptoms/page.tsx, medical-travel/page.tsx, about/page.tsx, treatments/[treatment]/page.tsx, hospitals/page.tsx, doctors/page.tsx, insurance/page.tsx, diagnostic-labs/page.tsx, tools/page.tsx, conditions/page.tsx, [country]/[lang]/treatments/page.tsx, [country]/[lang]/[condition]/cost/page.tsx, [country]/[lang]/[condition]/[[...geo]]/page.tsx.
248. `src/app/uk/en/acute-and-subacute-endocarditis-unspecified-i339/layout.tsx:4` Title 90+ chars with double pipes.
249. `src/app/diagnostic-labs/page.tsx` Description 118 chars — pad to ~150.
250. `src/app/insurance/page.tsx` Description 124 chars — pad.
251. `src/app/hospitals/page.tsx` Description 134 chars — borderline.
252. `src/app/[country]/[lang]/[condition]/cost/page.tsx:67` Fallback "Compare medical treatment costs." 32 chars too short.
253. Same:65 Fallback title "Treatment costs | aihealz" too generic.
254. `src/app/treatments/[treatment]/page.tsx:153` OG description fallback truncates without ellipsis.
255. Soft-404 titles "Doctor not found", "Hospital not found", "Not Found" should set `robots:{index:false}`.
256. `src/app/conditions/page.tsx:34` Title borderline length.

### 2.11 Page speed / massive JSON imports

257. `public/data/treatments.json` 37 MB / 1.29M lines. Imported via `fs.readFileSync` in treatments routes. Catastrophic. Move to DB or build slug→entry index.
258. `loadAllTreatments` in `treatments/[treatment]/page.tsx` parses entire JSON per language per request. Memoize at module level.
259. `public/data/treatments-{ar,bn,de,es,fr,gu,hi,kn,ml,mr,or,pa,pt,ta,te,ur}.json` All loaded similarly.
260. `src/app/treatments/page.tsx:65-72` Reads JSON server-side every render. Wrap with `cache()`.
261. `src/app/[country]/[lang]/treatments/page.tsx` Same. Combine with `unstable_cache` and revalidate.
262. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx` Uses `revalidate=3600` but no Cache-Control headers.
263. `src/app/sitemap.xml/route.ts:6` `dynamic='force-dynamic'` defeats edge caching.
264. `src/app/layout.tsx:82-85` Google Fonts via `<link>` not `next/font`. Hurts LCP.
265. Same:58-75 Both GTM and gtag scripts. Remove duplicate gtag block.

### 2.12 Misc SEO

266. `src/app/sitemap-index.xml/` directory route — switch to official `app/sitemap.ts` API.
267. No `app/manifest.ts` or `public/site.webmanifest`. Missing PWA signals.
268. `src/app/icon.png` exists but no `apple-icon`, no `<link rel="icon" sizes>` variants.
269. Root layout sets `theme-color` but no `<meta name="color-scheme">`.
270. `src/app/page.tsx:70` TRENDING link `/india/en/hair-loss/cost` assumes slug exists.
271. `src/components/contextual-footer.tsx` Verify per-page internal-link diversity.
272. No `prev`/`next` rel links anywhere.
273. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx:1031-1037` Related conditions don't propagate geo path.
274. Detail-page BreadcrumbList missing on `/hospitals/[slug]`, `/diagnostic-labs/[slug]`, `/insurance/[slug]`, `/tests/[slug]`, `/tests/[slug]/[city]`, `/treatments/[treatment]`.
275. `src/app/uk/en/acute-and-subacute-endocarditis-unspecified-i339/page.tsx:1` `'use client'` prevents server-rendered structured data.
276. `src/app/healz-ai/page.tsx` `'use client'` + no metadata = invisible to crawlers.
277. Sitemap completeness summary: 134 page.tsx files; ~70 distinct route templates. `scripts/generate-sitemaps.ts` only inserts ~18 static URLs. Estimated under-coverage 90%+.
278. Missing route classes in sitemap: per-language treatments, treatment detail (both routes), doctor detail, hospital detail, lab detail, insurance detail, tests detail, tests `[slug]/[city]`, conditions `[specialty]`, doctors `[location]` and `[location]/[lang]`, doctors specialty hub, reference category, cost variant, all calculator tools, for-doctors sub-pages.

---

## SECTION 3 — NAVIGATION / HEADER / FOOTER (104 items)

### 3.1 Critical broken links

279. `src/components/v4/Navbar.tsx:113` `/auth/signin` 404.
280. `src/components/v4/Footer.tsx:47` "Terms" → `/privacy` not `/terms`.
281. `src/components/v4/Footer.tsx:45` "Careers" → `/about`.
282. `src/components/v4/Footer.tsx:44` "Editorial board" → `/about`.
283. `src/components/v4/Footer.tsx:37` "Press" → `/about`.
284. `src/components/v4/Footer.tsx:33` "Patients" → `/`.
285. `src/components/v4/Footer.tsx:25` "Drug interactions" → `/clinical-reference` (should be `/tools/drug-interactions`).
286. `src/components/v4/Footer.tsx:26` "Risk calculators" → `/clinical-reference` (should be `/tools`).
287. `src/components/v4/Footer.tsx:27` "Glossary" → `/clinical-reference` (should be `/tools/glossary`).
288. `src/components/v4/Footer.tsx:24` "Symptom checker" → `/healz-ai` though `/symptoms` exists.
289. `src/components/contextual-footer.tsx:416` `/book` has no `page.tsx`.
290. `src/components/contextual-footer.tsx:459-465` `/reference/drugs|guidelines|lab-medicine|anatomy|procedures|simulations` — verify each slug renders.

### 3.2 Pages that EXIST but aren't linked from header/footer

291. `src/app/symptoms/page.tsx` Not in header; mislinked in footer.
292. `src/app/remedies/page.tsx` Not linked anywhere.
293. `src/app/tests/page.tsx` `/tests` directory not linked.
294. `src/app/insurance/page.tsx` Not in header, not in v4 footer.
295. `src/app/hospitals/page.tsx` Not in header.
296. `src/app/tests/category/[slug]/page.tsx` No category index entry.
297. `src/app/tools/page.tsx` Tools hub NOT linked.
298. `src/app/tools/bmi-calculator/page.tsx` Not in v4 footer.
299. `src/app/tools/bmr-calculator/page.tsx` Not in v4 footer.
300. `src/app/tools/body-fat-calculator/page.tsx` Not in v4 footer.
301. `src/app/tools/diabetes-risk-calculator/page.tsx` Not in v4 footer.
302. `src/app/tools/heart-risk-calculator/page.tsx` Not in v4 footer.
303. `src/app/tools/kidney-function-calculator/page.tsx` Not in v4 footer.
304. `src/app/tools/water-intake-calculator/page.tsx` Not in v4 footer.
305. `src/app/tools/pregnancy-due-date-calculator/page.tsx` Not in v4 footer.
306. `src/app/tools/drug-interactions/page.tsx` Not in v4 footer (mispointed).
307. `src/app/tools/lab-tests/page.tsx` Not in v4 footer.
308. `src/app/tools/vaccinations/page.tsx` Not in v4 footer.
309. `src/app/tools/emergency/page.tsx` Not in v4 footer. CRITICAL — should be header CTA.
310. `src/app/tools/glossary/page.tsx` Not in v4 footer.
311. `src/app/tools/surgery-checklist/page.tsx` Not linked.
312. `src/app/for-doctors/clinical-scores/page.tsx` Not in v4 footer.
313. `src/app/for-doctors/drug-dosing/page.tsx` Not in v4 footer.
314. `src/app/for-doctors/quick-reference/page.tsx` Not in v4 footer.
315. `src/app/for-doctors/surgical-checklist/page.tsx` Not in v4 footer.
316. `src/app/for-doctors/pricing/page.tsx` Not in v4 footer.
317. `src/app/doctors/join/page.tsx` "Join as Doctor" CTA missing.
318. `src/app/doctors/specialty/[specialty]/page.tsx` Specialty index not surfaced.
319. `src/app/conditions/[specialty]/page.tsx` Specialty conditions not surfaced.
320. `src/app/contact/page.tsx` NOT in v4 footer at all. Critical — add to Co. column.
321. `src/app/pricing/page.tsx` NOT in v4 footer.
322. `src/app/advertise/page.tsx` Not linked.
323. `src/app/advertise/pricing/page.tsx` Not linked.
324. `src/app/advertise/enquiry/page.tsx` Not linked.
325. `src/app/chat/consult/page.tsx` Not in v4 footer.
326. `src/app/chat/diagnostic/page.tsx` Not linked.
327. `src/app/medical-travel/bot/page.tsx` Not linked in v4.
328. `src/app/vault/page.tsx` Not in header/footer.
329. `src/app/analyze/page.tsx` Only in header CTA; not in footer Tools.
330. `src/app/provider/login/page.tsx` Not linked from public header.
331. `src/app/provider/{page,dashboard,subscribe,forgot-password,hospital/register,hospital/dashboard,lab/register,lab/dashboard,medical-tourism/register}/page.tsx` Provider portal completely missing from public surface.
332. `src/app/clinical-reference/page.tsx` Only reachable via mispointed footer entries.
333. `src/app/diagnostic-labs/[slug]/page.tsx` Parent index missing from header.
334. `src/app/sitemap.xml/route.ts` No human-visible sitemap link in v4 footer.

### 3.3 Missing nav categories / structural

335. `src/components/v4/Navbar.tsx:7` No Tools mega-menu despite 15 `/tools/*` pages.
336. `src/components/v4/Navbar.tsx` No Hospitals link in primary nav.
337. `src/components/v4/Navbar.tsx` No Insurance link.
338. `src/components/v4/Navbar.tsx` No Tests link.
339. `src/components/v4/Navbar.tsx` No "For Doctors" / B2B entry point.
340. `src/components/v4/Navbar.tsx` No Symptoms entry.
341. `src/components/v4/Navbar.tsx` No Vault entry.

### 3.4 Mobile / responsive

342. `src/components/v4/Navbar.tsx:71` Horizontal nav with NO hamburger/breakpoint handling. Wire dormant `src/components/ui/navbar/mobile-menu.tsx`.
343. `src/components/v4/Navbar.tsx` Inline `padding:'14px 28px'` doesn't reduce on mobile. Use responsive Tailwind.
344. `src/components/v4/Navbar.tsx:113-118` Both CTAs always visible on mobile. Collapse Sign in into drawer.
345. `src/components/v4/Navbar.tsx` No `<button>` with `aria-expanded`; mobile a11y not implemented.
346. `src/components/v4/Footer.tsx:65` `flex:'1 1 140px'` causes odd reflow at mid-breakpoints. Use grid.

### 3.5 A11y / semantics

347. `src/components/v4/Navbar.tsx:71` `<nav>` no `aria-label="Primary"`.
348. `src/components/v4/Navbar.tsx` No `aria-current="page"` on active link.
349. `src/components/v4/Footer.tsx:54` `<footer>` no `aria-labelledby`.
350. `src/components/v4/Footer.tsx:111` Section "headings" are `<div>`, not `<h2>/<h3>`.
351. `src/app/layout.tsx:98` Skip link bypasses CTAs; consider second skip-to-nav.
352. `src/components/v4/Navbar.tsx:113-118` `<Link>`-as-button missing focus-visible style.
353. `src/components/v4/Navbar.tsx:93` Location chip styled like a control but not interactive; add `role="status"` and `aria-label`.

### 3.6 Locale / i18n

354. `src/components/v4/Navbar.tsx` NO locale switcher despite 16 language files.
355. `src/components/v4/Navbar.tsx:39-45` Country chip is display-only.
356. `src/components/v4/Footer.tsx` Lacks locale + country switcher.
357. `src/app/[country]/[lang]/...` deep routes only via geo cookie; no UI toggle.

### 3.7 Search

358. `src/components/v4/Navbar.tsx` NO search bar. 134 pages — global search essential.
359. No `src/app/search/page.tsx`.

### 3.8 Branding / sticky / breadcrumbs

360. `src/components/v4/Navbar.tsx:48-58` Sticky `zIndex:50`; verify stacking with floating CTAs.
361. `src/components/v4/Navbar.tsx:69` Logo `size={28}` `scale={0.85}` may be too small on mobile.
362. `src/app/layout.tsx:55` `<html lang="en">` hardcoded; doesn't reflect active language.
363. No global breadcrumbs component.
364. `src/components/v4/PageHeader.tsx` exists but no global breadcrumb integration.

### 3.9 CTAs / quick actions

365. `src/components/v4/Navbar.tsx` No Emergency CTA despite `/tools/emergency`.
366. `src/components/v4/Navbar.tsx` No Book CTA despite `/book/doctor`.
367. `src/components/v4/Navbar.tsx:113` Sign in present but no Sign up / Register.
368. `src/components/v4/Navbar.tsx` No separate "For Doctors" CTA.
369. `src/app/layout.tsx:122-125` AIGuide + WhatsAppCTA floating CTAs not in nav structure.

### 3.10 Footer organisation

370. `src/components/v4/Footer.tsx:9-50` Only 4 columns for 134 pages; restructure to 6-7.
371. `src/components/v4/Footer.tsx:42-49` Privacy listed twice.
372. `src/components/v4/Footer.tsx` No medical disclaimer block. Compliance must-have.
373. `src/components/v4/Footer.tsx` No business address / legal entity.
374. `src/components/v4/Footer.tsx:139` Copyright "© 2026 aihealz inc" hardcoded. Use `new Date().getFullYear()`.
375. `src/components/v4/Footer.tsx` No social icons.
376. `src/components/v4/Footer.tsx` No newsletter signup.
377. `src/components/v4/Footer.tsx` No language or country selector.
378. `src/components/v4/Footer.tsx` No `/sitemap.xml`, `/contact`, `/pricing`, FAQ links. No `/faq` page exists.
379. `src/components/v4/Footer.tsx` No Locations / cities column.

### 3.11 Drift / cleanup

380. Two parallel navbars (v4/Navbar mounted, ui/navbar/* dormant) with different link sets.
381. Two parallel footers (v4/Footer mounted, contextual-footer dormant). Merge or swap.
382. `src/components/seo/MegaMenu.tsx` unused — wire or delete.

---

## SECTION 4 — FUNCTIONALITY / BUGS / SECURITY (150 items)

### 4.1 [CRIT] Auth / Authorization on admin routes

383. [CRIT] `src/app/api/admin/seed-doctors/route.ts:90` POST has no auth; anyone can mass-create doctors.
384. [CRIT] `src/app/api/admin/seed-sitemap/route.ts:37,42` POST `prisma.sitemapEntry.deleteMany({})` no auth; wipe sitemap.
385. [CRIT] `src/app/api/admin/seed-insurance/route.ts:368` POST seeds providers no auth.
386. [CRIT] `src/app/api/admin/populate-real-data/route.ts:11` POST hits Google Places (paid) no auth → budget drain.
387. [CRIT] `src/app/api/admin/generate-content/route.ts:145` Burns OpenRouter credits no auth or cap.
388. [CRIT] `src/app/api/admin/translate-content/route.ts:119` AI translation, no auth.
389. [CRIT] `src/app/api/admin/translation-queue/route.ts:69` PUT approves translations + writes localizedContent no auth.
390. [CRIT] `src/app/api/admin/audit-logs/route.ts:15` GET exposes entire audit log publicly.
391. [CRIT] `src/app/api/admin/audit-logs/route.ts:68` POST lets anyone forge audit log entries.
392. [CRIT] `src/app/api/admin/rate-limits/route.ts:50` DELETE clears rate-limit records no auth → bypass.
393. [CRIT] `src/app/api/admin/rate-limits/route.ts:15` GET reveals identifiers/IPs.
394. [CRIT] `src/app/api/admin/feature-flags/route.ts:58,99` POST/PATCH unauthenticated.
395. [CRIT] `src/app/api/admin/settings/route.ts:28` GET/PUT platform settings no auth.
396. [CRIT] `src/app/api/admin/settings/purge-cache/route.ts:9` Cache purge unauth.
397. [CRIT] `src/app/api/admin/specialties/route.ts + [id]/route.ts` Mutations unauth.
398. [CRIT] `src/app/api/admin/seo-monitor/route.ts` Indexing stats public.
399. [CRIT] `src/app/api/admin/email-queue/route.ts + [id]` Email queue (PII) exposed.
400. [CRIT] `src/app/api/admin/verification-queue/route.ts` Doctor verification queue exposed.
401. [CRIT] `src/app/api/admin/enquiry-monitor/route.ts` Patient enquiries exposed (PHI/PII leak).
402. [CRIT] `src/app/api/admin/leads/[id]/route.ts` Lead mutation no auth.
403. [CRIT] `src/app/api/admin/doctors/[id]/route.ts` Doctor edit/delete no auth.
404. [CRIT] `src/app/api/admin/locations/[id]/route.ts` Location mutations no auth.
405. [CRIT] `src/app/api/admin/diagnostic-providers/[id]/route.ts` Lab provider mutations unauth.
406. [CRIT] `src/app/api/admin/languages/route.ts + [code]/route.ts` Language config writable.
407. [CRIT] `src/app/api/admin/feature-flags/[id]/route.ts` Per-flag PATCH/DELETE unauth.
408. [CRIT] 31 of 59 routes under `src/app/api/admin/` lack auth check. Standardize on `verifyAdminAuth`.

### 4.2 [CRIT] Auth on provider/encounters/vault

409. [CRIT] `src/app/api/provider/subscription/route.ts:61` POST upgrades doctor to enterprise NO auth NO payment verification.
410. [CRIT] `src/app/api/provider/subscription/route.ts:21` GET reveals subscription state for any doctorId.
411. [CRIT] `src/app/api/encounters/route.ts:11-55` POST accepts any `senderId`/`doctorId` with no auth. Doctor impersonation.
412. [CRIT] `src/app/api/encounters/route.ts` GET Chat history by encounterId from query string with no ownership check. PHI leak.
413. [CRIT] `src/app/api/vault/route.ts:11` GET vault by `?session=xxx` — knowing session hash gives full access.
414. [CRIT] `src/app/api/vault/upload/route.ts:42-50` `session` form field with no signature verification.
415. [CRIT] `src/app/api/health-timeline/route.ts:21-23` `sessionHash = hash(ip + ua)` is the entire access control. NAT collisions = data leak.
416. [CRIT] `src/app/api/diagnostics/book/route.ts:151-190` GET booking by id no auth returns full PII.
417. [CRIT] `src/app/api/admin/auth/route.ts:6-7` Single env-based admin; no per-user accounts, no per-actor audit.
418. [CRIT] `src/app/admin/layout.tsx:138-143` Admin token in localStorage (XSS-stealable).
419. [CRIT] `src/app/provider/login/page.tsx:79-82` Provider session token in localStorage.
420. [CRIT] `src/app/api/doctor-join/route.ts:115` `isVerified: true` immediately on self-signup with NO license check.
421. [CRIT] `src/app/api/provider/auth/forgot-password/route.ts:109-114` Reset email is `// TODO: Send email`. URL logged to stdout.
422. [HIGH] `src/app/api/provider/auth/login/route.ts:175-181` Session-row `.catch(() => {})` swallows DB failure silently.

### 4.3 [CRIT] Payment / Stripe

423. [CRIT] `src/app/api/create-checkout-session/route.ts:62` vs `src/app/api/webhooks/stripe/route.ts:86-90` Checkout sets only `metadata.planId`; webhook requires `metadata.doctorId` AND `metadata.tier`. Every payment silently dropped.
424. [HIGH] `src/app/api/create-checkout-session/route.ts:13` No rate limit on checkout creation.
425. [CRIT] `src/app/provider/subscribe/page.tsx:64-90` `handlePayment` skips Razorpay/Stripe entirely, just calls unauth `/api/provider/subscription`. UI upgrades for free.
426. [LOW] `src/app/provider/subscribe/page.tsx:90,93` Uses `alert()` for payment errors.
427. [HIGH] `src/app/api/webhooks/stripe/route.ts:11` `STRIPE_WEBHOOK_SECRET || ''` — empty default makes signature fail with confusing error.

### 4.4 [CRIT] Mock data / not implemented

428. [CRIT] `src/app/api/book/doctor/route.ts:44-55` Booking is NOT saved; success page lies to user.
429. [CRIT] `src/app/api/vault/upload/route.ts:96-107` Stores file as base64 in `ocrText`, truncated to 50000 → files >37KB silently corrupted.
430. [HIGH] `src/app/provider/dashboard/page.tsx:330` `// TODO: Implement tele-link booking flow`.
431. [MED] `src/app/api/admin/seo-monitor/route.ts:11-40` Returns hardcoded SAMPLE data when DB empty.
432. [MED] `src/app/admin/trigger-batch/page.tsx:35-38` Falls back to fake demo data with `Math.random` IDs when API fails.
433. [MED] `src/app/healz-ai/page.tsx:43-78` Sends `segment` in body but `/api/bot` only reads `messages`/`condition` — segment selectors do nothing.

### 4.5 [HIGH] XSS / Sanitization

434. [HIGH] `src/app/chat/consult/page.tsx:12-17` `formatAssistant` puts AI response into `dangerouslySetInnerHTML` with only manual regex. Use DOMPurify.
435. [MED] `src/app/api/symptoms/analyze/route.ts:148-160` AI-derived `cond.name` flows back to client.
436. [LOW] `src/components/ui/LoadingEffects.tsx:109` Empty catch swallows errors silently.

### 4.6 [HIGH] Rate limiting / DoS

437. [HIGH] `src/app/api/symptoms/analyze/route.ts` No rate limit on a paid OpenRouter call.
438. [HIGH] `src/app/api/diagnostics/chat/route.ts:13` No rate limit, no input length cap, no timeout.
439. [HIGH] `src/app/api/translate-condition/route.ts:9` Public AI translation, no auth or rate limit. Trivial DoS.
440. [HIGH] `src/app/api/bot/route.ts:3` No rate limit on OpenRouter call.
441. [HIGH] `src/app/api/encounters/route.ts:11` No rate limit.
442. [HIGH] `src/app/api/vault/upload/route.ts:39` No rate limit on uploads.
443. [HIGH] `src/app/api/diagnostics/search/route.ts:4` No rate limit on full-text search.
444. [CRIT] `src/lib/rate-limit.ts` In-memory `Map` per-process; on serverless each instance has own counter → no rate limit. Move to Upstash Redis.

### 4.7 Validation / error handling

445. [HIGH] `src/app/api/book/doctor/route.ts:28-42` Raw checks instead of Zod; email not validated; phone "valid if length≥10".
446. [HIGH] `src/app/api/hospitals/enquire/route.ts:38-43` Email accepted without format validation.
447. [HIGH] `src/app/api/encounters/route.ts:20` `parseInt(params.doctorId,10)` no `isNaN` check → 500 with leaked stack.
448. [MED] `src/app/api/provider/subscription/route.ts:168` Same parseInt no NaN guard.
449. [MED] `src/app/api/health-timeline/route.ts:19` `parseInt(limit)` no cap; could request 999999 rows.
450. [HIGH] `src/app/api/contact/route.ts:73` `sendContactFormNotification` fire-and-forget; user told "we'll get back" even when broken.
451. [MED] `src/app/api/admin/seed-doctors/route.ts:186-187` `catch (err: any)` swallows real DB errors.
452. [MED] `src/app/api/admin/populate-real-data/route.ts:78,124,129,143` Same pattern.
453. [HIGH] `src/app/api/diagnostics/book/route.ts:79-118` Booking + counter update not transactional. Use `prisma.$transaction`.
454. [HIGH] `src/app/api/diagnostics/book/route.ts` No idempotency key — repeated submits create dupes.

### 4.8 Functional bugs in tools/calculators

455. [HIGH] `src/app/tools/bmr-calculator/page.tsx:18-20` Uses old Harris–Benedict (1919). Replace with Mifflin-St Jeor.
456. [HIGH] `src/app/tools/bmr-calculator/page.tsx:23-26` Activity multiplier hardcoded 1.55.
457. [MED] `src/app/tools/bmr-calculator/page.tsx:13-28` `calculate()` silently does nothing on invalid inputs.
458. [MED] `src/app/tools/bmi-calculator/page.tsx:41` BMI categories oversimplify; missing Class I/II/III obesity.
459. [HIGH] `src/app/api/symptoms/analyze/route.ts:151,157` Hardcoded `/india/en/` URL prefix ignores user's country/language.
460. [HIGH] `src/app/api/admin/seed-doctors/route.ts:60-65` Generates phone numbers like `+91 98765 XXXXX` randomly. May collide with real numbers.
461. [MED] `src/app/api/admin/seed-doctors/route.ts:158-159` `Math.random()` for experience/fee — non-deterministic.
462. [MED] `src/app/api/admin/seed-doctors/route.ts:148-155` Slug collides on repeated runs across cities.
463. [MED] `src/app/api/admin/seed-doctors/route.ts:175` `availableOnline: Math.random() > 0.3` — fake telemedicine availability.
464. [LOW] `src/app/api/doctor-join/route.ts:90-92` Slug uses `Math.random()` not crypto-random.

### 4.9 Auth/session correctness

465. [HIGH] `src/app/api/doctor-join/route.ts:185-189` `INSERT ... ON CONFLICT DO NOTHING` — if previous session exists, new token never lands.
466. [HIGH] `src/app/api/provider/auth/login/route.ts:175-181` `ON CONFLICT (doctor_id) DO UPDATE` requires unique constraint; if missing throws and `.catch` swallows.
467. [HIGH] `src/app/api/provider/auth/forgot-password/route.ts:101-107` Same fragility.
468. [HIGH] `src/app/api/admin/auth/route.ts:18-23` `timingSafeStringEqual` pads with `\0`. Reject mismatched lengths.
469. [LOW] `src/app/api/webhooks/stripe/route.ts:6-9` Stripe instance constructed each request. Memoize.
470. [HIGH] `src/app/admin/layout.tsx:242` Client expiry check trusts client clock.
471. [MED] `src/components/provider/AuthGate.tsx:49,93,253` Three duplicate `Date.now()` checks against `expiresAt`.

### 4.10 Hydration risks

472. [HIGH] `src/app/medical-travel/bot/page.tsx:183` `Math.random()` in JSX → hydration mismatch.
473. [HIGH] `src/app/medical-travel/bot/page.tsx:184` `new Date().toLocaleDateString()` server vs client.
474. [MED] `src/components/ui/form.tsx:24,99,244` `Math.random()` for input `id` — use React 18 `useId()`.
475. [MED] `src/lib/accessibility.tsx:259` `Math.random` in `useState` initializer.
476. [LOW] `src/components/ui/toast.tsx:117,170` `Date.now()`/`Math.random` ids.

### 4.11 Race conditions / N+1 / perf

477. [HIGH] `src/app/api/symptoms/analyze/route.ts:135-162` Loads ALL active conditions on every call. Cache.
478. [MED] `src/app/api/footer/route.ts:24-104` Five sequential queries. Parallelize.
479. [MED] `src/app/api/admin/seed-doctors/route.ts:113-125` Sequential `await prisma.medicalSpecialty.upsert` in loop. Use `Promise.all`.
480. [MED] `src/app/api/admin/seed-sitemap/route.ts:441-466` Bulk inserts no transaction.
481. [MED] `src/app/api/diagnostics/chat/route.ts:104-124` Search uses `searchTerms[0]` for name/shortName but `hasSome` for aliases — inconsistent.
482. [LOW] `src/app/healz-ai/page.tsx:50-55` `useEffect` `eslint-disable` masks dependency issues.
483. [LOW] `src/lib/google-places.ts:115` `await response.json().catch(() => ({}))` swallows API errors.

### 4.12 Console / debug noise

484. [HIGH] `src/app/api/contact/route.ts:63` Logs PII.
485. [HIGH] `src/app/api/book/doctor/route.ts:49` Logs full body including PII.
486. [HIGH] `src/app/api/provider/auth/forgot-password/route.ts:113-114` Logs token reset URL plaintext.
487. [LOW] `src/app/api/admin/seed-sitemap/route.ts:44,434` Generic console.logs in prod path.
488. [HIGH] `src/app/api/admin/settings/route.ts:121` Logs settings update including value.
489. [LOW] `src/components/contextual-footer.tsx:231`, `src/components/geo-auto-detect.tsx:169,172,185,211` Noisy console.log every page load.

### 4.13 Type safety / `any`

490. [MED] `src/app/tools/lab-tests/page.tsx:18,131,335` `components: any[]` and `(c: any)`.
491. [MED] `src/lib/google-places.ts:86,126,128` `any` types.
492. [HIGH] `src/lib/content/schema-generator.ts:2-3,30` `page: any, condition: any, faqs: any[]` — core SEO infra fully `any`.
493. [MED] `src/lib/translate-condition-content.ts:106` `const data: any = {}` then handed to Prisma update.
494. [MED] `src/app/api/admin/translate-content/route.ts:46,236`, seed-doctors:186,200, populate-real-data:78,124,129,143 `error: any` catch blocks.

### 4.14 Missing UI primitives & forms

495. [HIGH] No `error.tsx` or `loading.tsx` route files anywhere. Add at least global ones plus per-section.
496. [MED] `src/app/contact/page.tsx:184-250` Uses wrapping `<label>` but no `htmlFor`/`id`. No `aria-invalid`/`aria-describedby`.
497. [MED] `src/app/contact/page.tsx:5` Server-side validation field-level but client renders one global message.
498. [MED] 14 files use raw `<img src=...>` instead of `next/image`.
499. [MED] Provider register pages have placeholder `+91-XXXXXXXXXX` but no input mask/pattern.
500. [MED] Most admin tables lack confirm-modal pattern on destructive actions.

### 4.15 Hardcoded URLs / config

501. [MED] `src/app/page.tsx:144-170` Hardcoded `https://aihealz.com` in JSON-LD; breaks staging.
502. [MED] `src/app/api/symptoms/analyze/route.ts:80` Default `'HTTP-Referer': 'https://aihealz.com'`.
503. [MED] `src/app/api/diagnostics/chat/route.ts:181` Same.
504. [MED] `src/lib/redis.ts:3` `'redis://localhost:6379'` default falls through in prod.
505. [HIGH] `src/app/api/symptoms/analyze/route.ts:151,157` Hardcoded `/india/en/` URL prefix.

### 4.16 Data model / Prisma

506. [MED] `prisma/schema.prisma:23-50` `MedicalCondition` has both `localizedContent` and `pageContent` relations — overlapping.
507. [MED] `prisma/schema.prisma` `aliases hasSome` queries require GIN indexes that aren't declared.

### 4.17 Misc bugs

508. [LOW] `src/app/admin/navigation/page.tsx:92` `id: \`new-${Date.now()}\`` — collisions on rapid clicks.
509. [MED] `src/app/api/admin/audit-logs/route.ts` No retention/pruning.
510. [MED] `src/app/api/contact/route.ts:48,57` `userAgent` rendered in admin UI; verify HTML escape.
511. [HIGH] `src/lib/cms/icd10-seeder.ts` No DOMPurify on imported text fed to `dangerouslySetInnerHTML`.
512. [LOW] `src/app/api/translate-condition/route.ts:24` Generic 'translation failed' no retry/back-off.

### 4.18 AI / agent completeness

513. [MED] `src/app/api/bot/route.ts:35` Defaults to old `meta-llama/llama-3-8b-instruct`.
514. [MED] `src/app/api/symptoms/analyze/route.ts:84` Uses `deepseek/deepseek-chat`; no fallback.
515. [LOW] `src/app/api/bot/route.ts:14-19` System prompt requires disclaimer but model not post-validated.
516. [LOW] `src/app/healz-ai/page.tsx:13-22` `HEALTH_SEGMENTS` purely visual; backend doesn't branch.

### 4.19 Quick wins / completeness

517. [LOW] `src/app/api/provider/leads/route.ts` Standardize all routes on `withErrorHandling`.
518. [LOW] Heavy inline `style={{...}}` in many pages bypasses Tailwind layer.
519. [LOW] `src/app/api/provider/auth/forgot-password/route.ts:110-111` Commented-out reset URL build.
520. [LOW] `src/app/api/diagnostics/chat/route.ts:13` Add 30s `AbortController` timeout.
521. [LOW] `src/app/provider/login/page.tsx:155` `autoComplete="off"` on password — consider `current-password`.

### 4.20 Security misc

522. [HIGH] `src/app/api/admin/auth/route.ts:30-40` Legacy SHA-256 admin hash silently accepted forever.
523. [HIGH] `src/app/api/admin/auth/route.ts:10` In-memory `authAttempts` Map per-process — same serverless issue.
524. [HIGH] `src/app/api/provider/auth/login/route.ts:25-72` Same per-process lockout.
525. [MED] `src/app/api/provider/auth/login/route.ts:140-142` Raw `$queryRaw` — refactor to typed model.
526. [MED] `src/app/api/doctor-join/route.ts:64-66` Raw `$queryRaw` for `provider_auth`.
527. [MED] `src/app/api/admin/audit-logs/route.ts` `withErrorHandling` exposes Zod error.message in dev — gate by env.

### 4.21 Vault / Booking / Admin completeness summary

528. [CRIT] Vault is marketing surface, not working: base64 in OCR field truncated, Drive integration stubbed.
529. [CRIT] Booking flow: `book/doctor` doesn't persist, `diagnostics/book` GET unauth, `provider/subscribe` zero payment, Stripe metadata mismatch.
530. [CRIT] Admin panel: 31 of 59 routes no auth; seed routes triggerable by anyone; audit logs publicly readable AND forgeable; rate-limit table publicly wipeable.

---

## SECTION 5 — PERFORMANCE / A11Y / UX (150 items)

### 5.1 Performance — JSON & data

531. `public/data/treatments-*.json` 17 files × ~40 MB ≈ 680 MB shipped under `public/`. Move to server-only or shard.
532. `public/data/treatments.json` 37 MB read synchronously via `fs.readFileSync` in 5+ locations. Cache in module scope.
533. `src/app/treatments/page.tsx:69` `JSON.parse(fs.readFileSync(...))` blocks render thread; switch to `fs.promises.readFile` and memoize.
534. `src/app/[country]/[lang]/treatments/[treatment]/page.tsx:84-88` Reads 40 MB JSON for each treatment page. Build slug-keyed Map.
535. `src/app/treatments/[treatment]/page.tsx:96-100` Same. Pre-shard to `data/treatments-by-slug/<slug>.json`.
536. `src/components/v4/TreatmentsIndex.tsx` 375-line client island; project minimal payload server-side.
537. `src/components/ui/treatments-explorer.tsx` 567-line `'use client'`; only one `useMemo`. Memoize handlers.
538. `src/components/ui/conditions-explorer.tsx` 489-line client running inline filters — virtualize lists >200 items.

### 5.2 Performance — fonts/scripts

539. `src/app/layout.tsx:82-85` Google Fonts via render-blocking `<link>`. Switch to `next/font/google`.
540. `package.json` No `next/font` import anywhere. Adopt to self-host.
541. `src/app/layout.tsx:58-75` GTM and gtag.js both loaded; pick GTM-only.
542. `src/app/layout.tsx:66-69` Consider `strategy="lazyOnload"` for GTM.
543. `src/app/layout.tsx:76-81` `crossOrigin="anonymous"` on `fonts.googleapis.com` preconnect unnecessary.

### 5.3 Performance — CSS

544. `src/app/globals.css` 1888 lines, two competing design systems. Split route-specific.
545. `src/app/globals.css:261-299` `!important` overrides for Tailwind utilities cause specificity wars.
546. `src/app/globals.css:443-540` Two body background defs compete; FOUC risk.
547. `src/app/layout.tsx:55` `suppressHydrationWarning` on `<html>` and `<body>` masks real mismatches.
548. `next.config.ts` images `deviceSizes` includes 1920+2048; trim if not used.

### 5.4 Performance — server/client boundary

549. `src/components/v4/Navbar.tsx:38` `await getGeoContext()` runs in root server layout per request — disables full SSG.
550. `src/app/layout.tsx:109` `<GeoAutoDetect />` site-wide; ensure `ssr: false`.
551. `src/app/layout.tsx:122-133` AIGuide/WhatsAppCTA/CookieConsent rendered eagerly. Lazy-load via `next/dynamic`.
552. `src/components/ui/ai-guide.tsx` Gate full chat panel behind user click.
553. `src/components/ui/cookie-consent.tsx` Lazy-mount on idle.
554. `src/components/ui/NeuralBackground.tsx` Gate behind reduced-motion + dynamic import.
555. `src/components/ui/LoadingEffects.tsx` Animation-heavy; ensure not in server components.
556. `src/app/admin/analytics/page.tsx:20` `recharts` (~150 KB) static-imported. Use `next/dynamic({ssr:false})`.
557. `framer-motion` listed in deps; only one usage. Remove or replace with CSS keyframes.

### 5.5 Performance — search & caching

558. `src/app/api/search/route.ts:54` Search reparses 37 MB JSON per query. Build inverted index or move to Postgres FTS.
559. `src/app/[country]/[lang]/[condition]/[[...geo]]/page.tsx:64` Only this route sets `revalidate = 3600`. Add to treatments/conditions/doctors/hospitals indexes.
560. `src/app/sitemap.xml/route.ts:6` `dynamic = 'force-dynamic'`; switch to `revalidate: 86400`.
561. `src/app/api/admin/analytics/route.ts:37` Cache treatments.json read with `unstable_cache`.
562. `src/app/api/admin/seed-sitemap/route.ts:365` Same caching needed.
563. `src/app/api/search/route.ts` No `Cache-Control` headers; add `s-maxage`.
564. No route exports `runtime = 'edge'`. Lightweight read-only routes would benefit.
565. `src/components/v4/TreatmentsIndex.tsx, ConditionsIndex.tsx` Paginate / windowing at 50 items default.
566. Thousands of treatment links with default prefetch → fan-out. Set `prefetch={false}` on long lists.
567. `src/app/page.tsx` Verify `<Image>` `priority` set only on LCP hero. No `priority` matches found.

### 5.6 Performance — images

568. Raw `<img>` usage: `admin/hospitals/[id]/page.tsx`, `admin/tpas/[id]/page.tsx`, `admin/diagnostics/providers/page.tsx`, `admin/diagnostics/providers/[id]/page.tsx`, `admin/insurance/plans/page.tsx`, `admin/insurance/[id]/page.tsx`, `medical-travel/bot/page.tsx`, `uk/en/.../page.tsx`, `components/ui/media-gallery.tsx`. Switch to `next/image`.
569. `src/components/ui/image-with-fallback.tsx` Wrapper exists but unused; standardize.
570. `src/components/ui/media-gallery.tsx` Raw `<img>`; switch to next/image + sizes + lazy.
571. `src/components/v4/Logo.tsx` Confirm inline SVG, not remote PNG.
572. `public/file.svg, globe.svg, next.svg, vercel.svg, window.svg` Default Next scaffolding SVGs marked modified; remove if unreferenced.

### 5.7 Performance — react patterns

573. `src/components/ui/conditions-explorer.tsx:308` Multiple `useEffect` chains for scroll/load — debounce.
574. `src/components/ui/treatments-explorer.tsx` High `useState` count; consider `useReducer`.
575. `src/app/chat/diagnostic/page.tsx, chat/consult/page.tsx` Both import DOMPurify (browser bundle) + `Suspense fallback={null}`. Lazy-load DOMPurify.
576. `package.json` `pg` direct dep alongside `@prisma/adapter-pg` + `@prisma/client`. Remove direct `pg`.
577. `package.json` Tailwind v4 + Lightning CSS prefixes already; drop `autoprefixer`.
578. `package.json` With `@tailwindcss/postcss` v4 you may not need separate `postcss`.
579. `@stripe/stripe-js` + `stripe` Lock server-only `stripe` with `import 'server-only'`.
580. `ioredis` Verify it isn't imported from any `'use client'` file.
581. `src/components/ui/icons.tsx` Use named imports from `lucide-react` to preserve tree-shaking.
582. `src/components/ui/index.ts` Barrel re-export defeats tree-shaking; import from sub-paths.
583. `src/app/treatments/page.tsx:135-139` Two separate JSON-LD Script blocks; combine into `@graph`.
584. `src/components/ui/conditions-explorer.tsx` Rebuilds `globalSevCounts` every render; verify deps.
585. Zero `'use server'` files. Migrate form mutations to server actions.
586. `src/components/v4/Navbar.tsx:49-57` Inline `backdrop-filter` creates GPU layer; verify not duplicated.
587. Prefetch only top 6 conditions on index pages; default on hover for long lists is wasteful.

### 5.8 Accessibility — combobox/inputs

588. `src/components/ui/search-autocomplete.tsx:153-162` `<input>` no `aria-label`, no `<label htmlFor>`, no `role="combobox"`, no `aria-expanded`/`aria-controls`/`aria-autocomplete`.
589. `src/components/ui/search-autocomplete.tsx:167-175` Clear button no accessible name; add `aria-label="Clear search"`.
590. `src/components/ui/search-autocomplete.tsx:178` Dropdown plain `<div>`; needs `role="listbox"` + `role="option"` + `aria-selected`.
591. `src/components/ui/symptom-checker.tsx:248` `<input>` likely missing label.
592. `src/components/ui/cookie-consent.tsx:66-72` Wrap banner in `role="region" aria-label="Cookie consent"`.
593. `src/components/ui/toast.tsx:80` Has `role="alert"`. Add `aria-live="polite"` on container.
594. `src/components/ui/dialog.tsx:115-116` Verify `aria-labelledby` references title id, focus trap, focus restored.
595. `src/components/ui/confirm-modal.tsx:71-72` Verify focus trap, ESC handler, initial focus on cancel.

### 5.9 Accessibility — lang/dir

596. `src/app/layout.tsx:55` `<html lang="en">` hardcoded for entire app, including 17 languages. Set dynamically per locale.
597. `src/app/layout.tsx` No `dir="rtl"` set for ar/ur/he; CSS expects `[dir="rtl"]` but nothing toggles.
598. `src/app/[country]/[lang]/` No `layout.tsx` exists. Inherited root `<html lang="en">` for all 17 languages.
599. `src/app/[country]/[lang]/treatments/page.tsx:86-89` `metadata.other` sets `content-language` and `dir`, but these are meta tags, not the `<html>` attributes.

### 5.10 Accessibility — nav/landmarks

600. `src/components/v4/Navbar.tsx:71` `<nav>` no `aria-label`.
601. `src/components/v4/Navbar.tsx:113-118` "→" glyph announced as "right pointing arrow"; wrap in `aria-hidden`.
602. `src/components/v4/Footer.tsx` Verify wrapped in `<footer>` with `aria-label`.
603. `src/app/layout.tsx:117` `role="main"` redundant on `<main>`.
604. `src/app/layout.tsx:98-103` Skip-link uses `focus:bg-primary-600`; verify token exists.
605. `src/app/not-found.tsx` Decorative SVGs need `aria-hidden`.
606. `src/app/not-found.tsx:8` Giant decorative "404" should have `aria-hidden`.
607. `src/app/globals.css:507-512` `:focus-visible` outline color #06b6d4 on white — borderline 3.0:1.
608. `src/app/globals.css` `.v4-btn`, `.glass-btn` lack explicit `:focus-visible` ring.
609. `src/components/v4/Navbar.tsx:75-87` Add `aria-current="page"` when `isActive`.
610. `src/components/v4/Navbar.tsx:71` No mobile hamburger.
611. `src/components/ui/whatsapp-cta.tsx:24` Has `aria-label`. Verify `target="_blank" rel="noopener"`.
612. `src/components/ui/ai-guide.tsx:92,164` Verify open panel has `role="dialog"` + focus trap.

### 5.11 Accessibility — color contrast

613. `--ink-4: #7A8DA8` on `--bg: #F4F6FA` ≈3.4:1 — fails AA for body text.
614. Dark legacy `rgba(255,255,255,0.4)` ≈4.7:1 borderline; `rgba(255,255,255,0.3)` ~3.5:1 fails — used in `.review-date`, `.footer-disclaimer p`, `.medical-disclaimer`, `.footer-bottom p`.
615. `src/app/globals.css:1276-1277` `.reviewer-quals { color: rgba(255,255,255,0.5) }` may dip below 4.5:1.
616. `src/components/ui/treatments-explorer.tsx, conditions-explorer.tsx` Severity dots/pills color-only; add icon/text.

### 5.12 Accessibility — heading order

617. Audit `src/app/page.tsx` and v4 index pages for h1→h3 jumps.
618. `src/app/globals.css:1188-1190` Ensure only one h1 per condition page.

### 5.13 Accessibility — tables

619. `src/app/tools/lab-tests/page.tsx`, `tools/vaccinations/page.tsx`, `medical-travel/bot/page.tsx`, all admin tables: zero `scope="col|row"` matches. Add to every `<th>`.
620. `src/app/admin/leads/LeadsTable.tsx`, `admin/content/ContentTable.tsx`, `components/admin/DataTable.tsx` Add `<caption>` and `aria-rowcount`.
621. `src/components/ui/faq-accordion.tsx` Use native `<details>/<summary>` or implement `aria-expanded`/`aria-controls`.
622. `src/components/ui/tabs.tsx` Implement WAI-ARIA tab pattern.
623. `src/components/ui/select.tsx` Custom select must expose `role="combobox"` + `role="listbox"`.

### 5.14 Accessibility — motion/forms

624. `src/lib/accessibility.tsx:237` Reduced-motion hook exists; ensure consumed by LoadingEffects, NeuralBackground, framer-motion sites.
625. `src/app/globals.css:980-1072` `@keyframes` (pulse, float, shimmer) without `prefers-reduced-motion` opt-out.
626. `src/app/globals.css:1568` `.btn-upload { animation: pulse-subtle 3s infinite }` — respect reduced-motion.
627. `src/app/globals.css:462` `html { scroll-behavior: smooth }` overrides reduced-motion preference.
628. `src/app/globals.css:1716-1723` Non-Latin font-size bump won't fire until `<html lang>` correct.
629. `src/components/ui/language-switcher.tsx` Ensure `aria-label="Choose language"` and per-option `lang` attribute.
630. Form labels: `src/components/ui/form.tsx` should expose `Field` with `<label htmlFor>`. Audit admin pages.
631. `src/components/ui/symptom-checker.tsx` Multi-step needs `<fieldset>/<legend>` + `aria-describedby`.
632. `src/app/globals.css:1779-1782` `.form-label` styles exist but JSX must enforce id/htmlFor pairs.

### 5.15 UX — error/loading

633. `src/app/error.tsx, src/app/global-error.tsx` Do NOT exist. Add styled global-error and per-segment with retry.
634. `src/app/loading.tsx` Does NOT exist anywhere. Add to `app/`, `app/treatments/`, `app/[country]/[lang]/treatments/`, `app/conditions/`, `app/doctors/`.
635. Error boundaries: add `error.tsx` to each data-fetching segment.
636. `src/app/not-found.tsx` SVG home icon needs `aria-hidden`; "Browse Conditions" could use icon.
637. Empty states explorers — `treatments-explorer`, `conditions-explorer` need "No results" + reset CTA.
638. Empty states doctors — `src/app/doctors/page.tsx` and country/city need "No doctors yet in <city>" + notify CTA.
639. Empty states vault/appointments — `src/app/vault/**` needs onboarding empty state.
640. Network error UI — Client `fetch` calls in `admin/settings/page.tsx:65`, chat pages need toast on failure.
641. Loading skeletons — `src/components/ui/Skeleton.tsx` exists but underused.
642. `src/components/ui/Skeleton.tsx` Add `aria-busy="true"` on parent.

### 5.16 UX — mobile

643. `src/components/v4/Navbar.tsx` Hardcoded `padding: '14px 28px'`, `maxWidth: 1280`, `fontSize: 13`; below 480px wraps badly.
644. Mobile geo pill — Location label "Mumbai · India" eats horizontal space; collapse to icon-only on <640px.
645. Touch targets — Zero matches for `min-h-11`/`min-h-[44`. WCAG 2.5.5 wants 44×44px. `.v4-btn-sm { padding: 6px 10px }` too small.
646. `src/components/ui/search-autocomplete.tsx:167` Clear button: 24px tap target. Increase to 44px.
647. `src/components/v4/Navbar.tsx:75-87` Nav link padding ≈28px tall — below 44px.

### 5.17 UX — forms

648. Long-form forms — `src/components/ui/symptom-checker.tsx` multi-step; ensure progress indicator + back nav without data loss.
649. Confirmation on destructive — `src/components/ui/confirm-modal.tsx` exists; verify all admin delete flows route through it.
650. `src/app/admin/**` Admin DataTable delete operations likely call API directly; wire through confirm-modal.
651. Toast consistency — Two patterns may coexist (`toast.tsx` + ad-hoc). Centralize.
652. Cookie consent UX — Banner blocks bottom of mobile viewport; auto-dismiss or "remind me later".

### 5.18 UX — themes/RTL/print

653. Dark mode — `globals.css:2` declares `@custom-variant dark` but no `.dark` toggle. Either ship toggle or remove `dark:` classes.
654. Theme inconsistency — Two design systems ship together; jarring.
655. `src/app/layout.tsx:44` `themeColor: '#0f172a'` (dark) but v4 bg is `#F4F6FA` (light) — iOS address bar mismatch.
656. RTL — globals.css:1576-1665 has rules but `<html dir>` never set. Dead code.
657. RTL number inputs — globals.css:1654 forces `direction: ltr` on number inputs (correct). Verify date/tel.
658. Treatments by language — `treatments-ar.json`, `treatments-ur.json` exist; pages must render RTL.
659. `src/app/[country]/[lang]/treatments/[treatment]/page.tsx:187` When language file lacks slug, falls back to English silently. Add banner.
660. `src/components/ui/data-verification-banner.tsx` Ensure appears on AI-generated content pages.
661. Medical disclaimer — `globals.css:1547` exists with failing contrast. Show on every medical page.
662. `src/app/chat/diagnostic/page.tsx, chat/consult/page.tsx` `Suspense fallback={null}`. Replace with skeleton.
663. `src/components/ui/whatsapp-cta.tsx` Floating CTA + AI guide + cookie consent overlap on small screens.
664. Breadcrumbs styling — `globals.css:1287-1294` uses `rgba(255,255,255,0.5)` — invisible on light.
665. Form error UX — `globals.css:1822-1825` `.form-error` red but no `aria-describedby`/`role="alert"`.
666. `src/app/contact/layout.tsx:37` Verify contact form renders confirmation state after submit.
667. Copy/UX analyze CTA — `src/components/v4/Navbar.tsx:117` "Analyze report →" — explain accepted file types before upload.
668. Mobile sticky header — `position: sticky; top: 0` on Navbar; verify with iOS Safari chrome via `env(safe-area-inset-top)`.
669. `src/app/globals.css:1837-1843` Safe-area utilities exist; confirm Navbar uses `env(safe-area-inset-top)`.
670. Onboarding — No first-visit tour; AIGuide alone insufficient.
671. Geo auto-detect UX — `src/components/geo-auto-detect.tsx` runs silently; surface toast "Showing results for India · Change?".
672. `src/components/ui/language-switcher.tsx` Verify persists in cookie and reflects current language.
673. Search results UX — `/api/search` returns 0 results, render "Did you mean…" or "Browse by specialty".
674. Pagination on large lists — Treatments index has thousands; ensure pagination/virtualization.
675. Severity color blocks — Use icon + text in addition to color.
676. Print styles — No `@media print` rules for condition/treatment pages — clinicians may print.
677. `src/app/layout.tsx:21` `metadataBase` falls back to `https://aihealz.com`; ensure preview doesn't generate prod canonicals.
678. robots.txt + sitemap — `src/app/robots.txt` exists; verify disallows `/admin/`.
679. `src/app/admin/**` Admin pages need `<meta name="robots" content="noindex">`.
680. Footer disclaimer — "Not medical advice" must appear on every page; verify Footer.tsx emits.

---

## SECTION 6 — CONTENT, SECURITY, DATA, INFRA (97 items)

### 6.1 [CRIT] Secrets / credential hygiene

681. [CRIT] `.env.production` Live secrets on disk: Stripe LIVE secret, OpenRouter, Sarvam, Resend, Cloudflare token, DataForSEO basic-auth, IndexNow key, two FULL Google service-account private keys (Drive + GSC), Google Maps API key, admin API key, session salt. Delete file, rotate every value.
682. [CRIT] `.env.production:22-23` Admin plaintext password `<REDACTED-ROTATE>` written in comment next to hash. Rotate, remove comment.
683. [CRIT] `.env.production:23` `ADMIN_PASSWORD_HASH` is SHA-256, not bcrypt. Auth route silently accepts SHA-256.
684. [CRIT] `.env.production:24` `ADMIN_API_KEY="<REDACTED-COMPROMISED-ROTATE-IN-PROD>"` human-guessable (literal value scrubbed from this audit doc; remains in git history — rotate live key on the server so the historical leak no longer grants access).
685. [HIGH] `.env` `DATABASE_URL` uses `taps:taps` trivial credential.
686. [HIGH] `.gitignore:48` `.env*` blanket-ignores both real and example templates.
687. [HIGH] `secrets/` directory exists locally; verify no deploy script `rsync`s it.
688. [MED] `.env.example:33` Placeholder `STRIPE_SECRET_KEY="sk_live_..."` should be `sk_test_...`.
689. [MED] `secrets/` lacks README explaining purpose / rules.
690. [MED] `SECURITY-ROTATION.md` exists — verify covers every secret.

### 6.2 Auth / Authorization (additional)

691. [CRIT] `src/app/admin/layout.tsx:229-267` Admin gate is client-only via `localStorage`. Pages render and ship to any unauthenticated client.
692. [CRIT] `src/middleware.ts:75` `/admin/` is in `SKIP_PATHS`, so middleware does not run on admin routes. Combined with above, every admin route server-side reachable without auth.
693. [HIGH] `src/app/admin/layout.tsx:143` Admin token in localStorage (XSS-readable).
694. [HIGH] `src/app/admin/layout.tsx:141` Client expiresAt 24h vs server 8h. Mismatch.
695. [HIGH] `src/lib/admin-auth.ts:17-19` Only `console.error` if `SESSION_SECRET` missing in prod. Should `throw` at module load.
696. [HIGH] `src/lib/admin-auth.ts:38-43` `timingSafeEqual` pads with `\0`; multi-byte input still leaks length.
697. [HIGH] `src/app/api/admin/auth/route.ts:31-40` Silent SHA-256 fallback. Remove.
698. [HIGH] `src/app/api/admin/auth/route.ts:10-13` and `src/lib/rate-limit.ts` In-memory rate-limit map; bypassed across instances. Move to Redis (already a dep).
699. [HIGH] `src/app/api/provider/auth/login/route.ts:25` Same in-memory `loginAttempts` issue.
700. [HIGH] `src/app/api/admin/impersonate/route.ts:67` `ON CONFLICT (doctor_id) DO UPDATE` overwrites doctor's real session.
701. [HIGH] `src/app/api/admin/impersonate/route.ts` No audit log of admin→doctor impersonation.
702. [HIGH] `src/lib/provider-auth.ts:42-47` Query lacks `AND expires_at > NOW()`; expiry check JS-side only.
703. [MED] No session revocation; password reset cannot invalidate active tokens.
704. [MED] `src/app/api/admin/auth/route.ts:142` Admin cookie `sameSite: 'lax'` should be `'strict'`.
705. [MED] `src/lib/validation.ts:24-31` requires special chars; provider login schema requires only 8 chars. Inconsistent.
706. [MED] No `provider_sessions` table definition in `db/migrations/` despite being queried.

### 6.3 Input/output/headers

707. [HIGH] `next.config.ts` No CSP header. Only nginx has it; non-prod / Vercel preview ships without.
708. [HIGH] `deploy/nginx.conf:95` CSP allows `script-src 'unsafe-inline' 'unsafe-eval'`. Switch to nonce-based.
709. [HIGH] `next.config.ts:73-90` Missing HSTS, X-Frame-Options, Permissions-Policy.
710. [HIGH] `next.config.ts:32-33` Wildcard image domains `**.hospital.com`, `**.healthcare.com` — SSRF/abuse risk.
711. [HIGH] No CORS configuration on `/api/*`. Add explicit middleware.
712. [MED] `src/app/api/search/route.ts:9-16` Custom `sanitizeInput` only on AI fallback; mangles URLs.
713. [MED] ~20 files use `dangerouslySetInnerHTML`. Most are JSON-LD; audit user-controlled flow.
714. [MED] `src/middleware.ts:222-223` `lang` from URL with no allowlist before set as `x-aihealz-lang`.
715. [MED] No file-upload validation for `/api/analyze`, `/api/vault`, `/api/analysis`. Enforce size cap + MIME + scanner.
716. [LOW] `deploy/nginx.conf:91` `X-XSS-Protection` deprecated; remove.
717. [HIGH] No open-redirect protection on country/lang URL composition in middleware.

### 6.4 Content — translation files

718. [CRIT] `public/data/treatments-{kn,ml,or,pa}.json` All 4 byte-identical English (39,406,392 bytes each). Kannada/Malayalam/Odia/Punjabi visitors get English.
719. [CRIT] `public/data/treatments-{ar,bn,de,es,fr,gu,hi,mr,pt,ta,te,ur}.json` First record `name`/`description`/`mechanism`/`indications`/`sideEffects` are English. Only metadata translated.
720. [HIGH] `public/data/treatments*.json` `costs[country].usd` field MISLABELED. India `usd:15` matches INR range. UK `usd:105` is GBP midpoint. Whole pricing dataset wrong.
721. [HIGH] `public/data/treatments-with-costs.json` 30 MB duplicates `treatments.json`. Dedupe or document.
722. [MED] `treatments*.json` `searchTags` are English fragments in every language file.
723. [MED] No stable `id`/`slug` on treatment records; slug generated at runtime. Collisions possible.
724. [LOW] No `lastUpdated`/`version` on treatment files.
725. [LOW] All language files ~40 MB each, ~1.4 GB in `public/data/`. Consider DB or letter-chunked.

### 6.5 Static JSON data quality

726. [HIGH] `public/data/hospitals.json` Only 10 hospitals. Site advertises hospitals globally; stub.
727. [HIGH] `hospitals.json:174` AIIMS Delhi `"scandals"` array contains uncited claims. Legal risk. Remove or cite.
728. [HIGH] `hospitals.json` `testPrices` `usd`/`gbp`/`aed` derived from INR with no FX-as-of date.
729. [MED] `hospitals.json:56-57` Unverifiable celebrity claims. Remove.
730. [MED] `hospitals.json` Inconsistent shape: `googleBusinessUrl`, `notablePatients`, `awards` only on some.
731. [MED] `public/data/insurance-providers.json` `claimSettlementRatio: 91.5` no `asOf` or source.
732. [MED] `insurance-providers.json` plans `premiumStartsAt: 8500` no `currency`.
733. [MED] `public/data/medical-glossary.json` 73 terms. Missing common: Cholecystectomy, Hernia, Stent, Glaucoma, Cataract, Asthma, COPD, Eczema, Psoriasis.
734. [MED] `medical-glossary.json` No `lastReviewed`/`reviewedBy`/`source` per term.
735. [HIGH] `public/data/drug-interactions.json` Only 52 drugs. No `lastReviewed`/`source`/`version`.
736. [HIGH] `public/data/drug-dosing.json` Same gap. Vancomycin dosing outdated (modern is AUC-based).
737. [MED] `public/data/clinical-reference.json` ACLS section — add `guideline_year: 2020`.
738. [MED] `public/data/vaccinations.json` COVID-19 "updated annually" generic; CDC changes more often.
739. [MED] `public/data/surgical-safety-checklist.json` Confirm WHO 2009 version; add `checklistVersion`.
740. [LOW] `public/data/lab-tests.json` US prices stale.
741. [LOW] `public/data/emergency-services.json` Confirm India entries (1099, 102, 108).
742. [LOW] `medical-glossary.json` `pronunciation` ad-hoc, not IPA.
743. [LOW] `vaccinations.json` lacks Indian National Immunization Schedule.
744. [LOW] All `public/data/*.json` lack `$schema` reference.

### 6.6 Data layer (Prisma + raw SQL migrations)

745. [HIGH] `db/migrations/*.sql` raw SQL NOT under Prisma's `prisma/migrations/`. Two systems out of sync.
746. [HIGH] `db/migrations/002_indexes.sql` references tables (`ai_analysis_cache`, `page_cache`, `ui_translations`, `sitemap_entries`, `condition_reviewers`) not in `001_schema.sql`. Index creation will fail.
747. [HIGH] `db/migrations/001_schema.sql:57` Table `doctors_providers` (plural-plural). Awkward.
748. [HIGH] `prisma/schema.prisma` `MedicalCondition.symptoms`/`treatments` are `Json`; not type-safe queryable. Migrate to junction tables.
749. [HIGH] `prisma/schema.prisma` `DoctorProvider.email` unique column AND inside `contactInfo.email` JSON. Two sources of truth.
750. [HIGH] No `audit_log` / `admin_audit_log` table. Required for medical-PII compliance.
751. [MED] Models use `isActive`/`isVerified` for soft-delete; lack `deletedAt`/`deletedBy`.
752. [MED] `prisma/schema.prisma` `Geography.supportedLanguages String[]` — Postgres array, no FK.
753. [MED] `prisma/schema.prisma` `Geography.population BigInt?` — verify all server components stringify.
754. [MED] `db/migrations/003_seed.sql` 6 conditions only; dev-only. Rename or wrap with `ON CONFLICT DO NOTHING`.
755. [MED] `db/migrations/006_marketplace.sql:49` `regional_pricing.country_code VARCHAR(5)` — ISO is 2 chars.
756. [LOW] `prisma/schema.prisma:3` `engineType = "library"` no `binaryTargets`; verify VPS.
757. [LOW] `prisma/schema.prisma` `LocalizedContent.metaTitle @db.VarChar(160)` vs `metaDescription @db.VarChar(300)` inconsistent.
758. [LOW] Many models duplicate `createdAt`/`updatedAt` ad-hoc.

### 6.7 Infrastructure

759. [HIGH] `README.md` Still create-next-app boilerplate. No setup, env vars, deploy.
760. [HIGH] `tsconfig.json:8` `"noImplicitAny": false` defeats half of `strict: true`.
761. [HIGH] `tsconfig.json:34` `"exclude": ["node_modules", "scripts"]` — entire `scripts/` unchecked.
762. [HIGH] `eslint.config.mjs` Bare-minimum; no `eslint-plugin-security`, `no-secrets`, no rule against `dangerouslySetInnerHTML` on user input.
763. [HIGH] No CI/CD: `.github/workflows/` does not exist.
764. [HIGH] **Zero tests** in repo. No Vitest/Jest/Playwright.
765. [MED] No Sentry / error-tracking. Production errors only console.error'd.
766. [MED] No analytics integration (no GA, Plausible, Posthog imports).
767. [MED] `package.json` No `test`, `typecheck`, `format` scripts.
768. [MED] No Prettier config; mixed indentation.
769. [MED] `next.config.ts:121-124` `turbopack.resolveAlias` polyfills `fs`/`net`/`tls` to empty. Masks server-only-import bugs.
770. [MED] `deploy/nginx.conf:13` API rate-limit `30r/s` per IP generous; lower.
771. [MED] Three deploy scripts at root: `deploy.sh`, `deploy-quick.sh`, `deploy-to-vps.sh`, `server-setup.sh`. Confirm canonical, delete others.
772. [LOW] Stray root files: `test_icd.json`, `test_lightning.js`, `fix-geo-india.ts`. Move or delete.
773. [LOW] `tsconfig.tsbuildinfo` (1.4 MB) in working tree.
774. [LOW] `ecosystem.aihealz.config.js` (PM2) committed but no `pm2` in deps.
775. [LOW] `.well-known/acme-challenge` tracked in repo; should be served from disk only.
776. [LOW] `CONTENT_GENERATION_STRATEGY.md`, `PRODUCTION_ROADMAP.md` at root. Move to `docs/`.
777. [LOW] `postcss.config.js` is CJS while project uses ESM elsewhere; convert to `.mjs`.

---

## TOP-PRIORITY FIX BATCHES

Group 1 — Stop bleeding (do today)
- 681-684 — rotate every secret in `.env.production`, delete file.
- 691-692 — admin auth gate is client-only; admin routes are publicly reachable.
- 383-408 — 31 unauthenticated admin API routes.
- 423, 425 — Stripe checkout metadata mismatch + paywall bypass.
- 411-416 — encounters/vault/health-timeline/diagnostics-book PHI/PII leaks.
- 444 — in-memory rate limit ineffective on serverless; move to Redis.

Group 2 — Half-built features lying to users
- 428 — `/book/doctor` doesn't persist anywhere.
- 429 — vault uploads truncated to 50KB into wrong column.
- 421 — provider forgot-password emails are TODO; tokens logged to stdout.
- 459-464 — calculators using 1919 formulas / random data.
- 718-720 — 4 language files are 100% English; pricing field mislabeled.

Group 3 — SEO bleed
- 199-218 — homepage and most templates have no `<h1>`.
- 161-168 — sitemap covers <10% of indexable URLs.
- 152, 236 — robots.txt blocks AI bots despite AEO/GEO commit.
- 169-192 — JSON-LD missing across all major schema-eligible templates.
- 532, 533, 558 — 37 MB JSON parsed every render.

Group 4 — Nav/footer reorg
- 279-290 — broken/wrong-target footer links.
- 291-334 — pages that exist but aren't linked.
- 335-341 — missing nav categories (Tools mega-menu, Hospitals, Insurance, Tests, For Doctors, Symptoms).
- 342-345 — no mobile hamburger.
- 358-359 — no global search.
- 633-635 — add `error.tsx`, `loading.tsx`, segment-level `not-found.tsx`.
