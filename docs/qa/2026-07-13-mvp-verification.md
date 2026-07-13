# EGOG MVP Verification — 2026-07-13 KST

This is the evidence ledger for the frozen MVP Scope. A check is `PASS` only
when direct runtime or automated evidence exists. The final submission video is
complete; the remaining partial acceptance work is isolated to AC-14.

## Environment under test

| Item | Verified value |
| --- | --- |
| Production origin | `https://egog-app-web.vercel.app` |
| Production deployment | `dpl_AHFHo5ScjkNMka78GU4fKJ5WaLkV` |
| Immutable deployment URL | `https://egog-app-qwetaohcx-jewelcoredots-projects.vercel.app` |
| Supabase Demo project | `EGOG Demo` (`zxruwjprnubdgiqmsnzi`) |
| GIWA network | GIWA Sepolia, chain ID `91342` |
| Demo contract | `0xf06aDA399160D208D3629EBeEAAF628266BE23A6` |
| Admin wallet | `0x9e4CE65D4a03a9b4f0b6CA4B2AC6d5ab98dF1Bb8` |
| Relayer wallet | `0x5256FD2BB9d34d9a02103cb2AEC2458356aCED1a` |
| Current Production participation count | `7` on GIWA and `7` on Project Discovery/Detail |
| Current Snapshot | Vietnam Brick v3, hash `0xb984ab96e9f8a4e869f717b0a72b350ba0f933c41f4f2bb7ba6ca242c379bb66` |
| Snapshot URI | `ipfs://bafkreida2iinclg7drtcqkpu7e67w5leo747d5jsiguukbacg3b5mmygba` |

The prior Demo project, contract, Snapshot CIDs, and Badge #1 were not deleted.
They are frozen separately in [legacy-demo-2026-07-13.md](./legacy-demo-2026-07-13.md).

## Acceptance Criteria

### AC-01 — Public project discovery

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production, Desktop Chrome
- **Method:** Opened Production while signed out, inspected all three project cards, and entered Vietnam Brick Detail.
- **Actual result:** Vietnam Brick is active; Solar Mobility and Jeju ERW are visible as Coming Soon.
- **Evidence:** [Project Discovery with five participants](./evidence/2026-07-13/final-video/project-discovery-5.png), [Project Detail with five participants](./evidence/2026-07-13/final-video/project-detail-5.png).
- **Remaining limitations:** The equivalent mobile-browser matrix is tracked in AC-14.

### AC-02 — Demonstration data and Snapshot history

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production UI, Supabase Demo, S3, Pinata IPFS
- **Method:** Compared the v1-v3 seed, DB rows, canonical hashes, S3 objects, IPFS JSON, chart, source details, and Verification Timeline.
- **Actual result:** v1-v3 are ordered naturally; v3 uses `measuredAt=2026-07-12T00:00:00Z` and `publishedAt=2026-07-12T09:00:00Z`. The first new-contract participation occurred afterward at `2026-07-13T02:25:20Z`. Demonstration labels remain visible.
- **Evidence:** v1 hash `0x0e895826bf564d063490dd799c94199f173ccf9f3f3a53e95969443ea1dd1b5d`; v2 hash `0x0a5b2f95138a22aa71653d9da59c4adfd3e435aa7b3b60e6de86dc6bced305d2`; v3 hash and URI in the environment table; Project Detail screenshot above.
- **Remaining limitations:** Values remain fictional Demonstration Data pending Newtonne data.

### AC-03 — Google login and embedded wallet

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production, Privy Google login, Desktop Chrome
- **Method:** Completed Google OAuth with five independent Privy embedded wallets.
- **Actual result:** The participation flow showed the shortened wallet address and required no browser wallet extension.
- **Evidence:** The five wallet/transaction pairs are listed in AC-07 and AC-15.
- **Remaining limitations:** None for the frozen MVP behavior.

