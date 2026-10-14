# Assets and provenance

## Implemented assets

| File | Source | Role | Status |
| --- | --- | --- | --- |
| `public/images/ethiopia-v2.png` | Built-in image generation and label correction | Ethiopia package | Visually checked; exact origin, taste, and weight |
| `public/images/colombia-v2.png` | Built-in image generation and label correction | Colombia package | Visually checked; invented Moscow/year claims removed |
| `public/images/brazil-v2.png` | Built-in image generation and label correction | Brazil package | Visually checked; invented date/roast claims removed |
| `public/images/drips.png` | Built-in image generation | Box and drip sachet | Visually checked; 10-pack format |
| `public/images/roastery.png` | Built-in image generation | Process illustration | Generated hands/equipment; no person is identified as a founder |
| `public/images/coffee-beans-macro.jpg` | User-supplied photograph | Hero | Source/free-license verification remains before final release |
| `public/images/coffee-foam.jpg` | User-supplied photograph | Subscription | Source/free-license verification remains before final release |
| `public/images/coffee-beans.jpg` | User-supplied photograph | Retained supporting candidate | Not loaded by the current page; source verification remains |
| `src/app/icon.svg` | Authored vector | Favicon | Independently drawn letter mark |
| `src/app/opengraph-image.tsx` | Authored native graphic using Next.js ImageResponse | Social preview | Checked response is a readable 1200 x 630 PNG |

The user's original files remain untouched outside the repository. Discarded first-generation pouch images are not included in the repository. [Image prompts](image-prompts.md) record the final generation/edit instructions.

## Fonts

Geologica Variable and Golos Text Variable are installed through Fontsource and served from the application, without browser requests to Google Fonts. Their license copies are in `public/fonts/licenses/`. Cyrillic and Latin subsets load according to the font CSS's Unicode ranges.

## Delivery

Images use Next.js image optimization, reserved aspect ratios, responsive `sizes`, and lazy loading below the fold. The primary hero image is preloaded. Product images are contained; editorial photographs use intentional cover crops. Package information is also provided as accessible page text.

Do not treat a competitor screenshot as a website asset. Do not claim an unknown stock-photo license is free merely because a file was supplied. Before final public site release, verify the supplied photographs' sources or replace them with licensed/generated equivalents.
