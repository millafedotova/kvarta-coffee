import { expect, it } from "vitest";
import {
  databaseErrorCode,
  isTransientDatabaseError,
} from "../src/lib/database-errors";

it.each([
  new Error("Connection terminated due to connection timeout"),
  new Error("timeout exceeded when trying to connect"),
  new Error("Connection terminated unexpectedly"),
  Object.assign(new Error("Socket reset"), { code: "ECONNRESET" }),
  Object.assign(new Error("Database restarting"), { code: "57P03" }),
  Object.assign(new Error("Connection lost"), { code: "08006" }),
  new Error("Wrapper", {
    cause: Object.assign(new Error("Reset"), { code: "EPIPE" }),
  }),
])("recognizes a recoverable database transport failure: %s", (error) => {
  expect(isTransientDatabaseError(error)).toBe(true);
});

it.each(["28P01", "23514", "42501", "57014", "55P03"])(
  "does not retry a persistent, validation or contention failure %s",
  (code) => {
    expect(isTransientDatabaseError({ code })).toBe(false);
  },
);

it("keeps arbitrary messages and connection strings out of diagnostics", () => {
  const error = new Error("postgres://private:secret@example.com/database");
  expect(databaseErrorCode(error)).toBe("UNKNOWN");
  expect(isTransientDatabaseError(error)).toBe(false);
  const cyclic: { cause?: unknown } = {};
  cyclic.cause = cyclic;
  expect(databaseErrorCode(cyclic)).toBe("UNKNOWN");
});
