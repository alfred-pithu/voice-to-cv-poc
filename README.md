# VoxCV

VoxCV is a résumé studio. You edit a structured CV, see a live preview, switch templates, undo changes, and download a PDF. The long-term product is voice-first: dictate into a field, or say “move projects above education,” then accept, reject, or undo the change. Voice and AI are not built yet.

This file is the starting guide. It explains what the product is, what already works, how the code is arranged, and how to run it on a new machine.

The build specification for future work is [`feature-list.md`](feature-list.md). What is finished is tracked in [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md). Why the stack looks like this is in [`docs/DECISIONS.md`](docs/DECISIONS.md).

## What you can do today

Open http://localhost:3000 after the setup steps below.

| You can | Where |
| --- | --- |
| Read the marketing pages | `/`, `/examples`, `/pricing`, `/privacy`, `/faq`, `/import` |
| Edit a CV without an account | `/studio` |
| Create an account, sign in, and sign out | `/sign-up`, `/sign-in` |
| Save, reopen, rename, duplicate, and archive CVs | `/studio`, once signed in |
| Reorder sections, edit fields, undo, and redo | `/studio` |
| Switch among Classic, Modern, and Editorial | `/studio` |
| Download a selectable-text PDF | Export PDF in the studio |

These controls exist in the UI and tell you they are not ready: dictation, voice commands, and importing an existing CV file. They must stay honest. A button either does the real thing or says it is not available yet.

## The one idea everything else hangs on

A CV is not HTML. A CV is one JSON object called `CVDocument`.

The editor changes that object. The preview and the PDF are drawings of that object. Templates change how it looks. They do not change the career facts inside it.

Every job, school, project, skill group, certification, bullet, and link has its own string id. Order in the array is display order. The id is the identity. If you delete item 2 and add a new one, the new one gets a new id. Do not use “the third bullet” as a permanent identity.

`schemaVersion` is `1`. Zod checks the shape at the edges: when it is loaded from the browser, when it is saved to the database, and when it is sent to PDF export. TypeScript types alone are not enough, because network and storage input can be anything.

The schema lives in `src/features/cvs/schema.ts`. The functions that change a document live in `src/features/cvs/edits.ts`. Undo stores earlier copies of the whole document in memory (`src/features/cvs/history.ts`). It does not store a second kind of model.

## What is deliberately not here yet

Work is split into checkpoints. Checkpoints 0 through 4 are done. The next one is 5.

| Checkpoint | Meaning | State |
| --- | --- | --- |
| 0 | Look at the repo and write the plan | Done |
| 1 | Pages, layout, and the small design system | Done |
| 2 | CV schema and an editor that saves in this browser | Done |
| 3 | Three templates and PDF download | Done |
| 4 | Accounts and CVs stored in Postgres | Done |
| 5 | Direct dictation into a field | Next |
| 6 | AI proposes small, checked edits | Later |
| 7 | Conversational voice editing | Later |
| 8 | Import an existing CV | Later |
| 9 | Guided interview and job tailoring | Later |
| 10 | Usage limits and billing readiness | Later |
| 11 | Security, accessibility, and quality pass | Later |
| 12 | Production deploy | Later |

Do one checkpoint at a time. The planned product shape is in `docs/ARCHITECTURE.md` and section 4 of `feature-list.md`. Empty folders for speech, AI, and payments are not created until that checkpoint needs them.

## How a signed-in edit moves through the app

```text
You type in the studio
        │
        ▼
CvEditor calls a function in src/features/cvs/edits.ts
        │
        ▼
The new CVDocument is pushed onto undo history
        │
        ├─ signed out: written to localStorage under the key voxcv.cv.v1
        │
        └─ signed in: after a short pause, PATCH /api/cvs/:id
                │
                ▼
           The route checks the session cookie
                │
                ▼
           Zod checks the document
                │
                ▼
           Postgres updates the row only if the revision still matches
                │
                ▼
           A copy is stored in cv_versions
```

Guest editing never touches the database. The sample CV (`src/features/cvs/fixtures.ts`) is what you see when this browser has no saved document, or when the saved JSON is broken.

Signed-in editing autosaves about 400ms after you stop typing. The client sends the revision it last received. If someone else saved first, the server answers `409` and the studio shows a conflict instead of overwriting their copy.

