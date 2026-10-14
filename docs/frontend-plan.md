# Kvarta Coffee — Frontend Implementation Sequence

This is the ordered plan for writing the frontend, from the first application file to the deployed form. It supplements the [complete product/backend specification](implementation-plan.md) and [asset preparation plan](assets.md). All steps are future work; none of the application files below currently exist.

## 1. Decisions to carry through implementation

- One Russian-language landing page, one shared lead form, no cart or payment.
- Deep green and paper palette derived from the assignment. Camera Obscura informs typographic scale and photographic confidence; Kvarta has its own layout and weekly identity.
- CSS Modules and shared semantic CSS tokens. No Tailwind or large UI kit is needed for the planned scope.
- Next.js App Router and TypeScript. Static sections remain server-rendered. Client components cover navigation disclosure when needed, product/subscription selection, attribution, and the form.
- Mobile layout is designed at 390 px and also checked at 320 px before desktop expansion.
- Product selection and form data use one provider. No Redux, Zustand, query cache, or global event bus is required.
- Only one real `POST /api/lead` adapter. A simulated success must never reach the published website.

## 2. Order and dependencies

| Step | Output | Dependency |
| --- | --- | --- |
| F01 | Reproducible application scaffold | Existing planning repository |
| F02 | Typed facts, content, and lead contract | F01 |
| F03 | Approved local images and fonts | Asset provenance; F01 |
| F04 | Global tokens and base elements | F02–F03 |
| F05 | Shared lead provider and section skeleton | F02, F04 |
| F06 | Wordmark and navigation | F04–F05 |
| F07 | Hero and weekly rhythm | F03–F06 |
| F08 | Product cards and selection | F02–F05 |
| F09 | Subscription block | F03–F05 |
| F10 | Workshop, delivery, and footer | F02–F04 |
| F11 | Form fields and client validation | F02, F04–F05 |
| F12 | Attribution capture | F02, F05 |
| F13 | Real API adapter and request states | F11–F12; backend B1–B3 |
| F14 | Mobile/tablet/desktop refinement | F06–F13 |
| F15 | Accessibility and interaction checks | F06–F14 |
| F16 | Performance and restrained motion | Real final assets; F14–F15 |
| F17 | Metadata and social preview | Final layout/assets; known deployment URL |
| F18 | Deployed verification and handoff | Backend B4–B6; F01–F17 |

Steps can be checked in small meaningful units. Do not delay the real form/API connection until every decorative detail is perfect. Backend B1–B3 can follow F11 while the static page receives visual refinement.

## 3. Planned file tree

```text
package.json
package-lock.json
tsconfig.json
next.config.ts
eslint.config.mjs
.env.example
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    icon.svg
    opengraph-image.jpg
    api/lead/route.ts
  components/
    container.tsx
    container.module.css
    action.module.css
    site-header.tsx
    site-header.module.css
    mobile-navigation.tsx
    hero.tsx
    hero.module.css
    roast-schedule.tsx
    roast-schedule.module.css
    coffee-section.tsx
    coffee-card.tsx
    coffee-section.module.css
    selection-button.tsx
    subscription-section.tsx
    subscription-section.module.css
    roastery-section.tsx
    roastery-section.module.css
    delivery-section.tsx
    delivery-section.module.css
    lead-flow.tsx
    lead-form.tsx
    lead-form.module.css
    site-footer.tsx
    site-footer.module.css
  content/
    site.ts
    coffee.ts
  lib/
    lead-contract.ts
    lead-validation.ts
    attribution.ts
    submit-lead.ts
    env.ts
    lead-repository.ts
public/
  images/
  fonts/
db/migrations/
tests/
docs/
```

Create `mobile-navigation.tsx` only if the visible compact navigation cannot fit. Merge adjacent static components where the separation adds little value. `env.ts`, persistence, and the route belong to the backend sequence. Importing the shared contract must not pull database modules into the browser.

