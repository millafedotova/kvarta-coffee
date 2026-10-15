# Hosted deployment

Deployed on October 15, 2026 at [kvarta-coffee-five.vercel.app](https://kvarta-coffee-five.vercel.app). The user authorized cloud deployment, CLI access, and storing the restricted Neon runtime connection in Vercel.

## Resources and configuration

- Vercel project: `milla11/kvarta-coffee`, Hobby plan, Next.js, Node.js 24.x. Install with `npm ci`, build with `npm run build`.
- Functions use `fra1`, configured in `vercel.json`. The build machine can run in another region.
- Neon project: `kvarta-coffee`, Free plan, PostgreSQL 18, AWS Frankfurt. The production database is separate from the local development and disposable test databases.
- Applied both committed migrations explicitly to production. Runtime requests and Vercel builds never migrate the database.
- The runtime role `kvarta_app` has USAGE on `public` and SELECT/INSERT on `public.leads`. UPDATE, DELETE, and schema CREATE were verified to be denied.
- Vercel Production contains secret `DATABASE_URL` using the pooled Neon endpoint with verified TLS, plus `SITE_URL` and `LEAD_ALLOWED_ORIGINS`, both set to `https://kvarta-coffee-five.vercel.app`.
- Owner migration credentials stay in ignored local configuration and are not runtime environment variables. `.vercelignore` excludes all env files, local database/secret files, and private material from uploads. A dry deployment reported zero included sensitive files.
- Preview and Development do not receive production database credentials. Configure a separate database and exact origins before enabling preview form submissions.

The stable production domain is public; generated deployment URLs retain Vercel authentication. Anonymous access to the stable domain returned HTTP 200 without a redirect. No protection bypass was needed.

## Deploy an update

The local directory is linked to the intended Vercel project. From the repository root, with an authenticated CLI:

```sh
vercel deploy --prod --scope milla11
```

Deploy source after the relevant checks pass. Environment changes require another deployment. Keep migration credentials out of normal function configuration; apply additive migrations explicitly before code that requires them.

The GitHub repository remains the source of record. `vercel git connect` was attempted, but Vercel requires a GitHub login connection in this account. Automatic Git deployments are not configured. Until connected, pushing to GitHub alone does not update the live site; use the CLI command above.

## Verification and recovery

The configured deployment reached Ready and its cloud build passed compilation and TypeScript. An actual browser request selected Ethiopia, submitted a synthetic do-not-call lead, and stored the product plus campaign source/medium/name in Neon. A repeat displayed duplicate feedback and retained one unchanged record. The synthetic record remains in production; no reset or cleanup endpoint exists.

For recovery, select a known working release in the Vercel dashboard. Retain successful lead rows and use additive schema changes compatible with the earlier application. Do not drop/recreate the lead table to repair a deployment. The bootstrap deployment lacked database configuration and is not a suitable working rollback target.

See [verification](verification.md) for current measurements and [database operations](database.md) for local development, migration semantics, and data inspection. No Telegram messaging is configured.
