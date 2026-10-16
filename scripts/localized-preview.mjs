import { spawn } from "node:child_process";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl)
  throw new Error(
    "TEST_DATABASE_URL is required for the isolated localization preview.",
  );
const target = new URL(testUrl);
if (
  !target.pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)
) {
  throw new Error(
    "The preview requires a disposable test database on loopback.",
  );
}

const port = "3001";
const origin = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    port,
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: testUrl,
      SITE_URL: origin,
      LEAD_ALLOWED_ORIGINS: origin,
    },
  },
);
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
child.on("error", () => {
  console.error("Could not start the isolated localization preview.");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
