# Kvarta Coffee — Implementation Plan

## 1. Objective and scope

Build a fast, mobile-first landing page for a fictional Minsk roastery. The visitor must understand freshness, choose a product or monthly subscription, and leave a callback request. The manager completes the order.

The project is currently in the planning phase. This document specifies future implementation; component names and file paths below do not yet exist.

Required outcome: a public repository with incremental commits, one live website with a working backend, authentic AI session evidence, a mobile Lighthouse report, and a concise final README. Deadline: October 19, 2026, 18:00 Moscow time. Target implementation effort: approximately six hours after planning, with optional work deferred if the core takes longer.

## 2. Creative direction and pattern analysis

**Concept: Coffee on your own rhythm.** Thursday roasting and Friday delivery create a specific weekly identity. Repeat this rhythm through copy, packaging labels, and delivery information.

Use Camera Obscura's scale, strong wordmark, dense typography, and confident photography. Use the brief's green colors and Kvarta's own composition. Use Roast's asymmetrical information panels and Five Elephant's clear subscription explanations where they support the visitor's decision.

Primary pattern families:

1. Informational landing page: scannable text and photographic storytelling; navigation-wayfinding GR-2 and GR-4, typography GR-4 and GR-13.
2. Short transactional flow: product selection leads directly to one inline request form; controls-components GR-16, cognitive-load GR-3 and GR-4.
3. Mobile-first experience: vertical stacking, visible controls, independent headline sizes; mobile-responsive GR-2, GR-10, and GR-11.
4. Recoverable form: inline field errors and durable server confirmation; forms-data-entry GR-11 and GR-13, errors-feedback GR-8 and GR-12.

Source abbreviations in the UX skill: AF = About Face; RefUI = Refactoring UI; 100T = 100 Things Every Designer Needs to Know. Dashboard navigation, multi-step onboarding, carts, checkout, customer accounts, editorial feeds, and administrative interfaces do not match this assignment's core scope.

## 3. Visual system

### Palette

The first three colors were observed in computed styles on the assignment website. Other colors are project-specific extensions.

| Token | Hex reference | Role |
| --- | --- | --- |
| `paper` | `#F7F8F6` | Main page background; inverse text on dark panels |
| `ink` | `#17201C` | Headings and body text on light surfaces |
| `forest` | `#1D5C4A` | Wordmark, primary buttons, links, selected options |
| `forest-deep` | `#0E352B` | Subscription panel, selected editorial panels, footer |
| `forest-hover` | `#134A3B` | Hover and pressed button treatment |
| `surface` | `#FFFFFF` | Product surfaces and form fields |
| `muted` | `#52635B` | Supporting text on light surfaces |
| `inverse-muted` | `#B9CEC3` | Supporting text on deep green |
| `border` | `#D9E2DC` | Decorative dividers and surface separation |

Implement semantic CSS custom properties using HSL. Keep the hex references for review. Add separate accessible focus, error, and success tokens during implementation. Errors always include explanatory text; color is supplementary.

Calculated contrast ratios: white on forest 7.83:1; paper on deep green 12.61:1; ink on paper 15.65:1; muted on paper 5.98:1; inverse-muted on deep green 8.11:1; forest on paper 7.35:1. Verify final combinations after states and photographic overlays are added. The decorative border color is not the sole indicator of an interactive control.

### Typography and layout

- Text wordmark in Cyrillic, oversized and bold, with carefully adjusted spacing. Use a readable licensed Cyrillic family; evaluate Geologica for display and Golos Text for body text, which are used on the brief site. Verify family files and licenses before inclusion.
- Give the wordmark a strong horizontal presence; do not distort letter shapes to imitate another company's logo.
- Body 16–18 px; small metadata 14 px; mobile headings around 32–40 px; desktop headings around 56–72 px. The wordmark has its own responsive scale.
- Use body line-height around 1.5 and tight display line-height. Long text is left-aligned.
- Desktop content width approximately 1280 px, outer gutters 32–48 px. Mobile gutters 16–20 px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Card radii: 12 and 16 px. Buttons can use pill shapes.
- Favor surface contrast and generous spacing over decorative shadows.
- One primary action per local decision area. Related secondary actions receive quieter styling.