## 4. F01 — Scaffold without overwriting planning work

**Files:** application config, package/lockfile, `src/app/layout.tsx`, `src/app/page.tsx`.

1. Inspect the existing branch, worktree, Node version, and repository instructions. Use a Node version supported by the selected Next.js release.
2. Use the official create-next-app CLI with customized choices: TypeScript, ESLint, App Router, `src/`, npm, `@/*`, no Tailwind. Leave optional compiler/cache settings at supported simple defaults.
3. Because this repository already contains README/docs, generate in a temporary directory and copy only the necessary application files into the repository. Preserve the current `.git`, docs, README, and `.gitignore`; do not create a nested repository.
4. Review any generated AGENTS.md and merge applicable guidance with the user's English-authorship preference.
5. Commit the exact resolved versions in `package-lock.json`. Use one package manager.
6. Provide scripts: `dev`, `build`, `start`, `lint` using ESLint, and `typecheck` using `tsc --noEmit`. Configure `test` when meaningful tests are added. Do not use a removed framework-specific lint command.
7. Remove starter-demo content and unused sample assets. Create a small page that proves the intended root route renders.

**Done when:** the application starts, renders `/`, and passes the initial production build/type/lint checks. The planning documents remain intact. Commit the scaffold as its own completed unit.

## 5. F02 — Define content and shared data contracts first

**Write in order:** `src/content/coffee.ts`, `src/content/site.ts`, `src/lib/lead-contract.ts`, then `src/lib/lead-validation.ts` as the form is developed.

1. Define `ProductId` from the four stable product IDs in the complete plan. Define `CoffeeProduct` with ID, name, taste notes, supplied roast/brewing note, package description, numeric BYN price, image reference, and alternative text.
2. Put product prices and facts in one readonly catalog. Avoid independently hardcoded price copies in the page and form.
3. Put subscription facts, founder/story facts, schedule, address, hours, and anchor labels in `site.ts`.
4. Customer-facing text is Russian; identifiers and comments remain English. Translate the supplied product names accurately, without adding unsupported claims.
5. Define shared input/output types and runtime schemas without importing server infrastructure. Interest values are `subscription`, `one_time`, and `question`.
6. Define the selection as valid alternatives: no interest/product yet; one-time interest with an optional valid product; subscription/question with no product. An unrelated product ID must not survive a switch to subscription or question.
7. Define `LeadDraft` fields separately from attribution and transport status. Comments never carry hidden product-selection logic.
8. Decide the response envelope now: created, duplicate, invalid fields, oversized request, and unavailable service. Represent network/protocol failures separately in the client.

**Done when:** every supplied fact has one source, unknown facts remain explicit assumptions, and client/server agree on the allowed payload and response states.

## 6. F03 — Prepare publication-ready assets

**Files:** approved images under `public/images/`, font files/licenses where applicable, `docs/assets.md`.

1. Verify sources for the supplied pouch, beans macro, scattered beans, and foam photograph. Select the missing workshop and drip-pack images.
2. Rebrand the pouch with a Kvarta label, producing three consistent origin variants. Prepare a distinct drip-pack image. Record generated/edited assets honestly.
3. Export the hero's vertical beans crop, product images, foam image, and workshop crop at measured dimensions. Preserve usable focal points for narrow and wide screens.
4. Use descriptive English filenames. Never link to Downloads paths from the deployed app.
5. Obtain the necessary Cyrillic font weights and inspect their licenses. Start with Geologica for display and Golos Text for body, then evaluate the actual wordmark in-browser.
6. Record final dimensions, source, author/license, and edits. If an asset cannot be verified, replace it with a licensed or generated candidate before release.

**Done when:** real chosen images can be used during layout work; visible text on packages belongs to Kvarta; final-publication assets have provenance.

## 7. F04 — Build tokens and base elements

**Write in order:** `src/app/globals.css`, `src/app/layout.tsx`, `container.tsx`/CSS, `action.module.css`.

