import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";

export async function applyMigrations(pool) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(1020152019)");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_name TEXT PRIMARY KEY, checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`);
    const directory = new URL("../db/migrations/", import.meta.url);
    const files = (await readdir(directory))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    for (const filename of files) {
      const sql = await readFile(new URL(filename, directory), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const previous = await client.query(
        "SELECT checksum FROM schema_migrations WHERE migration_name = $1",
        [filename],
      );
      if (previous.rowCount) {
        if (previous.rows[0].checksum !== checksum)
          throw new Error("An applied migration was changed");
        continue;
      }
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (migration_name, checksum) VALUES ($1, $2)",
        [filename, checksum],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
