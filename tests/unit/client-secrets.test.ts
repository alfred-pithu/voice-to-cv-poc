/** @vitest-environment node */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

test("client modules do not reference the database url or service role", () => {
  const offenders: string[] = [];
  walk("src", offenders);
  expect(offenders).toEqual([]);
});

function walk(directory: string, offenders: string[]) {
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      walk(path, offenders);
      continue;
    }
    if (!/\.(ts|tsx|js|mjs)$/.test(entry)) continue;
    const source = readFileSync(path, "utf8");
    const isClient = source.includes('"use client"') || source.includes("'use client'");
    if (!isClient) continue;
    if (source.includes("DATABASE_URL") || source.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      offenders.push(path);
    }
  }
}