1. Add palette tokens from the complete plan, plus semantic text/surface/border/action/state aliases. Components refer to tokens rather than repeated ad-hoc values.
2. Add spacing, corner radius, content width, typography, and transition-duration tokens. Set body to paper background with ink text.
3. Apply a small CSS reset: box sizing, sensible margins, inherited form fonts, responsive media, and predictable buttons. Do not remove outlines without a visible focus replacement.
4. Configure font loading in the root layout; set `lang="ru"`. Avoid remote font requests during normal page viewing.
5. Implement a reusable `Container` with maximum width 1280 px, 16–20 px mobile gutters, and 32–48 px desktop gutters.
6. Implement shared primary, secondary, and text-action classes. Native links remain links; selection/submission actions remain buttons. All important touch targets are at least 48 px.
7. Define focus treatment for both paper and deep-green contexts, error/success text, and `prefers-reduced-motion` behavior.

**Done when:** the base page has readable type, correctly contrasted controls, and consistent spacing at 320 and 390 px before individual sections are added.

## 8. F05 — Wire the page skeleton and shared lead flow

**Files:** `src/components/lead-flow.tsx`, `src/app/page.tsx`.

1. Create a small client provider that owns selection, the draft, request status, field errors, and attribution. Expose typed operations through a hook; no server secrets or database imports.
2. Keep `page.tsx` a server component. Pass server-rendered section children through the provider's children slot; static section imports stay on the server side. Only nested selection buttons/form consume the client context.
3. Compose sections in this order: header, hero, schedule, coffee, subscription, workshop, delivery, request form, footer.
4. Create stable semantic section IDs and headings. The hero owns the only H1; the wordmark is a brand element rather than a second H1.
5. Add a skip link and a `main` landmark. Define anchor offsets for the compact sticky navigation.
6. Place the request section once. Do not duplicate desktop/mobile forms or create independent drafts for different CTAs.
7. Implement selection operations: choose product, choose subscription, choose question, clear product, edit draft, and reset completed status after deliberate editing. Preserve name/phone/comment when changing selection.

**Done when:** each anchor resolves once, static text is visible in the initial HTML, and one state owner serves all selection entry points and the form.

## 9. F06 — Build the oversized wordmark and navigation

**Files:** `site-header.tsx`, `site-header.module.css`; optional `mobile-navigation.tsx`.

1. Render the Cyrillic Kvarta wordmark in forest green on paper. Tune font weight, natural letter spacing, and size without stretching individual letters.
2. Desktop wordmark target is approximately 140–190 px within the content width; mobile approximately 64–80 px, adjusted to avoid overflow.
3. Place the small Minsk/since-2019 descriptor alongside or below the wordmark. Keep it subordinate.
4. Use four navigation anchors from content data. Begin with a visible two-by-two compact mobile arrangement; add a labeled menu disclosure only if the real copy does not fit.
5. Keep the oversized brand area in normal document flow. Only the smaller navigation row becomes sticky.
6. If a disclosure is required, implement `aria-expanded`, controlled visibility, closing after navigation, and Escape handling. Do not add a complex full-screen modal menu.

**Done when:** navigation works by keyboard/touch; the 320 px screen has no overflow; the heading/action is not pushed below the entire first mobile view by the brand.

## 10. F07 — Build the hero and weekly rhythm

**Files:** `hero.tsx`/CSS, `roast-schedule.tsx`/CSS.

1. Render the Thursday/Friday proposition as a two- or three-line H1, followed by a short explanation of batches and freshness.
2. Primary hero action is a native anchor to `#coffee`. Secondary action is a clearly labeled anchor to the subscription explanation, without prematurely changing a user's form selection.
3. Desktop hero uses approximately seven columns of copy to five columns of photographic panel. The panel contains the vertical beans macro and a restrained batch-size label.
4. Mobile order is title, explanation, main action, photograph. Avoid setting hero height to `100vh`, particularly in mobile browsers.
5. Use explicit image dimensions or a reserved aspect-ratio container, an accurate `sizes` value, and the framework's current supported early-loading mechanism for the one hero image.
6. Render the weekly rhythm immediately below as two connected dark/light panels. Write the full weekday alongside any abbreviation.
7. Do not create a countdown, auto-playing video, drifting beans, or a seasonal leaf overlay.

