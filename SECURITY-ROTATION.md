# Security Rotation Runbook

This document is the post-audit action list. Code-side fixes have been applied
(see commit `security: harden secrets handling and dev hygiene`). The items
below require **action outside this repo** — rotating live credentials in
provider dashboards, then dropping the new values into the server's `.env`.

> **Why this is urgent:** the previous `.env.production` and
> `aihealz_prod_dump.sql.gz` sat unencrypted in the working tree of a
> developer machine. Treat every secret listed below as **compromised**
> until rotated.

---

## 1. Rotate every production credential

Each entry: where to rotate, what changes, where to paste the new value.

### 1.1 Database password
- **Where:** PostgreSQL on the VPS (`72.61.224.90`).
- **Action:** `ALTER USER aihealz_user WITH PASSWORD '<new>';`
- **Update:** `DATABASE_URL` and `DIRECT_URL` in the server's `.env`.
- **Restart:** `pm2 restart aihealz`.

### 1.2 Admin login
- **Where:** `.env` on the server.
- **Action:** Pick a new strong password (≥20 chars random, e.g.
  `openssl rand -base64 24`).
- **Hash it (sha256, matching current scheme):**
  `printf '%s' "$NEW_PASSWORD" | openssl dgst -sha256 -hex | awk '{print $NF}'`
- **Update:** `ADMIN_PASSWORD_HASH`. Also rotate `ADMIN_API_KEY` and
  `SESSION_SALT` (`openssl rand -hex 32`).

> **Stronger fix (recommended):** SHA-256 unsalted is weak even for short
> passwords. Migrate to `bcrypt` or `argon2id` next milestone.

### 1.3 Stripe
- **Where:** https://dashboard.stripe.com/apikeys
- **Action:** Roll the live restricted key (`rk_live_...`). Also rotate the
  publishable key if you want a clean cut, and **create a webhook signing
  secret** (currently `STRIPE_WEBHOOK_SECRET=""` — webhooks are forgeable).
- **Update:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `STRIPE_WEBHOOK_SECRET`.

### 1.4 OpenRouter
- **Where:** https://openrouter.ai/keys
- **Action:** Revoke the old key. Create a new one.
- **Update:** `OPENROUTER_API_KEY` (and `AI_API_KEY`, which mirrors it).

### 1.5 Resend
- **Where:** https://resend.com/api-keys
- **Action:** Revoke + recreate.
- **Update:** `RESEND_API_KEY`.

### 1.6 Sarvam
- **Where:** Sarvam dashboard.
- **Action:** Revoke + recreate.
- **Update:** `SARVAM_API_KEY`.

### 1.7 Cloudflare
- **Where:** https://dash.cloudflare.com/profile/api-tokens
- **Action:** Revoke the old token. Create a new scoped token (only the
  permissions actually needed — DNS, Cache Purge, etc.).
- **Update:** `CLOUDFLARE_API_TOKEN`.

### 1.8 DataForSEO
- **Where:** https://app.dataforseo.com/api-access
- **Action:** Reset the password for the `arush@brandingpioneers.com`
  account; regenerate the basic-auth string.
- **Update:** `DATAFORSEO_AUTH` (base64 of `email:password`).

### 1.9 Google service accounts (Drive + Search Console)
- **Where:** https://console.cloud.google.com/iam-admin/serviceaccounts
  (project `charged-camera-488507-d2`).
- **Action:** For both service accounts:
  1. Delete the existing key.
  2. Create a new JSON key.
  3. Download once, paste single-line into `.env`.
- **Update:** `GOOGLE_DRIVE_SERVICE_ACCOUNT`,
  `GOOGLE_SERVICE_ACCOUNT_JSON`.

### 1.10 IndexNow
- Pick a new key (`openssl rand -hex 16`), rename the verification file
  under `public/` to match, redeploy.
- **Update:** `INDEXNOW_KEY`.

---

## 2. Server-side hygiene (do once after rotation)

Run on the VPS:

