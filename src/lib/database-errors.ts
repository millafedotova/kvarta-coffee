const connectionMessages = new Map([
  ["timeout exceeded when trying to connect", "CONNECTION_TIMEOUT"],
  ["Connection terminated due to connection timeout", "CONNECTION_TIMEOUT"],
  ["Connection terminated unexpectedly", "CONNECTION_CLOSED"],
  ["Connection terminated", "CONNECTION_CLOSED"],
  [
    "Client has encountered a connection error and is not queryable",
    "CONNECTION_CLOSED",
  ],
]);

const transientCodes = new Set([
  "CONNECTION_TIMEOUT",
  "CONNECTION_CLOSED",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EPIPE",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "57P01",
  "57P02",
  "57P03",
]);

export function databaseErrorCode(error: unknown): string {
  let current = error;
  for (let depth = 0; depth < 4; depth++) {
    if (typeof current !== "object" || current === null) break;
    if (
      "code" in current &&
      typeof current.code === "string" &&
      /^(?:[0-9A-Z]{5}|E[A-Z_]{2,25})$/.test(current.code)
    )
      return current.code;
    if (current instanceof Error) {
      const known = connectionMessages.get(current.message);
      if (known) return known;
    }
    current = "cause" in current ? current.cause : undefined;
  }
  return "UNKNOWN";
}

export function isTransientDatabaseError(error: unknown): boolean {
  const code = databaseErrorCode(error);
  return code.startsWith("08") || transientCodes.has(code);
}