## 4. Information architecture and component boundaries

One public landing page with stable anchors: `#coffee`, `#subscription`, `#roastery`, `#delivery`, and `#request`. Primary navigation exposes four sections: coffee, subscription, workshop, delivery. Form CTAs remain visible in relevant sections.

Static sections should render as server components. Interactive selection, the form, and attribution capture use small client components. Keep products and factual content in one typed source of truth.

Planned decomposition:

| File or component | Responsibility |
| --- | --- |
| `src/app/layout.tsx` | Fonts, site metadata, language, global layout |
| `src/app/page.tsx` | Section composition and static content |
| `src/app/globals.css` | Semantic palette, spacing, typography, focus, reduced motion |
| `src/components/site-header.tsx` | Wordmark, navigation, mobile disclosure if needed |
| `src/components/hero.tsx` | Primary message and hero photograph |
| `src/components/roast-schedule.tsx` | Thursday and Friday rhythm |
| `src/components/coffee-section.tsx` | Four product cards |
| `src/components/subscription-section.tsx` | Monthly offer and process |
| `src/components/roastery-section.tsx` | Founders, small batches, freshness |
| `src/components/delivery-section.tsx` | Delivery, collection, hours |
| `src/components/lead-flow.tsx` | Shared selection state and attribution capture |
| `src/components/lead-form.tsx` | Fields, validation, submit states, recovery |
| `src/components/site-footer.tsx` | Brand, address, navigation, contact entry point |
| `src/content/coffee.ts` | Typed product data and offer facts |
| `src/lib/lead-validation.ts` | Shared input schema and phone normalization |
| `src/lib/attribution.ts` | Allowlisted campaign capture and sanitization |
| `src/lib/lead-repository.ts` | Server-only persistence and duplicate transactions |
| `src/app/api/lead/route.ts` | HTTP handling and safe response mapping |
| `db/migrations/001-create-leads.sql` | Database schema and indexes |

Keep this decomposition pragmatic: adjacent static sections may share a file if splitting adds little value. Avoid a large general-purpose design-system dependency for a single page.

## 5. Section-by-section implementation

### 5.1 Header and wordmark

**Purpose:** establish a distinctive small-roastery identity immediately.

- Set a very large green wordmark on the paper surface, accompanied by a small Minsk/since-2019 descriptor.
- Place four clear anchor links beneath or alongside it. Add a quieter request shortcut where space permits.
- On mobile, reduce the wordmark so it does not consume the entire first screen. Use visible concise links if they fit; otherwise a labeled menu button with a simple accessible disclosure.
- If navigation is sticky, keep only a compact bar during scroll. Account for its height with anchor scroll margins.
- Support keyboard focus, Escape to close a disclosure, and clear expanded state. Do not create a navigation trap.

**Acceptance:** brand remains legible at 320 px; navigation reaches the correct section; no horizontal overflow; focused controls are visible.

### 5.2 Hero

**Purpose:** explain the weekly proposition and move the visitor toward a choice.

- Use the approved customer-facing idea: roast on Thursday, deliver on Friday. Supporting copy states batches of 5 kg and arrival 1–3 days after roasting.
- Desktop: asymmetrical text/photo composition, with a smaller offer or schedule panel alongside. Mobile: message, CTA, then photograph/supporting panel.
- Place the beans macro in a dedicated image panel rather than behind dense text.
- Primary CTA navigates to coffee. A quieter subscription shortcut selects subscription and brings the visitor to the request form or subscription explanation, consistently with its label.
- Prioritize only the image that materially occupies the first screen. Reserve its aspect ratio to prevent layout shift.

**Acceptance:** the first mobile view shows a meaningful proposition and action; copy is readable with images disabled; the real image crop has been reviewed.

### 5.3 Weekly rhythm

