/** @vitest-environment node */

import { readFileSync } from "node:fs";
import pg from "pg";
import { afterAll, expect, test } from "vitest";
import { sampleCv } from "@/features/cvs/fixtures";
import { registerUser } from "@/server/auth/session";
import { archiveCv, createCv, getCv, updateCv } from "@/server/cvs/repository";
import { withUser } from "@/server/db/pool";

if (!process.env.DATABASE_URL) {
  const match = readFileSync(".env", "utf8").match(/^DATABASE_URL=(.*)$/m);
  if (!match?.[1]) throw new Error("DATABASE_URL is missing. Run npm run db:migrate.");
  process.env.DATABASE_URL = match[1].trim();
}

const stamp = crypto.randomUUID();
const emailA = `rls-a-${stamp}@example.com`;
const emailB = `rls-b-${stamp}@example.com`;
const createdUserIds: string[] = [];

afterAll(async () => {
  if (createdUserIds.length === 0) return;
  const admin = new pg.Client({ database: "voxcv" });
  await admin.connect();
  await admin.query("DELETE FROM public.private_uploads WHERE owner_id = ANY($1::uuid[])", [createdUserIds]);
  await admin.query("DELETE FROM public.usage_ledger WHERE owner_id = ANY($1::uuid[])", [createdUserIds]);
  await admin.query("DELETE FROM public.cvs WHERE owner_id = ANY($1::uuid[])", [createdUserIds]);
  await admin.query("DELETE FROM public.profiles WHERE id = ANY($1::uuid[])", [createdUserIds]);
  await admin.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [createdUserIds]);
  await admin.end();
});

test("a user cannot read or change another user's CV", async () => {
  const userA = await registerUser(emailA, "password-a-123", "A");
  const userB = await registerUser(emailB, "password-b-123", "B");
  expect(userA).toBeTruthy();
  expect(userB).toBeTruthy();
  if (!userA || !userB) return;
  createdUserIds.push(userA, userB);

  const created = await createCv(userA, { ...sampleCv, title: "Private CV" });
  expect(created.document.ownerId).toBe(userA);

  const visible = await getCv(userA, created.id);
  expect(visible?.title).toBe("Private CV");
  expect(await getCv(userB, created.id)).toBeNull();

  expect(await updateCv(userB, created.id, created.document, created.revision)).toBe("missing");
  expect(await archiveCv(userB, created.id)).toBe(false);
  expect((await getCv(userA, created.id))?.title).toBe("Private CV");

  const renamed = await updateCv(
    userA,
    created.id,
    { ...created.document, title: "Renamed CV" },
    created.revision,
  );
  expect(renamed).not.toBe("missing");
  expect(renamed).not.toBe("conflict");
  if (renamed === "missing" || renamed === "conflict") return;
  expect(renamed.title).toBe("Renamed CV");
  expect(renamed.revision).toBe(created.revision + 1);

  await expect(
    withUser(userB, (client) =>
      client.query(
        `INSERT INTO public.cv_versions (cv_id, owner_id, revision, document_snapshot)
         VALUES ($1, auth.uid(), 99, $2::jsonb)`,
        [created.id, JSON.stringify(created.document)],
      ),
    ),
  ).rejects.toThrow();

  await withUser(userA, (client) =>
    client.query(
      `INSERT INTO public.usage_ledger (owner_id, feature, quantity, unit)
       VALUES (auth.uid(), 'export', 1, 'count')`,
    ),
  );
  await withUser(userA, (client) =>
    client.query(
      `INSERT INTO public.private_uploads (owner_id, storage_key, file_type, size_bytes)
       VALUES (auth.uid(), $1, 'application/pdf', 12)`,
      [`upload-${stamp}`],
    ),
  );

  const usageForB = await withUser(userB, (client) => client.query("SELECT id FROM public.usage_ledger"));
  const uploadsForB = await withUser(userB, (client) => client.query("SELECT id FROM public.private_uploads"));
  const usageForA = await withUser(userA, (client) => client.query("SELECT id FROM public.usage_ledger"));
  expect(usageForB.rowCount).toBe(0);
  expect(uploadsForB.rowCount).toBe(0);
  expect(usageForA.rowCount).toBe(1);

  const versions = await withUser(userA, (client) =>
    client.query("SELECT revision FROM public.cv_versions WHERE cv_id = $1 ORDER BY revision", [created.id]),
  );
  expect(versions.rows.map((row) => row.revision)).toEqual([1, 2]);
});
