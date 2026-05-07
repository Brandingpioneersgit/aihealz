# Aihealz local — broken features triage

Generated 2026-05-07 after first-pass audit. Investigation method: curl every top-level route, grep `process.env.*` to map feature → env var, read pages that exceeded 1MB.

Verdict at a glance: **the app is not crashed, it is starved**. Almost every external dependency is unconfigured locally, and two of the biggest pages over-fetch the entire DB into the HTML response.

---

## P0 — why "conditions page won't load" (the actual report)

- [ ] **Conditions page returns 10.9 MB of HTML.** `src/app/conditions/page.tsx:75` runs `prisma.medicalCondition.findMany({ where: { isActive: true } })` with no take/skip and passes the full `categories` array (every one of ~72K rows) as a prop to the `<ConditionsIndex>` client component at line 299. Next.js RSC serializes that prop into the HTML, so the browser downloads, parses and hydrates a 10 MB document — on Safari/mobile this often appears as a blank page or "site can't be reached". This is the user-visible "can't access content" symptom.
  - Fix: keep server-side aggregation but ship only what the client renders — e.g., return per-specialty counts + a paginated/searchable API (`/api/conditions/search`), and load specialty pages on demand. Net payload target: <200 KB.
- [ ] **Treatments page has the same disease.** `/treatments` is 10.2 MB for the same reason. Apply the same fix pattern.
- [ ] **`/conditions/[specialty]` (e.g. `/conditions/cardiology`) ships 3.2 MB.** Subset of the same problem — still over-fetching for a single specialty page. Should be paginated + filtered server-side.

## P0 — missing env vars that 500 entire features

Local `.env` only has `DATABASE_URL`. The app expects ~30 vars. Concrete consequences:

- [ ] **AI symptom analysis returns 500.** `/api/symptoms/analyze` throws "AI service is not configured" without `OPENROUTER_API_KEY` (or `AI_API_KEY`). Affects symptom checker, /healz-ai chat path, condition detail "ask AI" widgets.
- [ ] **Stripe checkout returns 500.** `/api/create-checkout-session` throws "STRIPE_SECRET_KEY is not set". Doctor signups, premium plans, vault paid tier — all 500.
- [ ] **Stripe webhooks fail signature verification.** Without `STRIPE_WEBHOOK_SECRET`, no subscription/payment events get processed even if checkout works.
- [ ] **All transactional email is dead.** Without `RESEND_API_KEY`, every `sendEmail()` returns `{ success: false }` — doctor registration, lead notifications, password resets, booking confirmations, payment-failed emails.
- [ ] **Diagnostics chat (`/api/diagnostics/chat`) silently empties.** Same AI key issue, returns 502 / empty body.
- [ ] **Vault encounter pipeline + Drive bridge dead.** `GOOGLE_DRIVE_SERVICE_ACCOUNT` / `GOOGLE_SERVICE_ACCOUNT_JSON` missing → patient health vault uploads fail; encounter clinical extraction fails.
- [ ] **Sarvam multilingual content** dead without `SARVAM_API_KEY` — the `/india`, `/usa/[locale]/...` localized pages can't generate translations.
- [ ] **Admin dashboard auth runs on dev defaults.** Without `ADMIN_PASSWORD_HASH` / `ADMIN_API_KEY` / `SESSION_SECRET`, falls back to dev hash `123456` and a default email — login *works* but is unsafe and any code path using `ADMIN_API_KEY` header auth fails.
- [ ] **Google rapid indexing + IndexNow** silently fail (degrade gracefully, but SEO ping is dead).

**Decision needed from user**: pull the keys from `.env.production` into local `.env` (everything is already in `.env.production` on the box we downloaded), or set up dummy/sandbox keys locally and only wire prod keys for AI?

## P1 — routes that don't behave as expected

- [ ] **`/chat` returns 404.** No `src/app/chat/` directory exists, but the marketing surface links to it (header/CTA). Either create the route (it should likely alias to `/healz-ai`) or fix the links.
- [ ] **`/provider` returns 307.** Need to confirm destination — likely redirecting to `/for-doctors` or `/admin`. If intentional, fine; if it's a stale redirect it should be cleaned up. Verify.
- [ ] **Deprecated `middleware` convention.** Next 16 warns: "middleware file convention is deprecated, use proxy". `src/middleware.ts` should be renamed/refactored to `src/proxy.ts` per Next.js 16 guidance. Non-blocking but will break on next major.
- [ ] **`next.config.ts` is being edited at runtime** (server keeps restarting in logs). Either an editor save loop or a stale `.next` cache. Confirm and stop.

## P1 — DB seed/migration drift

- [ ] **Migrations 003/005/007/008/009/010 had partial errors** during local replay (duplicate keys, missing `prompt_lab_entries.id` default, FK to `geographies(15)` that doesn't exist). I worked around it by restoring the production `pg_dump` instead — so the local DB matches prod content right now, but the migration scripts in `db/migrations/` are not idempotent and shouldn't be re-run blindly. Either:
  - Make migrations idempotent (`ON CONFLICT DO NOTHING`, `IF NOT EXISTS`, etc.), or
  - Fold the prod schema into a single Prisma migration and treat `db/migrations/*.sql` as history-only.
- [ ] **`prisma/dev.db`** (SQLite file) is in the tree but unused — `schema.prisma` is Postgres. Delete to avoid confusion.

## P2 — performance and quality

- [ ] **`tsconfig.tsbuildinfo` is 1.3 MB and committed.** Should be in `.gitignore`.
- [ ] **`.env.production` is in the working tree and tracked by git.** Real secrets (Stripe live key, AI keys, Google service account) are sitting in a file that was downloaded to a laptop. Rotate them or at minimum verify `.gitignore` covers `.env*` before any push.
- [ ] **`curl_test.html` (11 MB) + `curl_treatment.html` (1.2 MB) + `mass-gen.log` (6.8 MB)** were on the production server's `public_html` (already excluded from local copy) — these should be removed from the server too.
- [ ] **No tests.** No `__tests__/`, no Jest/Vitest config. Adding even smoke tests for the AI / Stripe / vault routes would catch the env-var-missing 500s before deploy.

---

## Recommended sequencing

1. Decide env strategy (copy prod keys vs dummy locally) — unblocks ~80% of "broken features" reports immediately.
2. Fix conditions + treatments over-fetch (real bug, will affect prod too — even with fast bandwidth, RSC payload is 10MB on every cold visit).
3. Resolve `/chat` 404 and `/provider` redirect intent.
4. Make migrations idempotent OR delete in favor of Prisma-managed schema.
5. Rotate any prod secrets that lived in `.env.production` before the local copy.

## Open questions for the user

1. Do you want me to copy keys from `.env.production` into local `.env`? (Fastest path to "everything works locally", but copies live secrets onto your laptop.)
2. Do you want the conditions/treatments fix to be a true backend pagination API, or a quick win where we just slice to first N per specialty server-side and ship a "load more"?
3. Is `/chat` supposed to exist as its own route, or is the right fix to redirect to `/healz-ai`?
4. After answers above — should I implement fixes in order, or do you want to pick which ones to ship?

---

## Review (will be filled in as work lands)

_(empty — nothing implemented yet, this is a triage doc)_
