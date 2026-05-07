# Aihealz

A multi-language medical directory and AI-first patient/doctor platform: condition pages, treatment data, geo-aware doctor/hospital listings, clinical reference tooling, and revenue features (Stripe, marketplace, vault).

## Tech stack

| Area              | Choice                                |
| ----------------- | ------------------------------------- |
| Framework         | Next.js 16 (App Router, Turbopack)    |
| UI runtime        | React 19                              |
| Styling           | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| ORM / DB          | Prisma 7 + PostgreSQL                 |
| Cache / queue     | Redis (`ioredis`)                     |
| Payments          | Stripe (+ Razorpay frame allowlisted) |
| AI / LLM          | OpenRouter (configurable model)       |
| Validation        | Zod 4                                 |
| Auth              | bcrypt-hashed admin + HMAC sessions   |
| Lang / I18n       | 17 locale data sets in `public/data/` |

## Local setup

```bash
npm install
cp .env.example .env        # fill in secrets — see env vars below
npm run dev                 # http://localhost:3000
```

## Required environment variables

| Variable                          | Description                                                          |
| --------------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`                    | Postgres connection string (Prisma client)                           |
| `DIRECT_URL`                      | Direct Postgres URL for `prisma migrate` (often same as above)       |
| `REDIS_URL`                       | Redis connection string for caching and rate limiting                |
| `OPENROUTER_API_KEY` / `AI_API_KEY` | OpenRouter key used by the AI pipeline / content generators        |
| `STRIPE_SECRET_KEY`               | Stripe server-side secret                                            |
| `STRIPE_WEBHOOK_SECRET`           | Signing secret for `/api/webhooks/stripe`                            |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (browser)                                  |
| `ADMIN_EMAIL`                     | Admin login email                                                    |
| `ADMIN_PASSWORD_HASH`             | **bcrypt** hash of the admin password (no plaintext)                 |
| `SESSION_SECRET`                  | HMAC secret for signed admin session tokens (required in production) |
| `NEXT_PUBLIC_SITE_URL`            | Canonical site URL, e.g. `https://aihealz.com`                       |

Optional: `SARVAM_API_KEY` (Indian language translation), `RESEND_API_KEY` + `EMAIL_FROM` (transactional email), `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` (R2 / CDN), `DATAFORSEO_AUTH` (keyword research), `GOOGLE_DRIVE_SERVICE_ACCOUNT` (vault), `GOOGLE_SERVICE_ACCOUNT_JSON` (Search Console), `INDEXNOW_KEY`, `ADMIN_API_KEY`.

See `.env.example` for the full template.

## Database setup

```bash
npx prisma generate          # or: npm run db:generate
npx prisma migrate dev       # or: npm run db:migrate
npm run seed:doctors         # optional: seed doctor records
```

Raw SQL migrations live under `db/migrations/` and are applied separately to Postgres for the geospatial / intelligence / marketplace / SEO / vault / CMS extensions.

## Architecture

```
src/app/                  # Next.js App Router routes (RSC by default)
  [country]/[lang]/...    # Geo + locale-scoped pages (conditions, costs, doctors)
  admin/                  # Admin dashboard (bcrypt + signed session)
  api/                    # Route handlers (Stripe webhooks, AI, vault, …)
  tools/                  # Patient-facing calculators (BMI, BMR, etc.)
src/components/v4/        # Current design system (v4) — prefer these
src/lib/                  # Helpers (db, redis, auth, i18n, ai-pipeline, vault)
public/data/              # Static medical reference JSON (treatments, drugs,
                          # labs, vaccinations — multi-locale variants)
prisma/                   # Prisma schema + generated client
db/migrations/            # Hand-written SQL migrations (geospatial, CMS, etc.)
scripts/                  # CLI / batch runners (content generation, seeding)
deploy/                   # nginx config + deploy assets
```

## Scripts

| Command                  | What it does                                |
| ------------------------ | ------------------------------------------- |
| `npm run dev`            | Next dev server                             |
| `npm run build`          | Production build                            |
| `npm run start`          | Run the production build                    |
| `npm run lint`           | ESLint (flat config, Next core-web-vitals)  |
| `npm run typecheck`      | `tsc --noEmit`                              |
| `npm run format`         | Prettier write (requires `prettier` dep)    |
| `npm run format:check`   | Prettier check                              |
| `npm run test` / `test:ci` | Vitest (requires `vitest` dep — see below)|
| `npm run db:generate`    | `prisma generate`                           |
| `npm run db:migrate`     | `prisma migrate dev`                        |
| `npm run seed:doctors`   | Seed doctor records                         |

### Optional dev tooling not yet in lockfile

The repo ships configs for Prettier, Vitest, and an ESLint security plugin, but the packages aren't installed yet. To enable them:

```bash
npm install --save-dev prettier vitest @vitest/ui eslint-plugin-security
```

## Commit conventions

- Conventional-ish prefixes seen in history: `feat:`, `fix:`, `chore:`, `security:`, `docs:`.
- Default branch: `main`. Feature branches: `feat/<short-slug>`. Hotfixes: `fix/<short-slug>`.
- Don't commit `.env*` or anything under `secrets/`.

## CI

GitHub Actions runs lint, typecheck, and build on push to `main` and on PRs — see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Deploy

Production is a self-hosted Node deployment fronted by nginx and supervised by pm2:

- `deploy/nginx.conf` — reverse proxy + TLS termination + caching headers
- `deploy.sh`, `deploy-quick.sh`, `deploy-to-vps.sh` — one-shot deploy scripts
- `ecosystem.aihealz.config.js` — pm2 process definition (install pm2 globally on the host)
- `server-setup.sh` — first-run host bootstrap

See also `SECURITY-ROTATION.md` for credential rotation procedures and `docs/` for the content / production roadmap.
