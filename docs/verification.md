# Frontend verification — 2026-10-15

## Scope

The frontend milestone is implemented. This is a local verification record, not a claim that the assignment's complete deployed lead-capture system is finished.

The [integration plan reviewed on October 15](integration-plan.md) defines the remaining work and documents gaps found in the current API boundary. Later copy revisions are recorded in the AI work log; the original screenshots and check results below describe the frontend milestone, not a new release measurement.

- F01–F12: application, visual system, sections, selection, form, and attribution implemented.
- F13: typed request transport and response UI implemented and tested; the current validation endpoint deliberately returns unavailable until persistence exists.
- F14–F17: responsive refinement, accessible structure/focus, asset handling, favicon, and social preview implemented and locally inspected.
- F03 release gate: generated images are recorded; free-license source verification for user-supplied macro photographs remains.
- F18 and backend/release B1–B6: durable storage, real server duplicate protection, public deployment, deployed Lighthouse, and final submission remain.

## Automated results

| Check | Result |
| --- | --- |
| `npm run build` | Passed, including the latest CSS changes and TypeScript stage |
| `npm run typecheck` | Passed; the final production build also checked all current TypeScript |
| `npm run lint` | Passed |
| `npm run format:check` | Passed |
| `npm test` | Passed: 19 tests across 5 files |
| `npm audit --omit=dev` | Zero production dependency vulnerabilities reported |
| `git diff --check` | Passed |

The full dependency audit reports five findings in the development-only ESLint/fast-glob/micromatch/braces chain. The package registry did not provide a patched newer braces release when checked. No forced downgrade of the framework/linter was applied. Recheck this chain before changing tooling or adding CI.

The local build warns that `SITE_URL` is unset and social metadata falls back to localhost. This is expected in this local stage. Set the real production origin before public deployment and verify canonical/social URLs there.

## Meaningful test coverage

- Valid Belarusian mobile and fixed-line formats, punctuation normalization, wrong country, incomplete input, invalid prefix, and surrounding prose.
- Required interest, optional empty comment, trimming, limits, and incompatible product/subscription combinations.
- Campaign URL allowlisting, removal of unrelated queries/credentials/fragments, tab-session preservation, and blocked-storage fallback.
- Expected 201-created and 200-duplicate acknowledgement contracts; rejection of malformed or mismatched successful responses.
- Unavailable service versus uncertain network outcome.
- Preservation of an edited comment/contact fields while switching coffee to subscription.
- One in-flight client request for repeated submit events and duplicate-receipt display.
- Local preview Origin handling, unrelated-origin rejection, server field errors, and oversized-body rejection.

Test response fixtures are scoped to the test runner. No fake-success endpoint or demo storage is used by the application.

## Browser observations

The local development preview and production build were opened in the Codex browser.

| Width | Observed layout |
| --- | --- |
| 320 px | No horizontal overflow; navigation, form choices, retry action, and footer remain usable |
| 390 px | No horizontal overflow; mobile hero, coffee selection, form validation and service-error recovery inspected |
| 768 px | No horizontal overflow; two-column product/subscription/delivery layout inspected |
| 1440 px | No horizontal overflow; oversized wordmark and asymmetric hero inspected |

The rendered page has one H1. All seven rendered photographs loaded and have alternative text. Every input/textarea has an associated label. Keyboard-reachable native links/radios/buttons and explicit focus styling are used. Reduced motion is supported in CSS and in selection scrolling; the OS preference was not changed during testing.

Actual browser actions confirmed product selection, keyboard focus transfer to the request heading, switching to subscription while retaining a comment, rejection of a non-Belarusian number, and a valid synthetic request receiving 503 with preserved values and a retry action. The production build's request also correctly returned unavailable; no lead was stored.

The social-image route returned HTTP 200 with `image/png`; its readable Cyrillic output was inspected at 1200 x 630.

## Screenshots

- [Desktop production first screen](screenshots/desktop.jpg).
- [Mobile production first screen](screenshots/mobile.jpg).
- [Mobile production request-error state](screenshots/request-error-mobile.jpg).

These screenshots are evidence of the local frontend. They are not a deployed mobile Lighthouse report.

## Required next milestones

1. Create the PostgreSQL schema and interactive transaction-based phone deduplication.
2. Replace the explicit unavailable boundary with durable persistence; return created only after commit.
3. Verify simultaneous requests, equivalent formats, and the exact ten-minute window against a disposable real database.
4. Resolve source licenses or replace the supplied macro photographs before final release.
5. Deploy on the agreed free hosting, set `SITE_URL`, and check the real public form and campaign records.
6. Save the actual deployed mobile Lighthouse report and authentic AI-session evidence.
