# Verification — local integration, October 15, 2026

The frontend and local PostgreSQL integration are implemented. The user explicitly deferred hosting; this record makes no public deployment or Lighthouse claim.

## Automated checks

| Check                      | Result                                                                        |
| -------------------------- | ----------------------------------------------------------------------------- |
| `npm test`                 | 34 passed across 6 files                                                      |
| `npm run test:integration` | 13 passed against actual PostgreSQL 14.20, isolated `kvarta_test`             |
| `npm run build`            | Passed, including TypeScript; database/site/origin variables explicitly empty |
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

Public Vercel/Neon connection and deployment, exact hosted Origin/configuration, and actual deployed mobile Lighthouse remain deferred. The user confirmed ownership of the supplied photos and excluded further AI-session packaging. See [database operations](database.md), [hosting checklist](deployment.md), and [integration plan](integration-plan.md).

## Follow-up fixes from the independent review

- Optional campaign strings containing zero bytes are discarded both in captured fields and sanitized URL queries. An unsupported entry year becomes null. Valid campaign fields and contact details are retained; both reproduced requests now commit successfully in PostgreSQL.
- Editable name/comment fields reject zero bytes with field-level validation instead of causing a storage failure.
- Checked-out database clients now have an error listener for their leased lifetime. Broken clients are discarded without attempting rollback on a dead connection; release is idempotent and transfers error handling back to the pool. No custom listener remains after release.
- A subprocess regression test terminates only its observed test connection, verifies rejection without an uncaught exception, and confirms subsequent created/duplicate results and no listener leak. This test would exit nonzero with the reviewed implementation.
- Repeated both original malformed-context reproductions through the rebuilt production HTTP endpoint against the disposable test database: each returned 201 and stored one row with only valid context. Repeated the HTTP connection interruption: 503 with safe structured logging, no `uncaughtException`, and the page still returned 200. The temporary review server was stopped afterward.