### AC-04 — Required and optional consent separation

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production UI and Supabase Demo
- **Method:** Performed real Production participation with email opt-in OFF for Badge #3 and ON for Badge #4, then joined `participation_requests` to confirmed `participations`.
- **Actual result:** Both rows have `required_consent_at`; Badge #3 has `email_opt_in=false` and no opt-in timestamp; Badge #4 has `email_opt_in=true` and a timestamp. Both minted successfully. `ParticipationRecorded` contains no email or consent fields.
- **Evidence:** [Opt-out consent](./evidence/2026-07-13/desktop-chrome/03-consent-off-before-sign.png), [Opt-in consent](./evidence/2026-07-13/desktop-chrome/08-consent-on-before-sign.png), [Opt-in My Page](./evidence/2026-07-13/desktop-chrome/11-my-participation-opt-in.png); transactions `0x8ed88932fd6d46d3d8750025ed5be1267759afbe7e69bd9058eb8c476b34e306` and `0x514613772857bce7d9059361d2198fedb5209ff605ce01ac3b28e78d29297c2c`.
- **Remaining limitations:** None for the frozen MVP behavior.

### AC-05 — Gas-free EIP-712 participation

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production, Privy, GIWA Sepolia
- **Method:** Reviewed the typed payload and signed using each embedded wallet.
- **Actual result:** Domain name `EGOG Participation`, version `1`, chain ID `91342`, current Demo contract, one-time nonce, and ten-minute deadline were shown. The Relayer paid gas; no Faucet step was needed.
- **Evidence:** [EIP-712 signature](./evidence/2026-07-13/desktop-chrome/04-eip712-signature.png); all five confirmed Production transactions in AC-07.
- **Remaining limitations:** The opt-in signature screenshot will be refreshed during final video capture; the transaction itself is fully verified.