The server ignores a client-supplied owner. `owner_id` in the database is `auth.uid()`, which is the user id from the session, set inside the database transaction.

PDF export is a separate path. `POST /api/export/pdf` renders the JSON you send. It does not look up a stored CV, and it does not keep the file.

## Run it from a new machine

You need:

- Node.js 20 or newer. This repo was built with Node 25 and npm 11. Use npm. The lockfile is `package-lock.json`.
- PostgreSQL running on `127.0.0.1:5432`. Checkpoint 4 was built against Postgres 17. The migrate script connects to a database named `postgres` as your local database user, then creates the app role and the `voxcv` database. On a normal Homebrew install, that local user can connect without a password.
- Chromium for Playwright, the first time you export a PDF: `npx playwright install chromium`.

```bash
git clone https://github.com/alfred-pithu/voice-to-cv-poc.git
cd voice-to-cv-poc
npm install
npm run db:migrate
npm run dev
```

Then open http://localhost:3000.

`npm run db:migrate` is safe to run again. The first time, it writes `DATABASE_URL` into `.env`. That file is gitignored. `.env.example` lists every variable and is the one that belongs in git.

If `DATABASE_URL` is missing, the studio still opens and guest editing still works. Sign-up, sign-in, and CV routes answer `503` with “Accounts are not configured on this server.”

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server at http://localhost:3000 |
| `npm run db:migrate` | Create the local role, database, and tables |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest |
| `npm run build` | Production build |
| `npm start` | Serve the production build, after `npm run build` |

Before you call a checkpoint done, run lint, typecheck, test, and build, and fix failures that your change caused.

## Pages

Marketing pages use `src/app/(marketing)/layout.tsx`, which adds the header and footer.

| URL | File | What it is |
| --- | --- | --- |
| `/` | `src/app/(marketing)/page.tsx` | Landing page |
| `/examples` | `src/app/(marketing)/examples/page.tsx` | Examples |
| `/pricing` | `src/app/(marketing)/pricing/page.tsx` | Pricing copy. No checkout |
| `/privacy` | `src/app/(marketing)/privacy/page.tsx` | Privacy |
| `/faq` | `src/app/(marketing)/faq/page.tsx` | FAQ |
| `/import` | `src/app/(marketing)/import/page.tsx` | Explains that import is not ready |
| `/sign-in` | `src/app/(marketing)/sign-in/page.tsx` | Sign in |
| `/sign-up` | `src/app/(marketing)/sign-up/page.tsx` | Create an account |
| `/studio` | `src/app/(app)/studio/page.tsx` | The editor |

The `(marketing)` and `(app)` folders are route groups. They organize layouts. They are not part of the URL.

`/studio` renders `StudioLoader`, which loads `StudioShell` in the browser only. The editor reads `localStorage`, so it does not render on the server.

## API

All of these live under `src/app/api`. Auth and CV routes need `DATABASE_URL` and a signed-in user, except the routes that create or read the session itself.

| Method and path | Auth | What it does |
| --- | --- | --- |
| `POST /api/auth/sign-up` | No | Email, password (at least 8 characters), optional display name. Sets the session cookie |
| `POST /api/auth/sign-in` | No | Email and password. Sets the session cookie |
| `POST /api/auth/sign-out` | Cookie | Deletes the session and clears the cookie |
| `GET /api/auth/session` | Cookie | `{ user: { id, email } }` or `{ user: null }` |
| `GET /api/cvs` | Yes | Lists this user’s CVs. Archived rows are hidden |
| `POST /api/cvs` | Yes | Creates a CV from `{ document }` |
| `GET /api/cvs/:id` | Yes | One CV, including the document |
| `PATCH /api/cvs/:id` | Yes | Saves `{ revision, document }`. `409` if the revision is stale |
| `DELETE /api/cvs/:id` | Yes | Soft-delete. Sets `deleted_at`. The row stays |
| `POST /api/cvs/:id/duplicate` | Yes | Copies the CV, with a new id and a “Copy of …” title |
| `POST /api/export/pdf` | No | Body is the `CVDocument` itself. Returns `application/pdf` |

Export rejects a body over 200 KB, a non-JSON content type, and any document that fails the schema.

## Folder map

