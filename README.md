# Kvarta Coffee

A responsive Russian-language frontend for a fictional small-batch coffee roastery in Minsk, based on the [assignment](https://tz.vitai.world/). The design uses the brief's deep green palette, an oversized wordmark, photographic panels, and Thursday-roasting/Friday-delivery messaging.

**Status:** the frontend is implemented and locally verified. Durable lead storage and public deployment remain the backend/release milestones. The current `/api/lead` validates requests and returns `503 unavailable` for valid leads; it never claims an unsaved lead was received.

## Run

Use Node.js 24 or newer and npm:

```sh
npm ci
npm run dev
```

Open the printed local URL. For production verification, run `npm run build`, then `npm start`. Set `SITE_URL` to the actual site origin during deployment so canonical and social URLs resolve correctly. Database credentials are not needed for this frontend stage.

## Implemented

All required content sections, four product selections, subscription selection, one shared form, strict Belarusian phone validation, campaign attribution, pending/success/duplicate/error handling, keyboard focus, responsive CSS, local fonts, optimized images, favicon, and a generated 1200 x 630 social preview. Success and duplicate states require the corresponding validated backend acknowledgement; tests simulate those contracts without creating actual leads.

## Checks

`npm run build`, `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test`. Nineteen tests cover phone validation, selection preservation, campaign sanitization, request acknowledgements, repeat submits, and the API boundary. See [verification](docs/verification.md) for actual results and remaining work.

## Process and limitations

The user supplied the brief, selected references/photos, and chose the green direction. AI authored the frontend, tests, documentation, and generated package/process imagery. Image generation initially invented a city/year on packages; visual inspection caught this and the labels were corrected. Browser testing also caught an internal-hostname mismatch in the local API origin check; it was fixed and regression-tested.

The supplied macro-photo licenses still need source verification before final release. No business phone/email, subscription cancellation terms, or delivery cutoff was invented. The next step is transactional PostgreSQL persistence, followed by deployment, real duplicate tests, and the required deployed mobile Lighthouse report.

## Project documents

- [Complete implementation plan](docs/implementation-plan.md)
- [Frontend execution plan](docs/frontend-plan.md)
- [Verification and progress](docs/verification.md)
- [Palette](docs/palette.svg)
- [Assets and provenance](docs/assets.md)
- [Image prompts](docs/image-prompts.md)
- [AI work log](docs/ai-work-log.md)

Repository code, comments, documentation, and commits use English; customer-facing copy uses Russian. The submission deadline is October 19, 2026, 18:00 Moscow time.
