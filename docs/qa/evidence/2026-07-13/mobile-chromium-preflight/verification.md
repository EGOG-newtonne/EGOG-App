# Mobile Chromium Production Preflight

- **Verified:** 2026-07-13 KST
- **Production URL:** `https://egog-app-web.vercel.app`
- **Browser engine:** Local Chromium controlled through the browser automation CLI
- **Viewport:** `390 × 844`
- **Scope:** Responsive layout preflight only; this is not evidence for iPhone
  Safari or Android Chrome engine/device compatibility.

## Checks

| Check | Result | Evidence |
| --- | --- | --- |
| Project Discovery renders at 390 px | PASS | `01-project-discovery.png`, 390 px wide full-page capture. |
| Project Detail renders at 390 px | PASS | `02-project-detail.png`, 390 px wide full-page capture. |
| Horizontal overflow | PASS | Runtime DOM measurement reported viewport width 390 and document width 390; no overflowing elements were found. |
| KPI and provenance cards | PASS | Top and middle viewport captures show single-column cards without horizontal scrolling. |
| Mobile CTA | PASS | The desktop participation panel reduces to the approved bottom CTA card; the top, middle, and bottom viewport captures show the CTA remains available while reading. |
| On-chain detail | PASS | Bottom viewport contains Snapshot reference status, first-reference time, participation count, and public Snapshot link. |
| Privacy and Terms links | PASS | Both links are visible at the bottom of the Project Detail page and present in the accessibility tree. |
| PII/Secret exposure | PASS | Captures contain no Google account email, OAuth token, or server Secret. |

## Captures

- `01-project-discovery.png`
- `02-project-detail.png`
- `03-project-detail-top-viewport.png`
- `04-project-detail-mid-viewport.png`
- `05-project-detail-bottom-viewport.png`

The two full-page captures are 390×2429 and 390×3787 respectively. The three
viewport captures are each 390×844.

## Remaining AC-14 work

This preflight proves that the current Production implementation has no
responsive horizontal overflow at the target viewport. Desktop Edge, iPhone
Safari, and Android Chrome still require their own real login-to-Badge E2E and
captures before AC-14 can be marked PASS.
