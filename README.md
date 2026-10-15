# Kvarta Coffee

A Russian-language landing page and working local lead API for a fictional Minsk coffee roastery, based on the [assignment](https://tz.vitai.world/). [Public repository](https://github.com/millafedotova/kvarta-coffee).

**Status:** frontend and local PostgreSQL integration are implemented. The user deferred public deployment; there is no live public URL or deployed Lighthouse result yet.

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

`npm test` runs 30 unit/component/route tests; `npm run test:integration` runs 10 tests on a separate disposable PostgreSQL database. Build, TypeScript, lint, and formatting checks are provided. Actual results and browser evidence are in [verification](docs/verification.md).

## Process and remaining work

The user supplied the brief/references/photos, chose the green direction, and edited the copy. AI authored the application, tests, docs, and generated package/process imagery. Visual review caught invented city/year text on generated packages. Integration tests caught a required optional URL and focus attempted while form fields were disabled; both were corrected.

Public Vercel/Neon deployment, supplied-photo source verification, deployed Lighthouse, and authentic session evidence remain. No cart, payment, fabricated contact details, or Telegram messaging was added. [Remaining release plan](docs/integration-plan.md), [hosting checklist](docs/deployment.md), [assets/prompts](docs/assets.md), and [AI log](docs/ai-work-log.md) record details. Authored code/docs use English; customer copy uses Russian. Deadline: October 19, 2026, 18:00 Moscow time.
