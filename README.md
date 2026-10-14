# Kvarta Coffee

A landing page project for a fictional small-batch coffee roastery in Minsk, based on the [assignment brief](https://tz.vitai.world/).

**Status:** planning complete; website implementation has not started. This repository currently contains the implementation specification, palette preview, asset preparation notes, and an AI work log. No live website or working lead endpoint exists yet.

## Direction

**Coffee on your own rhythm:** roasted on Thursday, delivered around Minsk on Friday. The design combines the assignment's deep green palette with Camera Obscura's oversized wordmark, assertive typography, and photographic composition.

## Documents

- [Detailed implementation plan](docs/implementation-plan.md): each section, behavior, backend, milestones, and acceptance checks.
- [Design palette](docs/palette.svg): color roles and accessible combinations.
- [Asset preparation](docs/assets.md): selected photographs, required edits, and source verification.
- [AI work log](docs/ai-work-log.md): an honest record of assistance and decisions; it does not replace the requested full session export or key screenshots.

## Planned stack

Next.js App Router, TypeScript, CSS Modules with shared design tokens, PostgreSQL on Neon, and Vercel. Persisted database transactions will enforce the ten-minute duplicate rule across simultaneous requests and function instances.

Repository code, identifiers, comments, commits, and documentation are in English. Customer-facing content will be in Russian for the audience described in the brief.

## Delivery checklist

- [ ] Responsive landing page with all assignment content.
- [ ] Working deployed `POST /api/lead` with Belarusian phone validation.
- [ ] Database-backed duplicate prevention, attribution, and understandable failure states.
- [ ] Step-by-step commits, actual AI session evidence, and mobile Lighthouse report.
- [ ] Final half-page README documenting contributions, assumptions, mistakes, and unfinished work.

The final submission deadline is October 19, 2026, at 18:00 Moscow time.
