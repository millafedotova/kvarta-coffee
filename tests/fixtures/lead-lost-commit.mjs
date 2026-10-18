import pg from "pg";
import { createLeadRepository } from "../../src/lib/lead-repository.ts";

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("_test"))
  throw new Error("Unsafe test target");

let loseReply = true;
class LosingCommitClient extends pg.Client {
  async query(...args) {
    const result = await super.query(...args);
    if (args[0] === "COMMIT" && loseReply) {
      loseReply = false;
      throw Object.assign(new Error("Lost COMMIT reply"), {
        code: "ECONNRESET",
      });
    }
    return result;
  }
}

const pool = new pg.Pool({ connectionString: url, Client: LosingCommitClient });
try {
  const result = await createLeadRepository(pool)({
    name: "Lost acknowledgement fixture",
    phone: "+375291234567",
    interest: "question",
    productId: null,
    comment: "Synthetic test",
    attribution: null,
    submissionUrl: "",
  });
  const rows = (await pool.query("SELECT count(*)::int AS count FROM leads"))
    .rows[0].count;
  console.log(JSON.stringify({ result, rows }));
} finally {
  await pool.end();
}