**Purpose:** make freshness tangible and memorable.

- Two connected panels: Thursday roasting and Friday delivery, with concise explanatory text.
- Repeat day abbreviations as a brand detail, always accompanied by complete readable day names.
- Use the actual schedule rather than a countdown or a fabricated limited-stock message.
- If dates are added later, derive them for Minsk time and define the ordering cutoff first. The MVP uses weekday labels only.

**Acceptance:** schedule agrees with every other page reference; no misleading countdown or unspecified delivery promise.

### 5.4 Coffee selection

**Purpose:** let a non-expert choose among four products quickly.

| ID | Product | Supplied description | Size | Price |
| --- | --- | --- | --- | --- |
| `ethiopia-yirgacheffe` | Ethiopia Yirgacheffe | Floral, bergamot; light roast | 250 g | 32 BYN |
| `colombia-huila` | Colombia Huila | Caramel, red apple | 250 g | 29 BYN |
| `brazil-cerrado` | Brazil Cerrado | Nuts, chocolate; for espresso | 250 g | 26 BYN |
| `drip-assortment` | Assorted drip bags | Assortment | 10 bags | 18 BYN |

- Three origin pouches share a photographic system but have distinct labels. Drips have a different appropriate image.
- Every card exposes name, taste, size, price, and a visible selection button. Do not invent acidity scores, roast profiles, reviews, or stock levels.
- Use a readable four-card grid at desktop widths and a one-column or well-tested two-column layout on narrow screens. Core options remain available through normal vertical scrolling.
- Selection sets interest to `one_time`, stores the product ID, updates a visible form selection summary, and scrolls to `#request`.
- Keep selection separate from the editable comment; selecting another product must not erase typed user text.
- Allow the selection to be changed or cleared without losing name, phone, or comment.

**Acceptance:** all four products and exact prices are present; every CTA selects the correct product; text remains readable at 320 px; no hover-only action.

### 5.5 Subscription

**Purpose:** explain the recurring offer with a stronger editorial moment.

- Create a broad deep-green section with a large headline, 54 BYN per month, and the exact offer: two 250 g packs monthly, delivery included.
- Pair the offer with the foam macro or a rebranded pouch photograph.
- Show three concise steps: submit a request, agree details with the manager, receive coffee monthly.
- Add only facts supported by the brief. Do not promise automatic cancellation, payment terms, a fixed monthly date, or a financial saving over every possible one-time combination.
- CTA selects `subscription`, clears an incompatible one-time product selection, preserves user-entered contact data, and scrolls to the same request form.

**Acceptance:** quantity, frequency, price, and delivery are visible together; the CTA selects subscription; no unsupported conditions.

### 5.6 Workshop and freshness

**Purpose:** give the brand a human reason to exist.

- Short story: Anya and Dmitry previously worked as baristas; their Minsk workshop has roasted in 5 kg batches since 2019.
- Explain freshness in ordinary language, connecting the roasting schedule to the supplied 1–3 day arrival window.
- Use a process photograph with hands/equipment and a concise caption. Stock people must not be identified as the founders.
- Alternate text and photography to vary the scroll rhythm; retain a sensible reading order on mobile.
- Avoid unsourced health claims, awards, certifications, testimonials, invented sourcing relationships, and guarantees.

**Acceptance:** all supplied facts are accurate; text is short enough to scan; imagery is licensed or generated with its provenance recorded.

### 5.7 Delivery and pickup

**Purpose:** answer practical questions before the request.

- Two contrasting panels: Friday delivery around Minsk and collection at Korolya Street, 9.
- Delivery is free from 50 BYN; subscription delivery is included independently of that threshold.
- Pickup hours: weekdays 08:00–20:00, weekends 10:00–18:00.
- Fee below 50 BYN, order cutoff, and delivery times are unspecified. State that the manager confirms those details.
- Prefer text address and a verified external map link over a heavy embedded map. Do not use a guessed map pin.

**Acceptance:** address, both hour ranges, delivery day, and threshold match the brief; no fabricated delivery fee or cutoff.

