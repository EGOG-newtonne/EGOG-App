# EGOG Design System

Source of truth: Google Stitch project `7743505434756341094`, screen `dcbc53f92c1e4e84aec1860d2062f787` (`Vietnam Brick Project - Detail Page`). MCP `get_project`, `list_screens`, and `get_screen` were verified on 2026-07-12.

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
