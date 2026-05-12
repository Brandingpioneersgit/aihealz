# aihealz — Optimization & Functionality Plan

_Drafted: 2026-05-09_

This plan is grounded in a fresh codebase scan, the SEO audit at
`.planning/seo-audit.md`, and the AI work just completed (streaming bot,
rate-limit cache, MarkdownReply, ThinkingDock). Items are scoped, ordered
by leverage, and time-estimated for one senior engineer working focused.

---

## P0 — Tech debt that's actively wrong (1 day, 6–8 h)

These are *bugs in disguise* — paid-model defaults still in code that
will break or bill once invoked, plus the `/doctor/[slug]→/conditions`
404 from the SEO audit.

| Task | File | Effort |
|---|---|---|
| Replace `'gpt-4o-mini'` / `'deepseek-chat'` / `'anthropic/claude-sonnet-4'` defaults with the centralized `aiChat()` helper or a free-only fallback | `src/lib/ai-pipeline/pipeline.ts:117,174`, `src/lib/content/content-factory.ts:73,199`, `src/lib/content/enhanced-content-factory.ts:227`, `src/lib/content/cost-estimator.ts:55`, `src/lib/provider/onboarding.ts:264`, `src/app/api/admin/generate-content/route.ts:123`, `src/app/api/admin/seo-command/route.ts:139`, `src/app/api/admin/prompt-lab/route.ts:53` | 3 h |
| Fix `/doctor/[slug]` → links to `/conditions/{slug}` which 404s (per SEO audit) — point at the actual condition route or remove | `src/app/doctor/[slug]/page.tsx` | 1 h |
| Address SEO audit Phase 1 quick wins: pricing-page metadata, 4 noindex pages, missing canonicals on /about, /contact, /symptoms | various | 2 h |
| Promote in-memory rate-limit cache to Redis-backed (Redis already wired in `src/lib/redis.ts`, `src/lib/rate-limit.ts`) — single-instance correctness only today | `src/lib/ai/openrouter.ts` | 1 h |

---

## P1 — Roll the streaming AI pattern to remaining surfaces (1 week, 12–16 h)

Healz AI got streaming, markdown rendering, and the ThinkingDock. Five
more AI client pages still hit blocking JSON endpoints + render raw text:

| Surface | Endpoint | Effort |
|---|---|---|
| `/symptoms` | `/api/symptoms/analyze` (returns JSON array — keep JSON for the parsed cards but stream the per-condition explanation) | 3 h |
| `/analyze` | `/api/analyze` (lab pipeline) — stream the plain-English brief | 3 h |
| `/vault` & `/vault/dossier` | `/api/vault/analyze` — stream the report summary, persist on stream end | 2 h |
| `/chat/consult` | `/api/bot` (already streams — just port the client) | 1 h |
| `/chat/diagnostic` | `/api/diagnostics/chat` — extend route to support `stream: true`, port client | 2 h |
| `/clinical-reference` | `/api/reference/chat` — same | 2 h |

Each uses the now-reusable `MarkdownReply` and `ThinkingDock` components
verbatim. The 30 % time savings vs greenfield is from those existing.

**Stretch (3–4 h):** add a single `<AIChatPane>` component that wraps the
stream consumer, MarkdownReply, ThinkingDock, suggestion-chips routing,
and abort-on-typing — so any future AI surface is one tag.

---

## P2 — AI capability lifts (2 weeks, 22–30 h)

Higher-leverage than UI polish. Each one has a clear product hook.

### 2.1 Vault context injection (4–6 h)
When a logged-in user opens Healz AI / Analyze, offer "Use my recent labs
for context?" toggle. If on, attach last 3–5 vault summaries to the
system prompt. Massive quality lift on personalized advice.

### 2.2 Tool use / function calling (5–7 h)
Switch reasoning-mode calls to OpenRouter's tool-use API. Define tools
the model can call:
- `find_specialists(specialty, city)` — hits Prisma, returns 3 ranked doctors
- `find_conditions(symptom_keywords[])` — same on conditions
- `lookup_drug_dosing(name, age, weight, kidney_function)` — internal table

