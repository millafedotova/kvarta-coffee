import "server-only";
import { Pool } from "pg";
import { databaseUrl } from "./env";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      max: 3,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 5000,
      allowExitOnIdle: true,
    });
    pool.on("error", () => {
      console.error(
        JSON.stringify({ event: "database_idle_connection_error" }),
      );
    });
  }
  return pool;
}