**Done when:** the proposition and action are visible early; image crop looks intentional; assets do not shift the layout; Thursday/Friday details match all later sections.

## 11. F08 — Build coffee cards and their selection actions

**Files:** `coffee-section.tsx`, `coffee-card.tsx`, `selection-button.tsx`, `coffee-section.module.css`.

1. Render cards from the catalog. `CoffeeCard` takes one `CoffeeProduct`; its text/photo rendering can stay server-side.
2. Render the minimal client `SelectionButton` with a serializable intent/product ID, never a callback from a server component.
3. Show package, name, supplied taste note, weight/quantity, BYN price, and a visible button. Use contained product images so labels and package edges remain visible.
4. Layout: one column below 640 px, two columns from 640 px, four at sufficiently wide desktop widths where each card retains readable content. If 1024 px is too narrow for four cards, retain two until the content fits.
5. On selection, update the provider to one-time/product, move to the request section, and bring its heading/summary into keyboard focus after scrolling. Do not jump directly into a phone input or unexpectedly open the phone keyboard.
6. Make the selected product summary explicit. A clear/change operation does not erase the free-text comment.
7. Selecting the currently selected product is harmless. While a request is being submitted, prevent selection changes from starting another request or mutating the submitted snapshot.

**Done when:** every ID selects the correct displayed coffee and price; an edited comment survives changing products; keyboard selection reaches an understandable form context.

## 12. F09 — Build the subscription section

**Files:** `subscription-section.tsx`, `subscription-section.module.css`; reuse `SelectionButton`.

1. Use a deep-green section with paper text, a strong display heading, and a photograph of the foam or prepared pouch.
2. Keep 54 BYN/month, two 250 g packs, monthly frequency, and included delivery close enough to be read as one offer.
3. Explain the three stages with short numbered steps. Avoid three large decorative icon boxes competing with the offer.
4. Desktop layout is text/offer and photography side by side; mobile presents the offer and CTA before the image.
5. CTA explicitly selects subscription, clears a one-time product ID, preserves contact fields/comment, then focuses the request section summary.
6. Do not promise a discount, cancellation policy, automatic payment, or exact monthly delivery date that the brief does not provide.

**Done when:** the offer can be understood without clicking; switching from a selected coffee to subscription produces a consistent form summary.

## 13. F10 — Complete workshop, delivery, and footer

**Files:** `roastery-section.tsx`/CSS, `delivery-section.tsx`/CSS, `site-footer.tsx`/CSS.

1. Workshop: write two short paragraphs about the named founders and 5 kg roasting, accompanied by a real chosen process image. Do not identify stock people as the founders.
2. Freshness: connect the supplied 1–3 days to the workshop rhythm in ordinary language. No health or optimal-brewing claims are required.
3. Delivery: show two panels with Friday Minsk delivery/free-from-50-BYN and pickup/address/hours. Keep the subscription's included delivery distinct from the one-time threshold.
4. An external map link is included only after its destination is verified. Render the address text regardless of link availability.
5. Footer: compact brand, actual address/hours, selected anchors, and a request contact entry point. Omit invented social accounts, phones, and email.
6. Read the entire static page together, removing repeated explanations and checking all prices, weights, weekday names, and hours against content data.

**Done when:** all required content is present; scrolling has a deliberate visual rhythm; there are no dead or fake links.

## 14. F11 — Write the form and client validation

**Files:** `lead-form.tsx`, `lead-form.module.css`, `src/lib/lead-validation.ts`.

