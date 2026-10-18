import "server-only";
import { Pool } from "pg";
import { databaseUrl } from "./env";
import { databaseErrorCode } from "./database-errors";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      max: 3,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 5000,
      allowExitOnIdle: true,
    });
    pool.on("error", (error: Error) => {
      console.error(
        JSON.stringify({
          event: "database_idle_connection_error",
          reason: databaseErrorCode(error),
        }),
      );
    });
  }
  return pool;
}
