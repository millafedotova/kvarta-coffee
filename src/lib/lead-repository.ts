import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { Pool } from "pg";
import type { LeadInput } from "./lead-validation";

export const recentLeadQuery = `
  SELECT EXISTS (
    SELECT 1 FROM leads
    WHERE phone = $1 AND created_at > $2::timestamptz - INTERVAL '10 minutes'
  ) AS duplicate`;

export function phoneLockKey(phone: string): string {
  return createHash("sha256")
    .update(`kvarta:lead:${phone}`)
    .digest()
    .readBigInt64BE()
    .toString();
}

export function createLeadRepository(pool: Pool) {
  return async function saveLead(
    input: LeadInput,
  ): Promise<"created" | "duplicate"> {
    const client = await pool.connect();
    let released = false;
    let connectionFailed = false;
    const onConnectionError = () => {
      connectionFailed = true;
    };
    client.on("error", onConnectionError);
    function release(destroy = false) {
      if (released) return;
      released = true;
      // The pool installs its idle error listener before ours is removed.
      client.release(destroy);
      client.off("error", onConnectionError);
    }
    const deadline = setTimeout(() => {
      release(true);
    }, 9000);
    try {
      await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");
      await client.query("SET LOCAL statement_timeout = '3000ms'");
      await client.query("SET LOCAL lock_timeout = '2000ms'");
      await client.query(
        "SET LOCAL idle_in_transaction_session_timeout = '5000ms'",
      );
      // Keep locking separate so the following statement sees the preceding commit.
      await client.query("SELECT pg_advisory_xact_lock($1::bigint)", [
        phoneLockKey(input.phone),
      ]);
      // Text preserves PostgreSQL microseconds when passed back to the server.
      const clock = await client.query<{ decision_time: string }>(
        "SELECT clock_timestamp()::text AS decision_time",
      );
      const decisionTime = clock.rows[0].decision_time;
      const existing = await client.query<{ duplicate: boolean }>(
        recentLeadQuery,
        [input.phone, decisionTime],
      );
      if (existing.rows[0].duplicate) {
        await client.query("COMMIT");
        return "duplicate";
      }
      const attribution = input.attribution;
      const campaign = attribution?.campaign;
      await client.query(
        `
        INSERT INTO leads (
          lead_id, name, phone, interest, product_id, comment, created_at,
          utm_source, utm_medium, utm_campaign, utm_content, utm_term,
          landing_url, submission_url, referrer, entered_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8, $9, $10, $11, $12, $13, $14, $15, $16::timestamptz)
      `,
        [
          randomUUID(),
          input.name,
          input.phone,
          input.interest,
          input.productId,
          input.comment,
          decisionTime,
          campaign?.utm_source ?? null,
          campaign?.utm_medium ?? null,
          campaign?.utm_campaign ?? null,
          campaign?.utm_content ?? null,
          campaign?.utm_term ?? null,
          attribution?.landingUrl || null,
          input.submissionUrl || null,
          attribution?.referrer || null,
          attribution?.enteredAt ?? null,
        ],
      );
      await client.query("COMMIT");
      return "created";
    } catch (error) {
      if (!released && !connectionFailed) {
        try {
          await client.query("ROLLBACK");
        } catch {
          /* Discard a broken connection below. */
        }
      }
      release(true);
      throw error;
    } finally {
      clearTimeout(deadline);
      release(connectionFailed);
    }
  };
}
