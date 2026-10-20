import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

if (!process.env.DATABASE_URL && existsSync(envPath)) {
  process.env.DATABASE_URL = readDatabaseUrl(readFileSync(envPath, "utf8"));
}

if (!process.env.DATABASE_URL) {
  const password = randomBytes(18).toString("hex");
  const databaseUrl = `postgresql://voxcv_app:${password}@127.0.0.1:5432/voxcv`;
  const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : readFileSync(resolve(root, ".env.example"), "utf8");
  writeFileSync(envPath, upsertDatabaseUrl(current, databaseUrl));
  process.env.DATABASE_URL = databaseUrl;
  console.log("Wrote DATABASE_URL to .env");
}

function readDatabaseUrl(text) {
  const matches = [...text.matchAll(/^DATABASE_URL=(.*)$/gm)];
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const value = matches[index][1].trim();
    if (value) return value;
  }
  return "";
}

function upsertDatabaseUrl(text, databaseUrl) {
  const lines = text.split("\n");
  let replaced = false;
  const next = lines
    .filter((line) => {
      if (!line.startsWith("DATABASE_URL=")) return true;
      if (replaced) return false;
      replaced = true;
      return true;
    })
    .map((line) => (line.startsWith("DATABASE_URL=") ? `DATABASE_URL=${databaseUrl}` : line));
  if (!replaced) next.push(`DATABASE_URL=${databaseUrl}`);
  return `${next.join("\n").trim()}\n`;
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const password = decodeURIComponent(databaseUrl.password);
const admin = new pg.Client({ database: "postgres" });
await admin.connect();
const role = await admin.query("SELECT 1 FROM pg_roles WHERE rolname = 'voxcv_app'");
const quotedPassword = (await admin.query("SELECT quote_literal($1) AS password", [password])).rows[0].password;
if (role.rowCount === 0) {
  await admin.query(
    `CREATE ROLE voxcv_app LOGIN PASSWORD ${quotedPassword} NOSUPERUSER NOBYPASSRLS NOCREATEDB`,
  );
} else {
  await admin.query(`ALTER ROLE voxcv_app PASSWORD ${quotedPassword} NOSUPERUSER NOBYPASSRLS`);
}
const databaseExists = await admin.query("SELECT 1 FROM pg_database WHERE datname = 'voxcv'");
if (databaseExists.rowCount === 0) {
  await admin.query("CREATE DATABASE voxcv");
}
await admin.end();

const owner = new pg.Client({ database: "voxcv" });
await owner.connect();
const files = [
  "scripts/sql/001_local_auth.sql",
  "supabase/migrations/20261020160000_cvs.sql",
  "scripts/sql/003_auth_functions.sql",
  "scripts/sql/002_grants.sql",
];
for (const file of files) {
  const sql = readFileSync(resolve(root, file), "utf8");
  await owner.query(sql);
  console.log(`Applied ${file}`);
}
await owner.end();
console.log("Database is ready.");
