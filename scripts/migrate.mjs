import { existsSync } from "node:fs";
import pg from "pg";
import { applyMigrations } from "./migration-runner.mjs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.MIGRATION_DATABASE_URL;
if (!url) {
  console.error(
    "MIGRATION_DATABASE_URL is required; no runtime URL fallback is used.",
  );
  process.exitCode = 1;
} else {
  const pool = new pg.Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  try {
    await applyMigrations(pool);
    console.log("Database migrations applied successfully.");
  } catch {
    console.error(
      "Migration failed. Check configuration, connectivity, and applied migration checksums.",
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
