# Lessons

## 2026-05-09 — "broken UI" was a stale Turbopack dev server, not a code regression

**Symptom:** User reported the site was broken, DB disconnected, and the new dark-theme UI seemed to have been "removed". Local Postgres was healthy and `src/app/page.tsx` still had the dark theme.

**Cause:** A `next dev` process started by an earlier Claude session (PID 9283, parent shell PID 9264, uptime 9h+) had been running through the entire bureau→dark-theme refactor sweep (commits `48eb4a7`, `2030bf3`). Its in-memory module graph went out of sync with the source tree; most non-trivial routes returned HTTP 500.

**Fix:** Kill the whole npm/dev tree (npm → next dev → next-server), `rm -rf .next`, restart `npm run dev`. All routes back to 200, real DB-backed data renders, dark theme intact.

**Diagnostic shortcut:** `lsof -iTCP:3000 -sTCP:LISTEN` to find the PID, then `ps -p <pid> -o etime,command` — if uptime is hours and there have been intervening commits, suspect stale state before suspecting a code bug.

**Rules for future me:**
- When a user says "the UI is broken" and the source on disk looks correct, **first** check whether the running dev server is actually serving the current source. Compare `curl localhost:3000/<route>` against a freshly-restarted dev server on a different port before doing any code investigation.
- After any large refactor sweep (file moves, layout changes, tailwind config edits), proactively suggest `rm -rf .next && restart dev` rather than relying on Turbopack HMR.
- Do not leave a `next dev` background process alive across sessions. Either stop it cleanly or note its PID in a session report so the next session can decide.

## 2026-05-09 — Whole-site v4 Bureau implementation pattern

**Context:** The `aihealz redesign v4.html` claude.ai/design handoff specified a light "Bureau" editorial system (cool fog `#F4F6FA` bg + deep navy `#0A1A2F` ink + cobalt `#1C5BFF` brand). An earlier session implemented the v4 Navbar/Footer/Logo components but kept globals.css on the dark glassmorphic palette, and a later session "fixed the inconsistency" by making everything dark — exactly backwards. This session reverted those two commits, replaced globals.css with the Bureau token set, and converted ~120 pages + shared components.

**Process that worked:**
- Phase 1 (sequential, central): Read the design handoff + chat transcript + every artboard before touching anything. Foundational commit: globals.css + Geist fonts + Tailwind v4 @theme block + RTL/i18n preserved. Then handle the chrome and the homepage myself to set the visual language.
- Phase 2 (parallel via subagents): Once 5–6 pages were done myself, dispatch up to 3 parallel subagents at a time, each with: (a) the Bureau token+class reference inline in the prompt, (b) explicit forbidden Tailwind palette + glassmorphism rules, (c) artboard file paths to read, (d) "preserve every line of business logic" directive. Subagents handled ~100 of the conversions in 4 waves.
- Always smoke-test all touched routes after each agent returns; commit each wave atomically with what was preserved called out.

**Bureau visual rules I always specified to subagents (these matter):**
1. NO `bg-slate-*`, `text-slate-*`, `text-teal-*`, `text-cyan-*`, `text-emerald-*`, `text-rose-*`, `text-amber-*`, `border-white/X`, `bg-[#050B14]` anywhere.
2. NO `backdrop-blur*`, `bg-white/[0.0X]`, blur blobs, glow shadows, gradient text, gradient backgrounds (`from-/via-/to-`).
3. NO `rounded-3xl` / `rounded-[2rem]` — sharp 2/4/8/14px radii via `var(--r-*)` only.
4. Hairlines (1px var(--rule)) instead of shadows.
5. Cobalt is for emphasis (active states, primary CTAs); orange is **only** for closing punctuation (`<span style={{color: 'var(--orange)'}}>.</span>`).
6. Numerics + kickers always use `.mono` or `.num` (Geist Mono).
7. Tailwind layout classes (grid/flex/max-w-*/padding/margin/gap-*) are fine.

**For future me:** A whole-site reskin like this is doable in a single session if you (a) get the foundational commit right first, (b) parallelize aggressively but only for routine page conversions — keep central pages (homepage, hero detail pages, the design-defining ones) for yourself, and (c) commit each wave atomically so you can revert without losing other work if a subagent ships a regression.
