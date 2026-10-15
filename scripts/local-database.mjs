import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { userInfo } from "node:os";
import pg from "pg";
import { applyMigrations } from "./migration-runner.mjs";

const directory = resolve(".local/postgres");
const port = "55439";
const action = process.argv[2] ?? "start";
function run(command, args) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

try {
  if (action === "stop") {
    run("pg_ctl", ["-D", directory, "stop", "-m", "fast"]);
    console.log("Local PostgreSQL stopped; data files retained.");
  } else if (action === "start") {
    mkdirSync(resolve(".local"), { recursive: true });
    if (!existsSync(resolve(directory, "PG_VERSION"))) {
      run("initdb", [
        "-D",
        directory,
        "-A",
        "trust",
        "--no-locale",
        "-E",
        "UTF8",
      ]);
    }
    let running = false;
    try {
      run("pg_ctl", ["-D", directory, "status"]);
      running = true;
    } catch {
      /* Start only this project's cluster. */
    }
    if (!running)
      run("pg_ctl", [
        "-D",
        directory,
        "-l",
        resolve(".local/postgres.log"),
        "-o",
        `-p ${port} -h 127.0.0.1 -k /private/tmp`,
        "start",
      ]);
    const owner = encodeURIComponent(userInfo().username);
    const base = `postgresql://${owner}@127.0.0.1:${port}`;
    const admin = new pg.Pool({ connectionString: `${base}/postgres`, max: 1 });
    try {
      for (const database of ["kvarta_development", "kvarta_test"]) {
        const exists = await admin.query(
          "SELECT 1 FROM pg_database WHERE datname = $1",
          [database],
        );
        if (!exists.rowCount)
          await admin.query(
            database === "kvarta_test"
              ? "CREATE DATABASE kvarta_test"
              : "CREATE DATABASE kvarta_development",
          );
        const pool = new pg.Pool({
          connectionString: `${base}/${database}`,
          max: 1,
        });
        try {
          await applyMigrations(pool);
          if (database === "kvarta_development") {
            const role = await admin.query(
              "SELECT 1 FROM pg_roles WHERE rolname = 'kvarta_app'",
            );
            if (!role.rowCount)
              await admin.query("CREATE ROLE kvarta_app LOGIN");
            await pool.query("GRANT USAGE ON SCHEMA public TO kvarta_app");
            await pool.query("GRANT SELECT, INSERT ON leads TO kvarta_app");
          }
        } finally {
          await pool.end();
        }
      }
    } finally {
      await admin.end();
    }
    if (!existsSync(".env.local"))
      writeFileSync(
        ".env.local",
        [
          "SITE_URL=http://127.0.0.1:3000",
          "LEAD_ALLOWED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000",
          `DATABASE_URL=postgresql://kvarta_app@127.0.0.1:${port}/kvarta_development`,
          `MIGRATION_DATABASE_URL=${base}/kvarta_development`,
          "",
        ].join("\n"),
        { mode: 0o600 },
      );
    if (!existsSync(".env.test.local"))
      writeFileSync(
        ".env.test.local",
        `TEST_DATABASE_URL=${base}/kvarta_test\n`,
        { mode: 0o600 },
      );
    console.log(
      "Local PostgreSQL ready on loopback port 55439. Existing environment files were preserved.",
    );
  } else throw new Error("Unknown local database action");
} catch {
  console.error(
    "Local database command failed. Check PostgreSQL tools in PATH, .local/postgres.log, and whether port 55439 is already occupied. No unrelated server is stopped.",
  );
  process.exitCode = 1;
}
