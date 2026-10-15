# Local database and lead persistence

The local integration uses real PostgreSQL, not an in-memory or fake-success store. Public hosting was deferred by the user on October 15, 2026. This setup is for local development and synthetic verification.

## Start and stop

Prerequisites: Node.js 24+, npm, and PostgreSQL command-line tools (`initdb`, `pg_ctl`, and the server) on PATH. Verified here with PostgreSQL 14.20 on macOS.

```sh
npm ci
npm run db:local:start
npm run dev
```

The database script creates this project's cluster in `.local/postgres` and listens only on `127.0.0.1:55439`. It creates `kvarta_development` and the separate disposable `kvarta_test`, applies migrations, and grants the `kvarta_app` role SELECT/INSERT on leads. Owner access is used only for setup/migration/testing. Schema creation is revoked from PUBLIC; the application role cannot update/delete leads or create tables.

The script writes ignored `.env.local` and `.env.test.local` files only if absent. Existing configuration is preserved; inspect the target before assuming an existing file points to this local setup. No configuration values, database files, or query logs belong in Git.

Open the local Next.js URL. The form now stores leads. No external callback or Telegram notification is sent.

```sh
npm run db:local:stop
```

Stopping retains data files; `db:local:start` starts the same cluster again. Stop the Next.js process separately. The local cluster uses trust authentication on loopback for this development machine; this is not a hosted database configuration. Cloud connections must use the provider's authenticated TLS instructions.

## Configuration

| Variable                 | Purpose                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| `DATABASE_URL`           | Server-only runtime connection with SELECT/INSERT access             |
| `MIGRATION_DATABASE_URL` | Direct owner connection for explicit migrations; no runtime fallback |
| `TEST_DATABASE_URL`      | Separate disposable database; name must end in `_test`               |
| `SITE_URL`               | Canonical site origin for page/social metadata                       |
| `LEAD_ALLOWED_ORIGINS`   | Exact comma-separated browser origins accepted by the endpoint       |

Deployed requests require an explicit allowed-origin list. Local development defaults allow only localhost/127.0.0.1 on port 3000. Changing a dev port requires adding its exact origin. A missing Origin permits direct clients; a supplied unrelated Origin is rejected. Origin is not authentication or rate limiting.

## Schema and migration

`db/migrations/001-create-leads.sql` creates constrained lead fields, structured campaign columns, database timestamps, and the `(phone, created_at DESC)` index. Migration 002 restricts schema creation. No permanent phone uniqueness or time bucket is used.

```sh
npm run db:migrate
```

The migration command uses only `MIGRATION_DATABASE_URL`. It serializes migration attempts, applies files in order inside a transaction, and stores SHA-256 checksums. A repeated run skips unchanged applied files; an edited applied file fails. Add a new migration instead of editing an applied migration. Never migrate inside a request or erase a populated table to recover a deployment.

For a hosted dedicated database, provision the runtime role separately with USAGE on the application schema and SELECT/INSERT on `leads`; retain schema/table ownership in the migration role. The local helper implements this setup for local use only.

## Transaction and duplicate rule

`src/lib/lead-repository.ts` checks out one client, starts a Read Committed transaction, takes a transaction-scoped advisory lock derived from the canonical phone, and then obtains database wall-clock time. The subsequent duplicate query sees the preceding writer's committed row. Timestamp text preserves PostgreSQL microseconds between statements.

The same phone is duplicate strictly before ten minutes after its stored creation time, across all interests/products. Exactly at ten minutes a new request is allowed. Duplicates preserve the original details, attribution, and timestamp. A successful insert is acknowledged only after COMMIT.

Pool connection acquisition is bounded at two seconds; transaction statement/lock limits are three/two seconds; an application deadline destroys an overlong checked-out connection at nine seconds. Server disconnection rolls back an unfinished transaction. A lost commit acknowledgement remains uncertain; retry relies on durable duplicate protection. The existing browser transport timeout is fifteen seconds.

The API separates invalid input (400), oversized bodies (413), committed creation (201), duplicate (200), and configuration/storage failure (503). Logs contain an internal request ID and safe category, not contact fields, SQL errors, connection strings, or full advertising URLs.

## Verification

```sh
npm test
npm run test:integration
npm run lint
npm run typecheck
npm run format:check
npm run build
```

Integration tests load the ignored local env files, require `TEST_DATABASE_URL`, enforce the `_test` database name, and refuse a target matching the configured runtime database. They truncate only that explicitly disposable database's lead table. Unit route tests mock persistence and cannot write leads.

Integration coverage includes independent pools, simultaneous first writes, equivalent formats, duplicate immutability, exact microsecond boundary, expiry while waiting on a lock, rollback/lock release, lock timeout, migration checksums, and attribution persisted through the real route. Browser verification used a synthetic request and confirmed one row after two sends and after a database restart.

Inspect local leads through an authenticated/local PostgreSQL client using the owner role and database target from ignored configuration. There is no public read/export/reset endpoint. On hosting, the manager can use the provider's authenticated SQL console. Final hosted verification and mobile Lighthouse remain separate release work.