### 5.8 Request form and contact area

**Purpose:** complete the conversion on one page.

- Fields: name, Belarusian phone, interest (`subscription`, `one_time`, `question`), optional comment, and a read-only selected-product summary when relevant.
- Required fields are name, phone, and interest. Keep comments optional.
- Show permanent labels, an example phone format, and native appropriate input/autocomplete attributes.
- Accept ordinary spacing and punctuation; do not split the number into separate country/operator fields or force a fragile typing mask.
- Validate incomplete/invalid fields after blur or submission. Move focus to the first invalid field on failed validation, preserving entered values.
- Interest is one accessible radio group; use visually selectable options with explicit text labels.
- State model: `idle`, `submitting`, `success`, `duplicate`, `error`. Treat selection as separate data.
- Disable submission while a request is in progress and show sending feedback, but enforce duplicates on the server as well.
- Show inline success only after durable database commit. For an uncertain network outcome, say confirmation failed rather than asserting that nothing was saved; retry safely.
- Duplicate responses say the request has already been received, without revealing another submission's personal data.
- Keep data on recoverable failure and offer a retry. Do not put ordinary status messages in a modal dialog.
- Explain that the manager calls back to complete the order. No unsupported callback deadline.
- Contact information uses the supplied address/hours and request form. Do not fabricate a business phone, email, or social account. Production privacy text/contact details remain a documented assumption requiring real client facts.

**Acceptance:** keyboard operation works; fields are labeled; invalid input is explained; offline/server errors preserve data; repeat clicks and retries do not create another lead within the protected window.

### 5.9 Footer and preview

- Compact wordmark, address, hours, selected anchors, and project-appropriate factual attribution.
- Metadata describes fresh Minsk roasting and requests. Set `lang="ru"` and one semantic `h1`.
- Add favicon, descriptive page title, description, canonical URL when deployment is known, and a 1200 x 630 Open Graph image.
- Do not publish placeholder social links or fake contact methods.

**Acceptance:** metadata points to the actual deployment; preview contains approved imagery and no local URLs.

## 6. Backend and persistence

### Stack and hosting choice

Next.js App Router with a Node.js Route Handler at `POST /api/lead`; TypeScript and a small runtime validation schema; PostgreSQL on Neon's Free plan; Vercel for deployment. Recheck free-plan suitability when connecting the accounts. No paid add-ons are part of this plan.

An external database is necessary for the chosen architecture: Vercel Functions have a read-only filesystem apart from temporary scratch space, so local JSON or local SQLite is not the selected durable lead store. Pin the actual dependency versions and commit a lockfile during scaffolding.

Use a database client that supports interactive transactions on one connection. Do not split a lock, check, and insert across independent stateless HTTP queries.

### Lead contract

Input fields: trimmed name, phone, allowlisted interest, optional product ID, optional comment, allowlisted attribution fields. Suggested limits: name 100 characters, comment 1000, phone input 64, each UTM value 256, URL 2048; cap the request body and reject malformed JSON.

Phone validation uses `libphonenumber-js` with strict validation metadata, default country `BY`, and an explicit country check. Normalize valid input to E.164. A correct length or `+375` prefix alone is insufficient. Accept valid Belarusian fixed-line as well as mobile numbers because the brief does not limit the request to mobile. Validation does not prove that a number is reachable.

Product IDs are checked against the typed catalog. A product selection is compatible with `one_time`; invalid combinations are rejected or normalized under an explicitly documented rule.

Responses:

| HTTP status | Result | UI behavior |
| --- | --- | --- |
| 201 | Created after database commit | Confirm receipt |
| 200 | Duplicate within ten minutes | Confirm that a request was already received |
| 400 | Invalid payload or phone | Display field-level correction guidance |
| 413 | Request too large | Ask for a shorter comment/input |
| 503 | Database or service unavailable | Keep values and offer retry |

Use a typed success/error envelope with machine-readable status and safe field errors. Never return raw database errors, stack traces, credentials, or prior lead details.

