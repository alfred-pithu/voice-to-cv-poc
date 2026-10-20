# Decisions

Assumptions made so implementation can proceed without blocking questions. Update this file when a decision changes.

## D1 — Specification location

`feature-list.md` is the source-of-truth build specification. It describes itself as the README. A short root `README.md` points here and to `docs/` so the repository still has a conventional entry point. Checklist updates happen in both `feature-list.md` section 17 and `docs/IMPLEMENTATION_STATUS.md`.

## D2 — Package manager and runtime

Use npm. Node v25.7.0 and npm 11.10.1 were present at inspection. Pin versions in `package.json` and commit a lockfile when the app is scaffolded.

## D3 — Application stack (verified 2026-10-20 via `npm view`)

| Package | Version chosen | Why |
| --- | --- | --- |
| next | 16.4.2 | Current stable. App Router. |
| typescript | ^5, as installed by `create-next-app@16.4.2` | The Next 16.4.2 template does not use TypeScript 7. Stay on the template's compiler so the app matches current Next docs. |
| react / react-dom | 19.3.0 | Installed by the Next 16.4.2 template. `npm view react version` reported 19.3.1; the template pin is the one we run. |
| tailwindcss | 4.3.3 | Current stable. Tokens live in CSS. |
| zod | 4.6.7 | Runtime validation for the CV model and API input. |
| react-hook-form | 7.90.0 | Forms where a form library helps. Plain controlled inputs are fine for small fields. |
| vitest | 4.1.12 | Unit tests. `npm view` reported 5.0.5, but `npm install` resolved 4.1.12, so the app stays on the resolved release. |
| @playwright/test | 1.64.1 | End-to-end and, later, controlled PDF rendering. |
| lucide-react | 1.60.0 | One icon set. |

shadcn/ui was not added. Checkpoint 1 uses a small local set — button, text field, native `dialog`, and a toast region — so the visual identity stays editorial instead of a default component theme. Revisit shadcn only if a later checkpoint needs a larger widget set.

## D4 — What stays local until later checkpoints

- Checkpoint 1 is shell and design only. Demo CV data is labeled as demo.
- Checkpoint 2 keeps the CV in component state plus `localStorage`. No account is required.
- Checkpoint 4 uses local Postgres with a Supabase-shaped `auth.uid()` and forced row security. Hosted Supabase is not configured on this machine.
- Deepgram and any LLM wait until their checkpoints, and only behind server routes.
- Stripe checkout is not built until eligibility and pricing are recorded. Checkpoint 10 can ship a plan abstraction and usage ledger without taking payments.

## D5 — Voice architecture

MVP default is the chained pipeline from the spec: capture, speech-to-text, structured operations, user review, then apply. The Web Speech API may be a clearly labeled fallback when no speech key is configured. It is not treated as a production provider. Realtime voice is out of the MVP path.

Dictation and conversational editing stay separate modes. Dictated words never become commands.

## D6 — Document model

The canonical CV is versioned JSON (`schemaVersion: 1`) validated with Zod. HTML is a template rendering of that JSON, never the source of truth. Stable string IDs identify entries and bullets. Section order is an explicit array.

## D7 — PDF export

Render templates with print CSS. Produce the downloadable PDF with Playwright/Chromium on the server so text stays selectable and no third-party rendering service sees the document. Until that route exists, the preview is on-screen HTML only. No fake download button.

## D8 — Guest use

The editor works without an account while data is local. Once accounts exist, guest documents can be kept locally until the user signs in. Cross-device sync requires an account.

## D9 — Visual identity

Editorial and calm: warm paper background, ink text, one deep teal accent. Serif for marketing headlines and CV template titles, sans for the product UI. No purple-gradient "AI" look, and no clone of FlowCV or SpeakResume layouts.

## D10 — Honest unavailable actions

A control that is not implemented yet is either absent or visibly disabled with the checkpoint that will add it. Import, microphone, and billing do not pretend to succeed. Sign-in and PDF export do real work.

## D11 — Git

The folder was not a git repository at inspection. Git is initialized when the first application scaffold exists so later checkpoints are reviewable. Commits happen only when asked.

## D12 — Checkpoint 4 database

Docker and the Supabase CLI are not installed, so `supabase start` cannot run. Local Postgres 17 is the database. Migrations in `supabase/migrations` use `auth.uid()` so they can move to Supabase later. The local auth schema, session table, and scrypt password hashes live in `scripts/sql` and are not for a hosted Supabase project. The app connects as `voxcv_app` and refuses to run queries as a superuser. The service-role key stays empty and out of client code.
