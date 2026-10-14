import { leadSchema, getFieldErrors } from "@/lib/lead-validation";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const host = request.headers.get("host") ?? new URL(request.url).host;
      const configuredOrigin = process.env.SITE_URL
        ? new URL(process.env.SITE_URL).origin
        : null;
      const allowed = configuredOrigin
        ? originUrl.origin === configuredOrigin
        : originUrl.host === host;
      if (!["http:", "https:"].includes(originUrl.protocol) || !allowed)
        return Response.json(
          { status: "invalid", errors: {} },
          { status: 400, headers },
        );
    } catch {
      return Response.json(
        { status: "invalid", errors: {} },
        { status: 400, headers },
      );
    }
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json(
      { status: "invalid", errors: {} },
      { status: 400, headers },
    );
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json(
      { status: "invalid", errors: {} },
      { status: 400, headers },
    );
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
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
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const input: unknown = JSON.parse(new TextDecoder().decode(bytes));
    const parsed = leadSchema.safeParse(input);
    if (!parsed.success)
      return Response.json(
        { status: "invalid", errors: getFieldErrors(parsed.error) },
        { status: 400, headers },
      );
    // Persistence is the next backend milestone. Never acknowledge an unsaved lead.
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  } catch {
    return Response.json(
      { status: "invalid", errors: {} },
      { status: 400, headers },
    );
  } finally {
    reader.releaseLock();
  }
}
