import { beforeAll, beforeEach, afterAll, expect, it } from "vitest";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { applyMigrations } from "../../scripts/migration-runner.mjs";
import {
  createLeadRepository,
  phoneLockKey,
  recentLeadQuery,
} from "../../src/lib/lead-repository";
import { leadSchema } from "../../src/lib/lead-validation";
import { POST } from "../../src/app/api/lead/route";
import { getPool } from "../../src/lib/db";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl)
  throw new Error(
    "TEST_DATABASE_URL is required; integration tests were not run",
  );
const target = new URL(testUrl);
if (!target.pathname.endsWith("_test"))
  throw new Error("Integration database name must end in _test");
function identity(value: string) {
  const url = new URL(value);
  return `${url.hostname.replace("-pooler.", ".")}:${url.port || "5432"}${url.pathname}`;
}
if (
  process.env.DATABASE_URL &&
  identity(process.env.DATABASE_URL) === identity(testUrl)
)
  throw new Error("Refusing to run against the configured runtime database");

const originalUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: testUrl, max: 6 });
const secondPool = new Pool({ connectionString: testUrl, max: 3 });
const save = createLeadRepository(pool);
const secondSave = createLeadRepository(secondPool);
const draft = {
  name: "Synthetic test",
  phone: "+375291234567",
  interest: "question",
  productId: null,
  comment: "Test fixture",
};
const input = () => leadSchema.parse(draft);

beforeAll(async () => {
  await applyMigrations(pool);
  await applyMigrations(pool);
  process.env.DATABASE_URL = testUrl;
});
beforeEach(async () => {
  await pool.query("TRUNCATE leads");
});
afterAll(async () => {
  await getPool().end();
  await Promise.all([pool.end(), secondPool.end()]);
  if (originalUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalUrl;
});

it("migrates once and rejects values that violate database constraints", async () => {
  expect(
    (await pool.query("SELECT count(*)::int AS count FROM schema_migrations"))
      .rows[0].count,
  ).toBe(2);
  await expect(
    pool.query(
      "INSERT INTO leads (lead_id, name, phone, interest) VALUES ($1, 'Test', '+79991234567', 'question')",
      [randomUUID()],
    ),
  ).rejects.toMatchObject({ code: "23514" });
  expect(
    (
      await pool.query(
        "SELECT indexname FROM pg_indexes WHERE indexname = 'leads_phone_created_at_idx'",
      )
    ).rowCount,
  ).toBe(1);
});

it("detects edited applied migrations instead of silently accepting schema drift", async () => {
  const previous = await pool.query(
    "SELECT checksum FROM schema_migrations WHERE migration_name = '001-create-leads.sql'",
  );
  try {
    await pool.query(
      "UPDATE schema_migrations SET checksum = 'changed' WHERE migration_name = '001-create-leads.sql'",
    );
    await expect(applyMigrations(pool)).rejects.toThrow(
      "An applied migration was changed",
    );
  } finally {
    await pool.query(
      "UPDATE schema_migrations SET checksum = $1 WHERE migration_name = '001-create-leads.sql'",
      [previous.rows[0].checksum],
    );
  }
});

it("serializes equivalent phones across independent pools and does not overwrite a lead", async () => {
  const original = input();
  expect(await save(original)).toBe("created");
  const stored = (
    await pool.query("SELECT created_at::text, comment FROM leads")
  ).rows[0];
  const variations = [
    "+375 (29) 123-45-67",
    "8 029 123 45 67",
    "+375291234567",
  ];
  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      (i % 2 ? save : secondSave)(
        leadSchema.parse({
          ...draft,
          phone: variations[i % 3],
          comment: "Changed",
          interest: "subscription",
        }),
      ),
    ),
  );
  expect(results.every((value) => value === "duplicate")).toBe(true);
  expect(
    (await pool.query("SELECT created_at::text, comment FROM leads")).rows,
  ).toEqual([stored]);
});

it("creates exactly one row for simultaneous first submissions", async () => {
  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) => (i % 2 ? save : secondSave)(input())),
  );
  expect(results.filter((value) => value === "created")).toHaveLength(1);
  expect(results.filter((value) => value === "duplicate")).toHaveLength(11);
  expect(
    (await pool.query("SELECT count(*)::int AS count FROM leads")).rows[0]
      .count,
  ).toBe(1);
});

it("applies the exact ten-minute boundary without rounding database microseconds", async () => {
  await pool.query(
    "INSERT INTO leads (lead_id, name, phone, interest, created_at) VALUES ($1, 'Test', $2, 'question', '2026-10-15T08:00:00.123456Z')",
    [randomUUID(), draft.phone],
  );
  for (const [time, duplicate] of [
    ["2026-10-15T08:10:00.123455Z", true],
    ["2026-10-15T08:10:00.123456Z", false],
    ["2026-10-15T08:10:00.123457Z", false],
  ] as const) {
    expect(
      (await pool.query(recentLeadQuery, [draft.phone, time])).rows[0]
        .duplicate,
    ).toBe(duplicate);
  }
  await pool.query(
    "UPDATE leads SET created_at = clock_timestamp() - INTERVAL '11 minutes'",
  );
  expect(await save(input())).toBe("created");
  expect(
    (await pool.query("SELECT count(*)::int AS count FROM leads")).rows[0]
      .count,
  ).toBe(2);
});

