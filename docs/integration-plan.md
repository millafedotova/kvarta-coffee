# Kvarta Coffee — Remaining Integration Plan

Reviewed on October 15, 2026 against the live [assignment](https://tz.vitai.world/) and the current source. The user subsequently requested local integration only. Local I1–I5 work is implemented and verified; hosted I6–I7 work is deferred. Unchecked items remain release work. Deadline: October 19, 2026, 18:00 Moscow time.

## 1. Current state and scope

The responsive frontend, approved copy revisions, product/subscription selection, Belarusian phone validation, sanitized attribution, and PostgreSQL-backed endpoint are implemented. Thirty unit/component/route tests and ten isolated PostgreSQL integration tests pass. A real local browser submission was committed, its repeat was rejected, and recovery after database restart was inspected.

The endpoint now returns 201 only after a committed write, 200 for a duplicate, and 503 for unavailable storage/configuration. Migrations, restricted runtime access, and local database start/stop commands exist. Hosting, hosted form verification, and deployed Lighthouse remain deferred by the user. See [database operations](database.md), [verification](verification.md), and [deferred hosting](deployment.md). The public repository already exists: [millafedotova/kvarta-coffee](https://github.com/millafedotova/kvarta-coffee).

Keep the approved design and copy. The founders' heading uses the user's preferred informal name, Dima. Removed photo/header taglines and the phone helper must stay removed. Do not add a cart, payment, authentication, admin UI, analytics service, or notification delivery to the required work.

## 2. Findings from the original review (addressed locally below)

| Finding                                                                      | Required correction                                                                                                               |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Persistence is absent                                                        | Add a server-only PostgreSQL repository and connect it to the existing route.                                                     |
| The route's broad parse `catch` currently covers its entire processing block | Separate parse/validation failures from database failures before adding a database call; a failed write must return 503, not 400. |
| Attribution URL fields currently enforce lengths only                        | Sanitize context again on the server; direct HTTP callers and session storage are untrusted.                                      |
| The duplicate algorithm does not name its time function or query boundaries  | Acquire the transaction lock first; then read database wall-clock time and query using a fresh Read Committed snapshot.           |
| One `SITE_URL` currently controls both metadata and allowed Origin           | Define canonical metadata and accepted request origins separately for local, preview, and production deployments.                 |
| No real-database tests exist                                                 | Add an isolated test database and tests for concurrent requests, rollback, expiry, and persisted attribution.                     |
| Some original planning statements still say runtime code does not exist      | Correct status and link this plan as the active remaining-work sequence.                                                          |
| Several release deliverables remain                                          | Verify supplied-photo sources, public form, actual Lighthouse, and authentic AI evidence.                                         |

## 3. Dependency order and completion gates

| Step | Depends on                           | Output                                                |
| ---- | ------------------------------------ | ----------------------------------------------------- |
| I1   | Current repository                   | Exact contract, config, and environment decisions     |
| I2   | I1; isolated PostgreSQL available    | Reproducible schema and migration command             |
| I3   | I2                                   | Transactional create-or-duplicate repository          |
| I4   | I1, I3                               | Working endpoint and recoverable frontend integration |
| I5   | I2–I4                                | Real database and browser verification                |
| I6   | I5; hosting access; asset provenance | Public deployment with a working form                 |
| I7   | I6                                   | Measured release and submission evidence              |

Code, migration files, and tests can be prepared before hosting credentials are available. Do not report database integration tests as passing until an actual PostgreSQL instance has run them.

### I1. Finalize the contract and environment boundaries

Files: `src/lib/lead-contract.ts`, `src/lib/lead-validation.ts`, `src/lib/attribution.ts`, new `src/lib/env.ts`, `.env.example`, focused tests.

- [x] Preserve the existing HTTP result contract: 201/created, 200/duplicate, 400/invalid with safe field errors, 413/too_large, 503/unavailable. Both success outcomes contain no submitted personal information.
- [x] Keep name, normalized Belarusian phone, and interest required. Keep the comment empty or optional and normalize an omitted comment to an empty value. Allow a null product for any interest; a non-null product must belong to the catalog and requires `one_time`.
- [x] Preserve existing limits: name 100, phone input 64, comment 1000 characters, UTM values 256, URLs 2048, total UTF-8 request body 16 KiB. Do not silently truncate contact fields.
- [x] Retain strict `libphonenumber-js/max` validation with country BY and canonical E.164 storage. Do not reduce validation to a prefix/length check or reject valid fixed lines.
- [x] Treat attribution as optional context: a missing/null record must not block a valid callback request. Strip unknown campaign keys, remove URL credentials/fragments/unapproved query keys, allow only HTTP(S), and discard invalid context values instead of storing arbitrary strings. Preserve the original referrer when available; absence is valid.
- [x] Validate and sanitize restored session attribution as well as newly captured values. Reuse a pure shared URL sanitizer on the server. Distinguish browser-reported `landingUrl` and `submissionUrl`; neither is proof of identity or origin.
- [x] Accept absent/null attribution and absent page context from direct clients. Use a known site URL or empty context where appropriate; never infer a missing campaign. Client entry time is optional reporting data, not the database creation time.
- [x] Specify server-only `DATABASE_URL` for the pooled runtime connection, `MIGRATION_DATABASE_URL` for the direct migration connection, and `TEST_DATABASE_URL` for an isolated disposable database. Add names and instructions only; never commit actual values or print them in tool output.
- [x] Keep `SITE_URL` as the canonical public origin. Add an explicit `LEAD_ALLOWED_ORIGINS` configuration for accepted browser origins, scoped per environment. Local defaults are permitted only locally. Fail closed for a misconfigured deployed endpoint while keeping the marketing page renderable.
- [x] For previews, allow only the exact deployment/branch origins obtained from the hosting platform for this project. Do not accept every `*.vercel.app` site or trust arbitrary forwarded-host headers. Production accepts its explicitly configured site origin(s).
- [x] Retain rejection of an unrelated supplied Origin; a missing Origin is allowed for direct clients. Origin checking is not authentication or rate limiting.

**Gate:** unit tests cover omitted comment/context, invalid phone/product, unknown campaign keys, unsafe URLs, restored-session sanitization, and local/preview/production origin configuration. Existing frontend selection behavior still works.

### I2. Add PostgreSQL and a reproducible migration

Files: new `src/lib/db.ts`, `db/migrations/001-create-leads.sql`, `scripts/migrate.mjs`, `docs/database.md`; update dependencies and scripts.

- [ ] Use PostgreSQL on Neon Free and the Node.js runtime on Vercel, subject to the actual account's free-plan eligibility. Choose `pg` with `@types/pg` and `server-only`; pin installed versions through the lockfile. One small table does not require an ORM.
- [x] Use verified TLS settings from the provider's connection instructions. Never disable certificate verification to bypass a connection failure.
- [x] Create the pool lazily in a server-only module, with a small per-instance maximum and bounded connection acquisition. Reuse it for warm requests; release each checked-out client in `finally`. Do not connect during static module import/build.
- [ ] Use the pooled URL for runtime transactions. Use the direct URL for migrations and maintenance. Do not depend on session-level locks/settings across PgBouncer transactions.
- [x] Create the following data model. Use explicit columns for manager-readable fields; avoid a single opaque payload blob.

| Column                                                                | Type and rule                                                                                         |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `lead_id`                                                             | UUID primary key, generated by the application or database                                            |
| `name`                                                                | Nonempty trimmed text, at most 100 characters                                                         |
| `phone`                                                               | Canonical E.164 text; enforce the Belarusian shape at DB level and full validity at application level |
| `interest`                                                            | Text constrained to `subscription`, `one_time`, `question`                                            |
| `product_id`                                                          | Nullable catalog ID; constrained to the four known IDs; non-null only for `one_time`                  |
| `comment`                                                             | Text, default empty, at most 1000 characters                                                          |
| `created_at`                                                          | Required `timestamptz`, generated from database time after lock acquisition                           |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | Nullable text, at most 256 characters each                                                            |
| `landing_url`, `submission_url`, `referrer`                           | Sanitized text, empty/nullable when unavailable, bounded at 2048 characters                           |
| `entered_at`                                                          | Nullable `timestamptz`, browser-reported entry time; never used for deduplication                     |

- [x] Add an index on `(phone, created_at DESC)`. No permanent unique constraint on phone and no ten-minute bucket key.
- [x] Apply migrations explicitly with a documented `npm run db:migrate` command. Record migration version/checksum so re-running skips applied files and fails on changed applied migrations. Serialize concurrent migration attempts. Do not migrate inside request handling or on every Vercel build.
- [x] The runtime database role has only the access needed for lookup/insert; migration credentials are separate and never present in the browser or required by normal requests.
- [x] Document how the manager uses the authenticated Neon console to see contact, interest/product, timestamp, campaign, and page context. No public lead listing or unauthenticated export.

**Gate:** apply the migration to an empty isolated database, apply it again safely, verify constraints and index, and build the site with no database variables. Confirm a database role can persist/read the intended test fields.

### I3. Implement race-safe duplicate prevention

File: new `src/lib/lead-repository.ts`; integration tests in `tests/integration/lead-repository.test.ts`.

The rule applies to the same canonical phone across every interest/product, worker, tab, and application instance. A duplicate does not overwrite the original lead, campaign, or creation time and does not extend its ten-minute window.

- [x] Check out one client and begin a Read Committed transaction. Every statement through commit uses that client, never independent `pool.query` calls.
- [x] Acquire a transaction-scoped advisory lock with a deterministic signed 64-bit key derived from a fixed namespace plus the canonical phone. Use `pg_advisory_xact_lock`, not a session-level lock. Hash collisions may serialize unrelated numbers but cannot bypass the phone lookup.
- [x] Acquire the lock in its own statement. After it returns, obtain `clock_timestamp()` once as the decision time. Query for recent leads in a subsequent statement, so its snapshot includes the preceding lock holder's commit.
- [x] Treat a stored lead as duplicate when its `created_at` is strictly newer than decision time minus ten minutes. At exactly ten minutes, allow a new lead. Use database timestamp precision throughout; do not round-trip the decision through a JavaScript millisecond `Date`.
- [x] If no duplicate exists, insert the validated record with that same database decision timestamp. Commit before returning `created`. A duplicate also completes its transaction before returning.
- [x] On failure, roll back and release/destroy the client as appropriate. Never reuse a client in a failed or unknown transaction state. Parameterize values; do not interpolate user text into SQL.
- [x] Bound connection, lock, statement, and total operation time. Target a server operation under 12 seconds, inside the existing 15-second browser timeout; check cold-start behavior rather than assuming this budget works. Set transaction-local database limits and ensure a deadline actually cancels/terminates outstanding work. `Promise.race` alone is insufficient cleanup.
- [x] A lost commit acknowledgement has an uncertain outcome. Return no false success; a retry uses the same phone and the same duplicate rule. The UI must allow for the possibility that the lead was saved.

**Gate:** two independent clients/pools sending concurrent equivalent phone formats create exactly one row. Verify first-writer rollback, lock release, duplicate immutability, other-phone independence, and expiry behavior. Do not use in-memory locks or a mocked database as proof.

### I4. Connect the endpoint and refine feedback

Files: `src/app/api/lead/route.ts`, `src/lib/submit-lead.ts`, `src/components/lead-flow.tsx`, `src/components/lead-form.tsx`; route/adapter tests.

- [x] Explicitly use the Node.js route runtime for the selected database driver.
- [x] Preserve bounded streaming-body parsing. Detect JSON media type correctly, including UTF-8 charset, and reject unrelated types. Reject malformed JSON/body read errors before calling the repository.
- [x] Separate Origin/configuration, parsing, schema validation, and persistence error boundaries. Bad input returns 400; missing/invalid server config and database/connect/lock failures return 503. A malformed `SITE_URL` must not be presented as a visitor's field error.
- [x] Call the repository with canonical values and sanitized attribution. Replace the current deliberate 503 only after real persistence exists.
- [x] Keep exact status/envelope pairs and `Cache-Control: no-store` on every response. Never return credentials, database messages, a prior lead's name/comment, or a public record identifier to prove a duplicate.
- [x] Retain request identifiers and safe error categories for operations; never log raw request bodies, connection strings, phone numbers, comments, or full advertising URLs.
- [x] When the server returns field errors, move focus to the first invalid field as client validation already does. When invalid context/origin leaves no field error, use general recovery guidance rather than telling the visitor to fix nonexistent highlighted fields.
- [x] Keep contact/comment/selection on failure. Distinguish an unavailable service from an unconfirmed submission; an unavailable response after an uncertain commit must not assert that nothing was stored. Say values remain in the form, not durably saved.
- [x] Check that the broad duplicate message also makes sense for a question or changed selection. No callback deadline or automatic payment/subscription promise.
- [x] Keep abuse controls proportional: body limits, validation, bounded DB work, and Origin checks are required here. CAPTCHA, paid rate-limit services, hidden fake-success honeypots, and Telegram are not prerequisites for the assignment.

**Gate:** a valid local request returns 201 and has a committed row; its repeat returns 200 with no extra row. Bad phone returns 400 with a field error; oversized body returns 413; unavailable storage returns 503; the browser shows each state honestly.

### I5. Run meaningful integration verification

Files: `vitest.integration.config.mts`, `tests/integration/`, package scripts, `docs/verification.md`.

- [x] Add a separate `npm run test:integration` command requiring `TEST_DATABASE_URL`. Refuse to run write/cleanup fixtures against the runtime database target. Do not silently substitute `DATABASE_URL` or report skipped tests as passed.
- [x] Use an isolated test database/schema and documented synthetic fixtures; fixtures must never trigger real calls or external notifications. Any cleanup is scoped to the explicitly disposable test environment.
- [x] Launch concurrent requests from separate connections: exactly one created result and the rest duplicate; database row count is one.
- [x] Test equivalent valid phone formatting, all three interests, selected product/null product, preserved comment, separate phones, and attempts to change details inside the protected window. The first record remains unchanged.
- [x] Verify the boundary predicate at an exactly controlled decision timestamp: immediately before ten minutes is duplicate, exactly ten minutes is allowed, later is allowed. Keep the test seam internal; never accept a caller-supplied clock in the public endpoint. Also test the real repository after arranging older timestamps, without a ten-minute sleep.
- [x] Force one transaction to wait behind another and confirm it sees the committed lead. Cover the case where the waiting transaction started before the first lead was inserted; this detects stale transaction-time/snapshot bugs.
- [x] Exercise failed insert/rollback, database unavailable, lock timeout, and connection release. For a lost HTTP response after commit, retry and assert there is still one row.
- [x] Round-trip every UTM field, landing/submission URL, referrer, entry time, selected product, and comment into PostgreSQL. Test direct traffic, blocked session storage, unsafe/tampered URL context, and anchor navigation.
- [x] Verify browser success, duplicate, server validation focus, pending double-submit, and recovery from temporary failure. Record a real database query result with synthetic data as evidence; do not expose real leads in screenshots.

**Gate:** record commands, actual results, and database isolation method. Update the verification document only for checks actually run. No public cleanup/reset route is introduced.

### I6. Deploy and verify the public form

Files: hosting configuration, `docs/deployment.md`, `.env.example`, asset source records.

- [ ] Inspect existing Vercel/Neon access and projects before creating anything; use the current GitHub repository. Confirm free-plan eligibility/limits in the actual account and avoid paid resources.
- [ ] Resolve the supplied macro-photo source/license records or replace those images with approved generated/free-license alternatives before release. Preserve selected crops and document replacement prompts/sources.
- [ ] Create isolated development/test and production database targets with identical schema. Use a test target for previews; do not let arbitrary preview builds write to the production lead table.
- [ ] Choose nearby hosting/database regions where supported. Set Node.js 24 compatibility and confirm actual account/runtime support.
- [ ] Configure runtime pooled URL, explicit allowed Origin(s), and canonical `SITE_URL` in each appropriate environment. Keep migration credentials in the migration workflow, not runtime. A variable change requires a new deployment.
- [ ] Apply the migration to the correct production database explicitly, then deploy the integration. Do not push a known broken database-dependent release to the public production branch.
- [ ] Confirm the stable public URL opens in a signed-out browser without preview login protection. Verify HTTP, assets/fonts, server responses, metadata, and absence of local/private URLs or credentials in client output.
- [ ] Submit a controlled synthetic lead from the hosted form and inspect the committed production record. Test a repeat and a campaign URL. No automatic production cleanup/reset; use the dedicated test database for repeated/destructive cases.
- [ ] Check a cold database/function request within the operation budget. If free-plan suspension, quota, or connectivity causes a failure, the form must preserve input and explain retry; document the observed limits.
- [ ] Record a recovery procedure: restore the prior app deployment when needed, keep successful lead rows, and use additive migrations compatible with rollback. Do not drop/recreate the production table to fix a deployment.

**Gate:** stable public URL, successful committed lead, real duplicate protection, stored attribution, and usable error feedback. A successful build or HTTP 200 page alone does not satisfy this gate.

### I7. Complete the release evidence

- [ ] Run build, type check, lint, unit tests, and isolated database integration tests after relevant final changes. Save results and the deployed commit identifier.
- [ ] Check current copy/facts, removed captions, every CTA, keyboard focus, reduced motion, contrast, and 320/390/768/1440 px layouts on the release. Refresh selected screenshots; older evidence is historical.
- [ ] Run mobile Lighthouse on the stable deployed URL, save the actual HTML/JSON report or screenshot, and record URL/date/conditions and measured scores. Performance 90 is an internal goal, not a promised result; fix material findings and remeasure only when needed.
- [ ] Check absolute Open Graph/canonical URLs and the 1200 × 630 image. An actual messenger preview is optional; no messaging to another person is required for this check.
- [ ] Preserve authentic AI-session export or screenshots of key moments. `docs/ai-work-log.md` is a summary and does not replace original evidence. Remove secrets/unrelated personal content from any public copy and identify such redaction honestly.
- [ ] Keep the final README approximately half a page: live/repo links, run instructions, PostgreSQL rationale for hosted durable storage, user-versus-AI work, an actual detected AI mistake, and remaining limitations. Put longer setup/test details in linked docs.
- [ ] Confirm public repository visibility, incremental commits, working links, image/font provenance, and no secrets or personal lead records in Git history.
- [ ] Prepare one submission message with site, repository, authentic AI evidence, Lighthouse result, and README. Sending it to the assignment contact requires the user's explicit instruction.

**Gate:** every required assignment artifact is available and truthful before October 19 at 18:00 Moscow time. Telegram and additional animation remain optional.

## 4. Suggested implementation commits

1. `feat: add server configuration and lead database migration` — I1–I2.
2. `feat: persist attributed leads with transactional duplicate protection` — I3–I4.
3. `test: verify lead persistence concurrency and recovery` — I5.
4. `chore: configure deployment and record hosted form verification` — I6.
5. `docs: add release measurements and submission evidence` — I7.

Use these boundaries only when the corresponding work is complete. Only the local database/API/test work is now implemented. Hosting and submission milestones remain open at the user's request.

## 5. External dependencies to resolve when execution starts

- Authenticated access to the intended Vercel and Neon projects, or creation in the user's accounts if absent. Account terms/sign-up steps may require user interaction.
- Database connection settings stored through local ignored configuration and hosting secrets; never requested as a public message or committed file.
- Provenance of the user-supplied macro photographs, or approval of suitable replacements.
- A genuine session export or screenshots for the final evidence package. The current work log cannot manufacture this.
- Optional Telegram bot/chat destination and explicit sending authorization only if the user selects that enhancement.

These are dependencies, not reasons to stop independent implementation or to invent credentials, licenses, or test results.

## 6. Technical references checked for this revision

- [node-postgres transactions](https://node-postgres.com/features/transactions): one checked-out client across the transaction.
- [Neon transaction pooling](https://neon.com/docs/connect/connection-pooling): pooled runtime connections and session-feature limitations.
- [PostgreSQL current-time functions](https://www.postgresql.org/docs/current/functions-datetime.html): wall-clock time versus transaction-start time.
- [PostgreSQL Read Committed](https://www.postgresql.org/docs/current/transaction-iso.html): a fresh snapshot per statement.
- [Vercel environment variables](https://vercel.com/docs/environment-variables): environment scoping and changes applying to new deployments.
- [Neon plans](https://neon.com/pricing): free-plan suitability must be reconfirmed in the actual account before provisioning.
