# Verification — October 15, 2026

The frontend, local PostgreSQL integration, and Vercel/Neon production deployment are implemented. Historical local checks and current hosted checks are distinguished below.

## Automated checks

| Check                      | Result                                                                        |
| -------------------------- | ----------------------------------------------------------------------------- |
| `npm test`                 | 57 passed across 6 files                                                      |
| `npm run test:integration` | 13 passed against actual PostgreSQL 14.20, isolated `kvarta_test`             |
| `npm run build`            | Passed, including TypeScript                                                  |
| `npm run typecheck`        | Passed                                                                        |
| `npm run lint`             | Passed                                                                        |
| `npm run format:check`     | Passed                                                                        |
| `npm audit --omit=dev`     | Zero production dependency vulnerabilities                                    |

The full development dependency audit previously reported five findings in the ESLint/fast-glob/micromatch/braces chain. No forced framework downgrade was applied. The build without a site origin warns that social metadata resolves against localhost; configure the real origin before release.

## PostgreSQL evidence

Tests require a dedicated database name ending in `_test`, reject the configured runtime target, and never fall back to runtime credentials. They clean only that disposable test table. Unit route tests mock persistence and cannot write to a real lead database.

Unit route coverage also checks JSON media type, oversized bodies, unfinished-body timeout, malformed JSON versus failed persistence, deployed configuration errors, exact acknowledgement envelopes, and no-store responses. The server-validation focus test waits for the real response render instead of trying to focus disabled controls.

Verified on real PostgreSQL:

- Applied migrations twice without duplicate application; detected a changed recorded checksum and restored the isolated fixture.
- Database constraints reject invalid phone shape; the phone/time index exists.
- Twelve simultaneous first submissions across independent pools yield one created result, eleven duplicates, and one row.
- Equivalent phone formats normalize to the same row. Repeat attempts do not overwrite the original comment, interest, attribution, or timestamp.
- At one microsecond before ten minutes, the predicate detects a duplicate; exactly at ten minutes and one microsecond later it allows a new lead. An aged real row permits another repository insert.
- A waiting transaction sees the preceding writer's committed row, including when it began before that insert.
- A lead expiring while another transaction waits is evaluated against post-lock wall-clock time.
- Failed inserts roll back and release the phone lock. Independent phones succeed. A lock timeout leaves no partially accepted lead and the connection path recovers afterward.
- All five campaign fields, selected product, comment, sanitized page URLs, and referrer persist through the actual route. A discarded first HTTP acknowledgement followed by retry yields one durable row.

The database was initialized in an owned temporary cluster, then stopped and moved into ignored `.local/postgres`. The local start command applies migrations and uses a restricted runtime role. A direct check confirmed INSERT allowed, UPDATE and schema CREATE denied, and the browser-created lead still present after restart.

## Browser verification

The actual local Next.js endpoint was tested from an attributed browser visit:

1. Selected Ethiopia, entered synthetic contact/comment values, and sent the form. The UI confirmed receipt after commit.
2. Repeated the submit. The UI confirmed a duplicate.
3. Inspected the database: one row, Ethiopia selected, `utm_source=integration-test`, `utm_campaign=verification`, and `utm_content=browser-01`.
4. Stopped only the owned local database and sent a valid request. The real unavailable-service response preserved name, phone, comment, and selected product and offered retry.
5. Restarted the same database and retried. The original row was recognized as duplicate; data survived restart.

No external notifications or calls were sent. The synthetic fixture explicitly says not to call.

The initial frontend milestone inspected 320/390/768/1440 px layouts, keyboard selection/focus, labeled inputs, image loading, one H1, and the social-image route. The copy revision rechecked the mobile form at 390 px. The integration preserved layout and removed captions. A new test caught focus being attempted before the disabled form controls were re-enabled; focus now runs after the response render and its regression test passes. A full deployed accessibility/performance measurement remains release work.

## Screenshots

- [Committed local request](screenshots/integration-success.jpg).
- [Actual database-unavailable state](screenshots/integration-unavailable.jpg).
- [Duplicate after database recovery](screenshots/integration-duplicate.jpg).
- [Mobile copy revision](screenshots/copy-review-mobile.jpg).

Earlier desktop/mobile/request-error screenshots document the initial frontend milestone. They are historical and predate subsequent copy changes.

## Remaining release work

Automatic Git deployments require a GitHub login connection in the Vercel account; CLI deployment works. Mobile Lighthouse results are recorded separately when measured. The user confirmed ownership of the supplied photos and excluded further AI-session packaging. See [database operations](database.md), [hosting operations](deployment.md), and [integration plan](integration-plan.md).

## Hosted verification

