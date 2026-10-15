# Kvarta Coffee

A Russian-language landing page and working lead API for a fictional Minsk coffee roastery, based on the [assignment](https://tz.vitai.world/). [Live site](https://kvarta-coffee-five.vercel.app) · [Public repository](https://github.com/millafedotova/kvarta-coffee).

**Status:** deployed on Vercel with PostgreSQL on Neon. The public URL opens without login. A real browser submission stored one synthetic lead with product and campaign context; repeating it preserved the same row.

Mobile Lighthouse: **95 performance / 100 accessibility / 100 best practices / 100 SEO**. [Actual report](docs/lighthouse/mobile-2026-10-15.html).

## Run

Requires Node.js 24+, npm, and PostgreSQL tools on PATH:

```sh
npm ci
npm run db:local:start
npm run dev
```

Open the printed local URL. Stop the database with `npm run db:local:stop`; data remain in ignored `.local/postgres`. Existing env files are preserved. See [database setup](docs/database.md) for configuration, migrations, permissions, and inspection.

## Behavior and checks

The form validates Belarusian numbers, persists contact/interest/product and sanitized campaign context, and acknowledges only committed writes. Transactional phone locks prevent concurrent duplicates for exactly ten minutes; repeats preserve the original record. PostgreSQL was chosen for durable storage across future hosted function instances, where local files are unsuitable.

`npm test` runs 57 unit/component/route tests; `npm run test:integration` runs 13 tests on a separate disposable PostgreSQL database. Build, TypeScript, lint, and formatting checks are provided. Actual results and browser evidence are in [verification](docs/verification.md).

## Process and remaining work

The user supplied the brief/references/photos, chose the green direction, and edited the copy. AI authored the application, tests, docs, and generated package/process imagery. Visual review caught invented city/year text on generated packages. Integration tests caught a required optional URL and focus attempted while form fields were disabled; both were corrected.

Deployment currently uses the Vercel CLI; automatic GitHub deployments require a GitHub login connection in the Vercel account. The user confirmed ownership of the supplied photos and excluded further AI-session packaging. No cart, payment, fabricated contact details, or Telegram messaging was added. [Release verification](docs/verification.md), [hosting operations](docs/deployment.md), and [assets/prompts](docs/assets.md) record details. Authored code/docs use English; customer copy uses Russian. Deadline: October 19, 2026, 18:00 Moscow time.
