# Implementation status

Last updated: 2026-10-20. Checkpoints 0–4 are complete. The next checkpoint is direct dictation.

## Runtime inspection

| Item | Result |
| --- | --- |
| Working directory | `/Users/alfredpithu/Documents/codes/voice-cv-poc` |
| Existing files | `feature-list.md` only |
| Git | Not a repository |
| Node.js | v25.7.0 |
| npm | 11.10.1 |
| Architecture | darwin arm64 |
| Package manager | npm (chosen because no lockfile exists) |
| Secrets found | None |

## Commands

These commands are the project contract.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js dev server at http://localhost:3000 |
| `npm run db:migrate` | Creates the local `voxcv` database, the non-superuser role, and applies SQL. Re-runnable. |
| `npm run lint` | ESLint. Passed on 2026-10-20 after Checkpoint 4. |
| `npm run typecheck` | `tsc --noEmit`. Passed on 2026-10-20 after Checkpoint 4. |
| `npm test` | Vitest. Passed on 2026-10-20 after Checkpoint 4: 19 tests, including row-security isolation and the PDF render. |
| `npm run build` | Production build. Passed on 2026-10-20 after Checkpoint 4. |

Playwright end-to-end tests are added when a user-facing flow is stable enough to script, starting no later than the editor and export checkpoints.

## Credentials

No provider keys are required to run the local UI. Features stay disabled, with an explicit message, until the matching server-side variable is set.

| Variable | Needed from | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Checkpoint 4 | Local Postgres. Written by `npm run db:migrate`. The role must not bypass row security. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Later, if the project moves to hosted Supabase | Service role stays server-only and is unused. Do not put it in client code. |
| `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` | Checkpoint 6 | Server-only |
| `STT_PROVIDER`, `DEEPGRAM_API_KEY` | Checkpoint 5 | Server-only. Browser speech is a labeled fallback, not proof of Deepgram |
| `OPENAI_API_KEY`, `REALTIME_VOICE_PROVIDER` | Optional, not MVP default | Realtime voice is not the default pipeline |
| Stripe keys | Checkpoint 10, only after eligibility is verified | Checkout is not implemented before that decision |

`.env.example` is added with the app scaffold. Real `.env` files stay untracked.

## Checkpoint checklist

- [x] C0 — Repository inspection and plan
- [x] C1 — App shell and design system
- [x] C2 — CV schema and local editor
- [x] C3 — Templates and PDF export
- [x] C4 — Persistence and authentication
- [ ] C5 — Direct dictation
- [ ] C6 — Structured AI editing engine
- [ ] C7 — Conversational voice editing
- [ ] C8 — CV import
- [ ] C9 — Guided interview and job tailoring
- [ ] C10 — Usage, pricing, and billing readiness
- [ ] C11 — Security, accessibility, and quality hardening
- [ ] C12 — Production deployment and release

## Known limitations

- Signed out, the studio keeps one CV in this browser. Signed in, CVs are stored in local Postgres with forced row security. Export PDF still renders only the document you send, and the file is not stored.
- Voice and import are still later checkpoints.
- Accounts are local to this Postgres instance. They are not a hosted Supabase project, and `scripts/sql/001_local_auth.sql` must not be applied there.
- PDF page counts: the sample CV is 1 page and the long fixture is 3. Details are in `docs/PDF_QA.md`.
- `npm audit` still reports 5 high severity issues from the Next.js template tree. They were not force-fixed.
