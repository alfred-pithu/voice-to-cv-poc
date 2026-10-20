import pg from "pg";

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

let pool: pg.Pool | null = null;

export function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!pool) {
    pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
  }
  return pool;
}

export async function withUser<T>(userId: string, run: (client: pg.PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    const identity = await client.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
      "SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user",
    );
    const role = identity.rows[0];
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error("The database role must be subject to row security.");
    }
    await client.query("BEGIN");
    await client.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [userId]);
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function withDatabase<T>(run: (client: pg.PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    return await run(client);
  } finally {
    client.release();
  }
}