`@/` means `src/`. That alias is in `tsconfig.json`.

```text
src/app
  layout.tsx              fonts, page title, skip link
  globals.css             colors and Tailwind theme
  (marketing)             public pages
  (app)/studio            the editor route, plus loading and error UI
  api                     route handlers from the table above

src/components
  ui                      Button, Input, Dialog, Toast
  marketing               header and footer
  auth                    sign-in and sign-up form
  workspace               studio shell, editor, section order
  resume                  on-screen preview
  templates               print view of a CVDocument

src/features/cvs
  schema.ts               Zod schema and CVDocument type
  edits.ts                pure functions that change a document
  history.ts              undo and redo stacks
  storage.ts              localStorage load and save
  fixtures.ts             the sample CV guests start from
  qa-fixtures.ts          longer documents used by PDF tests

src/server
  auth                    passwords, session cookie, requireUser
  cvs/repository.ts       owner-scoped SQL
  db/pool.ts              Postgres pool and the row-security guard
  export                  HTML markup and Playwright PDF

src/lib/product-status.ts copy for features that are not ready yet

scripts
  migrate.mjs             creates the role, database, and applies SQL
  sql                     local auth stand-in and grants

supabase/migrations       CV tables. Written so they can move to Supabase later

tests
  unit                    schema, edits, preview, PDF, a secret scan
  integration/rls.test.ts two users cannot read each other’s CVs

docs                      status, decisions, architecture, PDF notes
feature-list.md           the full product and checkpoint spec
```

There is no `src/server/providers` yet. Speech, the language model, and payments will get a small server-side interface when their checkpoint starts. Keys for those providers stay on the server.

## The studio screen

`src/components/workspace/studio-shell.tsx` is the product UI.

- Left side: sections and the CV library.
- Center: the field editor.
- Right side: the live preview.
- On a narrow screen, Editor, Preview, and CVs are tabs.

The microphone control is visible and disabled, with a sentence that says dictation comes later. Import is the same kind of honest dead end.

Undo and redo are keyboard-and-mouse actions on the in-memory history. They are available whether or not you are signed in. The database also keeps a snapshot per revision in `cv_versions`, but the studio undo button uses the in-memory stack.

## Accounts and the database

This machine does not use hosted Supabase. Accounts are rows in local Postgres.

- Passwords are hashed with scrypt in `src/server/auth/password.ts`. The hash is `scrypt$<salt>$<hash>`.
- The cookie is `voxcv_session`. It is `HttpOnly`, `SameSite=Lax`, and lasts 30 days. The cookie stores a random token. The database stores the SHA-256 hash of that token.
- `src/server/db/pool.ts` refuses to run queries if the connected role is a superuser or can bypass row security.
- For a signed-in CV query, the server starts a transaction and sets `request.jwt.claim.sub` to the user id. `auth.uid()` reads that setting. Row Level Security then hides every other user’s rows.

Tables created by the migration:

| Table | Used now? | Purpose |
| --- | --- | --- |
| `auth.users` | Yes | Email and password hash |
| `auth.sessions` | Yes | Hashed session tokens |
| `public.profiles` | Created | Display name and locale. The app does not read it in the UI yet |
| `public.cvs` | Yes | Current document, title, template, revision, soft delete |
| `public.cv_versions` | Yes | One JSON snapshot per revision |
| `public.usage_ledger` | Created | Reserved for later usage limits |
| `public.private_uploads` | Created | Reserved for later imports |

SQL files, in the order `npm run db:migrate` applies them:

1. `scripts/sql/001_local_auth.sql` — local `auth` schema, `auth.uid()`, users, sessions.
2. `supabase/migrations/20261020160000_cvs.sql` — CV tables and row-security policies.
3. `scripts/sql/003_auth_functions.sql` — register, look up credentials, create and delete sessions.
4. `scripts/sql/002_grants.sql` — what the `voxcv_app` role is allowed to do.

`001_local_auth.sql` is a local stand-in. Hosted Supabase already owns the `auth` schema. Do not run that file there.

The app connects as `voxcv_app`, a role with `NOSUPERUSER` and `NOBYPASSRLS`. It cannot read `auth.users` or `auth.sessions` directly. It calls the `auth.*` functions instead.

## PDF export

