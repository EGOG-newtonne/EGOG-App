# EGOG Design System

Desktop source of truth: Google Stitch project [`7743505434756341094`](https://stitch.withgoogle.com/projects/7743505434756341094), screen `dcbc53f92c1e4e84aec1860d2062f787` (`Vietnam Brick Project - Detail Page`). Mobile source of truth: separate Google Stitch project [`5243059262816675392`](https://stitch.withgoogle.com/projects/5243059262816675392) (`EGOG Mobile`). MCP project, design-system, generation, and screen reads were verified on 2026-07-12 and 2026-07-13.

Design system asset: `696964715bb34170943ab429d912673a` (`Climate Tech Institutional`, version 1).

Mobile design system asset: `5394d7bdd41d4fccaa5d269d30e67850` (`Climate Institutional`). It was generated from the approved desktop system and preserves the same EGOG colors, typography, spacing, component hierarchy, and content guardrails while using a mobile project typed `MOBILE`.

## Direction

- Modern climate technology, light mode only.
- Data trust first; Web3 is supporting evidence rather than the visual identity.
- Desktop Project Detail uses an eight-column data body and four-column sticky participation panel.
- Mobile collapses to one column with a persistent bottom participation action.
- Use the Stitch composition, but replace every fictional source/status/date with the approved Demonstration Seed.

## Tokens

| Token | Value |
| --- | --- |
| Primary | `#006c49` |
| Primary accent | `#10b981` |
| Secondary/link | `#0058be` |
| Surface | `#f8f9fa` |
| Card | `#ffffff` |
| Subtle card | `#f3f4f5` |
| Text | `#191c1d` |
| Muted text | `#3c4a42` |
| Outline | `#bbcabf` |
| Error | `#ba1a1a` |
| Headline | Hanken Grotesk, 600–700 |
| Body | Inter, 400–600 |
| Data label | JetBrains Mono, 500 |
| Base spacing | `8px` |
| Content gap | `24px` |
| Desktop margin | `40px` |
| Mobile margin | `20px` |
| Container | `1280px` |
| Card radius | `12px` |
| Button radius | `12px` or pill |
| Desktop breakpoint | `1024px` for two-column detail |

## Required components

- Header and EGOG wordmark
- Demonstration Data badge
- Project card and Coming Soon state
- KPI card, trend chart, verification timeline, disclosure/table
- On-chain reference panel
- Sticky participation card and mobile bottom CTA
- Stepper, processing, completion, retryable/final failure
- Badge detail, joined/current Snapshot comparison, preference and deletion panels
- Footer with Privacy and Terms

## Content guardrails

- Never label mock figures as verified, issued, actual, or Newtonne-approved.
- `Referenced on GIWA Testnet` means a participation event referenced the hash; it does not mean the dMRV data was verified on-chain.
- Forecast is always separated from monitored reduction.
- The Badge is non-transferable and provides no investment, return, or carbon-credit ownership.

## Stitch inventory and implementation mapping

| Stitch asset | Device / size | Next.js implementation |
| --- | --- | --- |
| `dcbc53f92c1e4e84aec1860d2062f787` — Vietnam Brick Project Detail | Desktop, 1280×2320 | `apps/web/src/app/projects/[slug]/page.tsx`, `apps/web/src/app/styles.css` |
| `6fa41611f268406d86624a7a74f4f64f` — Jeju ERW Project — Overview | Desktop, 1280×2236 CSS px (2× screenshot) | Jeju-only Overview state in `apps/web/src/app/projects/[slug]/page.tsx` |
| `fddddd7c4a0841ef8c47bc0bd83df77e` — Jeju ERW Project — Gallery | Desktop, 1280×2188 CSS px (2× screenshot) | Jeju-only Field Gallery state and URL navigation |
| `09b67d24e2334314a168fb3d39a2ddd8` — Project Discovery | Desktop, 1280×1254 CSS px (2× screenshot) | `apps/web/src/app/page.tsx`, `apps/web/src/components/project-card.tsx` |
| `9106f4e1a0a242ed9380d7342d56c1ea` — Participation Review & Consent | Desktop, 1280×1507 CSS px (2× screenshot) | `apps/web/src/app/participate/[slug]/page.tsx`, participation flow components |
| `d343ee81e4bf4307bed36d02031dabaf` — Participation Complete | Desktop, 1280×1373 CSS px (2× screenshot) | Completion state in `apps/web/src/app/participate/[slug]/page.tsx` |
| `e3f1d81081564fd4baec98b9507865e1` — My Participation | Desktop, 1280×1388 CSS px (2× screenshot) | `apps/web/src/app/me/page.tsx`, participation record and account panels |
| `696964715bb34170943ab429d912673a` — Climate Tech Institutional | Device agnostic | Global colors, typography, spacing, cards, buttons, data labels, Timeline, flow and My Page styles |
| `3757f66c2bac40349523db30a350db6e` — Project Discovery — Mobile — Final | Mobile, 390×1454 CSS px (2× screenshot) | Responsive state of `apps/web/src/app/page.tsx` and project cards |
| `06af01bfe73b4ce0be5c6697f32a506f` — Vietnam Brick Project Detail — Mobile — Final | Mobile, 390×2542 CSS px (2× screenshot) | Responsive Project Detail; safe-area bottom participation CTA |
| `a4e98cd696d54d389a0082ccba9f320d` — Jeju ERW Project — Overview | Mobile, 390×1871 CSS px (2× screenshot) | Responsive Jeju Overview and stacked top-level navigation |
| `fe040b5335134f74b2e568a7b534a7e2` — Jeju ERW Project — Gallery | Mobile, 390×2527 CSS px (2× screenshot) | Responsive Field Gallery, stacked category navigation and bottom CTA |
| `f8f48706ba50419bb01f3587b09736fc` — Participation Review & Consent — Mobile — Production Safe | Mobile, 390×1385 CSS px (2× screenshot) | Responsive participation review; actions in normal document flow |
| `5b1cbc9a703f4589bc0d8331de2eab69` — Participation Complete — Mobile | Mobile, 390×1524 CSS px (2× screenshot) | Responsive completion state |
| `1080089b3fc14b5f9ae4ab5511df9e53` — My Participation — Mobile | Mobile, 390×1694 CSS px (2× screenshot) | Responsive My Participation dashboard |
| `5394d7bdd41d4fccaa5d269d30e67850` — Climate Institutional | Mobile design system | Mobile colors, typography, spacing, components, wrapping and safe-area behavior |

The four new desktop screens were generated on 2026-07-13 with design system
asset `696964715bb34170943ab429d912673a`. The initial My Participation output
contained fictional member and token values; those were removed in Stitch and
replaced with explicit runtime placeholders (`Member #—`, `Token ID —`,
`Joined —`, and a masked wallet).

The desktop Stitch project is typed `DESKTOP`, so the approved mobile strategy
uses a separate `MOBILE` project. Five mobile screens were generated and visually
reviewed at the 390×844 target. Two first-pass screens were rejected: Project
Detail mislabeled a Demonstration metric as `Actual`, and Review placed a sticky
CTA over consent content. The mapped final IDs above replace those drafts. The
final Review displays the complete approved v3 hash and IPFS URI without clipping.

Mobile visual evidence is stored under
`docs/qa/evidence/2026-07-13/stitch-mobile/` using the same numbering as the
mobile rows above.

### Jeju ERW Overview and Gallery states

The Jeju-specific tab composition was generated on 2026-07-27 using the
existing Desktop and Mobile design systems. The generated HTML and screen
captures are preserved under `docs/design/stitch/jeju-tabs/`.

- `/projects/jeju-erw` maps to the approved Overview screens. It keeps the
  shared project context and participation action, then shows Timeline, Source
  Details, and On-chain Snapshot Status without gallery previews.
- `/projects/jeju-erw?tab=gallery&type=field` maps to the approved Gallery
  screens. The Gallery screen is the representative layout and renders the
  four Field evidence files.
- `/projects/jeju-erw?tab=gallery&type=sensor` uses the same approved Gallery
  layout and replaces only the title, description, and four media records with
  the Sensor category. A separate fictional Sensor screen is intentionally not
  maintained.
- Stitch-generated fictional copy, generated imagery, participant identities,
  counts, and hashes are not implementation data. The Next.js UI uses the
  current Production Field Evidence Snapshot v1 and its eight published files.
- URL navigation, query normalization, accessible-current state, image loading,
  and Dialog behavior remain code-owned interaction details. Material visual
  changes must still be made in these Stitch states first.

## Source-of-truth procedure

1. Make material visual-direction changes in the Stitch project first.
2. Keep the approved design system asset attached to every new screen.
3. Record each approved screen ID, device type, and mapped Next.js surface in this file.
4. Implement the approved composition and tokens in Next.js without copying fictional Stitch data.
5. Compare Desktop and mobile Production captures to the corresponding approved Stitch projects and screen IDs.
6. Treat copy, data accuracy, accessibility, and runtime-state fixes as code changes; feed any resulting visual-system change back into Stitch.