The model's reply gets grounded in real DB rows instead of hallucinations.
Citations become trivial (each tool result links to the source page).

### 2.3 Multilingual AI replies (2–3 h)
The proxy/middleware already sets `x-aihealz-lang`. Plumb that into the
system prompt for every AI route (`Reply in {language}.`). Vision route
is the same — already supports multilingual OCR.

### 2.4 Structured citations (3–4 h)
Post-stream pass: regex condition / drug / hospital names in the reply,
auto-link to the real page. Wraps inside MarkdownReply via a remark
plugin. Enormous SEO benefit (internal-link velocity), trust benefit
(every claim is auditable), engagement benefit (one-click deep dives).

### 2.5 Voice input (3–4 h)
Web Speech API on Healz AI + Symptoms input fields. "Tap to dictate."
Killer feature for elderly users, post-injury users, mobile-first
markets. Falls back gracefully where unsupported.

### 2.6 Save / share AI replies (3–4 h)
"Save to vault", "Email me this", "Copy as PDF" on every AI reply card.
Vault save is the conversion engine — turns a one-off Q&A into a
persistent dossier the user comes back to.

### 2.7 Post-reply suggested follow-ups (2 h)
After stream ends, run a tiny FAST-mode call to generate 3 follow-up
questions specific to *this* answer (vs the pre-stream keyword chips
which are about the question). Single-shot, ~50ms. Increases per-session
turn count.

---

## P3 — Performance (1 week, 8–12 h)

| Task | Why | Effort |
|---|---|---|
| Audit and convert remaining `<img>` → `next/image` | only 8 usages of `next/image` today; everything else is an unoptimized `<img>` paying the LCP tax | 3 h |
| Add `fetchPriority="high"` + explicit `width/height` to hero images | LCP improvement on homepage + condition pages | 1 h |
| `export const revalidate = 3600` (or appropriate) on top-traffic pages: homepage, /conditions, /doctors, /treatments, /hospitals | 70 k condition pages already use ISR — extend to indexes | 2 h |
| Edge runtime for read-only AI streaming routes | faster cold-start, geographic proximity | 2 h |
| Bundle analysis pass — `next build --turbopack-debug-bundle` (or `@next/bundle-analyzer`), strip unused CSS, lazy-import heavy client modules | Likely 100–200 kB chunk wins | 3 h |
| Pre-warm OpenRouter client on `/api/health` call | first-request latency drops further | 1 h |

---

## P4 — Trust / E-E-A-T (1 week, 10–14 h)

The site is YMYL — every signal that says "real humans review this"
moves rankings *and* user trust.

