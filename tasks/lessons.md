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
