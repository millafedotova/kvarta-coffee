import { randomUUID } from "node:crypto";
import { leadSchema, getFieldErrors } from "@/lib/lead-validation";
import { allowedOrigins, ConfigurationError } from "@/lib/env";
import { getPool } from "@/lib/db";
import { createLeadRepository } from "@/lib/lead-repository";

export const runtime = "nodejs";

const headers = { "Cache-Control": "no-store" };
function invalid() {
  return Response.json(
    { status: "invalid", errors: {} },
    { status: 400, headers },
  );
}
function unavailable(requestId: string, error: unknown) {
  console.error(
    JSON.stringify({
      event: "lead_unavailable",
      requestId,
      category:
        error instanceof ConfigurationError ? "configuration" : "persistence",
    }),
  );
  return Response.json({ status: "unavailable" }, { status: 503, headers });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  let origins: Set<string>;
  try {
    origins = allowedOrigins();
  } catch (error) {
    return unavailable(requestId, error);
  }
  const origin = request.headers.get("origin");
  if (origin && !origins.has(origin)) return invalid();
  const mediaType = request.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  if (mediaType !== "application/json") return invalid();
  const reader = request.body?.getReader();
  if (!reader) return invalid();
  let input: unknown;
  let bodyExpired = false;
  const bodyDeadline = setTimeout(() => {
    bodyExpired = true;
    void reader.cancel().catch(() => {});
  }, 5000);
  try {
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        return Response.json({ status: "too_large" }, { status: 413, headers });
      }
      chunks.push(chunk.value);
    }
    if (bodyExpired) return invalid();
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    input = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return invalid();
  } finally {
    clearTimeout(bodyDeadline);
    reader.releaseLock();
  }

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success)
    return Response.json(
      { status: "invalid", errors: getFieldErrors(parsed.error) },
      { status: 400, headers },
    );
  try {
    const status = await createLeadRepository(getPool())(parsed.data);
    return Response.json(
      { status },
      { status: status === "created" ? 201 : 200, headers },
    );
  } catch (error) {
    return unavailable(requestId, error);
  }
}