```bash
# 1. Drop any backed-up plaintext envs sitting around.
ls -la /home/aihealz.com/public_html/.env*
# delete .env.backup if it contains old secrets

# 2. Confirm current .env is mode 600 and owned by the deploy user.
stat -c '%a %U:%G %n' /home/aihealz.com/public_html/.env

# 3. Drop the auto-generated DB-password file once you've copied it
# into your secret store (1Password / Vault / etc.).
rm /home/aihealz.com/public_html/.db_password.generated
```

Local dev machine (`/Users/taps/Desktop/Aihealz`):

```bash
# Confirm the prod dump is gone (already removed during fix commit):
ls aihealz_prod_dump.sql.gz   # should be "No such file"

# Confirm secrets/ files are still present locally if needed,
# but never staged:
git status -- secrets/ .env .env.production
# all should be ignored (no output)
```

If you ever shared `.env.production` over Slack, email, screenshare, or
unencrypted backups: assume those copies still exist. The rotation above
makes them harmless.

---

## 3. Code follow-ups (tech debt — not done in audit-fix commit)

These were called out in the audit but deferred because each one is a
focused refactor with its own blast radius. Track them as separate
phases:

1. **`tsconfig.json` — drop `noImplicitAny: false`.** Currently contradicts
   `strict: true`. Flipping it surfaces every implicit-any in the tree
   (likely 100+); fix iteratively in a typed-up phase.

2. **Move the 16× ~40 MB `public/data/treatments-*.json` files out of
   `public/`.** They're shipped via the static route, blow up the
   container, and are loaded synchronously in some admin routes. Either
   - put them behind an authenticated API that streams from disk, or
   - import the data into Postgres and drop the JSON entirely.

3. **Async the remaining sync reads** in
   `src/app/api/admin/seed-sitemap/route.ts:366` and
   `src/app/api/admin/analytics/route.ts:38` (mirrors of the
   `/api/search` fix already shipped).

4. **CSRF tokens on form-submission routes.** `/api/contact`,
   `/api/doctor-join`, etc. only rate-limit by IP. Add a token issued on
   page render and verified on submit, or switch to same-origin–only
   cookies + an `Origin` header check.

5. **Migrate `ADMIN_PASSWORD_HASH` from SHA-256 to bcrypt/argon2id.**

6. **Audit silent `.catch(() => {})` swallows** in
   `src/app/healz-ai/page.tsx`,
   `src/app/hospitals/[slug]/enquire/page.tsx`,
   `src/components/ui/LoadingEffects.tsx`,
   `src/components/chat/ChatInterface.tsx`,
   `src/app/book/doctor/page.tsx`. Surface or log instead of dropping.

7. **`reactStrictMode: true` is now on** — expect to find double-render
   bugs in dev. Fix them as they show up rather than turning it back off.

---

## 4. What this commit already changed

- `aihealz_prod_dump.sql.gz` removed from working tree (was never in git
  history — confirmed).
- `prisma/dev.db` and the `udo journalctl …` typo file untracked from git
  index.
- `.gitignore` extended to cover `*.sql.gz`, `*.dump`, `*.db`, build logs.
- `server-setup.sh` no longer hardcodes any secret. Reads required
  vars from env or a `secrets.env` file (which is `.gitignore`d). Stops
  echoing the admin/db passwords to stdout; writes the generated DB
  password to a mode-600 file the operator deletes after use.
- `deploy.sh`, `deploy-quick.sh`, `deploy-to-vps.sh` no longer hardcode
  the VPS IP — pulled from env. `deploy-to-vps.sh`'s broken
  `medcasts-next` PM2 app name fixed. Rsync exclusions extended so
  `.env*`, `secrets/`, and DB dumps cannot accidentally get pushed up.
- `next.config.ts`: removed the catch-all `{ hostname: '**' }` pattern
  that defeated the image-domain whitelist, and turned `reactStrictMode`
  back on.
- `src/app/api/search/route.ts`: the 40+ MB `treatments.json` is no longer
  read synchronously on the request path; it's read with
  `fs.promises.readFile` and concurrent cache-misses dedupe to a single
  in-flight load.
