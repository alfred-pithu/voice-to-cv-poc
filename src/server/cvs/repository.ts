import type pg from "pg";
import { parseCvDocument, type CVDocument } from "@/features/cvs/schema";
import { withUser } from "@/server/db/pool";

export type CvSummary = {
  id: string;
  title: string;
  revision: number;
  updatedAt: string;
};

export type CvRecord = CvSummary & { document: CVDocument };

type CvRow = {
  id: string;
  title: string;
  revision: number;
  updated_at: Date;
  document_json: CVDocument;
};

export async function listCvs(userId: string): Promise<CvSummary[]> {
  return withUser(userId, async (client) => {
    const result = await client.query<CvRow>(
      `SELECT id, title, revision, updated_at
       FROM public.cvs
       WHERE deleted_at IS NULL
       ORDER BY updated_at DESC`,
    );
    return result.rows.map(toSummary);
  });
}

export async function getCv(userId: string, id: string): Promise<CvRecord | null> {
  return withUser(userId, async (client) => {
    const result = await client.query<CvRow>(
      `SELECT id, title, revision, updated_at, document_json
       FROM public.cvs
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    const row = result.rows[0];
    return row ? toRecord(row) : null;
  });
}

export async function createCv(
  userId: string,
  document: CVDocument,
  sourceCvId: string | null = null,
): Promise<CvRecord> {
  const owned = ownedDocument(
    {
      ...document,
      id: isUuid(document.id) ? document.id : crypto.randomUUID(),
    },
    userId,
  );
  return withUser(userId, async (client) => {
    const inserted = await client.query<CvRow>(
      `INSERT INTO public.cvs (
         id, owner_id, title, document_json, schema_version, template_id, revision, source_cv_id
       )
       VALUES ($1, auth.uid(), $2, $3::jsonb, $4, $5, 1, $6)
       RETURNING id, title, revision, updated_at, document_json`,
      [owned.id, owned.title, JSON.stringify(owned), owned.schemaVersion, owned.templateId, sourceCvId],
    );
    const row = inserted.rows[0];
    if (!row) throw new Error("The CV was not created.");
    await insertVersion(client, row.id, 1, owned, "Created");
    return toRecord(row);
  });
}

export async function updateCv(
  userId: string,
  id: string,
  document: CVDocument,
  expectedRevision: number,
): Promise<CvRecord | "missing" | "conflict"> {
  const owned = ownedDocument({ ...document, id }, userId);
  return withUser(userId, async (client) => {
    const updated = await client.query<CvRow>(
      `UPDATE public.cvs
       SET title = $2,
           document_json = $3::jsonb,
           schema_version = $4,
           template_id = $5,
           revision = revision + 1,
           updated_at = now()
       WHERE id = $1 AND revision = $6 AND deleted_at IS NULL
       RETURNING id, title, revision, updated_at, document_json`,
      [id, owned.title, JSON.stringify(owned), owned.schemaVersion, owned.templateId, expectedRevision],
    );
    const row = updated.rows[0];
    if (row) {
      await insertVersion(client, row.id, row.revision, owned, "Edited");
      return toRecord(row);
    }
    const existing = await client.query("SELECT id FROM public.cvs WHERE id = $1 AND deleted_at IS NULL", [id]);
    return existing.rowCount ? "conflict" : "missing";
  });
}

export async function duplicateCv(userId: string, id: string): Promise<CvRecord | null> {
  const current = await getCv(userId, id);
  if (!current) return null;
  const copy = ownedDocument(
    {
      ...current.document,
      id: crypto.randomUUID(),
      title: `Copy of ${current.title}`.slice(0, 240),
    },
    userId,
  );
  return createCv(userId, copy, current.id);
}

export async function archiveCv(userId: string, id: string): Promise<boolean> {
  return withUser(userId, async (client) => {
    const result = await client.query(
      `UPDATE public.cvs SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function ownedDocument(document: CVDocument, userId: string): CVDocument {
  return parseCvDocument({
    ...document,
    ownerId: userId,
    updatedAt: new Date().toISOString(),
  });
}

async function insertVersion(
  client: pg.PoolClient,
  cvId: string,
  revision: number,
  document: CVDocument,
  summary: string,
) {
  await client.query(
    `INSERT INTO public.cv_versions (cv_id, owner_id, revision, document_snapshot, change_summary)
     VALUES ($1, auth.uid(), $2, $3::jsonb, $4)`,
    [cvId, revision, JSON.stringify(document), summary],
  );
}

function toSummary(row: CvRow): CvSummary {
  return {
    id: row.id,
    title: row.title,
    revision: row.revision,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function toRecord(row: CvRow): CvRecord {
  return {
    ...toSummary(row),
    document: parseCvDocument(row.document_json),
  };
}
