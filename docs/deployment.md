# Deferred hosting checklist

Status on October 15, 2026: local integration works; the user explicitly selected local integration only. No Vercel/Neon resource was created or deployed. The Vercel CLI authentication check returned an invalid-token error. Available Vercel/Neon plugins were discovered but were not connected. Do not treat a local screenshot as a public deployment or Lighthouse result.

When the user resumes hosting:

1. Connect the intended accounts, inspect existing projects, and confirm actual free-plan eligibility. Reuse the current repository; create no paid add-on.
2. Create independent preview/test and production database targets. Use a direct migration connection and pooled server runtime connection with authenticated TLS. Provision the restricted runtime role as described in [database setup](database.md).
3. Apply committed migrations explicitly to the intended target. Do not let automatic preview builds migrate or write the production lead table.
4. Configure the runtime `DATABASE_URL`, canonical `SITE_URL`, and exact `LEAD_ALLOWED_ORIGINS` per environment. Migration credentials are not required in normal function configuration. Set Node.js 24 compatibility. Check the selected hosting runtime/region and database region.
5. Deploy only when requested. Preview Origin values must be exact project/deployment URLs; no broad `*.vercel.app` rule. Environment changes require a new deployment.
6. Verify a public signed-out visit, assets, metadata, one controlled committed lead, duplicate rejection, and campaign fields in the correct database. Check cold-start response time. Do not expose test cleanup or a lead list.
7. Retain the user-owned macro photographs, whose ownership is confirmed. Measure mobile Lighthouse on the real public URL and save actual scores/report and current screenshots.
8. Include the concise README, live/repository links, actual measurements, and remaining limits. The user excluded further AI-session packaging. Sending the submission is a separate user instruction.

Application rollback must preserve lead rows. Prefer additive migrations compatible with the prior release. No Telegram messaging is part of this local milestone.