it("takes a fresh snapshot after waiting for a preceding writer's commit", async () => {
  const blocker = await pool.connect();
  try {
    await blocker.query("BEGIN");
    await blocker.query("SELECT pg_advisory_xact_lock($1::bigint)", [
      phoneLockKey(draft.phone),
    ]);
    const waiting = secondSave(input());
    // Observe the real waiting lock rather than guessing a timing delay.
    let observed = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = await pool.query(
        "SELECT EXISTS (SELECT 1 FROM pg_locks WHERE locktype = 'advisory' AND NOT granted AND database = (SELECT oid FROM pg_database WHERE datname = current_database())) AS waiting",
      );
      if (result.rows[0].waiting) {
        observed = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(observed).toBe(true);
    await blocker.query(
      "INSERT INTO leads (lead_id, name, phone, interest) VALUES ($1, 'Test', $2, 'question')",
      [randomUUID(), draft.phone],
    );
    await blocker.query("COMMIT");
    expect(await waiting).toBe("duplicate");
  } finally {
    await blocker.query("ROLLBACK");
    blocker.release();
  }
});

it("releases the phone lock when a writer fails and allows another phone independently", async () => {
  await expect(save({ ...input(), name: "" })).rejects.toMatchObject({
    code: "23514",
  });
  expect(await secondSave(input())).toBe("created");
  expect(
    await save(leadSchema.parse({ ...draft, phone: "+375172123456" })),
  ).toBe("created");
});

it("uses post-lock wall-clock time when a lead expires while a writer waits", async () => {
  await save(input());
  const blocker = await pool.connect();
  try {
    await blocker.query("BEGIN");
    await blocker.query("SELECT pg_advisory_xact_lock($1::bigint)", [
      phoneLockKey(draft.phone),
    ]);
    await blocker.query(
      "UPDATE leads SET created_at = clock_timestamp() - INTERVAL '10 minutes' + INTERVAL '300 milliseconds'",
    );
    const waiting = secondSave(input());
    let expired = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      const result = await blocker.query(
        "SELECT created_at <= clock_timestamp() - INTERVAL '10 minutes' AS expired FROM leads",
      );
      if (result.rows[0].expired) {
        expired = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(expired).toBe(true);
    await blocker.query("COMMIT");
    expect(await waiting).toBe("created");
  } finally {
    await blocker.query("ROLLBACK");
    blocker.release();
  }
});

it("times out a blocked write without inserting and works after the blocker rolls back", async () => {
  const blocker = await pool.connect();
  try {
    await blocker.query("BEGIN");
    await blocker.query("SELECT pg_advisory_xact_lock($1::bigint)", [
      phoneLockKey(draft.phone),
    ]);
    await expect(secondSave(input())).rejects.toMatchObject({ code: "55P03" });
    await blocker.query("ROLLBACK");
    expect(await secondSave(input())).toBe("created");
  } finally {
    await blocker.query("ROLLBACK");
    blocker.release();
  }
});

it("persists sanitized campaign context and survives a lost response followed by retry", async () => {
  const payload = {
    ...draft,
    interest: "one_time",
    productId: "colombia-huila",
    attribution: {
      version: 1,
      enteredAt: "2026-10-15T08:00:00.000Z",
      landingUrl:
        "https://user:secret@example.com/?utm_source=instagram&token=private#coffee",
      referrer: "https://search.example/?token=private",
      campaign: {
        utm_source: "instagram",
        utm_medium: "cpc",
        utm_campaign: "autumn",
        utm_content: "ad-42",
        utm_term: "coffee",
        unknown: "discard",
      },
    },
    submissionUrl: "https://example.com/?utm_source=instagram#request",
  };
  const request = () =>
    new Request("http://localhost:3000/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify(payload),
    });
  // The first acknowledgement is deliberately not delivered to a browser.
  const first = await POST(request());
  expect(first.status).toBe(201);
  const retry = await POST(request());
  expect(retry.status).toBe(200);
  expect(await retry.json()).toEqual({ status: "duplicate" });
  const result = await pool.query("SELECT * FROM leads");
  expect(result.rowCount).toBe(1);
  expect(result.rows[0]).toMatchObject({
    phone: draft.phone,
    product_id: "colombia-huila",
    comment: draft.comment,
    utm_source: "instagram",
    utm_medium: "cpc",
    utm_campaign: "autumn",
    utm_content: "ad-42",
    utm_term: "coffee",
    landing_url: "https://example.com/?utm_source=instagram",
    submission_url: "https://example.com/?utm_source=instagram",
    referrer: "https://search.example/",
  });
});