### Database schema

One `leads` table: UUID primary key, name, canonical phone, constrained interest, optional product ID, optional comment, UTC creation timestamp, and bounded attribution data. Add a composite index on `(phone, created_at DESC)` for duplicate lookups. Product selection stores a stable ID; optionally snapshot its display name for the manager.

The public application has no lead-listing endpoint. Access lead records through the authenticated database console for the assignment; do not build an admin interface just for this scope. Database credentials remain server-only in environment variables.

### Exact ten-minute duplicate rule

1. Validate and normalize the phone before entering the persistence layer.
2. Start a transaction with a consistent connection and read-committed semantics.
3. Take a PostgreSQL transaction-scoped advisory lock derived deterministically from the canonical phone. All writers use this path; lock collisions may reduce throughput but must not allow duplicates.
4. After acquiring the lock, get the current database time and check for this phone with creation time strictly newer than ten minutes ago.
5. If a row exists, return a duplicate result without another insert.
6. Otherwise insert one lead and commit; only then acknowledge success.

This protects simultaneous requests and separate function instances. Do not use an in-memory set, a client-only disabled button, a permanent unique phone constraint, or ten-minute time buckets. Time buckets fail when two nearby requests straddle a bucket boundary. At ten minutes after the previous stored lead, a new request is permitted.

## 7. Campaign attribution

- At first page entry, capture allowlisted `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term`, the landing URL, referrer, and entry timestamp in a tab-scoped session record.
- Preserve initial campaign values while the visitor navigates anchors. Record the submission URL separately.
- Allowlist URL query parameters rather than storing arbitrary query strings that may contain private data. Referrer policy may remove detail; unavailable attribution is a valid empty state.
- If session storage is unavailable, retain attribution in memory for that visit; submission still works.
- Persist attribution with the lead. Campaign metadata is a reporting hint, not a trusted security input.
- Show the manager structured campaign fields and both page references in the database record. No third-party analytics library is required to satisfy the brief.

**Acceptance:** a visit with test UTM values creates a lead containing each field after anchor navigation; a direct visit stores empty campaign fields without errors.

## 8. Responsive behavior and accessibility

| Width | Layout |
| --- | --- |
| Below 640 px | Single-column story, compact wordmark, visible CTA, stacked form and delivery panels |
| 640–1024 px | Two-column cards where readable; hero can remain stacked |
| Above 1024 px | Asymmetric hero, larger wordmark, four product cards or a considered two-by-two composition |

Validate at 320, 390, 768, and 1440 px. Choose breakpoints by content behavior rather than device brand. Reordering never breaks reading/focus order.

- Touch targets at least 48 px for important actions.
- Visible keyboard focus, semantic landmarks, skip link, one H1, descriptive headings, proper button/link semantics.
- Explicit labels and `aria-describedby` for hints/errors; polite live status for sending/results.
- A selected radio option is distinguished by border/icon/text as well as color.
- Avoid low-contrast text on photographs. Keep most important copy on solid surfaces.
- Respect reduced-motion preference; no autoplay background video or scroll-jacking.
- Honor zoom and long text; avoid fixed-height cards that clip copy.

## 9. Performance and motion

Keep static page rendering and limit client JavaScript to the lead flow. Use CSS Modules and plain CSS transitions. Self-host only necessary font files through the framework's supported font handling. Optimize images and avoid loading maps, chat widgets, or large animation libraries.

Transitions: button feedback, focus, and small selection-state changes, approximately 150–200 ms. Any section entrance effect must leave content visible without JavaScript and turn off for reduced motion.

Target mobile Lighthouse performance of at least 90 as an internal target, not an unmeasured promise. Record the real deployed score and fix material findings. Prevent hero image and font layout shifts; review image loading and actual transferred sizes.

## 10. Verification plan

### Meaningful automated checks

