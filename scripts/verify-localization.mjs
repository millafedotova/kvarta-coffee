import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3001");
const canonicalOrigin = new URL(process.argv[3] ?? base).origin;
const locales = ["ru", "en", "be"];
const report = [];

for (const locale of locales) {
  const response = await fetch(new URL(`/${locale}`, base));
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`));
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  if (locale === "en") assert.ok((html.match(/KVARTA/g) ?? []).length >= 2);
  assert.ok(
    html.includes(`rel="canonical" href="${canonicalOrigin}/${locale}"`),
  );
  assert.ok(
    html.includes(`rel="manifest" href="/${locale}/manifest.webmanifest"`),
  );
  for (const alternate of [...locales, "x-default"]) {
    assert.ok(
      html.includes(`hrefLang="${alternate}"`) ||
        html.includes(`hreflang="${alternate}"`),
    );
  }
  const manifestResponse = await fetch(
    new URL(`/${locale}/manifest.webmanifest`, base),
  );
  assert.equal(manifestResponse.status, 200);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.lang, locale);
  assert.equal(manifest.start_url, `/${locale}`);
  const imageResponse = await fetch(
    new URL(`/${locale}/opengraph-image`, base),
  );
  assert.equal(imageResponse.status, 200);
  assert.match(imageResponse.headers.get("content-type"), /image\/png/);
  const image = Buffer.from(await imageResponse.arrayBuffer());
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  report.push({
    locale,
    status: response.status,
    socialImageBytes: image.length,
    manifest: manifest.lang,
  });
}

for (const preference of [null, "en", "be", "invalid"]) {
  const headers = preference ? { Cookie: `kvarta.locale=${preference}` } : {};
  const response = await fetch(
    new URL("/?utm_source=localization-check", base),
    { redirect: "manual", headers },
  );
  assert.equal(response.status, 307);
  const destination = new URL(response.headers.get("location"), base);
  const expected = locales.includes(preference) ? preference : "ru";
  assert.equal(destination.pathname, `/${expected}`);
  assert.equal(
    destination.searchParams.get("utm_source"),
    "localization-check",
  );
  assert.match(response.headers.get("cache-control"), /no-store/);
}

for (const path of ["/fr", "/by", "/en/unknown"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 404, path);
}
const api = await fetch(new URL("/api/lead", base), { redirect: "manual" });
assert.equal(api.status, 405);
const sitemap = await fetch(new URL("/sitemap.xml", base));
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
for (const locale of locales)
  assert.ok(xml.includes(`${canonicalOrigin}/${locale}`));
const robots = await fetch(new URL("/robots.txt", base));
assert.equal(robots.status, 200);
assert.ok((await robots.text()).includes(`${canonicalOrigin}/sitemap.xml`));
for (const path of [
  "/icon.svg",
  "/icons/star-192.png",
  "/images/colombia-v3.png",
]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 200, path);
}
console.log(
  JSON.stringify(
    {
      pages: report,
      routing: "passed",
      resources: "passed",
      discovery: "passed",
    },
    null,
    2,
  ),
);
