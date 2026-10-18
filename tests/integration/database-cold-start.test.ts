import { createServer, connect, type Socket } from "node:net";
import { expect, it } from "vitest";
import { getPool } from "../../src/lib/db";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith("_test"))
  throw new Error("A disposable test database is required");
const target = new URL(testUrl);

it.skipIf(!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname))(
  "connects on the first attempt when PostgreSQL's handshake takes more than two seconds",
  async () => {
    const sockets = new Set<Socket>();
    const server = createServer((downstream) => {
      const upstream = connect({
        host: target.hostname.replace(/^\[|\]$/g, ""),
        port: Number(target.port || 5432),
      });
      sockets.add(downstream);
      sockets.add(upstream);
      const delay = setTimeout(() => {
        downstream.pipe(upstream);
        upstream.pipe(downstream);
      }, 2500);
      downstream.on("error", () => upstream.destroy());
      upstream.on("error", () => downstream.destroy());
      downstream.on("close", () => {
        clearTimeout(delay);
        sockets.delete(downstream);
        upstream.destroy();
      });
      upstream.on("close", () => {
        sockets.delete(upstream);
        downstream.destroy();
      });
    });
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("No test proxy address");
    const proxyUrl = new URL(testUrl);
    proxyUrl.hostname = "127.0.0.1";
    proxyUrl.port = String(address.port);
    const original = process.env.DATABASE_URL;
    process.env.DATABASE_URL = proxyUrl.href;
    const pool = getPool();
    try {
      const start = performance.now();
      const result = await pool.query("SELECT 1 AS connected");
      expect(result.rows).toEqual([{ connected: 1 }]);
      expect(performance.now() - start).toBeGreaterThanOrEqual(2400);
    } finally {
      await pool.end();
      if (original === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = original;
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  },
);