- Phone normalization/validation: valid Belarusian formats, wrong country, invalid operator/area formats, too short/long inputs, separators, and empty values; fixtures must be documented safe test data rather than random personal numbers.
- Persistence integration with an actual disposable PostgreSQL database: simultaneous requests for one canonical phone produce one row; different formatting normalizes to that same phone; duplicate rejection persists across separate app clients; a new request after the exact window succeeds.
- Attribution round-trip: allowlisted campaign values and both page references survive serialization and storage; unknown keys and oversized values are handled.
- API invalid input and database-failure paths produce the intended safe responses.

Do not expose a test reset/cleanup endpoint on the public deployment. Clean only explicitly disposable records in an isolated test database. Do not require a real ten-minute sleep: arrange old database timestamps for the boundary test.

### Browser and deployed checks

- Every navigation and product/subscription CTA has the expected effect.
- Selection changes do not erase an edited comment or contact fields.
- Keyboard focus and validation announcements work.
- Double-click, refresh/retry, timeout, offline, and database-unavailable behavior is understandable and does not create unwanted duplicates.
- Verify successful submission against durable database rows on the actual deployed site, including a visit with UTM values.
- Check all content/price/address facts against the brief, image crops, and screen widths.
- Run production build and the configured type/lint checks once they exist.
- Save a mobile Lighthouse report from the deployed URL and report actual results.

## 11. Milestones and incremental commits

| Milestone | Budget | Output and suggested commit |
| --- | --- | --- |
| Planning (this repository) | Already prepared | `docs: define Kvarta concept and implementation plan` |
| Scaffold and tokens | 25 min | Next.js, strict TypeScript, tokens, font setup, env example; `chore: scaffold Next.js application` |
| Asset preparation | 30 min | Approved crops, label variants, provenance; `design: prepare Kvarta visual assets` |
| Page sections and mobile layout | 100 min | Header, hero, products, subscription, story, delivery; `feat: build responsive coffee landing page` |
| Lead form and selection | 45 min | Accessible fields and recoverable states; `feat: add product selection and lead form` |
| Database and API | 70 min | Schema, validation, transactional duplicates, attribution; `feat: persist attributed leads with duplicate protection` |
| Deployment and verification | 55 min | Vercel/Neon, production checks, meaningful integration tests; `test: verify lead submission and deployment` |
| Submission package | 25 min | OG preview, measured Lighthouse, concise README, real AI evidence; `docs: record validation and submission details` |

Budget totals approximately 350 minutes after planning. Treat estimates as a priority guide; if work runs over, protect the working deployed form and accurate documentation first. Keep commits honest to completed units; do not manufacture history after the fact.

## 12. Optional Telegram integration

Only after core acceptance and only when the user supplies/authorizes the destination bot and chat. Save a lead before attempting a notification. A notification failure must not invalidate a saved lead or cause the visitor to create another one. Send no notification for duplicates. Keep bot tokens server-only. If reliable retry cannot fit the budget, defer this feature and document it.

## 13. Assumptions and exclusions

- No business phone, email, social account, ordering cutoff, fee below threshold, exact subscription calendar, cancellation policy, or guarantees are provided. Do not invent them.
- The manager agrees product selection and operational details after the request.
- Image candidates are not publication-ready until edits and license/source checks are complete.
- No cart, payment, customer account, dashboard, fake reviews, or news feed is required.
- Runtime code, credentials, production deployment, actual test results, and final submission evidence do not yet exist.
- All authored repository materials use English; final customer-facing copy uses Russian under the assignment's audience requirements.

## 14. Technical sources checked during planning

- [Assignment brief](https://tz.vitai.world/).
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers).
- [Vercel Function filesystem support](https://vercel.com/docs/functions/runtimes#file-system-support).
- [Vercel storage overview](https://vercel.com/docs/storage).
- [Neon pricing and Free plan](https://neon.com/pricing).
- [libphonenumber-js validation and metadata documentation](https://github.com/catamphetamine/libphonenumber-js).

Design specification complete. Implementation should follow the approved palette, section behavior, and backend invariants. Record unresolved assumptions and actual verification as work proceeds.