1. Build the actual semantic form with permanent labels for name and phone, a fieldset/legend with three interest radio options, optional comment, selection summary, and submit button.
2. Read/write the draft through the provider; do not use independent copies of provider values inside the form.
3. Use `autoComplete="name"`, `autoComplete="tel"`, `type="tel"`, and a useful phone example. Accept paste, spacing, and punctuation without a restrictive input mask.
4. No interest is silently assumed on a direct visit. A selection CTA preselects the relevant interest; otherwise the visitor explicitly chooses one.
5. Validate name, country/number, interest, catalog ID, and length limits through the shared schema. Use strict phone metadata. The server repeats validation.
6. Show errors after blur or a submission attempt; do not show an invalid-phone error immediately on the first digit.
7. Connect hints/errors to the input via `aria-describedby`; use `aria-invalid` when needed. On invalid submit, focus the first erroneous input.
8. Render phone input in a left-to-right direction and maintain readable sizing. Display the raw edited phone; normalize it for submission rather than rewriting it on every keystroke.
9. Place the form in a light readable surface with a short callback explanation and one dominant submit action. Mobile uses one column; desktop can place introductory text beside the form.
10. Build pending/result/error UI in the form shell before wiring transport. Do not mark a local demo as a working submitted request.

**Done when:** fields are usable and understandable with keyboard/touch; optional comment is truly optional; valid and invalid inputs produce consistent outcomes without losing data.

## 15. F12 — Capture attribution without disturbing the page

**Files:** `src/lib/attribution.ts`; initialization inside `lead-flow.tsx`.

1. Capture the first page-entry URL, allowlisted UTM fields, referrer, and timestamp after hydration. Keep browser APIs out of server rendering.
2. Validate a stored tab-session record before reuse. Preserve first-entry attribution when navigating page anchors or refreshing the same active visit.
3. Restrict storage to campaign metadata. Do not put phone/name/comment in URL parameters or session storage.
4. Sanitize referrer and page URLs through a defined allowlist; remove arbitrary query parameters and fragments from reporting URLs while retaining approved campaign parameters.
5. Catch storage failures and fall back to in-memory attribution. Tracking must not block submission.
6. Capture the submission page separately at the instant the payload is created. Do not replace the initial campaign with the form anchor.

**Done when:** test campaign values survive CTA navigation; direct visits and blocked storage still allow the form to work.

## 16. F13 — Connect the real API and complete all request states

**Files:** `src/lib/submit-lead.ts`, `lead-flow.tsx`, `lead-form.tsx`; backend `src/app/api/lead/route.ts`.

1. Implement one transport function accepting an immutable validated payload snapshot and returning a typed result. Send a same-origin JSON POST with bounded timeout.
2. Use a synchronous in-flight guard as well as React pending state so two near-simultaneous submit events do not start two client requests. The database remains the final authority.
3. Prevent relevant draft/selection edits while pending, or keep them rigorously separate from the submitted snapshot. For this small form, disabled fieldsets during pending are the simpler choice.
4. Parse response JSON as unknown and validate its envelope. A 2xx status alone or unexpected HTML must not be presented as success.
5. Map created to receipt confirmation, duplicate to already-received confirmation, invalid to field guidance, oversized to shorter-input guidance, and service/network errors to retry instructions.
6. A timed-out request may have been saved. Use uncertain-outcome wording and let the user retry; the canonical-phone transaction prevents another row within the window.
7. Preserve draft values on error and after receipt. Deliberate edits can return to idle; do not auto-reset the form on failure or merely because a callback changed.
8. Keep status next to the submit area and announce sending/results politely. Reserve visible space where practical so status does not cause a large layout jump.
9. Do not call the submit adapter from effects. Only an explicit submit action creates a request.
10. Remove development-only stubs before deployment. Never fall back from database failure to an in-memory fake lead or an unconditional success message.

### State transition contract