`src/server/export/cv-markup.ts` turns a document into HTML. `src/components/templates/template-css.ts` is the print CSS. `src/server/export/render-pdf.ts` opens headless Chromium through Playwright and prints A4.

Empty sections are left out. Placeholder lines such as “No experience yet” are not printed. Text in the PDF is selectable. Notes from the last check are in `docs/PDF_QA.md`.

Playwright and `pg` are listed in `serverExternalPackages` in `next.config.ts`, so Next does not try to bundle them.

## Visual language

Warm paper, ink text, one deep teal accent. Fraunces is the serif for headlines and CV titles. Source Sans 3 is the UI font. Colors are CSS variables in `src/app/globals.css`, then exposed to Tailwind with `@theme`.

The design system is four local components: button, text field, dialog, and toast. A larger component kit was skipped on purpose so the product would not look like a default theme.

## Environment variables

Copy the names from `.env.example`. Only `DATABASE_URL` matters for the current checkpoints.

| Variable | Who can see it | When it matters |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Browser | App URL. Default `http://localhost:3000` |
| `DATABASE_URL` | Server | Local Postgres. Written by `npm run db:migrate` |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Empty until a hosted Supabase project exists |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Empty until then |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Unused. Never import it from a client component |
| `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` | Server | Checkpoint 6 |
| `STT_PROVIDER`, `DEEPGRAM_API_KEY` | Server | Checkpoint 5 |
| `REALTIME_VOICE_PROVIDER`, `OPENAI_API_KEY` | Server | Optional. Realtime voice is not the default plan |
| `PAYMENT_PROVIDER`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe secret stays on the server | Checkpoint 10, and only after payments are actually allowed |

Anything starting with `NEXT_PUBLIC_` is shipped to the browser. Provider secrets must not use that prefix.

## Tests

Vitest uses jsdom. Config is `vitest.config.mts`. `tests/setup.ts` unmounts React trees after each test.

| File | What it locks in |
| --- | --- |
| `tests/unit/cv-document.test.ts` | Schema, edits, ids, undo, section order, templates |
| `tests/unit/templates.test.ts` | HTML follows the template and skips empty sections |
| `tests/unit/pdf.test.ts` | PDF route returns the posted CV and rejects a bad one |
| `tests/unit/shell.test.tsx` | Marketing and studio honesty: disabled actions stay disabled |
| `tests/unit/client-secrets.test.ts` | Client files do not mention `DATABASE_URL` or the service-role key |
| `tests/integration/rls.test.ts` | User A cannot read or change user B’s CV |

The row-security test needs the migrated local database. Unit tests do not.

There is no Playwright end-to-end suite yet. Playwright is used on the server to print PDFs. Browser end-to-end tests come when a user flow is stable enough to script.

## Rules that keep the product coherent

- Change the document through `src/features/cvs/edits.ts`, then validate with `parseCvDocument`. Do not hand-edit JSON in the UI and hope the shape is still valid.
- Unknown fields are rejected. The Zod objects are strict.
- A feature that is not implemented is absent, or disabled with a plain explanation. Do not fake a successful import, recording, or payment.
- Voice, when it arrives, is optional. Every core action must still work with a keyboard and a mouse.
- AI, when it arrives, proposes small operations. It must not replace the whole CV to change one bullet, and it must not invent employers, dates, degrees, or metrics.
- User content, imported files, and job descriptions are untrusted data.
- Do not log secrets, passwords, session tokens, or raw audio. Raw audio is not stored.
- This Next.js is 16.4.2, with React 19. APIs differ from older Next versions. Before you add framework code, read the matching guide in `node_modules/next/dist/docs/`.

## Where to read next

| If you need | Open |
| --- | --- |
| The product, checkpoints, and agent rules | `feature-list.md` |
| What is finished and what is limited | `docs/IMPLEMENTATION_STATUS.md` |
| Why a choice was made | `docs/DECISIONS.md` |
| The system shape | `docs/ARCHITECTURE.md` |
| What the PDF check actually covered | `docs/PDF_QA.md` |

A useful first code path: open `/studio` while signed out, follow a keystroke from `CvEditor` into `edits.ts`, then sign in and follow the same edit into `PATCH /api/cvs/:id` and `src/server/cvs/repository.ts`.
