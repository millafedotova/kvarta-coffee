import "server-only";

export class ConfigurationError extends Error {
  constructor() {
    super("Invalid server configuration");
  }
}

function parseOrigin(value: string): string {
  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new Error();
    return url.origin;
  } catch {
    throw new ConfigurationError();
  }
}

export function allowedOrigins(requestUrl?: string): Set<string> {
  const configured = process.env.LEAD_ALLOWED_ORIGINS;
  const deployed =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  if (!configured && deployed) throw new ConfigurationError();
  const origins = configured
    ? new Set(configured.split(",").map((value) => parseOrigin(value.trim())))
    : new Set(["http://127.0.0.1:3000", "http://localhost:3000"]);
  if (!deployed && requestUrl) {
    const request = new URL(requestUrl);
    if (
      ["http:", "https:"].includes(request.protocol) &&
      ["127.0.0.1", "localhost", "[::1]"].includes(request.hostname)
    ) {
      const port = request.port ? `:${request.port}` : "";
      for (const host of ["127.0.0.1", "localhost", "[::1]"])
        origins.add(`${request.protocol}//${host}${port}`);
    }
  }
  return origins;
}

export function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  try {
    if (
      !value ||
      !["postgres:", "postgresql:"].includes(new URL(value).protocol)
    )
      throw new Error();
    return value;
  } catch {
    throw new ConfigurationError();
  }
}