### AC-06 — Relayer-only submission and one-block confirmation

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Demo contract and Production UI
- **Method:** Read AccessControl roles, simulated `joinBySig()` from an unauthorized account, and completed five real submissions.
- **Actual result:** Admin has Admin only; Relayer has Relayer only; unauthorized submission reverts with `AccessControlUnauthorizedAccount`; the UI showed Confirmed only after a successful receipt.
- **Evidence:** Admin and Relayer addresses in the environment table; completion screenshot [Badge #1](./evidence/2026-07-13/desktop-chrome/05-participation-complete.png); every transaction in AC-07 was submitted by the Relayer.
- **Remaining limitations:** None for the current deployment.

### AC-07 — ParticipationRecorded event integrity

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** GIWA Sepolia, Supabase Demo, Production UI
- **Method:** Decoded all seven Production receipts with the deployed ABI. The original five acceptance records were compared across event, DB, completion, and My Page. The final video record, Badge #7, was separately compared across its event, completion page, My Participation page, Project Detail count, Explorer, and public Snapshot.
- **Actual result:** All decoded event fields match their corresponding chain receipts. The event includes no email, Google profile, or consent data.

| Shared event field | Value for Badges #1–#7 |
| --- | --- |
| project ID | `0x1e7fc9065358e5dc6efa1097f171dcee735339d3ac39c01184dd238549741fe1` |
| snapshot hash | `0xb984ab96e9f8a4e869f717b0a72b350ba0f933c41f4f2bb7ba6ca242c379bb66` |
| snapshot version | `3` |
| snapshot URI | `ipfs://bafkreida2iinclg7drtcqkpu7e67w5leo747d5jsiguukbacg3b5mmygba` |

| Badge | Participant wallet | Token ID | Member number | Joined at | Transaction hash | Block |
| ---: | --- | ---: | ---: | --- | --- | ---: |
| 1 | `0x759984296C272853Af96e589CEf414470726C954` | 1 | 1 | `2026-07-13T02:25:20Z` | `0x45389de1ca5a9284d0a642e59913ed6ac345415486a05b4b291084a03721b468` | 30564404 |
| 2 | `0xA5dfaDF435EFA5c0b7388C61aA91e7AebAE9BcFE` | 2 | 2 | `2026-07-13T02:43:37Z` | `0x34b5e0d0ff8e54397685fe487d1dd2ae259847070e63d2995782d82b56a47544` | 30565501 |
| 3 | `0xFD80B37ee01c578D8aFE408B93818b5B48c2ECAe` | 3 | 3 | `2026-07-13T07:12:27Z` | `0x8ed88932fd6d46d3d8750025ed5be1267759afbe7e69bd9058eb8c476b34e306` | 30581631 |
| 4 | `0x8168cE37b8f09437638Da9f839a1aD866a26dfD2` | 4 | 4 | `2026-07-13T07:15:33Z` | `0x514613772857bce7d9059361d2198fedb5209ff605ce01ac3b28e78d29297c2c` | 30581817 |
| 5 | `0x1F6b92Af0A1212c8477B3a033C09943863f34A3e` | 5 | 5 | `2026-07-13T07:16:52Z` | `0xcb49eeb7107f0b72620d693c8e6d2cf199a3e4aee5662b0388cb1139fe287f82` | 30581896 |
| 6 | `0xDF8fe9980590D14f449728273C38DF043B9A1DF7` | 6 | 6 | `2026-07-13T08:46:42Z` | `0x9d60da0a2c764f0f2cbd14cb56fa310ec004f491022e732887eeec2f64f42ed8` | 30587286 |
| 7 | `0x1AB0ab3A3A43956C501929F808dd5e220dd04721` | 7 | 7 | `2026-07-13T09:11:44Z` | `0x305d60419871d9b7ab2e133a5bd5541cc90485b7b2fa6db202ead4434152457c` | 30588788 |

- **Evidence:** GIWA receipts, Supabase acceptance rows, [Explorer transaction](./evidence/2026-07-13/public-proof/01-giwa-transaction.png), [Badge #7 decoded event](./evidence/2026-07-13/final-video-v3/participation-event-7.json), [Badge #7 completion](./evidence/2026-07-13/final-video-v3/06-participation-complete-7.png), and [Badge #7 My Participation](./evidence/2026-07-13/final-video-v3/07-my-participation-7.png).
- **Remaining limitations:** None for the verified events.

### AC-08 — IPFS metadata and Badge image

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Pinata public IPFS and AWS S3
- **Method:** Resolved all five token URIs and the shared image URI over the public gateway; checked corresponding S3 objects with `head-object`.
- **Actual result:** Snapshot JSON, shared SVG, and per-token metadata are available for Badges #1–#5.
- **Evidence:** S3 keys `badges/common/egog-participation-badge.svg`, `badges/vietnam-brick/1.json` through `5.json`, and all three corrected public Snapshot objects returned valid object metadata.
- **Remaining limitations:** IPFS availability depends on continued pinning; S3 remains the backup copy.

### AC-09 — Duplicate and soulbound protections

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Hardhat automated contract tests and deployed contract reads
- **Method:** Ran duplicate, replay, transfer, approval, burn, pause, role, signer, expiry, and tampering scenarios.
- **Actual result:** Project/wallet duplicates and all ERC-721 transfer/approval/burn paths are blocked; ERC-5192 remains locked.
- **Evidence:** `pnpm test:contracts`, 11 contract scenarios plus 3 deployment-target regression tests, 14 total passing tests.
- **Remaining limitations:** None for the automated contract behavior covered here.

### AC-10 — Completion and My Page verification links

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production, Desktop Chrome
- **Method:** Opened completion and My Page after real mints, including the final pre-issued Badge sequence.
- **Actual result:** Member number, token ID, transaction, wallet, joined Snapshot, latest Snapshot, metadata, Snapshot JSON, and Explorer links were available and matched DB/event values.
- **Evidence:** [Badge #1 completion](./evidence/2026-07-13/desktop-chrome/05-participation-complete.png), [Badge #1 My Page](./evidence/2026-07-13/desktop-chrome/06-my-participation.png), [Badge #1 GIWA Explorer](./evidence/2026-07-13/final-video/giwa-transaction-badge-1.png), [Badge #2 My Page](./evidence/2026-07-13/desktop-chrome/11-my-participation-opt-in.png).
- **Remaining limitations:** None for Desktop Chrome.

### AC-11 — Missed-event recovery and idempotency

- **Status:** PASS
- **Verified:** 2026-07-13 16:35 KST
- **Environment:** Supabase `pg_cron` + `pg_net`, Production API, manual CLI
- **Method:** Ran normal immediate reconciliation, two consecutive `pnpm sync:onchain` calls, subsequent scheduled Supabase Cron cycles, and a final read-only Supabase table inspection after Badge #7.
- **Actual result:** The manual idempotency run imported one previously unsynced event and the immediate repeat imported zero. Scheduled Cron requests returned 200. After Badge #7, the chain counter, project cache, Participation rows, and unique on-chain events are all `7`; the sync cursor advanced to block `30589884`, beyond the latest mint block `30588788`.
- **Evidence:** Cron job `egog-onchain-sync-recovery` on `*/10 * * * *`; unique constraint `onchain_events_tx_log_unique`; manual output `events=1` then `events=0`; [seven Participation rows](./evidence/2026-07-13/final-video-v3/12-supabase-participations-7.png), [project cache 7](./evidence/2026-07-13/final-video-v3/13-supabase-project-cache-7.png), [seven unique on-chain events](./evidence/2026-07-13/final-video-v3/14-supabase-onchain-events-7.png), and [sync cursor 30589884](./evidence/2026-07-13/final-video-v3/15-supabase-sync-state-7.png).
- **Remaining limitations:** Recovery relies on the Vault URL and Bearer secret remaining synchronized with Vercel.

### AC-12 — Account deletion

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production UI, disposable Google account, Privy, Supabase Demo, GIWA Sepolia
- **Method:** Minted Badge #5, reviewed the irreversible-access warning, confirmed Delete Account, inspected the anonymized DB state, checked the public on-chain record, and logged in again with the same Google account.
- **Actual result:** Email, Privy user link, and opt-in data were removed; `deleted_at` was set; the Participation `user_id` was cleared. The Privy deletion request succeeded and signed the browser out. Badge #5 and its transaction remain public. Re-login created a different embedded wallet and did not restore the prior Badge, matching the documented no-recovery guarantee.
- **Evidence:** Badge #5 transaction `0xcb49eeb7107f0b72620d693c8e6d2cf199a3e4aee5662b0388cb1139fe287f82`; DB post-check flags `emailRemoved`, `privyLinkRemoved`, `optInRemoved`, `deletedAtSet`, and `participationUnlinked` all true; old wallet `0x1F6b…34A3e`, post-delete wallet `0xDF8f…1DF7`.
- **Remaining limitations:** The public on-chain wallet, event, and Badge are intentionally immutable.

### AC-13 — Public Privacy and Terms

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production
- **Method:** Opened `/privacy` and `/terms` and inspected the footer/participation links.
- **Actual result:** Both pages are public and describe Demonstration Data, non-financial/non-carbon rights, third-party processors, account deletion, and immutable blockchain records under the EGOG brand.
- **Evidence:** Production HTTP 200 and source pages `apps/web/src/app/privacy/page.tsx`, `apps/web/src/app/terms/page.tsx`.
- **Remaining limitations:** Formal legal review remains outside MVP Scope.

### AC-14 — Cross-browser core path

- **Status:** PARTIAL
- **Verified:** Desktop Chrome PASS and 390×844 Chromium responsive preflight PASS on 2026-07-13 KST
- **Environment:** Desktop Chrome on macOS; local Chromium at a 390×844 viewport
- **Method:** Completed Google login, consent, EIP-712 signature, mint, completion, and My Page in Desktop Chrome. Separately measured the mobile Production DOM, checked horizontal overflow and accessibility links, and captured Discovery plus the top/middle/bottom Project Detail states at 390×844.
- **Actual result:** Desktop Chrome passes. The mobile Chromium preflight has no horizontal overflow and retains the bottom CTA, KPI/data cards, public Snapshot detail, Privacy, and Terms links. Microsoft Edge is not installed locally. iOS Simulator runtimes and available iPhone devices are installed, but the required Safari login-to-Badge run has not yet been performed. No Android emulator/AVD or BrowserStack configuration is currently available.
- **Evidence:** Desktop Chrome evidence folder `docs/qa/evidence/2026-07-13/desktop-chrome/`; [mobile Chromium preflight](./evidence/2026-07-13/mobile-chromium-preflight/verification.md).
- **Remaining limitations:** Desktop Edge, iPhone Safari, and Android Chrome must run the same real core path with captures before PASS.

### AC-15 — Five to ten real pre-issued Demo Badges

- **Status:** PASS
- **Verified:** 2026-07-13 KST
- **Environment:** Production, new Demo contract and DB
- **Method:** Issued real Badges from independent Google/Privy wallets and reconciled chain, cache, rows, and UI.
- **Actual result:** The five-account acceptance baseline was completed without a fake participant count. Two later real Production records used for account-deletion follow-up and the final video brought the current on-chain and Production UI count to `7`.
- **Evidence:** AC-07 event table. Account aliases used for the five-account acceptance baseline were `jsjs21`, `biz`, `coredot`, `newtonne`, and the disposable `korea` account. The final video uses the separately decoded Badge #7 event.
- **Remaining limitations:** None for the frozen 5–10 pre-issuance criterion.

## P0 corrections

| Check | Status | Evidence |
| --- | --- | --- |
| Legacy brand spelling to `EGOG` source/UI/docs sweep | PASS | Case-insensitive active-source scan excluding dependencies/build artifacts returned zero legacy-brand matches. Deployed contract is named `EGOG Participation Badge`; all five new metadata objects say EGOG. [Brand audit evidence](./evidence/2026-07-13/brand-audit/verification.md) lists immutable assets and Legacy isolation policy. |
| Snapshot chronology | PASS | Corrected v1-v3 seeded into a new Demo DB; new v3 publication precedes all five new-contract participations. Old JSON/hash/CIDs remain unchanged. |
| Participant pluralization | PASS | Shared `pluralize` utility covers 0, 1, and plural values; Project card/detail use it. |
| Verification Timeline duplicate numbers | PASS | Decorative number span is `aria-hidden`; DOM/accessibility regression test verifies each stage label is read once. |

## Operations and security evidence

| Check | Status | Evidence / limitation |
| --- | --- | --- |
| Snapshot, Badge image, metadata S3 backups | PASS | Corrected v1-v3 objects, shared SVG, and Badge #1–#5 JSON return valid `head-object` metadata. |
| Admin and Relayer separation | PASS | Admin has only Admin; Relayer has only Relayer. Addresses are listed above. |
| Relayer-only `joinBySig()` | PASS | Unauthorized simulation reverts with `AccessControlUnauthorizedAccount`. |
| User rate limit | PASS | Production returned a blocked response; [capture](./evidence/2026-07-13/desktop-chrome/07-user-rate-limit.png). |
| Wallet, IP, Global rate limits | PARTIAL | Independent limiter tests now prove USER/WALLET/IP/GLOBAL block decisions and persisted reasons. Challenge API tests prove all four return HTTP 429; Submit API tests prove USER/WALLET/IP return HTTP 429. Production blocked-response evidence for Wallet, IP, and Global remains required without changing thresholds or mixing controlled events with real participation data. |
| Secret/PII log exposure | PASS | Queried the last 24 hours of Production Vercel logs (up to 1,000 entries per query) for Google/company email domains and `DATABASE_URL`, `RELAYER_PRIVATE_KEY`, `PRIVY_APP_SECRET`, `PINATA_JWT`, and `ONCHAIN_SYNC_SECRET`; every query returned zero entries. Repository and admitted browser evidence also contain no committed Secret or Google email. |
| Cron/manual sync deduplication | PASS | Manual import `1`, immediate repeat `0`, scheduled Cron HTTP responses `200`; final chain/cache/Participation/event counts all `7`, with one DB row per transaction/log key. |
| Supabase Cron Bearer protection | PASS | Missing/invalid Authorization returns 401; Vault-backed scheduled request returns 200. |

## Google Stitch evidence

- **Status:** PARTIAL
- Desktop project: `7743505434756341094` — `EGOG Climate Participation Portal`; design system `696964715bb34170943ab429d912673a` — `Climate Tech Institutional`.
- Mobile project: `5243059262816675392` — `EGOG Mobile`; design system `5394d7bdd41d4fccaa5d269d30e67850` — `Climate Institutional`, typed `MOBILE`.
- Desktop screens:
  - `dcbc53f92c1e4e84aec1860d2062f787` — Vietnam Brick Project Detail.
  - `09b67d24e2334314a168fb3d39a2ddd8` — Project Discovery.
  - `9106f4e1a0a242ed9380d7342d56c1ea` — Participation Review & Consent.
  - `d343ee81e4bf4307bed36d02031dabaf` — Participation Complete.
  - `e3f1d81081564fd4baec98b9507865e1` — My Participation; fictional runtime values from the first generation were removed and replaced with explicit placeholders.
- Source-of-truth tokens and maintenance procedure: [EGOG_DESIGN.md](../design/EGOG_DESIGN.md).
- Visual evidence: [Project Discovery](./evidence/2026-07-13/stitch/01-project-discovery-desktop.png) and [Participation Complete](./evidence/2026-07-13/stitch/03-participation-complete-desktop.png). The generated Review and My Participation thumbnails were intentionally excluded because Stitch's downloadable thumbnails remained stale after the MCP DOM corrections and still contained pre-correction fictional values.
- Correction evidence: MCP edit session `12832351782920990528` replaced the Review hash and IPFS target with the approved v3 values; edit session `17865908569471919040` replaced My Participation wallet/member/token/joined/email state with explicit runtime placeholders.
- Mobile screen IDs: Project Discovery `3757f66c2bac40349523db30a350db6e`; Project Detail `06af01bfe73b4ce0be5c6697f32a506f`; Review & Consent `f8f48706ba50419bb01f3587b09736fc`; Complete `5b1cbc9a703f4589bc0d8331de2eab69`; My Participation `1080089b3fc14b5f9ae4ab5511df9e53`.
- Mobile visual evidence: [Discovery](./evidence/2026-07-13/stitch-mobile/01-project-discovery.png), [Detail](./evidence/2026-07-13/stitch-mobile/02-project-detail.png), [Review](./evidence/2026-07-13/stitch-mobile/03-review-consent.png), [Complete](./evidence/2026-07-13/stitch-mobile/04-complete.png), and [My Participation](./evidence/2026-07-13/stitch-mobile/05-my-participation.png).
- Applied code: `apps/web/src/app/styles.css`, Project Detail components, data cards, Timeline, participation panel, flow, and My Page.
- Remaining limitation: The mobile Stitch source is complete and visually reviewed. This section remains PARTIAL until iPhone Safari and Android Chrome Production captures prove the implemented responsive pages match the approved screens and core flow.

## Automated quality gates

The 2026-07-13 post-remediation rerun passed ESLint, TypeScript, Vitest (27
files, 93 tests), Hardhat (11 contract scenarios plus 3 deployment-target
tests), contract coverage (93.94% lines, 91.11% statements), the isolated local
deployment dry-run, the Next.js Production build, and `verify:demo`. The
approved scoped resolutions are `undici@6.27.0` under
`@actions/http-client@2.2.3` and `lodash-es@4.18.1` under
`@nomicfoundation/ignition-core@3.1.8`. The final audit has 0 high and 0
critical findings; the Production dependency audit reports no known
vulnerabilities. Exact dependency trees, lockfile effects, the clean
`NPM_CONFIG_FORCE=false` rerun, and remaining low/moderate findings are recorded
in [dependency-audit-2026-07-13.md](./dependency-audit-2026-07-13.md). The
user-level `force=true` npm setting was removed with approval before the final
direct, uncached workspace checks.

The final rerun logs are stored under
`docs/qa/evidence/2026-07-13/final-gates/`. The Production-environment
`verify:demo` result is `PASS` with 3 projects, 3 Snapshots, Snapshot v3,
contract `0xf06aDA399160D208D3629EBeEAAF628266BE23A6`, and member count `5`.
After the two later real records, a post-capture local rerun could not receive
Vercel's encrypted `DATABASE_URL` through CLI 55 `env run` or `env pull`; the
ignored temporary env file was deleted immediately. Current state was instead
reverified without mutation in the logged-in Supabase Demo Table Editor and on
GIWA: project cache `7`, Participation rows `7`, unique event rows `7`, chain
transactions `7`, and sync cursor `30589884` beyond Badge #7 block `30588788`.

The same verification cycle also restored the existing `0000`–`0002` Drizzle
migration history without replaying schema SQL. The transaction inserted only
the three exact repository hashes/timestamps; all application row counts and
the catalog fingerprint remained unchanged. The reusable procedure and
Production redeploy evidence are recorded in
[the Baseline evidence](./evidence/2026-07-13-drizzle-baseline.md).

## Submission video

- **Status:** PASS
- Official Remotion guidance is the implementation baseline; the reviewed MIT
  `demo-video-creation-skill` supplies the Storyboard, capture, and QC procedure.
- Storyboard, captions, capture plan, privacy-reviewed Production manifest,
  Remotion source, Preview, [Contact Sheet](../demo-video/contact-sheet.png),
  and [final 1080p MP4](../demo-video/egog-demo-1080p.mp4) exist.
- The `115.050667`-second final follows the revised 1:55 storyboard and uses a
  single coherent Badge #7 Production flow. Project count, consent, EIP-712
  signature, completion, My Participation, GIWA Explorer, IPFS Snapshot,
  wallet, member number, token ID, metadata, and transaction all agree.
- `ffprobe` confirms H.264 at 1920×1080 and 30 fps. `volumedetect` confirms
  digital silence at `-91.0 dB`; no music license is required. The 15-frame
  Contact Sheet review found all planned scenes present with no crop, PII,
  OAuth surface, or malformed product frame.
- Full render and artifact ledger: [demo video verification](../demo-video/verification.md).