- URL: https://kvarta-coffee-five.vercel.app; release deployment `dpl_5MhUej6G5ZJh7j2mWfRikqFhnytK` reached Ready on October 15, 2026.
- The Vercel cloud build completed successfully, including Next.js compilation, TypeScript, prerendered pages, and the Node.js lead function. Node.js 24.x is configured; functions are configured in Frankfurt alongside PostgreSQL.
- A request without cookies or authorization returned HTTP 200, HTML content, and no login redirect. Vercel authentication remains enabled for generated deployment URLs.
- The production origin is explicitly allowed, the canonical site URL is configured, and only the restricted pooled runtime connection is stored in Vercel Production. Preview/Development have no production database credentials.
- An actual browser visit with `utm_source=deployment-check`, `utm_medium=qa`, and `utm_campaign=release-2026-10-15` selected Ethiopia and submitted a synthetic do-not-call lead. The UI confirmed receipt. A direct database read verified one committed row, the selected product, all three campaign values, and both public page URLs.
- A repeated browser submit displayed duplicate feedback. The database still contained one row with the same ID, timestamp, product, and campaign fields. The synthetic record was retained.
- A deployment dry run verified zero included env files or local database/secret files. The pooled application connection authenticated as `kvarta_app`; SELECT/INSERT were allowed and UPDATE/DELETE/schema CREATE were denied.
- [Hosted submission screenshot](screenshots/hosted-success.png).
- [Duplicate feedback](screenshots/hosted-duplicate.png), [desktop](screenshots/hosted-desktop.png), and [mobile](screenshots/hosted-mobile.png) screenshots document the actual hosted release. Widths 320/390/768/1440 each had no horizontal overflow and exactly one H1.
- Anonymous metadata checks found the correct canonical origin and absolute Open Graph image URL, no localhost URLs in the page, a successful SVG icon, and a successful 1200 × 630 PNG social image.

## Hosted mobile Lighthouse

Measured at 11:53:55 UTC on October 15, 2026 using Lighthouse 13.5.0 and headless Chrome against https://kvarta-coffee-five.vercel.app/. This was the default mobile simulation: 412 × 823 CSS pixels, 4× CPU slowdown, simulated 150 ms RTT and 1638.4 Kbps throughput. This is one lab run, not a field-data guarantee.

| Category | Score |
| --- | --- |
| Performance | 95 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

FCP: 1.5 s; LCP: 2.8 s; total blocking time: 10 ms; CLS: 0.003; speed index: 1.6 s. Lighthouse suggests further JavaScript, CSS, and image-delivery savings; no application change or repeated run was needed to meet the internal performance goal of 90.

Actual reports: [HTML](lighthouse/mobile-2026-10-15.html), [JSON](lighthouse/mobile-2026-10-15.json). Reports were checked for the configured connection strings/passwords before inclusion; none were present. Cold suspension was not deliberately forced, so no forced-cold-start measurement is claimed.

## Follow-up fixes from the independent review

### Phone input follow-up

Ordinary spaces, hyphens, and compact numbers were already parsed by the phone library. Explicit normalization now also removes invisible paste-formatting characters and normalizes supported spacing, parentheses, periods, and Unicode dashes before checking the actual Belarusian numbering plan. Browser and server use the same schema and store E.164 numbers. Prose, extensions, extra plus signs, invalid lengths, and foreign numbers remain invalid.

Regression fixtures cover 17 equivalent spellings, including national numbers, country code without a plus, domestic prefixes, nonbreaking spaces, Unicode dashes, and invisible pasted marks. Component and route tests exercise hyphenated, spaced, and digits-only input through submission and verify the canonical payload. Empty input has its own required-field message; the placeholder explicitly labels its value as an example. After this change, 57 unit/component/route tests and 13 isolated PostgreSQL tests passed, as did build/TypeScript, lint, and formatting.

### Earlier persistence and campaign fixes

- Optional campaign strings containing zero bytes are discarded both in captured fields and sanitized URL queries. An unsupported entry year becomes null. Valid campaign fields and contact details are retained; both reproduced requests now commit successfully in PostgreSQL.
- Editable name/comment fields reject zero bytes with field-level validation instead of causing a storage failure.
- Checked-out database clients now have an error listener for their leased lifetime. Broken clients are discarded without attempting rollback on a dead connection; release is idempotent and transfers error handling back to the pool. No custom listener remains after release.
- A subprocess regression test terminates only its observed test connection, verifies rejection without an uncaught exception, and confirms subsequent created/duplicate results and no listener leak. This test would exit nonzero with the reviewed implementation.
- Repeated both original malformed-context reproductions through the rebuilt production HTTP endpoint against the disposable test database: each returned 201 and stored one row with only valid context. Repeated the HTTP connection interruption: 503 with safe structured logging, no `uncaughtException`, and the page still returned 200. The temporary review server was stopped afterward.
