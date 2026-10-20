# Architecture

VoxCV is a modular monolith: one Next.js app, a typed CV document, and provider interfaces that stay empty until their checkpoint.

## Shape

```text
Browser
  marketing pages
  workspace (sidebar, editor, preview, voice bar)
        │
        ▼
Next.js App Router
  server routes for auth, CV CRUD, import, export, speech session, AI propose
  operation validation and apply
  usage ledger
        │
        ├── Supabase Auth, Postgres, private Storage   (from C4)
        ├── Speech provider                            (from C5)
        ├── LLM provider                               (from C6)
        └── Payments                                    (from C10, if eligible)
```

No queue, no separate worker, no vector database.

## Repository layout

Directories are created when a checkpoint needs them. Target layout matches section 4.2 of `feature-list.md`.

```text
src/app/(marketing)     public pages
src/app/(app)           workspace shell
src/app/api             server routes, added per checkpoint
src/components/ui       design system
src/components/workspace
src/features/cvs        document model, editor, local history
src/server/auth         password hashes and the session cookie
src/server/cvs          owner-scoped CV reads and writes
src/server/db           Postgres pool, refused when the role bypasses row security
src/server/providers    speech, llm, payments
src/server/operations   validate and apply CV operations
```

## Document and edits

`CVDocument` is the only résumé representation. Templates read it and render HTML. AI may only return `CVOperation` values from a closed registry. The server validates every operation with Zod, checks IDs and ownership, and refuses unknown types and authorization fields (`ownerId`, document id, revision timestamps).

Applies use a revision check. Undo stores the previous document, not a second model.

## Security boundaries

- Provider secrets and the Supabase service role never ship to the client.
- `NEXT_PUBLIC_` is limited to the app URL and the Supabase URL plus anon key.
- User content, imports, and job descriptions are untrusted data.
- Row Level Security scopes every user-owned table by the authenticated owner. The client-supplied owner id is ignored.
- Raw audio is not stored.

## Local development boundary

Guest editing still uses one document in this browser. Signed-in CVs go through the API into local Postgres. `auth.uid()` reads `request.jwt.claim.sub`, set inside a transaction. The app role is `voxcv_app`, with row security forced. `scripts/sql/001_local_auth.sql` is a local stand-in and must not be applied to hosted Supabase. Routes that need a database and do not have `DATABASE_URL` return a configuration error.