| Task | Effort |
|---|---|
| Surface "reviewed by Dr. X" stamp on every `/conditions/[slug]` page (the `reviewedBy` schema already claims this; the UI doesn't yet show it — fix the lie) | 2 h |
| Cross-link condition pages → matching specialists in user's city, treatments → related conditions, hospitals → doctor profiles. Phase 6 of SEO audit. | 6 h |
| Show ethical-badge status from mdrpedia.com on doctor profiles (call their API at build / ISR time, cache 24 h) | 2 h |
| Citation footnote system: every AI claim links to a source (works with P2.4) | 2 h |
| Last-updated timestamp + "next review due" prominent on condition pages | 1 h |

---

## P5 — SEO completion (per `.planning/seo-audit.md`) (1 week, 28–40 h)

Already documented in detail. Phases 1 (quick wins), 2 (helper extraction),
3 (high-priority schema), 4 (for-doctors subpages), 5 (doctor route bug),
6 (cross-linking — biggest SEO leverage), 7 (editorial board surfacing),
8 (final QA + Search Console). Phase 6 (cross-linking) overlaps with P4.

---

## P6 — Conversion / monetization (1–2 weeks, 14–20 h)

| Task | Effort |
|---|---|
| "Book a real consult" warm-handoff CTA on every AI reply — pre-fills the booking form with the conversation summary | 4 h |
| Insurance-coverage pre-check on `/doctors/[slug]` (if `acceptsInsurance` flag is on), call user's insurer or fall back to manual | 4 h |
| Save-to-vault flow for lab analysis (one-click, asks for sign-in if anonymous) | 3 h |
| Provider onboarding funnel polish (progress bar, save-and-resume, social-proof testimonials on each step) | 4 h |
| Referral / share program scaffolding (`?ref=` attribution, dashboard for referrers) | 3 h |
| GTM event tracking for AI tool engagement (start, first-byte, complete, abandon, copy, save) — feeds the analytics admin pages already in `src/app/api/admin/analytics` | 2 h |

---

## P7 — Operations / observability (3–5 days, 8–12 h)

| Task | Effort |
|---|---|
| Sentry integration (the `sentry-cli` skill is available) — error reporting for client + server, AI fallback events as warnings | 3 h |
| Admin dashboard widget: real-time AI model success rate, fallback chain depth distribution, average first-byte | 3 h |
| Synthetic monitoring of `/api/bot` (cron + Slack alert if no model in chain succeeds for >5 min) | 2 h |
| PII redaction extension in `src/lib/ai-pipeline/sanitizer.ts` — currently handles SSN; add phone, email, full-name patterns before sending user input to LLM | 2 h |
| Per-IP rate-limit on `/api/bot`, `/api/symptoms/analyze`, `/api/vault/analyze` (rate-limit.ts is already wired in `src/lib/rate-limit.ts`) | 2 h |

---

## P8 — Compliance & accessibility (1 week, 10–14 h)

| Task | Effort |
|---|---|
| Vault encryption review: confirm at-rest + in-transit on Google Drive bridge (`src/lib/vault/drive-bridge.ts`) | 2 h |
| GDPR compliance pass: cookie consent already wired (`src/components/ui/cookie-consent.tsx`), verify /privacy is current and matches actual data flows | 3 h |
| WCAG AA audit on the v4 design — automated (axe-core in CI) + manual on top 5 pages | 4 h |
| Keyboard nav on the new full-page menu + AI tool pages (focus traps, ESC handling — partially done already) | 2 h |
| ARIA live region on streaming AI replies so screen readers announce incremental text | 1 h |

---

## P9 — Future / strategic (timeboxed once base is solid)

Not estimated — these are product bets, not engineering tasks.

- **Family vault** — link multiple profiles under one account
- **Wearables integration** — pull HRV, glucose, sleep from Apple Health / Fitbit / Google Fit
- **Lab-trend alerts** — when a vault file shows a worrying trend, prompt the user
- **Telemedicine handoff** — direct video call from inside Healz AI when escalation is recommended
- **Programmatic SEO at scale** — generate `/[country]/[lang]/[condition]/cost` for every triple, currently only some exist
- **Editorial board public profiles** — each reviewer gets a `/editorial-board/[slug]` page with their reviewed conditions; massive E-E-A-T signal
- **Embeddable Healz-AI widget** — third-party sites embed our AI chat for their patients
- **API tier** — sell AI report-analysis as B2B endpoint to clinics

---

## Order-of-attack recommendation

1. **P0 (1 day)** — silently fixes the paid-model leaks + the /doctor → /conditions 404
2. **P1 (1 week)** — biggest visible UX win; every AI tool feels as fast as Healz AI
3. **P5 SEO Phase 1+2 (1 day)** — pricing-page metadata + helper extraction; embarrassing miss + multiplier on every later phase
4. **P2.1 + P2.3 (1 day)** — vault context + multilingual replies; both are quick + high-impact
5. **P4 (1 week)** + **P5 Phase 6 (cross-linking)** in parallel — SEO and trust, biggest joint leverage
6. **P3 (1 week)** — performance pass; gates Core Web Vitals score
7. **P2.2 + P2.4 (1 week)** — tool-use grounding + citations; raises the floor on AI quality
8. **P6 / P7 / P8** — pick based on traction signal

**Total of P0–P8: ~110–155 hours / 3–4 weeks of focused engineering.**
P9 is strategic and uncapped.