| Event | Starting state | Next state and effect |
| --- | --- | --- |
| Edit a field or choose an intent | Idle/error/completed | Update draft/selection; clear stale result as appropriate; keep other fields |
| Submit invalid draft | Any non-pending state | Show field errors; focus first error; send no request |
| Submit valid draft | Idle/error/completed | Set pending and in-flight guard; submit one snapshot |
| Second submit while pending | Pending | Ignore; no additional request |
| Created response | Pending | Success; explain manager callback |
| Duplicate response | Pending | Duplicate; explain receipt already exists |
| Server field error | Pending | Error with field details; preserve values |
| Timeout/network/unavailable | Pending | Error with retry; preserve values and attribution |
| Retry | Error | Revalidate current draft and send one new request |

**Done when:** actual database-backed responses control the UI, uncertain outcomes are honest, and repeat clicks/retries obey the durable duplicate rule.

## 17. F14 — Refine every breakpoint with real content

**Files:** section CSS Modules and global layout tokens.

1. Review 390 px first, then 320, 768, and 1440 px. Inspect the actual full page, not only the hero.
2. Correct headline wraps and wordmark overflow without shrinking body text below 16 px.
3. Check product title/price alignment, package visibility, text density, section gaps, and form control spacing. Do not clip titles to force equal card heights.
4. Use independent display sizes at breakpoints. Do not reduce the entire page with transforms or a global scale factor.
5. Ensure sticky navigation and any bottom action do not cover the form, keyboard, or result. The baseline plan does not require a second sticky mobile CTA.
6. Verify browser zoom, long names/comments, and phone keyboard behavior. Avoid fixed height on content panels.
7. Adjust image object positions individually rather than using one arbitrary crop for all photographs.

**Done when:** no horizontal scrolling, obscured controls, clipped copy, or awkward image crop remains at the selected widths.

## 18. F15 — Verify accessibility and critical interactions

**Files:** relevant components, focused interaction tests when justified, verification notes.

1. Walk the page using Tab/Shift+Tab/Enter/Space. Inspect focus order, visible focus, anchors, selection, radio options, and submission.
2. Confirm only one H1, orderly section headings, labeled fields, a useful skip link, meaningful alternative text, and empty alt text for decorative duplicates.
3. Review contrast of final normal/hover/focus/error states and any photographed overlay, not just the original palette swatches.
4. Check the form's missing-interest and invalid-phone errors, pending announcement, successful receipt, duplicate receipt, and retry guidance.
5. Verify selecting another product or subscription never overwrites an edited comment. Check selection clearing and switching to question.
6. Add focused automated interaction coverage for these critical state-preservation/recovery paths; do not snapshot every static paragraph or duplicate CSS in tests.
7. Run an accessibility scan if the tooling is available, then inspect findings manually. Record unresolved material findings.

**Done when:** the request flow is usable without a mouse, status changes are understandable, and meaning is never communicated by green/red alone.

## 19. F16 — Optimize loading and add only useful motion

**Files:** image usage, font configuration, CSS transitions, component boundaries.

1. Check that only required interactive modules enter the client bundle. Do not import the page or server-only modules into the provider.
2. Audit image dimensions, `sizes`, file weight, and actual browser-selected variants. Use early loading only for the primary above-the-fold image; lazy-load the rest.
3. Include necessary Cyrillic font coverage and a small number of weights. Check fallback-font geometry to reduce shift.
4. Keep content visible if animations never run. CSS button/selection feedback around 150–200 ms is sufficient.
5. Honor reduced motion and avoid scroll-jacking, layout-dependent reveal effects, or background video.
6. Remove unused sample images, debug logging, temporary validation banners, and unnecessary dependencies.
7. Measure the production page, identify material loading/layout issues, and fix those rather than pursuing speculative optimization.

**Done when:** the production page has stable layout, appropriately loaded assets, restrained interaction feedback, and no avoidable large client dependencies.

## 20. F17 — Finish metadata and social preview

