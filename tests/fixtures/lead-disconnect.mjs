import pg from "pg";
import { createLeadRepository } from "../../src/lib/lead-repository.ts";

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("_test"))
  throw new Error("Unsafe test target");
const admin = new pg.Pool({ connectionString: url, max: 2 });
const app = new pg.Pool({ connectionString: url, max: 1 });
let pid;
app.on("acquire", (client) => {
  pid = client.processID;
});
const blocker = await admin.connect();
const save = createLeadRepository(app);
const input = {
  name: "Disconnect fixture",
  phone: "+375291234567",
  interest: "question",
  productId: null,
  comment: "",
  attribution: null,
  submissionUrl: "",
};
try {
  await blocker.query("BEGIN");
  await blocker.query("LOCK TABLE leads IN ACCESS EXCLUSIVE MODE");
  const pending = save(input).then(
    () => false,
    () => true,
  );
  let waiting = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (pid) {
      const result = await admin.query(
        "SELECT wait_event_type FROM pg_stat_activity WHERE pid = $1",
        [pid],
      );
      if (result.rows[0]?.wait_event_type === "Lock") {
        waiting = true;
        break;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  if (!waiting)
    throw new Error("The audit client did not enter its waiting query");
  await admin.query("SELECT pg_terminate_backend($1)", [pid]);
  const rejected = await pending;
  await blocker.query("ROLLBACK");
  const created = await save(input);
  const duplicate = await save(input);
  const client = await app.connect();
  const leakedListeners = client.listenerCount("error");
  client.release();
  console.log(
    JSON.stringify({ rejected, created, duplicate, leakedListeners }),
  );
} finally {
  await blocker.query("ROLLBACK").catch(() => {});
  blocker.release();
  await Promise.all([app.end(), admin.end()]);
}