**Files:** `src/app/layout.tsx`, icon, `opengraph-image.jpg`, deployment URL configuration.

1. Write accurate Russian title and description in the Metadata API using shared site facts.
2. Create a favicon with a simple independently drawn letter/mark that remains clear at small size.
3. Prepare a 1200 x 630 preview with Kvarta's large wordmark, deep green/paper palette, approved coffee image, and a short fresh-roasting proposition.
4. Set metadata base/canonical to the actual production URL after deployment. Do not accidentally index a localhost or temporary preview address as canonical.
5. Verify social image resolution/content type and title/description in served HTML. No invented star ratings or business contacts in structured data.

**Done when:** sharing the real URL has correct metadata and a publicly accessible, accurate image.

## 21. F18 — Confirm the deployed frontend and hand it over

1. Run configured production build, TypeScript, ESLint, and meaningful tests after final relevant changes.
2. Deploy with the real endpoint/database and check the actual public URL on narrow and wide views.
3. Open a URL with controlled UTM values, choose a specific coffee, submit documented test data, and verify saved selection/attribution in the database.
4. Check invalid phone, duplicate submission, retry after uncertain acknowledgement, and normal direct-entry submission. Record actual outcomes.
5. Save a mobile Lighthouse report from the deployed URL and review performance/accessibility findings.
6. Update the main README with actual run commands, deployment URL, storage choice, contributions, mistakes, and limitations. Keep the requested final summary short while leaving detailed operational notes in docs.
7. Preserve genuine AI session evidence and incremental commit history. Do not claim all checkboxes are complete because the frontend merely looks finished.

**Done when:** a visitor can reach the public website, understand the offer, choose an interest/product, and submit a durably stored lead with honest feedback.

## 22. Suggested commit boundaries

| Completed work | Commit |
| --- | --- |
| F01 | `chore: scaffold Next.js application` |
| F02–F04 | `design: add coffee content assets and green design tokens` |
| F05–F07 | `feat: build wordmark hero and roast schedule` |
| F08–F10 | `feat: add coffee subscription and workshop sections` |
| F11–F12 | `feat: add accessible lead form and campaign capture` |
| F13 plus backend B1–B3 | `feat: connect lead capture with durable duplicate protection` |
| F14–F16 plus backend B4 | `test: verify responsive layout and lead recovery` |
| F17–F18 plus backend B5–B6 | `docs: record deployment and submission evidence` |

Use these boundaries when their work is actually complete. Combine tiny adjacent changes where sensible; do not make one retrospective commit for the entire assignment.

## 23. Final frontend completion checklist

- [ ] All four products and subscription match the brief exactly.
- [ ] Wordmark, green palette, image crops, and visual rhythm fit the chosen direction.
- [ ] Every navigation link and product/subscription CTA works.
- [ ] Selection and draft state are shared, valid, and preserved correctly.
- [ ] Form has permanent labels, appropriate phone handling, and all request states.
- [ ] Success requires the actual server's durable confirmation.
- [ ] Campaign/page context is captured and saved with the lead.
- [ ] 320/390/768/1440 px views and keyboard flow have been inspected.
- [ ] Final contrast, focus, alternative text, and reduced motion have been checked.
- [ ] Production assets/fonts, metadata, preview, and live form have been verified.
- [ ] Actual Lighthouse report and authentic AI evidence are included in the delivery.
- [ ] README accurately states remaining limitations.

## 24. Official framework references

- [Installation and current CLI choices](https://nextjs.org/docs/app/getting-started/installation).
- [Server/client boundaries and composition](https://nextjs.org/docs/app/getting-started/server-and-client-components).
- [Global CSS and CSS Modules](https://nextjs.org/docs/app/getting-started/css).
- [Image API and loading behavior](https://nextjs.org/docs/app/api-reference/components/image).
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers).

Consult the installed release's documentation when writing framework-specific code. The specification defines behavior; it does not authorize silently using an outdated API.
